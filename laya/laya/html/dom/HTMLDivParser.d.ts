import { HTMLElement } from "./HTMLElement";
import { Rectangle } from "../../maths/Rectangle";
import { Handler } from "../../utils/Handler";
export declare class HTMLDivParser extends HTMLElement {
    contextHeight: number;
    contextWidth: number;
    private _htmlBounds;
    private _boundsRec;
    repaintHandler: Handler;
    reset(): HTMLElement;
    innerHTML: string;
    width: number;
    appendHTML(text: string): void;
    getBounds(): Rectangle;
    parentRepaint(recreate?: boolean): void;
    layout(): void;
    height: number;
}
