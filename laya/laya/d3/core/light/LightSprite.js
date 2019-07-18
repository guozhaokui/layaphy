import { Sprite3D } from "../Sprite3D";
import { Vector3 } from "../../math/Vector3";
export class LightSprite extends Sprite3D {
    constructor() {
        super();
        this._intensity = 1.0;
        this._intensityColor = new Vector3();
        this.color = new Vector3(1.0, 1.0, 1.0);
        this._shadow = false;
        this._shadowFarPlane = 8;
        this._shadowMapSize = 512;
        this._shadowMapCount = 1;
        this._shadowMapPCFType = 0;
        this._lightmapBakedType = LightSprite.LIGHTMAPBAKEDTYPE_REALTIME;
    }
    get intensity() {
        return this._intensity;
    }
    set intensity(value) {
        this._intensity = value;
    }
    get shadow() {
        return this._shadow;
    }
    set shadow(value) {
        throw new Error("LightSprite: must override it.");
    }
    get shadowDistance() {
        return this._shadowFarPlane;
    }
    set shadowDistance(value) {
        this._shadowFarPlane = value;
        (this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.setFarDistance(value));
    }
    get shadowResolution() {
        return this._shadowMapSize;
    }
    set shadowResolution(value) {
        this._shadowMapSize = value;
        (this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.setShadowMapTextureSize(value));
    }
    get shadowPSSMCount() {
        return this._shadowMapCount;
    }
    set shadowPSSMCount(value) {
        this._shadowMapCount = value;
        (this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.shadowMapCount = value);
    }
    get shadowPCFType() {
        return this._shadowMapPCFType;
    }
    set shadowPCFType(value) {
        this._shadowMapPCFType = value;
        (this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.setPCFType(value));
    }
    get lightmapBakedType() {
        return this._lightmapBakedType;
    }
    set lightmapBakedType(value) {
        if (this._lightmapBakedType !== value) {
            this._lightmapBakedType = value;
            if (this.activeInHierarchy) {
                if (value !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED)
                    this._scene._addLight(this);
                else
                    this._scene._removeLight(this);
            }
        }
    }
    _parse(data, spriteMap) {
        super._parse(data, spriteMap);
        var colorData = data.color;
        this.color.fromArray(colorData);
        this.intensity = data.intensity;
        this.lightmapBakedType = data.lightmapBakedType;
    }
    _onActive() {
        super._onActive();
        (this.lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (this._scene._addLight(this));
    }
    _onInActive() {
        super._onInActive();
        (this.lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (this._scene._removeLight(this));
    }
    _prepareToScene() {
        return false;
    }
    _create() {
        return new LightSprite();
    }
    get diffuseColor() {
        console.log("LightSprite: discard property,please use color property instead.");
        return this.color;
    }
    set diffuseColor(value) {
        console.log("LightSprite: discard property,please use color property instead.");
        this.color = value;
    }
}
LightSprite.LIGHTMAPBAKEDTYPE_REALTIME = 0;
LightSprite.LIGHTMAPBAKEDTYPE_MIXED = 1;
LightSprite.LIGHTMAPBAKEDTYPE_BAKED = 2;
