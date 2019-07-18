import { Button } from "./Button";
import { UIGroup } from "./UIGroup";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Tab extends UIGroup {
    createItem(skin, label) {
        return new Button(skin, label);
    }
}
ILaya.regClass(Tab);
ClassUtils.regClass("laya.ui.Tab", Tab);
ClassUtils.regClass("Laya.Tab", Tab);
