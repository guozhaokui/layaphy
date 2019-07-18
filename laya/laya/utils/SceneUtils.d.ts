export declare class SceneUtils {
    private static _funMap;
    private static _parseWatchData;
    private static _parseKeyWord;
    static __init(): void;
    static getBindFun(value: string): Function;
    static createByData(root: any, uiView: any): any;
    static createInitTool(): InitTool;
    static createComp(uiView: any, comp?: any, view?: any, dataMap?: any[], initTool?: InitTool): any;
    private static setCompValue;
    static getCompInstance(json: any): any;
}
import { Scene } from "../display/Scene";
declare class InitTool {
    private _nodeRefList;
    private _initList;
    private _loadList;
    reset(): void;
    recover(): void;
    static create(): InitTool;
    addLoadRes(url: string, type?: string): void;
    addNodeRef(node: any, prop: string, referStr: string): void;
    setNodeRef(): void;
    getReferData(referStr: string): any;
    addInitItem(item: any): void;
    doInits(): void;
    finish(): void;
    beginLoad(scene: Scene): void;
}
export {};
