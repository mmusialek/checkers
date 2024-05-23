import { GameSquere } from "./GameSquere";
import { TurnManager } from "./TurnManager";
import { GameBoardConst } from "./GameBoardConst";
import { GamePawnType } from "./types";
import { addPointToPoint, checkRange4Value, getDistance, getOppositeDirection } from "./GameUtils";
import { ScoreBoard } from "./ScoreBoard";

export class GameMaster {
    private readonly _gameBoard: GameSquere[][];
    private readonly _turnManager: TurnManager;
    private readonly _scoreBoard: ScoreBoard;
    private _selectedSquere: GameSquere | null = null;

    constructor(gameBoard: GameSquere[][], turnManager: TurnManager) {
        this._scoreBoard = new ScoreBoard();
        this._gameBoard = gameBoard;
        this._turnManager = turnManager;
    }

    get selectedSquere(): GameSquere | null {
        return this._selectedSquere;
    }

    get scoreboard(): ScoreBoard {
        return this._scoreBoard;
    }

    private canMove() {
    }

    getPawnSuggestion(target: GameSquere): SuggestionData {

        if (!this.selectedSquere) {
            return { effect: GamePawnType.none };
            // return { effect: GamePawnType.none, enemyFields: [] };
        }


        const distance = getDistance(this.selectedSquere!.position, target.position);

        // const multiplier = this.selectedSquere.pawnType === GamePawnType.black ? -1 : 1;
        // const multiplierDirection = this.selectedSquere.pawnType === GamePawnType.black ? 1 : -1;
        const hasEmptySpace = target.pawnType === GamePawnType.none;
        const oppositeDir = getOppositeDirection(this.selectedSquere!.position, target.position)
        const prevCoords = addPointToPoint(target.position, oppositeDir);

        // const prevCoords = addValueToPoint(target.position, 1 * multiplierDirection)
        // const prevCoords = addPointToPoint(target.position, )
        const prevGameSquere = this._gameBoard[prevCoords.y][prevCoords.x];

        // detect if has fight with enemy pawns
        if (checkRange4Value(distance, 2) && prevGameSquere.pawnType === this._turnManager.opponentType) {
            const pawnType = (hasEmptySpace) ? GamePawnType.shadow : GamePawnType.notAllowed;

            return { effect: pawnType };
            // return { effect: pawnType, enemyFields: [prevGameSquere] };
        }

        // can move if next place is free
        if (checkRange4Value(distance, 1)) {
            const pawnType = (hasEmptySpace) ? GamePawnType.shadow : GamePawnType.notAllowed;
            return { effect: pawnType };
            // return { effect: pawnType, enemyFields: [] };
        }


        return { effect: GamePawnType.notAllowed };
        // return { effect: GamePawnType.notAllowed, enemyFields: [] };
    }

    // can methods

    canPlacePawn(target: GameSquere) {
        return this._selectedSquere && target.hasEffect(GamePawnType.shadow);
    }


    canSelectPawn(target: GameSquere) {
        return GameBoardConst.playerPawns.includes(target.pawnType) && this._turnManager.currentTurn === target.pawnType;
    }

    canSuggestPawn(target: GameSquere) {

        const hasEffect = GameBoardConst.suggestionPawns.reduce((prev, curr) => {
            return prev || target.hasEffect(curr);
        }, false);


        // TODO check direction and range

        return (target.pawnType === GamePawnType.none || this._turnManager.opponentType === target.pawnType) && this.selectedSquere !== null && !hasEffect;
    }

    canRemoveSuggestPawn(target: GameSquere) {
        return GameBoardConst.suggestionPawns.includes(target.pawnType);
    }

    isSelectedPawnEqual(target: GameSquere) {
        const isTheSame = this._selectedSquere?.name === target.name;
        return isTheSame;
    }

    // action methods

    processMovement(target: GameSquere) {
        const distance = getDistance(this.selectedSquere!.position, target.position);
        if (Math.abs(distance.x) == 2 && Math.abs(distance.y) == 2) {
            console.log("asdad")
            const direction = getOppositeDirection(this.selectedSquere!.position, target.position);
            const prevPoint = addPointToPoint(target.position, direction);
            const prevGameSquere = this._gameBoard[prevPoint.y][prevPoint.x];
            prevGameSquere.removePawn();
            this._scoreBoard.incrementScore(this._turnManager.currentTurn);
        }


        // TODO check is next fights pending

        this.clearSelectedPawn();
        this._turnManager.finishTurn();
    }

    setSelectedPawn(pawn: GameSquere) {
        this._selectedSquere = pawn;
        this._selectedSquere.pawn?.highlight();
        // this._boardSats.updateStats();
    }


    clearSelectedPawn() {
        this._selectedSquere?.pawn?.unHighlight();
        this._selectedSquere = null;
        // this._boardSats.updateStats();
    }
}


interface SuggestionData {
    effect: GamePawnType;
    // enemyFields: GameSquere[];
}