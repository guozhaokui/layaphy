import { Box } from "./Box";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class ScaleBox extends Box {
    constructor() {
        super(...arguments);
        this._oldW = 0;
        this._oldH = 0;
    }
    onEnable() {
        window.Laya.stage.on("resize", this, this.onResize);
        this.onResize();
    }
    onDisable() {
        window.Laya.stage.off("resize", this, this.onResize);
    }
    onResize() {
        var Laya = window.Laya;
        if (this.width > 0 && this.height > 0) {
            var scale = Math.min(Laya.stage.width / this._oldW, Laya.stage.height / this._oldH);
            super.width = Laya.stage.width;
            super.height = Laya.stage.height;
            this.scale(scale, scale);
        }
    }
    set width(value) {
        super.width = value;
        this._oldW = value;
    }
    get width() {
        return super.width;
    }
    set height(value) {
        super.height = value;
        this._oldH = value;
    }
    get height() {
        return super.height;
    }
}
ILaya.regClass(ScaleBox);
ClassUtils.regClass("laya.ui.ScaleBox", ScaleBox);
ClassUtils.regClass("Laya.ScaleBox", ScaleBox);
