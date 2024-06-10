import phaser from "phaser";
import { GameContext } from "../common/GameContex";
import { Point } from "../common/type";

interface ButtonProps {
    textImg: phaser.GameObjects.Text;
    bgImg: phaser.GameObjects.Image;

    text: string;
    onClick: () => void;
}

export class Button {
    private textImg!: phaser.GameObjects.Text;
    private bgImg!: phaser.GameObjects.Image;

    static new(position: Point, buttonLabel: string, onClickHandler: () => void) {
        const sceneAdd = GameContext.instance.currentScene.add;
        const textImg = sceneAdd.text(position.x, position.y, "").setOrigin(.5, .5);
        const bgImg = sceneAdd.image(position.x, position.y, "menu_button");

        const tmp = new Button();
        tmp.setData({ bgImg: bgImg, text: buttonLabel, textImg: textImg, onClick: onClickHandler });

        return tmp;
    }

    private setData(buttonData: ButtonProps) {
        this.textImg = buttonData.textImg;
        this.bgImg = buttonData.bgImg;

        this.textImg.setOrigin(.5, .5).setText(buttonData.text).setDepth(1);
        this.bgImg.setInteractive();

        this.bgImg.on("pointerdown", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("");
            buttonData.onClick();
        });

        const currentScene = GameContext.instance.currentScene;

        this.bgImg.on("pointerover", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("pointer");
            this.bgImg.setTexture("menu_button_hover");
        });

        this.bgImg.on("pointerout", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("pointer");
            this.bgImg.setTexture("menu_button");
        });
    }

}
