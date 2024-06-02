import phaser from "phaser";
import { TurnManager } from "./TurnManager";
import { GameSquere, Pawn } from "./GameSquere";
import { GameBoardConst } from "./GameBoardConst";
import { getBoardPos, getGameSquereByCoords } from "../GameUtils";
import { GamePawnType, BoardSquereType, IGameLoopObject, AllBoardImageValues, PlayerType } from "./types";
import { GameMaster } from "./GameMaster";
import { BoardStats } from "./BoardStats";
import { FunctionType, Point } from "../common/type";
import { GameContext } from "../common/GameContex";
import { createMenuButton, getNewImage, getNewText } from "../common/ObjectFatory";
import { loadGame } from "../common/SaveGame";
import { loadData, saveData } from "./GameBoardSaveManager";
import { SceneConst } from "../common/SceneConst";

export class GameBoard implements IGameLoopObject {
    private readonly _gameBoard: GameSquere[][] = [];

    private readonly _turnManager: TurnManager;
    private readonly _gameMaster: GameMaster;
    private readonly _boardStats: BoardStats;

    private _loadGame: boolean = false;

    constructor() {
        this._turnManager = new TurnManager();
        this._boardStats = new BoardStats();
        this._gameMaster = new GameMaster(this._gameBoard, this._turnManager, this._boardStats);
    }

    // loop methods

    init(data?: object): void {
        if (data && Object.keys(data).length > 0)
            this._loadGame = (data as any).loadGame;
    }

    create(): void {
        this._boardStats.create();
        this.clear(this._loadGame ? this.loadDataHandler : null);
        this._loadGame = false;

        createMenuButton({ x: (8 * 64) + 100 + 30, y: 50 }, "Save", () => {
            saveData(this._turnManager, this._gameMaster, this._gameBoard);
        });

        createMenuButton({ x: (8 * 64) + 100 + 30 + 120 + 5, y: 50 }, "New", () => {
            this.clear();
        });

        createMenuButton({ x: (8 * 64) + 100 + 30 + 120 + 120 + 5 + 5, y: 50 }, "Back", () => {
            GameContext.instance.setScene(SceneConst.MainMenuScene);
        });

        //
        const currentScene = GameContext.instance.currentScene;


        currentScene.input.on("pointerdown", (_pointer: phaser.Input.Pointer, target: phaser.GameObjects.Image[]) => {
            if (!target || target.length === 0) return;
            const topTarget = target[0];

            if (this.isBoardItem(topTarget.texture.key)) {
                return;
            }

            const { x, y } = topTarget;
            const targetSquere = this.getGameSquereByCoords({ x, y });

            if (this._gameMaster.canSelectPawnNoMoveCheck(targetSquere)) {
                this.selectPawn(targetSquere);
            } else if (this._gameMaster.canPlacePawn(targetSquere)) {
                this.placePawn(targetSquere);
            }
        });

        currentScene.input.on("pointerover", (_pointer: phaser.Input.Pointer, target: phaser.GameObjects.Image[]) => {
            if (!target || target.length === 0) {
                return
            };

            const topTarget = target[0];

            if (this.isBoardItem(topTarget.texture.key)) {
                return;
            }

            const { x, y } = topTarget;
            const targetSquere = this.getGameSquereByCoords({ x, y });

            if (!targetSquere) {
                console.log("on pointerover: gameSquere not found!")
                return;
            }

            // show pointer
            if (this._gameMaster.canSelectPawnNoMoveCheck(targetSquere)) {
                currentScene.input.setDefaultCursor("pointer");
                targetSquere.pawn?.highlight();
            }
            else if (this._gameMaster.canSuggestPawn(targetSquere)) {
                const suggestedMove = this._gameMaster.getSuggestion4Field(targetSquere)!;
                currentScene.input.setDefaultCursor("pointer");

                const img = getNewImage(targetSquere.wordPosition, suggestedMove.effect).setAlpha(.5);
                targetSquere.addEffect(new Pawn(suggestedMove.player, suggestedMove.effect, img));
            }
        });

        currentScene.input.on("pointerout", (_pointer: phaser.Input.Pointer, target: any[]) => {
            if (!target || target.length === 0) {
                return;
            };

            const topTarget = target[0];

            if (this.isBoardItem(topTarget.texture.key)) {
                return;
            }

            const { x, y } = topTarget;
            const targetSquere = this.getGameSquereByCoords({ x, y });

            if (!this._gameMaster.selectedSquere || (this._gameMaster.selectedSquere && !this._gameMaster.isSelectedPawnEqual(targetSquere))) {
                targetSquere.pawn?.unHighlight();
                currentScene.input.setDefaultCursor("");
            }

            targetSquere.removeEffects();
        });
    }

    // public methods

    // helper methods

    private clear(dataHandler?: FunctionType | null) {
        this.createGameBoard();
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
            loadData(this._turnManager, this._gameMaster, this._boardStats, this._gameBoard, data);
        }
    }

    private createGameBoard() {
        if (this._gameBoard.length) {
            for (let row = 0; row < GameBoardConst.numRows; row++) {
                this._gameBoard[row].splice(0, GameBoardConst.numCols);
            }
        }
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            this._gameBoard[row] = [];
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const gs = new GameSquere(row, col);

                this._gameBoard[row][col] = gs;
            }
        }
    }

    private drawBoard() {
        const boardCellPosStyle = { fontFamily: GameBoardConst.fontFamily, color: "green" };
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const { x, y } = getBoardPos(col, row);

                const gs = this.getGameSquereByCoords({ x, y });
                getNewImage({ x, y }, gs.boardSquereType).setInteractive();

                const text = gs.name;
                getNewText({ x, y }, text || "x", boardCellPosStyle);
            }
        }

        // draw board names

        const extBoardCellNameStyle = { fontFamily: GameBoardConst.fontFamily, color: "green", fontSize: 17, fontStyle: "300" };
        const namesOffsetX = GameBoardConst.originOffset + GameBoardConst.boardOffset;
        const namesOffsetY = (GameBoardConst.tileSize * 8) + 20 + GameBoardConst.boardOffset;
        for (let i = 0; i < GameBoardConst.numRows; i++) {
            const x = (i * GameBoardConst.tileSize) + namesOffsetX;

            const text = String.fromCharCode(65 + i);
            getNewText({ x, y: namesOffsetY }, text || "x", extBoardCellNameStyle);
        }

        const verticalNamesX = GameBoardConst.boardOffset / 2;
        const numbersOffsetY = GameBoardConst.originOffset + GameBoardConst.boardOffset;
        for (let i = 0; i < GameBoardConst.numCols; i++) {
            const y = (i * GameBoardConst.tileSize) + numbersOffsetY;

            const text = (GameBoardConst.numCols - i).toFixed();
            getNewText({ x: verticalNamesX, y }, text || "x", extBoardCellNameStyle);
        }
    }

    private drawPawns() {
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const gameSquere = this._gameBoard[row][col];

                const blackPawn = GameBoardConst.blackStartingRows.includes(row);
                const whitePawn = GameBoardConst.whiteStartingRows.includes(row);

                if (gameSquere.boardSquereType === BoardSquereType.blackSquere && (blackPawn || whitePawn)) {
                    const pawnType = blackPawn ? GamePawnType.blackPawn : GamePawnType.whitePawn;
                    const playerType = blackPawn ? PlayerType.black : PlayerType.white;
                    const img = getNewImage(gameSquere.wordPosition, pawnType);
                    img.setInteractive();

                    gameSquere.addPawn(new Pawn(playerType, pawnType, img));
                }
            }
        }
    }


    private isBoardItem(key: string) {
        return !AllBoardImageValues.includes(key);
    }

    //
    // pawn actions
    //

    private selectPawn(target: GameSquere) {
        if (this._gameMaster.selectedSquere) {
            const isTheSame = this._gameMaster.isSelectedPawnEqual(target);
            this._gameMaster.clearSelectedPawn();
            this._gameMaster.clearSuggestions();

            if (!isTheSame)
                this._gameMaster.setSelectedPawn(target);
        }
        else {
            this._gameMaster.setSelectedPawn(target);
        }
    }

    private placePawn(target: GameSquere) {
        if (!this._gameMaster.selectedSquere)
            return;

        this._gameMaster.moveSelectedPawn(target);

        // add points, remove enemy
        this._gameMaster.processMovement(target);

        if (!this._gameMaster.checkAnyMovementLeft(target)) {
            this._turnManager.finishTurn();
            this._gameMaster.clearSelectedPawn();
            this._gameMaster.clearPlayerMovement();
        }

        this._boardStats.updateTurn(this._turnManager.currentTurn);
        this._boardStats.updateScore(this._gameMaster.getBoard());
    }


    // creation methods

    private getGameSquereByCoords(point: Point) {
        return getGameSquereByCoords(this._gameBoard, point);
    }
}
