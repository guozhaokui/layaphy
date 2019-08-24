import { AtlasGrid } from "./AtlasGrid";
import { TextTexture } from "./TextTexture";
import { ILaya } from "../../../ILaya";
export class TextAtlas {
    constructor() {
        this.texWidth = 1024;
        this.texHeight = 1024;
        this.protectDist = 1;
        this.texture = null;
        this.charMaps = {};
        this.texHeight = this.texWidth = ILaya.TextRender.atlasWidth;
        this.texture = TextTexture.getTextTexture(this.texWidth, this.texHeight);
        if (this.texWidth / TextAtlas.atlasGridW > 256) {
            TextAtlas.atlasGridW = Math.ceil(this.texWidth / 256);
        }
        this.atlasgrid = new AtlasGrid(this.texWidth / TextAtlas.atlasGridW, this.texHeight / TextAtlas.atlasGridW, this.texture.id);
    }
    setProtecteDist(d) {
        this.protectDist = d;
    }
    getAEmpty(w, h, pt) {
        var find = this.atlasgrid.addRect(1, Math.ceil(w / TextAtlas.atlasGridW), Math.ceil(h / TextAtlas.atlasGridW), pt);
        if (find) {
            pt.x *= TextAtlas.atlasGridW;
            pt.y *= TextAtlas.atlasGridW;
        }
        return find;
    }
    get usedRate() {
        return this.atlasgrid._used;
    }
    destroy() {
        for (var k in this.charMaps) {
            var ri = this.charMaps[k];
            ri.deleted = true;
        }
        this.texture.discard();
    }
    printDebugInfo() {
    }
}
TextAtlas.atlasGridW = 16;
