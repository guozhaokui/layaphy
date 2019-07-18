import { Sprite } from "../display/Sprite";
export class TileAniSprite extends Sprite {
    constructor() {
        super(...arguments);
        this._tileTextureSet = null;
        this._aniName = null;
    }
    setTileTextureSet(aniName, tileTextureSet) {
        this._aniName = aniName;
        this._tileTextureSet = tileTextureSet;
        tileTextureSet.addAniSprite(this._aniName, this);
    }
    show() {
        this._tileTextureSet.addAniSprite(this._aniName, this);
    }
    hide() {
        this._tileTextureSet.removeAniSprite(this._aniName);
    }
    clearAll() {
        this._tileTextureSet.removeAniSprite(this._aniName);
        this.destroy();
        this._tileTextureSet = null;
        this._aniName = null;
    }
}
