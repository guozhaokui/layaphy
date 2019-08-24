import { HTMLDivParser } from "./HTMLDivParser";
import { Sprite } from "../../display/Sprite";
import { Event } from "../../events/Event";
import { Handler } from "../../utils/Handler";
import { IHtml } from "../utils/IHtml";
import { HTMLParse } from "../utils/HTMLParse";
export class HTMLDivElement extends Sprite {
    constructor() {
        super();
        this._recList = [];
        this._repaintState = 0;
        this._element = new HTMLDivParser();
        this._element.repaintHandler = new Handler(this, this._htmlDivRepaint);
        this.mouseEnabled = true;
        this.on(Event.CLICK, this, this._onMouseClick);
    }
    destroy(destroyChild = true) {
        if (this._element)
            this._element.reset();
        this._element = null;
        this._doClears();
        super.destroy(destroyChild);
    }
    _htmlDivRepaint(recreate = false) {
        if (recreate) {
            if (this._repaintState < 2)
                this._repaintState = 2;
        }
        else {
            if (this._repaintState < 1)
                this._repaintState = 1;
        }
        if (this._repaintState > 0)
            this._setGraphicDirty();
    }
    _updateGraphicWork() {
        switch (this._repaintState) {
            case 1:
                this._updateGraphic();
                break;
            case 2:
                this._refresh();
                break;
        }
    }
    _setGraphicDirty() {
        this.callLater(this._updateGraphicWork);
    }
    _doClears() {
        if (!this._recList)
            return;
        var i, len = this._recList.length;
        var tRec;
        for (i = 0; i < len; i++) {
            tRec = this._recList[i];
            tRec.recover();
        }
        this._recList.length = 0;
    }
    _updateGraphic() {
        this._doClears();
        this.graphics.clear(true);
        this._repaintState = 0;
        this._element.drawToGraphic(this.graphics, -this._element.x, -this._element.y, this._recList);
        var bounds = this._element.getBounds();
        if (bounds)
            this.setSelfBounds(bounds);
        this.size(bounds.width, bounds.height);
    }
    get style() {
        return this._element.style;
    }
    set innerHTML(text) {
        if (this._innerHTML == text)
            return;
        this._repaintState = 1;
        this._innerHTML = text;
        this._element.innerHTML = text;
        this._setGraphicDirty();
    }
    _refresh() {
        this._repaintState = 1;
        if (this._innerHTML)
            this._element.innerHTML = this._innerHTML;
        this._setGraphicDirty();
    }
    get contextWidth() {
        return this._element.contextWidth;
    }
    get contextHeight() {
        return this._element.contextHeight;
    }
    _onMouseClick() {
        var tX = this.mouseX;
        var tY = this.mouseY;
        var i, len;
        var tHit;
        len = this._recList.length;
        for (i = 0; i < len; i++) {
            tHit = this._recList[i];
            if (tHit.rec.contains(tX, tY)) {
                this._eventLink(tHit.href);
            }
        }
    }
    _eventLink(href) {
        this.event(Event.LINK, [href]);
    }
}
IHtml.HTMLDivElement = HTMLDivElement;
IHtml.HTMLParse = HTMLParse;
