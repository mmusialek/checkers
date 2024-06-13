import { addPointToPoint } from "../GameUtils";
import { Point } from "../common/type";
import { GameBoardConst } from "./GameBoardConst";
import { GamePawnType } from "./types";


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


const normalPawns = [GamePawnType.blackPawn, GamePawnType.whitePawn, GamePawnType.notAllowed, GamePawnType.shadow];
export const getPawnYOffset = (wordPos: Point, pawnType: GamePawnType): Point => {
    const offset = normalPawns.includes(pawnType) ? -7 : -3;
    const res = addPointToPoint(wordPos, { x: 0, y: offset })
    return res;
}