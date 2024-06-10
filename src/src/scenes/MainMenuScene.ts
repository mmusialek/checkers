import { GameContext } from "../common/GameContex";
import { isSaveAvailable } from "../common/SaveGame";
import { SceneConst } from "../common/SceneConst";
import { Button } from "../uiComponents/Button";
import { ButtonLabel } from "../uiComponents/ButtonLabel";

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
        ButtonLabel.new({ x: 100, y: startY }, "Main Menu");

        startY += 60;
        Button.new({ x: 100, y: startY }, "How to play", () => {
            alert("will be implemented");
        });

        startY += 60;
        if (isSaveAvailable()) {
            Button.new({ x: 100, y: startY }, "Load", () => {
                GameContext.instance.setScene(SceneConst.GameBoardScene, { loadGame: true });
            });
            startY += 60;
        }

        Button.new({ x: 100, y: startY }, "2 players", () => {
            GameContext.instance.setScene(SceneConst.GameBoardScene, {});
        });
    }
}
