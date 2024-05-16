import { GameBoardConst } from "./GameBoardConst";
import { getArrayPos, getBoardPos } from "./GameUtils";
import { GamePawnType, PawnSpritesMap, Point } from "./types";
import * as phaser from "phaser";

class GameSquere {
    private _image: phaser.GameObjects.Image | null | undefined;

    private readonly _wordPoint: Point;
    private _point: Point;

    private _pawnType: GamePawnType = GamePawnType.none;

    constructor(row: number, col: number) {
        this._point = { x: col, y: row };
        this._wordPoint = getBoardPos(col, row);
    }

    get name(): string {
        return `${this._point.x}-${this._point.y}`;
    }

    get pawnType(): GamePawnType {
        return this._pawnType;
    }

    get image() {
        return this._image;
    }

    get wordPosition(): Point {
        return this._wordPoint;
    }

    get position(): Point {
        return this._point;
    }

    addPawn(type: GamePawnType, image: phaser.GameObjects.Image) {
        this.setPawnType(type);
        this.setImage(image);
    }

    removePawn() {
        this.setPawnType(GamePawnType.none);
        this.clearImage();
    }

    select() {
        this.image?.setAlpha(.7);
    }

    unselect() {
        this.image?.setAlpha(1);
    }

    private setPawnType(type: GamePawnType) {
        this._pawnType = type;
    }

    private setImage(image: phaser.GameObjects.Image) {
        this._image = image;
    }

    private clearImage() {
        this._image?.destroy(true);
        this._image = null;
    }
}

export class GameBoardScene extends Phaser.Scene {

    private _gameBoard: GameSquere[][] = [];
    private _selectedSquere: GameSquere | null = null;

    private shadowPawn: GameSquere | null | undefined;

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

            if (gameSquere.pawnType != GamePawnType.none && GameBoardConst.playerPawns.includes(gameSquere.pawnType)) {
                if (this._selectedSquere) {
                    const isTheSame = this._selectedSquere?.name == gameSquere.name;
                    this.clearSelection();

                    if (!isTheSame)
                        this.selectPawn(gameSquere);
                }
                else {
                    this.selectPawn(gameSquere);
                }
            }
        });

        this.input.on("pointerover", (pointer: any, target: phaser.GameObjects.Image[]) => {
            if (!target || target.length === 0) {
                return
            };

            const topTarget = target[0];
            const { x, y } = topTarget;
            const gameSquere = this.getGameSquereByCoords({ x, y });
            const { x: wordPosX, y: wordPosY } = gameSquere.wordPosition;
            const { x: posX, y: posY } = gameSquere.position;

            if (!gameSquere) {
                console.log("on pointerover: gameSquere not found!")
                return;
            }

            if (gameSquere.pawnType !== GamePawnType.none)
                this.input.setDefaultCursor("pointer");

            if (GameBoardConst.playerPawns.includes(gameSquere.pawnType) && !this._selectedSquere) {
                gameSquere.select();
            }
            else if (gameSquere.pawnType === GamePawnType.none) {

                if (this._selectedSquere) {

                    const { x: selectedPosX, y: selectedPosY } = this._selectedSquere?.position;

                    if (Math.abs(selectedPosX - posX) == 1 && (Math.abs(selectedPosY - posY) == 1)) {
                        const img = this.add.image(wordPosX, wordPosY, PawnSpritesMap[GamePawnType.shadow]).setName(GamePawnType.shadow);
                        gameSquere.addPawn(GamePawnType.shadow, img);
                    } else {
                        const img = this.add.image(wordPosX, wordPosY, PawnSpritesMap[GamePawnType.notAllowed]).setName(GamePawnType.notAllowed);
                        gameSquere.addPawn(GamePawnType.notAllowed, img);
                    }
                }
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
    }

    private drawPawns() {
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const gameSquere = this._gameBoard[row][col];

                const blackPawn = GameBoardConst.blackStartingRows.includes(row);
                const whitePawn = GameBoardConst.whiteStartingRows.includes(row);

                if (blackPawn || whitePawn) {
                    const pawnType = blackPawn ? GamePawnType.black : GamePawnType.white;
                    const { x, y } = getBoardPos(col, row);
                    const img = this.add.image(x, y, PawnSpritesMap[pawnType] as string).setName(gameSquere.pawnType)
                        .setInteractive();

                    gameSquere.addPawn(pawnType, img);
                }
            }
        }
    }


    private drawBoard() {
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const { x, y } = getBoardPos(col, row);
                // const color = (row + col) % 2 === 0 ? 0xffffff : 0x000000; // Alternating colors
                const color = (row + col) % 2 === 0 ? "white_squere" : "black_squere"; // Alternating colors

                this.add.image(x, y, color).setName(color)
                    .setInteractive();

                const gs = this.getGameSquereByCoords({ x, y });
                const text = gs?.name;
                this.add.text(x, y, text || "x", { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', color: "magenta" }).setOrigin(.5, .5);
            }
        }
    }

    // private getBoardPos(x: number, y: number) {
    //     return { x: ((x * GameBoardConst.tileSize) + GameBoardConst.originOffset), y: ((y * GameBoardConst.tileSize) + GameBoardConst.originOffset) };
    // }

    // private getArrayPos(x: number, y: number) {
    //     return { x: ((x - GameBoardConst.originOffset) / GameBoardConst.tileSize) || 0, y: ((y - GameBoardConst.originOffset) / GameBoardConst.tileSize) || 0 };
    // }

    private getGameSquereByCoords(point: Point) {
        const { x, y } = getArrayPos(point.x, point.y);
        const gameSquere = this._gameBoard[y][x];
        return gameSquere;
    }
}