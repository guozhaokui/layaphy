import { Context } from "../../resource/Context";
import { SubmitBase } from "./SubmitBase";
export declare class SubmitCanvas extends SubmitBase {
    canv: Context;
    static create(canvas: any, alpha: number, filters: any[]): SubmitCanvas;
    constructor();
    renderSubmit(): number;
    releaseRender(): void;
    getRenderType(): number;
    static POOL: any;
}
