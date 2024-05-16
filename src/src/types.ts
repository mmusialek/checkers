
// export declare type GamePawnType = "white" | "black" | "shadow" | "not_allowed" | null;

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

export interface Point {
    x: number;
    y: number;
}