import { HTMLDivParser } from "../dom/HTMLDivParser";
import { HTMLElement } from "../dom/HTMLElement";
import { Pool } from "../../utils/Pool";
import { ClassUtils } from "../../utils/ClassUtils";
import { Utils } from "../../utils/Utils";
import { IHtml } from "./IHtml";
import { HTMLBrElement } from "../dom/HTMLBrElement";
import { HTMLStyleElement } from "../dom/HTMLStyleElement";
import { HTMLLinkElement } from "../dom/HTMLLinkElement";
export class HTMLParse {
    static getInstance(type) {
        var rst = Pool.getItem(HTMLParse._htmlClassMapShort[type]);
        if (!rst) {
            rst = ClassUtils.getInstance(type);
        }
        return rst;
    }
    static parse(ower, xmlString, url) {
        xmlString = xmlString.replace(/<br>/g, "<br/>");
        xmlString = "<root>" + xmlString + "</root>";
        xmlString = xmlString.replace(HTMLParse.spacePattern, HTMLParse.char255);
        var xml = Utils.parseXMLFromString(xmlString);
        HTMLParse._parseXML(ower, xml.childNodes[0].childNodes, url);
    }
    static _parseXML(parent, xml, url, href = null) {
        var i, n;
        if (xml.join || xml.item) {
            for (i = 0, n = xml.length; i < n; ++i) {
                HTMLParse._parseXML(parent, xml[i], url, href);
            }
        }
        else {
            var node;
            var nodeName;
            if (xml.nodeType == 3) {
                var txt;
                if (parent instanceof IHtml.HTMLDivParser) {
                    if (xml.nodeName == null) {
                        xml.nodeName = "#text";
                    }
                    nodeName = xml.nodeName.toLowerCase();
                    txt = xml.textContent.replace(/^\s+|\s+$/g, '');
                    if (txt.length > 0) {
                        node = HTMLParse.getInstance(nodeName);
                        if (node) {
                            parent.addChild(node);
                            (node.innerTEXT = txt.replace(HTMLParse.char255AndOneSpacePattern, " "));
                        }
                    }
                }
                else {
                    txt = xml.textContent.replace(/^\s+|\s+$/g, '');
                    if (txt.length > 0) {
                        (parent.innerTEXT = txt.replace(HTMLParse.char255AndOneSpacePattern, " "));
                    }
                }
                return;
            }
            else {
                nodeName = xml.nodeName.toLowerCase();
                if (nodeName == "#comment")
                    return;
                node = HTMLParse.getInstance(nodeName);
                if (node) {
                    if (nodeName == "p") {
                        parent.addChild(HTMLParse.getInstance("br"));
                        node = parent.addChild(node);
                        parent.addChild(HTMLParse.getInstance("br"));
                    }
                    else {
                        node = parent.addChild(node);
                    }
                    node.URI = url;
                    node.href = href;
                    var attributes = xml.attributes;
                    if (attributes && attributes.length > 0) {
                        for (i = 0, n = attributes.length; i < n; ++i) {
                            var attribute = attributes[i];
                            var attrName = attribute.nodeName;
                            var value = attribute.value;
                            node._setAttributes(attrName, value);
                        }
                    }
                    HTMLParse._parseXML(node, xml.childNodes, url, node.href);
                }
                else {
                    HTMLParse._parseXML(parent, xml.childNodes, url, href);
                }
            }
        }
    }
}
HTMLParse.char255 = String.fromCharCode(255);
HTMLParse.spacePattern = /&nbsp;|&#160;/g;
HTMLParse.char255AndOneSpacePattern = new RegExp(String.fromCharCode(255) + "|(\\s+)", "g");
HTMLParse._htmlClassMapShort = {
    'div': HTMLDivParser,
    'p': HTMLElement,
    'img': HTMLImageElement,
    'span': HTMLElement,
    'br': HTMLBrElement,
    'style': HTMLStyleElement,
    'font': HTMLElement,
    'a': HTMLElement,
    '#text': HTMLElement,
    'link': HTMLLinkElement
};
IHtml.HTMLParse = HTMLParse;
