import { UIComponent } from "./UIComponent";
import { Image } from "./Image";
import { Handler } from "../utils/Handler";
export declare class ProgressBar extends UIComponent {
    changeHandler: Handler;
    protected _bg: Image;
    protected _bar: Image;
    protected _skin: string;
    protected _value: number;
    constructor(skin?: string);
    destroy(destroyChild?: boolean): void;
    protected createChildren(): void;
    skin: string;
    protected _skinLoaded(): void;
    protected measureWidth(): number;
    protected measureHeight(): number;
    value: number;
    protected changeValue(): void;
    readonly bar: Image;
    readonly bg: Image;
    sizeGrid: string;
    width: number;
    height: number;
    dataSource: any;
}
