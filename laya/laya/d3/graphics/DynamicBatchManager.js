export class DynamicBatchManager {
    constructor() {
        this._batchRenderElementPool = [];
    }
    static _registerManager(manager) {
        DynamicBatchManager._managers.push(manager);
    }
    _clear() {
        this._batchRenderElementPoolIndex = 0;
    }
    _getBatchRenderElementFromPool() {
        throw "StaticBatch:must override this function.";
    }
    dispose() {
    }
}
DynamicBatchManager._managers = [];
