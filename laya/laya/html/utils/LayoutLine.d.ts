import { ILayout } from "./ILayout";
export declare class LayoutLine {
    elements: ILayout[];
    x: number;
    y: number;
    w: number;
    h: number;
    wordStartIndex: number;
    minTextHeight: number;
    mWidth: number;
    updatePos(left: number, width: number, lineNum: number, dy: number, align: string, valign: string, lineHeight: number): void;
}
