import { GamePawnType } from "./types";

declare type PlayerType = GamePawnType.white | GamePawnType.black;

declare type BoardType = { [key in PlayerType]: number };

export class ScoreBoard {
    private readonly _score: BoardType = { black: 0, white: 0 };

    incrementScore(player: PlayerType, points: number = 1): void {
        if (this._score[player] !== undefined) {
            this._score[player] += points;
        } else {
            console.warn(`Player ${player} is not valid.`);
        }
    }

    getScore(player: PlayerType): number | undefined {
        return this._score[player];
    }

    getBoard(): BoardType {
        return this._score;
    }
}