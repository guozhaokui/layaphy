import { AnimationParser01 } from "./AnimationParser01";
import { AnimationParser02 } from "./AnimationParser02";
import { Resource } from "../resource/Resource";
import { MathUtil } from "../maths/MathUtil";
import { IAniLib } from "./AniLibPack";
import { Byte } from "../utils/Byte";
import { BezierLerp } from "./math/BezierLerp";
export class AnimationTemplet extends Resource {
    constructor() {
        super();
        this._anis = [];
        this._aniMap = {};
        this.unfixedLastAniIndex = -1;
        this._fullFrames = null;
        this._boneCurKeyFrm = [];
    }
    static _LinearInterpolation_0(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        out[outOfs] = data[index] + dt * dData[index];
        return 1;
    }
    static _QuaternionInterpolation_1(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        var amount = duration === 0 ? 0 : dt / duration;
        MathUtil.slerpQuaternionArray(data, index, nextData, index, amount, out, outOfs);
        return 4;
    }
    static _AngleInterpolation_2(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        return 0;
    }
    static _RadiansInterpolation_3(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        return 0;
    }
    static _Matrix4x4Interpolation_4(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        for (var i = 0; i < 16; i++, index++)
            out[outOfs + i] = data[index] + dt * dData[index];
        return 16;
    }
    static _NoInterpolation_5(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null) {
        out[outOfs] = data[index];
        return 1;
    }
    static _BezierInterpolation_6(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null, offset = 0) {
        out[outOfs] = data[index] + (nextData[index] - data[index]) * BezierLerp.getBezierRate(dt / duration, interData[offset], interData[offset + 1], interData[offset + 2], interData[offset + 3]);
        return 5;
    }
    static _BezierInterpolation_7(bone, index, out, outOfs, data, dt, dData, duration, nextData, interData = null, offset = 0) {
        out[outOfs] = interData[offset + 4] + interData[offset + 5] * BezierLerp.getBezierRate((dt * 0.001 + interData[offset + 6]) / interData[offset + 7], interData[offset], interData[offset + 1], interData[offset + 2], interData[offset + 3]);
        return 9;
    }
    parse(data) {
        var reader = new Byte(data);
        this._aniVersion = reader.readUTFString();
        AnimationParser01.parse(this, reader);
    }
    _calculateKeyFrame(node, keyframeCount, keyframeDataCount) {
        var keyFrames = node.keyFrame;
        keyFrames[keyframeCount] = keyFrames[0];
        for (var i = 0; i < keyframeCount; i++) {
            var keyFrame = keyFrames[i];
            for (var j = 0; j < keyframeDataCount; j++) {
                keyFrame.dData[j] = (keyFrame.duration === 0) ? 0 : (keyFrames[i + 1].data[j] - keyFrame.data[j]) / keyFrame.duration;
                keyFrame.nextData[j] = keyFrames[i + 1].data[j];
            }
        }
        keyFrames.length--;
    }
    _onAsynLoaded(data, propertyParams = null) {
        var reader = new Byte(data);
        this._aniVersion = reader.readUTFString();
        switch (this._aniVersion) {
            case "LAYAANIMATION:02":
                AnimationParser02.parse(this, reader);
                break;
            default:
                AnimationParser01.parse(this, reader);
        }
    }
    getAnimationCount() {
        return this._anis.length;
    }
    getAnimation(aniIndex) {
        return this._anis[aniIndex];
    }
    getAniDuration(aniIndex) {
        return this._anis[aniIndex].playTime;
    }
    getNodes(aniIndex) {
        return this._anis[aniIndex].nodes;
    }
    getNodeIndexWithName(aniIndex, name) {
        return this._anis[aniIndex].bone3DMap[name];
    }
    getNodeCount(aniIndex) {
        return this._anis[aniIndex].nodes.length;
    }
    getTotalkeyframesLength(aniIndex) {
        return this._anis[aniIndex].totalKeyframeDatasLength;
    }
    getPublicExtData() {
        return this._publicExtData;
    }
    getAnimationDataWithCache(key, cacheDatas, aniIndex, frameIndex) {
        var aniDatas = cacheDatas[aniIndex];
        if (!aniDatas) {
            return null;
        }
        else {
            var keyDatas = aniDatas[key];
            if (!keyDatas)
                return null;
            else {
                return keyDatas[frameIndex];
            }
        }
    }
    setAnimationDataWithCache(key, cacheDatas, aniIndex, frameIndex, data) {
        var aniDatas = (cacheDatas[aniIndex]) || (cacheDatas[aniIndex] = {});
        var aniDatasCache = (aniDatas[key]) || (aniDatas[key] = []);
        aniDatasCache[frameIndex] = data;
    }
    getNodeKeyFrame(nodeframes, nodeid, tm) {
        var cid = this._boneCurKeyFrm[nodeid];
        var frmNum = nodeframes.length;
        if (cid == void 0 || cid >= frmNum) {
            cid = this._boneCurKeyFrm[nodeid] = 0;
        }
        var kinfo = nodeframes[cid];
        var curFrmTm = kinfo.startTime;
        var dt = tm - curFrmTm;
        if (dt == 0 || (dt > 0 && kinfo.duration > dt)) {
            return cid;
        }
        var i = 0;
        if (dt > 0) {
            tm = tm + 0.01;
            for (i = cid + 1; i < frmNum; i++) {
                kinfo = nodeframes[i];
                if (kinfo.startTime <= tm && kinfo.startTime + kinfo.duration > tm) {
                    this._boneCurKeyFrm[nodeid] = i;
                    return i;
                }
            }
            return frmNum - 1;
        }
        else {
            for (i = 0; i < cid; i++) {
                kinfo = nodeframes[i];
                if (kinfo.startTime <= tm && kinfo.startTime + kinfo.duration > tm) {
                    this._boneCurKeyFrm[nodeid] = i;
                    return i;
                }
            }
            return cid;
        }
        return 0;
    }
    getOriginalData(aniIndex, originalData, nodesFrameIndices, frameIndex, playCurTime) {
        var oneAni = this._anis[aniIndex];
        var nodes = oneAni.nodes;
        var curKFrm = this._boneCurKeyFrm;
        if (curKFrm.length < nodes.length) {
            curKFrm.length = nodes.length;
        }
        var j = 0;
        for (var i = 0, n = nodes.length, outOfs = 0; i < n; i++) {
            var node = nodes[i];
            var key;
            var kfrm = node.keyFrame;
            key = kfrm[this.getNodeKeyFrame(kfrm, i, playCurTime)];
            node.dataOffset = outOfs;
            var dt = playCurTime - key.startTime;
            var lerpType = node.lerpType;
            if (lerpType) {
                switch (lerpType) {
                    case 0:
                    case 1:
                        for (j = 0; j < node.keyframeWidth;)
                            j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
                        break;
                    case 2:
                        var interpolationData = key.interpolationData;
                        var interDataLen = interpolationData.length;
                        var dataIndex = 0;
                        for (j = 0; j < interDataLen;) {
                            var type = interpolationData[j];
                            switch (type) {
                                case 6:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                    break;
                                case 7:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                    break;
                                default:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
                            }
                            dataIndex++;
                        }
                        break;
                }
            }
            else {
                for (j = 0; j < node.keyframeWidth;)
                    j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
            }
            outOfs += node.keyframeWidth;
        }
    }
    getNodesCurrentFrameIndex(aniIndex, playCurTime) {
        var ani = this._anis[aniIndex];
        var nodes = ani.nodes;
        if (aniIndex !== this.unfixedLastAniIndex) {
            this.unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
            this.unfixedCurrentTimes = new Float32Array(nodes.length);
            this.unfixedLastAniIndex = aniIndex;
        }
        for (var i = 0, n = nodes.length, outOfs = 0; i < n; i++) {
            var node = nodes[i];
            if (playCurTime < this.unfixedCurrentTimes[i])
                this.unfixedCurrentFrameIndexes[i] = 0;
            this.unfixedCurrentTimes[i] = playCurTime;
            while ((this.unfixedCurrentFrameIndexes[i] < node.keyFrame.length)) {
                if (node.keyFrame[this.unfixedCurrentFrameIndexes[i]].startTime > this.unfixedCurrentTimes[i])
                    break;
                this.unfixedCurrentFrameIndexes[i]++;
            }
            this.unfixedCurrentFrameIndexes[i]--;
        }
        return this.unfixedCurrentFrameIndexes;
    }
    getOriginalDataUnfixedRate(aniIndex, originalData, playCurTime) {
        var oneAni = this._anis[aniIndex];
        var nodes = oneAni.nodes;
        if (aniIndex !== this.unfixedLastAniIndex) {
            this.unfixedCurrentFrameIndexes = new Uint32Array(nodes.length);
            this.unfixedCurrentTimes = new Float32Array(nodes.length);
            this.unfixedKeyframes = [];
            this.unfixedLastAniIndex = aniIndex;
        }
        var j = 0;
        for (var i = 0, n = nodes.length, outOfs = 0; i < n; i++) {
            var node = nodes[i];
            if (playCurTime < this.unfixedCurrentTimes[i])
                this.unfixedCurrentFrameIndexes[i] = 0;
            this.unfixedCurrentTimes[i] = playCurTime;
            while (this.unfixedCurrentFrameIndexes[i] < node.keyFrame.length) {
                if (node.keyFrame[this.unfixedCurrentFrameIndexes[i]].startTime > this.unfixedCurrentTimes[i])
                    break;
                this.unfixedKeyframes[i] = node.keyFrame[this.unfixedCurrentFrameIndexes[i]];
                this.unfixedCurrentFrameIndexes[i]++;
            }
            var key = this.unfixedKeyframes[i];
            node.dataOffset = outOfs;
            var dt = playCurTime - key.startTime;
            var lerpType = node.lerpType;
            if (lerpType) {
                switch (node.lerpType) {
                    case 0:
                    case 1:
                        for (j = 0; j < node.keyframeWidth;)
                            j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
                        break;
                    case 2:
                        var interpolationData = key.interpolationData;
                        var interDataLen = interpolationData.length;
                        var dataIndex = 0;
                        for (j = 0; j < interDataLen;) {
                            var type = interpolationData[j];
                            switch (type) {
                                case 6:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                    break;
                                case 7:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData, interpolationData, j + 1);
                                    break;
                                default:
                                    j += AnimationTemplet.interpolation[type](node, dataIndex, originalData, outOfs + dataIndex, key.data, dt, key.dData, key.duration, key.nextData);
                            }
                            dataIndex++;
                        }
                        break;
                }
            }
            else {
                for (j = 0; j < node.keyframeWidth;)
                    j += node.interpolationMethod[j](node, j, originalData, outOfs + j, key.data, dt, key.dData, key.duration, key.nextData);
            }
            outOfs += node.keyframeWidth;
        }
    }
}
AnimationTemplet.interpolation = [AnimationTemplet._LinearInterpolation_0, AnimationTemplet._QuaternionInterpolation_1, AnimationTemplet._AngleInterpolation_2, AnimationTemplet._RadiansInterpolation_3, AnimationTemplet._Matrix4x4Interpolation_4, AnimationTemplet._NoInterpolation_5, AnimationTemplet._BezierInterpolation_6, AnimationTemplet._BezierInterpolation_7];
IAniLib.AnimationTemplet = AnimationTemplet;
