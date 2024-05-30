import { GamePawnType } from "./types";

export class TurnManager {
    private _pawnTurn: GamePawnType.white | GamePawnType.black;

    constructor() {
        this._pawnTurn = GamePawnType.white;
    }

    get currentTurn() {
        return this._pawnTurn;
    }

    get opponentType() {
        return this._pawnTurn === GamePawnType.black ? GamePawnType.white : GamePawnType.black;
    }

    finishTurn() {
        if (this._pawnTurn === GamePawnType.white) {
            this._pawnTurn = GamePawnType.black;
        } else {
            this._pawnTurn = GamePawnType.white;
        }
    }
}