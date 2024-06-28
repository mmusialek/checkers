import { Point } from "../common/type";
import { GameBoardConst } from "./GameBoardConst";
import { DialogTypes, GamePawnType, PlayerType } from "./types";


export const isPawn = (pawnType?: GamePawnType) => {
    return pawnType !== null && pawnType !== undefined && [GamePawnType.blackPawn, GamePawnType.whitePawn].includes(pawnType);
}

export const isQueen = (pawnType?: GamePawnType) => {
    return pawnType !== null && pawnType !== undefined && [GamePawnType.blackQueen, GamePawnType.whiteQueen].includes(pawnType);
}

export const inGameBoardBounds = (targetPoint: Point) => {
    const tmp = targetPoint.x >= 0 && targetPoint.x <= GameBoardConst.numCols - 1 && targetPoint.y >= 0 && targetPoint.y <= GameBoardConst.numRows - 1;
    return tmp;
}

export const getPlayerType = (pawnType: GamePawnType): PlayerType | null => {
    switch (pawnType) {
        case GamePawnType.blackPawn:
        case GamePawnType.blackQueen:
            return PlayerType.black

        case GamePawnType.whitePawn:
        case GamePawnType.whiteQueen:
            return PlayerType.white

        default:
            return null;
    }
}

export const directionArray: Point[] = [{ x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 }];


export const getAnimatonName = (pawnType: GamePawnType) => {
    switch (pawnType) {
        case GamePawnType.blackPawn:
            return "black_pawn_anim";

        case GamePawnType.whitePawn:
            return "white_pawn_anim";

        case GamePawnType.blackQueen:
            return "black_queen_anim";

        case GamePawnType.whiteQueen:
            return "white_queen_anim";

        case GamePawnType.shadow:
            return "shadow_pawn_anim";

        case GamePawnType.notAllowed:
            return "not_allowed_anim";
    }
}

export const getWinnerDialog = (player: PlayerType): DialogTypes => {

    switch (player) {
        case PlayerType.black:
            return DialogTypes.blackWins;

        case PlayerType.white:
            return DialogTypes.whiteWins;
    }
}
