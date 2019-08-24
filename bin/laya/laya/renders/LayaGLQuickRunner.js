import { Const } from "../Const";
import { SpriteConst } from "../display/SpriteConst";
import { Matrix } from "../maths/Matrix";
export class LayaGLQuickRunner {
    static __init__() {
        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TRANSFORM | SpriteConst.GRAPHICS] = LayaGLQuickRunner.alpha_transform_drawLayaGL;
        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.GRAPHICS] = LayaGLQuickRunner.alpha_drawLayaGL;
        LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.GRAPHICS] = LayaGLQuickRunner.transform_drawLayaGL;
        LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.CHILDS] = LayaGLQuickRunner.transform_drawNodes;
        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TRANSFORM | SpriteConst.TEXTURE] = LayaGLQuickRunner.alpha_transform_drawTexture;
        LayaGLQuickRunner.map[SpriteConst.ALPHA | SpriteConst.TEXTURE] = LayaGLQuickRunner.alpha_drawTexture;
        LayaGLQuickRunner.map[SpriteConst.TRANSFORM | SpriteConst.TEXTURE] = LayaGLQuickRunner.transform_drawTexture;
        LayaGLQuickRunner.map[SpriteConst.GRAPHICS | SpriteConst.CHILDS] = LayaGLQuickRunner.drawLayaGL_drawNodes;
    }
    static transform_drawTexture(sprite, context, x, y) {
        var style = sprite._style;
        var tex = sprite.texture;
        context.saveTransform(LayaGLQuickRunner.curMat);
        context.transformByMatrix(sprite.transform, x, y);
        context.drawTexture(tex, -sprite.pivotX, -sprite.pivotY, sprite._width || tex.width, sprite._height || tex.height);
        context.restoreTransform(LayaGLQuickRunner.curMat);
    }
    static alpha_drawTexture(sprite, context, x, y) {
        var style = sprite._style;
        var alpha;
        var tex = sprite.texture;
        if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
            var temp = context.globalAlpha;
            context.globalAlpha *= alpha;
            context.drawTexture(tex, x - style.pivotX + tex.offsetX, y - style.pivotY + tex.offsetY, sprite._width || tex.width, sprite._height || tex.height);
            context.globalAlpha = temp;
        }
    }
    static alpha_transform_drawTexture(sprite, context, x, y) {
        var style = sprite._style;
        var alpha;
        var tex = sprite.texture;
        if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
            var temp = context.globalAlpha;
            context.globalAlpha *= alpha;
            context.saveTransform(LayaGLQuickRunner.curMat);
            context.transformByMatrix(sprite.transform, x, y);
            context.drawTexture(tex, -style.pivotX + tex.offsetX, -style.pivotY + tex.offsetY, sprite._width || tex.width, sprite._height || tex.height);
            context.restoreTransform(LayaGLQuickRunner.curMat);
            context.globalAlpha = temp;
        }
    }
    static alpha_transform_drawLayaGL(sprite, context, x, y) {
        var style = sprite._style;
        var alpha;
        if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
            var temp = context.globalAlpha;
            context.globalAlpha *= alpha;
            context.saveTransform(LayaGLQuickRunner.curMat);
            context.transformByMatrix(sprite.transform, x, y);
            sprite._graphics && sprite._graphics._render(sprite, context, -style.pivotX, -style.pivotY);
            context.restoreTransform(LayaGLQuickRunner.curMat);
            context.globalAlpha = temp;
        }
    }
    static alpha_drawLayaGL(sprite, context, x, y) {
        var style = sprite._style;
        var alpha;
        if ((alpha = style.alpha) > 0.01 || sprite._needRepaint()) {
            var temp = context.globalAlpha;
            context.globalAlpha *= alpha;
            sprite._graphics && sprite._graphics._render(sprite, context, x - style.pivotX, y - style.pivotY);
            context.globalAlpha = temp;
        }
    }
    static transform_drawLayaGL(sprite, context, x, y) {
        var style = sprite._style;
        context.saveTransform(LayaGLQuickRunner.curMat);
        context.transformByMatrix(sprite.transform, x, y);
        sprite._graphics && sprite._graphics._render(sprite, context, -style.pivotX, -style.pivotY);
        context.restoreTransform(LayaGLQuickRunner.curMat);
    }
    static transform_drawNodes(sprite, context, x, y) {
        var textLastRender = sprite._getBit(Const.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);
        var style = sprite._style;
        context.saveTransform(LayaGLQuickRunner.curMat);
        context.transformByMatrix(sprite.transform, x, y);
        x = -style.pivotX;
        y = -style.pivotY;
        var childs = sprite._children, n = childs.length, ele;
        if (style.viewport) {
            var rect = style.viewport;
            var left = rect.x;
            var top = rect.y;
            var right = rect.right;
            var bottom = rect.bottom;
            var _x, _y;
            for (i = 0; i < n; ++i) {
                if ((ele = childs[i])._visible && ((_x = ele._x) < right && (_x + ele.width) > left && (_y = ele._y) < bottom && (_y + ele.height) > top)) {
                    ele.render(context, x, y);
                }
            }
        }
        else {
            for (var i = 0; i < n; ++i)
                (ele = childs[i])._visible && ele.render(context, x, y);
        }
        context.restoreTransform(LayaGLQuickRunner.curMat);
        textLastRender && context.drawCallOptimize(false);
    }
    static drawLayaGL_drawNodes(sprite, context, x, y) {
        var textLastRender = sprite._getBit(Const.DRAWCALL_OPTIMIZE) && context.drawCallOptimize(true);
        var style = sprite._style;
        x = x - style.pivotX;
        y = y - style.pivotY;
        sprite._graphics && sprite._graphics._render(sprite, context, x, y);
        var childs = sprite._children, n = childs.length, ele;
        if (style.viewport) {
            var rect = style.viewport;
            var left = rect.x;
            var top = rect.y;
            var right = rect.right;
            var bottom = rect.bottom;
            var _x, _y;
            for (i = 0; i < n; ++i) {
                if ((ele = childs[i])._visible && ((_x = ele._x) < right && (_x + ele.width) > left && (_y = ele._y) < bottom && (_y + ele.height) > top)) {
                    ele.render(context, x, y);
                }
            }
        }
        else {
            for (var i = 0; i < n; ++i)
                (ele = childs[i])._visible && ele.render(context, x, y);
        }
        textLastRender && context.drawCallOptimize(false);
    }
}
LayaGLQuickRunner.map = {};
LayaGLQuickRunner.curMat = new Matrix();
