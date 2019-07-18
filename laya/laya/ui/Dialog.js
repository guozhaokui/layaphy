import { View } from "./View";
import { DialogManager } from "./DialogManager";
import { UIUtils } from "./UIUtils";
import { Event } from "../events/Event";
import { Rectangle } from "../maths/Rectangle";
import { IUI } from "./IUI";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Dialog extends View {
    constructor() {
        super();
        this.isShowEffect = true;
        this.isPopupCenter = true;
        this.popupEffect = Dialog.manager.popupEffectHandler;
        this.closeEffect = Dialog.manager.closeEffectHandler;
        this._dealDragArea();
        this.on(Event.CLICK, this, this._onClick);
    }
    static get manager() {
        return Dialog._manager = Dialog._manager || new DialogManager();
    }
    static set manager(value) {
        Dialog._manager = value;
    }
    _dealDragArea() {
        var dragTarget = this.getChildByName("drag");
        if (dragTarget) {
            this.dragArea = dragTarget._x + "," + dragTarget._y + "," + dragTarget.width + "," + dragTarget.height;
            dragTarget.removeSelf();
        }
    }
    get dragArea() {
        if (this._dragArea)
            return this._dragArea.toString();
        return null;
    }
    set dragArea(value) {
        if (value) {
            var a = UIUtils.fillArray([0, 0, 0, 0], value, Number);
            this._dragArea = new Rectangle(a[0], a[1], a[2], a[3]);
            this.on(Event.MOUSE_DOWN, this, this._onMouseDown);
        }
        else {
            this._dragArea = null;
            this.off(Event.MOUSE_DOWN, this, this._onMouseDown);
        }
    }
    _onMouseDown(e) {
        var point = this.getMousePoint();
        if (this._dragArea.contains(point.x, point.y))
            this.startDrag();
        else
            this.stopDrag();
    }
    _onClick(e) {
        var btn = e.target;
        if (btn) {
            switch (btn.name) {
                case Dialog.CLOSE:
                case Dialog.CANCEL:
                case Dialog.SURE:
                case Dialog.NO:
                case Dialog.OK:
                case Dialog.YES:
                    this.close(btn.name);
                    return;
            }
        }
    }
    open(closeOther = true, param = null) {
        this._dealDragArea();
        this._param = param;
        Dialog.manager.open(this, closeOther, this.isShowEffect);
        Dialog.manager.lock(false);
    }
    close(type = null) {
        this.closeType = type;
        Dialog.manager.close(this);
    }
    destroy(destroyChild = true) {
        this.closeHandler = null;
        this.popupEffect = null;
        this.closeEffect = null;
        this._dragArea = null;
        super.destroy(destroyChild);
    }
    show(closeOther = false, showEffect = true) {
        this._open(false, closeOther, showEffect);
    }
    popup(closeOther = false, showEffect = true) {
        this._open(true, closeOther, showEffect);
    }
    _open(modal, closeOther, showEffect) {
        this.isModal = modal;
        this.isShowEffect = showEffect;
        Dialog.manager.lock(true);
        this.open(closeOther);
    }
    get isPopup() {
        return this.parent != null;
    }
    set zOrder(value) {
        super.zOrder = value;
        Dialog.manager._checkMask();
    }
    get zOrder() {
        return super.zOrder;
    }
    static setLockView(view) {
        Dialog.manager.setLockView(view);
    }
    static lock(value) {
        Dialog.manager.lock(value);
    }
    static closeAll() {
        Dialog.manager.closeAll();
    }
    static getDialogsByGroup(group) {
        return Dialog.manager.getDialogsByGroup(group);
    }
    static closeByGroup(group) {
        return Dialog.manager.closeByGroup(group);
    }
}
Dialog.CLOSE = "close";
Dialog.CANCEL = "cancel";
Dialog.SURE = "sure";
Dialog.NO = "no";
Dialog.YES = "yes";
Dialog.OK = "ok";
IUI.Dialog = Dialog;
ILaya.regClass(Dialog);
ClassUtils.regClass("laya.ui.Dialog", Dialog);
ClassUtils.regClass("Laya.Dialog", Dialog);
