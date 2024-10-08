import phaser from "phaser";
import { GameSquere } from "./GameSquere";


export enum PlayerType {
    white = "white",
    black = "black",
}

export declare type BoardType = { [key in PlayerType]: number };
export type ImageType = BoardSquereType | GamePawnType | MainMenuImages | DialogTypes | "game_board";


export enum DialogTypes {
    whiteWins = "white_wins",
    blackWins = "black_wins"
}

export enum MainMenuImages {
    MainMenuBoardPiece = "main_menu_board_piece",
    MainMenuTitle = "main_menu_title"
}

export enum MovementType {
    None = "None",
    Normal = "Normal",
    CaptureOnEnemy = "CaptureOnEnemy",
    CaptureAfterEnemy = "CaptureAfterEnemy",
    AlreadyCaptured = "AlreadyCaptured",
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


export type PawnEffectType = GamePawnType.shadow | GamePawnType.notAllowed | GamePawnType.none;

export type PawnSpritesMapType = {
    [key in GamePawnType]: string;
}

export const PawnSpritesMap: PawnSpritesMapType = {
    [GamePawnType.whitePawn]: "white_pawn_sheet",
    [GamePawnType.blackPawn]: "black_pawn_sheet",
    [GamePawnType.whiteQueen]: "white_queen_sheet",
    [GamePawnType.blackQueen]: "black_queen_sheet",
    [GamePawnType.shadow]: "shadow_pawn_sheet",
    [GamePawnType.notAllowed]: "not_allowed_sheet",
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
export const AllBoardImageMap = {
    ...BoardSpriteMap, ...PawnSpritesMap,
    "game_board": "game_board",
    [MainMenuImages.MainMenuBoardPiece]: "main_menu_board_piece",
    [MainMenuImages.MainMenuTitle]: "main_menu_title",
    [DialogTypes.blackWins]: "black_wins",
    [DialogTypes.whiteWins]: "white_wins",
};


export enum GameOverType {
    None,
    NoPawns,
    NoMoves
}


//
// audio
//

export enum PawnAudioTypes {
    pawnMove0001 = "pawn_move_0001",
    pawnMove0002 = "pawn_move_0002",
    pawnMove0003 = "pawn_move_0003",
    pawnMove0004 = "pawn_move_0004",
    pawnMove0005 = "pawn_move_0005",
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
    deep: number;
    effect: GamePawnType;
    moveType: MovementType;
    gameSquere: GameSquere;
    player: PlayerType | undefined;
}

export interface SquereSuggestionCaptureInfo {
    currentSquere: SuggestionData[];
    other: SuggestionData[];
    currentPlayerSqueres: GameSquere[];
    opponentPlayerSqueres: GameSquere[];
}