import { GamePawnType } from "./types";

export const GameBoardConst = {
  tileSize: 64,
  numRows: 8,
  numCols: 8,

  playerPawns: [GamePawnType.black, GamePawnType.white],
  boardField: ["white_squere", "black_squere"],

  blackStartingRows: [0, 1],
  get whiteStartingRows() {
    return [this.numRows - 1, this.numRows - 2]
  },

  boardOffset: 50,

  get originOffset() {
    return this.tileSize / 2;
  },


  // dispaly things
  fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
}