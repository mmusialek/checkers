import phaser from "phaser";
import { GameContext } from "../common/GameContex";

export class SoundObjectPool {

    private static _instance: SoundObjectPool;
    private _buttonHover!: (phaser.Sound.NoAudioSound | phaser.Sound.HTML5AudioSound | phaser.Sound.WebAudioSound);
    private _buttonClick!: (phaser.Sound.NoAudioSound | phaser.Sound.HTML5AudioSound | phaser.Sound.WebAudioSound);

    private constructor() {
    }

    static get instance() {
        if (!SoundObjectPool._instance) {
            this._instance = new SoundObjectPool();
            this._instance._buttonHover = GameContext.instance.currentScene.sound.add("button_highlight");
            this._instance._buttonClick = GameContext.instance.currentScene.sound.add("button_click");
        }

        return this._instance;
    }


    getButtonHover() {
        return this._buttonHover;
    }

    getButtonClick() {
        return this._buttonClick;
    }
}