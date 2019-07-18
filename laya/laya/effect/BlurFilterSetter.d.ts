import { FilterSetterBase } from "././FilterSetterBase";
export declare class BlurFilterSetter extends FilterSetterBase {
    private _strength;
    constructor();
    protected buildFilter(): void;
    strength: number;
}
