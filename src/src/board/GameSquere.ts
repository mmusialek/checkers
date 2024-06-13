import { getBoardPos } from "../GameUtils";
import {
    BoardSquereType,
    GamePawnType,
    PlayerType,
} from "./types";
import { Point } from "../common/type";
import * as phaser from "phaser";
import { GameContext } from "../common/GameContex";
import { GameBoardConst } from "./GameBoardConst";
import { getPawnYOffset } from "./GameMasterUtils";
import { getNewSprite } from "../common/ObjectFatory";


interface GameSquereHandlersProps {
    onPointerDown?: (squere: GameSquere) => void;
    onPointerOver?: (squere: GameSquere) => void;
    onPointerOut?: (squere: GameSquere) => void;
}

interface GameSquereParams {
    row: number;
    col: number;
    handlers?: GameSquereHandlersProps;
}

export class GameSquere {
    private _pawn: Pawn | null = null;
    private _effect: Pawn | null = null;

    private readonly _wordPoint: Point;
    private _point: Point;
    private _boardSquereType: BoardSquereType;
    private readonly _rectangle: phaser.GameObjects.Rectangle;

    private _onPointerDown?: (squere: GameSquere) => void;
    private _onPointerOver?: (squere: GameSquere) => void;
    private _onPointerOut?: (squere: GameSquere) => void;
    private _isMouseOver: boolean = false;

    private constructor({ row, col, handlers }: GameSquereParams) {
        this._point = { x: col, y: row };
        this._boardSquereType =
            (this._point.x + this._point.y) % 2 === 0
                ? BoardSquereType.whiteSquere
                : BoardSquereType.blackSquere;

        this._wordPoint = getBoardPos(col, row);
        this._rectangle = this.createGameSquereRectangle();

        this._onPointerDown = handlers?.onPointerDown;
        this._onPointerOver = handlers?.onPointerOver;
        this._onPointerOut = handlers?.onPointerOut;

        this.bindHandlers();
    }

    get boardSquereType() {
        return this._boardSquereType;
    }

    get label(): string {
        const tmp = this.name;
        const pos = `${tmp}\n${this._point.x}-${this._point.y}`;
        return pos;
    }

    get name(): string {
        const letter = String.fromCharCode(65 + this.position.x);
        const digit = 8 - this.position.y;
        return `${letter}${digit}`;
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

    //
    // methods
    //

    static new(params: GameSquereParams) {
        const gs = new GameSquere(params);

        return gs;
    }

    setHandlers({ onPointerDown, onPointerOut, onPointerOver }: GameSquereHandlersProps): void {
        this.resetHandlers();
        this._onPointerDown = onPointerDown;
        this._onPointerOver = onPointerOver;
        this._onPointerOut = onPointerOut;
        this.bindHandlers();
    }

    evolveToQueen() {
        this.pawn?.evolveToQueen();
    }

    addEffect(pawn: Pawn) {
        this.pawn?.hide();
        this._effect = pawn;
    }

    removeEffects() {
        if (!this._effect) return;
        this._effect?.removePawn();
        this._effect = null;
        this.pawn?.show();
    }

    hasEffect(type: GamePawnType) {
        return this._effect?.pawnType === type;
    }

    hasAnyEffect() {
        return this._effect !== null;
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
        targetSquere.removeEffects();

        targetSquere.addPawn(tmp!);
        targetSquere._pawn?.move(targetSquere.wordPosition);
        tmp!.setParent(targetSquere);
    }

    get pawn() {
        return this._pawn;
    }

    get isMousever(): boolean {
        return this._isMouseOver;
    }

    // helper methods

    private onPointerDown = () => {
        this._onPointerDown?.(this);
    };

    private onPointerOver = () => {
        this._isMouseOver = true;
        this._onPointerOver?.(this);
    };

    private onPointerOut = () => {
        this._onPointerOut?.(this);
        this._isMouseOver = false;
    };

    private resetHandlers() {
        this._rectangle.removeAllListeners();
    }
    private bindHandlers() {
        this._rectangle.on("pointerdown", this.onPointerDown);
        this._rectangle.on("pointerover", this.onPointerOver);
        this._rectangle.on("pointerout", this.onPointerOut);
    }

    private createGameSquereRectangle(): phaser.GameObjects.Rectangle {
        return GameContext.instance.currentScene.add
            .rectangle(
                this.wordPosition.x,
                this.wordPosition.y,
                GameBoardConst.tileSize,
                GameBoardConst.tileSize,
                0,
                0
            )
            .setInteractive();
    }
}

interface PawnParams {
    player: PlayerType;
    type: GamePawnType;
    sprite: phaser.GameObjects.Sprite;
    parent: GameSquere;

    onPointerDown: (squere: GameSquere) => void;
    onPointerOver?: (squere: GameSquere) => void;
    onPointerOut?: (squere: GameSquere) => void;
}

export class Pawn {
    private _sprite: phaser.GameObjects.Image | null | undefined;

    private _pawnType: GamePawnType = GamePawnType.none;
    private _playerType: PlayerType;

    private _parent!: GameSquere;
    private _onPointerDown: (squere: GameSquere) => void;
    private _onPointerOver?: (squere: GameSquere) => void;
    private _onPointerOut?: (squere: GameSquere) => void;

    private constructor({
        player,
        type,
        sprite: image,
        parent,
        onPointerDown,
        onPointerOver,
        onPointerOut

    }: PawnParams) {
        this._pawnType = type;
        this._sprite = image;
        this._playerType = player;
        this.setParent(parent);
        this._onPointerDown = onPointerDown;
        this._onPointerOver = onPointerOver;
        this._onPointerOut = onPointerOut;

        this.bindHandlers();
    }

    static new(params: PawnParams) {
        const newPawn = new Pawn(params);
        return newPawn;
    }

    get pawnType(): GamePawnType {
        return this._pawnType;
    }

    get player(): PlayerType {
        return this._playerType;
    }

    get sprite() {
        return this._sprite;
    }

    setParent(parent: GameSquere) {
        this._parent = parent;
    }

    move(point: Point) {
        const targetWordPos = getPawnYOffset(point, this.pawnType)
        this.sprite?.setPosition(targetWordPos.x, targetWordPos.y);
    }

    removePawn() {
        this.clearImage();
    }

    evolveToQueen() {
        if (this._pawnType === GamePawnType.none) return;

        const newType =
            this.player === PlayerType.white
                ? GamePawnType.whiteQueen
                : GamePawnType.blackQueen;
        this.setPawnType(newType);

        const pos = getPawnYOffset({ x: this.sprite!.x, y: this.sprite!.y }, this.pawnType);
        const queenImg = getNewSprite(pos, newType).setInteractive(GameContext.instance.currentScene.input.makePixelPerfect());
        this._sprite!.destroy();
        this._sprite = queenImg;
        this.bindHandlers();
    }

    highlight() {
        this.sprite?.setAlpha(0.85);
    }

    hide() {
        this.sprite?.setVisible(false);
        this.sprite?.setActive(false);
    }

    show() {
        this.sprite?.setActive(true);
        this.sprite?.setVisible(true);
    }

    unHighlight() {
        this.sprite?.setAlpha(1);
    }

    private onPointerDown = () => {
        this._onPointerDown(this._parent);
    };

    private onPointerOver = () => {
        this._onPointerOver?.(this._parent);
    };

    private onPointerOut = () => {
        this._onPointerOut?.(this._parent);
    };

    private clearImage() {
        this.setPawnType(GamePawnType.none);
        this._sprite?.destroy();
        this._sprite = null;
    }

    private setPawnType(type: GamePawnType) {
        this._pawnType = type;
    }

    private bindHandlers() {
        this.sprite?.on("pointerdown", this.onPointerDown);
        this.sprite?.on("pointerover", this.onPointerOver);
        this.sprite?.on("pointerout", this.onPointerOut);
    }

}
