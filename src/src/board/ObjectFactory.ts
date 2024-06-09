import phaser from "phaser";
import { GameContext } from "../common/GameContex";
import { getNewImage } from "../common/ObjectFatory";
import { GameBoard } from "./GameBoard";
import { GameMaster } from "./GameMaster";
import { GameSquere, Pawn } from "./GameSquere";
import { GamePawnType, PlayerType } from "./types";
import { addPointToPoint } from "../GameUtils";

export const createPawn = (
    gameBoard: GameBoard,
    gameMaster: GameMaster,
    image: phaser.GameObjects.Image,
    pawnType: GamePawnType,
    playerType: PlayerType,
    parent: GameSquere
) => {
    const currentScene = GameContext.instance.currentScene;

    const pawnToAdd = Pawn.new({
        image: image,
        type: pawnType,
        player: playerType,
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
            } else if (gameMaster.canSuggestPawn(gameSquere)) {
                const suggestedMove = gameMaster.getSuggestion4Field(gameSquere)!;
                currentScene.input.setDefaultCursor("pointer");

                const img = getNewImage(addPointToPoint(gameSquere.wordPosition, { x: 0, y: -7 }), suggestedMove.effect);
                const effect = Pawn.new({
                    image: img,
                    type: suggestedMove.effect,
                    player: suggestedMove.player!,
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
            if (
                !gameMaster.selectedSquere ||
                (gameMaster.selectedSquere &&
                    !gameMaster.isSelectedSquereEqual(gameSquere))
            ) {
                gameSquere.pawn?.unHighlight();
                currentScene.input.setDefaultCursor("");
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
        onPointerDown: (parent: GameSquere) => {
            if (gameMaster.canPlacePawn(parent)) {
                gameBoard.placePawn(parent);
            }
        },
        onPointerOver: (parent: GameSquere) => {
            if (gameMaster.canSuggestPawn(parent)) {
                const suggestedMove =
                    gameMaster.getSuggestion4Field(parent)!;
                currentScene.input.setDefaultCursor("pointer");

                const img = getNewImage(
                    addPointToPoint(parent.wordPosition, { x: 0, y: -7 }),
                    suggestedMove.effect
                ).setInteractive();

                const effect = Pawn.new({
                    image: img,
                    type: suggestedMove.effect,
                    player: suggestedMove.player!,
                    parent: parent,
                    onPointerDown: (gameSquere: GameSquere) => {
                        if (gameMaster.canSelectPawnNoMoveCheck(gameSquere)) {
                            gameBoard.selectPawn(gameSquere);
                        }
                    },
                    onPointerOut: (gameSquere: GameSquere) => {
                        if (
                            !gameMaster.selectedSquere ||
                            (gameMaster.selectedSquere &&
                                !gameMaster.isSelectedSquereEqual(gameSquere))
                        ) {
                            gameSquere.pawn?.unHighlight();
                            currentScene.input.setDefaultCursor("");
                        }
                        gameSquere.removeEffects();
                    }
                });
                parent.addEffect(effect);
            }
        },
        onPointerOut: (parent: GameSquere) => {
            parent.removeEffects();
        }
    }

    return handlers;
};
