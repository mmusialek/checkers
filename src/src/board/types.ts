import phaser from "phaser";
import { GameSquere } from "./GameSquere";


export enum PlayerType {
    white = "white",
    black = "black",
}

export declare type BoardType = { [key in PlayerType]: number };
export type ImageType = BoardSquereType | GamePawnType | "game_board";


export enum MovementType {
    None = "None",
    Normal = "Normal",
    CaptureOnEnemy = "CaptureOnEnemy",
    CaptureAfterEnemy = "CaptureAfterEnemy",
    Unavailable = "Unavailable",
}

export enum GamePawnType {
    none = "none",
    whitePawn = "white_pawn",
    whiteQueen = "white_queen",
    blackPawn = "black_pawn",
    blackQueen = "black_queen",
    shadow = "shadow",
    notAllowed = "notAllowed",
}

export type PawnSpritesMapType = {
    [key in GamePawnType]: string;
}

export const PawnSpritesMap: PawnSpritesMapType = {
    [GamePawnType.whitePawn]: "white_pawn",
    [GamePawnType.blackPawn]: "black_pawn",
    [GamePawnType.whiteQueen]: "white_queen",
    [GamePawnType.blackQueen]: "black_queen",
    [GamePawnType.shadow]: "shadow_pawn",
    [GamePawnType.notAllowed]: "not_allowed",
    [GamePawnType.none]: "NONE_NOTHING_HERE"
}

export type BoardSpriteType = {
    [key in BoardSquereType]: string;
}

export enum BoardSquereType {
    blackSquere = "black_squere",
    whiteSquere = "white_squere"
}

export const BoardSpriteMap: BoardSpriteType = {
    [BoardSquereType.blackSquere]: "black_squere",
    [BoardSquereType.whiteSquere]: "white_squere",
}

export const AllBoardImageValues = [...Object.values(BoardSpriteMap), ...Object.values(PawnSpritesMap)];
export const AllBoardImageMap = { ...BoardSpriteMap, ...PawnSpritesMap, "game_board": "game_board" };


export enum GameOverType {
    None,
    NoPawns,
    NoMoves
}

//
// interfaces
//

export interface IPhaserScene {
    add: phaser.GameObjects.GameObjectFactory;
    input: phaser.Input.InputPlugin;
}

export interface IGameLoopObject {
    init?: (data?: object) => void;
    create?: () => void;
    update?: (time: number, delta: number) => void;
}


export interface SuggestionData {
    effect: GamePawnType;
    moveType: MovementType;
    gameSquere: GameSquere;
    player: PlayerType | undefined;
}

export interface SquereSuggestionCaptureInfo {
    currentSquere: SuggestionData[];
    other: SuggestionData[];
    currentPlayerSqueres: GameSquere[];
}