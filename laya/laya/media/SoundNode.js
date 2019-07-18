import { SoundManager } from "./SoundManager";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
export class SoundNode extends Sprite {
    constructor() {
        super();
        this.visible = false;
        this.on(Event.ADDED, this, this._onParentChange);
        this.on(Event.REMOVED, this, this._onParentChange);
    }
    _onParentChange() {
        this.target = this.parent;
    }
    play(loops = 1, complete = null) {
        if (isNaN(loops)) {
            loops = 1;
        }
        if (!this.url)
            return;
        this.stop();
        this._channel = SoundManager.playSound(this.url, loops, complete);
    }
    stop() {
        if (this._channel && !this._channel.isStopped) {
            this._channel.stop();
        }
        this._channel = null;
    }
    _setPlayAction(tar, event, action, add = true) {
        if (!this[action])
            return;
        if (!tar)
            return;
        if (add) {
            tar.on(event, this, this[action]);
        }
        else {
            tar.off(event, this, this[action]);
        }
    }
    _setPlayActions(tar, events, action, add = true) {
        if (!tar)
            return;
        if (!events)
            return;
        var eventArr = events.split(",");
        var i, len;
        len = eventArr.length;
        for (i = 0; i < len; i++) {
            this._setPlayAction(tar, eventArr[i], action, add);
        }
    }
    set playEvent(events) {
        this._playEvents = events;
        if (!events)
            return;
        if (this._tar) {
            this._setPlayActions(this._tar, events, "play");
        }
    }
    set target(tar) {
        if (this._tar) {
            this._setPlayActions(this._tar, this._playEvents, "play", false);
            this._setPlayActions(this._tar, this._stopEvents, "stop", false);
        }
        this._tar = tar;
        if (this._tar) {
            this._setPlayActions(this._tar, this._playEvents, "play", true);
            this._setPlayActions(this._tar, this._stopEvents, "stop", true);
        }
    }
    set stopEvent(events) {
        this._stopEvents = events;
        if (!events)
            return;
        if (this._tar) {
            this._setPlayActions(this._tar, events, "stop");
        }
    }
}
