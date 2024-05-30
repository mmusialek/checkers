import phaser from "phaser";
import { IGameLoopObject, IPhaserScene } from "../board/types";

interface ButtonProps {
    textImg: phaser.GameObjects.Text;
    bgImg: phaser.GameObjects.Image;
    bgHoverImg: phaser.GameObjects.Image;

    text: string;
    onClick: () => void;
}

export class Button implements IGameLoopObject {
    private readonly _phaserScene: IPhaserScene;
    private textImg!: phaser.GameObjects.Text;
    private bgImg!: phaser.GameObjects.Image;
    private bgHoverImg!: phaser.GameObjects.Image;

    constructor(phaserScene: IPhaserScene) {
        this._phaserScene = phaserScene;
    }

    private isHover: boolean = false;

    setData(buttonData: ButtonProps) {
        this.textImg = buttonData.textImg;
        this.bgImg = buttonData.bgImg;
        this.bgHoverImg = buttonData.bgHoverImg;

        this.textImg.setOrigin(.5, .5).setText(buttonData.text).setDepth(1);
        this.bgImg.setInteractive();
        this.bgHoverImg.setInteractive().setVisible(this.isHover);

        this.bgHoverImg.on("pointerdown", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            buttonData.onClick();
        });

        this.bgImg.on("pointerover", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            this._phaserScene.input.setDefaultCursor("pointer");
            this.toggleHover();
        });

        this.bgHoverImg.on("pointerout", (_pointer: phaser.Input.Pointer, _target: phaser.GameObjects.Image[]) => {
            this._phaserScene.input.setDefaultCursor("");
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
