import { PlayerType } from "./types";

export class TurnManager {
    private _pawnTurn!: PlayerType;

    constructor() {
        this.clear();
    }

    get currentTurn() {
        return this._pawnTurn;
    }

    get opponentType() {
        return this._pawnTurn === PlayerType.black ? PlayerType.white : PlayerType.black;
    }

    clear() {
        this._pawnTurn = PlayerType.white;
    }

    loadData(pawn: PlayerType) {
        this._pawnTurn = pawn;
    }

    finishTurn() {
        if (this._pawnTurn === PlayerType.white) {
            this._pawnTurn = PlayerType.black;
        } else {
            this._pawnTurn = PlayerType.white;
        }
    }
}
