import { getBoardPos } from "../GameUtils";
import { AllBoardImageMap, BoardSquereType, GamePawnType, PlayerType } from "./types";
import { Point } from "../common/type";
import * as phaser from "phaser";
import { GameContext } from "../common/GameContex";

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
        const letter = String.fromCharCode(65 + this.position.x);
        const digit = 8 - this.position.y;
        const tmp = `${letter}${digit}`;
        const pos = `${tmp}\n${this._point.x}-${this._point.y}`;
        return pos;
    }

    get pawnType(): GamePawnType {
        return this._pawn?.pawnType || GamePawnType.none;
    }

    get playerType(): PlayerType | undefined {
        return this._pawn?.player;
    }

    get wordPosition(): Point {
        return this._wordPoint;
    }

    get position(): Point {
        return this._point;
    }

    evolveToQueen() {
        this.pawn?.evolveToQueen();
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
    private _player: PlayerType;

    constructor(player: PlayerType, type: GamePawnType, image: phaser.GameObjects.Image) {
        this._pawnType = type;
        this._image = image;
        this._player = player;
    }

    get pawnType(): GamePawnType {
        return this._pawnType;
    }

    get player(): PlayerType {
        return this._player;
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

    evolveToQueen() {
        if (this._pawnType === GamePawnType.none) return;

        const newType = this.player === PlayerType.white ? GamePawnType.whiteQueen : GamePawnType.blackQueen;
        this.setPawnType(newType);

        const currentImage = this._image!;
        const queenImg = GameContext.instance.currentScene.add.image(currentImage.x, currentImage.y, AllBoardImageMap[newType]);
        currentImage.destroy();
        this._image = queenImg;
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