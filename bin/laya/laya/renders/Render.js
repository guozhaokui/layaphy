import { ILaya } from "./../../ILaya";
import { Config } from "./../../Config";
import { LayaGL } from "../layagl/LayaGL";
import { Context } from "../resource/Context";
import { WebGL } from "../webgl/WebGL";
import { WebGLContext } from "../webgl/WebGLContext";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { Shader2D } from "../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { Buffer2D } from "../webgl/utils/Buffer2D";
import { SubmitBase } from "../webgl/submit/SubmitBase";
import { LayaGPU } from "../webgl/LayaGPU";
export class Render {
    constructor(width, height, mainCanv) {
        this._timeId = 0;
        Render._mainCanvas = mainCanv;
        Render._mainCanvas.source.id = "layaCanvas";
        Render._mainCanvas.source.width = width;
        Render._mainCanvas.source.height = height;
        if (Render.isConchApp) {
            document.body.appendChild(Render._mainCanvas.source);
        }
        this.initRender(Render._mainCanvas, width, height);
        window.requestAnimationFrame(loop);
        function loop(stamp) {
            ILaya.stage._loop();
            window.requestAnimationFrame(loop);
        }
        ILaya.stage.on("visibilitychange", this, this._onVisibilitychange);
    }
    _onVisibilitychange() {
        if (!ILaya.stage.isVisibility) {
            this._timeId = window.setInterval(this._enterFrame, 1000);
        }
        else if (this._timeId != 0) {
            window.clearInterval(this._timeId);
        }
    }
    initRender(canvas, w, h) {
        function getWebGLContext(canvas) {
            var gl;
            var names = ["webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
            if (!Config.useWebGL2) {
                names.shift();
            }
            for (var i = 0; i < names.length; i++) {
                try {
                    gl = canvas.getContext(names[i], { stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias, premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer });
                }
                catch (e) {
                }
                if (gl) {
                    (names[i] === 'webgl2') && (WebGL._isWebGL2 = true);
                    new LayaGL();
                    return gl;
                }
            }
            return null;
        }
        var gl = LayaGL.instance = WebGLContext.mainContext = getWebGLContext(Render._mainCanvas.source);
        if (!gl)
            return false;
        LayaGL.instance = gl;
        LayaGL.layaGPUInstance = new LayaGPU(gl, WebGL._isWebGL2);
        canvas.size(w, h);
        Context.__init__();
        SubmitBase.__init__();
        var ctx = new Context();
        ctx.isMain = true;
        Render._context = ctx;
        canvas._setContext(ctx);
        ShaderDefines2D.__init__();
        Value2D.__init__();
        Shader2D.__init__();
        Buffer2D.__int__(gl);
        BlendMode._init_(gl);
        return true;
    }
    _enterFrame(e = null) {
        ILaya.stage._loop();
    }
    static get context() {
        return Render._context;
    }
    static get canvas() {
        return Render._mainCanvas.source;
    }
}
Render.supportWebGLPlusCulling = false;
Render.supportWebGLPlusAnimation = false;
Render.supportWebGLPlusRendering = false;
Render.isConchApp = false;
{
    Render.isConchApp = (window.conch != null);
    if (Render.isConchApp) {
        Render.supportWebGLPlusCulling = true;
        Render.supportWebGLPlusAnimation = true;
        Render.supportWebGLPlusRendering = true;
    }
}
