import { Handler } from "../utils/Handler";
export class EventDispatcher {
    hasListener(type) {
        var listener = this._events && this._events[type];
        return !!listener;
    }
    event(type, data = null) {
        if (!this._events || !this._events[type])
            return false;
        var listeners = this._events[type];
        if (listeners.run) {
            if (listeners.once)
                delete this._events[type];
            data != null ? listeners.runWith(data) : listeners.run();
        }
        else {
            for (var i = 0, n = listeners.length; i < n; i++) {
                var listener = listeners[i];
                if (listener) {
                    (data != null) ? listener.runWith(data) : listener.run();
                }
                if (!listener || listener.once) {
                    listeners.splice(i, 1);
                    i--;
                    n--;
                }
            }
            if (listeners.length === 0 && this._events)
                delete this._events[type];
        }
        return true;
    }
    on(type, caller, listener, args = null) {
        return this._createListener(type, caller, listener, args, false);
    }
    once(type, caller, listener, args = null) {
        return this._createListener(type, caller, listener, args, true);
    }
    _createListener(type, caller, listener, args, once, offBefore = true) {
        offBefore && this.off(type, caller, listener, once);
        var handler = EventHandler.create(caller || this, listener, args, once);
        this._events || (this._events = {});
        var events = this._events;
        if (!events[type])
            events[type] = handler;
        else {
            if (!events[type].run)
                events[type].push(handler);
            else
                events[type] = [events[type], handler];
        }
        return this;
    }
    off(type, caller, listener, onceOnly = false) {
        if (!this._events || !this._events[type])
            return this;
        var listeners = this._events[type];
        if (listeners != null) {
            if (listeners.run) {
                if ((!caller || listeners.caller === caller) && (listener == null || listeners.method === listener) && (!onceOnly || listeners.once)) {
                    delete this._events[type];
                    listeners.recover();
                }
            }
            else {
                var count = 0;
                for (var i = 0, n = listeners.length; i < n; i++) {
                    var item = listeners[i];
                    if (!item) {
                        count++;
                        continue;
                    }
                    if (item && (!caller || item.caller === caller) && (listener == null || item.method === listener) && (!onceOnly || item.once)) {
                        count++;
                        listeners[i] = null;
                        item.recover();
                    }
                }
                if (count === n)
                    delete this._events[type];
            }
        }
        return this;
    }
    offAll(type = null) {
        var events = this._events;
        if (!events)
            return this;
        if (type) {
            this._recoverHandlers(events[type]);
            delete events[type];
        }
        else {
            for (var name in events) {
                this._recoverHandlers(events[name]);
            }
            this._events = null;
        }
        return this;
    }
    offAllCaller(caller) {
        if (caller && this._events) {
            for (var name in this._events) {
                this.off(name, caller, null);
            }
        }
        return this;
    }
    _recoverHandlers(arr) {
        if (!arr)
            return;
        if (arr.run) {
            arr.recover();
        }
        else {
            for (var i = arr.length - 1; i > -1; i--) {
                if (arr[i]) {
                    arr[i].recover();
                    arr[i] = null;
                }
            }
        }
    }
    isMouseEvent(type) {
        return EventDispatcher.MOUSE_EVENTS[type] || false;
    }
}
EventDispatcher.MOUSE_EVENTS = { "rightmousedown": true, "rightmouseup": true, "rightclick": true, "mousedown": true, "mouseup": true, "mousemove": true, "mouseover": true, "mouseout": true, "click": true, "doubleclick": true };
class EventHandler extends Handler {
    constructor(caller, method, args, once) {
        super(caller, method, args, once);
    }
    recover() {
        if (this._id > 0) {
            this._id = 0;
            EventHandler._pool.push(this.clear());
        }
    }
    static create(caller, method, args = null, once = true) {
        if (EventHandler._pool.length)
            return EventHandler._pool.pop().setTo(caller, method, args, once);
        return new EventHandler(caller, method, args, once);
    }
}
EventHandler._pool = [];
