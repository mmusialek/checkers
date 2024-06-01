import { GameBoard } from "../board/GameBoard";
import { IGameLoopObject } from "../board/types";
import { SceneConst } from "../common/SceneConst";

export class GameBoardScene extends Phaser.Scene {
    private _gameBoard: IGameLoopObject;

    constructor() {
        super(SceneConst.GameBoardScene);
        this._gameBoard = new GameBoard();
    }

    init(data?: object) {
        if (data) {
            this._gameBoard.init?.(data);
        }
    }

    preload(): void {
        this.load.image('white_pawn', 'assets/board/white_pawn.png');
        this.load.image('black_pawn', 'assets/board/black_pawn.png');
        this.load.image('shadow_pawn', 'assets/board/shadow_pawn.png');
        this.load.image('not_allowed', 'assets/board/not_allowed.png');

        this.load.image('black_squere', 'assets/board/black_squere.png');
        this.load.image('white_squere', 'assets/board/white_squere.png');

        this.load.image('menu_button_hover', 'assets/menu/button_bg_hover.png');
        this.load.image('menu_button', 'assets/menu/button_bg.png');
    }

    create(): void {
        this._gameBoard.create?.();
    }

    update(time: number, delta: number): void {
        this._gameBoard.update?.(time, delta);
    }
}
