import phaser from "phaser";
import { BoardType, GamePawnType, IGameLoopObject, PlayerType } from "./types";
import { GameBoardConst } from "./GameBoardConst";
import { getBoardPos } from "../GameUtils";
import { getNewSprite, getNewText } from "../common/ObjectFatory";

export class BoardStats implements IGameLoopObject {
    private turnImg!: phaser.GameObjects.Text;
    private scoreTextImg!: phaser.GameObjects.Text;
    private scoreWhiteTextImg!: phaser.GameObjects.Text;
    private scoreBlackTextImg!: phaser.GameObjects.Text;

    private blackPawn!: phaser.GameObjects.Sprite;
    private whitePawn!: phaser.GameObjects.Sprite;

    create(): void {
        this.initStats();
    }

    clear() {
        this.updateTurn(PlayerType.white);
        this.updateScore({ black: 0, white: 0 });
    }

    updateTurn(pawnTurn: PlayerType) {
        if (pawnTurn === PlayerType.white) {
            this.whitePawn.setAlpha(1);
            this.blackPawn.setAlpha(.3);
            // this.whitePawn.setVisible(true);
            // this.blackPawn.setVisible(false);
        } else {
            this.blackPawn.setAlpha(1);
            this.whitePawn.setAlpha(.3);
            // this.blackPawn.setVisible(true);
            // this.whitePawn.setVisible(false);
        }
    }

    updateScore(board: BoardType) {
        this.scoreBlackTextImg.setText(board.black.toString(10));
        this.scoreWhiteTextImg.setText(board.white.toString(10));
    }

    // helper methods

    private initStats() {
        const statStyle = { fontFamily: GameBoardConst.fontFamily, color: "green" };
        let { x: startX, y: startY } = getBoardPos(9, 0);

        this.blackPawn = getNewSprite({ x: startX, y: startY }, GamePawnType.blackPawn);

        startX += 50;
        const turnText = "turn";
        this.turnImg = getNewText({ x: startX, y: startY }, turnText || "x", statStyle).setOrigin(0, 0);

        startX += 80;
        this.whitePawn = getNewSprite({ x: startX, y: startY }, GamePawnType.whitePawn);

        const scoreText = "score";
        startY += this.turnImg.height + 50;
        this.scoreTextImg = getNewText({ x: this.turnImg.x, y: startY }, scoreText, statStyle).setOrigin(0, 0);

        this.scoreBlackTextImg = getNewText({ x: this.blackPawn.x, y: this.scoreTextImg.y }, "0", statStyle).setOrigin(.5, 0);
        this.scoreWhiteTextImg = getNewText({ x: this.whitePawn.x, y: this.scoreTextImg.y }, "0", statStyle).setOrigin(.5, 0);

    }
}
