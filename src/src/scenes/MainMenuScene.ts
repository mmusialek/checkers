import { SceneConst } from "../common/SceneConst";
import { Point } from "../common/type";
import { Button } from "../menu/Button";
import { ButtonLabel } from "../menu/ButtonLabel";

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
        this.createMenuButtonLabel({ x: 100, y: 100 }, "Main Menu");
        this.createMenuButton({ x: 100, y: 160 }, "Start", () => {
            this.scene.start("GameBoardScene")
        });
    }


    private createMenuButtonLabel(position: Point, buttonLabel: string): ButtonLabel {
        const textImg = this.add.text(position.x, position.y, "").setOrigin(.5, .5);
        const bgImg = this.add.image(position.x, position.y, "menu_button");

        const mmButton = new ButtonLabel();
        mmButton.setData({ bgImg: bgImg, text: buttonLabel, textImg: textImg });
        return mmButton;
    }

    private createMenuButton(position: Point, buttonLabel: string, onClickHandler: () => void): Button {
        const textImg = this.add.text(position.x, position.y, "").setOrigin(.5, .5);
        const bgImg = this.add.image(position.x, position.y, "menu_button");
        const bgHoverImg = this.add.image(position.x, position.y, "menu_button_hover");

        const mmButton = new Button(this);
        mmButton.setData({ bgImg: bgImg, bgHoverImg: bgHoverImg, text: buttonLabel, textImg: textImg, onClick: onClickHandler });
        return mmButton;
    }
}
