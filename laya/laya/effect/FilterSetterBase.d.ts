import { Sprite } from "../display/Sprite";
export declare class FilterSetterBase {
    _filter: any;
    constructor();
    paramChanged(): void;
    protected buildFilter(): void;
    protected addFilter(sprite: Sprite): void;
    protected removeFilter(sprite: Sprite): void;
    private _target;
    target: any;
}
