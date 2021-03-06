import { LayaGL } from "../../layagl/LayaGL";
import { Render } from "../../renders/Render";
import { Stat } from "../../utils/Stat";
import { Color } from "../math/Color";
import { Vector3 } from "../math/Vector3";
import { Utils3D } from "../utils/Utils3D";
import { DynamicBatchManager } from "./DynamicBatchManager";
import { StaticBatchManager } from "./StaticBatchManager";
export class FrustumCulling {
    constructor() {
    }
    static __init__() {
        if (Render.supportWebGLPlusCulling) {
            FrustumCulling._cullingBufferLength = 0;
            FrustumCulling._cullingBuffer = new Float32Array(4096);
        }
    }
    static _drawTraversalCullingBound(renderList, debugTool) {
        var validCount = renderList.length;
        var renders = renderList.elements;
        for (var i = 0, n = renderList.length; i < n; i++) {
            var color = FrustumCulling._tempColor0;
            color.r = 0;
            color.g = 1;
            color.b = 0;
            color.a = 1;
            Utils3D._drawBound(debugTool, renders[i].bounds._getBoundBox(), color);
        }
    }
    static _traversalCulling(camera, scene, context, renderList, customShader, replacementTag) {
        var validCount = renderList.length;
        var renders = renderList.elements;
        var boundFrustum = camera.boundFrustum;
        var camPos = camera._transform.position;
        for (var i = 0; i < validCount; i++) {
            var render = renders[i];
            if (camera._isLayerVisible(render._owner._layer) && render._enable) {
                Stat.frustumCulling++;
                if (!camera.useOcclusionCulling || render._needRender(boundFrustum)) {
                    render._visible = true;
                    render._distanceForSort = Vector3.distance(render.bounds.getCenter(), camPos);
                    var elements = render._renderElements;
                    for (var j = 0, m = elements.length; j < m; j++)
                        elements[j]._update(scene, context, customShader, replacementTag);
                }
                else {
                    render._visible = false;
                }
            }
            else {
                render._visible = false;
            }
        }
    }
    static renderObjectCulling(camera, scene, context, renderList, customShader, replacementTag) {
        var i, n, j, m;
        var opaqueQueue = scene._opaqueQueue;
        var transparentQueue = scene._transparentQueue;
        opaqueQueue.clear();
        transparentQueue.clear();
        var staticBatchManagers = StaticBatchManager._managers;
        for (i = 0, n = staticBatchManagers.length; i < n; i++)
            staticBatchManagers[i]._clear();
        var dynamicBatchManagers = DynamicBatchManager._managers;
        for (i = 0, n = dynamicBatchManagers.length; i < n; i++)
            dynamicBatchManagers[i]._clear();
        var octree = scene._octree;
        if (octree) {
            octree.updateMotionObjects();
            octree.shrinkRootIfPossible();
            octree.getCollidingWithFrustum(context, customShader, replacementTag);
        }
        FrustumCulling._traversalCulling(camera, scene, context, renderList, customShader, replacementTag);
        if (FrustumCulling.debugFrustumCulling) {
            var debugTool = scene._debugTool;
            debugTool.clear();
            if (octree) {
                octree.drawAllBounds(debugTool);
                octree.drawAllObjects(debugTool);
            }
            FrustumCulling._drawTraversalCullingBound(renderList, debugTool);
        }
        var count = opaqueQueue.elements.length;
        (count > 0) && (opaqueQueue._quickSort(0, count - 1));
        count = transparentQueue.elements.length;
        (count > 0) && (transparentQueue._quickSort(0, count - 1));
    }
    static renderObjectCullingNative(camera, scene, context, renderList, customShader, replacementTag) {
        var i, n, j, m;
        var opaqueQueue = scene._opaqueQueue;
        var transparentQueue = scene._transparentQueue;
        opaqueQueue.clear();
        transparentQueue.clear();
        var staticBatchManagers = StaticBatchManager._managers;
        for (i = 0, n = staticBatchManagers.length; i < n; i++)
            staticBatchManagers[i]._clear();
        var dynamicBatchManagers = DynamicBatchManager._managers;
        for (i = 0, n = dynamicBatchManagers.length; i < n; i++)
            dynamicBatchManagers[i]._clear();
        var validCount = renderList.length;
        var renders = renderList.elements;
        for (i = 0; i < validCount; i++) {
            renders[i].bounds;
        }
        var boundFrustum = camera.boundFrustum;
        FrustumCulling.cullingNative(camera._boundFrustumBuffer, FrustumCulling._cullingBuffer, scene._cullingBufferIndices, validCount, scene._cullingBufferResult);
        var camPos = context.camera._transform.position;
        for (i = 0; i < validCount; i++) {
            var render = renders[i];
            if (camera._isLayerVisible(render._owner._layer) && render._enable && scene._cullingBufferResult[i]) {
                render._visible = true;
                render._distanceForSort = Vector3.distance(render.bounds.getCenter(), camPos);
                var elements = render._renderElements;
                for (j = 0, m = elements.length; j < m; j++) {
                    var element = elements[j];
                    element._update(scene, context, customShader, replacementTag);
                }
            }
            else {
                render._visible = false;
            }
        }
        var count = opaqueQueue.elements.length;
        (count > 0) && (opaqueQueue._quickSort(0, count - 1));
        count = transparentQueue.elements.length;
        (count > 0) && (transparentQueue._quickSort(0, count - 1));
    }
    static cullingNative(boundFrustumBuffer, cullingBuffer, cullingBufferIndices, cullingCount, cullingBufferResult) {
        return LayaGL.instance.culling(boundFrustumBuffer, cullingBuffer, cullingBufferIndices, cullingCount, cullingBufferResult);
    }
}
FrustumCulling._tempVector3 = new Vector3();
FrustumCulling._tempColor0 = new Color();
FrustumCulling.debugFrustumCulling = false;
