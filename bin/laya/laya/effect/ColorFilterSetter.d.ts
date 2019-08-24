import { FilterSetterBase } from "./FilterSetterBase";
export declare class ColorFilterSetter extends FilterSetterBase {
    private _brightness;
    private _contrast;
    private _saturation;
    private _hue;
    private _red;
    private _green;
    private _blue;
    private _alpha;
    constructor();
    protected buildFilter(): void;
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    red: number;
    green: number;
    blue: number;
    private _color;
    color: string;
    alpha: number;
}
