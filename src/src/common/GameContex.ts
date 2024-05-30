import { SceneConst } from "./SceneConst";

export class GameContext {

    private static _instance: GameContext;
    private _game!: Phaser.Game;
    private _currentSceneName: string = SceneConst.MainMenuScene;


    static get instance(): GameContext {
        if (!GameContext._instance) {
            GameContext._instance = new GameContext();
        }
        return GameContext._instance;
    }

    init(game: Phaser.Game) {
        this._game = game;
    }

    get currentScene(): Phaser.Scene {
        return this._game.scene.getScene(this._currentSceneName);
    }

    setScene(name: string) {
        const tmp = this._currentSceneName;
        this._currentSceneName = name;
        this._game.scene.start(name);

        if (tmp)
            this._game.scene.pause(tmp);
    }
}