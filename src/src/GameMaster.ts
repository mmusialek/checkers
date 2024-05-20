import { GameSquere } from "./GameSquere";
import { TurnManager } from "./TurnManager";
import { GameBoardConst } from "./GameBoardConst";
import { GamePawnType, Point } from "./types";
import { addToPoint, getDirection, getGameSquereByCoords } from "./GameUtils";

export class GameMaster {
    private readonly _gameBoard: GameSquere[][];
    private readonly _turnManager: TurnManager;
    private _selectedSquere: GameSquere | null = null;

    constructor(gameBoard: GameSquere[][], turnManager: TurnManager) {
        this._gameBoard = gameBoard;
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


        const direction = getDirection(this.selectedSquere!.position, target.position);

        const canMoveToTarget = (range: number) => {
            const canMove = Math.abs(direction.x) == range && direction.y == (range * multiplier);
            return canMove;
        }
        const multiplier = this.selectedSquere.pawnType === GamePawnType.black ? -1 : 1;
        const multiplierDirection = this.selectedSquere.pawnType === GamePawnType.black ? 1 : -1;
        const hasEmptySpace = target.pawnType === GamePawnType.none;

        const prevCoords = addToPoint(target.position, 1 * multiplierDirection)
        const prevGameSquere = this._gameBoard[prevCoords.y][prevCoords.x];
        
        // detect if has fight with enemy pawns
        if (canMoveToTarget(2) && prevGameSquere.pawnType === this._turnManager.opponentType) {
            const pawnType = (hasEmptySpace) ? GamePawnType.shadow : GamePawnType.notAllowed;

            // TODO remove enemy pawn, score points
            return pawnType;
        }

        // can move if next place is free
        if (canMoveToTarget(1)) {
            const pawnType = (hasEmptySpace) ? GamePawnType.shadow : GamePawnType.notAllowed;
            return pawnType;
        }


        return GamePawnType.notAllowed;
    }

    canPlacePawn(target: GameSquere) {
        return this._selectedSquere && target.hasEffect(GamePawnType.shadow);
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
