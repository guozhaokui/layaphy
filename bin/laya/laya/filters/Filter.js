import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { WebGLRTMgr } from "../resource/WebGLRTMgr";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { SubmitCMD } from "../webgl/submit/SubmitCMD";
export class Filter {
    constructor() { }
    get type() { return -1; }
}
Filter.BLUR = 0x10;
Filter.COLOR = 0x20;
Filter.GLOW = 0x08;
Filter._filter = function (sprite, context, x, y) {
    var webglctx = context;
    var next = this._next;
    if (next) {
        var filters = sprite.filters, len = filters.length;
        if (len == 1 && (filters[0].type == Filter.COLOR)) {
            context.save();
            context.setColorFilter(filters[0]);
            next._fun.call(next, sprite, context, x, y);
            context.restore();
            return;
        }
        var svCP = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
        var b;
        var p = Point.TEMP;
        var tMatrix = webglctx._curMat;
        var mat = Matrix.create();
        tMatrix.copyTo(mat);
        var tPadding = 0;
        var tHalfPadding = 0;
        var tIsHaveGlowFilter = false;
        var source = null;
        var out = sprite._cacheStyle.filterCache || null;
        if (!out || sprite.getRepaint() != 0) {
            tIsHaveGlowFilter = sprite._isHaveGlowFilter();
            if (tIsHaveGlowFilter) {
                tPadding = 50;
                tHalfPadding = 25;
            }
            b = new Rectangle();
            b.copyFrom(sprite.getSelfBounds());
            b.x += sprite.x;
            b.y += sprite.y;
            b.x -= sprite.pivotX + 4;
            b.y -= sprite.pivotY + 4;
            var tSX = b.x;
            var tSY = b.y;
            b.width += (tPadding + 8);
            b.height += (tPadding + 8);
            p.x = b.x * mat.a + b.y * mat.c;
            p.y = b.y * mat.d + b.x * mat.b;
            b.x = p.x;
            b.y = p.y;
            p.x = b.width * mat.a + b.height * mat.c;
            p.y = b.height * mat.d + b.width * mat.b;
            b.width = p.x;
            b.height = p.y;
            if (b.width <= 0 || b.height <= 0) {
                return;
            }
            out && WebGLRTMgr.releaseRT(out);
            source = WebGLRTMgr.getRT(b.width, b.height);
            var outRT = out = WebGLRTMgr.getRT(b.width, b.height);
            sprite._getCacheStyle().filterCache = out;
            webglctx.pushRT();
            webglctx.useRT(source);
            var tX = sprite.x - tSX + tHalfPadding;
            var tY = sprite.y - tSY + tHalfPadding;
            next._fun.call(next, sprite, context, tX, tY);
            webglctx.useRT(outRT);
            for (var i = 0; i < len; i++) {
                if (i != 0) {
                    webglctx.useRT(source);
                    webglctx.drawTarget(outRT, 0, 0, b.width, b.height, Matrix.TEMP.identity(), svCP, null, BlendMode.TOINT.overlay);
                    webglctx.useRT(outRT);
                }
                var fil = filters[i];
                switch (fil.type) {
                    case Filter.BLUR:
                        fil._glRender && fil._glRender.render(source, context, b.width, b.height, fil);
                        break;
                    case Filter.GLOW:
                        fil._glRender && fil._glRender.render(source, context, b.width, b.height, fil);
                        break;
                    case Filter.COLOR:
                        webglctx.setColorFilter(fil);
                        webglctx.drawTarget(source, 0, 0, b.width, b.height, Matrix.EMPTY.identity(), Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
                        webglctx.setColorFilter(null);
                        break;
                }
            }
            webglctx.popRT();
        }
        else {
            tIsHaveGlowFilter = sprite._cacheStyle.hasGlowFilter || false;
            if (tIsHaveGlowFilter) {
                tPadding = 50;
                tHalfPadding = 25;
            }
            b = sprite.getBounds();
            if (b.width <= 0 || b.height <= 0) {
                return;
            }
            b.width += tPadding;
            b.height += tPadding;
            p.x = b.x * mat.a + b.y * mat.c;
            p.y = b.y * mat.d + b.x * mat.b;
            b.x = p.x;
            b.y = p.y;
            p.x = b.width * mat.a + b.height * mat.c;
            p.y = b.height * mat.d + b.width * mat.b;
            b.width = p.x;
            b.height = p.y;
        }
        x = x - tHalfPadding - sprite.x;
        y = y - tHalfPadding - sprite.y;
        p.setTo(x, y);
        mat.transformPoint(p);
        x = p.x + b.x;
        y = p.y + b.y;
        webglctx._drawRenderTexture(out, x, y, b.width, b.height, Matrix.TEMP.identity(), 1.0, RenderTexture2D.defuv);
        if (source) {
            var submit = SubmitCMD.create([source], function (s) {
                s.destroy();
            }, this);
            source = null;
            context.addRenderObject(submit);
        }
        mat.destroy();
    }
};
