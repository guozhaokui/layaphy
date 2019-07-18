import { FilterSetterBase } from "././FilterSetterBase";
export declare class GlowFilterSetter extends FilterSetterBase {
    private _color;
    private _blur;
    private _offX;
    private _offY;
    constructor();
    protected buildFilter(): void;
    color: string;
    blur: number;
    offX: number;
    offY: number;
}
