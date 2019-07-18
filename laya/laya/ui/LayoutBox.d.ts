import { Box } from "./Box";
import { Node } from "../display/Node";
export declare class LayoutBox extends Box {
    protected _space: number;
    protected _align: string;
    protected _itemChanged: boolean;
    addChild(child: Node): Node;
    private onResize;
    addChildAt(child: Node, index: number): Node;
    removeChildAt(index: number): Node;
    refresh(): void;
    protected changeItems(): void;
    space: number;
    align: string;
    protected sortItem(items: any[]): void;
    protected _setItemChanged(): void;
}
