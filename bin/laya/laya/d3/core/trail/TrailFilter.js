import { Color } from "../../math/Color";
import { Vector3 } from "../../math/Vector3";
import { FloatKeyframe } from "../FloatKeyframe";
import { Gradient } from "../Gradient";
import { GradientMode } from "../GradientMode";
import { RenderElement } from "../render/RenderElement";
import { TextureMode } from "../TextureMode";
import { TrailGeometry } from "./TrailGeometry";
import { TrailMaterial } from "./TrailMaterial";
import { Shader3D } from "../../../d3/shader/Shader3D";
export class TrailFilter {
    constructor(owner) {
        this._totalLength = 0;
        this._lastPosition = new Vector3();
        this._curtime = 0;
        this.alignment = TrailFilter.ALIGNMENT_VIEW;
        this._owner = owner;
        this._initDefaultData();
        this.addRenderElement();
    }
    get time() {
        return this._time;
    }
    set time(value) {
        this._time = value;
        this._owner._render._shaderValues.setNumber(TrailFilter.LIFETIME, value);
    }
    get minVertexDistance() {
        return this._minVertexDistance;
    }
    set minVertexDistance(value) {
        this._minVertexDistance = value;
    }
    get widthMultiplier() {
        return this._widthMultiplier;
    }
    set widthMultiplier(value) {
        this._widthMultiplier = value;
    }
    get widthCurve() {
        return this._widthCurve;
    }
    set widthCurve(value) {
        this._widthCurve = value;
        var widthCurveFloatArray = new Float32Array(value.length * 4);
        var i, j, index = 0;
        for (i = 0, j = value.length; i < j; i++) {
            widthCurveFloatArray[index++] = value[i].time;
            widthCurveFloatArray[index++] = value[i].inTangent;
            widthCurveFloatArray[index++] = value[i].outTangent;
            widthCurveFloatArray[index++] = value[i].value;
        }
        this._owner._render._shaderValues.setBuffer(TrailFilter.WIDTHCURVE, widthCurveFloatArray);
        this._owner._render._shaderValues.setInt(TrailFilter.WIDTHCURVEKEYLENGTH, value.length);
    }
    get colorGradient() {
        return this._colorGradient;
    }
    set colorGradient(value) {
        this._colorGradient = value;
    }
    get textureMode() {
        return this._textureMode;
    }
    set textureMode(value) {
        this._textureMode = value;
    }
    addRenderElement() {
        var render = this._owner._render;
        var elements = render._renderElements;
        var material = render.sharedMaterials[0];
        (material) || (material = TrailMaterial.defaultMaterial);
        var element = new RenderElement();
        element.setTransform(this._owner._transform);
        element.render = render;
        element.material = material;
        this._trialGeometry = new TrailGeometry(this);
        element.setGeometry(this._trialGeometry);
        elements.push(element);
    }
    _update(state) {
        var render = this._owner._render;
        this._curtime += state.scene.timer._delta / 1000;
        render._shaderValues.setNumber(TrailFilter.CURTIME, this._curtime);
        var curPos = this._owner.transform.position;
        var element = render._renderElements[0]._geometry;
        element._updateDisappear();
        element._updateTrail(state.camera, this._lastPosition, curPos);
        element._updateVertexBufferUV();
        curPos.cloneTo(this._lastPosition);
    }
    _initDefaultData() {
        this.time = 5.0;
        this.minVertexDistance = 0.1;
        this.widthMultiplier = 1;
        this.textureMode = TextureMode.Stretch;
        var widthKeyFrames = [];
        var widthKeyFrame1 = new FloatKeyframe();
        widthKeyFrame1.time = 0;
        widthKeyFrame1.inTangent = 0;
        widthKeyFrame1.outTangent = 0;
        widthKeyFrame1.value = 1;
        widthKeyFrames.push(widthKeyFrame1);
        var widthKeyFrame2 = new FloatKeyframe();
        widthKeyFrame2.time = 1;
        widthKeyFrame2.inTangent = 0;
        widthKeyFrame2.outTangent = 0;
        widthKeyFrame2.value = 1;
        widthKeyFrames.push(widthKeyFrame2);
        this.widthCurve = widthKeyFrames;
        var gradient = new Gradient(2, 2);
        gradient.mode = GradientMode.Blend;
        gradient.addColorRGB(0, Color.WHITE);
        gradient.addColorRGB(1, Color.WHITE);
        gradient.addColorAlpha(0, 1);
        gradient.addColorAlpha(1, 1);
        this.colorGradient = gradient;
    }
    destroy() {
        this._trialGeometry.destroy();
        this._trialGeometry = null;
        this._widthCurve = null;
        this._colorGradient = null;
    }
}
TrailFilter.CURTIME = Shader3D.propertyNameToID("u_CurTime");
TrailFilter.LIFETIME = Shader3D.propertyNameToID("u_LifeTime");
TrailFilter.WIDTHCURVE = Shader3D.propertyNameToID("u_WidthCurve");
TrailFilter.WIDTHCURVEKEYLENGTH = Shader3D.propertyNameToID("u_WidthCurveKeyLength");
TrailFilter.ALIGNMENT_VIEW = 0;
TrailFilter.ALIGNMENT_TRANSFORM_Z = 1;
