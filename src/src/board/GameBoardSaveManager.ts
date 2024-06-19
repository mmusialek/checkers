import { getBoardPos } from "../GameUtils";
import { GameContext } from "../common/GameContex";
import { getNewSprite } from "../common/ObjectFatory";
import { GameSaveObject, GameSquereSave, saveGame } from "../common/SaveGame";
import { BoardStats } from "./BoardStats";
import { GameBoard } from "./GameBoard";
import { GameBoardConst } from "./GameBoardConst";
import { GameMaster } from "./GameMaster";
import { getPawnYOffset } from "./GameMasterUtils";
import { GameSquere } from "./GameSquere";
import { createPawn } from "./ObjectFactory";
import { TurnManager } from "./TurnManager";
import { GamePawnType } from "./types";


export const loadData = (gameBoard: GameBoard, turnManager: TurnManager, gameMaster: GameMaster, boardStats: BoardStats, gameBoardSqueres: GameSquere[][], data: GameSaveObject): void => {
    gameMaster.scoreboard.loadData(data.score);
    turnManager.loadData(data.currentTurn);

    for (let i = 0; i < data.board.length; i++) {
        const { pawnType, position } = data.board[i];
        const { x, y } = position;
        const wordPos = getBoardPos(x, y);
        const sprite = getNewSprite(getPawnYOffset(wordPos, pawnType), pawnType).setInteractive(GameContext.instance.currentScene.input.makePixelPerfect());
        const newPawn = createPawn(gameBoard, gameMaster, sprite, pawnType, gameBoardSqueres[y][x]);
        gameBoardSqueres[y][x].addPawn(newPawn);
    }


    boardStats.updateScore(gameMaster.scoreboard.getBoard());
    boardStats.updateTurn(turnManager.currentTurn);
}

export const saveData = (turnManager: TurnManager, gameMaster: GameMaster, gameBoard: GameSquere[][]): void => {
    const flatListToSave: GameSquereSave[] = [];

    for (let row = 0; row < GameBoardConst.numRows; row++) {
        for (let col = 0; col < GameBoardConst.numCols; col++) {
            const gs = gameBoard[row][col];
            if (gs.pawnType !== GamePawnType.none && gs.playerType) {
                flatListToSave.push({ position: gs.position, pawnType: gs.pawnType, playerType: gs.playerType });
            }
        }
    }

    const { black: blackScore, white: whiteScore } = gameMaster.scoreboard.getBoard();
    saveGame({
        board: flatListToSave,
        currentTurn: turnManager.currentTurn,
        score: { white: whiteScore, black: blackScore }
    });
}
