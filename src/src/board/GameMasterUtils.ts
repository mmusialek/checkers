import { Point } from "../common/type";
import { GameBoardConst } from "./GameBoardConst";
import { GamePawnType, SuggestionData } from "./types";


export const isPawn = (pawnType?: GamePawnType) => {
    return pawnType !== null && pawnType !== undefined && [GamePawnType.blackPawn, GamePawnType.whitePawn].includes(pawnType);
}

export const isQueen = (pawnType?: GamePawnType) => {
    return pawnType !== null && pawnType !== undefined && [GamePawnType.blackQueen, GamePawnType.whiteQueen].includes(pawnType);
}

export const inGameBoardBounds = (targetPoint: Point) => {
    const tmp = targetPoint.x >= 0 && targetPoint.x <= GameBoardConst.numCols - 1 && targetPoint.y >= 0 && targetPoint.y <= GameBoardConst.numRows - 1;
    return tmp;
}

export const directionArray: Point[] = [{ x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 }];
