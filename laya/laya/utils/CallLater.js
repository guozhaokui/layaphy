import { ILaya } from "../../ILaya";
export class CallLater {
    constructor() {
        this._pool = [];
        this._map = [];
        this._laters = [];
    }
    _update() {
        var laters = this._laters;
        var len = laters.length;
        if (len > 0) {
            for (var i = 0, n = len - 1; i <= n; i++) {
                var handler = laters[i];
                this._map[handler.key] = null;
                if (handler.method !== null) {
                    handler.run();
                    handler.clear();
                }
                this._pool.push(handler);
                i === n && (n = laters.length - 1);
            }
            laters.length = 0;
        }
    }
    _getHandler(caller, method) {
        var cid = caller ? caller.$_GID || (caller.$_GID = ILaya.Utils.getGID()) : 0;
        var mid = method.$_TID || (method.$_TID = (ILaya.Timer._mid++) * 100000);
        return this._map[cid + mid];
    }
    callLater(caller, method, args = null) {
        if (this._getHandler(caller, method) == null) {
            if (this._pool.length)
                var handler = this._pool.pop();
            else
                handler = new LaterHandler();
            handler.caller = caller;
            handler.method = method;
            handler.args = args;
            var cid = caller ? caller.$_GID : 0;
            var mid = method["$_TID"];
            handler.key = cid + mid;
            this._map[handler.key] = handler;
            this._laters.push(handler);
        }
    }
    runCallLater(caller, method) {
        var handler = this._getHandler(caller, method);
        if (handler && handler.method != null) {
            this._map[handler.key] = null;
            handler.run();
            handler.clear();
        }
    }
}
CallLater.I = new CallLater();
class LaterHandler {
    clear() {
        this.caller = null;
        this.method = null;
        this.args = null;
    }
    run() {
        var caller = this.caller;
        if (caller && caller.destroyed)
            return this.clear();
        var method = this.method;
        var args = this.args;
        if (method == null)
            return;
        args ? method.apply(caller, args) : method.call(caller);
    }
}
