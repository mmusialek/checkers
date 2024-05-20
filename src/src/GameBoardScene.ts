import { GameBoard } from "./GameBoard";
import { IGameLoopObject } from "./types";

export class GameBoardScene extends Phaser.Scene {
    private _gameBoard: IGameLoopObject;

    constructor() {
        super("GameBoardScene");
        this._gameBoard = new GameBoard(this);
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
        this._gameBoard.create();
    }

    update(time: number, delta: number): void {
        this._gameBoard.update(time, delta);
    }
}