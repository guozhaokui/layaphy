import { ScrollBar } from "./ScrollBar";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class HScrollBar extends ScrollBar {
    initialize() {
        super.initialize();
        this.slider.isVertical = false;
    }
}
ILaya.regClass(HScrollBar);
ClassUtils.regClass("laya.ui.HScrollBar", HScrollBar);
ClassUtils.regClass("Laya.HScrollBar", HScrollBar);
