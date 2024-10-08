import phaser from "phaser";
import { GameContext } from "../common/GameContex";
import { getNewSprite } from "../common/ObjectFatory";
import { GameBoard } from "./GameBoard";
import { GameMaster } from "./GameMaster";
import { GameSquere, Pawn } from "./GameSquere";
import { GamePawnType } from "./types";
import { addPointToPoint } from "./GameUtils";

export const createPawn = (
    gameBoard: GameBoard,
    gameMaster: GameMaster,
    sprite: phaser.GameObjects.Sprite,
    pawnType: GamePawnType,
    parent: GameSquere
) => {
    const currentScene = GameContext.instance.currentScene;

    const pawnToAdd = Pawn.new({
        sprite: sprite,
        type: pawnType,
        parent: parent,
        onPointerDown: (gameSquere: GameSquere) => {
            if (gameMaster.canSelectPawnNoMoveCheck(gameSquere)) {
                gameBoard.selectPawn(gameSquere);
            }
        },

        onPointerOver: (gameSquere: GameSquere) => {
            if (gameMaster.canSelectPawnNoMoveCheck(gameSquere)) {
                currentScene.input.setDefaultCursor("pointer");
                gameSquere.pawn?.highlight();
            } else if (gameMaster.canSuggestPawn(gameSquere) && !gameSquere.hasAnyEffect()) {
                const suggestedMove = gameMaster.getSuggestion4Field(gameSquere)!;
                currentScene.input.setDefaultCursor("pointer");


                const sprite = getNewSprite(
                    // TODO missing gameSquere.pawnType for effect, correct
                    // getPawnYOffset(gameSquere.wordPosition, gameSquere.pawnType),
                    // addPointToPoint(gameSquere.wordPosition, { x: 0, y: -7 }),
                    addPointToPoint(gameSquere.wordPosition, { x: 0, y: 0 }),
                    suggestedMove.effect);
                const effect = Pawn.new({
                    sprite,
                    type: suggestedMove.effect,
                    parent: gameSquere,
                    onPointerDown: (gameSquere: GameSquere) => {
                        if (gameMaster.canSelectPawnNoMoveCheck(gameSquere)) {
                            gameBoard.selectPawn(gameSquere);
                        }
                    },
                });

                gameSquere.addEffect(effect);
            }
        },

        onPointerOut: (gameSquere: GameSquere) => {
            currentScene.input.setDefaultCursor("");

            if (!gameSquere.isMousever) return;

            if (
                !gameMaster.selectedSquere ||
                (gameMaster.selectedSquere &&
                    !gameMaster.isSelectedSquereEqual(gameSquere))
            ) {
                gameSquere.pawn?.unHighlight();
            }

            gameSquere.removeEffects();
        },
    });

    return pawnToAdd;
};


export const createGameSquereRectangleHandlers = (
    gameBoard: GameBoard,
    gameMaster: GameMaster
) => {
    const currentScene = GameContext.instance.currentScene;


    const handlers =
    {
        onPointerDown: (gameSquere: GameSquere) => {
            if (gameMaster.canPlacePawn(gameSquere)) {
                gameBoard.placePawn(gameSquere);
            }
        },
        onPointerOver: (gameSquere: GameSquere) => {
            if (gameMaster.canSuggestPawn(gameSquere) && !gameSquere.hasAnyEffect()) {
                const suggestedMove =
                    gameMaster.getSuggestion4Field(gameSquere)!;
                currentScene.input.setDefaultCursor("pointer");

                const sprite = getNewSprite(
                    // TODO missing gameSquere.pawnType for effect, correct
                    // getPawnYOffset(gameSquere.wordPosition, gameSquere.pawnType),
                    // addPointToPoint(gameSquere.wordPosition, { x: 0, y: -7 }),
                    addPointToPoint(gameSquere.wordPosition, { x: 0, y: 0 }),
                    suggestedMove.effect
                ).setInteractive(GameContext.instance.currentScene.input.makePixelPerfect());
                const effect = Pawn.new({
                    sprite,
                    type: suggestedMove.effect,
                    parent: gameSquere,
                    onPointerDown: (gameSquere: GameSquere) => {
                        if (gameMaster.canSelectPawnNoMoveCheck(gameSquere)) {
                            gameBoard.selectPawn(gameSquere);
                        }
                    },
                });
                gameSquere.addEffect(effect);
            }
        },
        onPointerOut: (parent: GameSquere) => {
            if (!parent.isMousever) return;

            parent.removeEffects();

        }
    }

    return handlers;
};
