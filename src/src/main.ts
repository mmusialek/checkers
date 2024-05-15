import Phaser from "phaser";
import "./style.css"


const GameBoardConst = {
  tileSize: 64,
  numRows: 8,
  numCols: 8,

  blackStartingRows: [0, 1],
  get whiteStartingRows() {
    return [this.numRows - 1, this.numRows - 2]
  },

  get originOffset() {
    return this.tileSize / 2;
  },
}

declare type GamePawnType = "white" | "black" | null;
interface PawnSpritesMapType {
  white: string;
  black: string;
  [key: string]: string | undefined;
}

const PawnSpritesMap: PawnSpritesMapType = { "white": "white_pawn", "black": "black_pawn" }


class GameSquere {
  private readonly row: number;
  private readonly col: number;
  private _pawnType: GamePawnType = null;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  get name(): string {
    return `${this.row}-${this.col}`;
  }

  get pawnType(): GamePawnType {
    return this._pawnType;
  }


  setPawnType(type: GamePawnType) {
    this._pawnType = type;
  }

}

class GameBoardScene extends Phaser.Scene {

  private gameBoard: GameSquere[][] = [];

  constructor() {
    super("GameBoardScene");
    this.initializeBoard();
  }

  preload(): void {
    this.load.image('white_pawn', 'assets/white_pawn.png');
    this.load.image('black_pawn', 'assets/black_pawn.png');
  }

  create(): void {
    this.drawBoard();
    this.drawPawns();

    window.addEventListener('resize', () => {
      this.drawBoard();
    });
  }

  update(time: number, delta: number): void {

  }

  private initializeBoard() {
    this.gameBoard = [];
    for (let row = 0; row < GameBoardConst.numRows; row++) {
      this.gameBoard[row] = [];
      for (let col = 0; col < GameBoardConst.numCols; col++) {
        this.gameBoard[row][col] = new GameSquere(row, col);

        if (GameBoardConst.blackStartingRows.includes(row)) {
          this.gameBoard[row][col].setPawnType("black");
        }

        if (GameBoardConst.whiteStartingRows.includes(row)) {
          this.gameBoard[row][col].setPawnType("white");
        }
      }
    }
  }

  private drawPawns() {
    for (let row = 0; row < GameBoardConst.numRows; row++) {
      for (let col = 0; col < GameBoardConst.numCols; col++) {
        const gameSquere = this.gameBoard[row][col];


        if (gameSquere.pawnType) {
          const x = this.getXPos(col);
          const y = this.getXPos(row);
          this.add.image(x, y, PawnSpritesMap[gameSquere.pawnType]);
        }

      }
    }
  }


  private drawBoard() {
    for (let row = 0; row < GameBoardConst.numRows; row++) {
      for (let col = 0; col < GameBoardConst.numCols; col++) {
        const x = this.getXPos(col);
        const y = this.getXPos(row);
        const color = (row + col) % 2 === 0 ? 0xffffff : 0x000000; // Alternating colors

        this.add.rectangle(x, y, GameBoardConst.tileSize, GameBoardConst.tileSize, color)
      }
    }
  }

  private getXPos(col: number) {
    return (col * GameBoardConst.tileSize) + GameBoardConst.originOffset;
  }

  private getYPos(row: number) {
    return (row * GameBoardConst.tileSize) + GameBoardConst.originOffset;
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
