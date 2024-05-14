import Phaser from "phaser";
import "./style.css"

class MyGame extends Phaser.Scene {
  constructor() {
    super("myGame");
  }

  preload(): void {
    // Load assets here
  }

  create(): void {
    this.drawBoard();
    window.addEventListener('resize', () => {
      this.drawBoard();
    });
  }

  update(time: number, delta: number): void {

  }


  private drawBoard() {
    const tileSize = 64; // Size of each square
    const numRows = 8;
    const numCols = 8;

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const x = col * tileSize;
        const y = row * tileSize;
        const color = (row + col) % 2 === 0 ? 0xffffff : 0x000000; // Alternating colors

        this.add.rectangle(x, y, tileSize, tileSize, color).setOrigin(0, 0);
      }
    }
  }
}

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
      // width: '100%',
      // height: '100%',
      scene: MyGame,
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
