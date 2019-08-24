import { WebGLVideo } from "./WebGLVideo";
import { Sprite } from "laya/display/Sprite";
import { Texture } from "laya/resource/Texture";
import { ILaya } from "ILaya";
export class Video extends Sprite {
    constructor(width = 320, height = 240) {
        super();
        this.htmlVideo = new WebGLVideo();
        this.videoElement = this.htmlVideo.getVideo();
        this.videoElement.layaTarget = this;
        this.internalTexture = new Texture(this.htmlVideo);
        this.videoElement.addEventListener("abort", Video.onAbort);
        this.videoElement.addEventListener("canplay", Video.onCanplay);
        this.videoElement.addEventListener("canplaythrough", Video.onCanplaythrough);
        this.videoElement.addEventListener("durationchange", Video.onDurationchange);
        this.videoElement.addEventListener("emptied", Video.onEmptied);
        this.videoElement.addEventListener("error", Video.onError);
        this.videoElement.addEventListener("loadeddata", Video.onLoadeddata);
        this.videoElement.addEventListener("loadedmetadata", Video.onLoadedmetadata);
        this.videoElement.addEventListener("loadstart", Video.onLoadstart);
        this.videoElement.addEventListener("pause", Video.onPause);
        this.videoElement.addEventListener("play", Video.onPlay);
        this.videoElement.addEventListener("playing", Video.onPlaying);
        this.videoElement.addEventListener("progress", Video.onProgress);
        this.videoElement.addEventListener("ratechange", Video.onRatechange);
        this.videoElement.addEventListener("seeked", Video.onSeeked);
        this.videoElement.addEventListener("seeking", Video.onSeeking);
        this.videoElement.addEventListener("stalled", Video.onStalled);
        this.videoElement.addEventListener("suspend", Video.onSuspend);
        this.videoElement.addEventListener("timeupdate", Video.onTimeupdate);
        this.videoElement.addEventListener("volumechange", Video.onVolumechange);
        this.videoElement.addEventListener("waiting", Video.onWaiting);
        this.videoElement.addEventListener("ended", this.onPlayComplete['bind'](this));
        this.size(width, height);
        if (ILaya.Browser.onMobile) {
            this.onDocumentClick = this.onDocumentClick.bind(this);
            ILaya.Browser.document.addEventListener("touchend", this.onDocumentClick);
        }
    }
    static onAbort(e) { e.target.layaTarget.event("abort"); }
    static onCanplay(e) { e.target.layaTarget.event("canplay"); }
    static onCanplaythrough(e) { e.target.layaTarget.event("canplaythrough"); }
    static onDurationchange(e) { e.target.layaTarget.event("durationchange"); }
    static onEmptied(e) { e.target.layaTarget.event("emptied"); }
    static onError(e) { e.target.layaTarget.event("error"); }
    static onLoadeddata(e) { e.target.layaTarget.event("loadeddata"); }
    static onLoadedmetadata(e) { e.target.layaTarget.event("loadedmetadata"); }
    static onLoadstart(e) { e.target.layaTarget.event("loadstart"); }
    static onPause(e) { e.target.layaTarget.event("pause"); }
    static onPlay(e) { e.target.layaTarget.event("play"); }
    static onPlaying(e) { e.target.layaTarget.event("playing"); }
    static onProgress(e) { e.target.layaTarget.event("progress"); }
    static onRatechange(e) { e.target.layaTarget.event("ratechange"); }
    static onSeeked(e) { e.target.layaTarget.event("seeked"); }
    static onSeeking(e) { e.target.layaTarget.event("seeking"); }
    static onStalled(e) { e.target.layaTarget.event("stalled"); }
    static onSuspend(e) { e.target.layaTarget.event("suspend"); }
    static onTimeupdate(e) { e.target.layaTarget.event("timeupdate"); }
    static onVolumechange(e) { e.target.layaTarget.event("volumechange"); }
    static onWaiting(e) { e.target.layaTarget.event("waiting"); }
    onPlayComplete(e) {
        this.event("ended");
        if (!ILaya.Render.isConchApp || !this.videoElement || !this.videoElement.loop)
            ILaya.timer.clear(this, this.renderCanvas);
    }
    load(url) {
        if (url.indexOf("blob:") == 0)
            this.videoElement.src = url;
        else
            this.htmlVideo.setSource(url, Video.MP4);
    }
    play() {
        this.videoElement.play();
        ILaya.timer.frameLoop(1, this, this.renderCanvas);
    }
    pause() {
        this.videoElement.pause();
        ILaya.timer.clear(this, this.renderCanvas);
    }
    reload() {
        this.videoElement.load();
    }
    canPlayType(type) {
        var typeString;
        switch (type) {
            case Video.MP4:
                typeString = "video/mp4";
                break;
            case Video.OGG:
                typeString = "video/ogg";
                break;
            case Video.WEBM:
                typeString = "video/webm";
                break;
        }
        return this.videoElement.canPlayType(typeString);
    }
    renderCanvas() {
        if (this.readyState === 0)
            return;
        this.htmlVideo['updateTexture']();
        this.graphics.clear();
        this.graphics.drawTexture(this.internalTexture, 0, 0, this.width, this.height);
    }
    onDocumentClick() {
        this.videoElement.play();
        this.videoElement.pause();
        ILaya.Browser.document.removeEventListener("touchend", this.onDocumentClick);
    }
    get buffered() {
        return this.videoElement.buffered;
    }
    get currentSrc() {
        return this.videoElement.currentSrc;
    }
    get currentTime() {
        return this.videoElement.currentTime;
    }
    set currentTime(value) {
        this.videoElement.currentTime = value;
        this.renderCanvas();
    }
    set volume(value) {
        this.videoElement.volume = value;
    }
    get volume() {
        return this.videoElement.volume;
    }
    get readyState() {
        return this.videoElement.readyState;
    }
    get videoWidth() {
        return this.videoElement.videoWidth;
    }
    get videoHeight() {
        return this.videoElement.videoHeight;
    }
    get duration() {
        return this.videoElement.duration;
    }
    get ended() {
        return this.videoElement.ended;
    }
    get error() {
        return this.videoElement.error;
    }
    get loop() {
        return this.videoElement.loop;
    }
    set loop(value) {
        this.videoElement.loop = value;
    }
    set x(val) {
        super.x = val;
        if (ILaya.Render.isConchApp) {
            var transform = ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
            this.videoElement.style.left = transform.x;
        }
    }
    get x() {
        return super.x;
    }
    set y(val) {
        super.y = val;
        if (ILaya.Render.isConchApp) {
            var transform = ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
            this.videoElement.style.top = transform.y;
        }
    }
    get y() {
        return super.y;
    }
    get playbackRate() {
        return this.videoElement.playbackRate;
    }
    set playbackRate(value) {
        this.videoElement.playbackRate = value;
    }
    get muted() {
        return this.videoElement.muted;
    }
    set muted(value) {
        this.videoElement.muted = value;
    }
    get paused() {
        return this.videoElement.paused;
    }
    get preload() {
        return this.videoElement.preload;
    }
    set preload(value) {
        this.videoElement.preload = value;
    }
    get seekable() {
        return this.videoElement.seekable;
    }
    get seeking() {
        return this.videoElement.seeking;
    }
    size(width, height) {
        super.size(width, height);
        if (ILaya.Render.isConchApp) {
            var transform = ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
            this.videoElement.width = width * transform.scaleX;
        }
        else {
            this.videoElement.width = width / ILaya.Browser.pixelRatio;
        }
        if (this.paused)
            this.renderCanvas();
        return this;
    }
    set width(value) {
        if (ILaya.Render.isConchApp) {
            var transform = ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
            this.videoElement.width = value * transform.scaleX;
        }
        else {
            this.videoElement.width = this.width / ILaya.Browser.pixelRatio;
        }
        super.width = value;
        if (this.paused)
            this.renderCanvas();
    }
    get width() {
        return super.width;
    }
    set height(value) {
        if (ILaya.Render.isConchApp) {
            var transform = ILaya.Utils.getTransformRelativeToWindow(this, 0, 0);
            this.videoElement.height = value * transform.scaleY;
        }
        else {
            this.videoElement.height = this.height / ILaya.Browser.pixelRatio;
        }
        super.height = value;
    }
    get height() {
        return super.height;
    }
    destroy(detroyChildren = true) {
        super.destroy(detroyChildren);
        this.videoElement.removeEventListener("abort", Video.onAbort);
        this.videoElement.removeEventListener("canplay", Video.onCanplay);
        this.videoElement.removeEventListener("canplaythrough", Video.onCanplaythrough);
        this.videoElement.removeEventListener("durationchange", Video.onDurationchange);
        this.videoElement.removeEventListener("emptied", Video.onEmptied);
        this.videoElement.removeEventListener("error", Video.onError);
        this.videoElement.removeEventListener("loadeddata", Video.onLoadeddata);
        this.videoElement.removeEventListener("loadedmetadata", Video.onLoadedmetadata);
        this.videoElement.removeEventListener("loadstart", Video.onLoadstart);
        this.videoElement.removeEventListener("pause", Video.onPause);
        this.videoElement.removeEventListener("play", Video.onPlay);
        this.videoElement.removeEventListener("playing", Video.onPlaying);
        this.videoElement.removeEventListener("progress", Video.onProgress);
        this.videoElement.removeEventListener("ratechange", Video.onRatechange);
        this.videoElement.removeEventListener("seeked", Video.onSeeked);
        this.videoElement.removeEventListener("seeking", Video.onSeeking);
        this.videoElement.removeEventListener("stalled", Video.onStalled);
        this.videoElement.removeEventListener("suspend", Video.onSuspend);
        this.videoElement.removeEventListener("timeupdate", Video.onTimeupdate);
        this.videoElement.removeEventListener("volumechange", Video.onVolumechange);
        this.videoElement.removeEventListener("waiting", Video.onWaiting);
        this.videoElement.removeEventListener("ended", this.onPlayComplete);
        this.pause();
        this.videoElement.layaTarget = null;
        this.videoElement = null;
        this.htmlVideo.destroy();
    }
    syncVideoPosition() {
        var stage = ILaya.stage;
        var rec;
        rec = ILaya.Utils.getGlobalPosAndScale(this);
        var a = stage._canvasTransform.a, d = stage._canvasTransform.d;
        var x = rec.x * stage.clientScaleX * a + stage.offset.x;
        var y = rec.y * stage.clientScaleY * d + stage.offset.y;
        this.videoElement.style.left = x + 'px';
        ;
        this.videoElement.style.top = y + 'px';
        this.videoElement.width = this.width / ILaya.Browser.pixelRatio;
        this.videoElement.height = this.height / ILaya.Browser.pixelRatio;
    }
}
Video.MP4 = 1;
Video.OGG = 2;
Video.CAMERA = 4;
Video.WEBM = 8;
Video.SUPPORT_PROBABLY = "probably";
Video.SUPPORT_MAYBY = "maybe";
Video.SUPPORT_NO = "";
