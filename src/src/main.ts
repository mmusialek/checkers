import Phaser from "phaser";
import "./style.css"
import { GameBoardScene } from "./GameBoardScene";


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
  }

  private getConfig() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      scene: GameBoardScene,
      autoCenter: Phaser.Scale.Center.CENTER_BOTH,
      canvasStyle: "margin:0; padding:0",
      autoFocus: true,
      scale: {
        autoCenter: Phaser.Scale.Center.CENTER_BOTH,
        width: '100%',
        height: '100%'
      }
    };
    return config;
  }
}

new GameInitializer();
