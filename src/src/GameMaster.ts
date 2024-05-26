import { GameSquere } from "./GameSquere";
import { TurnManager } from "./TurnManager";
import { GameBoardConst } from "./GameBoardConst";
import { GamePawnType, MovementType, Point } from "./types";
import { addPointToPoint, addValueToArray, addValueToValue, getDistance, getOppositeDirection } from "./GameUtils";
import { ScoreBoard } from "./ScoreBoard";

export class GameMaster {
    private readonly _gameBoard: GameSquere[][];
    private readonly _turnManager: TurnManager;
    private readonly _scoreBoard: ScoreBoard;
    private _selectedSquere: GameSquere | null = null;
    private _suggestedFields: SuggestionData[] = [];

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

    // public methods

    getBoard = () => {
        return this._scoreBoard.getBoard();
    }

    getSuggestion4Field(target: GameSquere) {
        const field = this._suggestedFields.find(q => q.gameSquere.position.x === target.position.x && q.gameSquere.position.y === target.position.y);

        // if (field?.effect == GamePawnType.shadow) {
        if (field) {
            return field;
        }

        return undefined;
    }

    // can methods

    canPlacePawn(target: GameSquere) {
        return this._selectedSquere && target.hasEffect(GamePawnType.shadow);
    }

    canSelectPawnNoMoveCheck(target: GameSquere) {
        return GameBoardConst.playerPawns.includes(target.pawnType) && this._turnManager.currentTurn === target.pawnType;
    }

    canSelectGameSquere(prevSquere: GameSquere | null, target: GameSquere) {
        if (this._turnManager.currentTurn === this._selectedSquere?.pawnType) {

            if (target.pawnType === GamePawnType.none && prevSquere?.pawnType === GamePawnType.black) {
                return MovementType.CaptureAfterEnemy;
            }
            else if (target.pawnType === this._turnManager.opponentType && prevSquere === null) {
                return MovementType.CaptureOnEnemy;
            }
            else if (target.pawnType === GamePawnType.none) {
                return MovementType.Normal;
            }
        }

        return MovementType.Unavailable;
    }

    canSuggestPawn(target: GameSquere) {
        return this.getSuggestion4Field(target) != undefined;
    }

    isSelectedPawnEqual(target: GameSquere) {
        const isTheSame = this._selectedSquere?.name === target.name;
        return isTheSame;
    }

    // action methods

    processMovement(target: GameSquere) {
        const distance = getDistance(this.selectedSquere!.position, target.position);
        if (Math.abs(distance.x) == 2 && Math.abs(distance.y) == 2) {
            const direction = getOppositeDirection(this.selectedSquere!.position, target.position);
            const prevPoint = addPointToPoint(target.position, direction);
            const prevGameSquere = this._gameBoard[prevPoint.y][prevPoint.x];
            prevGameSquere.removePawn();
            this._scoreBoard.incrementScore(this._turnManager.currentTurn);
        }


        // TODO check is next fights pending

        // this.clearSelectedPawn();
    }

    setSelectedPawn(pawn: GameSquere) {
        this._selectedSquere = pawn;
        this._selectedSquere.pawn?.highlight();
        // this._boardSats.updateStats();

        this.getPawnSuggestion();
    }


    clearSelectedPawn() {
        this._selectedSquere?.pawn?.unHighlight();
        this._selectedSquere = null;
        // this._boardSats.updateStats();
    }

    clearSuggestions() {
        this._suggestedFields.splice(0, this._suggestedFields?.length);
    }


    checkAnyMovementLeft(currentSquere: GameSquere): boolean {
        this._selectedSquere = currentSquere;
        this.getPawnSuggestion();
        const canMove = this._suggestedFields.some(q => q.moveType === MovementType.CaptureAfterEnemy);
        if (!canMove) {
            this.clearSuggestions();
        }

        return canMove;
    }

    //helper methods

    private getPawnSuggestion() {
        if (!this._selectedSquere) return;

        const moveRange: number[] = [1, -1];
        const suggestedFields = this.checkSquere(moveRange, null, 1)

        // capturing has priority, so check if any and disable other moves
        if (suggestedFields.some(q => q.moveType === MovementType.CaptureAfterEnemy)) {
            const toChange = suggestedFields.filter(q => q.moveType === MovementType.Normal);
            for (const item of toChange) {
                item.effect = GamePawnType.notAllowed;
            }
        }

        this._suggestedFields = suggestedFields;
    }

    private checkSquere(moveRange: number[], prevSquere: GameSquere | null, deep: number): SuggestionData[] {
        const playerVerticalDirection = (this._turnManager.currentTurn === GamePawnType.black ? 1 : -1) * deep;

        const availableMoves: SuggestionData[] = [];
        if (deep === 3)
            return availableMoves;

        for (const horizontalMoveRangeItem of moveRange) {
            const targetPosition: Point = addPointToPoint(this._selectedSquere!.position, { x: horizontalMoveRangeItem, y: playerVerticalDirection });

            if (targetPosition.x < 0 || targetPosition.x > GameBoardConst.numCols - 1 || targetPosition.y < 0 || targetPosition.y > GameBoardConst.numRows - 1)
                continue;

            const targetGameSquere = this._gameBoard[targetPosition.y][targetPosition.x];
            const moveType = this.canSelectGameSquere(prevSquere, this._gameBoard[targetPosition.y][targetPosition.x]);

            switch (moveType) {
                case MovementType.Normal:
                    availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.shadow, moveType: moveType });
                    break;

                case MovementType.CaptureOnEnemy: {
                    availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.notAllowed, moveType: moveType });
                    const moveRangeDeep = addValueToArray([horizontalMoveRangeItem], 1);
                    const res = this.checkSquere(moveRangeDeep, targetGameSquere, deep + 1);

                    availableMoves.push(...res);
                }
                    break;

                case MovementType.CaptureAfterEnemy: {
                    availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.shadow, moveType: moveType });
                    const moveRangeDeep = addValueToArray([horizontalMoveRangeItem], 1);
                    const res = this.checkSquere(moveRangeDeep, targetGameSquere, deep + 1);

                    availableMoves.push(...res);
                }
                    break;

                case MovementType.Unavailable:
                    availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.notAllowed, moveType: moveType });
                    break;
            }
        }

        return availableMoves;
    }
}


interface SuggestionData {
    effect: GamePawnType;
    moveType: MovementType;
    gameSquere: GameSquere;
}