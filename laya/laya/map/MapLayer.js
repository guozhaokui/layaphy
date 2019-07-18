import { TileAniSprite } from "./TileAniSprite";
import { Sprite } from "../display/Sprite";
import { Point } from "../maths/Point";
import { GridSprite } from "./GridSprite";
import { IMap } from "./IMap";
export class MapLayer extends Sprite {
    constructor() {
        super(...arguments);
        this._mapData = null;
        this._tileWidthHalf = 0;
        this._tileHeightHalf = 0;
        this._mapWidthHalf = 0;
        this._mapHeightHalf = 0;
        this._gridSpriteArray = [];
        this._objDic = null;
        this._dataDic = null;
        this._tempMapPos = new Point();
        this.layerName = null;
    }
    init(layerData, map) {
        this._map = map;
        this._mapData = layerData.data;
        var tHeight = layerData.height;
        var tWidth = layerData.width;
        var tTileW = map.tileWidth;
        var tTileH = map.tileHeight;
        this.layerName = layerData.name;
        this._properties = layerData.properties;
        this.alpha = layerData.opacity;
        this._tileWidthHalf = tTileW / 2;
        this._tileHeightHalf = tTileH / 2;
        this._mapWidthHalf = this._map.width / 2 - this._tileWidthHalf;
        this._mapHeightHalf = this._map.height / 2;
        switch (layerData.type) {
            case "tilelayer":
                break;
            case "objectgroup":
                var tObjectGid = 0;
                var tArray = layerData.objects;
                if (tArray.length > 0) {
                    this._objDic = {};
                    this._dataDic = {};
                }
                var tObjectData;
                var tObjWidth;
                var tObjHeight;
                for (var i = 0; i < tArray.length; i++) {
                    tObjectData = tArray[i];
                    this._dataDic[tObjectData.name] = tObjectData;
                    if (tObjectData.visible == true) {
                        tObjWidth = tObjectData.width;
                        tObjHeight = tObjectData.height;
                        var tSprite = map.getSprite(tObjectData.gid, tObjWidth, tObjHeight);
                        if (tSprite != null) {
                            switch (this._map.orientation) {
                                case IMap.TiledMap.ORIENTATION_ISOMETRIC:
                                    this.getScreenPositionByTilePos(tObjectData.x / tTileH, tObjectData.y / tTileH, Point.TEMP);
                                    tSprite.pivot(tObjWidth / 2, tObjHeight / 2);
                                    tSprite.rotation = tObjectData.rotation;
                                    tSprite.x = tSprite.relativeX = Point.TEMP.x + this._map.viewPortX;
                                    tSprite.y = tSprite.relativeY = Point.TEMP.y + this._map.viewPortY - tObjHeight / 2;
                                    break;
                                case IMap.TiledMap.ORIENTATION_STAGGERED:
                                    tSprite.pivot(tObjWidth / 2, tObjHeight / 2);
                                    tSprite.rotation = tObjectData.rotation;
                                    tSprite.x = tSprite.relativeX = tObjectData.x + tObjWidth / 2;
                                    tSprite.y = tSprite.relativeY = tObjectData.y - tObjHeight / 2;
                                    break;
                                case IMap.TiledMap.ORIENTATION_ORTHOGONAL:
                                    tSprite.pivot(tObjWidth / 2, tObjHeight / 2);
                                    tSprite.rotation = tObjectData.rotation;
                                    tSprite.x = tSprite.relativeX = tObjectData.x + tObjWidth / 2;
                                    tSprite.y = tSprite.relativeY = tObjectData.y - tObjHeight / 2;
                                    break;
                                case IMap.TiledMap.ORIENTATION_HEXAGONAL:
                                    tSprite.x = tSprite.relativeX = tObjectData.x;
                                    tSprite.y = tSprite.relativeY = tObjectData.y;
                                    break;
                            }
                            this.addChild(tSprite);
                            this._gridSpriteArray.push(tSprite);
                            this._objDic[tObjectData.name] = tSprite;
                        }
                    }
                }
                break;
        }
    }
    getObjectByName(objName) {
        if (this._objDic) {
            return this._objDic[objName];
        }
        return null;
    }
    getObjectDataByName(objName) {
        if (this._dataDic) {
            return this._dataDic[objName];
        }
        return null;
    }
    getLayerProperties(name) {
        if (this._properties) {
            return this._properties[name];
        }
        return null;
    }
    getTileData(tileX, tileY) {
        if (tileY >= 0 && tileY < this._map.numRowsTile && tileX >= 0 && tileX < this._map.numColumnsTile) {
            var tIndex = tileY * this._map.numColumnsTile + tileX;
            var tMapData = this._mapData;
            if (tMapData != null && tIndex < tMapData.length) {
                return tMapData[tIndex];
            }
        }
        return 0;
    }
    getScreenPositionByTilePos(tileX, tileY, screenPos = null) {
        if (screenPos) {
            switch (this._map.orientation) {
                case IMap.TiledMap.ORIENTATION_ISOMETRIC:
                    screenPos.x = this._map.width / 2 - (tileY - tileX) * this._tileWidthHalf;
                    screenPos.y = (tileY + tileX) * this._tileHeightHalf;
                    break;
                case IMap.TiledMap.ORIENTATION_STAGGERED:
                    tileX = Math.floor(tileX);
                    tileY = Math.floor(tileY);
                    screenPos.x = tileX * this._map.tileWidth + (tileY & 1) * this._tileWidthHalf;
                    screenPos.y = tileY * this._tileHeightHalf;
                    break;
                case IMap.TiledMap.ORIENTATION_ORTHOGONAL:
                    screenPos.x = tileX * this._map.tileWidth;
                    screenPos.y = tileY * this._map.tileHeight;
                    break;
                case IMap.TiledMap.ORIENTATION_HEXAGONAL:
                    tileX = Math.floor(tileX);
                    tileY = Math.floor(tileY);
                    var tTileHeight = this._map.tileHeight * 2 / 3;
                    screenPos.x = (tileX * this._map.tileWidth + tileY % 2 * this._tileWidthHalf) % this._map.gridWidth;
                    screenPos.y = (tileY * tTileHeight) % this._map.gridHeight;
                    break;
            }
            screenPos.x = (screenPos.x + this._map.viewPortX) * this._map.scale;
            screenPos.y = (screenPos.y + this._map.viewPortY) * this._map.scale;
        }
    }
    getTileDataByScreenPos(screenX, screenY) {
        var tData = 0;
        if (this.getTilePositionByScreenPos(screenX, screenY, this._tempMapPos)) {
            tData = this.getTileData(Math.floor(this._tempMapPos.x), Math.floor(this._tempMapPos.y));
        }
        return tData;
    }
    getTilePositionByScreenPos(screenX, screenY, result = null) {
        screenX = screenX / this._map.scale - this._map.viewPortX;
        screenY = screenY / this._map.scale - this._map.viewPortY;
        var tTileW = this._map.tileWidth;
        var tTileH = this._map.tileHeight;
        var tV = 0;
        var tU = 0;
        switch (this._map.orientation) {
            case IMap.TiledMap.ORIENTATION_ISOMETRIC:
                var tDirX = screenX - this._map.width / 2;
                var tDirY = screenY;
                tV = -(tDirX / tTileW - tDirY / tTileH);
                tU = tDirX / tTileW + tDirY / tTileH;
                if (result) {
                    result.x = tU;
                    result.y = tV;
                }
                return true;
                break;
            case IMap.TiledMap.ORIENTATION_STAGGERED:
                if (result) {
                    var cx, cy, rx, ry;
                    cx = Math.floor(screenX / tTileW) * tTileW + tTileW / 2;
                    cy = Math.floor(screenY / tTileH) * tTileH + tTileH / 2;
                    rx = (screenX - cx) * tTileH / 2;
                    ry = (screenY - cy) * tTileW / 2;
                    if (Math.abs(rx) + Math.abs(ry) <= tTileW * tTileH / 4) {
                        tU = Math.floor(screenX / tTileW);
                        tV = Math.floor(screenY / tTileH) * 2;
                    }
                    else {
                        screenX = screenX - tTileW / 2;
                        tU = Math.floor(screenX / tTileW) + 1;
                        screenY = screenY - tTileH / 2;
                        tV = Math.floor(screenY / tTileH) * 2 + 1;
                    }
                    result.x = tU - (tV & 1);
                    result.y = tV;
                }
                return true;
                break;
            case IMap.TiledMap.ORIENTATION_ORTHOGONAL:
                tU = screenX / tTileW;
                tV = screenY / tTileH;
                if (result) {
                    result.x = tU;
                    result.y = tV;
                }
                return true;
                break;
            case IMap.TiledMap.ORIENTATION_HEXAGONAL:
                var tTileHeight = tTileH * 2 / 3;
                tV = screenY / tTileHeight;
                tU = (screenX - tV % 2 * this._tileWidthHalf) / tTileW;
                if (result) {
                    result.x = tU;
                    result.y = tV;
                }
                break;
        }
        return false;
    }
    getDrawSprite(gridX, gridY) {
        var tSprite = new GridSprite();
        tSprite.relativeX = gridX * this._map.gridWidth;
        tSprite.relativeY = gridY * this._map.gridHeight;
        tSprite.initData(this._map);
        this._gridSpriteArray.push(tSprite);
        return tSprite;
    }
    updateGridPos() {
        var tSprite;
        for (var i = 0; i < this._gridSpriteArray.length; i++) {
            tSprite = this._gridSpriteArray[i];
            if ((tSprite._visible || tSprite.isAloneObject) && tSprite.drawImageNum > 0) {
                tSprite.updatePos();
            }
        }
    }
    drawTileTexture(gridSprite, tileX, tileY) {
        if (tileY >= 0 && tileY < this._map.numRowsTile && tileX >= 0 && tileX < this._map.numColumnsTile) {
            var tIndex = tileY * this._map.numColumnsTile + tileX;
            var tMapData = this._mapData;
            if (tMapData != null && tIndex < tMapData.length) {
                if (tMapData[tIndex] != 0) {
                    var tTileTexSet = this._map.getTexture(tMapData[tIndex]);
                    if (tTileTexSet) {
                        var tX = 0;
                        var tY = 0;
                        var tTexture = tTileTexSet.texture;
                        switch (this._map.orientation) {
                            case IMap.TiledMap.ORIENTATION_STAGGERED:
                                tX = tileX * this._map.tileWidth % this._map.gridWidth + (tileY & 1) * this._tileWidthHalf;
                                tY = tileY * this._tileHeightHalf % this._map.gridHeight;
                                break;
                            case IMap.TiledMap.ORIENTATION_ORTHOGONAL:
                                tX = tileX * this._map.tileWidth % this._map.gridWidth;
                                tY = tileY * this._map.tileHeight % this._map.gridHeight;
                                break;
                            case IMap.TiledMap.ORIENTATION_ISOMETRIC:
                                tX = (this._mapWidthHalf + (tileX - tileY) * this._tileWidthHalf) % this._map.gridWidth;
                                tY = ((tileX + tileY) * this._tileHeightHalf) % this._map.gridHeight;
                                break;
                            case IMap.TiledMap.ORIENTATION_HEXAGONAL:
                                var tTileHeight = this._map.tileHeight * 2 / 3;
                                tX = (tileX * this._map.tileWidth + tileY % 2 * this._tileWidthHalf) % this._map.gridWidth;
                                tY = (tileY * tTileHeight) % this._map.gridHeight;
                                break;
                        }
                        if (tTileTexSet.isAnimation) {
                            var tAnimationSprite = new TileAniSprite();
                            tAnimationSprite.x = tX;
                            tAnimationSprite.y = tY;
                            tAnimationSprite.setTileTextureSet(tIndex.toString(), tTileTexSet);
                            gridSprite.addAniSprite(tAnimationSprite);
                            gridSprite.addChild(tAnimationSprite);
                            gridSprite.isHaveAnimation = true;
                        }
                        else {
                            gridSprite.graphics.drawImage(tTileTexSet.texture, tX + tTileTexSet.offX, tY + tTileTexSet.offY);
                        }
                        return true;
                    }
                }
            }
        }
        return false;
    }
    clearAll() {
        this._map = null;
        this._mapData = null;
        this._tileWidthHalf = 0;
        this._tileHeightHalf = 0;
        this._mapWidthHalf = 0;
        this._mapHeightHalf = 0;
        this.layerName = null;
        var i = 0;
        if (this._objDic) {
            for (var p in this._objDic) {
                delete this._objDic[p];
            }
            this._objDic = null;
        }
        if (this._dataDic) {
            for (p in this._dataDic) {
                delete this._dataDic[p];
            }
            this._dataDic = null;
        }
        var tGridSprite;
        for (i = 0; i < this._gridSpriteArray.length; i++) {
            tGridSprite = this._gridSpriteArray[i];
            tGridSprite.clearAll();
        }
        this._properties = null;
        this._tempMapPos = null;
        this.tarLayer = null;
    }
}
