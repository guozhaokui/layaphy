import { Vector3 } from "../../math/Vector3";
import { ParallelSplitShadowMap } from "../../shadowMap/ParallelSplitShadowMap";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { LightSprite } from "./LightSprite";
import { ILaya3D } from "../../../../ILaya3D";
export class DirectionLight extends LightSprite {
    set shadow(value) {
        if (this._shadow !== value) {
            this._shadow = value;
            (this.scene) && (this._initShadow());
        }
    }
    constructor() {
        super();
        this._direction = new Vector3();
    }
    _initShadow() {
        if (this._shadow) {
            this._parallelSplitShadowMap = new ParallelSplitShadowMap();
            this.scene.parallelSplitShadowMaps.push(this._parallelSplitShadowMap);
            this.transform.worldMatrix.getForward(this._direction);
            Vector3.normalize(this._direction, this._direction);
            this._parallelSplitShadowMap.setInfo(this.scene, this._shadowFarPlane, this._direction, this._shadowMapSize, this._shadowMapCount, this._shadowMapPCFType);
        }
        else {
            var defineDatas = this._scene._shaderValues;
            var parallelSplitShadowMaps = this.scene.parallelSplitShadowMaps;
            parallelSplitShadowMaps.splice(parallelSplitShadowMaps.indexOf(this._parallelSplitShadowMap), 1);
            this._parallelSplitShadowMap.disposeAllRenderTarget();
            this._parallelSplitShadowMap = null;
            defineDatas.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM1);
            defineDatas.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM2);
            defineDatas.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM3);
        }
    }
    _onActive() {
        super._onActive();
        this._shadow && (this._initShadow());
        (this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (this._scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT));
    }
    _onInActive() {
        super._onInActive();
        (this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (this._scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT));
    }
    _prepareToScene() {
        var scene = this._scene;
        if (scene.enableLight && this.activeInHierarchy) {
            var shaderValue = scene._shaderValues;
            Vector3.scale(this.color, this._intensity, this._intensityColor);
            shaderValue.setVector3(ILaya3D.Scene3D.LIGHTDIRCOLOR, this._intensityColor);
            this.transform.worldMatrix.getForward(this._direction);
            Vector3.normalize(this._direction, this._direction);
            shaderValue.setVector3(ILaya3D.Scene3D.LIGHTDIRECTION, this._direction);
            return true;
        }
        else {
            return false;
        }
    }
}
