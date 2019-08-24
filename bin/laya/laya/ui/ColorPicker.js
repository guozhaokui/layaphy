import { UIComponent } from "./UIComponent";
import { Box } from "./Box";
import { Button } from "./Button";
import { UIUtils } from "./UIUtils";
import { Input } from "../display/Input";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class ColorPicker extends UIComponent {
    constructor() {
        super(...arguments);
        this._gridSize = 11;
        this._bgColor = "#ffffff";
        this._borderColor = "#000000";
        this._inputColor = "#000000";
        this._inputBgColor = "#efefef";
        this._colors = [];
        this._selectedColor = "#000000";
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._colorPanel && this._colorPanel.destroy(destroyChild);
        this._colorButton && this._colorButton.destroy(destroyChild);
        this._colorPanel = null;
        this._colorTiles = null;
        this._colorBlock = null;
        this._colorInput = null;
        this._colorButton = null;
        this._colors = null;
        this.changeHandler = null;
    }
    createChildren() {
        this.addChild(this._colorButton = new Button());
        this._colorPanel = new Box();
        this._colorPanel.size(230, 166);
        this._colorPanel.addChild(this._colorTiles = new Sprite());
        this._colorPanel.addChild(this._colorBlock = new Sprite());
        this._colorPanel.addChild(this._colorInput = new Input());
    }
    initialize() {
        this._colorButton.on(Event.CLICK, this, this.onColorButtonClick);
        this._colorBlock.pos(5, 5);
        this._colorInput.pos(60, 5);
        this._colorInput.size(60, 20);
        this._colorInput.on(Event.CHANGE, this, this.onColorInputChange);
        this._colorInput.on(Event.KEY_DOWN, this, this.onColorFieldKeyDown);
        this._colorTiles.pos(5, 30);
        this._colorTiles.on(Event.MOUSE_MOVE, this, this.onColorTilesMouseMove);
        this._colorTiles.on(Event.CLICK, this, this.onColorTilesClick);
        this._colorTiles.size(20 * this._gridSize, 12 * this._gridSize);
        this._colorPanel.on(Event.MOUSE_DOWN, this, this.onPanelMouseDown);
        this.bgColor = this._bgColor;
    }
    onPanelMouseDown(e) {
        e.stopPropagation();
    }
    changePanel() {
        this._panelChanged = false;
        var g = this._colorPanel.graphics;
        g.clear(true);
        g.drawRect(0, 0, 230, 166, this._bgColor, this._borderColor);
        this.drawBlock(this._selectedColor);
        this._colorInput.borderColor = this._borderColor;
        this._colorInput.bgColor = this._inputBgColor;
        this._colorInput.color = this._inputColor;
        g = this._colorTiles.graphics;
        g.clear(true);
        var mainColors = [0x000000, 0x333333, 0x666666, 0x999999, 0xCCCCCC, 0xFFFFFF, 0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0x00FFFF, 0xFF00FF];
        for (var i = 0; i < 12; i++) {
            for (var j = 0; j < 20; j++) {
                var color;
                if (j === 0)
                    color = mainColors[i];
                else if (j === 1)
                    color = 0x000000;
                else
                    color = (((i * 3 + j / 6) % 3 << 0) + ((i / 6) << 0) * 3) * 0x33 << 16 | j % 6 * 0x33 << 8 | (i << 0) % 6 * 0x33;
                var strColor = UIUtils.toColor(color);
                this._colors.push(strColor);
                var x = j * this._gridSize;
                var y = i * this._gridSize;
                g.drawRect(x, y, this._gridSize, this._gridSize, strColor, "#000000");
            }
        }
    }
    onColorButtonClick(e) {
        if (this._colorPanel.parent)
            this.close();
        else
            this.open();
    }
    open() {
        var Laya = window.Laya;
        var p = this.localToGlobal(new Point());
        var px = p.x + this._colorPanel.width <= Laya.stage.width ? p.x : Laya.stage.width - this._colorPanel.width;
        var py = p.y + this._colorButton.height;
        py = py + this._colorPanel.height <= Laya.stage.height ? py : p.y - this._colorPanel.height;
        this._colorPanel.pos(px, py);
        this._colorPanel.zOrder = 1001;
        Laya._currentStage.addChild(this._colorPanel);
        Laya.stage.on(Event.MOUSE_DOWN, this, this.removeColorBox);
    }
    close() {
        window.Laya.stage.off(Event.MOUSE_DOWN, this, this.removeColorBox);
        this._colorPanel.removeSelf();
    }
    removeColorBox(e = null) {
        this.close();
    }
    onColorFieldKeyDown(e) {
        if (e.keyCode == 13) {
            if (this._colorInput.text)
                this.selectedColor = this._colorInput.text;
            else
                this.selectedColor = null;
            this.close();
            e.stopPropagation();
        }
    }
    onColorInputChange(e = null) {
        if (this._colorInput.text)
            this.drawBlock(this._colorInput.text);
        else
            this.drawBlock("#FFFFFF");
    }
    onColorTilesClick(e) {
        this.selectedColor = this.getColorByMouse();
        this.close();
    }
    onColorTilesMouseMove(e) {
        this._colorInput.focus = false;
        var color = this.getColorByMouse();
        this._colorInput.text = color;
        this.drawBlock(color);
    }
    getColorByMouse() {
        var point = this._colorTiles.getMousePoint();
        var x = Math.floor(point.x / this._gridSize);
        var y = Math.floor(point.y / this._gridSize);
        return this._colors[y * 20 + x];
    }
    drawBlock(color) {
        var g = this._colorBlock.graphics;
        g.clear(true);
        var showColor = color ? color : "#ffffff";
        g.drawRect(0, 0, 50, 20, showColor, this._borderColor);
        color || g.drawLine(0, 0, 50, 20, "#ff0000");
    }
    get selectedColor() {
        return this._selectedColor;
    }
    set selectedColor(value) {
        if (this._selectedColor != value) {
            this._selectedColor = this._colorInput.text = value;
            this.drawBlock(value);
            this.changeColor();
            this.changeHandler && this.changeHandler.runWith(this._selectedColor);
            this.event(Event.CHANGE, Event.EMPTY.setTo(Event.CHANGE, this, this));
        }
    }
    get skin() {
        return this._colorButton.skin;
    }
    set skin(value) {
        this._colorButton.once(Event.LOADED, this, this.changeColor);
        this._colorButton.skin = value;
    }
    changeColor() {
        var g = this.graphics;
        g.clear(true);
        var showColor = this._selectedColor || "#000000";
        g.drawRect(0, 0, this._colorButton.width, this._colorButton.height, showColor);
    }
    get bgColor() {
        return this._bgColor;
    }
    set bgColor(value) {
        this._bgColor = value;
        this._setPanelChanged();
    }
    get borderColor() {
        return this._borderColor;
    }
    set borderColor(value) {
        this._borderColor = value;
        this._setPanelChanged();
    }
    get inputColor() {
        return this._inputColor;
    }
    set inputColor(value) {
        this._inputColor = value;
        this._setPanelChanged();
    }
    get inputBgColor() {
        return this._inputBgColor;
    }
    set inputBgColor(value) {
        this._inputBgColor = value;
        this._setPanelChanged();
    }
    _setPanelChanged() {
        if (!this._panelChanged) {
            this._panelChanged = true;
            this.callLater(this.changePanel);
        }
    }
}
ILaya.regClass(ColorPicker);
ClassUtils.regClass("laya.ui.ColorPicker", ColorPicker);
ClassUtils.regClass("Laya.ColorPicker", ColorPicker);
