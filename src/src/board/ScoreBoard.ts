import { BoardType, GamePawnType, PlayerType } from "./types";

export class ScoreBoard {
    private readonly _score: BoardType = { black: 0, white: 0 };

    incrementScore(player: PlayerType, points: number = 1): void {
        if (this._score[player] !== undefined) {
            this._score[player] += points;
        } else {
            console.warn(`Player ${player} is not valid.`);
        }
    }

    loadData(board: BoardType): void {
        this._score[GamePawnType.black] = board.black;
        this._score[GamePawnType.white] = board.white;
    }

    getBoard(): BoardType {
        return { ...this._score };
    }
}
