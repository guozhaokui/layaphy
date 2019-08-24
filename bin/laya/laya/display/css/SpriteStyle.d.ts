import { Rectangle } from "../../maths/Rectangle";
import { Dragging } from "../../utils/Dragging";
export declare class SpriteStyle {
    static EMPTY: SpriteStyle;
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
    pivotX: number;
    pivotY: number;
    rotation: number;
    alpha: number;
    scrollRect: Rectangle;
    viewport: Rectangle;
    hitArea: any;
    dragging: Dragging;
    blendMode: string;
    constructor();
    reset(): SpriteStyle;
    recover(): void;
    static create(): SpriteStyle;
}
