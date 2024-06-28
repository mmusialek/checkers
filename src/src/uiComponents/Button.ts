import phaser from "phaser";
import { GameContext } from "../common/GameContex";
import { Point } from "../common/type";
import { FontsConst } from "../common/FontsConts";

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
        const textImg = sceneAdd.text(position.x, position.y, "", { fontFamily: FontsConst.secondaryFontFamily, fontSize: 15 }).setOrigin(.5, .5);
        const bgImg = sceneAdd.image(position.x, position.y, "menu_button");

        const tmp = new Button();
        tmp.setData({ bgImg: bgImg, text: buttonLabel, textImg: textImg, onClick: onClickHandler });

        return tmp;
    }

    destroy() {
        this.textImg.destroy();
        this.bgImg.destroy();
    }

    private setData(buttonData: ButtonProps) {
        this.textImg = buttonData.textImg;
        this.bgImg = buttonData.bgImg;

        this.textImg.setOrigin(.5, .5).setText(buttonData.text).setDepth(1);
        this.bgImg.setInteractive();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.bgImg.on("pointerdown", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("");
            buttonData.onClick();
        });

        const currentScene = GameContext.instance.currentScene;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.bgImg.on("pointerover", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("pointer");
            this.bgImg.setTexture("menu_button_hover");
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.bgImg.on("pointerout", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("");
            this.bgImg.setTexture("menu_button");
        });
    }

}
