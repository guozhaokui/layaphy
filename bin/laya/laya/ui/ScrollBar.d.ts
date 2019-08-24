import { UIComponent } from "./UIComponent";
import { Button } from "./Button";
import { Slider } from "./Slider";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Handler } from "../utils/Handler";
export declare class ScrollBar extends UIComponent {
    rollRatio: number;
    changeHandler: Handler;
    scaleBar: boolean;
    autoHide: boolean;
    elasticDistance: number;
    elasticBackTime: number;
    upButton: Button;
    downButton: Button;
    slider: Slider;
    protected _showButtons: boolean;
    protected _scrollSize: number;
    protected _skin: string;
    protected _thumbPercent: number;
    protected _target: Sprite;
    protected _lastPoint: Point;
    protected _lastOffset: number;
    protected _checkElastic: boolean;
    protected _isElastic: boolean;
    protected _value: number;
    protected _hide: boolean;
    protected _clickOnly: boolean;
    protected _offsets: any[];
    protected _touchScrollEnable: boolean;
    protected _mouseWheelEnable: boolean;
    constructor(skin?: string);
    destroy(destroyChild?: boolean): void;
    protected createChildren(): void;
    protected initialize(): void;
    protected onSliderChange(): void;
    protected onButtonMouseDown(e: Event): void;
    protected startLoop(isUp: boolean): void;
    protected slide(isUp: boolean): void;
    protected onStageMouseUp(e: Event): void;
    skin: string;
    protected _skinLoaded(): void;
    protected changeScrollBar(): void;
    protected _sizeChanged(): void;
    private resetPositions;
    protected resetButtonPosition(): void;
    protected measureWidth(): number;
    protected measureHeight(): number;
    setScroll(min: number, max: number, value: number): void;
    max: number;
    min: number;
    value: number;
    isVertical: boolean;
    sizeGrid: string;
    scrollSize: number;
    dataSource: any;
    thumbPercent: number;
    target: Sprite;
    hide: boolean;
    showButtons: boolean;
    touchScrollEnable: boolean;
    mouseWheelEnable: boolean;
    protected onTargetMouseWheel(e: Event): void;
    isLockedFun: Function;
    protected onTargetMouseDown(e: Event): void;
    startDragForce(): void;
    private cancelDragOp;
    triggerDownDragLimit: Function;
    triggerUpDragLimit: Function;
    private checkTriggers;
    readonly lastOffset: number;
    startTweenMoveForce(lastOffset: number): void;
    protected loop(): void;
    protected onStageMouseUp2(e: Event): void;
    private elasticOver;
    protected tweenMove(maxDistance: number): void;
    stopScroll(): void;
    tick: number;
}