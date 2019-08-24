import { IItem } from "./IItem";
import { Node } from "../display/Node";
import { Box } from "./Box";
import { Handler } from "../utils/Handler";
export declare class ViewStack extends Box implements IItem {
    protected _items: any[];
    protected _setIndexHandler: Handler;
    protected _selectedIndex: number;
    setItems(views: any[]): void;
    initItems(): void;
    selectedIndex: number;
    protected setSelect(index: number, selected: boolean): void;
    selection: Node;
    setIndexHandler: Handler;
    protected setIndex(index: number): void;
    readonly items: any[];
    dataSource: any;
}
