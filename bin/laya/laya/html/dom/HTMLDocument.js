import { HTMLStyle } from "../utils/HTMLStyle";
export class HTMLDocument {
    constructor() {
        this.all = [];
        this.styleSheets = HTMLStyle.styleSheets;
    }
    getElementById(id) {
        return this.all[id];
    }
    setElementById(id, e) {
        this.all[id] = e;
    }
}
HTMLDocument.document = new HTMLDocument();
