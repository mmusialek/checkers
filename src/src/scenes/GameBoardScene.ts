import phaser from "phaser";
import { GameBoard } from "../board/GameBoard";
import { IGameLoopObject } from "../board/types";
import { GameContext } from "../common/GameContex";
import { SceneConst } from "../common/SceneConst";

export class GameBoardScene extends phaser.Scene {
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
        this.load.image("game_board", "assets/board/game_board.png");

        this.load.atlas("white_pawn_sheet", "assets/board/white_pawn_sheet.png", "assets/board/white_pawn_sheet.json");
        this.load.atlas("white_queen_sheet", "assets/board/white_queen_sheet.png", "assets/board/white_queen_sheet.json");

        this.load.atlas("black_pawn_sheet", "assets/board/black_pawn_sheet.png", "assets/board/black_pawn_sheet.json");
        this.load.atlas("black_queen_sheet", "assets/board/black_queen_sheet.png", "assets/board/black_queen_sheet.json");

        this.load.atlas("shadow_pawn_sheet", "assets/board/shadow_pawn_sheet.png", "assets/board/shadow_pawn_sheet.json");
        this.load.atlas("not_allowed_sheet", "assets/board/not_allowed_sheet.png", "assets/board/not_allowed_sheet.json");


        this.load.image("menu_button_hover", "assets/menu/button_hover.png");
        this.load.image("menu_button", "assets/menu/button.png");
    }

    create(): void {
        // animations
        const animationsToAdd = [
            { animKey: "white_pawn_anim", sheetToLoad: "white_pawn_sheet" },
            { animKey: "white_queen_anim", sheetToLoad: "white_queen_sheet" },
            { animKey: "black_pawn_anim", sheetToLoad: "black_pawn_sheet" },
            { animKey: "black_queen_anim", sheetToLoad: "black_queen_sheet" },
            { animKey: "shadow_pawn_anim", sheetToLoad: "shadow_pawn_sheet" },
            { animKey: "not_allowed_anim", sheetToLoad: "not_allowed_sheet" }
        ];

        for (const animToAdd of animationsToAdd) {
            if (this.anims.exists(animToAdd.animKey)) continue;

            this.anims.create({
                key: animToAdd.animKey,
                frames: this.anims.generateFrameNames(animToAdd.sheetToLoad),
                duration: 300,
                repeat: -1
            });
        }

        this.cameras.main.setBackgroundColor("302220");
        GameContext.instance.currentScene.input.setTopOnly(false);
        this._gameBoard.create?.();
    }

    update(time: number, delta: number): void {
        this._gameBoard.update?.(time, delta);
    }
}
