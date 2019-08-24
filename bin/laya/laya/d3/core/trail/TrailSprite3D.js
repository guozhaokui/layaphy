import { TrailFilter } from "./TrailFilter";
import { TrailRenderer } from "./TrailRenderer";
import { FloatKeyframe } from "../FloatKeyframe";
import { Gradient } from "../Gradient";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { Color } from "../../math/Color";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { Loader } from "../../../net/Loader";
export class TrailSprite3D extends RenderableSprite3D {
    static __init__() {
        TrailSprite3D.shaderDefines = new ShaderDefines(RenderableSprite3D.shaderDefines);
    }
    get trailFilter() {
        return this._geometryFilter;
    }
    get trailRenderer() {
        return this._render;
    }
    constructor(name = null) {
        super(name);
        this._render = new TrailRenderer(this);
        this._geometryFilter = new TrailFilter(this);
    }
    _parse(data, spriteMap) {
        super._parse(data, spriteMap);
        var render = this._render;
        var filter = this._geometryFilter;
        var i, j;
        var materials = data.materials;
        if (materials) {
            var sharedMaterials = render.sharedMaterials;
            var materialCount = materials.length;
            sharedMaterials.length = materialCount;
            for (i = 0; i < materialCount; i++)
                sharedMaterials[i] = Loader.getRes(materials[i].path);
            render.sharedMaterials = sharedMaterials;
        }
        filter.time = data.time;
        filter.minVertexDistance = data.minVertexDistance;
        filter.widthMultiplier = data.widthMultiplier;
        filter.textureMode = data.textureMode;
        (data.alignment != null) && (filter.alignment = data.alignment);
        var widthCurve = [];
        var widthCurveData = data.widthCurve;
        for (i = 0, j = widthCurveData.length; i < j; i++) {
            var trailkeyframe = new FloatKeyframe();
            trailkeyframe.time = widthCurveData[i].time;
            trailkeyframe.inTangent = widthCurveData[i].inTangent;
            trailkeyframe.outTangent = widthCurveData[i].outTangent;
            trailkeyframe.value = widthCurveData[i].value;
            widthCurve.push(trailkeyframe);
        }
        filter.widthCurve = widthCurve;
        var colorGradientData = data.colorGradient;
        var colorKeys = colorGradientData.colorKeys;
        var alphaKeys = colorGradientData.alphaKeys;
        var colorGradient = new Gradient(colorKeys.length, alphaKeys.length);
        colorGradient.mode = colorGradientData.mode;
        for (i = 0, j = colorKeys.length; i < j; i++) {
            var colorKey = colorKeys[i];
            colorGradient.addColorRGB(colorKey.time, new Color(colorKey.value[0], colorKey.value[1], colorKey.value[2], 1.0));
        }
        for (i = 0, j = alphaKeys.length; i < j; i++) {
            var alphaKey = alphaKeys[i];
            colorGradient.addColorAlpha(alphaKey.time, alphaKey.value);
        }
        filter.colorGradient = colorGradient;
    }
    _onActive() {
        super._onActive();
        this._transform.position.cloneTo(this._geometryFilter._lastPosition);
    }
    _cloneTo(destObject, srcSprite, dstSprite) {
        super._cloneTo(destObject, srcSprite, dstSprite);
        var i, j;
        var destTrailSprite3D = destObject;
        var destTrailFilter = destTrailSprite3D.trailFilter;
        destTrailFilter.time = this.trailFilter.time;
        destTrailFilter.minVertexDistance = this.trailFilter.minVertexDistance;
        destTrailFilter.widthMultiplier = this.trailFilter.widthMultiplier;
        destTrailFilter.textureMode = this.trailFilter.textureMode;
        var widthCurveData = this.trailFilter.widthCurve;
        var widthCurve = [];
        for (i = 0, j = widthCurveData.length; i < j; i++) {
            var keyFrame = new FloatKeyframe();
            widthCurveData[i].cloneTo(keyFrame);
            widthCurve.push(keyFrame);
        }
        destTrailFilter.widthCurve = widthCurve;
        var destColorGradient = new Gradient(this.trailFilter.colorGradient.maxColorRGBKeysCount, this.trailFilter.colorGradient.maxColorAlphaKeysCount);
        this.trailFilter.colorGradient.cloneTo(destColorGradient);
        destTrailFilter.colorGradient = destColorGradient;
        var destTrailRender = destTrailSprite3D.trailRenderer;
        destTrailRender.sharedMaterial = this.trailRenderer.sharedMaterial;
    }
    destroy(destroyChild = true) {
        if (this.destroyed)
            return;
        super.destroy(destroyChild);
        this._geometryFilter.destroy();
        this._geometryFilter = null;
    }
    _create() {
        return new TrailSprite3D();
    }
}
