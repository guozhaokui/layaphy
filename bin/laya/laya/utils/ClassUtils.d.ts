import { Handler } from "./Handler";
import { Sprite } from "../display/Sprite";
import { Node } from "../display/Node";
export declare class ClassUtils {
    private static DrawTypeDic;
    private static _temParam;
    private static _classMap;
    private static _tM;
    private static _alpha;
    static regClass(className: string, classDef: any): void;
    static regShortClassName(classes: any[]): void;
    static getRegClass(className: string): any;
    static getClass(className: string): any;
    static getInstance(className: string): any;
    static createByJson(json: any, node?: any, root?: Node, customHandler?: Handler, instanceHandler?: Handler): any;
    static _addGraphicsToSprite(graphicO: any, sprite: Sprite): void;
    private static _getGraphicsFromSprite;
    private static _getTransformData;
    private static _addGraphicToGraphics;
    private static _adptLineData;
    private static _adptTextureData;
    private static _adptLinesData;
    private static _getParams;
    private static _getObjVar;
}
