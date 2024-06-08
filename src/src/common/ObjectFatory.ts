import phaser from "phaser";
import { GameBoardConst } from "../board/GameBoardConst";
import { AllBoardImageMap, ImageType } from "../board/types";
import { Button } from "../uiComponents/Button";
import { ButtonLabel } from "../uiComponents/ButtonLabel";
import { GameContext } from "./GameContex";
import { Point } from "./type";


export const createMenuButtonLabel = (position: Point, buttonLabel: string): ButtonLabel => {
    const sceneAdd = GameContext.instance.currentScene.add;
    const textImg = sceneAdd.text(position.x, position.y, "").setOrigin(.5, .5);
    const bgImg = sceneAdd.image(position.x, position.y, "menu_button");

    const mmButton = new ButtonLabel();
    mmButton.setData({ bgImg: bgImg, text: buttonLabel, textImg: textImg });
    return mmButton;
}

export const createMenuButton = (position: Point, buttonLabel: string, onClickHandler: () => void): Button => {
    const sceneAdd = GameContext.instance.currentScene.add;
    const textImg = sceneAdd.text(position.x, position.y, "").setOrigin(.5, .5);
    const bgImg = sceneAdd.image(position.x, position.y, "menu_button");
    const bgHoverImg = sceneAdd.image(position.x, position.y, "menu_button_hover");

    const mmButton = new Button();
    mmButton.setData({ bgImg: bgImg, bgHoverImg: bgHoverImg, text: buttonLabel, textImg: textImg, onClick: onClickHandler });
    return mmButton;
}

export const getNewImage = (point: Point, type: ImageType) => {
    const { x, y } = point
    return GameContext.instance.currentScene.add.image(x, y, AllBoardImageMap[type]).setName(type);
}

export const getNewText = (point: Point, text: string, style?: phaser.Types.GameObjects.Text.TextStyle) => {
    const { x, y } = point

    const defaultStyles = { fontFamily: GameBoardConst.fontFamily, color: "white", fontSize: 17, fontStyle: "300" };
    const newStyle = style ? { ...defaultStyles, ...style } : defaultStyles;
    return GameContext.instance.currentScene.add.text(x, y, text, newStyle).setOrigin(.5, .5);
}
