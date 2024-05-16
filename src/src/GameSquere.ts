import { getBoardPos } from "./GameUtils";
import { GamePawnType, Point } from "./types";
import * as phaser from "phaser";

export class GameSquere {
    private _image: phaser.GameObjects.Image | null | undefined;

    private readonly _wordPoint: Point;
    private _point: Point;

    private _pawnType: GamePawnType = GamePawnType.none;

    constructor(row: number, col: number) {
        this._point = { x: col, y: row };
        this._wordPoint = getBoardPos(col, row);
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
        this.setPawnType(type);
        this.setImage(image);
    }

    changePawn(type: GamePawnType, image: phaser.GameObjects.Image) {
        this.removePawn();
        this.setPawnType(type);
        this.setImage(image);
    }

    removePawn() {
        this.setPawnType(GamePawnType.none);
        this.clearImage();
    }

    select() {
        this.image?.setAlpha(0.7);
    }

    unselect() {
        this.image?.setAlpha(1);
    }

    private setPawnType(type: GamePawnType) {
        this._pawnType = type;
    }

    private setImage(image: phaser.GameObjects.Image) {
        this._image = image;
    }

    private clearImage() {
        this._image?.destroy(true);
        this._image = null;
    }
}
