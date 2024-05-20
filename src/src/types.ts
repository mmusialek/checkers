
// export declare type GamePawnType = "white" | "black" | "shadow" | "not_allowed" | null;

import phaser from "phaser";

export type ImageType = BoardSquereType | GamePawnType;

export enum BoardSquereType {
    blackSquere = "black_squere",
    whiteSquere = "white_squere"
}

export enum GamePawnType {
    none = "none",
    white = "white",
    black = "black",
    shadow = "shadow",
    notAllowed = "notAllowed",
}

export type PawnSpritesMapType = {
    [key in GamePawnType]: string;
}

export const PawnSpritesMap: PawnSpritesMapType = {
    [GamePawnType.white]: "white_pawn",
    [GamePawnType.black]: "black_pawn",
    [GamePawnType.shadow]: "shadow_pawn",
    [GamePawnType.notAllowed]: "not_allowed",
    [GamePawnType.none]: "NONE_NOTHING_HERE"
}

export type ImageSpritesMapType = {
    [key in ImageType]: string;
}

export const ImageSpritesMap: ImageSpritesMapType = {
    [GamePawnType.white]: "white_pawn",
    [GamePawnType.black]: "black_pawn",
    [GamePawnType.shadow]: "shadow_pawn",
    [GamePawnType.notAllowed]: "not_allowed",
    [GamePawnType.none]: "NONE_NOTHING_HERE",
    [BoardSquereType.blackSquere]: "black_squere",
    [BoardSquereType.whiteSquere]: "white_squere",
}

export interface Point {
    x: number;
    y: number;
}


export interface IPhaserScene {
    add: phaser.GameObjects.GameObjectFactory;
    input: phaser.Input.InputPlugin;
}

export interface IGameLoopObject {
    create(): void;
    update(time: number, delta: number): void;
}
