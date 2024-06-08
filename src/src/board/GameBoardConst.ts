import { GamePawnType } from "./types";

export const GameBoardConst = {
  tileSize: 64,
  numRows: 8,
  numCols: 8,

  playerPawns: [GamePawnType.blackPawn, GamePawnType.whitePawn, GamePawnType.blackQueen, GamePawnType.whiteQueen],
  suggestionPawns: [GamePawnType.shadow, GamePawnType.notAllowed],

  blackStartingRows: [0, 1, 2],
  get whiteStartingRows() {
    return [this.numRows - 1, this.numRows - 2, this.numRows - 3]
  },

  boardOffset: 64,

  get originOffset() {
    return this.tileSize / 2;
  },


  // dispaly things
  fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
}
