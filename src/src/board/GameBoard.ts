import { TurnManager } from "./TurnManager";
import { GameSquere } from "./GameSquere";
import { GameBoardConst } from "./GameBoardConst";
import {
  getBoardPos,
} from "../GameUtils";
import {
  GamePawnType,
  BoardSquereType,
  IGameLoopObject,
} from "./types";
import { GameMaster } from "./GameMaster";
import { BoardStats } from "./BoardStats";
import { FunctionType } from "../common/type";
import { GameContext } from "../common/GameContex";
import {
  getNewSprite,
  getNewText,
} from "../common/ObjectFatory";
import { loadGame } from "../common/SaveGame";
import { loadData, saveData } from "./GameBoardSaveManager";
import { SceneConst } from "../common/SceneConst";
import { createGameSquereRectangleHandlers, createPawn } from "./ObjectFactory";
import { Button } from "../uiComponents/Button";
import { Checkbox } from "../uiComponents/Checkbox";
import { FontsConst } from "../common/FontsConts";
import phaser from "phaser";

export class GameBoard implements IGameLoopObject {
  private _gameBoardSprite: phaser.GameObjects.Sprite | null = null;
  private readonly _gameBoard: GameSquere[][] = [];

  private readonly _turnManager: TurnManager;
  private readonly _gameMaster: GameMaster;
  private readonly _boardStats: BoardStats;

  private _loadGame: boolean = false;

  constructor() {
    this._turnManager = new TurnManager();
    this._boardStats = new BoardStats();
    this._gameMaster = new GameMaster(
      this._gameBoard,
      this._turnManager,
      this._boardStats
    );
  }

  // loop methods

  init(data?: object): void {
    if (data && Object.keys(data).length > 0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this._loadGame = (data as any).loadGame;
  }

  create(): void {
    this._boardStats.create();
    this.initializeBoard(this._loadGame ? this.loadDataHandler : null);
    this._loadGame = false;

    let startX = (150 / 2) + 50;
    const startY = 50;

    Button.new(
      { x: startX, y: startY },
      "Back",
      () => {
        GameContext.instance.setScene(SceneConst.MainMenuScene);
      }
    );

    startX += 150 + 25;
    Button.new({ x: startX, y: startY }, "Save", () => {
      saveData(this._turnManager, this._gameMaster, this._gameBoard);
    });

    startX += 150 + 25;
    Button.new({ x: startX, y: startY }, "New", () => {
      this.initializeBoard();
    });


    if (GameContext.instance.debug) {
      Checkbox.new(
        { x: 100, y: 700 },
        "no TM",
        (checked: boolean) => {
          if (!GameContext.instance.debugSettings) return;

          if (checked) {
            GameContext.instance.debugSettings.noTurnManager = true;
          } else {
            GameContext.instance.debugSettings.noTurnManager = false;
          }
        }
      );

      Button.new(
        { x: 240, y: 700 },
        "next turn",
        () => {
          this._turnManager.finishTurn();
          this._boardStats.updateTurn(this._turnManager.currentTurn);
        }
      );
    }
  }

  // helper methods

  private initializeBoard(dataHandler?: FunctionType | null) {
    this.drawBoard();

    this._gameMaster.clear();
    this._turnManager.clear();
    this._boardStats.clear();

    if (dataHandler) {
      dataHandler();
    } else {
      this.drawPawns();
    }
  }

  private loadDataHandler = () => {
    const data = loadGame();
    if (!data) {
      //TODO handle this
    } else {
      loadData(
        this,
        this._turnManager,
        this._gameMaster,
        this._boardStats,
        this._gameBoard,
        data
      );
    }
  };

  private drawBoard() {
    if (this._gameBoard.length) {
      for (let row = 0; row < GameBoardConst.numRows; row++) {
        for (let col = 0; col < GameBoardConst.numCols; col++) {
          this._gameBoard[row][col].destroy();
        }
        this._gameBoard[row].splice(0, GameBoardConst.numCols);
      }
    }

    if (this._gameBoardSprite) {
      this._gameBoardSprite.destroy();
      this._gameBoardSprite = null;
    }

    this._gameBoardSprite = getNewSprite({ x: GameBoardConst.boardXOffset, y: GameBoardConst.boardYOffset }, "game_board").setOrigin(0, 0);

    const boardCellPosStyle = {
      fontFamily: FontsConst.fontFamily,
      color: "green",
    };

    for (let row = 0; row < GameBoardConst.numRows; row++) {
      this._gameBoard[row] = [];
      for (let col = 0; col < GameBoardConst.numCols; col++) {
        const gameSquere = GameSquere.new({ row, col });
        this._gameBoard[row][col] = gameSquere;

        if (gameSquere.boardSquereType === BoardSquereType.blackSquere) {
          gameSquere.setHandlers(createGameSquereRectangleHandlers(this, this._gameMaster));
        }

        if (GameContext.instance.debug) {
          const { x, y } = getBoardPos(col, row);
          getNewText({ x, y }, gameSquere.label || "x", boardCellPosStyle);
        }
      }
    }
  }

  private drawPawns() {
    for (let row = 0; row < GameBoardConst.numRows; row++) {
      for (let col = 0; col < GameBoardConst.numCols; col++) {
        const gameSquere = this._gameBoard[row][col];

        const blackPawn = GameBoardConst.blackStartingRows.includes(row);
        const whitePawn = GameBoardConst.whiteStartingRows.includes(row);

        if (
          gameSquere.boardSquereType === BoardSquereType.blackSquere &&
          (blackPawn || whitePawn)
        ) {
          const pawnType = blackPawn
            ? GamePawnType.blackPawn
            : GamePawnType.whitePawn;

          const sprite = getNewSprite(gameSquere.wordPosition, pawnType).setName(pawnType).setInteractive(GameContext.instance.currentScene.input.makePixelPerfect());
          const pawnToAdd = createPawn(this, this._gameMaster, sprite, pawnType, gameSquere);
          gameSquere.addPawn(pawnToAdd);
        }
      }
    }
  }

  //
  // pawn actions
  //

  selectPawn(target: GameSquere) {
    if (this._gameMaster.selectedSquere) {
      const isTheSame = this._gameMaster.isSelectedSquereEqual(target);
      this._gameMaster.clearSelectedPawn();
      this._gameMaster.clearSuggestions();

      if (!isTheSame) this._gameMaster.setSelectedPawn(target);
    } else {
      this._gameMaster.setSelectedPawn(target);
    }
  }

  placePawn(target: GameSquere) {
    if (!this._gameMaster.selectedSquere) return;

    this._gameMaster.moveSelectedPawn(target);


    this._gameMaster.processMovement(target);

    if (!this._gameMaster.checkAnyMovementLeft(target)) {
      this._gameMaster.finishTurn();
    }

    this._boardStats.updateTurn(this._turnManager.currentTurn);
    this._boardStats.updateScore(this._gameMaster.getBoard());
  }

}
