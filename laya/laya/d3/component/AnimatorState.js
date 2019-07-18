export class AnimatorState {
    constructor() {
        this._referenceCount = 0;
        this._clip = null;
        this._nodeOwners = [];
        this._currentFrameIndices = null;
        this._scripts = null;
        this.speed = 1.0;
        this.clipStart = 0.0;
        this.clipEnd = 1.0;
    }
    get clip() {
        return this._clip;
    }
    set clip(value) {
        if (this._clip !== value) {
            if (this._clip)
                (this._referenceCount > 0) && (this._clip._removeReference(this._referenceCount));
            if (value) {
                this._currentFrameIndices = new Int16Array(value._nodes.count);
                this._resetFrameIndices();
                (this._referenceCount > 0) && (this._clip._addReference(this._referenceCount));
            }
            this._clip = value;
        }
    }
    _getReferenceCount() {
        return this._referenceCount;
    }
    _addReference(count = 1) {
        (this._clip) && (this._clip._addReference(count));
        this._referenceCount += count;
    }
    _removeReference(count = 1) {
        (this._clip) && (this._clip._removeReference(count));
        this._referenceCount -= count;
    }
    _clearReference() {
        this._removeReference(-this._referenceCount);
    }
    _resetFrameIndices() {
        for (var i = 0, n = this._currentFrameIndices.length; i < n; i++)
            this._currentFrameIndices[i] = -1;
    }
    addScript(type) {
        var script = new type();
        this._scripts = this._scripts || [];
        this._scripts.push(script);
        return script;
    }
    getScript(type) {
        if (this._scripts) {
            for (var i = 0, n = this._scripts.length; i < n; i++) {
                var script = this._scripts[i];
                if (script instanceof type)
                    return script;
            }
        }
        return null;
    }
    getScripts(type) {
        var coms;
        if (this._scripts) {
            for (var i = 0, n = this._scripts.length; i < n; i++) {
                var script = this._scripts[i];
                if (script instanceof type) {
                    coms = coms || [];
                    coms.push(script);
                }
            }
        }
        return coms;
    }
    cloneTo(destObject) {
        var dest = destObject;
        dest.name = this.name;
        dest.speed = this.speed;
        dest.clipStart = this.clipStart;
        dest.clipEnd = this.clipEnd;
        dest.clip = this._clip;
    }
    clone() {
        var dest = new AnimatorState();
        this.cloneTo(dest);
        return dest;
    }
}
