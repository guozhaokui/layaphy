import { CacheManger } from "./CacheManger";
export class VectorGraphManager {
    constructor() {
        this.useDic = {};
        this.shapeDic = {};
        this.shapeLineDic = {};
        this._id = 0;
        this._checkKey = false;
        this._freeIdArray = [];
        CacheManger.regCacheByFunction(this.startDispose.bind(this), this.getCacheList.bind(this));
    }
    static getInstance() {
        return VectorGraphManager.instance = VectorGraphManager.instance || new VectorGraphManager();
    }
    getId() {
        return this._id++;
    }
    addShape(id, shape) {
        this.shapeDic[id] = shape;
        if (!this.useDic[id]) {
            this.useDic[id] = true;
        }
    }
    addLine(id, Line) {
        this.shapeLineDic[id] = Line;
        if (!this.shapeLineDic[id]) {
            this.shapeLineDic[id] = true;
        }
    }
    getShape(id) {
        if (this._checkKey) {
            if (this.useDic[id] != null) {
                this.useDic[id] = true;
            }
        }
    }
    deleteShape(id) {
        if (this.shapeDic[id]) {
            this.shapeDic[id] = null;
            delete this.shapeDic[id];
        }
        if (this.shapeLineDic[id]) {
            this.shapeLineDic[id] = null;
            delete this.shapeLineDic[id];
        }
        if (this.useDic[id] != null) {
            delete this.useDic[id];
        }
    }
    getCacheList() {
        var str;
        var list = [];
        for (str in this.shapeDic) {
            list.push(this.shapeDic[str]);
        }
        for (str in this.shapeLineDic) {
            list.push(this.shapeLineDic[str]);
        }
        return list;
    }
    startDispose(key) {
        var str;
        for (str in this.useDic) {
            this.useDic[str] = false;
        }
        this._checkKey = true;
    }
    endDispose() {
        if (this._checkKey) {
            var str;
            for (str in this.useDic) {
                if (!this.useDic[str]) {
                    this.deleteShape(str);
                }
            }
            this._checkKey = false;
        }
    }
}
