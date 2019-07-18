import { Event } from "../../events/Event";
import { LayaGL } from "../../layagl/LayaGL";
import { Render } from "../../renders/Render";
import { BaseTexture } from "../../resource/BaseTexture";
import { FrustumCulling } from "../graphics/FrustumCulling";
import { BoundFrustum } from "../math/BoundFrustum";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Viewport } from "../math/Viewport";
import { RenderTexture } from "../resource/RenderTexture";
import { ShaderData } from "../shader/ShaderData";
import { Picker } from "../utils/Picker";
import { BaseCamera } from "./BaseCamera";
import { Transform3D } from "./Transform3D";
import { BlitScreenQuadCMD } from "./render/command/BlitScreenQuadCMD";
import { CommandBuffer } from "./render/command/CommandBuffer";
import { RenderContext3D } from "./render/RenderContext3D";
import { Scene3DShaderDeclaration } from "./scene/Scene3DShaderDeclaration";
import { Laya } from "../../../Laya";
export class Camera extends BaseCamera {
    constructor(aspectRatio = 0, nearPlane = 0.3, farPlane = 1000) {
        super(nearPlane, farPlane);
        this._updateViewMatrix = true;
        this._offScreenRenderTexture = null;
        this._postProcess = null;
        this._enableHDR = false;
        this._renderTexture = null;
        this._postProcessCommandBuffers = [];
        this.enableRender = true;
        this._viewMatrix = new Matrix4x4();
        this._projectionMatrix = new Matrix4x4();
        this._projectionViewMatrix = new Matrix4x4();
        this._viewport = new Viewport(0, 0, 0, 0);
        this._normalizedViewport = new Viewport(0, 0, 1, 1);
        this._aspectRatio = aspectRatio;
        this._boundFrustum = new BoundFrustum(Matrix4x4.DEFAULT);
        if (Render.supportWebGLPlusCulling)
            this._boundFrustumBuffer = new Float32Array(24);
        this._calculateProjectionMatrix();
        Laya.stage.on(Event.RESIZE, this, this._onScreenSizeChanged);
        this.transform.on(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
    }
    get aspectRatio() {
        if (this._aspectRatio === 0) {
            var vp = this.viewport;
            return vp.width / vp.height;
        }
        return this._aspectRatio;
    }
    set aspectRatio(value) {
        if (value < 0)
            throw new Error("Camera: the aspect ratio has to be a positive real number.");
        this._aspectRatio = value;
        this._calculateProjectionMatrix();
    }
    get viewport() {
        if (this._offScreenRenderTexture)
            this._calculationViewport(this._normalizedViewport, this._offScreenRenderTexture.width, this._offScreenRenderTexture.height);
        else
            this._calculationViewport(this._normalizedViewport, RenderContext3D.clientWidth, RenderContext3D.clientHeight);
        return this._viewport;
    }
    set viewport(value) {
        var width;
        var height;
        if (this._offScreenRenderTexture) {
            width = this._offScreenRenderTexture.width;
            height = this._offScreenRenderTexture.height;
        }
        else {
            width = RenderContext3D.clientWidth;
            height = RenderContext3D.clientHeight;
        }
        this._normalizedViewport.x = value.x / width;
        this._normalizedViewport.y = value.y / height;
        this._normalizedViewport.width = value.width / width;
        this._normalizedViewport.height = value.height / height;
        this._calculationViewport(this._normalizedViewport, width, height);
        this._calculateProjectionMatrix();
    }
    get normalizedViewport() {
        return this._normalizedViewport;
    }
    set normalizedViewport(value) {
        var width;
        var height;
        if (this._offScreenRenderTexture) {
            width = this._offScreenRenderTexture.width;
            height = this._offScreenRenderTexture.height;
        }
        else {
            width = RenderContext3D.clientWidth;
            height = RenderContext3D.clientHeight;
        }
        if (this._normalizedViewport !== value)
            value.cloneTo(this._normalizedViewport);
        this._calculationViewport(value, width, height);
        this._calculateProjectionMatrix();
    }
    get viewMatrix() {
        if (this._updateViewMatrix) {
            var scale = this.transform.scale;
            var scaleX = scale.x;
            var scaleY = scale.y;
            var scaleZ = scale.z;
            var viewMatE = this._viewMatrix.elements;
            this.transform.worldMatrix.cloneTo(this._viewMatrix);
            viewMatE[0] /= scaleX;
            viewMatE[1] /= scaleX;
            viewMatE[2] /= scaleX;
            viewMatE[4] /= scaleY;
            viewMatE[5] /= scaleY;
            viewMatE[6] /= scaleY;
            viewMatE[8] /= scaleZ;
            viewMatE[9] /= scaleZ;
            viewMatE[10] /= scaleZ;
            this._viewMatrix.invert(this._viewMatrix);
            this._updateViewMatrix = false;
        }
        return this._viewMatrix;
    }
    get projectionMatrix() {
        return this._projectionMatrix;
    }
    set projectionMatrix(value) {
        this._projectionMatrix = value;
        this._useUserProjectionMatrix = true;
    }
    get projectionViewMatrix() {
        Matrix4x4.multiply(this.projectionMatrix, this.viewMatrix, this._projectionViewMatrix);
        return this._projectionViewMatrix;
    }
    get boundFrustum() {
        this._boundFrustum.matrix = this.projectionViewMatrix;
        if (Render.supportWebGLPlusCulling) {
            var near = this._boundFrustum.near;
            var far = this._boundFrustum.far;
            var left = this._boundFrustum.left;
            var right = this._boundFrustum.right;
            var top = this._boundFrustum.top;
            var bottom = this._boundFrustum.bottom;
            var nearNE = near.normal;
            var farNE = far.normal;
            var leftNE = left.normal;
            var rightNE = right.normal;
            var topNE = top.normal;
            var bottomNE = bottom.normal;
            var buffer = this._boundFrustumBuffer;
            buffer[0] = nearNE.x, buffer[1] = nearNE.y, buffer[2] = nearNE.z, buffer[3] = near.distance;
            buffer[4] = farNE.x, buffer[5] = farNE.y, buffer[6] = farNE.z, buffer[7] = far.distance;
            buffer[8] = leftNE.x, buffer[9] = leftNE.y, buffer[10] = leftNE.z, buffer[11] = left.distance;
            buffer[12] = rightNE.x, buffer[13] = rightNE.y, buffer[14] = rightNE.z, buffer[15] = right.distance;
            buffer[16] = topNE.x, buffer[17] = topNE.y, buffer[18] = topNE.z, buffer[19] = top.distance;
            buffer[20] = bottomNE.x, buffer[21] = bottomNE.y, buffer[22] = bottomNE.z, buffer[23] = bottom.distance;
        }
        return this._boundFrustum;
    }
    get renderTarget() {
        return this._offScreenRenderTexture;
    }
    set renderTarget(value) {
        if (this._offScreenRenderTexture !== value) {
            this._offScreenRenderTexture = value;
            this._calculateProjectionMatrix();
        }
    }
    get postProcess() {
        return this._postProcess;
    }
    set postProcess(value) {
        this._postProcess = value;
        var postProcessCommandBuffer = new CommandBuffer();
        this.addCommandBuffer(Camera.CAMERAEVENT_POSTPROCESS, postProcessCommandBuffer);
        value._init(this, postProcessCommandBuffer);
    }
    get enableHDR() {
        return this._enableHDR;
    }
    set enableHDR(value) {
        this._enableHDR = value;
    }
    _isLayerVisible(layer) {
        return (Math.pow(2, layer) & this.cullingMask) != 0;
    }
    _onTransformChanged(flag) {
        flag &= Transform3D.TRANSFORM_WORLDMATRIX;
        (flag) && (this._updateViewMatrix = true);
    }
    _calculationViewport(normalizedViewport, width, height) {
        var lx = normalizedViewport.x * width;
        var ly = normalizedViewport.y * height;
        var rx = lx + Math.max(normalizedViewport.width * width, 0);
        var ry = ly + Math.max(normalizedViewport.height * height, 0);
        var ceilLeftX = Math.ceil(lx);
        var ceilLeftY = Math.ceil(ly);
        var floorRightX = Math.floor(rx);
        var floorRightY = Math.floor(ry);
        var pixelLeftX = ceilLeftX - lx >= 0.5 ? Math.floor(lx) : ceilLeftX;
        var pixelLeftY = ceilLeftY - ly >= 0.5 ? Math.floor(ly) : ceilLeftY;
        var pixelRightX = rx - floorRightX >= 0.5 ? Math.ceil(rx) : floorRightX;
        var pixelRightY = ry - floorRightY >= 0.5 ? Math.ceil(ry) : floorRightY;
        this._viewport.x = pixelLeftX;
        this._viewport.y = pixelLeftY;
        this._viewport.width = pixelRightX - pixelLeftX;
        this._viewport.height = pixelRightY - pixelLeftY;
    }
    _parse(data, spriteMap) {
        super._parse(data, spriteMap);
        var viewport = data.viewport;
        this.normalizedViewport = new Viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
        var enableHDR = data.enableHDR;
        (enableHDR !== undefined) && (this.enableHDR = enableHDR);
    }
    _calculateProjectionMatrix() {
        if (!this._useUserProjectionMatrix) {
            if (this._orthographic) {
                var halfWidth = this.orthographicVerticalSize * this.aspectRatio * 0.5;
                var halfHeight = this.orthographicVerticalSize * 0.5;
                Matrix4x4.createOrthoOffCenter(-halfWidth, halfWidth, -halfHeight, halfHeight, this.nearPlane, this.farPlane, this._projectionMatrix);
            }
            else {
                Matrix4x4.createPerspective(3.1416 * this.fieldOfView / 180.0, this.aspectRatio, this.nearPlane, this.farPlane, this._projectionMatrix);
            }
        }
    }
    _getCanvasHeight() {
        if (this._offScreenRenderTexture)
            return this._offScreenRenderTexture.height;
        else
            return RenderContext3D.clientHeight;
    }
    _applyPostProcessCommandBuffers() {
        for (var i = 0, n = this._postProcessCommandBuffers.length; i < n; i++)
            this._postProcessCommandBuffers[i]._apply();
    }
    _getRenderTextureFormat() {
        if (this._enableHDR)
            return BaseTexture.RENDERTEXTURE_FORMAT_RGBA_HALF_FLOAT;
        else
            return BaseTexture.FORMAT_R8G8B8;
    }
    render(shader = null, replacementTag = null) {
        if (!this._scene)
            return;
        var createRenderTexture = this._postProcess || this._enableHDR ? true : false;
        if (createRenderTexture)
            this._renderTexture = RenderTexture.createFromPool(RenderContext3D.clientWidth, RenderContext3D.clientHeight, this._getRenderTextureFormat(), BaseTexture.FORMAT_DEPTH_16, BaseTexture.FILTERMODE_BILINEAR);
        var gl = LayaGL.instance;
        var context = RenderContext3D._instance;
        var scene = context.scene = this._scene;
        if (scene.parallelSplitShadowMaps[0]) {
            ShaderData.setRuntimeValueMode(false);
            var parallelSplitShadowMap = scene.parallelSplitShadowMaps[0];
            parallelSplitShadowMap._calcAllLightCameraInfo(this);
            scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_CAST_SHADOW);
            for (var i = 0, n = parallelSplitShadowMap.shadowMapCount; i < n; i++) {
                var smCamera = parallelSplitShadowMap.cameras[i];
                context.camera = smCamera;
                FrustumCulling.renderObjectCulling(smCamera, scene, context, scene._castShadowRenders, shader, replacementTag);
                var shadowMap = parallelSplitShadowMap.cameras[i + 1].renderTarget;
                shadowMap._start();
                context.camera = smCamera;
                context.viewport = smCamera.viewport;
                smCamera._prepareCameraToRender();
                smCamera._applyViewProject(context, smCamera.viewMatrix, smCamera.projectionMatrix, false);
                scene._clear(gl, context);
                var queue = scene._opaqueQueue;
                queue._render(context, false);
                shadowMap._end();
            }
            scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_CAST_SHADOW);
            ShaderData.setRuntimeValueMode(true);
        }
        context.camera = this;
        scene._preRenderScript();
        var renderTar = this._renderTexture || this._offScreenRenderTexture;
        (renderTar) && (renderTar._start());
        context.viewport = this.viewport;
        this._prepareCameraToRender();
        this._applyViewProject(context, this.viewMatrix, this._projectionMatrix, renderTar ? true : false);
        scene._preCulling(context, this, shader, replacementTag);
        scene._clear(gl, context);
        scene._renderScene(context);
        scene._postRenderScript();
        (renderTar) && (renderTar._end());
        if (createRenderTexture) {
            if (this._postProcess) {
                this._postProcess._render();
                this._applyPostProcessCommandBuffers();
            }
            else if (this._enableHDR) {
                var blit = BlitScreenQuadCMD.create(this._renderTexture, this._offScreenRenderTexture ? this._offScreenRenderTexture : null);
                blit.run();
                blit.recover();
            }
            RenderTexture.recoverToPool(this._renderTexture);
        }
    }
    _applyViewProject(context, viewMat, proMat, inverseY) {
        var projectView;
        var shaderData = this._shaderValues;
        if (inverseY) {
            Matrix4x4.multiply(BaseCamera._invertYScaleMatrix, proMat, BaseCamera._invertYProjectionMatrix);
            Matrix4x4.multiply(BaseCamera._invertYProjectionMatrix, viewMat, BaseCamera._invertYProjectionViewMatrix);
            proMat = BaseCamera._invertYProjectionMatrix;
            projectView = BaseCamera._invertYProjectionViewMatrix;
        }
        else {
            Matrix4x4.multiply(proMat, viewMat, this._projectionViewMatrix);
            projectView = this._projectionViewMatrix;
        }
        context.viewMatrix = viewMat;
        context.projectionMatrix = proMat;
        context.projectionViewMatrix = projectView;
        shaderData.setMatrix4x4(BaseCamera.VIEWMATRIX, viewMat);
        shaderData.setMatrix4x4(BaseCamera.PROJECTMATRIX, proMat);
        shaderData.setMatrix4x4(BaseCamera.VIEWPROJECTMATRIX, projectView);
    }
    viewportPointToRay(point, out) {
        Picker.calculateCursorRay(point, this.viewport, this._projectionMatrix, this.viewMatrix, null, out);
    }
    normalizedViewportPointToRay(point, out) {
        var finalPoint = Camera._tempVector20;
        var vp = this.viewport;
        finalPoint.x = point.x * vp.width;
        finalPoint.y = point.y * vp.height;
        Picker.calculateCursorRay(finalPoint, this.viewport, this._projectionMatrix, this.viewMatrix, null, out);
    }
    worldToViewportPoint(position, out) {
        Matrix4x4.multiply(this._projectionMatrix, this._viewMatrix, this._projectionViewMatrix);
        this.viewport.project(position, this._projectionViewMatrix, out);
        out.x = out.x / Laya.stage.clientScaleX;
        out.y = out.y / Laya.stage.clientScaleY;
    }
    worldToNormalizedViewportPoint(position, out) {
        Matrix4x4.multiply(this._projectionMatrix, this._viewMatrix, this._projectionViewMatrix);
        this.normalizedViewport.project(position, this._projectionViewMatrix, out);
        out.x = out.x / Laya.stage.clientScaleX;
        out.y = out.y / Laya.stage.clientScaleY;
    }
    convertScreenCoordToOrthographicCoord(source, out) {
        if (this._orthographic) {
            var clientWidth = RenderContext3D.clientWidth;
            var clientHeight = RenderContext3D.clientHeight;
            var ratioX = this.orthographicVerticalSize * this.aspectRatio / clientWidth;
            var ratioY = this.orthographicVerticalSize / clientHeight;
            out.x = (-clientWidth / 2 + source.x) * ratioX;
            out.y = (clientHeight / 2 - source.y) * ratioY;
            out.z = (this.nearPlane - this.farPlane) * (source.z + 1) / 2 - this.nearPlane;
            Vector3.transformCoordinate(out, this.transform.worldMatrix, out);
            return true;
        }
        else {
            return false;
        }
    }
    destroy(destroyChild = true) {
        this._offScreenRenderTexture = null;
        this.transform.off(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
        super.destroy(destroyChild);
    }
    addCommandBuffer(event, commandBuffer) {
        switch (event) {
            case Camera.CAMERAEVENT_POSTPROCESS:
                this._postProcessCommandBuffers.push(commandBuffer);
                commandBuffer._camera = this;
                break;
            default:
                throw "Camera:unknown event.";
        }
    }
    removeCommandBuffer(event, commandBuffer) {
        switch (event) {
            case Camera.CAMERAEVENT_POSTPROCESS:
                var index = this._postProcessCommandBuffers.indexOf(commandBuffer);
                if (index !== -1)
                    this._postProcessCommandBuffers.splice(index, 1);
                break;
            default:
                throw "Camera:unknown event.";
        }
    }
    removeCommandBuffers(event) {
        switch (event) {
            case Camera.CAMERAEVENT_POSTPROCESS:
                this._postProcessCommandBuffers.length = 0;
                break;
            default:
                throw "Camera:unknown event.";
        }
    }
}
Camera.CAMERAEVENT_POSTPROCESS = 0;
Camera._tempVector20 = new Vector2();
Camera._updateMark = 0;
