import { Texture } from "../resource/Texture";
import { UIComponent } from "./UIComponent";
export declare class Image extends UIComponent {
    protected _skin: string;
    protected _group: string;
    constructor(skin?: string);
    destroy(destroyChild?: boolean): void;
    dispose(): void;
    protected createChildren(): void;
    skin: string;
    source: Texture;
    group: string;
    protected setSource(url: string, img?: any): void;
    protected measureWidth(): number;
    protected measureHeight(): number;
    width: number;
    height: number;
    sizeGrid: string;
    dataSource: any;
}
