import { GradientColor } from "./GradientColor";
export declare class ColorOverLifetime {
    private _color;
    enbale: boolean;
    readonly color: GradientColor;
    constructor(color: GradientColor);
    cloneTo(destObject: any): void;
    clone(): any;
}
