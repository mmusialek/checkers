import phaser from "phaser";

interface ButtonLabelProps {
    textImg: phaser.GameObjects.Text;
    bgImg: phaser.GameObjects.Image;

    text: string;
}

export class ButtonLabel {
    private textImg!: phaser.GameObjects.Text;
    private bgImg!: phaser.GameObjects.Image;


    setData(buttonData: ButtonLabelProps) {
        this.textImg = buttonData.textImg;
        this.bgImg = buttonData.bgImg;

        this.textImg.setOrigin(.5, .5).setText(buttonData.text).setDepth(1);
        // this.bgImg.setInteractive();
    }

}
