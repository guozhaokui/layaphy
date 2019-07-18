import { Event } from "./Event";
import { Browser } from "../utils/Browser";
import { Pool } from "../utils/Pool";
import { ILaya } from "../../ILaya";
export class TouchManager {
    constructor() {
        this.preOvers = [];
        this.preDowns = [];
        this.preRightDowns = [];
        this.enable = true;
        this._event = new Event();
        this._lastClickTime = 0;
    }
    _clearTempArrs() {
        TouchManager._oldArr.length = 0;
        TouchManager._newArr.length = 0;
        TouchManager._tEleArr.length = 0;
    }
    getTouchFromArr(touchID, arr) {
        var i, len;
        len = arr.length;
        var tTouchO;
        for (i = 0; i < len; i++) {
            tTouchO = arr[i];
            if (tTouchO.id == touchID) {
                return tTouchO;
            }
        }
        return null;
    }
    removeTouchFromArr(touchID, arr) {
        var i;
        for (i = arr.length - 1; i >= 0; i--) {
            if (arr[i].id == touchID) {
                arr.splice(i, 1);
            }
        }
    }
    createTouchO(ele, touchID) {
        var rst;
        rst = Pool.getItem("TouchData") || {};
        rst.id = touchID;
        rst.tar = ele;
        return rst;
    }
    onMouseDown(ele, touchID, isLeft = false) {
        if (!this.enable)
            return;
        var preO;
        var tO;
        var arrs;
        preO = this.getTouchFromArr(touchID, this.preOvers);
        arrs = this.getEles(ele, null, TouchManager._tEleArr);
        if (!preO) {
            tO = this.createTouchO(ele, touchID);
            this.preOvers.push(tO);
        }
        else {
            preO.tar = ele;
        }
        if (Browser.onMobile)
            this.sendEvents(arrs, Event.MOUSE_OVER);
        var preDowns;
        preDowns = isLeft ? this.preDowns : this.preRightDowns;
        preO = this.getTouchFromArr(touchID, preDowns);
        if (!preO) {
            tO = this.createTouchO(ele, touchID);
            preDowns.push(tO);
        }
        else {
            preO.tar = ele;
        }
        this.sendEvents(arrs, isLeft ? Event.MOUSE_DOWN : Event.RIGHT_MOUSE_DOWN);
        this._clearTempArrs();
    }
    sendEvents(eles, type) {
        var i, len;
        len = eles.length;
        this._event._stoped = false;
        var _target;
        _target = eles[0];
        for (i = 0; i < len; i++) {
            var tE = eles[i];
            if (tE.destroyed)
                return;
            tE.event(type, this._event.setTo(type, tE, _target));
            if (this._event._stoped)
                break;
        }
    }
    getEles(start, end = null, rst = null) {
        if (!rst) {
            rst = [];
        }
        else {
            rst.length = 0;
        }
        while (start && start != end) {
            rst.push(start);
            start = start.parent;
        }
        return rst;
    }
    checkMouseOutAndOverOfMove(eleNew, elePre, touchID = 0) {
        if (elePre == eleNew)
            return;
        var tar;
        var arrs;
        var i, len;
        if (elePre.contains(eleNew)) {
            arrs = this.getEles(eleNew, elePre, TouchManager._tEleArr);
            this.sendEvents(arrs, Event.MOUSE_OVER);
        }
        else if (eleNew.contains(elePre)) {
            arrs = this.getEles(elePre, eleNew, TouchManager._tEleArr);
            this.sendEvents(arrs, Event.MOUSE_OUT);
        }
        else {
            arrs = TouchManager._tEleArr;
            arrs.length = 0;
            var oldArr;
            oldArr = this.getEles(elePre, null, TouchManager._oldArr);
            var newArr;
            newArr = this.getEles(eleNew, null, TouchManager._newArr);
            len = oldArr.length;
            var tIndex;
            for (i = 0; i < len; i++) {
                tar = oldArr[i];
                tIndex = newArr.indexOf(tar);
                if (tIndex >= 0) {
                    newArr.splice(tIndex, newArr.length - tIndex);
                    break;
                }
                else {
                    arrs.push(tar);
                }
            }
            if (arrs.length > 0) {
                this.sendEvents(arrs, Event.MOUSE_OUT);
            }
            if (newArr.length > 0) {
                this.sendEvents(newArr, Event.MOUSE_OVER);
            }
        }
    }
    onMouseMove(ele, touchID) {
        if (!this.enable)
            return;
        var preO;
        preO = this.getTouchFromArr(touchID, this.preOvers);
        var arrs;
        var tO;
        if (!preO) {
            arrs = this.getEles(ele, null, TouchManager._tEleArr);
            this.sendEvents(arrs, Event.MOUSE_OVER);
            this.preOvers.push(this.createTouchO(ele, touchID));
        }
        else {
            this.checkMouseOutAndOverOfMove(ele, preO.tar);
            preO.tar = ele;
            arrs = this.getEles(ele, null, TouchManager._tEleArr);
        }
        this.sendEvents(arrs, Event.MOUSE_MOVE);
        this._clearTempArrs();
    }
    getLastOvers() {
        TouchManager._tEleArr.length = 0;
        if (this.preOvers.length > 0 && this.preOvers[0].tar) {
            return this.getEles(this.preOvers[0].tar, null, TouchManager._tEleArr);
        }
        TouchManager._tEleArr.push(ILaya.stage);
        return TouchManager._tEleArr;
    }
    stageMouseOut() {
        var lastOvers;
        lastOvers = this.getLastOvers();
        this.preOvers.length = 0;
        this.sendEvents(lastOvers, Event.MOUSE_OUT);
    }
    onMouseUp(ele, touchID, isLeft = false) {
        if (!this.enable)
            return;
        var preO;
        var tO;
        var arrs;
        var oldArr;
        var i, len;
        var tar;
        var sendArr;
        var onMobile = Browser.onMobile;
        arrs = this.getEles(ele, null, TouchManager._tEleArr);
        this.sendEvents(arrs, isLeft ? Event.MOUSE_UP : Event.RIGHT_MOUSE_UP);
        var preDowns;
        preDowns = isLeft ? this.preDowns : this.preRightDowns;
        preO = this.getTouchFromArr(touchID, preDowns);
        if (!preO) {
        }
        else {
            var isDouble;
            var now = Browser.now();
            isDouble = now - this._lastClickTime < 300;
            this._lastClickTime = now;
            if (ele == preO.tar) {
                sendArr = arrs;
            }
            else {
                oldArr = this.getEles(preO.tar, null, TouchManager._oldArr);
                sendArr = TouchManager._newArr;
                sendArr.length = 0;
                len = oldArr.length;
                for (i = 0; i < len; i++) {
                    tar = oldArr[i];
                    if (arrs.indexOf(tar) >= 0) {
                        sendArr.push(tar);
                    }
                }
            }
            if (sendArr.length > 0) {
                this.sendEvents(sendArr, isLeft ? Event.CLICK : Event.RIGHT_CLICK);
            }
            if (isLeft && isDouble) {
                this.sendEvents(sendArr, Event.DOUBLE_CLICK);
            }
            this.removeTouchFromArr(touchID, preDowns);
            preO.tar = null;
            Pool.recover("TouchData", preO);
        }
        preO = this.getTouchFromArr(touchID, this.preOvers);
        if (!preO) {
        }
        else {
            if (onMobile) {
                sendArr = this.getEles(preO.tar, null, sendArr);
                if (sendArr && sendArr.length > 0) {
                    this.sendEvents(sendArr, Event.MOUSE_OUT);
                }
                this.removeTouchFromArr(touchID, this.preOvers);
                preO.tar = null;
                Pool.recover("TouchData", preO);
            }
        }
        this._clearTempArrs();
    }
}
TouchManager.I = new TouchManager();
TouchManager._oldArr = [];
TouchManager._newArr = [];
TouchManager._tEleArr = [];
