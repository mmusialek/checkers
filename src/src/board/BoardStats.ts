import phaser from "phaser";
import { BoardType, GamePawnType, IGameLoopObject, PlayerType } from "./types";
import { getBoardPos } from "./GameUtils";
import { getNewSprite, getNewText } from "../common/ObjectFatory";
import { FontsConst } from "../common/FontsConts";

export class BoardStats implements IGameLoopObject {
    private turnImg!: phaser.GameObjects.Text;
    private scoreTextImg!: phaser.GameObjects.Text;
    private scoreWhiteTextImg!: phaser.GameObjects.Text;
    private scoreBlackTextImg!: phaser.GameObjects.Text;

    private blackPawn!: phaser.GameObjects.Sprite;
    private blackPawnText!: phaser.GameObjects.Text;
    private whitePawn!: phaser.GameObjects.Sprite;
    private whitePawnText!: phaser.GameObjects.Text;
    private players: number = 2;

    create(): void {
        this.initStats();
    }

    setPlayers(playerCount: number) {
        this.players = playerCount;
    }

    clear() {
        this.updateTurn(PlayerType.white);
        this.updateScore({ black: 0, white: 0 });
    }

    updateTurn(pawnTurn: PlayerType) {
        if (pawnTurn === PlayerType.white) {
            this.whitePawn.setAlpha(1);
            this.whitePawnText.setAlpha(1);
            this.blackPawn.setAlpha(.2);
            this.blackPawnText.setAlpha(.2);
        } else {
            this.blackPawn.setAlpha(1);
            this.blackPawnText.setAlpha(1);
            this.whitePawn.setAlpha(.2);
            this.whitePawnText.setAlpha(.2);
        }
    }

    updateScore(board: BoardType) {
        this.scoreBlackTextImg.setText(board.black.toString(10));
        this.scoreWhiteTextImg.setText(board.white.toString(10));
    }

    // helper methods

    private initStats() {
        const statStyle = { fontFamily: FontsConst.secondaryFontFamily, color: FontsConst.primaryColor, fontSize: 20 };

        // eslint-disable-next-line prefer-const
        let { x: startX, y: startY } = getBoardPos(9, 0);
        let startXTmp = startX;
        let startYTmp = startY;

        const turnText = "turn";
        this.turnImg = getNewText({ x: startXTmp, y: startY }, turnText || "x", statStyle);

        startXTmp = startX;
        startY += (this.turnImg.height / 2) + 50;
        this.blackPawn = getNewSprite({ x: startXTmp, y: startY }, GamePawnType.blackPawn);
        let startPawnXLabel = startXTmp + (this.blackPawn.width) + 50;
        this.blackPawnText = getNewText({ x: startPawnXLabel, y: startY }, this.players === 2 ? "Player 2" : "CPU", statStyle);

        startY += (this.turnImg.height / 2) + 50;
        this.whitePawn = getNewSprite({ x: startXTmp, y: startY }, GamePawnType.whitePawn);
        this.whitePawnText = getNewText({ x: startPawnXLabel, y: startY }, "Player 1", statStyle);



        startXTmp += (this.turnImg.width / 2) + 50;
        startPawnXLabel += this.whitePawnText.width + 50;
        const scoreText = "score";
        this.scoreTextImg = getNewText({ x: startPawnXLabel, y: startYTmp }, scoreText, statStyle);

        startYTmp += (this.scoreTextImg.height / 2) + 50;
        this.scoreBlackTextImg = getNewText({ x: startPawnXLabel, y: startYTmp }, "0", statStyle);
        startYTmp += (this.scoreTextImg.height / 2) + 50;
        this.scoreWhiteTextImg = getNewText({ x: startPawnXLabel, y: startYTmp }, "0", statStyle);

    }
}
