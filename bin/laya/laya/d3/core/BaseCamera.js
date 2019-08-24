import { Laya } from "../../../Laya";
import { Event } from "../../events/Event";
import { Loader } from "../../net/Loader";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { SkyRenderer } from "../resource/models/SkyRenderer";
import { Shader3D } from "../shader/Shader3D";
import { ShaderData } from "../shader/ShaderData";
import { Sprite3D } from "./Sprite3D";
export class BaseCamera extends Sprite3D {
    constructor(nearPlane = 0.3, farPlane = 1000) {
        super();
        this._skyRenderer = new SkyRenderer();
        this._forward = new Vector3();
        this._up = new Vector3();
        this.clearColor = new Vector4(100 / 255, 149 / 255, 237 / 255, 255 / 255);
        this._shaderValues = new ShaderData(null);
        this._fieldOfView = 60;
        this._useUserProjectionMatrix = false;
        this._orthographic = false;
        this._orthographicVerticalSize = 10;
        this.renderingOrder = 0;
        this._nearPlane = nearPlane;
        this._farPlane = farPlane;
        this.cullingMask = 2147483647;
        this.clearFlag = BaseCamera.CLEARFLAG_SOLIDCOLOR;
        this.useOcclusionCulling = true;
    }
    get skyRenderer() {
        return this._skyRenderer;
    }
    get fieldOfView() {
        return this._fieldOfView;
    }
    set fieldOfView(value) {
        this._fieldOfView = value;
        this._calculateProjectionMatrix();
    }
    get nearPlane() {
        return this._nearPlane;
    }
    set nearPlane(value) {
        this._nearPlane = value;
        this._calculateProjectionMatrix();
    }
    get farPlane() {
        return this._farPlane;
    }
    set farPlane(vaule) {
        this._farPlane = vaule;
        this._calculateProjectionMatrix();
    }
    get orthographic() {
        return this._orthographic;
    }
    set orthographic(vaule) {
        this._orthographic = vaule;
        this._calculateProjectionMatrix();
    }
    get orthographicVerticalSize() {
        return this._orthographicVerticalSize;
    }
    set orthographicVerticalSize(vaule) {
        this._orthographicVerticalSize = vaule;
        this._calculateProjectionMatrix();
    }
    get renderingOrder() {
        return this._renderingOrder;
    }
    set renderingOrder(value) {
        this._renderingOrder = value;
        this._sortCamerasByRenderingOrder();
    }
    _sortCamerasByRenderingOrder() {
        if (this.displayedInStage) {
            var cameraPool = this.scene._cameraPool;
            var n = cameraPool.length - 1;
            for (var i = 0; i < n; i++) {
                if (cameraPool[i].renderingOrder > cameraPool[n].renderingOrder) {
                    var tempCamera = cameraPool[i];
                    cameraPool[i] = cameraPool[n];
                    cameraPool[n] = tempCamera;
                }
            }
        }
    }
    _calculateProjectionMatrix() {
    }
    _onScreenSizeChanged() {
        this._calculateProjectionMatrix();
    }
    _prepareCameraToRender() {
        var cameraSV = this._shaderValues;
        this.transform.getForward(this._forward);
        this.transform.getUp(this._up);
        cameraSV.setVector3(BaseCamera.CAMERAPOS, this.transform.position);
        cameraSV.setVector3(BaseCamera.CAMERADIRECTION, this._forward);
        cameraSV.setVector3(BaseCamera.CAMERAUP, this._up);
    }
    render(shader = null, replacementTag = null) {
    }
    addLayer(layer) {
        this.cullingMask |= Math.pow(2, layer);
    }
    removeLayer(layer) {
        this.cullingMask &= ~Math.pow(2, layer);
    }
    addAllLayers() {
        this.cullingMask = 2147483647;
    }
    removeAllLayers() {
        this.cullingMask = 0;
    }
    resetProjectionMatrix() {
        this._useUserProjectionMatrix = false;
        this._calculateProjectionMatrix();
    }
    _onActive() {
        this._scene._addCamera(this);
        super._onActive();
    }
    _onInActive() {
        this._scene._removeCamera(this);
        super._onInActive();
    }
    _parse(data, spriteMap) {
        super._parse(data, spriteMap);
        var clearFlagData = data.clearFlag;
        (clearFlagData !== undefined) && (this.clearFlag = clearFlagData);
        this.orthographic = data.orthographic;
        (data.orthographicVerticalSize !== undefined) && (this.orthographicVerticalSize = data.orthographicVerticalSize);
        (data.fieldOfView !== undefined) && (this.fieldOfView = data.fieldOfView);
        this.nearPlane = data.nearPlane;
        this.farPlane = data.farPlane;
        var color = data.clearColor;
        this.clearColor = new Vector4(color[0], color[1], color[2], color[3]);
        var skyboxMaterial = data.skyboxMaterial;
        if (skyboxMaterial) {
            this._skyRenderer.material = Loader.getRes(skyboxMaterial.path);
        }
    }
    destroy(destroyChild = true) {
        this._skyRenderer.destroy();
        this._skyRenderer = null;
        Laya.stage.off(Event.RESIZE, this, this._onScreenSizeChanged);
        super.destroy(destroyChild);
    }
    _create() {
        return new BaseCamera();
    }
}
BaseCamera._tempMatrix4x40 = new Matrix4x4();
BaseCamera.CAMERAPOS = Shader3D.propertyNameToID("u_CameraPos");
BaseCamera.VIEWMATRIX = Shader3D.propertyNameToID("u_View");
BaseCamera.PROJECTMATRIX = Shader3D.propertyNameToID("u_Projection");
BaseCamera.VIEWPROJECTMATRIX = Shader3D.propertyNameToID("u_ViewProjection");
BaseCamera.CAMERADIRECTION = Shader3D.propertyNameToID("u_CameraDirection");
BaseCamera.CAMERAUP = Shader3D.propertyNameToID("u_CameraUp");
BaseCamera.RENDERINGTYPE_DEFERREDLIGHTING = "DEFERREDLIGHTING";
BaseCamera.RENDERINGTYPE_FORWARDRENDERING = "FORWARDRENDERING";
BaseCamera.CLEARFLAG_SOLIDCOLOR = 0;
BaseCamera.CLEARFLAG_SKY = 1;
BaseCamera.CLEARFLAG_DEPTHONLY = 2;
BaseCamera.CLEARFLAG_NONE = 3;
BaseCamera._invertYScaleMatrix = new Matrix4x4(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
BaseCamera._invertYProjectionMatrix = new Matrix4x4();
BaseCamera._invertYProjectionViewMatrix = new Matrix4x4();
