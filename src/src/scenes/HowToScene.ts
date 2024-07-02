import phaser from "phaser";
import { SceneConst } from "../common/SceneConst";
import { getNewText } from "../common/ObjectFatory";
import { FontsConst } from "../common/FontsConts";
import { Button } from "../uiComponents/Button";
import { GameContext } from "../common/GameContex";

export class HowToSceneScene extends phaser.Scene {

    constructor() {
        super(SceneConst.HowToScene);
    }

    async preload(): Promise<void> {
        this.load.image('menu_button', 'assets/menu/sprites/button.png');
        this.load.image('menu_button_hover', 'assets/menu/sprites/button_hover.png');
        
        this.load.audio("button_highlight", "assets/menu/audio/button_highlight_0003.mp3");
        this.load.audio("button_click", "assets/menu/audio/button_click.mp3");
    }

    create() {
        this.cameras.main.setBackgroundColor(FontsConst.boardColor);
        this.createParagraphs();
    }

    private createParagraphs() {
        const startX = (150 / 2) + 50;
        const startY = 50;

        Button.new(
            { x: startX, y: startY },
            "Back",
            () => {
                GameContext.instance.setScene(SceneConst.MainMenuScene);
            }
        );

        const headerStyle = { fontFamily: FontsConst.secondaryFontFamily, color: FontsConst.primaryColor, fontSize: 20 };
        const ruleStyle = { fontFamily: FontsConst.secondaryFontFamily, color: FontsConst.primaryColor, fontSize: 15 };
        const ruleTitleStyle = { fontFamily: FontsConst.secondaryFontFamily, color: FontsConst.primaryColor, fontSize: 15, };

        let offsetY = 10;
        const offsetX = 30;

        const rules = this.createRules();

        let lastY = startY + 70;

        getNewText({ x: startX + 700 / 2, y: lastY }, "How To Play", headerStyle).setOrigin(0, 0).setWordWrapWidth(700).setOrigin(.5, .5);

        lastY += 50;

        for (const rule of rules) {
            let ruleTitleText = getNewText({ x: startX, y: lastY }, rule.title, ruleTitleStyle).setOrigin(0, 0).setWordWrapWidth(700);
            let ruleYOffset = ruleTitleText.height + 5;
            let ruleText = getNewText({ x: startX + 10, y: lastY + ruleYOffset }, rule.text, ruleStyle).setOrigin(0, 0).setWordWrapWidth(700);

            if (rule.subRules?.length) {
                offsetY = ruleText.height + ruleTitleText.height;
                for (const subrule of rule.subRules) {
                    lastY += ruleText.height + ruleTitleText.height + 20;
                    ruleTitleText = getNewText({ x: startX + offsetX, y: lastY }, subrule.title, ruleTitleStyle).setOrigin(0, 0).setWordWrapWidth(700);

                    ruleYOffset = ruleTitleText.height + 5;
                    ruleText = getNewText({ x: startX + offsetX + 10, y: lastY + ruleYOffset }, subrule.text, ruleStyle).setOrigin(0, 0).setWordWrapWidth(700);
                    offsetY += ruleText.height;
                }
            } else {
                offsetY = ruleText.height + ruleTitleText.height + 20;
            }

            lastY += offsetY;
        }
    }

    private createRules() {
        const rules: GameRuleInfo[] = [];

        const rule1Title = "Board";
        const rule1 = "Played on an 8×8 board with alternating dark and light squares. The left square of the first rank should be dark.";

        const rule2Title = "Starting position";
        const rule2 = "Each player starts with 12 pieces on the three rows closest to their own side. The row closest to each player is called the “crownhead” or “kings row.” Usually, the colors of the pieces are black and white, but other colors are possible (one dark and the other light).";

        const rule3Title = "Pieces";
        const rule3 = "There are two kinds of pieces:";

        const rule31Title = "Men";
        const rule31 = "Move forward diagonally to an adjacent unoccupied square.";

        const rule32Title = "Kings";
        const rule32 = "If a player’s piece moves into the kings row on the opposing player’s side of the board, it becomes a “king” and gains the ability to move backward as well as forward and to choose on which free square on this diagonal to stop.";

        const rule4Title = "Capture";
        const rule4 = "If the adjacent square contains an opponent’s piece, and the square immediately beyond it is vacant, the opponent’s piece may be captured (and removed from the game) by jumping over it. Jumping can be done forward and backward. Multiple-jump moves are possible if, when the jumping piece lands, there is another piece that can be jumped. Jumping is mandatory and cannot be passed up to make a non-jumping move. When there is more than one way for a player to jump, one may choose which sequence to make, not necessarily the sequence that will result in the most captures. However, one must make all the captures in that sequence. A captured piece is left on the board until all captures in a sequence have been made but cannot be jumped again (this rule also applies to the kings).";

        const rule5Title = "Winning and draws";
        const rule5 = "A player with no valid move remaining loses. This is the case if the player either has no pieces left or if a player’s pieces are obstructed from making a legal move by the pieces of the opponent. The game is considered a draw when the same position repeats itself for the third time, with the same player having the move each time";


        rules.push({
            title: rule1Title,
            text: rule1
        }, {
            title: rule2Title,
            text: rule2
        }, {
            title: rule3Title,
            text: rule3,
            subRules: [{
                title: rule31Title,
                text: rule31
            },
            {
                title: rule32Title,
                text: rule32
            }]
        },
            {
                title: rule4Title,
                text: rule4
            },
            {
                title: rule5Title,
                text: rule5
            }
        );

        return rules;
    }
}



export interface GameRuleInfo {
    title: string;
    text: string;
    subRules?: GameRuleInfo[];
}

