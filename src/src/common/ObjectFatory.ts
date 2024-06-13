import phaser from "phaser";
import { GameBoardConst } from "../board/GameBoardConst";
import { AllBoardImageMap, ImageType } from "../board/types";
import { GameContext } from "./GameContex";
import { Point } from "./type";


export const getNewSprite = (point: Point, type: ImageType) => {
    const { x, y } = point
    return GameContext.instance.currentScene.add.sprite(x, y, AllBoardImageMap[type]).setName(type);
}

export const getNewText = (point: Point, text: string, style?: phaser.Types.GameObjects.Text.TextStyle) => {
    const { x, y } = point

    const defaultStyles = { fontFamily: GameBoardConst.fontFamily, color: "white", fontSize: 17, fontStyle: "300" };
    const newStyle = style ? { ...defaultStyles, ...style } : defaultStyles;
    return GameContext.instance.currentScene.add.text(x, y, text, newStyle).setOrigin(.5, .5);
}
