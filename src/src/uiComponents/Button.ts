import phaser from "phaser";
import { IGameLoopObject } from "../board/types";
import { GameContext } from "../common/GameContex";
import { Point } from "../common/type";

interface ButtonProps {
    textImg: phaser.GameObjects.Text;
    bgImg: phaser.GameObjects.Image;
    bgHoverImg: phaser.GameObjects.Image;

    text: string;
    onClick: () => void;
}

export class Button implements IGameLoopObject {
    private textImg!: phaser.GameObjects.Text;
    private bgImg!: phaser.GameObjects.Image;
    private bgHoverImg!: phaser.GameObjects.Image;

    private isHover: boolean = false;

    static new(position: Point, buttonLabel: string, onClickHandler: () => void) {
        const sceneAdd = GameContext.instance.currentScene.add;
        const textImg = sceneAdd.text(position.x, position.y, "").setOrigin(.5, .5);
        const bgImg = sceneAdd.image(position.x, position.y, "menu_button");
        const bgHoverImg = sceneAdd.image(position.x, position.y, "menu_button_hover");

        const tmp = new Button();
        tmp.setData({ bgImg: bgImg, bgHoverImg: bgHoverImg, text: buttonLabel, textImg: textImg, onClick: onClickHandler });

        return tmp;
    }

    private setData(buttonData: ButtonProps) {
        this.textImg = buttonData.textImg;
        this.bgImg = buttonData.bgImg;
        this.bgHoverImg = buttonData.bgHoverImg;

        this.textImg.setOrigin(.5, .5).setText(buttonData.text).setDepth(1);
        this.bgImg.setInteractive();
        this.bgHoverImg.setInteractive().setVisible(this.isHover);

        this.bgHoverImg.on("pointerdown", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("");
            buttonData.onClick();
        });

        const currentScene = GameContext.instance.currentScene;

        this.bgImg.on("pointerover", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("pointer");
            this.toggleHover();
        });

        this.bgHoverImg.on("pointerout", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            currentScene.input.setDefaultCursor("");
            this.toggleHover();
        });
    }

    private toggleHover() {
        this.isHover = !this.isHover;
        this.bgImg.setVisible(!this.isHover);
        this.bgHoverImg.setVisible(this.isHover);
    }

    create(): void {
        throw new Error("Method not implemented.");
    }

    update(_time: number, _delta: number): void {
        throw new Error("Method not implemented.");
    }

}
