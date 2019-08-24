import { HTMLElement } from "../dom/HTMLElement";
export declare class Layout {
    private static DIV_ELEMENT_PADDING;
    private static _will;
    static later(element: HTMLElement): void;
    static layout(element: HTMLElement): any[];
    static _multiLineLayout(element: HTMLElement): any[];
}
