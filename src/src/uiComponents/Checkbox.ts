import phaser from "phaser";
import { GameContext } from "../common/GameContex";
import { Point } from "../common/type";
import { FontsConst } from "../common/FontsConts";

interface CheckboxProps {
    textImg: phaser.GameObjects.Text;
    bgImg: phaser.GameObjects.Image;

    text: string;
    onClick: (checked: boolean) => void;
}

export class Checkbox {
    private textImg!: phaser.GameObjects.Text;
    private bgImg!: phaser.GameObjects.Image;

    private isChecked: boolean = false;

    static new(position: Point, label: string, onClickHandler: (checked: boolean) => void) {
        const sceneAdd = GameContext.instance.currentScene.add;
        const textImg = sceneAdd.text(position.x, position.y, "", { fontFamily: FontsConst.secondaryFontFamily, fontSize: 15 }).setOrigin(.5, .5);
        const bgImg = sceneAdd.image(position.x, position.y, "menu_button");

        const tmp = new Checkbox();
        tmp.setData({ bgImg: bgImg, text: label, textImg: textImg, onClick: onClickHandler });

        return tmp;
    }

    private setData(buttonData: CheckboxProps) {
        this.textImg = buttonData.textImg;
        this.bgImg = buttonData.bgImg;

        this.textImg.setOrigin(.5, .5).setText(buttonData.text).setDepth(1);
        this.bgImg.setInteractive();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.bgImg.on("pointerdown", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("");
            this.toggleState();
            buttonData.onClick(this.isChecked);
        });

        const currentScene = GameContext.instance.currentScene;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.bgImg.on("pointerover", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("pointer");
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.bgImg.on("pointerout", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("");
        });
    }

    private toggleState() {
        this.isChecked = !this.isChecked;

        if (this.isChecked) {
            this.bgImg.setTexture("menu_button_hover");
        } else {
            this.bgImg.setTexture("menu_button");
        }
    }

}
