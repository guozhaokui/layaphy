import { Rectangle } from "../maths/Rectangle";
import { Texture } from "../resource/Texture";
import { Handler } from "../utils/Handler";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class BitmapFont {
    constructor() {
        this._fontCharDic = {};
        this._fontWidthMap = {};
        this._maxWidth = 0;
        this._spaceWidth = 10;
        this.fontSize = 12;
        this.autoScaleSize = false;
        this.letterSpacing = 0;
    }
    loadFont(path, complete) {
        this._path = path;
        this._complete = complete;
        if (!path || path.indexOf(".fnt") === -1) {
            console.error('Bitmap font configuration information must be a ".fnt" file');
            return;
        }
        ILaya.loader.load([{ url: path, type: ILaya.Loader.XML }, { url: path.replace(".fnt", ".png"), type: ILaya.Loader.IMAGE }], Handler.create(this, this._onLoaded));
    }
    _onLoaded() {
        this.parseFont(ILaya.Loader.getRes(this._path), ILaya.Loader.getRes(this._path.replace(".fnt", ".png")));
        this._complete && this._complete.run();
    }
    parseFont(xml, texture) {
        if (xml == null || texture == null)
            return;
        this._texture = texture;
        var tX = 0;
        var tScale = 1;
        var tInfo = xml.getElementsByTagName("info");
        if (!tInfo[0].getAttributeNode) {
            return this.parseFont2(xml, texture);
        }
        this.fontSize = parseInt(tInfo[0].getAttributeNode("size").nodeValue);
        var tPadding = tInfo[0].getAttributeNode("padding").nodeValue;
        var tPaddingArray = tPadding.split(",");
        this._padding = [parseInt(tPaddingArray[0]), parseInt(tPaddingArray[1]), parseInt(tPaddingArray[2]), parseInt(tPaddingArray[3])];
        var chars = xml.getElementsByTagName("char");
        var i = 0;
        for (i = 0; i < chars.length; i++) {
            var tAttribute = chars[i];
            var tId = parseInt(tAttribute.getAttributeNode("id").nodeValue);
            var xOffset = parseInt(tAttribute.getAttributeNode("xoffset").nodeValue) / tScale;
            var yOffset = parseInt(tAttribute.getAttributeNode("yoffset").nodeValue) / tScale;
            var xAdvance = parseInt(tAttribute.getAttributeNode("xadvance").nodeValue) / tScale;
            var region = new Rectangle();
            region.x = parseInt(tAttribute.getAttributeNode("x").nodeValue);
            region.y = parseInt(tAttribute.getAttributeNode("y").nodeValue);
            region.width = parseInt(tAttribute.getAttributeNode("width").nodeValue);
            region.height = parseInt(tAttribute.getAttributeNode("height").nodeValue);
            var tTexture = Texture.create(texture, region.x, region.y, region.width, region.height, xOffset, yOffset);
            this._maxWidth = Math.max(this._maxWidth, xAdvance + this.letterSpacing);
            this._fontCharDic[tId] = tTexture;
            this._fontWidthMap[tId] = xAdvance;
        }
    }
    parseFont2(xml, texture) {
        if (xml == null || texture == null)
            return;
        this._texture = texture;
        var tX = 0;
        var tScale = 1;
        var tInfo = xml.getElementsByTagName("info");
        this.fontSize = parseInt(tInfo[0].attributes["size"].nodeValue);
        var tPadding = tInfo[0].attributes["padding"].nodeValue;
        var tPaddingArray = tPadding.split(",");
        this._padding = [parseInt(tPaddingArray[0]), parseInt(tPaddingArray[1]), parseInt(tPaddingArray[2]), parseInt(tPaddingArray[3])];
        var chars = xml.getElementsByTagName("char");
        var i = 0;
        for (i = 0; i < chars.length; i++) {
            var tAttribute = chars[i].attributes;
            var tId = parseInt(tAttribute["id"].nodeValue);
            var xOffset = parseInt(tAttribute["xoffset"].nodeValue) / tScale;
            var yOffset = parseInt(tAttribute["yoffset"].nodeValue) / tScale;
            var xAdvance = parseInt(tAttribute["xadvance"].nodeValue) / tScale;
            var region = new Rectangle();
            region.x = parseInt(tAttribute["x"].nodeValue);
            region.y = parseInt(tAttribute["y"].nodeValue);
            region.width = parseInt(tAttribute["width"].nodeValue);
            region.height = parseInt(tAttribute["height"].nodeValue);
            var tTexture = Texture.create(texture, region.x, region.y, region.width, region.height, xOffset, yOffset);
            this._maxWidth = Math.max(this._maxWidth, xAdvance + this.letterSpacing);
            this._fontCharDic[tId] = tTexture;
            this._fontWidthMap[tId] = xAdvance;
        }
    }
    getCharTexture(char) {
        return this._fontCharDic[char.charCodeAt(0)];
    }
    destroy() {
        if (this._texture) {
            for (var p in this._fontCharDic) {
                var tTexture = this._fontCharDic[p];
                if (tTexture)
                    tTexture.destroy();
            }
            this._texture.destroy();
            this._fontCharDic = null;
            this._fontWidthMap = null;
            this._texture = null;
            this._complete = null;
            this._padding = null;
        }
    }
    setSpaceWidth(spaceWidth) {
        this._spaceWidth = spaceWidth;
    }
    getCharWidth(char) {
        var code = char.charCodeAt(0);
        if (this._fontWidthMap[code])
            return this._fontWidthMap[code] + this.letterSpacing;
        if (char === " ")
            return this._spaceWidth + this.letterSpacing;
        return 0;
    }
    getTextWidth(text) {
        var tWidth = 0;
        for (var i = 0, n = text.length; i < n; i++) {
            tWidth += this.getCharWidth(text.charAt(i));
        }
        return tWidth;
    }
    getMaxWidth() {
        return this._maxWidth;
    }
    getMaxHeight() {
        return this.fontSize;
    }
    _drawText(text, sprite, drawX, drawY, align, width) {
        var tWidth = this.getTextWidth(text);
        var tTexture;
        var dx = 0;
        align === "center" && (dx = (width - tWidth) / 2);
        align === "right" && (dx = (width - tWidth));
        var tx = 0;
        for (var i = 0, n = text.length; i < n; i++) {
            tTexture = this.getCharTexture(text.charAt(i));
            if (tTexture) {
                sprite.graphics.drawImage(tTexture, drawX + tx + dx, drawY);
                tx += this.getCharWidth(text.charAt(i));
            }
        }
    }
}
ClassUtils.regClass("laya.display.BitmapFont", BitmapFont);
ClassUtils.regClass("Laya.BitmapFont", BitmapFont);
