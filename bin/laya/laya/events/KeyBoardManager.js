import { Event } from "./Event";
import { ILaya } from "../../ILaya";
export class KeyBoardManager {
    static __init__() {
        KeyBoardManager._addEvent("keydown");
        KeyBoardManager._addEvent("keypress");
        KeyBoardManager._addEvent("keyup");
    }
    static _addEvent(type) {
        ILaya.Browser.document.addEventListener(type, function (e) {
            KeyBoardManager._dispatch(e, type);
        }, true);
    }
    static _dispatch(e, type) {
        if (!KeyBoardManager.enabled)
            return;
        KeyBoardManager._event._stoped = false;
        KeyBoardManager._event.nativeEvent = e;
        KeyBoardManager._event.keyCode = e.keyCode || e.which || e.charCode;
        if (type === "keydown")
            KeyBoardManager._pressKeys[KeyBoardManager._event.keyCode] = true;
        else if (type === "keyup")
            KeyBoardManager._pressKeys[KeyBoardManager._event.keyCode] = null;
        var target = (ILaya.stage.focus && (ILaya.stage.focus.event != null) && ILaya.stage.focus.displayedInStage) ? ILaya.stage.focus : ILaya.stage;
        var ct = target;
        while (ct) {
            ct.event(type, KeyBoardManager._event.setTo(type, ct, target));
            ct = ct.parent;
        }
    }
    static hasKeyDown(key) {
        return KeyBoardManager._pressKeys[key];
    }
}
KeyBoardManager._pressKeys = {};
KeyBoardManager.enabled = true;
KeyBoardManager._event = new Event();
