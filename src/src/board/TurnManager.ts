import { GamePawnType, PlayerType } from "./types";

export class TurnManager {
    private _pawnTurn!: PlayerType;

    constructor() {
        this.clear();
    }

    get currentTurn() {
        return this._pawnTurn;
    }

    get opponentType() {
        return this._pawnTurn === GamePawnType.black ? GamePawnType.white : GamePawnType.black;
    }

    clear() {
        this._pawnTurn = GamePawnType.white;
    }

    loadData(pawn: PlayerType) {
        this._pawnTurn = pawn;
    }

    finishTurn() {
        if (this._pawnTurn === GamePawnType.white) {
            this._pawnTurn = GamePawnType.black;
        } else {
            this._pawnTurn = GamePawnType.white;
        }
    }
}
