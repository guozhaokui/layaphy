import { HTMLElement } from "./HTMLElement";
export declare class HTMLDocument {
    static document: HTMLDocument;
    all: HTMLElement[];
    styleSheets: any;
    getElementById(id: string): HTMLElement;
    setElementById(id: string, e: HTMLElement): void;
}
