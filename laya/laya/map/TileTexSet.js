import { ILaya } from "../../ILaya";
export class TileTexSet {
    constructor() {
        this.gid = -1;
        this.offX = 0;
        this.offY = 0;
        this.textureArray = null;
        this.durationTimeArray = null;
        this.animationTotalTime = 0;
        this.isAnimation = false;
        this._spriteNum = 0;
        this._aniDic = null;
        this._frameIndex = 0;
        this._time = 0;
        this._interval = 0;
        this._preFrameTime = 0;
    }
    addAniSprite(aniName, sprite) {
        if (this.animationTotalTime == 0) {
            return;
        }
        if (this._aniDic == null) {
            this._aniDic = {};
        }
        if (this._spriteNum == 0) {
            ILaya.timer.frameLoop(3, this, this.animate);
            this._preFrameTime = ILaya.Browser.now();
            this._frameIndex = 0;
            this._time = 0;
            this._interval = 0;
        }
        this._spriteNum++;
        this._aniDic[aniName] = sprite;
        if (this.textureArray && this._frameIndex < this.textureArray.length) {
            var tTileTextureSet = this.textureArray[this._frameIndex];
            this.drawTexture(sprite, tTileTextureSet);
        }
    }
    animate() {
        if (this.textureArray && this.textureArray.length > 0 && this.durationTimeArray && this.durationTimeArray.length > 0) {
            var tNow = ILaya.Browser.now();
            this._interval = tNow - this._preFrameTime;
            this._preFrameTime = tNow;
            if (this._interval > this.animationTotalTime) {
                this._interval = this._interval % this.animationTotalTime;
            }
            this._time += this._interval;
            var tTime = this.durationTimeArray[this._frameIndex];
            while (this._time > tTime) {
                this._time -= tTime;
                this._frameIndex++;
                if (this._frameIndex >= this.durationTimeArray.length || this._frameIndex >= this.textureArray.length) {
                    this._frameIndex = 0;
                }
                var tTileTextureSet = this.textureArray[this._frameIndex];
                var tSprite;
                for (var p in this._aniDic) {
                    tSprite = this._aniDic[p];
                    this.drawTexture(tSprite, tTileTextureSet);
                }
                tTime = this.durationTimeArray[this._frameIndex];
            }
        }
    }
    drawTexture(sprite, tileTextSet) {
        sprite.graphics.clear(true);
        sprite.graphics.drawImage(tileTextSet.texture, tileTextSet.offX, tileTextSet.offY);
    }
    removeAniSprite(_name) {
        if (this._aniDic && this._aniDic[_name]) {
            delete this._aniDic[_name];
            this._spriteNum--;
            if (this._spriteNum == 0) {
                ILaya.timer.clear(this, this.animate);
            }
        }
    }
    showDebugInfo() {
        var tInfo = null;
        if (this._spriteNum > 0) {
            tInfo = "TileTextureSet::gid:" + this.gid.toString() + " 动画数:" + this._spriteNum.toString();
        }
        return tInfo;
    }
    clearAll() {
        this.gid = -1;
        if (this.texture) {
            this.texture.destroy();
            this.texture = null;
        }
        this.offX = 0;
        this.offY = 0;
        this.textureArray = null;
        this.durationTimeArray = null;
        this.isAnimation = false;
        this._spriteNum = 0;
        this._aniDic = null;
        this._frameIndex = 0;
        this._preFrameTime = 0;
        this._time = 0;
        this._interval = 0;
    }
}
