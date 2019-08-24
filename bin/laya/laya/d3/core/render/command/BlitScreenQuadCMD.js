import { Vector4 } from "../../../math/Vector4";
import { RenderContext3D } from "../RenderContext3D";
import { ScreenQuad } from "../ScreenQuad";
import { ScreenTriangle } from "../ScreenTriangle";
import { Command } from "./Command";
import { LayaGL } from "../../../../layagl/LayaGL";
export class BlitScreenQuadCMD extends Command {
    constructor() {
        super(...arguments);
        this._source = null;
        this._dest = null;
        this._shader = null;
        this._shaderData = null;
        this._subShader = 0;
        this._sourceTexelSize = new Vector4();
        this._screenType = 0;
    }
    static create(source, dest, shader = null, shaderData = null, subShader = 0, screenType = BlitScreenQuadCMD._SCREENTYPE_QUAD) {
        var cmd;
        cmd = BlitScreenQuadCMD._pool.length > 0 ? BlitScreenQuadCMD._pool.pop() : new BlitScreenQuadCMD();
        cmd._source = source;
        cmd._dest = dest;
        cmd._shader = shader;
        cmd._shaderData = shaderData;
        cmd._subShader = subShader;
        cmd._screenType = screenType;
        return cmd;
    }
    run() {
        var shader = this._shader || Command._screenShader;
        var shaderData = this._shaderData || Command._screenShaderData;
        var dest = this._dest;
        LayaGL.instance.viewport(0, 0, dest ? dest.width : RenderContext3D.clientWidth, dest ? dest.height : RenderContext3D.clientHeight);
        shaderData.setTexture(Command.SCREENTEXTURE_ID, this._source);
        this._sourceTexelSize.setValue(1.0 / this._source.width, 1.0 / this._source.height, this._source.width, this._source.height);
        shaderData.setVector(Command.MAINTEXTURE_TEXELSIZE_ID, this._sourceTexelSize);
        (dest) && (dest._start());
        var subShader = shader.getSubShaderAt(this._subShader);
        var passes = subShader._passes;
        for (var i = 0, n = passes.length; i < n; i++) {
            var shaderPass = passes[i].withCompile(0, 0, shaderData._defineDatas.value);
            shaderPass.bind();
            shaderPass.uploadUniforms(shaderPass._materialUniformParamsMap, shaderData, true);
            shaderPass.uploadRenderStateBlendDepth(shaderData);
            shaderPass.uploadRenderStateFrontFace(shaderData, false, null);
            switch (this._screenType) {
                case BlitScreenQuadCMD._SCREENTYPE_QUAD:
                    dest ? ScreenQuad.instance.renderInvertUV() : ScreenQuad.instance.render();
                    break;
                case BlitScreenQuadCMD._SCREENTYPE_TRIANGLE:
                    dest ? ScreenTriangle.instance.renderInvertUV() : ScreenTriangle.instance.render();
                    break;
                    throw "BlitScreenQuadCMD:unknown screen Type.";
            }
        }
        (dest) && (dest._end());
    }
    recover() {
        BlitScreenQuadCMD._pool.push(this);
        this._dest = null;
        this._shader = null;
        this._shaderData = null;
        super.recover();
    }
}
BlitScreenQuadCMD._SCREENTYPE_QUAD = 0;
BlitScreenQuadCMD._SCREENTYPE_TRIANGLE = 1;
BlitScreenQuadCMD._pool = [];
