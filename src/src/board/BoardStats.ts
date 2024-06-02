import phaser from "phaser";
import { BoardType, GamePawnType, IGameLoopObject, PlayerType } from "./types";
import { GameBoardConst } from "./GameBoardConst";
import { getBoardPos } from "../GameUtils";
import { getNewText } from "../common/ObjectFatory";

export class BoardStats implements IGameLoopObject {
    private turnImg!: phaser.GameObjects.Text;
    private scoreImg!: phaser.GameObjects.Text;

    create(): void {
        this.initStats();
    }

    clear() {
        this.updateTurn(PlayerType.white);
        this.updateScore({ black: 0, white: 0 });
    }

    updateTurn(pawnTurn: PlayerType) {
        const turnText = "turn: " + pawnTurn;
        this.turnImg.setText(turnText);
    }

    updateScore(board: BoardType) {
        const scoreText = `score: w: ${board.white} / b: ${board.black}`;
        this.scoreImg.setText(scoreText);
    }

    // helper methods

    private initStats() {
        const statStyle = { fontFamily: GameBoardConst.fontFamily, color: "green" };
        let { x: startX, y: startY } = getBoardPos(9, 0);

        const turnText = "turn: " + GamePawnType.whitePawn;
        this.turnImg = getNewText({ x: startX, y: startY }, turnText || "x", statStyle).setOrigin(0, 0);

        const scoreText = "score: w: 0 / b: 0";
        startY += this.turnImg.height;
        this.scoreImg = getNewText({ x: startX, y: startY }, scoreText, statStyle).setOrigin(0, 0);
    }
}
