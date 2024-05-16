import { GameBoardConst } from "./GameBoardConst";

export const getBoardPos = (x: number, y: number) => {
    return { x: ((x * GameBoardConst.tileSize) + GameBoardConst.originOffset), y: ((y * GameBoardConst.tileSize) + GameBoardConst.originOffset) };
}

export const getArrayPos = (x: number, y: number) => {
    return { x: ((x - GameBoardConst.originOffset) / GameBoardConst.tileSize) || 0, y: ((y - GameBoardConst.originOffset) / GameBoardConst.tileSize) || 0 };
}
