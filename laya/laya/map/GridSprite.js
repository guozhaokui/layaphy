import { Sprite } from "../display/Sprite";
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
        if (!this._visible) {
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
        if (this._visible) {
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
            if (this._x < 0 || this._x > this._map.viewPortWidth || this._y < 0 || this._y > this._map.viewPortHeight) {
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
