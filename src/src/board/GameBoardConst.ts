export const GameBoardConst = {
  tileSize: 64,
  numRows: 8,
  numCols: 8,

  blackStartingRows: [0, 1, 2],
  get whiteStartingRows() {
    return [this.numRows - 1, this.numRows - 2, this.numRows - 3]
  },

  boardXOffset: 50,
  boardYOffset: 150,

  get originOffset() {
    return (this.tileSize / 2) + 32;
  },


  // dispaly things
  fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
}
