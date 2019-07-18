import { UIComponent } from "./UIComponent";
import { IBox } from "./IBox";
export declare class Box extends UIComponent implements IBox {
    private _bgColor;
    dataSource: any;
    bgColor: string;
    private _onResize;
}
