import { Rectangle } from "../../maths/Rectangle";
export declare class HTMLHitRect {
    rec: Rectangle;
    href: string;
    constructor();
    reset(): HTMLHitRect;
    recover(): void;
    static create(): HTMLHitRect;
}
