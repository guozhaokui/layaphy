import { PostProcessEffect } from "./PostProcessEffect";
import { PostProcess } from "../../component/PostProcess";
import { Color } from "../../math/Color";
import { Vector4 } from "../../math/Vector4";
import { RenderTexture } from "../../resource/RenderTexture";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderData } from "../../shader/ShaderData";
import { BaseTexture } from "../../../resource/BaseTexture";
import { Texture2D } from "../../../resource/Texture2D";
export class BloomEffect extends PostProcessEffect {
    constructor() {
        super();
        this._shader = null;
        this._shaderData = new ShaderData();
        this._linearColor = new Color();
        this._bloomTextureTexelSize = new Vector4();
        this._shaderThreshold = new Vector4();
        this._shaderParams = new Vector4();
        this._pyramid = null;
        this._intensity = 0.0;
        this._threshold = 1.0;
        this._softKnee = 0.5;
        this._diffusion = 7.0;
        this._anamorphicRatio = 0.0;
        this._dirtIntensity = 0.0;
        this._shaderSetting = new Vector4();
        this._dirtTileOffset = new Vector4();
        this.clamp = 65472.0;
        this.color = new Color(1.0, 1.0, 1.0, 1.0);
        this.fastMode = false;
        this.dirtTexture = null;
        this._shader = Shader3D.find("PostProcessBloom");
        this._pyramid = new Array(BloomEffect.MAXPYRAMIDSIZE * 2);
    }
    get intensity() {
        return this._intensity;
    }
    set intensity(value) {
        this._intensity = Math.max(value, 0.0);
    }
    get threshold() {
        return this._threshold;
    }
    set threshold(value) {
        this._threshold = Math.max(value, 0.0);
    }
    get softKnee() {
        return this._softKnee;
    }
    set softKnee(value) {
        this._softKnee = Math.min(Math.max(value, 0.0), 1.0);
    }
    get diffusion() {
        return this._diffusion;
    }
    set diffusion(value) {
        this._diffusion = Math.min(Math.max(value, 1), 10);
    }
    get anamorphicRatio() {
        return this._anamorphicRatio;
    }
    set anamorphicRatio(value) {
        this._anamorphicRatio = Math.min(Math.max(value, -1.0), 1.0);
    }
    get dirtIntensity() {
        return this._dirtIntensity;
    }
    set dirtIntensity(value) {
        this._dirtIntensity = Math.max(value, 0.0);
    }
    render(context) {
        var cmd = context.command;
        var viewport = context.camera.viewport;
        this._shaderData.setTexture(BloomEffect.SHADERVALUE_AUTOEXPOSURETEX, Texture2D.whiteTexture);
        var ratio = this._anamorphicRatio;
        var rw = ratio < 0 ? -ratio : 0;
        var rh = ratio > 0 ? ratio : 0;
        var tw = Math.floor(viewport.width / (2 - rw));
        var th = Math.floor(viewport.height / (2 - rh));
        var s = Math.max(tw, th);
        var logs;
        logs = Math.log2(s) + this._diffusion - 10;
        var logsInt = Math.floor(logs);
        var iterations = Math.min(Math.max(logsInt, 1), BloomEffect.MAXPYRAMIDSIZE);
        var sampleScale = 0.5 + logs - logsInt;
        this._shaderData.setNumber(BloomEffect.SHADERVALUE_SAMPLESCALE, sampleScale);
        var lthresh = Color.gammaToLinearSpace(this.threshold);
        var knee = lthresh * this._softKnee + 1e-5;
        this._shaderThreshold.setValue(lthresh, lthresh - knee, knee * 2, 0.25 / knee);
        this._shaderData.setVector(BloomEffect.SHADERVALUE_THRESHOLD, this._shaderThreshold);
        var lclamp = Color.gammaToLinearSpace(this.clamp);
        this._shaderParams.setValue(lclamp, 0, 0, 0);
        this._shaderData.setVector(BloomEffect.SHADERVALUE_PARAMS, this._shaderParams);
        var qualityOffset = this.fastMode ? 1 : 0;
        var lastDownTexture = context.source;
        for (var i = 0; i < iterations; i++) {
            var downIndex = i * 2;
            var upIndex = downIndex + 1;
            var subShader = i == 0 ? BloomEffect.SUBSHADER_PREFILTER13 + qualityOffset : BloomEffect.SUBSHADER_DOWNSAMPLE13 + qualityOffset;
            var mipDownTexture = RenderTexture.createFromPool(tw, th, BaseTexture.FORMAT_R8G8B8, BaseTexture.FORMAT_DEPTHSTENCIL_NONE, BaseTexture.FILTERMODE_BILINEAR);
            this._pyramid[downIndex] = mipDownTexture;
            if (i !== iterations - 1) {
                var mipUpTexture = RenderTexture.createFromPool(tw, th, BaseTexture.FORMAT_R8G8B8, BaseTexture.FORMAT_DEPTHSTENCIL_NONE, BaseTexture.FILTERMODE_BILINEAR);
                this._pyramid[upIndex] = mipUpTexture;
            }
            cmd.blitScreenTriangle(lastDownTexture, mipDownTexture, this._shader, this._shaderData, subShader);
            lastDownTexture = mipDownTexture;
            tw = Math.max(Math.floor(tw / 2), 1);
            th = Math.max(Math.floor(th / 2), 1);
        }
        var lastUpTexture = this._pyramid[(iterations - 1) * 2];
        for (i = iterations - 2; i >= 0; i--) {
            downIndex = i * 2;
            upIndex = downIndex + 1;
            mipDownTexture = this._pyramid[downIndex];
            mipUpTexture = this._pyramid[upIndex];
            cmd.setShaderDataTexture(this._shaderData, BloomEffect.SHADERVALUE_BLOOMTEX, mipDownTexture);
            cmd.blitScreenTriangle(lastUpTexture, mipUpTexture, this._shader, this._shaderData, BloomEffect.SUBSHADER_UPSAMPLETENT + qualityOffset);
            lastUpTexture = mipUpTexture;
        }
        var linearColor = this._linearColor;
        this.color.toLinear(linearColor);
        var intensity = Math.pow(2, this._intensity / 10.0) - 1.0;
        var shaderSettings = this._shaderSetting;
        this._shaderSetting.setValue(sampleScale, intensity, this._dirtIntensity, iterations);
        var dirtTexture = this.dirtTexture ? this.dirtTexture : Texture2D.blackTexture;
        var dirtRatio = dirtTexture.width / dirtTexture.height;
        var screenRatio = viewport.width / viewport.height;
        var dirtTileOffset = this._dirtTileOffset;
        if (dirtRatio > screenRatio)
            dirtTileOffset.setValue(screenRatio / dirtRatio, 1.0, (1.0 - dirtTileOffset.x) * 0.5, 0.0);
        else if (dirtRatio < screenRatio)
            dirtTileOffset.setValue(1.0, dirtRatio / screenRatio, 0.0, (1.0 - dirtTileOffset.y) * 0.5);
        var compositeShaderData = context.compositeShaderData;
        if (this.fastMode)
            compositeShaderData.addDefine(PostProcess.SHADERDEFINE_BLOOM_LOW);
        else
            compositeShaderData.addDefine(PostProcess.SHADERDEFINE_BLOOM);
        this._bloomTextureTexelSize.setValue(1.0 / lastUpTexture.width, 1.0 / lastUpTexture.height, lastUpTexture.width, lastUpTexture.height);
        compositeShaderData.setVector(PostProcess.SHADERVALUE_BLOOM_DIRTTILEOFFSET, dirtTileOffset);
        compositeShaderData.setVector(PostProcess.SHADERVALUE_BLOOM_SETTINGS, shaderSettings);
        compositeShaderData.setVector(PostProcess.SHADERVALUE_BLOOM_COLOR, new Vector4(linearColor.r, linearColor.g, linearColor.b, linearColor.a));
        compositeShaderData.setTexture(PostProcess.SHADERVALUE_BLOOM_DIRTTEX, dirtTexture);
        compositeShaderData.setTexture(PostProcess.SHADERVALUE_BLOOMTEX, lastUpTexture);
        compositeShaderData.setVector(PostProcess.SHADERVALUE_BLOOMTEX_TEXELSIZE, this._bloomTextureTexelSize);
        for (i = 0; i < iterations; i++) {
            downIndex = i * 2;
            upIndex = downIndex + 1;
            RenderTexture.recoverToPool(this._pyramid[downIndex]);
            (i !== 0 && i !== iterations - 1) && (RenderTexture.recoverToPool(this._pyramid[upIndex]));
        }
        context.deferredReleaseTextures.push(lastUpTexture);
    }
}
BloomEffect.SHADERVALUE_MAINTEX = Shader3D.propertyNameToID("u_MainTex");
BloomEffect.SHADERVALUE_AUTOEXPOSURETEX = Shader3D.propertyNameToID("u_AutoExposureTex");
BloomEffect.SHADERVALUE_SAMPLESCALE = Shader3D.propertyNameToID("u_SampleScale");
BloomEffect.SHADERVALUE_THRESHOLD = Shader3D.propertyNameToID("u_Threshold");
BloomEffect.SHADERVALUE_PARAMS = Shader3D.propertyNameToID("u_Params");
BloomEffect.SHADERVALUE_BLOOMTEX = Shader3D.propertyNameToID("u_BloomTex");
BloomEffect.SUBSHADER_PREFILTER13 = 0;
BloomEffect.SUBSHADER_PREFILTER4 = 1;
BloomEffect.SUBSHADER_DOWNSAMPLE13 = 2;
BloomEffect.SUBSHADER_DOWNSAMPLE4 = 3;
BloomEffect.SUBSHADER_UPSAMPLETENT = 4;
BloomEffect.SUBSHADER_UPSAMPLEBOX = 5;
BloomEffect.MAXPYRAMIDSIZE = 16;
