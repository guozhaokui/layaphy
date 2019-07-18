import { Widget } from "./Widget";
import { Scene } from "../display/Scene";
export declare class View extends Scene {
    static uiMap: any;
    protected _widget: Widget;
    protected _dataSource: any;
    protected _anchorX: number;
    protected _anchorY: number;
    static __init__(): void;
    constructor();
    static regComponent(key: string, compClass: new () => any): void;
    static regUI(url: string, json: any): void;
    destroy(destroyChild?: boolean): void;
    changeData(key: string): void;
    top: number;
    bottom: number;
    left: number;
    right: number;
    centerX: number;
    centerY: number;
    anchorX: number;
    anchorY: number;
    protected _sizeChanged(): void;
    private _getWidget;
    protected loadUI(path: string): void;
    dataSource: any;
}
