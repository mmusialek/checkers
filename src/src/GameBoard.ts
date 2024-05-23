import phaser from "phaser";
import { TurnManager } from "./TurnManager";
import { GameSquere, Pawn } from "./GameSquere";
import { GameBoardConst } from "./GameBoardConst";
import { getBoardPos, getGameSquereByCoords, getNewImage, getNewText } from "./GameUtils";
import { GamePawnType, BoardSquereType, Point, ImageType, IPhaserScene, IGameLoopObject } from "./types";
import { GameMaster } from "./GameMaster";
import { BoardStats } from "./BoardStats";

export class GameBoard implements IGameLoopObject {
    private readonly _phaserScene: IPhaserScene;
    private _gameBoard: GameSquere[][] = [];

    private readonly _turnManager: TurnManager;
    private readonly _gameMaster: GameMaster;
    private readonly _boardStats: BoardStats;

    constructor(phaserScene: IPhaserScene) {
        this._phaserScene = phaserScene;
        this.initializeBoard();

        this._turnManager = new TurnManager();
        this._boardStats = new BoardStats(phaserScene, this._turnManager);
        this._gameMaster = new GameMaster(this._gameBoard, this._turnManager);
    }

    // loop methods

    create(): void {
        this.drawBoard();
        this.drawPawns();
        this._boardStats.create();

        window.addEventListener('resize', () => {
            this.drawBoard();
        });

        //

        this._phaserScene.input.on("pointerdown", (pointer: phaser.Input.Pointer, target: phaser.GameObjects.Image[]) => {
            if (!target || target.length === 0) return;
            const topTarget = target[0];

            // this._gameMaster.onGameSquereClick(topTarget);

            const { x, y } = topTarget;
            const targetSquere = this.getGameSquereByCoords({ x, y });

            if (this._gameMaster.canSelectPawn(targetSquere)) {
                this.selectPawn(targetSquere);
            } else if (this._gameMaster.canPlacePawn(targetSquere)) {
                this.placePawn(targetSquere);
            }
        });

        this._phaserScene.input.on("pointerover", (pointer: phaser.Input.Pointer, target: phaser.GameObjects.Image[]) => {
            if (!target || target.length === 0) {
                return
            };

            const topTarget = target[0];
            const { x, y } = topTarget;
            const targetSquere = this.getGameSquereByCoords({ x, y });
            // const { x: posX, y: posY } = targetSquere.position;

            if (!targetSquere) {
                console.log("on pointerover: gameSquere not found!")
                return;
            }

            // show pointer
            if (this._gameMaster.canSelectPawn(targetSquere)) {
                this._phaserScene.input.setDefaultCursor("pointer");
                targetSquere.pawn?.highlight();
            }
            else if (this._gameMaster.canSuggestPawn(targetSquere)) {
                const pawnType = this._gameMaster.getPawnSuggestion(targetSquere);

                if (pawnType.effect === GamePawnType.shadow)
                    this._phaserScene.input.setDefaultCursor("pointer");

                const img = this.getNewImage(targetSquere.wordPosition, pawnType.effect).setInteractive().setAlpha(.5);
                targetSquere.addEffect(new Pawn(pawnType.effect, img))
            }
        });

        this._phaserScene.input.on("pointerout", (pointer: phaser.Input.Pointer, target: any[]) => {
            if (!target || target.length === 0) {
                return;
            };

            const topTarget = target[0];

            const { x, y } = topTarget;
            const targetSquere = this.getGameSquereByCoords({ x, y });

            if (!this._gameMaster.selectedSquere || (this._gameMaster.selectedSquere && !this._gameMaster.isSelectedPawnEqual(targetSquere))) {
                targetSquere.pawn?.unHighlight();
                this._phaserScene.input.setDefaultCursor("");
            }

            targetSquere.removeEffects();
        });
    }

    update(time: number, delta: number): void {
    }

    // helper methods

    private initializeBoard() {
        this._gameBoard = [];
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            this._gameBoard[row] = [];
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const gs = new GameSquere(row, col);

                this._gameBoard[row][col] = gs;
            }
        }
    }


    private drawBoard() {
        const boardCellPosStyle = { fontFamily: GameBoardConst.fontFamily, color: "magenta" };
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const { x, y } = getBoardPos(col, row);

                const gs = this.getGameSquereByCoords({ x, y });
                this.getNewImage({ x, y }, gs.boardSquereType).setInteractive();

                const text = gs.name;
                this.getNewText({ x, y }, text || "x", boardCellPosStyle);
            }
        }

        // draw board names

        const extBoardCellNameStyle = { fontFamily: GameBoardConst.fontFamily, color: "red", fontSize: 17, fontStyle: "300" };
        const namesOffsetX = GameBoardConst.originOffset + GameBoardConst.boardOffset;
        const namesOffsetY = (GameBoardConst.tileSize * 8) + 20 + GameBoardConst.boardOffset;
        for (let i = 0; i < GameBoardConst.numRows; i++) {
            const x = (i * GameBoardConst.tileSize) + namesOffsetX;

            const text = String.fromCharCode(65 + i);
            this.getNewText({ x, y: namesOffsetY }, text || "x", extBoardCellNameStyle);
        }

        const verticalNamesX = GameBoardConst.boardOffset / 2;
        const numbersOffsetY = GameBoardConst.originOffset + GameBoardConst.boardOffset;
        for (let i = 0; i < GameBoardConst.numCols; i++) {
            const y = (i * GameBoardConst.tileSize) + numbersOffsetY;

            const text = (i + 1).toFixed();
            this.getNewText({ x: verticalNamesX, y }, text || "x", extBoardCellNameStyle);
        }
    }

    private drawPawns() {
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const gameSquere = this._gameBoard[row][col];

                const blackPawn = GameBoardConst.blackStartingRows.includes(row);
                const whitePawn = GameBoardConst.whiteStartingRows.includes(row);


                if (gameSquere.boardSquereType === BoardSquereType.blackSquere && (blackPawn || whitePawn)) {
                    const pawnType = blackPawn ? GamePawnType.black : GamePawnType.white;
                    const img = this.getNewImage(gameSquere.wordPosition, pawnType);
                    img.setInteractive();

                    gameSquere.addPawn(new Pawn(pawnType, img));
                }
            }
        }
    }


    private selectPawn(target: GameSquere) {
        if (this._gameMaster.selectedSquere) {
            const isTheSame = this._gameMaster.isSelectedPawnEqual(target);
            this._gameMaster.clearSelectedPawn();

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

        const { pawnType } = this._gameMaster.selectedSquere;
        this._gameMaster.selectedSquere.removePawn();

        const img = this.getNewImage(target.wordPosition, pawnType)
        target.addPawn(new Pawn(pawnType, img));


        // add points, remove enemy
        this._gameMaster.processMovement(target);
        // this._gameMaster.clearSelectedPawn();
        this._boardStats.updateStats();
        // this._turnManager.finishTurn();
    }


    // creation methods

    private getGameSquereByCoords(point: Point) {
        return getGameSquereByCoords(this._gameBoard, point);
    }

    private getNewImage(point: Point, type: ImageType) {
        return getNewImage(this._phaserScene.add, point, type);
    }

    private getNewText(point: Point, text: string, style?: phaser.Types.GameObjects.Text.TextStyle) {
        return getNewText(this._phaserScene.add, point, text, style);
    }
}
