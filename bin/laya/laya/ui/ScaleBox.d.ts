import { Box } from "./Box";
export declare class ScaleBox extends Box {
    private _oldW;
    private _oldH;
    onEnable(): void;
    onDisable(): void;
    private onResize;
    width: number;
    height: number;
}
