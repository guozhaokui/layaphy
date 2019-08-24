import { Slider } from "./Slider";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class VSlider extends Slider {
}
ILaya.regClass(VSlider);
ClassUtils.regClass("laya.ui.VSlider", VSlider);
ClassUtils.regClass("Laya.VSlider", VSlider);
