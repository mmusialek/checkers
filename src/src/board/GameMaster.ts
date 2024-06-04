import { GameSquere } from "./GameSquere";
import { TurnManager } from "./TurnManager";
import { GameBoardConst } from "./GameBoardConst";
import { GamePawnType, MovementType, PlayerType, SquereSuggestionCaptureInfo, SuggestionData } from "./types";
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

    isSelectedSquereEqual(target: GameSquere | null) {
        if (!target) return false;

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

                const prevGameSquere = this._suggestedFields.find(q => q.gameSquere.position.x === prevPoint.x && q.gameSquere.position.y === prevPoint.y);

                if (prevGameSquere && prevGameSquere.player === this._turnManager.opponentType) {
                    prevGameSquere.gameSquere.captureEnemyPawn();
                    this._scoreBoard.incrementScore(this._turnManager.currentTurn);
                    break;
                }
                range++;
            }
        }
        this.clearSuggestions();
    }

    setSelectedPawn(pawn: GameSquere) {
        this._selectedSquere = pawn;
        this._selectedSquere.pawn?.highlight();
        this._boardStats.updateTurn(this._turnManager.currentTurn);

        this.calculateSuggestion();
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

        this.calculateSuggestion();
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

    private calculateSuggestion() {
        if (!this._selectedSquere) return;

        const captureInfo = this.checkForCaptures();
        const suggestedFields = captureInfo.currentSquere;

        const otherHasCaptureMove = captureInfo.other.some(q => q.moveType === MovementType.CaptureAfterEnemy);
        const currentHasCaptureMove = captureInfo.currentSquere.some(q => q.moveType === MovementType.CaptureAfterEnemy);
        if (otherHasCaptureMove && !currentHasCaptureMove) {
            for (const suggestedFieldItem of suggestedFields) {
                suggestedFieldItem.moveType = MovementType.Unavailable;
                suggestedFieldItem.effect = GamePawnType.notAllowed;
            }
        } else if (currentHasCaptureMove) {
            const toChange = suggestedFields.filter(q => q.moveType === MovementType.Normal);
            for (const item of toChange) {
                item.effect = GamePawnType.notAllowed;
            }
        }

        this._suggestedFields = suggestedFields;
    }

    private getSuggestions(startingSquere: GameSquere): SuggestionData[] {
        let suggestedFields: SuggestionData[] = []

        if (isPawn(startingSquere.pawnType)) {
            const lastSuggestion = this.getLastPlayerMovement();
            const horizontalDirection: number[] = [1, -1];
            const verticalDirection = (this._turnManager.currentTurn === PlayerType.black ? [1] : [-1]);

            if (lastSuggestion?.moveType === MovementType.CaptureAfterEnemy) {
                verticalDirection.push(verticalDirection[0] * -1);

            }
            suggestedFields.push(...this.checkPawnSquereSuggestion(startingSquere, horizontalDirection, verticalDirection, 1));
        }

        if (isQueen(startingSquere.pawnType)) {
            suggestedFields.push(...this.checkQueenSquereSuggestion(startingSquere, directionArray, 1));
        }

        return suggestedFields;
    }


    private checkQueenSquereSuggestion(startingSquere: GameSquere, initialMoveRange: Point[], deep: number): SuggestionData[] {
        const availableMoves: SuggestionData[] = [];

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
                if (deep > 1 && startingSquere.playerType === this._turnManager.opponentType && targetGameSquere.playerType) {
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

                if (!inGameBoardBounds(targetPosition)) continue;

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

    private checkForCaptures(): SquereSuggestionCaptureInfo {
        const otherSuggestions: SuggestionData[] = [];
        const selectedSquereSuggestions: SuggestionData[] = [];

        const currentPlayerSqueres: GameSquere[] = [];
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const gameSquere = this._gameBoard[row][col];
                if (gameSquere.playerType === this._turnManager.currentTurn)
                    currentPlayerSqueres.push(gameSquere);
            }
        }

        for (let i = 0; i < currentPlayerSqueres.length; i++) {

            const tmpSuggestions = this.getSuggestions(currentPlayerSqueres[i]);
            if (this.isSelectedSquereEqual(currentPlayerSqueres[i])) {

                selectedSquereSuggestions.push(...tmpSuggestions);
                continue;
            }

            if (tmpSuggestions.some(q => q.moveType === MovementType.CaptureAfterEnemy)) {
                otherSuggestions.push(...tmpSuggestions);
                continue;
            }
        }

        return {
            currentSquere: selectedSquereSuggestions || [],
            other: otherSuggestions || []
        };
    }
}
