import { Pool } from "../utils/Pool";
import { Utils } from "../utils/Utils";
export class Component {
    constructor() {
        this._id = Utils.getGID();
        this._resetComp();
    }
    get id() {
        return this._id;
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        this._enabled = value;
        if (this.owner) {
            if (value)
                this.owner.activeInHierarchy && this._onEnable();
            else
                this.owner.activeInHierarchy && this._onDisable();
        }
    }
    get isSingleton() {
        return true;
    }
    get destroyed() {
        return this._destroyed;
    }
    _isScript() {
        return false;
    }
    _resetComp() {
        this._indexInList = -1;
        this._enabled = true;
        this._awaked = false;
        this.owner = null;
    }
    _getIndexInList() {
        return this._indexInList;
    }
    _setIndexInList(index) {
        this._indexInList = index;
    }
    _onAdded() {
    }
    _onAwake() {
    }
    _onEnable() {
    }
    _onDisable() {
    }
    _onDestroy() {
    }
    onReset() {
    }
    _parse(data) {
    }
    _cloneTo(dest) {
    }
    _setActive(value) {
        if (value) {
            if (!this._awaked) {
                this._awaked = true;
                this._onAwake();
            }
            this._enabled && this._onEnable();
        }
        else {
            this._enabled && this._onDisable();
        }
    }
    destroy() {
        if (this.owner)
            this.owner._destroyComponent(this);
    }
    _destroy() {
        if (this.owner.activeInHierarchy && this._enabled) {
            this._setActive(false);
            (this._isScript()) && (this.onDisable());
        }
        this._onDestroy();
        this._destroyed = true;
        if (this.onReset !== Component.prototype.onReset) {
            this.onReset();
            this._resetComp();
            Pool.recoverByClass(this);
        }
        else {
            this._resetComp();
        }
    }
}
