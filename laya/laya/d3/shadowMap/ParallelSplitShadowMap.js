import { ILaya3D } from "../../../ILaya3D";
import { BaseTexture } from "../../resource/BaseTexture";
import { Camera } from "../core/Camera";
import { Scene3DShaderDeclaration } from "../core/scene/Scene3DShaderDeclaration";
import { BoundBox } from "../math/BoundBox";
import { BoundFrustum } from "../math/BoundFrustum";
import { BoundSphere } from "../math/BoundSphere";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector2 } from "../math/Vector2";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { RenderTexture } from "../resource/RenderTexture";
export class ParallelSplitShadowMap {
    constructor() {
        this._spiltDistance = [];
        this._currentPSSM = -1;
        this._shadowMapCount = 3;
        this._maxDistance = 200.0;
        this._ratioOfDistance = 1.0 / this._shadowMapCount;
        this._globalParallelLightDir = new Vector3(0, -1, 0);
        this._statesDirty = true;
        this._shadowMapTextureSize = 1024;
        this._scene = null;
        this._boundingSphere = new Array(ParallelSplitShadowMap.MAX_PSSM_COUNT + 1);
        this._boundingBox = new Array(ParallelSplitShadowMap.MAX_PSSM_COUNT + 1);
        this._frustumPos = new Array((ParallelSplitShadowMap.MAX_PSSM_COUNT + 1) * 4);
        this._uniformDistance = new Array(ParallelSplitShadowMap.MAX_PSSM_COUNT + 1);
        this._logDistance = new Array(ParallelSplitShadowMap.MAX_PSSM_COUNT + 1);
        this._dimension = new Array(ParallelSplitShadowMap.MAX_PSSM_COUNT + 1);
        this._PCFType = 0;
        this._tempLookAt3 = new Vector3();
        this._tempLookAt4 = new Vector4();
        this._tempValue = new Vector4();
        this._tempPos = new Vector3();
        this._tempLightUp = new Vector3();
        this._tempMin = new Vector4();
        this._tempMax = new Vector4();
        this._tempMatrix44 = new Matrix4x4;
        this._splitFrustumCulling = new BoundFrustum(Matrix4x4.DEFAULT);
        this._tempScaleMatrix44 = new Matrix4x4();
        this._shadowPCFOffset = new Vector2(1.0 / 1024.0, 1.0 / 1024.0);
        this._shaderValueDistance = new Vector4();
        this._shaderValueLightVP = null;
        this.cameras = [];
        this._shaderValueVPs = [];
        var i;
        for (i = 0; i < this._spiltDistance.length; i++) {
            this._spiltDistance[i] = 0.0;
        }
        for (i = 0; i < this._dimension.length; i++) {
            this._dimension[i] = new Vector2();
        }
        for (i = 0; i < this._frustumPos.length; i++) {
            this._frustumPos[i] = new Vector3();
        }
        for (i = 0; i < this._boundingBox.length; i++) {
            this._boundingBox[i] = new BoundBox(new Vector3(), new Vector3());
        }
        for (i = 0; i < this._boundingSphere.length; i++) {
            this._boundingSphere[i] = new BoundSphere(new Vector3(), 0.0);
        }
        Matrix4x4.createScaling(new Vector3(0.5, 0.5, 1.0), this._tempScaleMatrix44);
        this._tempScaleMatrix44.elements[12] = 0.5;
        this._tempScaleMatrix44.elements[13] = 0.5;
    }
    setInfo(scene, maxDistance, globalParallelDir, shadowMapTextureSize, numberOfPSSM, PCFType) {
        if (numberOfPSSM > ParallelSplitShadowMap.MAX_PSSM_COUNT) {
            this._shadowMapCount = ParallelSplitShadowMap.MAX_PSSM_COUNT;
        }
        this._scene = scene;
        this._maxDistance = maxDistance;
        this.shadowMapCount = numberOfPSSM;
        this._globalParallelLightDir = globalParallelDir;
        this._ratioOfDistance = 1.0 / this._shadowMapCount;
        for (var i = 0; i < this._spiltDistance.length; i++) {
            this._spiltDistance[i] = 0.0;
        }
        this._shadowMapTextureSize = shadowMapTextureSize;
        this._shadowPCFOffset.x = 1.0 / this._shadowMapTextureSize;
        this._shadowPCFOffset.y = 1.0 / this._shadowMapTextureSize;
        this.setPCFType(PCFType);
        this._statesDirty = true;
    }
    setPCFType(PCFtype) {
        this._PCFType = PCFtype;
        var defineData = this._scene._shaderValues;
        switch (this._PCFType) {
            case 0:
                defineData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF_NO);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF1);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF2);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF3);
                break;
            case 1:
                defineData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF1);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF_NO);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF2);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF3);
                break;
            case 2:
                defineData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF2);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF_NO);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF1);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF3);
                break;
            case 3:
                defineData.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF3);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF_NO);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF1);
                defineData.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF2);
                break;
        }
    }
    getPCFType() {
        return this._PCFType;
    }
    setFarDistance(value) {
        if (this._maxDistance != value) {
            this._maxDistance = value;
            this._statesDirty = true;
        }
    }
    getFarDistance() {
        return this._maxDistance;
    }
    set shadowMapCount(value) {
        value = value > 0 ? value : 1;
        value = value <= ParallelSplitShadowMap.MAX_PSSM_COUNT ? value : ParallelSplitShadowMap.MAX_PSSM_COUNT;
        if (this._shadowMapCount != value) {
            this._shadowMapCount = value;
            this._ratioOfDistance = 1.0 / this._shadowMapCount;
            this._statesDirty = true;
            this._shaderValueLightVP = new Float32Array(value * 16);
            this._shaderValueVPs.length = value;
            for (var i = 0; i < value; i++)
                this._shaderValueVPs[i] = new Float32Array(this._shaderValueLightVP.buffer, i * 64);
        }
    }
    get shadowMapCount() {
        return this._shadowMapCount;
    }
    _beginSampler(index, sceneCamera) {
        if (index < 0 || index > this._shadowMapCount)
            throw new Error("ParallelSplitShadowMap: beginSample invalid index");
        this._currentPSSM = index;
        this._update(sceneCamera);
    }
    endSampler(sceneCamera) {
        this._currentPSSM = -1;
    }
    _calcAllLightCameraInfo(sceneCamera) {
        if (this._shadowMapCount === 1) {
            this._beginSampler(0, sceneCamera);
            this.endSampler(sceneCamera);
        }
        else {
            for (var i = 0, n = this._shadowMapCount + 1; i < n; i++) {
                this._beginSampler(i, sceneCamera);
                this.endSampler(sceneCamera);
            }
        }
    }
    _recalculate(nearPlane, fieldOfView, aspectRatio) {
        this._calcSplitDistance(nearPlane);
        this._calcBoundingBox(fieldOfView, aspectRatio);
        this._rebuildRenderInfo();
    }
    _update(sceneCamera) {
        var nearPlane = sceneCamera.nearPlane;
        var fieldOfView = sceneCamera.fieldOfView;
        var aspectRatio = sceneCamera.aspectRatio;
        if (this._statesDirty || this.lastNearPlane !== nearPlane || this.lastFieldOfView !== fieldOfView || this.lastAspectRatio !== aspectRatio) {
            this._recalculate(nearPlane, fieldOfView, aspectRatio);
            this._uploadShaderValue();
            this._statesDirty = false;
            this.lastNearPlane = nearPlane;
            this.lastFieldOfView = fieldOfView;
            this.lastAspectRatio = aspectRatio;
        }
        this._calcLightViewProject(sceneCamera);
    }
    _uploadShaderValue() {
        var sceneSV = this._scene._shaderValues;
        switch (this._shadowMapCount) {
            case 1:
                sceneSV.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM1);
                sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM2);
                sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM3);
                break;
            case 2:
                sceneSV.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM2);
                sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM1);
                sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM3);
                break;
            case 3:
                sceneSV.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM3);
                sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM1);
                sceneSV.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM2);
                break;
        }
        sceneSV.setVector(ILaya3D.Scene3D.SHADOWDISTANCE, this._shaderValueDistance);
        sceneSV.setBuffer(ILaya3D.Scene3D.SHADOWLIGHTVIEWPROJECT, this._shaderValueLightVP);
        sceneSV.setVector2(ILaya3D.Scene3D.SHADOWMAPPCFOFFSET, this._shadowPCFOffset);
        switch (this._shadowMapCount) {
            case 3:
                sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE1, this.cameras[1].renderTarget);
                sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE2, this.cameras[2].renderTarget);
                sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE3, this.cameras[3].renderTarget);
                break;
            case 2:
                sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE1, this.cameras[1].renderTarget);
                sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE2, this.cameras[2].renderTarget);
                break;
            case 1:
                sceneSV.setTexture(ILaya3D.Scene3D.SHADOWMAPTEXTURE1, this.cameras[1].renderTarget);
                break;
        }
    }
    _calcSplitDistance(nearPlane) {
        var far = this._maxDistance;
        var invNumberOfPSSM = 1.0 / this._shadowMapCount;
        var i;
        for (i = 0; i <= this._shadowMapCount; i++) {
            this._uniformDistance[i] = nearPlane + (far - nearPlane) * i * invNumberOfPSSM;
        }
        var farDivNear = far / nearPlane;
        for (i = 0; i <= this._shadowMapCount; i++) {
            var n = Math.pow(farDivNear, i * invNumberOfPSSM);
            this._logDistance[i] = nearPlane * n;
        }
        for (i = 0; i <= this._shadowMapCount; i++) {
            this._spiltDistance[i] = this._uniformDistance[i] * this._ratioOfDistance + this._logDistance[i] * (1.0 - this._ratioOfDistance);
        }
        this._shaderValueDistance.x = this._spiltDistance[1];
        this._shaderValueDistance.y = this._spiltDistance[2];
        this._shaderValueDistance.z = this._spiltDistance[3];
        this._shaderValueDistance.w = 0.0;
    }
    _calcBoundingBox(fieldOfView, aspectRatio) {
        var fov = 3.1415926 * fieldOfView / 180.0;
        var halfTanValue = Math.tan(fov / 2.0);
        var height;
        var width;
        var distance;
        var i;
        for (i = 0; i <= this._shadowMapCount; i++) {
            distance = this._spiltDistance[i];
            height = distance * halfTanValue;
            width = height * aspectRatio;
            var temp = this._frustumPos[i * 4 + 0];
            temp.x = -width;
            temp.y = -height;
            temp.z = -distance;
            temp = this._frustumPos[i * 4 + 1];
            temp.x = width;
            temp.y = -height;
            temp.z = -distance;
            temp = this._frustumPos[i * 4 + 2];
            temp.x = -width;
            temp.y = height;
            temp.z = -distance;
            temp = this._frustumPos[i * 4 + 3];
            temp.x = width;
            temp.y = height;
            temp.z = -distance;
            temp = this._dimension[i];
            temp.x = width;
            temp.y = height;
        }
        var d;
        var min;
        var max;
        var center;
        for (i = 1; i <= this._shadowMapCount; i++) {
            d = this._dimension[i];
            min = this._boundingBox[i].min;
            min.x = -d.x;
            min.y = -d.y;
            min.z = -this._spiltDistance[i];
            max = this._boundingBox[i].max;
            max.x = d.x;
            max.y = d.y;
            max.z = -this._spiltDistance[i - 1];
            center = this._boundingSphere[i].center;
            center.x = (min.x + max.x) * 0.5;
            center.y = (min.y + max.y) * 0.5;
            center.z = (min.z + max.z) * 0.5;
            this._boundingSphere[i].radius = Math.sqrt(Math.pow(max.x - min.x, 2) + Math.pow(max.y - min.y, 2) + Math.pow(max.z - min.z, 2)) * 0.5;
        }
        min = this._boundingBox[0].min;
        d = this._dimension[this._shadowMapCount];
        min.x = -d.x;
        min.y = -d.y;
        min.z = -this._spiltDistance[this._shadowMapCount];
        max = this._boundingBox[0].max;
        max.x = d.x;
        max.y = d.y;
        max.z = -this._spiltDistance[0];
        center = this._boundingSphere[0].center;
        center.x = (min.x + max.x) * 0.5;
        center.y = (min.y + max.y) * 0.5;
        center.z = (min.z + max.z) * 0.5;
        this._boundingSphere[0].radius = Math.sqrt(Math.pow(max.x - min.x, 2) + Math.pow(max.y - min.y, 2) + Math.pow(max.z - min.z, 2)) * 0.5;
    }
    calcSplitFrustum(sceneCamera) {
        if (this._currentPSSM > 0) {
            Matrix4x4.createPerspective(3.1416 * sceneCamera.fieldOfView / 180.0, sceneCamera.aspectRatio, this._spiltDistance[this._currentPSSM - 1], this._spiltDistance[this._currentPSSM], this._tempMatrix44);
        }
        else {
            Matrix4x4.createPerspective(3.1416 * sceneCamera.fieldOfView / 180.0, sceneCamera.aspectRatio, this._spiltDistance[0], this._spiltDistance[this._shadowMapCount], this._tempMatrix44);
        }
        Matrix4x4.multiply(this._tempMatrix44, sceneCamera.viewMatrix, this._tempMatrix44);
        this._splitFrustumCulling.matrix = this._tempMatrix44;
    }
    _rebuildRenderInfo() {
        var nNum = this._shadowMapCount + 1;
        var i;
        this.cameras.length = nNum;
        for (i = 0; i < nNum; i++) {
            if (!this.cameras[i]) {
                var camera = new Camera();
                camera.name = "lightCamera" + i;
                camera.clearColor = new Vector4(1.0, 1.0, 1.0, 1.0);
                this.cameras[i] = camera;
            }
            var shadowMap = this.cameras[i].renderTarget;
            if (shadowMap == null || shadowMap.width != this._shadowMapTextureSize || shadowMap.height != this._shadowMapTextureSize) {
                (shadowMap) && (shadowMap.destroy());
                shadowMap = new RenderTexture(this._shadowMapTextureSize, this._shadowMapTextureSize, BaseTexture.FORMAT_R8G8B8A8, BaseTexture.FORMAT_DEPTH_16);
                shadowMap.filterMode = BaseTexture.FILTERMODE_POINT;
                this.cameras[i].renderTarget = shadowMap;
            }
        }
    }
    _calcLightViewProject(sceneCamera) {
        var boundSphere = this._boundingSphere[this._currentPSSM];
        var cameraMatViewInv = sceneCamera.transform.worldMatrix;
        var radius = boundSphere.radius;
        boundSphere.center.cloneTo(this._tempLookAt3);
        Vector3.transformV3ToV4(this._tempLookAt3, cameraMatViewInv, this._tempLookAt4);
        var lookAt3Element = this._tempLookAt3;
        var lookAt4Element = this._tempLookAt4;
        lookAt3Element.x = lookAt4Element.x;
        lookAt3Element.y = lookAt4Element.y;
        lookAt3Element.z = lookAt4Element.z;
        var lightUpElement = this._tempLightUp;
        sceneCamera.transform.worldMatrix.getForward(ParallelSplitShadowMap._tempVector30);
        var sceneCameraDir = ParallelSplitShadowMap._tempVector30;
        lightUpElement.x = sceneCameraDir.x;
        lightUpElement.y = 1.0;
        lightUpElement.z = sceneCameraDir.z;
        Vector3.normalize(this._tempLightUp, this._tempLightUp);
        Vector3.scale(this._globalParallelLightDir, boundSphere.radius * 4, this._tempPos);
        Vector3.subtract(this._tempLookAt3, this._tempPos, this._tempPos);
        var curLightCamera = this.cameras[this._currentPSSM];
        curLightCamera.transform.position = this._tempPos;
        curLightCamera.transform.lookAt(this._tempLookAt3, this._tempLightUp, false);
        var tempMax = this._tempMax;
        var tempMin = this._tempMin;
        tempMax.x = tempMax.y = tempMax.z = -100000.0;
        tempMax.w = 1.0;
        tempMin.x = tempMin.y = tempMin.z = 100000.0;
        tempMin.w = 1.0;
        Matrix4x4.multiply(curLightCamera.viewMatrix, cameraMatViewInv, this._tempMatrix44);
        var tempValueElement = this._tempValue;
        var corners = [];
        corners.length = 8;
        this._boundingBox[this._currentPSSM].getCorners(corners);
        for (var i = 0; i < 8; i++) {
            var frustumPosElements = corners[i];
            tempValueElement.x = frustumPosElements.x;
            tempValueElement.y = frustumPosElements.y;
            tempValueElement.z = frustumPosElements.z;
            tempValueElement.w = 1.0;
            Vector4.transformByM4x4(this._tempValue, this._tempMatrix44, this._tempValue);
            tempMin.x = (tempValueElement.x < tempMin.x) ? tempValueElement.x : tempMin.x;
            tempMin.y = (tempValueElement.y < tempMin.y) ? tempValueElement.y : tempMin.y;
            tempMin.z = (tempValueElement.z < tempMin.z) ? tempValueElement.z : tempMin.z;
            tempMax.x = (tempValueElement.x > tempMax.x) ? tempValueElement.x : tempMax.x;
            tempMax.y = (tempValueElement.y > tempMax.y) ? tempValueElement.y : tempMax.y;
            tempMax.z = (tempValueElement.z > tempMax.z) ? tempValueElement.z : tempMax.z;
        }
        Vector4.add(this._tempMax, this._tempMin, this._tempValue);
        tempValueElement.x *= 0.5;
        tempValueElement.y *= 0.5;
        tempValueElement.z *= 0.5;
        tempValueElement.w = 1;
        Vector4.transformByM4x4(this._tempValue, curLightCamera.transform.worldMatrix, this._tempValue);
        var distance = Math.abs(-this._tempMax.z);
        var farPlane = distance > this._maxDistance ? distance : this._maxDistance;
        Vector3.scale(this._globalParallelLightDir, farPlane, this._tempPos);
        var tempPosElement = this._tempPos;
        tempPosElement.x = tempValueElement.x - tempPosElement.x;
        tempPosElement.y = tempValueElement.y - tempPosElement.y;
        tempPosElement.z = tempValueElement.z - tempPosElement.z;
        curLightCamera.transform.position = this._tempPos;
        curLightCamera.transform.lookAt(this._tempLookAt3, this._tempLightUp, false);
        Matrix4x4.createOrthoOffCenter(tempMin.x, tempMax.x, tempMin.y, tempMax.y, 1.0, farPlane + 0.5 * (tempMax.z - tempMin.z), curLightCamera.projectionMatrix);
        var projectView = curLightCamera.projectionViewMatrix;
        ParallelSplitShadowMap.multiplyMatrixOutFloat32Array(this._tempScaleMatrix44, projectView, this._shaderValueVPs[this._currentPSSM]);
        this._scene._shaderValues.setBuffer(ILaya3D.Scene3D.SHADOWLIGHTVIEWPROJECT, this._shaderValueLightVP);
    }
    static multiplyMatrixOutFloat32Array(left, right, out) {
        var i, a, b, ai0, ai1, ai2, ai3;
        a = left.elements;
        b = right.elements;
        for (i = 0; i < 4; i++) {
            ai0 = a[i];
            ai1 = a[i + 4];
            ai2 = a[i + 8];
            ai3 = a[i + 12];
            out[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
            out[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
            out[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
            out[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
        }
    }
    setShadowMapTextureSize(size) {
        if (size !== this._shadowMapTextureSize) {
            this._shadowMapTextureSize = size;
            this._shadowPCFOffset.x = 1 / this._shadowMapTextureSize;
            this._shadowPCFOffset.y = 1 / this._shadowMapTextureSize;
            this._statesDirty = true;
        }
    }
    disposeAllRenderTarget() {
        for (var i = 0, n = this._shadowMapCount + 1; i < n; i++) {
            if (this.cameras[i].renderTarget) {
                this.cameras[i].renderTarget.destroy();
                this.cameras[i].renderTarget = null;
            }
        }
    }
}
ParallelSplitShadowMap.MAX_PSSM_COUNT = 3;
ParallelSplitShadowMap._tempVector30 = new Vector3();
