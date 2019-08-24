export class Stat {
    static show(x = 0, y = 0) {
        Stat._StatRender.show(x, y);
    }
    static enable() {
        Stat._StatRender.enable();
    }
    static hide() {
        Stat._StatRender.hide();
    }
    static clear() {
        Stat.trianglesFaces = Stat.renderBatches = Stat.savedRenderBatches = Stat.shaderCall = Stat.spriteRenderUseCacheCount = Stat.frustumCulling = Stat.octreeNodeCulling = Stat.canvasNormal = Stat.canvasBitmap = Stat.canvasReCache = 0;
    }
    static set onclick(fn) {
        Stat._StatRender.set_onclick(fn);
    }
}
Stat.FPS = 0;
Stat.loopCount = 0;
Stat.shaderCall = 0;
Stat.renderBatches = 0;
Stat.savedRenderBatches = 0;
Stat.trianglesFaces = 0;
Stat.spriteCount = 0;
Stat.spriteRenderUseCacheCount = 0;
Stat.frustumCulling = 0;
Stat.octreeNodeCulling = 0;
Stat.canvasNormal = 0;
Stat.canvasBitmap = 0;
Stat.canvasReCache = 0;
Stat.renderSlow = false;
Stat._fpsData = [];
Stat._timer = 0;
Stat._count = 0;
Stat._StatRender = null;
