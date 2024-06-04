import { GameSquere } from "./GameSquere";
import { TurnManager } from "./TurnManager";
import { GameBoardConst } from "./GameBoardConst";
import { GamePawnType, MovementType, PlayerType, SuggestionData } from "./types";
import { addPointToPoint, getOppositeDirection } from "../GameUtils";
import { ScoreBoard } from "./ScoreBoard";
import { Point } from "../common/type";
import { BoardStats } from "./BoardStats";
import { directionArray, inGameBoardBounds, isPawn, isQueen } from "./GameMasterUtils";

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
        return GameBoardConst.playerPawns.includes(target.pawnType) && this._turnManager.currentTurn === target.playerType;
    }

    canSelectGameSquere(startingSquere: GameSquere, targetSquere: GameSquere): MovementType {
        if (this._turnManager.currentTurn !== this._selectedSquere?.playerType)
            return MovementType.Unavailable;


        if (startingSquere?.playerType === this._turnManager.opponentType && targetSquere.pawnType === GamePawnType.none) {
            return MovementType.CaptureAfterEnemy;
        }
        else if (targetSquere.playerType === this._turnManager.opponentType) {
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

        const suggestion = this._suggestedFields.find(q => q.gameSquere.label === target.label);

        if (!suggestion)
            throw new Error("something went evidently in wrong way.")

        this._playerMovement.push(suggestion);


        // check if pawn can evolve
        if (this._turnManager.currentTurn === PlayerType.white && target.position.y === 0 && target.pawnType == GamePawnType.whitePawn) {
            target.evolveToQueen();
        } else if (this._turnManager.currentTurn === PlayerType.black && target.position.y === 7 && target.pawnType == GamePawnType.blackPawn) {
            target.evolveToQueen();
        }
    }

    processMovement(target: GameSquere) {

        if (this._suggestedFields.some(q => q.moveType === MovementType.CaptureAfterEnemy)) {

            // const prevGameSquere = this._gameBoard[prevPoint.y][prevPoint.x];

            let canContinue = true;
            let range = 1;
            const direction = getOppositeDirection(this.selectedSquere!.position, target.position);
            while (canContinue) {
                const directionPoint = { x: direction.x * range, y: direction.y * range };
                const prevPoint = addPointToPoint(target.position, directionPoint);

                if (!inGameBoardBounds(prevPoint)) {
                    canContinue = false;
                    break;
                }

                // const prevGameSquere = this._gameBoard[prevPoint.y][prevPoint.x];
                const prevGameSquere = this._suggestedFields.find(q => q.gameSquere.position.x === prevPoint.x && q.gameSquere.position.y === prevPoint.y);

                if (prevGameSquere && prevGameSquere.player === this._turnManager.opponentType) {
                    prevGameSquere.gameSquere.captureEnemyPawn();
                    // prevGameSquere.captureEnemyPawn();
                    this._scoreBoard.incrementScore(this._turnManager.currentTurn);
                    break;
                }
                range++;
            }
        }

        // const suggestion = this.getLastPlayerMovement();

        // if (suggestion.moveType === MovementType.CaptureAfterEnemy) {
        //     const direction = getOppositeDirection(this.selectedSquere!.position, target.position);
        //     const prevPoint = addPointToPoint(target.position, direction);
        //     const prevGameSquere = this._gameBoard[prevPoint.y][prevPoint.x];

        //     prevGameSquere.captureEnemyPawn();
        //     this._scoreBoard.incrementScore(this._turnManager.currentTurn);
        // }

        this.clearSuggestions();
    }

    setSelectedPawn(pawn: GameSquere) {
        this._selectedSquere = pawn;
        this._selectedSquere.pawn?.highlight();
        this._boardStats.updateTurn(this._turnManager.currentTurn);

        this.getSuggestion();
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

        this.getSuggestion();
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

    private getSuggestion() {
        if (!this._selectedSquere) return;

        let suggestedFields: SuggestionData[] = []

        if (isPawn(this.selectedSquere?.pawnType)) {
            const lastSuggestion = this.getLastPlayerMovement();
            const horizontalDirection: number[] = [1, -1];
            const verticalDirection = (this._turnManager.currentTurn === PlayerType.black ? [1] : [-1]);

            if (lastSuggestion?.moveType === MovementType.CaptureAfterEnemy) {
                verticalDirection.push(verticalDirection[0] * -1);

            }
            suggestedFields.push(...this.checkPawnSquereSuggestion(this._selectedSquere, horizontalDirection, verticalDirection, 1));
        }

        if (isQueen(this.selectedSquere?.pawnType)) {
            suggestedFields.push(...this.checkQueenSquereSuggestion(this._selectedSquere, directionArray, 1));
        }


        // capturing has priority, so check if any and disable other moves
        if (suggestedFields.some(q => q.moveType === MovementType.CaptureAfterEnemy)) {
            const toChange = suggestedFields.filter(q => q.moveType === MovementType.Normal);
            for (const item of toChange) {
                item.effect = GamePawnType.notAllowed;
            }
        }

        this._suggestedFields = suggestedFields;
    }

    private checkQueenSquereSuggestion(startingSquere: GameSquere, initialMoveRange: Point[], deep: number): SuggestionData[] {
        const availableMoves: SuggestionData[] = [];

        // if (deep === 3)
        //     return availableMoves;

        let canProcess = true;
        let range = 1;

        for (const directionMoveItem of initialMoveRange) {
            range = 1;
            canProcess = true;

            while (canProcess) {
                const horizontalMoveRangeItem = (directionMoveItem.x * range);
                const vertivalMoveRangeItem = (directionMoveItem.y * range);
                const targetPosition: Point = addPointToPoint(startingSquere!.position, { x: horizontalMoveRangeItem, y: vertivalMoveRangeItem });


                if (!inGameBoardBounds(targetPosition)) {
                    break;
                }

                const targetGameSquere = this._gameBoard[targetPosition.y][targetPosition.x];
                const moveType = this.canSelectGameSquere(startingSquere, targetGameSquere);

                const playerType = targetGameSquere.playerType!;
                const nextDeep = deep + 1;


                // cann't jump over 2 enemies
                if (startingSquere.playerType === this._turnManager.opponentType && targetGameSquere.playerType === this._turnManager.opponentType) {
                    canProcess = false;
                    break;
                }

                switch (moveType) {
                    case MovementType.Normal:
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.shadow, moveType: moveType, player: playerType });
                        break;

                    case MovementType.CaptureOnEnemy:
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.notAllowed, moveType: moveType, player: playerType });
                        const childRes = this.checkQueenSquereSuggestion(targetGameSquere, [directionMoveItem], nextDeep);
                        availableMoves.push(...childRes);
                        canProcess = false;
                        break;

                    case MovementType.CaptureAfterEnemy:
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.shadow, moveType: moveType, player: playerType });
                        break;

                    case MovementType.Unavailable:
                    default:
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.notAllowed, moveType: moveType, player: playerType });
                        break;
                }

                range++;
            }
        }

        return availableMoves;
    }

    private checkPawnSquereSuggestion(startingSquere: GameSquere, horizontalMoveRange: number[], verticalMoveRange: number[], deep: number): SuggestionData[] {
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
                const playerType = targetGameSquere?.playerType!;
                const nextDeep = deep + 1;

                switch (moveType) {
                    case MovementType.Normal:
                        const lastSuggestion = this._playerMovement[this._playerMovement.length - 1]
                        if (lastSuggestion?.moveType === MovementType.CaptureAfterEnemy)
                            continue
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.shadow, moveType: moveType, player: playerType });
                        break;

                    case MovementType.CaptureOnEnemy:
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.notAllowed, moveType: moveType, player: playerType });
                        const childRes = this.checkPawnSquereSuggestion(targetGameSquere, [horizontalMoveRangeItem], [vertivalMoveRangeItem], nextDeep);
                        availableMoves.push(...childRes);

                        break;

                    case MovementType.CaptureAfterEnemy:
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.shadow, moveType: moveType, player: playerType });
                        break;

                    case MovementType.Unavailable:
                    default:
                        availableMoves.push({ gameSquere: targetGameSquere, effect: GamePawnType.notAllowed, moveType: moveType, player: playerType });
                        break;
                }
            }
        }


        return availableMoves;
    }
}
