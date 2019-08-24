import { Sprite } from "../../display/Sprite";
import { Byte } from "../../utils/Byte";
import { Handler } from "../../utils/Handler";
import { Const } from "../../Const";
import { Event } from "../../events/Event";
import { ILaya } from "../../../ILaya";
import { Matrix } from "../../maths/Matrix";
export class MovieClip extends Sprite {
    constructor(parentMovieClip = null) {
        super();
        this._start = 0;
        this._Pos = 0;
        this._ended = true;
        this._loadedImage = {};
        this._endFrame = -1;
        this.interval = 30;
        this._ids = {};
        this._idOfSprite = [];
        this._reset();
        this._playing = false;
        this._parentMovieClip = parentMovieClip;
        if (!parentMovieClip) {
            this._movieClipList = [this];
            this._isRoot = true;
            this._setBitUp(Const.DISPLAY);
        }
        else {
            this._isRoot = false;
            this._movieClipList = parentMovieClip._movieClipList;
            this._movieClipList.push(this);
        }
    }
    destroy(destroyChild = true) {
        this._clear();
        super.destroy(destroyChild);
    }
    _setDisplay(value) {
        super._setDisplay(value);
        if (this._isRoot) {
            this._onDisplay(value);
        }
    }
    _onDisplay(value) {
        if (value)
            this.timer.loop(this.interval, this, this.updates, null, true);
        else
            this.timer.clear(this, this.updates);
    }
    updates() {
        if (this._parentMovieClip)
            return;
        var i, len;
        len = this._movieClipList.length;
        for (i = 0; i < len; i++) {
            this._movieClipList[i] && this._movieClipList[i]._update();
        }
    }
    get index() {
        return this._playIndex;
    }
    set index(value) {
        this._playIndex = value;
        if (this._data)
            this._displayFrame(this._playIndex);
        if (this._labels && this._labels[value])
            this.event(Event.LABEL, this._labels[value]);
    }
    addLabel(label, index) {
        if (!this._labels)
            this._labels = {};
        this._labels[index] = label;
    }
    removeLabel(label) {
        if (!label)
            this._labels = null;
        else if (!this._labels) {
            for (var name in this._labels) {
                if (this._labels[name] === label) {
                    delete this._labels[name];
                    break;
                }
            }
        }
    }
    get count() {
        return this._count;
    }
    get playing() {
        return this._playing;
    }
    _update() {
        if (!this._data)
            return;
        if (!this._playing)
            return;
        this._playIndex++;
        if (this._playIndex >= this._count) {
            if (!this.loop) {
                this._playIndex--;
                this.stop();
                return;
            }
            this._playIndex = 0;
        }
        this._parseFrame(this._playIndex);
        if (this._labels && this._labels[this._playIndex])
            this.event(Event.LABEL, this._labels[this._playIndex]);
        if (this._endFrame != -1 && this._endFrame == this._playIndex) {
            this._endFrame = -1;
            if (this._completeHandler != null) {
                var handler = this._completeHandler;
                this._completeHandler = null;
                handler.run();
            }
            this.stop();
        }
    }
    stop() {
        this._playing = false;
    }
    gotoAndStop(index) {
        this.index = index;
        this.stop();
    }
    _clear() {
        this.stop();
        this._idOfSprite.length = 0;
        if (!this._parentMovieClip) {
            this.timer.clear(this, this.updates);
            var i, len;
            len = this._movieClipList.length;
            for (i = 0; i < len; i++) {
                if (this._movieClipList[i] != this)
                    this._movieClipList[i]._clear();
            }
            this._movieClipList.length = 0;
        }
        if (this._atlasPath) {
            ILaya.Loader.clearRes(this._atlasPath);
        }
        var key;
        for (key in this._loadedImage) {
            if (this._loadedImage[key]) {
                ILaya.Loader.clearRes(key);
                this._loadedImage[key] = false;
            }
        }
        this.removeChildren();
        this.graphics = null;
        this._parentMovieClip = null;
    }
    play(index = 0, loop = true) {
        this.loop = loop;
        this._playing = true;
        if (this._data)
            this._displayFrame(index);
    }
    _displayFrame(frameIndex = -1) {
        if (frameIndex != -1) {
            if (this._curIndex > frameIndex)
                this._reset();
            this._parseFrame(frameIndex);
        }
    }
    _reset(rm = true) {
        if (rm && this._curIndex != 1)
            this.removeChildren();
        this._preIndex = this._curIndex = -1;
        this._Pos = this._start;
    }
    _parseFrame(frameIndex) {
        var mc, sp, key, type, tPos, ttype, ifAdd = false;
        var _idOfSprite = this._idOfSprite, _data = this._data, eStr;
        if (this._ended)
            this._reset();
        _data.pos = this._Pos;
        this._ended = false;
        this._playIndex = frameIndex;
        if (this._curIndex > frameIndex && frameIndex < this._preIndex) {
            this._reset(true);
            _data.pos = this._Pos;
        }
        while ((this._curIndex <= frameIndex) && (!this._ended)) {
            type = _data.getUint16();
            switch (type) {
                case 12:
                    key = _data.getUint16();
                    tPos = this._ids[_data.getUint16()];
                    this._Pos = _data.pos;
                    _data.pos = tPos;
                    if ((ttype = _data.getUint8()) == 0) {
                        var pid = _data.getUint16();
                        sp = _idOfSprite[key];
                        if (!sp) {
                            sp = _idOfSprite[key] = new Sprite();
                            var spp = new Sprite();
                            spp.loadImage(this.basePath + pid + ".png");
                            this._loadedImage[this.basePath + pid + ".png"] = true;
                            sp.addChild(spp);
                            spp.size(_data.getFloat32(), _data.getFloat32());
                            var mat = _data._getMatrix();
                            spp.transform = mat;
                        }
                        sp.alpha = 1;
                    }
                    else if (ttype == 1) {
                        mc = _idOfSprite[key];
                        if (!mc) {
                            _idOfSprite[key] = mc = new MovieClip(this);
                            mc.interval = this.interval;
                            mc._ids = this._ids;
                            mc.basePath = this.basePath;
                            mc._setData(_data, tPos);
                            mc._initState();
                            mc.play(0);
                        }
                        mc.alpha = 1;
                    }
                    _data.pos = this._Pos;
                    break;
                case 3:
                    var node = _idOfSprite[_data.getUint16()];
                    if (node) {
                        this.addChild(node);
                        node.zOrder = _data.getUint16();
                        ifAdd = true;
                    }
                    break;
                case 4:
                    node = _idOfSprite[_data.getUint16()];
                    node && node.removeSelf();
                    break;
                case 5:
                    _idOfSprite[_data.getUint16()][MovieClip._ValueList[_data.getUint16()]] = (_data.getFloat32());
                    break;
                case 6:
                    _idOfSprite[_data.getUint16()].visible = (_data.getUint8() > 0);
                    break;
                case 7:
                    sp = _idOfSprite[_data.getUint16()];
                    var mt = sp.transform || Matrix.create();
                    mt.setTo(_data.getFloat32(), _data.getFloat32(), _data.getFloat32(), _data.getFloat32(), _data.getFloat32(), _data.getFloat32());
                    sp.transform = mt;
                    break;
                case 8:
                    _idOfSprite[_data.getUint16()].setPos(_data.getFloat32(), _data.getFloat32());
                    break;
                case 9:
                    _idOfSprite[_data.getUint16()].setSize(_data.getFloat32(), _data.getFloat32());
                    break;
                case 10:
                    _idOfSprite[_data.getUint16()].alpha = _data.getFloat32();
                    break;
                case 11:
                    _idOfSprite[_data.getUint16()].setScale(_data.getFloat32(), _data.getFloat32());
                    break;
                case 98:
                    eStr = _data.getString();
                    this.event(eStr);
                    if (eStr == "stop")
                        this.stop();
                    break;
                case 99:
                    this._curIndex = _data.getUint16();
                    ifAdd && this.updateZOrder();
                    break;
                case 100:
                    this._count = this._curIndex + 1;
                    this._ended = true;
                    if (this._playing) {
                        this.event(Event.FRAME);
                        this.event(Event.END);
                        this.event(Event.COMPLETE);
                    }
                    this._reset(false);
                    break;
            }
        }
        if (this._playing && !this._ended)
            this.event(Event.FRAME);
        this._Pos = _data.pos;
    }
    _setData(data, start) {
        this._data = data;
        this._start = start + 3;
    }
    set url(path) {
        this.load(path);
    }
    load(url, atlas = false, atlasPath = null) {
        this._url = url;
        if (atlas)
            this._atlasPath = atlasPath ? atlasPath : url.split(".swf")[0] + ".json";
        this.stop();
        this._clear();
        this._movieClipList = [this];
        var urls;
        urls = [{ url: url, type: ILaya.Loader.BUFFER }];
        if (this._atlasPath) {
            urls.push({ url: this._atlasPath, type: ILaya.Loader.ATLAS });
        }
        ILaya.loader.load(urls, Handler.create(this, this._onLoaded));
    }
    _onLoaded() {
        var data;
        data = ILaya.Loader.getRes(this._url);
        if (!data) {
            this.event(Event.ERROR, "file not find");
            return;
        }
        if (this._atlasPath && !ILaya.Loader.getAtlas(this._atlasPath)) {
            this.event(Event.ERROR, "Atlas not find");
            return;
        }
        this.basePath = this._atlasPath ? ILaya.Loader.getAtlas(this._atlasPath).dir : this._url.split(".swf")[0] + "/image/";
        this._initData(data);
    }
    _initState() {
        this._reset();
        this._ended = false;
        var preState = this._playing;
        this._playing = false;
        this._curIndex = 0;
        while (!this._ended)
            this._parseFrame(++this._curIndex);
        this._playing = preState;
    }
    _initData(data) {
        this._data = new Byte(data);
        var i, len = this._data.getUint16();
        for (i = 0; i < len; i++)
            this._ids[this._data.getInt16()] = this._data.getInt32();
        this.interval = 1000 / this._data.getUint16();
        this._setData(this._data, this._ids[32767]);
        this._initState();
        this.play(0);
        this.event(Event.LOADED);
        if (!this._parentMovieClip)
            this.timer.loop(this.interval, this, this.updates, null, true);
    }
    playTo(start, end, complete = null) {
        this._completeHandler = complete;
        this._endFrame = end;
        this.play(start, false);
    }
}
MovieClip._ValueList = ["x", "y", "width", "height", "scaleX", "scaleY", "rotation", "alpha"];
