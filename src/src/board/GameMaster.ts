import { GameSquere } from "./GameSquere";
import { TurnManager } from "./TurnManager";
import { GameBoardConst } from "./GameBoardConst";
import { GameOverType, GamePawnType, MovementType, PlayerType, SquereSuggestionCaptureInfo, SuggestionData } from "./types";
import { addPointToPoint, getOppositeDirection } from "../GameUtils";
import { ScoreBoard } from "./ScoreBoard";
import { Point } from "../common/type";
import { BoardStats } from "./BoardStats";
import { directionArray, inGameBoardBounds, isPawn, isQueen } from "./GameMasterUtils";
import { EventTypes, eventsCenter } from "../common/EventCenter";

export class GameMaster {
    private readonly _gameBoard: GameSquere[][];
    private readonly _turnManager: TurnManager;
    private readonly _scoreBoard: ScoreBoard;
    private readonly _boardStats: BoardStats;
    private _selectedSquere: GameSquere | null = null;
    private _suggestedFields: SuggestionData[] = [];

    private _playerMovement: SuggestionData[] = [];
    private _currentCaptures: GameSquere[] = [];

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
        return this._turnManager.currentTurn === target.playerType && (this._currentCaptures.length === 0 || this._currentCaptures.some(q => q.playerType !== this._turnManager.opponentType));
    }

    canSelectGameSquere(startingSquere: GameSquere, targetSquere: GameSquere): MovementType {
        if (this._turnManager.currentTurn !== this._selectedSquere?.playerType)
            return MovementType.Unavailable;

        if (startingSquere?.playerType === this._turnManager.opponentType && targetSquere.pawnType === GamePawnType.none) {
            return MovementType.CaptureAfterEnemy;
        }
        else if (targetSquere.playerType === this._turnManager.opponentType && this._currentCaptures.some(q => q.name === targetSquere.name)) {
            return MovementType.AlreadyCaptured;
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
                    this.addCapture(prevGameSquere.gameSquere);
                    break;
                }
                range++;
            }
        }
        this.clearSuggestions();
    }


    finishTurn() {
        this.processCaptures();

        // check if pawn can evolve
        if (this._turnManager.currentTurn === PlayerType.white && this._selectedSquere?.position.y === 0 && this._selectedSquere.pawnType == GamePawnType.whitePawn) {
            this._selectedSquere.evolveToQueen();
        } else if (this._turnManager.currentTurn === PlayerType.black && this._selectedSquere?.position.y === 7 && this._selectedSquere?.pawnType == GamePawnType.blackPawn) {
            this._selectedSquere.evolveToQueen();
        }

        const info = this.calculateSuggestion();
        this.checkForGameOver(info);
        this._turnManager.finishTurn();
        this.clearSelectedPawn();
        this.clearPlayerMovement();
    }

    setSelectedPawn(pawn: GameSquere) {
        this._selectedSquere = pawn;
        this._selectedSquere.pawn?.highlight();
        this._boardStats.updateTurn(this._turnManager.currentTurn);

        this.calculateSuggestion();
    }


    clearSelectedPawn() {
        this._selectedSquere?.pawn?.unHighlight();
        this._selectedSquere?.removeEffects()
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

        const info = this.calculateSuggestion();

        // can process movement if any enemy captures left which have not been previously captured
        let canMove = false;
        const captureMoves = this._suggestedFields.filter(q => q.moveType === MovementType.CaptureAfterEnemy);
        for (const captureMoveItem of captureMoves) {
            if (captureMoveItem) {
                const captureEnemySquereIndex = this._suggestedFields.indexOf(captureMoveItem);
                const captureEnemySquere = this._suggestedFields[captureEnemySquereIndex - 1];
                if (captureEnemySquere?.moveType === MovementType.CaptureOnEnemy) {
                    canMove = true;
                    break;
                }
            }
        }

        // check if game over
        this.checkForGameOver(info);


        if (!canMove) {
            this.clearSuggestions();
        }

        return canMove;
    }

    //helper methods

    private addCapture(gameSquere: GameSquere) {
        if (this._currentCaptures.length === 0 || !this._currentCaptures.map(q => q.name).includes(gameSquere.name))
            this._currentCaptures.push(gameSquere);
    }

    private processCaptures() {
        for (const item of this._currentCaptures) {
            item.captureEnemyPawn();
            this._scoreBoard.incrementScore(this._turnManager.currentTurn);
        }
        this._currentCaptures.splice(0, this._currentCaptures.length);
    }

    private getLastPlayerMovement() {
        const lastSuggestion = this._playerMovement[this._playerMovement.length - 1];
        return lastSuggestion;
    }

    private calculateSuggestion(): SquereSuggestionCaptureInfo | null {
        if (!this._selectedSquere) return null;

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

        return captureInfo;
    }

    private getSuggestions(startingSquere: GameSquere): SuggestionData[] {
        const suggestedFields: SuggestionData[] = []

        const initialMoveRange = [];

        if (isPawn(startingSquere.pawnType)) {
            const lastSuggestion = this.getLastPlayerMovement();
            const verticalDirection = (this._turnManager.currentTurn === PlayerType.black ? 1 : -1);

            initialMoveRange.push({ x: 1, y: verticalDirection }, { x: -1, y: verticalDirection });
            if (lastSuggestion?.moveType === MovementType.CaptureAfterEnemy) {
                initialMoveRange.push({ x: 1, y: verticalDirection * -1 });
                initialMoveRange.push({ x: -1, y: verticalDirection * -1 });
            }

        } else if (isQueen(startingSquere.pawnType)) {
            initialMoveRange.push(...directionArray)
        }

        suggestedFields.push(...this.checkSquereSuggestion(startingSquere, startingSquere, initialMoveRange, 1));

        return suggestedFields;
    }

    private checkSquereSuggestion(initialSquere: GameSquere, startingSquere: GameSquere, initialMoveRange: Point[], deep: number): SuggestionData[] {
        const availableMoves: SuggestionData[] = [];

        let canProcess = true;
        let range = 1;


        const createAvailableMove = (targetGameSquere: GameSquere, effect: GamePawnType, moveType: MovementType, playerType: PlayerType) => {
            const tmp: SuggestionData = {
                gameSquere: targetGameSquere,
                effect: effect,
                moveType: moveType,
                player: playerType,
            };

            return tmp;
        }


        for (const directionMoveItem of initialMoveRange) {
            range = 1;
            canProcess = true;

            while (canProcess) {
                const pointToAdd: Point = { x: (directionMoveItem.x * range), y: (directionMoveItem.y * range) }
                const targetPosition: Point = addPointToPoint(startingSquere!.position, pointToAdd);

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

                if (isPawn(initialSquere.pawnType)) {
                    if (range > 1)
                        break;
                }


                switch (moveType) {
                    case MovementType.Normal:
                        if (isPawn(initialSquere.pawnType)) {
                            const lastSuggestion = this._playerMovement[this._playerMovement.length - 1]
                            if (lastSuggestion?.moveType === MovementType.CaptureAfterEnemy)
                                break;
                        }
                        availableMoves.push(createAvailableMove(targetGameSquere, GamePawnType.shadow, moveType, playerType));
                        break;

                    case MovementType.CaptureOnEnemy:
                    case MovementType.AlreadyCaptured: {
                        availableMoves.push(createAvailableMove(targetGameSquere, GamePawnType.notAllowed, moveType, playerType));
                        const childRes = this.checkSquereSuggestion(initialSquere, targetGameSquere, [directionMoveItem], nextDeep);
                        availableMoves.push(...childRes);
                    }
                        break;

                    case MovementType.CaptureAfterEnemy:
                        {
                            availableMoves.push(createAvailableMove(targetGameSquere, GamePawnType.shadow, moveType, playerType));

                            if (isPawn(initialSquere.pawnType)) {
                                const newDirectionArray = directionArray.filter(q => q.x !== directionMoveItem.x * -1 || q.y !== directionMoveItem.y * -1);
                                const childRes = this.checkSquereSuggestion(initialSquere, targetGameSquere, newDirectionArray, nextDeep);
                                availableMoves.push(...childRes);
                            }
                        }
                        break;

                    case MovementType.Unavailable:
                    default:
                        availableMoves.push(createAvailableMove(targetGameSquere, GamePawnType.notAllowed, moveType, playerType));
                        break;
                }

                range++;
            }
        }

        return availableMoves;
    }

    private checkForCaptures(): SquereSuggestionCaptureInfo {
        const otherSuggestions: SuggestionData[] = [];
        const selectedSquereSuggestions: SuggestionData[] = [];

        const currentPlayerSqueres: GameSquere[] = [];
        const opponentPlayerSqueres: GameSquere[] = [];
        for (let row = 0; row < GameBoardConst.numRows; row++) {
            for (let col = 0; col < GameBoardConst.numCols; col++) {
                const gameSquere = this._gameBoard[row][col];
                if (gameSquere.playerType === this._turnManager.currentTurn)
                    currentPlayerSqueres.push(gameSquere);
                else if (gameSquere.playerType === this._turnManager.opponentType)
                    opponentPlayerSqueres.push(gameSquere);
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
            other: otherSuggestions || [],
            currentPlayerSqueres,
            opponentPlayerSqueres
        };
    }

    private checkForGameOver(currentMoveInfo: SquereSuggestionCaptureInfo | null): GameOverType {

        let res = GameOverType.None;

        if (!currentMoveInfo) return res;

        if (currentMoveInfo.currentPlayerSqueres.length === 0) {
            res = GameOverType.NoPawns;
        }

        if (currentMoveInfo.opponentPlayerSqueres.length === 0) {
            res = GameOverType.NoPawns;
        }

        const allowedMoves = [MovementType.CaptureAfterEnemy, MovementType.Normal];


        const allMoves: SuggestionData[] = [];
        allMoves.push(...currentMoveInfo.currentSquere, ...currentMoveInfo.other);
        const anyMovesLeft = allMoves.reduce((prev, curr) => {
            const tmp = prev || allowedMoves.includes(curr.moveType);
            return tmp;
        }, true);

        if (!anyMovesLeft) {
            res = GameOverType.NoMoves;
        }

        // TODO detect if no moves because pawns stuck

        if (res !== GameOverType.None) {
            eventsCenter.emit(EventTypes.gameOver);
        }

        return res;
    }
}
