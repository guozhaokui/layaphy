import { Graphics } from "../../display/Graphics";
import { HTMLStyle } from "../utils/HTMLStyle";
import { URL } from "../../net/URL";
export declare enum HTMLElementType {
    BASE = 0,
    IMAGE = 1
}
export declare class HTMLElement {
    private static _EMPTYTEXT;
    eletype: HTMLElementType;
    URI: URL;
    parent: HTMLElement;
    _style: HTMLStyle;
    protected _text: any;
    protected _children: any[];
    protected _x: number;
    protected _y: number;
    protected _width: number;
    protected _height: number;
    static formatURL1(url: string, basePath?: string): string;
    constructor();
    protected _creates(): void;
    reset(): HTMLElement;
    id: string;
    repaint(recreate?: boolean): void;
    parentRepaint(recreate?: boolean): void;
    innerTEXT: string;
    protected _setParent(value: HTMLElement): void;
    appendChild(c: HTMLElement): HTMLElement;
    addChild(c: HTMLElement): HTMLElement;
    removeChild(c: HTMLElement): HTMLElement;
    static getClassName(tar: any): string;
    destroy(): void;
    destroyChildren(): void;
    readonly style: HTMLStyle;
    x: number;
    y: number;
    width: number;
    height: number;
    href: string;
    formatURL(url: string): string;
    color: string;
    className: string;
    drawToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void;
    renderSelfToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void;
    private workLines;
    private createOneLine;
}
