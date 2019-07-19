import { Node } from "./Node";
import { Graphics } from "./Graphics";
import { Stage } from "./Stage";
import { SpriteStyle } from "./css/SpriteStyle";
import { EventDispatcher } from "../events/EventDispatcher";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Context } from "../resource/Context";
import { HTMLCanvas } from "../resource/HTMLCanvas";
import { Texture } from "../resource/Texture";
import { Handler } from "../utils/Handler";
import { Texture2D } from "../resource/Texture2D";
export declare class Sprite extends Node {
    _width: number;
    _height: number;
    protected _tfChanged: boolean;
    protected _repaint: number;
    private _texture;
    mouseThrough: boolean;
    autoSize: boolean;
    hitTestPrior: boolean;
    destroy(destroyChild?: boolean): void;
    constructor();
    updateZOrder(): void;
    customRenderEnable: boolean;
    cacheAs: string;
    private _checkCanvasEnable;
    staticCache: boolean;
    reCache(): void;
    getRepaint(): number;
    x: number;
    y: number;
    width: number;
    set_width(value: number): void;
    get_width(): number;
    height: number;
    set_height(value: number): void;
    get_height(): number;
    readonly displayWidth: number;
    readonly displayHeight: number;
    setSelfBounds(bound: Rectangle): void;
    getBounds(): Rectangle;
    getSelfBounds(): Rectangle;
    getGraphicBounds(realSize?: boolean): Rectangle;
    getStyle(): SpriteStyle;
    setStyle(value: SpriteStyle): void;
    scaleX: number;
    scaleY: number;
    set_scaleX(value: number): void;
    get_scaleX(): number;
    set_scaleY(value: number): void;
    get_scaleY(): number;
    rotation: number;
    skewX: number;
    skewY: number;
    protected _adjustTransform(): Matrix;
    transform: Matrix;
    get_transform(): Matrix;
    set_transform(value: Matrix): void;
    pivotX: number;
    pivotY: number;
    alpha: number;
    visible: boolean;
    get_visible(): boolean;
    set_visible(value: boolean): void;
    blendMode: string;
    graphics: Graphics;
    scrollRect: Rectangle;
    pos(x: number, y: number, speedMode?: boolean): Sprite;
    pivot(x: number, y: number): Sprite;
    size(width: number, height: number): Sprite;
    scale(scaleX: number, scaleY: number, speedMode?: boolean): Sprite;
    skew(skewX: number, skewY: number): Sprite;
    render(ctx: Context, x: number, y: number): void;
    drawToCanvas(canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number): HTMLCanvas;
    drawToTexture(canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number): Texture;
    drawToTexture3D(offx: number, offy: number, tex: Texture2D): void;
    static drawToCanvas: Function;
    static drawToTexture: Function;
    customRender(context: Context, x: number, y: number): void;
    filters: any[];
    localToGlobal(point: Point, createNewPoint?: boolean, globalNode?: Sprite): Point;
    globalToLocal(point: Point, createNewPoint?: boolean, globalNode?: Sprite): Point;
    toParentPoint(point: Point): Point;
    fromParentPoint(point: Point): Point;
    fromStagePoint(point: Point): Point;
    on(type: string, caller: any, listener: Function, args?: any[]): EventDispatcher;
    once(type: string, caller: any, listener: Function, args?: any[]): EventDispatcher;
    protected _onDisplay(v?: boolean): void;
    protected _setParent(value: Node): void;
    loadImage(url: string, complete?: Handler): Sprite;
    static fromImage(url: string): Sprite;
    repaint(type?: number): void;
    protected _childChanged(child?: Node): void;
    parentRepaint(type?: number): void;
    readonly stage: Stage;
    hitArea: any;
    mask: Sprite;
    mouseEnabled: boolean;
    startDrag(area?: Rectangle, hasInertia?: boolean, elasticDistance?: number, elasticBackTime?: number, data?: any, disableMouseEvent?: boolean, ratio?: number): void;
    stopDrag(): void;
    hitTestPoint(x: number, y: number): boolean;
    getMousePoint(): Point;
    readonly globalScaleX: number;
    readonly globalRotation: number;
    readonly globalScaleY: number;
    readonly mouseX: number;
    readonly mouseY: number;
    zOrder: number;
    texture: Texture;
    viewport: Rectangle;
    captureMouseEvent(exclusive: boolean): void;
    releaseMouseEvent(): void;
    drawCallOptimize: boolean;
}