import { Event } from "../events/Event";
import { Button } from "./Button";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Radio extends Button {
    constructor(skin = null, label = "") {
        super(skin, label);
        this.toggle = false;
        this._autoSize = false;
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._value = null;
    }
    preinitialize() {
        super.preinitialize();
        this.toggle = false;
        this._autoSize = false;
    }
    initialize() {
        super.initialize();
        this.createText();
        this._text.align = "left";
        this._text.valign = "top";
        this._text.width = 0;
        this.on(Event.CLICK, this, this.onClick);
    }
    onClick(e) {
        this.selected = true;
    }
    get value() {
        return this._value != null ? this._value : this.label;
    }
    set value(obj) {
        this._value = obj;
    }
}
ILaya.regClass(Radio);
ClassUtils.regClass("laya.ui.Radio", Radio);
ClassUtils.regClass("Laya.Radio", Radio);
