import phaser from "phaser";
import { MainMenuImages } from "../board/types";
import { GameContext } from "../common/GameContex";
import { getNewSprite } from "../common/ObjectFatory";
import { isSaveAvailable } from "../common/SaveGame";
import { SceneConst } from "../common/SceneConst";
import { Button } from "../uiComponents/Button";

export class MainMenuScene extends phaser.Scene {
    constructor() {
        super(SceneConst.MainMenuScene);
    }

    async preload(): Promise<void> {
        this.load.image('menu_button', 'assets/menu/button.png');
        this.load.image('menu_button_hover', 'assets/menu/button_hover.png');

        this.load.image('main_menu_board_piece', 'assets/menu/main_menu_board_piece.png');
        this.load.image('main_menu_title', 'assets/menu/main_menu_title.png');
    }

    create() {
        this.createMenu();
        this.cameras.main.setBackgroundColor("302220");
    }


    private createMenu() {
        const titleX = 500;
        const gameTitle = getNewSprite({ x: titleX, y: 100 }, MainMenuImages.MainMenuTitle); ``
        getNewSprite({ x: titleX, y: 220 + gameTitle.height + 50 }, MainMenuImages.MainMenuBoardPiece);

        let startY = 260;
        Button.new({ x: 100, y: startY }, "How to play", () => {
            GameContext.instance.setScene(SceneConst.HowToScene);
        });

        startY += 60;
        if (isSaveAvailable()) {
            Button.new({ x: 100, y: startY }, "Load", () => {
                GameContext.instance.setScene(SceneConst.GameBoardScene, { loadGame: true });
            });
            startY += 60;
        }

        Button.new({ x: 100, y: startY }, "1 player", () => {
            GameContext.instance.setScene(SceneConst.GameBoardScene, {});
        });

        startY += 60;
        Button.new({ x: 100, y: startY }, "2 players", () => {
            GameContext.instance.setScene(SceneConst.GameBoardScene, {});
        });
    }
}
