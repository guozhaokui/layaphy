import { Sprite } from "../display/Sprite";
import { Dialog } from "./Dialog";
import { UIComponent } from "./UIComponent";
import { Handler } from "../utils/Handler";
export declare class DialogManager extends Sprite {
    maskLayer: Sprite;
    lockLayer: Sprite;
    popupEffect: Function;
    closeEffect: Function;
    popupEffectHandler: Handler;
    closeEffectHandler: Handler;
    constructor();
    private _closeOnSide;
    setLockView(value: UIComponent): void;
    private _onResize;
    private _centerDialog;
    open(dialog: Dialog, closeOther?: boolean, showEffect?: boolean): void;
    private _clearDialogEffect;
    doOpen(dialog: Dialog): void;
    lock(value: boolean): void;
    close(dialog: Dialog): void;
    doClose(dialog: Dialog): void;
    closeAll(): void;
    private _closeAll;
    getDialogsByGroup(group: string): any[];
    closeByGroup(group: string): any[];
}
