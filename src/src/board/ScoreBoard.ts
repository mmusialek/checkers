import { BoardType, PlayerType } from "./types";

export class ScoreBoard {
    private readonly _score: BoardType = { black: 0, white: 0 };

    incrementScore(player: PlayerType, points: number = 1): void {
        if (this._score[player] !== undefined) {
            this._score[player] += points;
        } else {
            console.warn(`Player ${player} is not valid.`);
        }
    }

    clear(): void {
        this._score[PlayerType.black] = 0;
        this._score[PlayerType.white] = 0;
    }

    loadData(board: BoardType): void {
        this._score[PlayerType.black] = board[PlayerType.black];
        this._score[PlayerType.white] = board[PlayerType.white];
    }

    getBoard(): BoardType {
        return { ...this._score };
    }
}
