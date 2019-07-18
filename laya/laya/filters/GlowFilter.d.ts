import { Filter } from "./Filter";
export declare class GlowFilter extends Filter {
    private _elements;
    private _color;
    constructor(color: string, blur?: number, offX?: number, offY?: number);
    readonly type: number;
    offY: number;
    offX: number;
    getColor(): any[];
    blur: number;
    getColorNative(): Float32Array;
    getBlurInfo1Native(): Float32Array;
    getBlurInfo2Native(): Float32Array;
}
