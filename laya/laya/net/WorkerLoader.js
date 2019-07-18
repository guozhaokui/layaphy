import { Loader } from "./Loader";
import { URL } from "./URL";
import { EventDispatcher } from "../events/EventDispatcher";
import { Texture2D } from "../resource/Texture2D";
export class WorkerLoader extends EventDispatcher {
    constructor() {
        super();
        this.worker = new Worker(WorkerLoader.workerPath);
        this.worker.onmessage = function (evt) {
            this.workerMessage(evt.data);
        };
    }
    static __init__() {
        if (WorkerLoader._preLoadFun != null)
            return false;
        if (!Worker)
            return false;
        WorkerLoader._preLoadFun = Loader["prototype"]["_loadImage"];
        Loader["prototype"]["_loadImage"] = WorkerLoader["prototype"]["_loadImage"];
        if (!WorkerLoader.I)
            WorkerLoader.I = new WorkerLoader();
        return true;
    }
    static workerSupported() {
        return Worker ? true : false;
    }
    static enableWorkerLoader() {
        if (!WorkerLoader._tryEnabled) {
            WorkerLoader.enable = true;
            WorkerLoader._tryEnabled = true;
        }
    }
    static set enable(value) {
        if (WorkerLoader._enable != value) {
            WorkerLoader._enable = value;
            if (value && WorkerLoader._preLoadFun == null)
                WorkerLoader._enable = WorkerLoader.__init__();
        }
    }
    static get enable() {
        return WorkerLoader._enable;
    }
    workerMessage(data) {
        if (data) {
            switch (data.type) {
                case "Image":
                    this.imageLoaded(data);
                    break;
                case "Disable":
                    WorkerLoader.enable = false;
                    break;
            }
        }
    }
    imageLoaded(data) {
        if (!data.dataType || data.dataType != "imageBitmap") {
            this.event(data.url, null);
            return;
        }
        var imageData = data.imageBitmap;
        var tex = new Texture2D();
        tex.loadImageSource(imageData);
        console.log("load:", data.url);
        this.event(data.url, tex);
    }
    loadImage(url) {
        this.worker.postMessage(url);
    }
    _loadImage(url) {
        var _this = this;
        if (!this._useWorkerLoader || !WorkerLoader._enable) {
            WorkerLoader._preLoadFun.call(_this, url);
            return;
        }
        url = URL.formatURL(url);
        function clear() {
            WorkerLoader.I.off(url, _this, onload);
        }
        var onload = function (image) {
            clear();
            if (image) {
                _this["onLoaded"](image);
            }
            else {
                WorkerLoader._preLoadFun.call(_this, url);
            }
        };
        WorkerLoader.I.on(url, _this, onload);
        WorkerLoader.I.loadImage(url);
    }
}
WorkerLoader.workerPath = "libs/workerloader.js";
WorkerLoader._enable = false;
WorkerLoader._tryEnabled = false;
