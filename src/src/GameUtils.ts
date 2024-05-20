import phaser from "phaser";
import { GameBoardConst } from "./GameBoardConst";
import { GameSquere } from "./GameSquere";
import { ImageSpritesMap, ImageType, Point } from "./types";

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

export const getNewImage = (phaseAdd: phaser.GameObjects.GameObjectFactory, point: Point, type: ImageType) => {
    const { x, y } = point
    return phaseAdd.image(x, y, ImageSpritesMap[type]).setName(type);
}

export const getNewText = (phaseAdd: phaser.GameObjects.GameObjectFactory, point: Point, text: string, style?: phaser.Types.GameObjects.Text.TextStyle) => {
    const { x, y } = point

    const defaultStyles = { fontFamily: GameBoardConst.fontFamily, color: "red", fontSize: 17, fontStyle: "300" };
    const newStyle = style ? { ...defaultStyles, ...style } : defaultStyles;
    return phaseAdd.text(x, y, text, newStyle).setOrigin(.5, .5);
}



export const getDirection = (pointA: Point, pointB: Point): Point => {
    return { x: pointA.x - pointB.x, y: pointA.y - pointB.y }
}


export const addToPoint = (point: Point, value: number): Point => {
    return { x: point.x + value, y: point.y - value }
}