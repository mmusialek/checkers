import phaser from "phaser";
import { GameContext } from "../common/GameContex";
import { PawnAudioTypes } from "./types";
import { getRandomInt } from "./GameUtils";

export class SoundObjectPool {

    private static _instance: SoundObjectPool;
    private readonly _pawnSounds: (phaser.Sound.NoAudioSound | phaser.Sound.HTML5AudioSound | phaser.Sound.WebAudioSound)[] = [];

    private constructor() {
    }

    static get instance() {
        if (!SoundObjectPool._instance) {
            this._instance = new SoundObjectPool();
            const s0001 = GameContext.instance.currentScene.sound.add(PawnAudioTypes.pawnMove0001);
            const s0002 = GameContext.instance.currentScene.sound.add(PawnAudioTypes.pawnMove0002);
            const s0003 = GameContext.instance.currentScene.sound.add(PawnAudioTypes.pawnMove0003);
            const s0004 = GameContext.instance.currentScene.sound.add(PawnAudioTypes.pawnMove0004);
            const s0005 = GameContext.instance.currentScene.sound.add(PawnAudioTypes.pawnMove0005);
            this._instance._pawnSounds.push(s0001, s0002, s0003, s0004, s0005);
        }

        return this._instance;
    }


    getPawnSound() {
        return this._pawnSounds[getRandomInt(0, this._pawnSounds.length - 1)];
    }
}