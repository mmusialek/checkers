import { getBoardPos } from "../GameUtils";
import { BoardSquereType, GamePawnType } from "./types";
import { Point } from "../common/type";
import * as phaser from "phaser";

export class GameSquere {
    private _pawn: Pawn | null = null;
    private _effects: Pawn[] = [];

    private readonly _wordPoint: Point;
    private _point: Point;

    private _boardSquereType: BoardSquereType;

    constructor(row: number, col: number) {
        this._point = { x: col, y: row };
        this._boardSquereType = (this._point.x + this._point.y) % 2 === 0 ? BoardSquereType.whiteSquere : BoardSquereType.blackSquere
        this._wordPoint = getBoardPos(col, row);
    }

    get boardSquereType() {
        return this._boardSquereType;
    }

    get name(): string {
        return `${this._point.x}-${this._point.y}`;
    }

    get pawnType(): GamePawnType {
        return this._pawn?.pawnType || GamePawnType.none;
    }

    get wordPosition(): Point {
        return this._wordPoint;
    }

    get position(): Point {
        return this._point;
    }

    addEffect(pawn: Pawn) {
        this._effects.push(pawn);
    }

    removeEffects() {
        for (const item of this._effects) {
            item.removePawn();
        }
        this._effects.splice(0, this._effects.length);
    }

    hasEffect(type: GamePawnType) {
        return this._effects.some(q => q.pawnType == type);
    }

    addPawn(pawn: Pawn) {
        this._pawn = pawn;
    }

    captureEnemyPawn() {
        this._pawn?.removePawn();
        this._pawn = null;
    }

    movePawn(targetSquere: GameSquere) {
        const tmp = this._pawn;
        this._pawn = null;
        this.removeEffects();

        targetSquere.addPawn(tmp!);
        targetSquere._pawn?.move(targetSquere.wordPosition);
    }

    get pawn() {
        return this._pawn;
    }
}


export class Pawn {
    private _image: phaser.GameObjects.Image | null | undefined;

    private _pawnType: GamePawnType = GamePawnType.none;

    constructor(type: GamePawnType, image: phaser.GameObjects.Image) {
        this._pawnType = type;
        this._image = image;
    }

    get pawnType(): GamePawnType {
        return this._pawnType;
    }

    get image() {
        return this._image;
    }

    move(point: Point) {
        this.image?.setPosition(point.x, point.y);
    }

    removePawn() {
        this.clearImage();
    }

    highlight() {
        this.image?.setAlpha(0.7);
    }

    unHighlight() {
        this.image?.setAlpha(1);
    }
    private clearImage() {
        this.setPawnType(GamePawnType.none);
        this._image?.destroy();
        this._image = null;
    }

    private setPawnType(type: GamePawnType) {
        this._pawnType = type;
    }

}