import { Component } from "../components/Component";
export declare class Widget extends Component {
    static EMPTY: Widget;
    private _top;
    private _bottom;
    private _left;
    private _right;
    private _centerX;
    private _centerY;
    onReset(): void;
    protected _onEnable(): void;
    protected _onDisable(): void;
    protected _onParentResize(): void;
    resetLayoutX(): boolean;
    resetLayoutY(): boolean;
    resetLayout(): void;
    top: number;
    bottom: number;
    left: number;
    right: number;
    centerX: number;
    centerY: number;
}
