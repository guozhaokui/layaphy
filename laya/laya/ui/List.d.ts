import { Box } from "./Box";
import { IRender } from "./IRender";
import { IItem } from "./IItem";
import { ScrollBar } from "./ScrollBar";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Handler } from "../utils/Handler";
export declare class List extends Box implements IRender, IItem {
    selectHandler: Handler;
    renderHandler: Handler;
    mouseHandler: Handler;
    selectEnable: boolean;
    totalPage: number;
    protected _content: Box;
    protected _scrollBar: ScrollBar;
    protected _itemRender: any;
    protected _repeatX: number;
    protected _repeatY: number;
    protected _repeatX2: number;
    protected _repeatY2: number;
    protected _spaceX: number;
    protected _spaceY: number;
    protected _cells: Box[];
    protected _array: any[];
    protected _startIndex: number;
    protected _selectedIndex: number;
    protected _page: number;
    protected _isVertical: boolean;
    protected _cellSize: number;
    protected _cellOffset: number;
    protected _isMoved: boolean;
    cacheContent: boolean;
    protected _createdLine: number;
    protected _cellChanged: boolean;
    protected _offset: Point;
    protected _usedCache: string;
    protected _elasticEnabled: boolean;
    destroy(destroyChild?: boolean): void;
    protected createChildren(): void;
    cacheAs: string;
    private onScrollStart;
    private onScrollEnd;
    readonly content: Box;
    vScrollBarSkin: string;
    private _removePreScrollBar;
    hScrollBarSkin: string;
    scrollBar: ScrollBar;
    itemRender: any;
    width: number;
    height: number;
    repeatX: number;
    repeatY: number;
    spaceX: number;
    spaceY: number;
    private _getOneCell;
    private _createItems;
    protected createItem(): Box;
    protected addCell(cell: Box): void;
    initItems(): void;
    setContentSize(width: number, height: number): void;
    protected onCellMouse(e: Event): void;
    protected changeCellState(cell: Box, visible: boolean, index: number): void;
    protected _sizeChanged(): void;
    protected onScrollBarChange(e?: Event): void;
    private posCell;
    selectedIndex: number;
    protected changeSelectStatus(): void;
    selectedItem: any;
    selection: Box;
    startIndex: number;
    protected renderItems(from?: number, to?: number): void;
    protected renderItem(cell: Box, index: number): void;
    private _bindData;
    array: any[];
    private _preLen;
    updateArray(array: any[]): void;
    page: number;
    readonly length: number;
    dataSource: any;
    readonly cells: Box[];
    elasticEnabled: boolean;
    refresh(): void;
    getItem(index: number): any;
    changeItem(index: number, source: any): void;
    setItem(index: number, source: any): void;
    addItem(souce: any): void;
    addItemAt(souce: any, index: number): void;
    deleteItem(index: number): void;
    getCell(index: number): Box;
    scrollTo(index: number): void;
    tweenTo(index: number, time?: number, complete?: Handler): void;
    protected _setCellChanged(): void;
    protected commitMeasure(): void;
}
