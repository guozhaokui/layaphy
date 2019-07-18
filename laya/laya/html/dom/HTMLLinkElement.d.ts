import { HTMLElement } from "./HTMLElement";
import { Graphics } from "../../display/Graphics";
export declare class HTMLLinkElement extends HTMLElement {
    static _cuttingStyle: RegExp;
    type: string;
    private _loader;
    protected _creates(): void;
    drawToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void;
    reset(): HTMLElement;
    href: string;
}
