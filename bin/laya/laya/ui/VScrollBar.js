import { ScrollBar } from "./ScrollBar";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class VScrollBar extends ScrollBar {
}
ILaya.regClass(VScrollBar);
ClassUtils.regClass("laya.ui.VScrollBar", VScrollBar);
ClassUtils.regClass("Laya.VScrollBar", VScrollBar);
