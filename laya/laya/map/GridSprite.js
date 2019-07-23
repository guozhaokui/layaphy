import { Sprite } from "laya/display/Sprite";
export class GridSprite extends Sprite {
    constructor() {
        super(...arguments);
        this.relativeX = 0;
        this.relativeY = 0;
        this.isAloneObject = false;
        this.isHaveAnimation = false;
        this.drawImageNum = 0;
        this._map = null;
    }
    initData(map, objectKey = false) {
        this._map = map;
        this.isAloneObject = objectKey;
    }
    addAniSprite(sprite) {
        if (this.aniSpriteArray == null) {
            this.aniSpriteArray = [];
        }
        this.aniSpriteArray.push(sprite);
    }
    show() {
        if (!this.visible) {
            this.visible = true;
            if (this.aniSpriteArray == null) {
                return;
            }
            var tAniSprite;
            for (var i = 0; i < this.aniSpriteArray.length; i++) {
                tAniSprite = this.aniSpriteArray[i];
                tAniSprite.show();
            }
        }
    }
    hide() {
        if (this.visible) {
            this.visible = false;
            if (this.aniSpriteArray == null) {
                return;
            }
            var tAniSprite;
            for (var i = 0; i < this.aniSpriteArray.length; i++) {
                tAniSprite = this.aniSpriteArray[i];
                tAniSprite.hide();
            }
        }
    }
    updatePos() {
        if (this.isAloneObject) {
            if (this._map) {
                this.x = this.relativeX - this._map._viewPortX;
                this.y = this.relativeY - this._map._viewPortY;
            }
            if (this.x < 0 || this.x > this._map.viewPortWidth || this.y < 0 || this.y > this._map.viewPortHeight) {
                this.hide();
            }
            else {
                this.show();
            }
        }
        else {
            if (this._map) {
                this.x = this.relativeX - this._map._viewPortX;
                this.y = this.relativeY - this._map._viewPortY;
            }
        }
    }
    clearAll() {
        if (this._map) {
            this._map = null;
        }
        this.visible = false;
        var tAniSprite;
        if (this.aniSpriteArray != null) {
            for (var i = 0; i < this.aniSpriteArray.length; i++) {
                tAniSprite = this.aniSpriteArray[i];
                tAniSprite.clearAll();
            }
        }
        this.destroy();
        this.relativeX = 0;
        this.relativeY = 0;
        this.isHaveAnimation = false;
        this.aniSpriteArray = null;
        this.drawImageNum = 0;
    }
}
