import { GameBoardConst } from "./GameBoardConst";
import { GameSquere } from "./GameSquere";
import { Point } from "../common/type";

const offsetX = GameBoardConst.originOffset + GameBoardConst.boardXOffset;
const offsetY = GameBoardConst.originOffset + GameBoardConst.boardYOffset;

export const getBoardPos = (x: number, y: number) => {
    return { x: ((x * GameBoardConst.tileSize) + offsetX), y: ((y * GameBoardConst.tileSize) + offsetY) };
}

export const getArrayPos = (x: number, y: number) => {
    return { x: ((x - offsetX) / GameBoardConst.tileSize) || 0, y: ((y - offsetY) / GameBoardConst.tileSize) || 0 };
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

export const getRandomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const delayCallback = (callback: () => void, delay: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            callback();
            resolve();
        }, delay);
    });
}