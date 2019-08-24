import { IClone } from "../core/IClone";
export declare class Color implements IClone {
    static RED: Color;
    static GREEN: Color;
    static BLUE: Color;
    static CYAN: Color;
    static YELLOW: Color;
    static MAGENTA: Color;
    static GRAY: Color;
    static WHITE: Color;
    static BLACK: Color;
    static gammaToLinearSpace(value: number): number;
    static linearToGammaSpace(value: number): number;
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r?: number, g?: number, b?: number, a?: number);
    toLinear(out: Color): void;
    toGamma(out: Color): void;
    cloneTo(destObject: any): void;
    clone(): any;
    forNativeElement(): void;
}
