import { KeyframeNode } from "./KeyframeNode";
import { AnimationEvent } from "./AnimationEvent";
import { FloatKeyframe } from "../core/FloatKeyframe";
import { QuaternionKeyframe } from "../core/QuaternionKeyframe";
import { Vector3Keyframe } from "../core/Vector3Keyframe";
import { HalfFloatUtils } from "../math/HalfFloatUtils";
import { ConchQuaternion } from "../math/Native/ConchQuaternion";
import { ConchVector3 } from "../math/Native/ConchVector3";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Render } from "../../renders/Render";
export class AnimationClipParser04 {
    static READ_DATA() {
        AnimationClipParser04._DATA.offset = AnimationClipParser04._reader.getUint32();
        AnimationClipParser04._DATA.size = AnimationClipParser04._reader.getUint32();
    }
    static READ_BLOCK() {
        var count = AnimationClipParser04._BLOCK.count = AnimationClipParser04._reader.getUint16();
        var blockStarts = AnimationClipParser04._BLOCK.blockStarts = [];
        var blockLengths = AnimationClipParser04._BLOCK.blockLengths = [];
        for (var i = 0; i < count; i++) {
            blockStarts.push(AnimationClipParser04._reader.getUint32());
            blockLengths.push(AnimationClipParser04._reader.getUint32());
        }
    }
    static READ_STRINGS() {
        var offset = AnimationClipParser04._reader.getUint32();
        var count = AnimationClipParser04._reader.getUint16();
        var prePos = AnimationClipParser04._reader.pos;
        AnimationClipParser04._reader.pos = offset + AnimationClipParser04._DATA.offset;
        for (var i = 0; i < count; i++)
            AnimationClipParser04._strings[i] = AnimationClipParser04._reader.readUTFString();
        AnimationClipParser04._reader.pos = prePos;
    }
    static parse(clip, reader, version) {
        AnimationClipParser04._animationClip = clip;
        AnimationClipParser04._reader = reader;
        AnimationClipParser04._version = version;
        AnimationClipParser04.READ_DATA();
        AnimationClipParser04.READ_BLOCK();
        AnimationClipParser04.READ_STRINGS();
        for (var i = 0, n = AnimationClipParser04._BLOCK.count; i < n; i++) {
            var index = reader.getUint16();
            var blockName = AnimationClipParser04._strings[index];
            var fn = AnimationClipParser04["READ_" + blockName];
            if (fn == null)
                throw new Error("model file err,no this function:" + index + " " + blockName);
            else
                fn.call(null);
        }
        AnimationClipParser04._version = null;
        AnimationClipParser04._reader = null;
        AnimationClipParser04._animationClip = null;
    }
    static READ_ANIMATIONS() {
        var i, j;
        var node;
        var reader = AnimationClipParser04._reader;
        var buffer = reader.__getBuffer();
        var startTimeTypes = [];
        var startTimeTypeCount = reader.getUint16();
        startTimeTypes.length = startTimeTypeCount;
        for (i = 0; i < startTimeTypeCount; i++)
            startTimeTypes[i] = reader.getFloat32();
        var clip = AnimationClipParser04._animationClip;
        clip.name = AnimationClipParser04._strings[reader.getUint16()];
        var clipDur = clip._duration = reader.getFloat32();
        clip.islooping = !!reader.getByte();
        clip._frameRate = reader.getInt16();
        var nodeCount = reader.getInt16();
        var nodes = clip._nodes;
        nodes.count = nodeCount;
        var nodesMap = clip._nodesMap = {};
        var nodesDic = clip._nodesDic = {};
        for (i = 0; i < nodeCount; i++) {
            node = new KeyframeNode();
            nodes.setNodeByIndex(i, node);
            node._indexInList = i;
            var type = node.type = reader.getUint8();
            var pathLength = reader.getUint16();
            node._setOwnerPathCount(pathLength);
            for (j = 0; j < pathLength; j++)
                node._setOwnerPathByIndex(j, AnimationClipParser04._strings[reader.getUint16()]);
            var nodePath = node._joinOwnerPath("/");
            var mapArray = nodesMap[nodePath];
            (mapArray) || (nodesMap[nodePath] = mapArray = []);
            mapArray.push(node);
            node.propertyOwner = AnimationClipParser04._strings[reader.getUint16()];
            var propertyLength = reader.getUint16();
            node._setPropertyCount(propertyLength);
            for (j = 0; j < propertyLength; j++)
                node._setPropertyByIndex(j, AnimationClipParser04._strings[reader.getUint16()]);
            var fullPath = nodePath + "." + node.propertyOwner + "." + node._joinProperty(".");
            nodesDic[fullPath] = node;
            node.fullPath = fullPath;
            var keyframeCount = reader.getUint16();
            node._setKeyframeCount(keyframeCount);
            var startTime;
            switch (type) {
                case 0:
                    break;
                case 1:
                case 3:
                case 4:
                    node.data = Render.supportWebGLPlusAnimation ? new ConchVector3 : new Vector3();
                    break;
                case 2:
                    node.data = Render.supportWebGLPlusAnimation ? new ConchQuaternion : new Quaternion();
                    break;
                default:
                    throw "AnimationClipParser04:unknown type.";
            }
            switch (AnimationClipParser04._version) {
                case "LAYAANIMATION:04":
                    for (j = 0; j < keyframeCount; j++) {
                        switch (type) {
                            case 0:
                                var floatKeyframe = new FloatKeyframe();
                                node._setKeyframeByIndex(j, floatKeyframe);
                                startTime = floatKeyframe.time = startTimeTypes[reader.getUint16()];
                                floatKeyframe.inTangent = reader.getFloat32();
                                floatKeyframe.outTangent = reader.getFloat32();
                                floatKeyframe.value = reader.getFloat32();
                                break;
                            case 1:
                            case 3:
                            case 4:
                                var floatArrayKeyframe = new Vector3Keyframe();
                                node._setKeyframeByIndex(j, floatArrayKeyframe);
                                startTime = floatArrayKeyframe.time = startTimeTypes[reader.getUint16()];
                                if (Render.supportWebGLPlusAnimation) {
                                    var data = floatArrayKeyframe.data = new Float32Array(3 * 3);
                                    for (var k = 0; k < 3; k++)
                                        data[k] = reader.getFloat32();
                                    for (k = 0; k < 3; k++)
                                        data[3 + k] = reader.getFloat32();
                                    for (k = 0; k < 3; k++)
                                        data[6 + k] = reader.getFloat32();
                                }
                                else {
                                    var inTangent = floatArrayKeyframe.inTangent;
                                    var outTangent = floatArrayKeyframe.outTangent;
                                    var value = floatArrayKeyframe.value;
                                    inTangent.x = reader.getFloat32();
                                    inTangent.y = reader.getFloat32();
                                    inTangent.z = reader.getFloat32();
                                    outTangent.x = reader.getFloat32();
                                    outTangent.y = reader.getFloat32();
                                    outTangent.z = reader.getFloat32();
                                    value.x = reader.getFloat32();
                                    value.y = reader.getFloat32();
                                    value.z = reader.getFloat32();
                                }
                                break;
                            case 2:
                                var quaternionKeyframe = new QuaternionKeyframe();
                                node._setKeyframeByIndex(j, quaternionKeyframe);
                                startTime = quaternionKeyframe.time = startTimeTypes[reader.getUint16()];
                                if (Render.supportWebGLPlusAnimation) {
                                    data = quaternionKeyframe.data = new Float32Array(3 * 4);
                                    for (k = 0; k < 4; k++)
                                        data[k] = reader.getFloat32();
                                    for (k = 0; k < 4; k++)
                                        data[4 + k] = reader.getFloat32();
                                    for (k = 0; k < 4; k++)
                                        data[8 + k] = reader.getFloat32();
                                }
                                else {
                                    var inTangentQua = quaternionKeyframe.inTangent;
                                    var outTangentQua = quaternionKeyframe.outTangent;
                                    var valueQua = quaternionKeyframe.value;
                                    inTangentQua.x = reader.getFloat32();
                                    inTangentQua.y = reader.getFloat32();
                                    inTangentQua.z = reader.getFloat32();
                                    inTangentQua.w = reader.getFloat32();
                                    outTangentQua.x = reader.getFloat32();
                                    outTangentQua.y = reader.getFloat32();
                                    outTangentQua.z = reader.getFloat32();
                                    outTangentQua.w = reader.getFloat32();
                                    valueQua.x = reader.getFloat32();
                                    valueQua.y = reader.getFloat32();
                                    valueQua.z = reader.getFloat32();
                                    valueQua.w = reader.getFloat32();
                                }
                                break;
                            default:
                                throw "AnimationClipParser04:unknown type.";
                        }
                    }
                    break;
                case "LAYAANIMATION:COMPRESSION_04":
                    for (j = 0; j < keyframeCount; j++) {
                        switch (type) {
                            case 0:
                                floatKeyframe = new FloatKeyframe();
                                node._setKeyframeByIndex(j, floatKeyframe);
                                startTime = floatKeyframe.time = startTimeTypes[reader.getUint16()];
                                floatKeyframe.inTangent = HalfFloatUtils.convertToNumber(reader.getUint16());
                                floatKeyframe.outTangent = HalfFloatUtils.convertToNumber(reader.getUint16());
                                floatKeyframe.value = HalfFloatUtils.convertToNumber(reader.getUint16());
                                break;
                            case 1:
                            case 3:
                            case 4:
                                floatArrayKeyframe = new Vector3Keyframe();
                                node._setKeyframeByIndex(j, floatArrayKeyframe);
                                startTime = floatArrayKeyframe.time = startTimeTypes[reader.getUint16()];
                                if (Render.supportWebGLPlusAnimation) {
                                    data = floatArrayKeyframe.data = new Float32Array(3 * 3);
                                    for (k = 0; k < 3; k++)
                                        data[k] = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    for (k = 0; k < 3; k++)
                                        data[3 + k] = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    for (k = 0; k < 3; k++)
                                        data[6 + k] = HalfFloatUtils.convertToNumber(reader.getUint16());
                                }
                                else {
                                    inTangent = floatArrayKeyframe.inTangent;
                                    outTangent = floatArrayKeyframe.outTangent;
                                    value = floatArrayKeyframe.value;
                                    inTangent.x = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    inTangent.y = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    inTangent.z = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    outTangent.x = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    outTangent.y = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    outTangent.z = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    value.x = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    value.y = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    value.z = HalfFloatUtils.convertToNumber(reader.getUint16());
                                }
                                break;
                            case 2:
                                quaternionKeyframe = new QuaternionKeyframe();
                                node._setKeyframeByIndex(j, quaternionKeyframe);
                                startTime = quaternionKeyframe.time = startTimeTypes[reader.getUint16()];
                                if (Render.supportWebGLPlusAnimation) {
                                    data = quaternionKeyframe.data = new Float32Array(3 * 4);
                                    for (k = 0; k < 4; k++)
                                        data[k] = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    for (k = 0; k < 4; k++)
                                        data[4 + k] = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    for (k = 0; k < 4; k++)
                                        data[8 + k] = HalfFloatUtils.convertToNumber(reader.getUint16());
                                }
                                else {
                                    inTangentQua = quaternionKeyframe.inTangent;
                                    outTangentQua = quaternionKeyframe.outTangent;
                                    valueQua = quaternionKeyframe.value;
                                    inTangentQua.x = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    inTangentQua.y = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    inTangentQua.z = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    inTangentQua.w = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    outTangentQua.x = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    outTangentQua.y = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    outTangentQua.z = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    outTangentQua.w = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    valueQua.x = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    valueQua.y = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    valueQua.z = HalfFloatUtils.convertToNumber(reader.getUint16());
                                    valueQua.w = HalfFloatUtils.convertToNumber(reader.getUint16());
                                }
                                break;
                            default:
                                throw "AnimationClipParser04:unknown type.";
                        }
                    }
                    break;
            }
        }
        var eventCount = reader.getUint16();
        for (i = 0; i < eventCount; i++) {
            var event = new AnimationEvent();
            event.time = Math.min(clipDur, reader.getFloat32());
            event.eventName = AnimationClipParser04._strings[reader.getUint16()];
            var params;
            var paramCount = reader.getUint16();
            (paramCount > 0) && (event.params = params = []);
            for (j = 0; j < paramCount; j++) {
                var eventType = reader.getByte();
                switch (eventType) {
                    case 0:
                        params.push(!!reader.getByte());
                        break;
                    case 1:
                        params.push(reader.getInt32());
                        break;
                    case 2:
                        params.push(reader.getFloat32());
                        break;
                    case 3:
                        params.push(AnimationClipParser04._strings[reader.getUint16()]);
                        break;
                    default:
                        throw new Error("unknown type.");
                }
            }
            clip.addEvent(event);
        }
    }
}
AnimationClipParser04._strings = [];
AnimationClipParser04._BLOCK = { count: 0 };
AnimationClipParser04._DATA = { offset: 0, size: 0 };
