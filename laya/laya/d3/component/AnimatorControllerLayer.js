import { AnimatorPlayState } from "./AnimatorPlayState";
export class AnimatorControllerLayer {
    constructor(name) {
        this._defaultState = null;
        this._referenceCount = 0;
        this._statesMap = {};
        this.playOnWake = true;
        this._playType = -1;
        this._crossMark = 0;
        this._crossDuration = -1;
        this._crossNodesOwnersIndicesMap = {};
        this._crossNodesOwnersCount = 0;
        this._crossNodesOwners = [];
        this._currentPlayState = null;
        this._states = [];
        this._playStateInfo = new AnimatorPlayState();
        this._crossPlayStateInfo = new AnimatorPlayState();
        this._srcCrossClipNodeIndices = [];
        this._destCrossClipNodeIndices = [];
        this.name = name;
        this.defaultWeight = 1.0;
        this.blendingMode = AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
    }
    get defaultState() {
        return this._defaultState;
    }
    set defaultState(value) {
        this._defaultState = value;
        this._statesMap[value.name] = value;
    }
    _removeClip(clipStateInfos, statesMap, index, state) {
        var clip = state._clip;
        var clipStateInfo = clipStateInfos[index];
        clipStateInfos.splice(index, 1);
        delete statesMap[state.name];
        if (this._animator) {
            var frameNodes = clip._nodes;
            var nodeOwners = clipStateInfo._nodeOwners;
            clip._removeReference();
            for (var i = 0, n = frameNodes.count; i < n; i++)
                this._animator._removeKeyframeNodeOwner(nodeOwners, frameNodes.getNodeByIndex(i));
        }
    }
    _getReferenceCount() {
        return this._referenceCount;
    }
    _addReference(count = 1) {
        for (var i = 0, n = this._states.length; i < n; i++)
            this._states[i]._addReference(count);
        this._referenceCount += count;
    }
    _removeReference(count = 1) {
        for (var i = 0, n = this._states.length; i < n; i++)
            this._states[i]._removeReference(count);
        this._referenceCount -= count;
    }
    _clearReference() {
        this._removeReference(-this._referenceCount);
    }
    getAnimatorState(name) {
        var state = this._statesMap[name];
        return state ? state : null;
    }
    addState(state) {
        var stateName = state.name;
        if (this._statesMap[stateName]) {
            throw "AnimatorControllerLayer:this stat's name has exist.";
        }
        else {
            this._statesMap[stateName] = state;
            this._states.push(state);
            if (this._animator) {
                state._clip._addReference();
                this._animator._getOwnersByClip(state);
            }
        }
    }
    removeState(state) {
        var states = this._states;
        var index = -1;
        for (var i = 0, n = states.length; i < n; i++) {
            if (states[i] === state) {
                index = i;
                break;
            }
        }
        if (index !== -1)
            this._removeClip(states, this._statesMap, index, state);
    }
    destroy() {
        this._clearReference();
        this._statesMap = null;
        this._states = null;
        this._playStateInfo = null;
        this._crossPlayStateInfo = null;
        this._defaultState = null;
    }
    cloneTo(destObject) {
        var dest = destObject;
        dest.name = this.name;
        dest.blendingMode = this.blendingMode;
        dest.defaultWeight = this.defaultWeight;
        dest.playOnWake = this.playOnWake;
    }
    clone() {
        var dest = new AnimatorControllerLayer(this.name);
        this.cloneTo(dest);
        return dest;
    }
}
AnimatorControllerLayer.BLENDINGMODE_OVERRIDE = 0;
AnimatorControllerLayer.BLENDINGMODE_ADDTIVE = 1;
