import { TextAtlas } from "./TextAtlas";
import { TextTexture } from "./TextTexture";
import { Point } from "../../maths/Point";
import { RenderInfo } from "../../renders/RenderInfo";
import { Texture } from "../../resource/Texture";
import { FontInfo } from "../../utils/FontInfo";
import { WordText } from "../../utils/WordText";
import { CharRenderInfo } from "./CharRenderInfo";
import { CharRender_Canvas } from "./CharRender_Canvas";
import { CharRender_Native } from "./CharRender_Native";
import { ILaya } from "../../../ILaya";
export class TextRender {
    constructor() {
        this.fontSizeInfo = {};
        this.charRender = null;
        this.mapFont = {};
        this.fontID = 0;
        this.mapColor = [];
        this.colorID = 0;
        this.fontScaleX = 1.0;
        this.fontScaleY = 1.0;
        this._curStrPos = 0;
        this.textAtlases = [];
        this.isoTextures = [];
        this.lastFont = null;
        this.fontSizeW = 0;
        this.fontSizeH = 0;
        this.fontSizeOffX = 0;
        this.fontSizeOffY = 0;
        this.renderPerChar = true;
        this.tmpAtlasPos = new Point();
        this.textureMem = 0;
        ILaya.TextAtlas = TextAtlas;
        var bugIOS = false;
        var miniadp = ILaya.Laya['MiniAdpter'];
        if (miniadp && miniadp.systemInfo && miniadp.systemInfo.system) {
            bugIOS = miniadp.systemInfo.system.toLowerCase() === 'ios 10.1.1';
        }
        if (ILaya.Browser.onMiniGame && !bugIOS)
            TextRender.isWan1Wan = true;
        this.charRender = ILaya.Render.isConchApp ? (new CharRender_Native()) : (new CharRender_Canvas(TextRender.atlasWidth, TextRender.atlasWidth, TextRender.scaleFontWithCtx, !TextRender.isWan1Wan, false));
        TextRender.textRenderInst = this;
        ILaya.Laya['textRender'] = this;
        TextRender.atlasWidth2 = TextRender.atlasWidth * TextRender.atlasWidth;
    }
    setFont(font) {
        if (this.lastFont == font)
            return;
        this.lastFont = font;
        var fontsz = this.getFontSizeInfo(font._family);
        var offx = fontsz >> 24;
        var offy = (fontsz >> 16) & 0xff;
        var fw = (fontsz >> 8) & 0xff;
        var fh = fontsz & 0xff;
        var k = font._size / TextRender.standardFontSize;
        this.fontSizeOffX = Math.ceil(offx * k);
        this.fontSizeOffY = Math.ceil(offy * k);
        this.fontSizeW = Math.ceil(fw * k);
        this.fontSizeH = Math.ceil(fh * k);
        if (font._font.indexOf('italic') >= 0) {
            this.fontStr = font._font.replace('italic', '');
        }
        else {
            this.fontStr = font._font;
        }
    }
    getNextChar(str) {
        var len = str.length;
        var start = this._curStrPos;
        if (start >= len)
            return null;
        var link = false;
        var i = start;
        var state = 0;
        for (; i < len; i++) {
            var c = str.charCodeAt(i);
            if ((c >>> 11) == 0x1b) {
                if (state == 1)
                    break;
                state = 1;
                i++;
            }
            else if (c === 0xfe0e || c === 0xfe0f) {
            }
            else if (c == 0x200d) {
                state = 2;
            }
            else {
                if (state == 0)
                    state = 1;
                else if (state == 1)
                    break;
                else if (state == 2) {
                }
            }
        }
        this._curStrPos = i;
        return str.substring(start, i);
    }
    filltext(ctx, data, x, y, fontStr, color, strokeColor, lineWidth, textAlign, underLine = 0) {
        if (data.length <= 0)
            return;
        var font = FontInfo.Parse(fontStr);
        var nTextAlign = 0;
        switch (textAlign) {
            case 'center':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        this._fast_filltext(ctx, data, null, x, y, font, color, strokeColor, lineWidth, nTextAlign, underLine);
    }
    fillWords(ctx, data, x, y, fontStr, color, strokeColor, lineWidth) {
        if (!data)
            return;
        if (data.length <= 0)
            return;
        var font = FontInfo.Parse(fontStr);
        this._fast_filltext(ctx, null, data, x, y, font, color, strokeColor, lineWidth, 0, 0);
    }
    _fast_filltext(ctx, data, htmlchars, x, y, font, color, strokeColor, lineWidth, textAlign, underLine = 0) {
        if (data && data.length < 1)
            return;
        if (htmlchars && htmlchars.length < 1)
            return;
        if (lineWidth < 0)
            lineWidth = 0;
        this.setFont(font);
        this.fontScaleX = this.fontScaleY = 1.0;
        if (!ILaya.Render.isConchApp && TextRender.scaleFontWithCtx) {
            var sx = 1;
            var sy = 1;
            if (ILaya.Render.isConchApp) {
                sx = ctx._curMat.getScaleX();
                sy = ctx._curMat.getScaleY();
            }
            else {
                sx = ctx.getMatScaleX();
                sy = ctx.getMatScaleY();
            }
            if (sx < 1e-4 || sy < 1e-1)
                return;
            if (sx > 1)
                this.fontScaleX = sx;
            if (sy > 1)
                this.fontScaleY = sy;
        }
        font._italic && (ctx._italicDeg = 13);
        var wt = data;
        var isWT = !htmlchars && (data instanceof WordText);
        var str = data;
        var isHtmlChar = !!htmlchars;
        var sameTexData = isWT ? wt.pageChars : [];
        var strWidth = 0;
        if (isWT) {
            str = wt._text;
            strWidth = wt.width;
            if (strWidth < 0) {
                strWidth = wt.width = this.charRender.getWidth(this.fontStr, str);
            }
        }
        else {
            strWidth = str ? this.charRender.getWidth(this.fontStr, str) : 0;
        }
        switch (textAlign) {
            case ILaya.Context.ENUM_TEXTALIGN_CENTER:
                x -= strWidth / 2;
                break;
            case ILaya.Context.ENUM_TEXTALIGN_RIGHT:
                x -= strWidth;
                break;
        }
        if (wt && sameTexData) {
            if (this.hasFreedText(sameTexData)) {
                sameTexData = wt.pageChars = [];
            }
        }
        var ri = null;
        var oneTex = isWT || TextRender.forceWholeRender;
        var splitTex = this.renderPerChar = (!isWT) || TextRender.forceSplitRender || isHtmlChar || (isWT && wt.splitRender);
        if (!sameTexData || sameTexData.length < 1) {
            if (splitTex) {
                var stx = 0;
                var sty = 0;
                this._curStrPos = 0;
                var curstr;
                while (true) {
                    if (isHtmlChar) {
                        var chc = htmlchars[this._curStrPos++];
                        if (chc) {
                            curstr = chc.char;
                            stx = chc.x;
                            sty = chc.y;
                        }
                        else {
                            curstr = null;
                        }
                    }
                    else {
                        curstr = this.getNextChar(str);
                    }
                    if (!curstr)
                        break;
                    ri = this.getCharRenderInfo(curstr, font, color, strokeColor, lineWidth, false);
                    if (!ri) {
                        break;
                    }
                    if (ri.isSpace) {
                    }
                    else {
                        var add = sameTexData[ri.tex.id];
                        if (!add) {
                            var o1 = { texgen: ri.tex.genID, tex: ri.tex, words: [] };
                            sameTexData[ri.tex.id] = o1;
                            add = o1.words;
                        }
                        else {
                            add = add.words;
                        }
                        if (ILaya.Render.isConchApp) {
                            add.push({ ri: ri, x: stx, y: sty, w: ri.bmpWidth / this.fontScaleX, h: ri.bmpHeight / this.fontScaleY });
                        }
                        else {
                            add.push({ ri: ri, x: stx + 1 / this.fontScaleX, y: sty, w: (ri.bmpWidth - 2) / this.fontScaleX, h: (ri.bmpHeight - 1) / this.fontScaleY });
                        }
                        stx += ri.width;
                    }
                }
            }
            else {
                var isotex = TextRender.noAtlas || strWidth * this.fontScaleX > TextRender.atlasWidth;
                ri = this.getCharRenderInfo(str, font, color, strokeColor, lineWidth, isotex);
                if (ILaya.Render.isConchApp) {
                    sameTexData[0] = { texgen: ri.tex.genID, tex: ri.tex, words: [{ ri: ri, x: 0, y: 0, w: ri.bmpWidth / this.fontScaleX, h: ri.bmpHeight / this.fontScaleY }] };
                }
                else {
                    sameTexData[0] = { texgen: ri.tex.genID, tex: ri.tex, words: [{ ri: ri, x: 1 / this.fontScaleX, y: 0 / this.fontScaleY, w: (ri.bmpWidth - 2) / this.fontScaleX, h: (ri.bmpHeight - 1) / this.fontScaleY }] };
                }
            }
        }
        this._drawResortedWords(ctx, x, y, sameTexData);
        ctx._italicDeg = 0;
    }
    _drawResortedWords(ctx, startx, starty, samePagesData) {
        var isLastRender = ctx._charSubmitCache && ctx._charSubmitCache._enbale;
        var mat = ctx._curMat;
        var slen = samePagesData.length;
        for (var id = 0; id < slen; id++) {
            var dt = samePagesData[id];
            if (!dt)
                continue;
            var pri = dt.words;
            var pisz = pri.length;
            if (pisz <= 0)
                continue;
            var tex = samePagesData[id].tex;
            for (var j = 0; j < pisz; j++) {
                var riSaved = pri[j];
                var ri = riSaved.ri;
                if (ri.isSpace)
                    continue;
                ri.touch();
                ctx.drawTexAlign = true;
                if (ILaya.Render.isConchApp) {
                    ctx._drawTextureM(tex.texture, startx + riSaved.x - ri.orix, starty + riSaved.y - ri.oriy, riSaved.w, riSaved.h, null, 1.0, ri.uv);
                }
                else {
                    let t = tex;
                    ctx._inner_drawTexture(t.texture, t.id, startx + riSaved.x - ri.orix, starty + riSaved.y - ri.oriy, riSaved.w, riSaved.h, mat, ri.uv, 1.0, isLastRender);
                }
                if (ctx.touches) {
                    ctx.touches.push(ri);
                }
            }
        }
    }
    hasFreedText(txts) {
        var sz = txts.length;
        for (var i = 0; i < sz; i++) {
            var pri = txts[i];
            if (!pri)
                continue;
            var tex = pri.tex;
            if (tex.__destroyed || tex.genID != pri.texgen) {
                return true;
            }
        }
        return false;
    }
    getCharRenderInfo(str, font, color, strokeColor, lineWidth, isoTexture = false) {
        var fid = this.mapFont[font._family];
        if (fid == undefined) {
            this.mapFont[font._family] = fid = this.fontID++;
        }
        var key = str + '_' + fid + '_' + font._size + '_' + color;
        if (lineWidth > 0)
            key += '_' + strokeColor + lineWidth;
        if (font._bold)
            key += 'P';
        if (this.fontScaleX != 1 || this.fontScaleY != 1) {
            key += (this.fontScaleX * 20 | 0) + '_' + (this.fontScaleY * 20 | 0);
        }
        var i = 0;
        var sz = this.textAtlases.length;
        var ri = null;
        var atlas = null;
        if (!isoTexture) {
            for (i = 0; i < sz; i++) {
                atlas = this.textAtlases[i];
                ri = atlas.charMaps[key];
                if (ri) {
                    ri.touch();
                    return ri;
                }
            }
        }
        ri = new CharRenderInfo();
        this.charRender.scale(this.fontScaleX, this.fontScaleY);
        ri.char = str;
        ri.height = font._size;
        var margin = ILaya.Render.isConchApp ? 0 : (font._size / 3 | 0);
        var imgdt = null;
        var w1 = Math.ceil(this.charRender.getWidth(this.fontStr, str) * this.fontScaleX);
        if (w1 > this.charRender.canvasWidth) {
            this.charRender.canvasWidth = Math.min(2048, w1 + margin * 2);
        }
        if (isoTexture) {
            this.charRender.fontsz = font._size;
            imgdt = this.charRender.getCharBmp(str, this.fontStr, lineWidth, color, strokeColor, ri, margin, margin, margin, margin, null);
            var tex = TextTexture.getTextTexture(imgdt.width, imgdt.height);
            tex.addChar(imgdt, 0, 0, ri.uv);
            ri.tex = tex;
            ri.orix = margin;
            ri.oriy = margin;
            tex.ri = ri;
            this.isoTextures.push(tex);
        }
        else {
            var len = str.length;
            if (len > 1) {
            }
            var lineExt = lineWidth * 1;
            var fw = Math.ceil((this.fontSizeW + lineExt * 2) * this.fontScaleX);
            var fh = Math.ceil((this.fontSizeH + lineExt * 2) * this.fontScaleY);
            TextRender.imgdtRect[0] = ((margin - this.fontSizeOffX - lineExt) * this.fontScaleX) | 0;
            TextRender.imgdtRect[1] = ((margin - this.fontSizeOffY - lineExt) * this.fontScaleY) | 0;
            if (this.renderPerChar || len == 1) {
                TextRender.imgdtRect[2] = Math.max(w1, fw);
                TextRender.imgdtRect[3] = Math.max(w1, fh);
            }
            else {
                TextRender.imgdtRect[2] = -1;
                TextRender.imgdtRect[3] = fh;
            }
            this.charRender.fontsz = font._size;
            imgdt = this.charRender.getCharBmp(str, this.fontStr, lineWidth, color, strokeColor, ri, margin, margin, margin, margin, TextRender.imgdtRect);
            atlas = this.addBmpData(imgdt, ri);
            if (TextRender.isWan1Wan) {
                ri.orix = margin;
                ri.oriy = margin;
            }
            else {
                ri.orix = (this.fontSizeOffX + lineExt);
                ri.oriy = (this.fontSizeOffY + lineExt);
            }
            atlas.charMaps[key] = ri;
        }
        return ri;
    }
    addBmpData(data, ri) {
        var w = data.width;
        var h = data.height;
        var sz = this.textAtlases.length;
        var atlas = null;
        var find = false;
        for (var i = 0; i < sz; i++) {
            atlas = this.textAtlases[i];
            find = atlas.getAEmpty(w, h, this.tmpAtlasPos);
            if (find) {
                break;
            }
        }
        if (!find) {
            atlas = new TextAtlas();
            this.textAtlases.push(atlas);
            find = atlas.getAEmpty(w, h, this.tmpAtlasPos);
            if (!find) {
                throw 'err1';
            }
            this.cleanAtlases();
        }
        if (find) {
            atlas.texture.addChar(data, this.tmpAtlasPos.x, this.tmpAtlasPos.y, ri.uv);
            ri.tex = atlas.texture;
        }
        return atlas;
    }
    GC() {
        var i = 0;
        var sz = this.textAtlases.length;
        var dt = 0;
        var destroyDt = TextRender.destroyAtlasDt;
        var totalUsedRate = 0;
        var totalUsedRateAtlas = 0;
        var curloop = RenderInfo.loopCount;
        var maxWasteRateID = -1;
        var maxWasteRate = 0;
        var tex = null;
        var curatlas = null;
        for (; i < sz; i++) {
            curatlas = this.textAtlases[i];
            tex = curatlas.texture;
            if (tex) {
                totalUsedRate += tex.curUsedCovRate;
                totalUsedRateAtlas += tex.curUsedCovRateAtlas;
                var waste = curatlas.usedRate - tex.curUsedCovRateAtlas;
                if (maxWasteRate < waste) {
                    maxWasteRate = waste;
                    maxWasteRateID = i;
                }
            }
            dt = curloop - curatlas.texture.lastTouchTm;
            if (dt > destroyDt) {
                TextRender.showLog && console.log('TextRender GC delete atlas ' + tex ? curatlas.texture.id : 'unk');
                curatlas.destroy();
                this.textAtlases[i] = this.textAtlases[sz - 1];
                sz--;
                i--;
                maxWasteRateID = -1;
            }
        }
        this.textAtlases.length = sz;
        sz = this.isoTextures.length;
        for (i = 0; i < sz; i++) {
            tex = this.isoTextures[i];
            dt = curloop - tex.lastTouchTm;
            if (dt > TextRender.destroyUnusedTextureDt) {
                tex.ri.deleted = true;
                tex.ri.tex = null;
                tex.destroy();
                this.isoTextures[i] = this.isoTextures[sz - 1];
                sz--;
                i--;
            }
        }
        this.isoTextures.length = sz;
        var needGC = this.textAtlases.length > 1 && this.textAtlases.length - totalUsedRateAtlas >= 2;
        if (TextRender.atlasWidth * TextRender.atlasWidth * 4 * this.textAtlases.length > TextRender.cleanMem || needGC || TextRender.simClean) {
            TextRender.simClean = false;
            TextRender.showLog && console.log('清理使用率低的贴图。总使用率:', totalUsedRateAtlas, ':', this.textAtlases.length, '最差贴图:' + maxWasteRateID);
            if (maxWasteRateID >= 0) {
                curatlas = this.textAtlases[maxWasteRateID];
                curatlas.destroy();
                this.textAtlases[maxWasteRateID] = this.textAtlases[this.textAtlases.length - 1];
                this.textAtlases.length = this.textAtlases.length - 1;
            }
        }
        TextTexture.clean();
    }
    cleanAtlases() {
    }
    getCharBmp(c) {
    }
    checkBmpLine(data, l, sx, ex) {
        if (this.bmpData32.buffer != data.data.buffer) {
            this.bmpData32 = new Uint32Array(data.data.buffer);
        }
        var stpos = data.width * l + sx;
        for (var x = sx; x < ex; x++) {
            if (this.bmpData32[stpos++] != 0)
                return true;
        }
        return false;
    }
    updateBbx(data, curbbx, onlyH = false) {
        var w = data.width;
        var h = data.height;
        var x = 0;
        var sy = curbbx[1];
        var ey = 0;
        var y = sy;
        if (this.checkBmpLine(data, sy, 0, w)) {
            while (true) {
                y = (sy + ey) / 2 | 0;
                if (y + 1 >= sy) {
                    curbbx[1] = y;
                    break;
                }
                if (this.checkBmpLine(data, y, 0, w)) {
                    sy = y;
                }
                else {
                    ey = y;
                }
            }
        }
        if (curbbx[3] > h)
            curbbx[3] = h;
        else {
            y = sy = curbbx[3];
            ey = h;
            if (this.checkBmpLine(data, sy, 0, w)) {
                while (true) {
                    y = (sy + ey) / 2 | 0;
                    if (y - 1 <= sy) {
                        curbbx[3] = y;
                        break;
                    }
                    if (this.checkBmpLine(data, y, 0, w)) {
                        sy = y;
                    }
                    else {
                        ey = y;
                    }
                }
            }
        }
        if (onlyH)
            return;
        var minx = curbbx[0];
        var stpos = w * curbbx[1];
        for (y = curbbx[1]; y < curbbx[3]; y++) {
            for (x = 0; x < minx; x++) {
                if (this.bmpData32[stpos + x] != 0) {
                    minx = x;
                    break;
                }
            }
            stpos += w;
        }
        curbbx[0] = minx;
        var maxx = curbbx[2];
        stpos = w * curbbx[1];
        for (y = curbbx[1]; y < curbbx[3]; y++) {
            for (x = maxx; x < w; x++) {
                if (this.bmpData32[stpos + x] != 0) {
                    maxx = x;
                    break;
                }
            }
            stpos += w;
        }
        curbbx[2] = maxx;
    }
    getFontSizeInfo(font) {
        var finfo = this.fontSizeInfo[font];
        if (finfo != undefined)
            return finfo;
        var fontstr = 'bold ' + TextRender.standardFontSize + 'px ' + font;
        if (TextRender.isWan1Wan) {
            this.fontSizeW = this.charRender.getWidth(fontstr, '有') * 1.5;
            this.fontSizeH = TextRender.standardFontSize * 1.5;
            var szinfo = this.fontSizeW << 8 | this.fontSizeH;
            this.fontSizeInfo[font] = szinfo;
            return szinfo;
        }
        TextRender.pixelBBX[0] = TextRender.standardFontSize / 2;
        TextRender.pixelBBX[1] = TextRender.standardFontSize / 2;
        TextRender.pixelBBX[2] = TextRender.standardFontSize;
        TextRender.pixelBBX[3] = TextRender.standardFontSize;
        var orix = 16;
        var oriy = 16;
        var marginr = 16;
        var marginb = 16;
        this.charRender.scale(1, 1);
        TextRender.tmpRI.height = TextRender.standardFontSize;
        this.charRender.fontsz = TextRender.standardFontSize;
        var bmpdt = this.charRender.getCharBmp('g', fontstr, 0, 'red', null, TextRender.tmpRI, orix, oriy, marginr, marginb);
        if (ILaya.Render.isConchApp) {
            bmpdt.data = new Uint8ClampedArray(bmpdt.data);
        }
        this.bmpData32 = new Uint32Array(bmpdt.data.buffer);
        this.updateBbx(bmpdt, TextRender.pixelBBX, false);
        bmpdt = this.charRender.getCharBmp('有', fontstr, 0, 'red', null, TextRender.tmpRI, oriy, oriy, marginr, marginb);
        if (ILaya.Render.isConchApp) {
            bmpdt.data = new Uint8ClampedArray(bmpdt.data);
        }
        this.bmpData32 = new Uint32Array(bmpdt.data.buffer);
        if (TextRender.pixelBBX[2] < orix + TextRender.tmpRI.width)
            TextRender.pixelBBX[2] = orix + TextRender.tmpRI.width;
        this.updateBbx(bmpdt, TextRender.pixelBBX, false);
        if (ILaya.Render.isConchApp) {
            orix = 0;
            oriy = 0;
        }
        var xoff = Math.max(orix - TextRender.pixelBBX[0], 0);
        var yoff = Math.max(oriy - TextRender.pixelBBX[1], 0);
        var bbxw = TextRender.pixelBBX[2] - TextRender.pixelBBX[0];
        var bbxh = TextRender.pixelBBX[3] - TextRender.pixelBBX[1];
        var sizeinfo = xoff << 24 | yoff << 16 | bbxw << 8 | bbxh;
        this.fontSizeInfo[font] = sizeinfo;
        return sizeinfo;
    }
    printDbgInfo() {
        console.log('图集个数:' + this.textAtlases.length + ',每个图集大小:' + TextRender.atlasWidth + 'x' + TextRender.atlasWidth, ' 用canvas:', TextRender.isWan1Wan);
        console.log('图集占用空间:' + (TextRender.atlasWidth * TextRender.atlasWidth * 4 / 1024 / 1024 * this.textAtlases.length) + 'M');
        console.log('缓存用到的字体:');
        for (var f in this.mapFont) {
            var fontsz = this.getFontSizeInfo(f);
            var offx = fontsz >> 24;
            var offy = (fontsz >> 16) & 0xff;
            var fw = (fontsz >> 8) & 0xff;
            var fh = fontsz & 0xff;
            console.log('    ' + f, ' off:', offx, offy, ' size:', fw, fh);
        }
        var num = 0;
        console.log('缓存数据:');
        var totalUsedRate = 0;
        var totalUsedRateAtlas = 0;
        this.textAtlases.forEach(function (a) {
            var id = a.texture.id;
            var dt = RenderInfo.loopCount - a.texture.lastTouchTm;
            var dtstr = dt > 0 ? ('' + dt + '帧以前') : '当前帧';
            totalUsedRate += a.texture.curUsedCovRate;
            totalUsedRateAtlas += a.texture.curUsedCovRateAtlas;
            console.log('--图集(id:' + id + ',当前使用率:' + (a.texture.curUsedCovRate * 1000 | 0) + '‰', '当前图集使用率:', (a.texture.curUsedCovRateAtlas * 100 | 0) + '%', '图集使用率:', (a.usedRate * 100 | 0), '%, 使用于:' + dtstr + ')--:');
            for (var k in a.charMaps) {
                var ri = a.charMaps[k];
                console.log('     off:', ri.orix, ri.oriy, ' bmp宽高:', ri.bmpWidth, ri.bmpHeight, '无效:', ri.deleted, 'touchdt:', (RenderInfo.loopCount - ri.touchTick), '位置:', ri.uv[0] * TextRender.atlasWidth | 0, ri.uv[1] * TextRender.atlasWidth | 0, '字符:', ri.char, 'key:', k);
                num++;
            }
        });
        console.log('独立贴图文字(' + this.isoTextures.length + '个):');
        this.isoTextures.forEach(function (tex) {
            console.log('    size:', tex._texW, tex._texH, 'touch间隔:', (RenderInfo.loopCount - tex.lastTouchTm), 'char:', tex.ri.char);
        });
        console.log('总缓存:', num, '总使用率:', totalUsedRate, '总当前图集使用率:', totalUsedRateAtlas);
    }
    showAtlas(n, bgcolor, x, y, w, h) {
        if (!this.textAtlases[n]) {
            console.log('没有这个图集');
            return null;
        }
        var sp = new ILaya.Sprite();
        var texttex = this.textAtlases[n].texture;
        var texture = {
            width: TextRender.atlasWidth,
            height: TextRender.atlasWidth,
            sourceWidth: TextRender.atlasWidth,
            sourceHeight: TextRender.atlasWidth,
            offsetX: 0,
            offsetY: 0,
            getIsReady: function () { return true; },
            _addReference: function () { },
            _removeReference: function () { },
            _getSource: function () { return texttex._getSource(); },
            bitmap: { id: texttex.id },
            _uv: Texture.DEF_UV
        };
        sp.size = function (w, h) {
            this.width = w;
            this.height = h;
            sp.graphics.clear();
            sp.graphics.drawRect(0, 0, sp.width, sp.height, bgcolor);
            sp.graphics.drawTexture(texture, 0, 0, sp.width, sp.height);
            return this;
        };
        sp.graphics.drawRect(0, 0, w, h, bgcolor);
        sp.graphics.drawTexture(texture, 0, 0, w, h);
        sp.pos(x, y);
        window.Laya.stage.addChild(sp);
        return sp;
    }
    filltext_native(ctx, data, htmlchars, x, y, fontStr, color, strokeColor, lineWidth, textAlign, underLine = 0) {
        if (data && data.length <= 0)
            return;
        if (htmlchars && htmlchars.length < 1)
            return;
        var font = FontInfo.Parse(fontStr);
        var nTextAlign = 0;
        switch (textAlign) {
            case 'center':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        return this._fast_filltext(ctx, data, htmlchars, x, y, font, color, strokeColor, lineWidth, nTextAlign, underLine);
    }
}
TextRender.useOldCharBook = false;
TextRender.atlasWidth = 2048;
TextRender.noAtlas = false;
TextRender.forceSplitRender = false;
TextRender.forceWholeRender = false;
TextRender.scaleFontWithCtx = true;
TextRender.standardFontSize = 32;
TextRender.destroyAtlasDt = 10;
TextRender.checkCleanTextureDt = 2000;
TextRender.destroyUnusedTextureDt = 3000;
TextRender.cleanMem = 100 * 1024 * 1024;
TextRender.isWan1Wan = false;
TextRender.showLog = false;
TextRender.debugUV = false;
TextRender.atlasWidth2 = 2048 * 2048;
TextRender.tmpRI = new CharRenderInfo();
TextRender.pixelBBX = [0, 0, 0, 0];
TextRender.textRenderInst = null;
TextRender.imgdtRect = [0, 0, 0, 0];
TextRender.simClean = false;
TextTexture.gTextRender = TextRender;
