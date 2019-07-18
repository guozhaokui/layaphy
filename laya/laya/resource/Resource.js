import { ILaya } from "../../ILaya";
import { EventDispatcher } from "../events/EventDispatcher";
import { URL } from "../net/URL";
export class Resource extends EventDispatcher {
    constructor() {
        super();
        this._id = 0;
        this._url = null;
        this._cpuMemory = 0;
        this._gpuMemory = 0;
        this._destroyed = false;
        this._referenceCount = 0;
        this.lock = false;
        this.name = null;
        this._id = ++Resource._uniqueIDCounter;
        this._destroyed = false;
        this._referenceCount = 0;
        Resource._idResourcesMap[this.id] = this;
        this.lock = false;
    }
    static get cpuMemory() {
        return Resource._cpuMemory;
    }
    static get gpuMemory() {
        return Resource._gpuMemory;
    }
    static _addCPUMemory(size) {
        Resource._cpuMemory += size;
    }
    static _addGPUMemory(size) {
        Resource._gpuMemory += size;
    }
    static _addMemory(cpuSize, gpuSize) {
        Resource._cpuMemory += cpuSize;
        Resource._gpuMemory += gpuSize;
    }
    static getResourceByID(id) {
        return Resource._idResourcesMap[id];
    }
    static getResourceByURL(url, index = 0) {
        return Resource._urlResourcesMap[url][index];
    }
    static destroyUnusedResources() {
        for (var k in Resource._idResourcesMap) {
            var res = Resource._idResourcesMap[k];
            if (!res.lock && res._referenceCount === 0)
                res.destroy();
        }
    }
    get id() {
        return this._id;
    }
    get url() {
        return this._url;
    }
    get cpuMemory() {
        return this._cpuMemory;
    }
    get gpuMemory() {
        return this._gpuMemory;
    }
    get destroyed() {
        return this._destroyed;
    }
    get referenceCount() {
        return this._referenceCount;
    }
    _setCPUMemory(value) {
        var offsetValue = value - this._cpuMemory;
        this._cpuMemory = value;
        Resource._addCPUMemory(offsetValue);
    }
    _setGPUMemory(value) {
        var offsetValue = value - this._gpuMemory;
        this._gpuMemory = value;
        Resource._addGPUMemory(offsetValue);
    }
    _setCreateURL(url) {
        url = URL.formatURL(url);
        if (this._url !== url) {
            var resList;
            if (this._url) {
                resList = Resource._urlResourcesMap[this._url];
                resList.splice(resList.indexOf(this), 1);
                (resList.length === 0) && (delete Resource._urlResourcesMap[this._url]);
            }
            if (url) {
                resList = Resource._urlResourcesMap[url];
                (resList) || (Resource._urlResourcesMap[url] = resList = []);
                resList.push(this);
            }
            this._url = url;
        }
    }
    _addReference(count = 1) {
        this._referenceCount += count;
    }
    _removeReference(count = 1) {
        this._referenceCount -= count;
    }
    _clearReference() {
        this._referenceCount = 0;
    }
    _recoverResource() {
    }
    _disposeResource() {
    }
    _activeResource() {
    }
    destroy() {
        if (this._destroyed)
            return;
        this._destroyed = true;
        this.lock = false;
        this._disposeResource();
        delete Resource._idResourcesMap[this.id];
        var resList;
        if (this._url) {
            resList = Resource._urlResourcesMap[this._url];
            if (resList) {
                resList.splice(resList.indexOf(this), 1);
                (resList.length === 0) && (delete Resource._urlResourcesMap[this._url]);
            }
            var resou = ILaya.Loader.getRes(this._url);
            (resou == this) && (delete ILaya.Loader.loadedMap[this._url]);
        }
    }
}
Resource._uniqueIDCounter = 0;
Resource._idResourcesMap = {};
Resource._urlResourcesMap = {};
Resource._cpuMemory = 0;
Resource._gpuMemory = 0;
