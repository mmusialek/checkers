import { GameBoardConst } from "./GameBoardConst";

const offset = GameBoardConst.originOffset + GameBoardConst.boardOffset;

export const getBoardPos = (x: number, y: number) => {
    return { x: ((x * GameBoardConst.tileSize) + offset), y: ((y * GameBoardConst.tileSize) + offset) };
}

export const getArrayPos = (x: number, y: number) => {
    return { x: ((x - offset) / GameBoardConst.tileSize) || 0, y: ((y - offset) / GameBoardConst.tileSize) || 0 };
}
