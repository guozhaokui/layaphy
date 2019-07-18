import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { LightSprite } from "./LightSprite";
import { ILaya3D } from "../../../../ILaya3D";
export class SpotLight extends LightSprite {
    constructor() {
        super();
        this._spotAngle = 30.0;
        this._range = 10.0;
        this._direction = new Vector3();
    }
    get spotAngle() {
        return this._spotAngle;
    }
    set spotAngle(value) {
        this._spotAngle = Math.max(Math.min(value, 180), 0);
    }
    get range() {
        return this._range;
    }
    set range(value) {
        this._range = value;
    }
    _onActive() {
        super._onActive();
        (this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (this.scene._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT));
    }
    _onInActive() {
        super._onInActive();
        (this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (this.scene._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT));
    }
    _prepareToScene() {
        var scene = this._scene;
        if (scene.enableLight && this.activeInHierarchy) {
            var shaderValue = scene._shaderValues;
            Vector3.scale(this.color, this._intensity, this._intensityColor);
            shaderValue.setVector3(ILaya3D.Scene3D.SPOTLIGHTCOLOR, this._intensityColor);
            shaderValue.setVector3(ILaya3D.Scene3D.SPOTLIGHTPOS, this.transform.position);
            this.transform.worldMatrix.getForward(this._direction);
            Vector3.normalize(this._direction, this._direction);
            shaderValue.setVector3(ILaya3D.Scene3D.SPOTLIGHTDIRECTION, this._direction);
            shaderValue.setNumber(ILaya3D.Scene3D.SPOTLIGHTRANGE, this.range);
            shaderValue.setNumber(ILaya3D.Scene3D.SPOTLIGHTSPOTANGLE, this.spotAngle * Math.PI / 180);
            return true;
        }
        else {
            return false;
        }
    }
    _parse(data, spriteMap) {
        super._parse(data, spriteMap);
        this.range = data.range;
        this.spotAngle = data.spotAngle;
    }
}
SpotLight._tempMatrix0 = new Matrix4x4();
SpotLight._tempMatrix1 = new Matrix4x4();
