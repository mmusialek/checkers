import { getBoardPos } from "./GameUtils";
import { BoardSquereType, GamePawnType, Point } from "./types";
import * as phaser from "phaser";

export class GameSquere {
    private _image: phaser.GameObjects.Image | null | undefined;
    private _suggestionImage: phaser.GameObjects.Image | null | undefined;

    private readonly _wordPoint: Point;
    private _point: Point;

    private _pawnType: GamePawnType = GamePawnType.none;
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
        return this._pawnType;
    }

    get image() {
        return this._image;
    }

    get wordPosition(): Point {
        return this._wordPoint;
    }

    get position(): Point {
        return this._point;
    }

    addPawn(type: GamePawnType, image: phaser.GameObjects.Image) {
        this.removePawn();
        this.setPawnType(type);
        this.setImage(image);
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

    private setPawnType(type: GamePawnType) {
        this._pawnType = type;
    }

    private setImage(image: phaser.GameObjects.Image) {
        this._image = image;
    }

    private clearImage() {
        this.setPawnType(GamePawnType.none);
        this._image?.destroy();
        this._image = null;
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