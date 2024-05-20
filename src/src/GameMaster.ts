import { GameSquere } from "./GameSquere";
import { TurnManager } from "./TurnManager";
import { GameBoardConst } from "./GameBoardConst";
import { GamePawnType } from "./types";

export class GameMaster {
    private readonly _gameSquere: GameSquere[][];
    private readonly _turnManager: TurnManager;
    private _selectedSquere: GameSquere | null = null;

    constructor(gameSquere: GameSquere[][], turnManager: TurnManager) {
        this._gameSquere = gameSquere;
        this._turnManager = turnManager;
    }

    get selectedSquere(): GameSquere | null {
        return this._selectedSquere;
    }

    private canMove() {
    }

    canSelectPawn(target: GameSquere) {
        return GameBoardConst.playerPawns.includes(target.pawnType) && this._turnManager.currentTurn === target.pawnType;
    }


    canSuggestPawn(target: GameSquere) {

        const hasEffect = GameBoardConst.suggestionPawns.reduce((prev, curr) => {
            return prev || target.hasEffect(curr);
        }, false);

        return (target.pawnType === GamePawnType.none || this._turnManager.opponentType === target.pawnType) && this.selectedSquere !== null && !hasEffect;
    }

    canRemoveSuggestPawn(target: GameSquere) {
        return GameBoardConst.suggestionPawns.includes(target.pawnType);
    }

    getPawnSuggestion(target: GameSquere) {

        if (!this.selectedSquere) {
            return GamePawnType.none;
        }

        const { x: posX, y: posY } = target.position;
        const { x: selectedPosX, y: selectedPosY } = this.selectedSquere?.position;

        const hasEmptySpace = target.pawnType === GamePawnType.none;

        const multiplier = this.selectedSquere.pawnType === GamePawnType.black ? -1 : 1;
        const canMove = Math.abs((selectedPosX - posX)) == 1 && (selectedPosY - posY) == (1 * multiplier);

        const pawnType = (canMove && hasEmptySpace) ? GamePawnType.shadow : GamePawnType.notAllowed;

        return pawnType;
    }

    canPlacePawn(target: GameSquere) {
        return this._selectedSquere && target.hasEffect(GamePawnType.shadow);
    }

    private canTakeEnemyPawn() {
    }

    // action methods

    setSelectedPawn(pawn: GameSquere) {
        this._selectedSquere = pawn;
        this._selectedSquere.pawn?.highlight();
        // this._boardSats.updateStats();
    }

    isSelectedPawnEqual(target: GameSquere) {
        const isTheSame = this._selectedSquere?.name === target.name;
        return isTheSame;
    }

    clearSelectedPawn() {
        this._selectedSquere?.pawn?.unHighlight();
        this._selectedSquere = null;
        // this._boardSats.updateStats();
    }
}
