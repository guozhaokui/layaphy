import { TextInput } from "./TextInput";
import { VScrollBar } from "./VScrollBar";
import { HScrollBar } from "./HScrollBar";
import { Event } from "../events/Event";
export declare class TextArea extends TextInput {
    protected _vScrollBar: VScrollBar;
    protected _hScrollBar: HScrollBar;
    constructor(text?: string);
    private _onTextChange;
    destroy(destroyChild?: boolean): void;
    protected initialize(): void;
    width: number;
    height: number;
    vScrollBarSkin: string;
    hScrollBarSkin: string;
    protected onVBarChanged(e: Event): void;
    protected onHBarChanged(e: Event): void;
    readonly vScrollBar: VScrollBar;
    readonly hScrollBar: HScrollBar;
    readonly maxScrollY: number;
    readonly scrollY: number;
    readonly maxScrollX: number;
    readonly scrollX: number;
    private changeScroll;
    scrollTo(y: number): void;
}
