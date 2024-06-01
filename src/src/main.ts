import Phaser from "phaser";
import "./style.css"
import { GameBoardScene } from "./scenes/GameBoardScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { GameContext } from "./common/GameContex";


class GameInitializer {
  private game: Phaser.Game | undefined;

  constructor() {
    this.resizeGame();
    window.addEventListener('resize', this.resizeGame);
  }

  private resizeGame = (): void => {

    if (this.game) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.game.scale.resize(width, height);
    } else {
      const config = this.getConfig();
      this.game = new Phaser.Game(config);
    }

    GameContext.instance.init(this.game);
  }

  private getConfig() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      scene: [MainMenuScene, GameBoardScene],
      autoCenter: Phaser.Scale.Center.CENTER_BOTH,
      canvasStyle: "margin: 0; padding: 0",
      autoFocus: true,
      scale: {
        autoCenter: Phaser.Scale.Center.NO_CENTER,
        width: '100%',
        height: '100%',
      }
    };
    return config;
  }
}

new GameInitializer();
