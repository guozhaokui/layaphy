import { UIGroup } from "./UIGroup";
import { Radio } from "./Radio";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class RadioGroup extends UIGroup {
    createItem(skin, label) {
        return new Radio(skin, label);
    }
}
ILaya.regClass(RadioGroup);
ClassUtils.regClass("laya.ui.RadioGroup", RadioGroup);
ClassUtils.regClass("Laya.RadioGroup", RadioGroup);
