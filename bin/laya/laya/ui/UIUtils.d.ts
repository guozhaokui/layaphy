import { Sprite } from "../display/Sprite";
import { IFilter } from "../filters/IFilter";
export declare class UIUtils {
    private static grayFilter;
    static escapeSequence: any;
    static fillArray(arr: any[], str: string, type?: typeof Number | typeof String): any[];
    static toColor(color: number): string;
    static gray(traget: Sprite, isGray?: boolean): void;
    static addFilter(target: Sprite, filter: IFilter): void;
    static clearFilter(target: Sprite, filterType: new () => any): void;
    private static _getReplaceStr;
    static adptString(str: string): string;
    private static _funMap;
    static getBindFun(value: string): Function;
}
