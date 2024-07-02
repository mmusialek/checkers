import phaser from "phaser";
import { GameBoard } from "../board/GameBoard";
import { IGameLoopObject } from "../board/types";
import { GameContext } from "../common/GameContex";
import { SceneConst } from "../common/SceneConst";
import { FontsConst } from "../common/FontsConts";

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
        this.load.image("game_board", "assets/board/sprites/game_board.png");

        this.load.atlas("white_pawn_sheet", "assets/board/sprites/white_pawn_sheet.png", "assets/board/sprites/white_pawn_sheet.json");
        this.load.atlas("white_queen_sheet", "assets/board/sprites/white_queen_sheet.png", "assets/board/sprites/white_queen_sheet.json");

        this.load.atlas("black_pawn_sheet", "assets/board/sprites/black_pawn_sheet.png", "assets/board/sprites/black_pawn_sheet.json");
        this.load.atlas("black_queen_sheet", "assets/board/sprites/black_queen_sheet.png", "assets/board/sprites/black_queen_sheet.json");

        this.load.atlas("shadow_pawn_sheet", "assets/board/sprites/shadow_pawn_sheet.png", "assets/board/sprites/shadow_pawn_sheet.json");
        this.load.atlas("not_allowed_sheet", "assets/board/sprites/not_allowed_sheet.png", "assets/board/sprites/not_allowed_sheet.json");

        this.load.image("white_wins", "assets/board/sprites/white_wins.png");
        this.load.image("black_wins", "assets/board/sprites/black_wins.png");


        this.load.image("menu_button_hover", "assets/menu/sprites/button_hover.png");
        this.load.image("menu_button", "assets/menu/sprites/button.png");

        this.load.audio("button_highlight", "assets/menu/audio/button_highlight_0003.mp3");
        this.load.audio("button_click", "assets/menu/audio/button_click.mp3");

        this.load.audio('pawn_move_0001', ['assets/board/audio/pawn_move_0001.mp3']);
        this.load.audio('pawn_move_0002', ['assets/board/audio/pawn_move_0002.mp3']);
        this.load.audio('pawn_move_0003', ['assets/board/audio/pawn_move_0003.mp3']);
        this.load.audio('pawn_move_0004', ['assets/board/audio/pawn_move_0004.mp3']);
        this.load.audio('pawn_move_0005', ['assets/board/audio/pawn_move_0005.mp3']);

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

        this.cameras.main.setBackgroundColor(FontsConst.boardColor);
        GameContext.instance.currentScene.input.setTopOnly(false);
        this._gameBoard.create?.();
    }

    update(time: number, delta: number): void {
        this._gameBoard.update?.(time, delta);
    }
}
