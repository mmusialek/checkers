import { GameBoardConst } from "./GameBoardConst";
import { GameSquere } from "./GameSquere";
import { getArrayPos, getBoardPos } from "./GameUtils";
import { BoardSquereType, GamePawnType, ImageSpritesMap, ImageType, PawnSpritesMap, Point } from "./types";
import * as phaser from "phaser";

export class GameBoardScene extends Phaser.Scene {

    private _gameBoard: GameSquere[][] = [];
    private _selectedSquere: GameSquere | null = null;

    constructor() {
        super("GameBoardScene");
        this.initializeBoard();
    }

    preload(): void {
        this.load.image('white_pawn', 'assets/white_pawn.png');
        this.load.image('black_pawn', 'assets/black_pawn.png');
        this.load.image('shadow_pawn', 'assets/shadow_pawn.png');
        this.load.image('not_allowed', 'assets/not_allowed.png');

        this.load.image('black_squere', 'assets/black_squere.png');
        this.load.image('white_squere', 'assets/white_squere.png');
    }

    create(): void {
        this.drawBoard();
        this.drawPawns();

        window.addEventListener('resize', () => {
            this.drawBoard();
        });


        this.input.on("pointerdown", (pointer: any, target: phaser.GameObjects.Image[]) => {
            if (!target || target.length === 0) return;
            const topTarget = target[0];
            const { x, y } = topTarget;
            const gameSquere = this.getGameSquereByCoords({ x, y });

            if (GameBoardConst.playerPawns.includes(gameSquere.pawnType)) {
                if (this._selectedSquere) {
                    const isTheSame = this._selectedSquere?.name == gameSquere.name;
                    this.clearSelection();

                    if (!isTheSame)
                        this.selectPawn(gameSquere);
                }
                else {
                    this.selectPawn(gameSquere);
                }
            } else if (this._selectedSquere && gameSquere.pawnType == GamePawnType.shadow) {
                const { pawnType } = this._selectedSquere;
                this._selectedSquere.removePawn();

                const img = this.getNewImage(gameSquere.wordPosition, pawnType)
                gameSquere.changePawn(pawnType, img);
                this._selectedSquere = null;
            }
        });

        this.input.on("pointerover", (pointer: any, target: phaser.GameObjects.Image[]) => {
            if (!target || target.length === 0) {
                return
            };

            const topTarget = target[0];
            const { x, y } = topTarget;
            const targetSquere = this.getGameSquereByCoords({ x, y });
            const { x: posX, y: posY } = targetSquere.position;

            if (!targetSquere) {
                console.log("on pointerover: gameSquere not found!")
                return;
            }

            if (targetSquere.pawnType !== GamePawnType.none || this._selectedSquere)
                this.input.setDefaultCursor("pointer");

            if (GameBoardConst.playerPawns.includes(targetSquere.pawnType) && !this._selectedSquere) {
                targetSquere.select();
            }
            else if (targetSquere.pawnType === GamePawnType.none && this._selectedSquere) {
                const { x: selectedPosX, y: selectedPosY } = this._selectedSquere?.position;

                const multiplier = this._selectedSquere.pawnType === GamePawnType.black ? -1 : 1;
                const canMove = Math.abs((selectedPosX - posX)) == 1 && (selectedPosY - posY) == (1 * multiplier);                
                
                const pawnType = canMove ? GamePawnType.shadow : GamePawnType.notAllowed;
                const img = this.getNewImage(targetSquere.wordPosition, pawnType).setInteractive();
                targetSquere.addPawn(pawnType, img);
            }

        });

        this.input.on("pointerout", (pointer: any, target: any[]) => {
            if (!target || target.length === 0) {
                return;
            };

            const topTarget = target[0];

            const { x, y } = topTarget;
            const gameSquere = this.getGameSquereByCoords({ x, y });

            if (!this._selectedSquere) {
                gameSquere.unselect();
            }

            this.input.setDefaultCursor("");

            if ([GamePawnType.shadow, GamePawnType.notAllowed].includes(gameSquere.pawnType)) {
                gameSquere.removePawn();
            }
        });

    }

    update(time: number, delta: number): void {
    }

    private selectPawn(pawn: GameSquere) {
        this._selectedSquere = pawn;
        this._selectedSquere.select();
    }

    private clearSelection() {
        this._selectedSquere?.unselect();
        this._selectedSquere = null;
    }

    private initializeBoard() {
        this._gameBoard = [];
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            this._gameBoard[row] = [];
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const gs = new GameSquere(row, col);
                this._gameBoard[row][col] = gs;
            }
        }

        // names
    }

    private drawPawns() {
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const gameSquere = this._gameBoard[row][col];

                const blackPawn = GameBoardConst.blackStartingRows.includes(row);
                const whitePawn = GameBoardConst.whiteStartingRows.includes(row);

                if (blackPawn || whitePawn) {
                    const pawnType = blackPawn ? GamePawnType.black : GamePawnType.white;
                    const img = this.getNewImage(gameSquere.wordPosition, pawnType);
                    img.setInteractive();

                    gameSquere.addPawn(pawnType, img);
                }
            }
        }
    }


    private drawBoard() {
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const { x, y } = getBoardPos(col, row);
                const color = (row + col) % 2 === 0 ? BoardSquereType.whiteSquere : BoardSquereType.blackSquere; // Alternating colors
                this.getNewImage({ x, y }, color).setInteractive();

                const gs = this.getGameSquereByCoords({ x, y });
                const text = gs.name;
                this.add.text(x, y, text || "x", { fontFamily: GameBoardConst.fontFamily, color: "magenta" }).setOrigin(.5, .5);
            }
        }

        // draw board names

        const namesOffsetX = GameBoardConst.originOffset + GameBoardConst.boardOffset;
        const namesOffsetY = (GameBoardConst.tileSize * 8) + 20 + GameBoardConst.boardOffset;
        for (let i = 0; i < GameBoardConst.numRows; i++) {
            const x = (i * GameBoardConst.tileSize) + namesOffsetX;

            const text = String.fromCharCode(65 + i);
            this.add.text(x, namesOffsetY, text || "x", { fontFamily: GameBoardConst.fontFamily, color: "red", fontSize: 17, fontStyle: "300" }).setOrigin(.5, .5);
        }


        const verticalNamesX = GameBoardConst.boardOffset / 2;
        const numbersOffsetY = GameBoardConst.originOffset + GameBoardConst.boardOffset;
        for (let i = 0; i < GameBoardConst.numCols; i++) {
            const y = (i * GameBoardConst.tileSize) + numbersOffsetY;

            const text = (i + 1).toFixed();
            this.add.text(verticalNamesX, y, text || "x", { fontFamily: GameBoardConst.fontFamily, color: "red", fontSize: 17, fontStyle: "300" }).setOrigin(.5, .5);
        }
    }

    private getGameSquereByCoords(point: Point) {
        const { x, y } = getArrayPos(point.x, point.y);
        const gameSquere = this._gameBoard[y][x];
        return gameSquere;
    }

    private getNewImage(point: Point, type: ImageType) {
        const { x, y } = point
        return this.add.image(x, y, ImageSpritesMap[type]).setName(type);
    }
}