import { RenderInfo } from "../../renders/RenderInfo";
export class CharRenderInfo {
    constructor() {
        this.char = '';
        this.deleted = false;
        this.uv = new Array(8);
        this.pos = 0;
        this.orix = 0;
        this.oriy = 0;
        this.touchTick = 0;
        this.isSpace = false;
    }
    touch() {
        var curLoop = RenderInfo.loopCount;
        if (this.touchTick != curLoop) {
            this.tex.touchRect(this, curLoop);
        }
        this.touchTick = curLoop;
    }
}
