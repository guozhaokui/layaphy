import { Slider } from "./Slider";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class HSlider extends Slider {
    constructor(skin = null) {
        super(skin);
        this.isVertical = false;
    }
}
ILaya.regClass(HSlider);
ClassUtils.regClass("laya.ui.HSlider", HSlider);
ClassUtils.regClass("Laya.HSlider", HSlider);
