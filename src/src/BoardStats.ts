import phaser from "phaser";
import { IGameLoopObject, IPhaserScene, Point } from "./types";
import { GameBoardConst } from "./GameBoardConst";
import { getBoardPos, getNewText } from "./GameUtils";
import { TurnManager } from "./TurnManager";

export class BoardStats implements IGameLoopObject {
    private readonly _phaserScene: IPhaserScene;
    private textImg!: phaser.GameObjects.Text;
    private turnImg!: phaser.GameObjects.Text;

    private scoreImg!: phaser.GameObjects.Text;
    private readonly _turnManager: TurnManager;

    constructor(phaserScene: IPhaserScene, turnManager: TurnManager) {
        this._phaserScene = phaserScene;
        this._turnManager = turnManager;
    }

    create(): void {
        this.initStats();
    }

    update(_: number, _delta: number): void {
        throw new Error("Method not implemented.");
    }

    private initStats() {
        const statStyle = { fontFamily: GameBoardConst.fontFamily, color: "magenta" };
        const boardPos = getBoardPos(9, 0)
        const text = "selected: -";
        this.textImg = this.getNewText(boardPos, text || "x", statStyle);

        const turnText = "turn: " + this._turnManager.currentTurn;
        const turnY = boardPos.y + this.textImg.height + 10;
        this.turnImg = this.getNewText({ x: boardPos.x, y: turnY }, turnText || "x", statStyle);

        const scoreText = "score: w: 0 / b: 0";
        const scoreY = boardPos.y + this.textImg.height + this.turnImg.height + 20;
        this.scoreImg = this.getNewText({ x: boardPos.x, y: scoreY }, scoreText, statStyle);
    }

    updateStats() {
        const turnText = "turn: " + this._turnManager.currentTurn;
        this.turnImg.setText(turnText);
    }

    updateScore(black: number, white: number) {
        const scoreText = `score: w: ${white} / b: ${black}`;
        this.scoreImg.setText(scoreText);
    }


    private getNewText(point: Point, text: string, style?: phaser.Types.GameObjects.Text.TextStyle) {
        return getNewText(this._phaserScene.add, point, text, style).setOrigin(0, 0);
    }
}