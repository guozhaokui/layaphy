import { RenderableSprite3D } from "../core/RenderableSprite3D";
export class StaticBatchManager {
    constructor() {
        this._initBatchSprites = [];
        this._staticBatches = {};
        this._batchRenderElementPoolIndex = 0;
        this._batchRenderElementPool = [];
    }
    static _registerManager(manager) {
        StaticBatchManager._managers.push(manager);
    }
    static _addToStaticBatchQueue(sprite3D, renderableSprite3D) {
        if (sprite3D instanceof RenderableSprite3D && sprite3D.isStatic)
            renderableSprite3D.push(sprite3D);
        for (var i = 0, n = sprite3D.numChildren; i < n; i++)
            StaticBatchManager._addToStaticBatchQueue(sprite3D._children[i], renderableSprite3D);
    }
    static combine(staticBatchRoot, renderableSprite3Ds = null) {
        if (!renderableSprite3Ds) {
            renderableSprite3Ds = [];
            if (staticBatchRoot)
                StaticBatchManager._addToStaticBatchQueue(staticBatchRoot, renderableSprite3Ds);
        }
        var batchSpritesCount = renderableSprite3Ds.length;
        if (batchSpritesCount > 0) {
            for (var i = 0; i < batchSpritesCount; i++) {
                var renderableSprite3D = renderableSprite3Ds[i];
                (renderableSprite3D.isStatic) && (renderableSprite3D._addToInitStaticBatchManager());
            }
            for (var k = 0, m = StaticBatchManager._managers.length; k < m; k++) {
                var manager = StaticBatchManager._managers[k];
                manager._initStaticBatchs(staticBatchRoot);
            }
        }
    }
    _partition(items, left, right) {
        var pivot = items[Math.floor((right + left) / 2)];
        while (left <= right) {
            while (this._compare(items[left], pivot) < 0)
                left++;
            while (this._compare(items[right], pivot) > 0)
                right--;
            if (left < right) {
                var temp = items[left];
                items[left] = items[right];
                items[right] = temp;
                left++;
                right--;
            }
            else if (left === right) {
                left++;
                break;
            }
        }
        return left;
    }
    _quickSort(items, left, right) {
        if (items.length > 1) {
            var index = this._partition(items, left, right);
            var leftIndex = index - 1;
            if (left < leftIndex)
                this._quickSort(items, left, leftIndex);
            if (index < right)
                this._quickSort(items, index, right);
        }
    }
    _compare(left, right) {
        throw "StaticBatch:must override this function.";
    }
    _initStaticBatchs(rootSprite) {
        throw "StaticBatch:must override this function.";
    }
    _getBatchRenderElementFromPool() {
        throw "StaticBatch:must override this function.";
    }
    _addBatchSprite(renderableSprite3D) {
        this._initBatchSprites.push(renderableSprite3D);
    }
    _clear() {
        this._batchRenderElementPoolIndex = 0;
    }
    _garbageCollection() {
        throw "StaticBatchManager: must override it.";
    }
    dispose() {
        this._staticBatches = null;
    }
}
StaticBatchManager._managers = [];
