import { GameSquere } from "./GameSquere";
import { TurnManager } from "./TurnManager";
import { GameBoardConst } from "./GameBoardConst";
import { GamePawnType, MovementType, SuggestionData } from "./types";
import { addPointToPoint, getOppositeDirection } from "../GameUtils";
import { ScoreBoard } from "./ScoreBoard";
import { Point } from "../common/type";
import { BoardStats } from "./BoardStats";

export class GameMaster {
    private readonly _gameBoard: GameSquere[][];
    private readonly _turnManager: TurnManager;
    private readonly _scoreBoard: ScoreBoard;
    private readonly _boardStats: BoardStats;
    private _selectedSquere: GameSquere | null = null;
    private _suggestedFields: SuggestionData[] = [];

    private _playerMovement: SuggestionData[] = [];

    constructor(gameBoard: GameSquere[][], turnManager: TurnManager, boardStats: BoardStats) {
        this._gameBoard = gameBoard;
        this._scoreBoard = new ScoreBoard();
        this._turnManager = turnManager;
        this._boardStats = boardStats;
    }

    get selectedSquere(): GameSquere | null {
        return this._selectedSquere;
    }

    get scoreboard(): ScoreBoard {
        return this._scoreBoard;
    }

    // public methods

    clear() {
        this.clearSelectedPawn();
        this.clearPlayerMovement();
        this.scoreboard.clear();
    }

    getBoard = () => {
        return this._scoreBoard.getBoard();
    }

    getSuggestion4Field(target: GameSquere) {
        const field = this._suggestedFields.find(q => q.gameSquere.position.x === target.position.x && q.gameSquere.position.y === target.position.y);

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

    canSelectGameSquere(startingSquere: GameSquere, targetSquere: GameSquere): MovementType {
        if (this._turnManager.currentTurn !== this._selectedSquere?.pawnType)
            return MovementType.Unavailable;


        if (targetSquere.pawnType === GamePawnType.none && startingSquere?.pawnType === this._turnManager.opponentType) {
            return MovementType.CaptureAfterEnemy;
        }
        else if (targetSquere.pawnType === this._turnManager.opponentType) {
            return MovementType.CaptureOnEnemy;
        }
        else if (targetSquere.pawnType === GamePawnType.none) {
            return MovementType.Normal;
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

    moveSelectedPawn(target: GameSquere) {
        this._selectedSquere!.movePawn(target);

        const suggestion = this._suggestedFields.find(q => q.gameSquere.name === target.name);

        if (!suggestion)
            throw new Error("something went evidently in wrong way.")

        this._playerMovement.push(suggestion);
    }

    processMovement(target: GameSquere) {
        const suggestion = this.getLastPlayerMovement();

        if (suggestion.moveType === MovementType.CaptureAfterEnemy) {
            const direction = getOppositeDirection(this.selectedSquere!.position, target.position);
            const prevPoint = addPointToPoint(target.position, direction);
            const prevGameSquere = this._gameBoard[prevPoint.y][prevPoint.x];
            prevGameSquere.captureEnemyPawn();
            this._scoreBoard.incrementScore(this._turnManager.currentTurn);
        }

        this.clearSuggestions();
    }

    setSelectedPawn(pawn: GameSquere) {
        this._selectedSquere = pawn;
        this._selectedSquere.pawn?.highlight();
        this._boardStats.updateTurn(this._turnManager.currentTurn);

        this.getPawnSuggestion();
    }


    clearSelectedPawn() {
        this._selectedSquere?.pawn?.unHighlight();
        this._selectedSquere = null;
        this.clearSuggestions();
        this._boardStats.updateTurn(this._turnManager.currentTurn);
    }

    clearSuggestions() {
        this._suggestedFields.splice(0, this._suggestedFields?.length);
    }

    clearPlayerMovement() {
        this._playerMovement.splice(0, this._playerMovement?.length);
    }


    checkAnyMovementLeft(currentSquere: GameSquere): boolean {
        this._selectedSquere = currentSquere;
        const lastSuggestion = this.getLastPlayerMovement();

        if (!lastSuggestion || lastSuggestion?.moveType === MovementType.Normal) {
            return false;
        }

        this.getPawnSuggestion();
        const canMove = this._suggestedFields.some(q => q.moveType === MovementType.CaptureAfterEnemy);
        if (!canMove) {
            this.clearSuggestions();
        }

        return canMove;
    }

    //helper methods

    private getLastPlayerMovement() {
        const lastSuggestion = this._playerMovement[this._playerMovement.length - 1];
        return lastSuggestion;
    }

    private getPawnSuggestion() {
        if (!this._selectedSquere) return;

        const horizontalDirection: number[] = [1, -1];
        const verticalDirection = (this._turnManager.currentTurn === GamePawnType.black ? [1] : [-1]);


        const lastSuggestion = this.getLastPlayerMovement();

        if (lastSuggestion?.moveType === MovementType.CaptureAfterEnemy) {
            verticalDirection.push(verticalDirection[0] * -1);
        }

        const suggestedFields = this.checkSquere(this._selectedSquere, horizontalDirection, verticalDirection, 1)

        // capturing has priority, so check if any and disable other moves
        if (suggestedFields.some(q => q.moveType === MovementType.CaptureAfterEnemy)) {
            const toChange = suggestedFields.filter(q => q.moveType === MovementType.Normal);
            for (const item of toChange) {
                item.effect = GamePawnType.notAllowed;
            }
        }

        this._suggestedFields = suggestedFields;
    }

    private checkSquere(startingSquere: GameSquere, horizontalMoveRange: number[], verticalMoveRange: number[], deep: number): SuggestionData[] {
        const availableMoves: SuggestionData[] = [];

        if (deep === 3)
            return availableMoves;

        for (const vertivalMoveRangeItem of verticalMoveRange) {
            for (const horizontalMoveRangeItem of horizontalMoveRange) {
                const targetPosition: Point = addPointToPoint(startingSquere!.position, { x: horizontalMoveRangeItem, y: vertivalMoveRangeItem });

                if (targetPosition.x < 0 || targetPosition.x > GameBoardConst.numCols - 1 || targetPosition.y < 0 || targetPosition.y > GameBoardConst.numRows - 1)
                    continue;

                const targetGameSquere = this._gameBoard[targetPosition.y][targetPosition.x];
                const moveType = this.canSelectGameSquere(startingSquere, targetGameSquere);
                const nextDeep = deep + 1;

                switch (moveType) {
                    case MovementType.Normal:
                        const lastSuggestion = this._playerMovement[this._playerMovement.length - 1]
                        if (lastSuggestion?.moveType === MovementType.CaptureAfterEnemy)
                            continue
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.shadow, moveType: moveType });
                        break;

                    case MovementType.CaptureOnEnemy:
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.notAllowed, moveType: moveType });
                        const childRes = this.checkSquere(targetGameSquere, [horizontalMoveRangeItem], [vertivalMoveRangeItem], nextDeep);
                        availableMoves.push(...childRes);

                        break;

                    case MovementType.CaptureAfterEnemy:
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.shadow, moveType: moveType });
                        break;

                    case MovementType.Unavailable:
                    default:
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.notAllowed, moveType: moveType });
                        break;
                }
            }
        }


        return availableMoves;
    }
}
