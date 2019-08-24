import { Button } from "./Button";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class CheckBox extends Button {
    constructor(skin = null, label = "") {
        super(skin, label);
        this.toggle = true;
        this._autoSize = false;
    }
    preinitialize() {
        super.preinitialize();
        this.toggle = true;
        this._autoSize = false;
    }
    initialize() {
        super.initialize();
        this.createText();
        this._text.align = "left";
        this._text.valign = "top";
        this._text.width = 0;
    }
    set dataSource(value) {
        this._dataSource = value;
        if (value instanceof Boolean)
            this.selected = value;
        else if (typeof (value) == 'string')
            this.selected = value === "true";
        else
            super.dataSource = value;
    }
    get dataSource() {
        return super.dataSource;
    }
}
ILaya.regClass(CheckBox);
ClassUtils.regClass("laya.ui.CheckBox", CheckBox);
ClassUtils.regClass("Laya.CheckBox", CheckBox);
