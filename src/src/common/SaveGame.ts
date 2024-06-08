import { GamePawnType, PlayerType } from "../board/types";
import { SerializationHelper } from "./SerializtionHelper";
import { Point } from "./type";

const saveGameKey = "save-game-key";

export interface GameSquereSave {
    position: Point;
    pawnType: GamePawnType;
    playerType: PlayerType;
}

export interface GameSaveObject {
    board: GameSquereSave[];
    currentTurn: PlayerType;
    score: { white: number, black: number };
}

export const saveGame = (obj: GameSaveObject) => {
    SerializationHelper.serialize(saveGameKey, obj);
}

export const loadGame = (): GameSaveObject | null => {
    const save: GameSaveObject | null = SerializationHelper.deserialize(saveGameKey) as GameSaveObject;

    return save;
}

export const isSaveAvailable = () => {
    return localStorage.getItem(saveGameKey) != null;
}