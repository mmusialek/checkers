import { FontsConst } from "../common/FontsConts";
import { GameContext } from "../common/GameContex";
import { Point } from "../common/type";

export class ButtonLabel {

    private constructor() { }

    static new(point: Point, label: string) {
        const sceneAdd = GameContext.instance.currentScene.add;
        sceneAdd.text(point.x, point.y, "", { fontFamily: FontsConst.secondaryFontFamily, fontSize: 15 }).setOrigin(.5, .5).setText(label).setDepth(1);
        sceneAdd.image(point.x, point.y, "menu_button");
    }

}
