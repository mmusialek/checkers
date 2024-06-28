import phaser from "phaser";
import { SceneConst } from "./SceneConst";


export class DebugSettings {

    public noTurnManager: boolean = false;
}

export class GameContext {

    private static _instance: GameContext;
    private _game!: phaser.Game;
    private _currentSceneName: string = SceneConst.MainMenuScene;
    private readonly _debugSettings: DebugSettings;


    private constructor() {
        this._debugSettings = new DebugSettings();
    }

    get debug(): boolean {
        return false;
    }

    get debugSettings(): DebugSettings | null {
        if (!this.debug) return null;
        return this._debugSettings;
    }

    static get instance(): GameContext {
        if (!GameContext._instance) {
            GameContext._instance = new GameContext();
        }
        return GameContext._instance;
    }

    init(game: phaser.Game) {
        this._game = game;
    }

    get currentScene(): phaser.Scene {
        return this._game.scene.getScene(this._currentSceneName);
    }

    setScene(name: SceneConst, data?: object) {
        const tmp = this._currentSceneName;
        this._currentSceneName = name;

        this._game.scene.stop(tmp).start(name, data);
    }
}
