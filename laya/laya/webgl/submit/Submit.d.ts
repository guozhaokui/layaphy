import { Context } from "../../resource/Context";
import { Value2D } from "../shader/d2/value/Value2D";
import { Mesh2D } from "../utils/Mesh2D";
import { SubmitBase } from "./SubmitBase";
export declare class Submit extends SubmitBase {
    protected static _poolSize: number;
    protected static POOL: any[];
    constructor(renderType?: number);
    renderSubmit(): number;
    releaseRender(): void;
    static create(context: Context, mesh: Mesh2D, sv: Value2D): Submit;
    static createShape(ctx: Context, mesh: Mesh2D, numEle: number, sv: Value2D): Submit;
}
