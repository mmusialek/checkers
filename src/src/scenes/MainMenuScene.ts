import { GameContext } from "../common/GameContex";
import { createMenuButtonLabel, createMenuButton } from "../common/ObjectFatory";
import { isSaveAvailable } from "../common/SaveGame";
import { SceneConst } from "../common/SceneConst";

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super(SceneConst.MainMenuScene);
    }

    preload(): void {
        this.load.image('menu_button_hover', 'assets/menu/button_bg_hover.png');
        this.load.image('menu_button', 'assets/menu/button_bg.png');

    }

    create() {
        this.createMenu();
    }


    private createMenu() {
        let startY = 100;
        createMenuButtonLabel({ x: 100, y: startY }, "Main Menu");
        startY += 60;
        if (isSaveAvailable()) {
            createMenuButton({ x: 100, y: startY }, "Load", () => {
                GameContext.instance.setScene(SceneConst.GameBoardScene, { loadGame: true });
            });
            startY += 60;
        }
        createMenuButton({ x: 100, y: startY }, "2 players", () => {
            GameContext.instance.setScene(SceneConst.GameBoardScene, {});
        });
    }
}
