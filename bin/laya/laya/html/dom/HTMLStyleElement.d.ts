import { HTMLElement } from "./HTMLElement";
import { Graphics } from "../../display/Graphics";
export declare class HTMLStyleElement extends HTMLElement {
    protected _creates(): void;
    drawToGraphic(graphic: Graphics, gX: number, gY: number, recList: any[]): void;
    reset(): HTMLElement;
    innerTEXT: string;
}
