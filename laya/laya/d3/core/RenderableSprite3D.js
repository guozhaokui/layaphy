import { Vector4 } from "../math/Vector4";
import { Shader3D } from "../shader/Shader3D";
import { ShaderDefines } from "../shader/ShaderDefines";
import { Sprite3D } from "./Sprite3D";
import { ILaya3D } from "../../../ILaya3D";
export class RenderableSprite3D extends Sprite3D {
    constructor(name) {
        super(name);
    }
    static __init__() {
        RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW = RenderableSprite3D.shaderDefines.registerDefine("RECEIVESHADOW");
        RenderableSprite3D.SHADERDEFINE_SCALEOFFSETLIGHTINGMAPUV = RenderableSprite3D.shaderDefines.registerDefine("SCALEOFFSETLIGHTINGMAPUV");
        RenderableSprite3D.SAHDERDEFINE_LIGHTMAP = RenderableSprite3D.shaderDefines.registerDefine("LIGHTMAP");
    }
    _onInActive() {
        super._onInActive();
        var scene3D = this._scene;
        scene3D._removeRenderObject(this._render);
        (this._render.castShadow) && (scene3D._removeShadowCastRenderObject(this._render));
    }
    _onActive() {
        super._onActive();
        var scene3D = this._scene;
        scene3D._addRenderObject(this._render);
        (this._render.castShadow) && (scene3D._addShadowCastRenderObject(this._render));
    }
    _onActiveInScene() {
        super._onActiveInScene();
        if (ILaya3D.Laya3D._editerEnvironment) {
            var scene = this._scene;
            var pickColor = new Vector4();
            scene._allotPickColorByID(this.id, pickColor);
            scene._pickIdToSprite[this.id] = this;
            this._render._shaderValues.setVector(RenderableSprite3D.PICKCOLOR, pickColor);
        }
    }
    _addToInitStaticBatchManager() {
    }
    _setBelongScene(scene) {
        super._setBelongScene(scene);
        this._render._setBelongScene(scene);
    }
    _setUnBelongScene() {
        this._render._shaderValues.removeDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
        super._setUnBelongScene();
    }
    _changeHierarchyAnimator(animator) {
        if (this._hierarchyAnimator) {
            var renderableSprites = this._hierarchyAnimator._renderableSprites;
            renderableSprites.splice(renderableSprites.indexOf(this), 1);
        }
        if (animator)
            animator._renderableSprites.push(this);
        super._changeHierarchyAnimator(animator);
    }
    destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._render._destroy();
        this._render = null;
    }
    _create() {
        return new RenderableSprite3D(this.name);
    }
}
RenderableSprite3D.LIGHTMAPSCALEOFFSET = Shader3D.propertyNameToID("u_LightmapScaleOffset");
RenderableSprite3D.LIGHTMAP = Shader3D.propertyNameToID("u_LightMap");
RenderableSprite3D.PICKCOLOR = Shader3D.propertyNameToID("u_PickColor");
RenderableSprite3D.shaderDefines = new ShaderDefines();
