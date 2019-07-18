import { FrameAnimation } from "../display/FrameAnimation";
import { Graphics } from "../display/Graphics";
import { Matrix } from "../maths/Matrix";
export declare class GraphicAnimation extends FrameAnimation {
    animationList: any[];
    animationDic: any;
    protected _nodeList: any[];
    protected _nodeDefaultProps: any;
    protected _gList: any[];
    protected _nodeIDAniDic: any;
    protected static _drawTextureCmd: any[];
    protected static _temParam: any[];
    private static _I;
    private static _rootMatrix;
    private _rootNode;
    protected _nodeGDic: any;
    private _parseNodeList;
    private _calGraphicData;
    private _createGraphicData;
    protected _createFrameGraphic(frame: number): any;
    protected _updateNodeGraphic(node: any, frame: number, parentTransfrom: Matrix, g: Graphics, alpha?: number): void;
    protected _updateNoChilds(tNodeG: GraphicNode, g: Graphics): void;
    protected _updateNodeGraphic2(node: any, frame: number, g: Graphics): void;
    protected _calculateKeyFrames(node: any): void;
    protected getNodeDataByID(nodeID: number): any;
    protected _getParams(obj: any, params: any[], frame: number, obj2: any): any[];
    private _getObjVar;
    protected _getNodeGraphicData(nodeID: number, frame: number, rst: GraphicNode): GraphicNode;
    private static _tempMt;
    protected _getTextureByUrl(url: string): any;
    setAniData(uiView: any, aniName?: string): void;
    parseByData(aniData: any): any;
    setUpAniData(uiView: any): void;
    protected _clear(): void;
    static parseAnimationByData(animationObject: any): any;
    static parseAnimationData(aniData: any): any;
}
declare class GraphicNode {
    skin: string;
    transform: Matrix;
    resultTransform: Matrix;
    width: number;
    height: number;
    alpha: number;
}
export {};
