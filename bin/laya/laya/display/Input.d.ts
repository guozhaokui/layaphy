import { Text } from "./Text";
export declare class Input extends Text {
    static TYPE_TEXT: string;
    static TYPE_PASSWORD: string;
    static TYPE_EMAIL: string;
    static TYPE_URL: string;
    static TYPE_NUMBER: string;
    static TYPE_RANGE: string;
    static TYPE_DATE: string;
    static TYPE_MONTH: string;
    static TYPE_WEEK: string;
    static TYPE_TIME: string;
    static TYPE_DATE_TIME: string;
    static TYPE_DATE_TIME_LOCAL: string;
    static TYPE_SEARCH: string;
    protected static input: any;
    protected static area: any;
    protected static inputElement: any;
    protected static inputContainer: any;
    protected static confirmButton: any;
    protected static promptStyleDOM: any;
    protected _focus: boolean;
    protected _multiline: boolean;
    protected _editable: boolean;
    protected _restrictPattern: any;
    protected _maxChars: number;
    private _type;
    private _prompt;
    private _promptColor;
    private _originColor;
    private _content;
    static IOS_IFRAME: boolean;
    private static inputHeight;
    static isInputting: boolean;
    constructor();
    static __init__(): void;
    private static _popupInputMethod;
    private static _createInputElement;
    private static _initInput;
    private static _processInputting;
    private static _stopEvent;
    setSelection(startIndex: number, endIndex: number): void;
    multiline: boolean;
    readonly nativeInput: any;
    private _onUnDisplay;
    private _onMouseDown;
    private static stageMatrix;
    private _syncInputTransform;
    select(): void;
    focus: boolean;
    private _setInputMethod;
    private _focusIn;
    private _setPromptColor;
    private _focusOut;
    private _onKeyDown;
    text: string;
    changeText(text: string): void;
    color: string;
    bgColor: string;
    restrict: string;
    editable: boolean;
    maxChars: number;
    prompt: string;
    promptColor: string;
    type: string;
}