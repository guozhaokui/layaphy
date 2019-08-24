import { IFilter } from "./IFilter";
export declare class Filter implements IFilter {
    static BLUR: number;
    static COLOR: number;
    static GLOW: number;
    constructor();
    readonly type: number;
    static _filter: Function;
}
