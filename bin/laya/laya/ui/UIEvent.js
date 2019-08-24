import { Event } from "../events/Event";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class UIEvent extends Event {
}
UIEvent.SHOW_TIP = "showtip";
UIEvent.HIDE_TIP = "hidetip";
ILaya.regClass(UIEvent);
ClassUtils.regClass("laya.ui.UIEvent", UIEvent);
ClassUtils.regClass("Laya.UIEvent", UIEvent);
