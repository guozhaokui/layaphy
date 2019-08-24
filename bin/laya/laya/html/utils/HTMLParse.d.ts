import { HTMLDivParser } from "../dom/HTMLDivParser";
import { URL } from "../../net/URL";
export declare class HTMLParse {
    private static char255;
    private static spacePattern;
    private static char255AndOneSpacePattern;
    private static _htmlClassMapShort;
    static getInstance(type: string): any;
    static parse(ower: HTMLDivParser, xmlString: string, url: URL): void;
    private static _parseXML;
}
