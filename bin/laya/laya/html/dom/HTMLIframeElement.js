import { HTMLDivElement } from "./HTMLDivElement";
import { Loader } from "../../net/Loader";
import { URL } from "../../net/URL";
import { Event } from "../../events/Event";
export class HTMLIframeElement extends HTMLDivElement {
    constructor() {
        super();
        this._element._getCSSStyle().valign = "middle";
    }
    set href(url) {
        url = this._element.formatURL(url);
        var l = new Loader();
        l.once(Event.COMPLETE, null, function (data) {
            var pre = this._element.URI;
            this._element.URI = new URL(url);
            this.innerHTML = data;
            !pre || (this._element.URI = pre);
        });
        l.load(url, Loader.TEXT);
    }
}
