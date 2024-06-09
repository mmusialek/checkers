import { GameContext } from "../common/GameContex";
import { Point } from "../common/type";

// interface ButtonLabelProps {
//     textImg: phaser.GameObjects.Text;
//     bgImg: phaser.GameObjects.Image;

//     text: string;
// }

export class ButtonLabel {
    // private _textImg!: phaser.GameObjects.Text;
    // private _bgImg!: phaser.GameObjects.Image;

    private constructor() { }

    static new(point: Point, label: string) {
        // const tmp = new ButtonLabel();

        const sceneAdd = GameContext.instance.currentScene.add;
        sceneAdd.text(point.x, point.y, "").setOrigin(.5, .5).setText(label);
        sceneAdd.image(point.x, point.y, "menu_button");

        // tmp.setData({
        //     bgImg: bgImg,
        //     textImg: textImg,
        //     text: label
        // });
    }

    // private setData(buttonData: ButtonLabelProps) {
    //     this._textImg = buttonData.textImg;
    //     this._bgImg = buttonData.bgImg;

    //     this._textImg.setOrigin(.5, .5).setText(buttonData.text).setDepth(1);
    // }

}
