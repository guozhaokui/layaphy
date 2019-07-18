import { LayoutBox } from "./LayoutBox";
export declare class VBox extends LayoutBox {
    static NONE: string;
    static LEFT: string;
    static CENTER: string;
    static RIGHT: string;
    width: number;
    protected changeItems(): void;
}
