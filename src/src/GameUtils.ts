import { GameBoardConst } from "./board/GameBoardConst";
import { GameSquere } from "./board/GameSquere";
import { Point } from "./common/type";

const offset = GameBoardConst.originOffset + GameBoardConst.boardOffset;

export const getBoardPos = (x: number, y: number) => {
    return { x: ((x * GameBoardConst.tileSize) + offset), y: ((y * GameBoardConst.tileSize) + offset) };
}

export const getArrayPos = (x: number, y: number) => {
    return { x: ((x - offset) / GameBoardConst.tileSize) || 0, y: ((y - offset) / GameBoardConst.tileSize) || 0 };
}

export const getGameSquereByCoords = (gameBoard: GameSquere[][], point: Point): GameSquere => {
    const { x, y } = getArrayPos(point.x, point.y);
    const gameSquere = gameBoard[y][x];
    return gameSquere;
}

export const getOppositeDirection = (pointA: Point, pointB: Point): Point => {
    return {
        x: Math.sign(pointA.x - pointB.x),
        y: Math.sign(pointA.y - pointB.y)
    };
}

export const addPointToPoint = (point: Point, value: Point): Point => {
    return { x: point.x + value.x, y: point.y + value.y }
}
