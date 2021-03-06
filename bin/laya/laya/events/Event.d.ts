import { Sprite } from "../display/Sprite";
export declare class Event {
    static EMPTY: Event;
    static MOUSE_DOWN: string;
    static MOUSE_UP: string;
    static CLICK: string;
    static RIGHT_MOUSE_DOWN: string;
    static RIGHT_MOUSE_UP: string;
    static RIGHT_CLICK: string;
    static MOUSE_MOVE: string;
    static MOUSE_OVER: string;
    static MOUSE_OUT: string;
    static MOUSE_WHEEL: string;
    static ROLL_OVER: string;
    static ROLL_OUT: string;
    static DOUBLE_CLICK: string;
    static CHANGE: string;
    static CHANGED: string;
    static RESIZE: string;
    static ADDED: string;
    static REMOVED: string;
    static DISPLAY: string;
    static UNDISPLAY: string;
    static ERROR: string;
    static COMPLETE: string;
    static LOADED: string;
    static READY: string;
    static PROGRESS: string;
    static INPUT: string;
    static RENDER: string;
    static OPEN: string;
    static MESSAGE: string;
    static CLOSE: string;
    static KEY_DOWN: string;
    static KEY_PRESS: string;
    static KEY_UP: string;
    static FRAME: string;
    static DRAG_START: string;
    static DRAG_MOVE: string;
    static DRAG_END: string;
    static ENTER: string;
    static SELECT: string;
    static BLUR: string;
    static FOCUS: string;
    static VISIBILITY_CHANGE: string;
    static FOCUS_CHANGE: string;
    static PLAYED: string;
    static PAUSED: string;
    static STOPPED: string;
    static START: string;
    static END: string;
    static COMPONENT_ADDED: string;
    static COMPONENT_REMOVED: string;
    static RELEASED: string;
    static LINK: string;
    static LABEL: string;
    static FULL_SCREEN_CHANGE: string;
    static DEVICE_LOST: string;
    static TRANSFORM_CHANGED: string;
    static ANIMATION_CHANGED: string;
    static TRAIL_FILTER_CHANGE: string;
    static TRIGGER_ENTER: string;
    static TRIGGER_STAY: string;
    static TRIGGER_EXIT: string;
    type: string;
    nativeEvent: any;
    target: Sprite;
    currentTarget: Sprite;
    touchId: number;
    keyCode: number;
    delta: number;
    setTo(type: string, currentTarget: Sprite, target: Sprite): Event;
    stopPropagation(): void;
    readonly touches: any[];
    readonly altKey: boolean;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly charCode: boolean;
    readonly keyLocation: number;
    readonly stageX: number;
    readonly stageY: number;
}
