import { Matrix } from "../../maths/Matrix";
import { Context } from "../../resource/Context";
export declare class TransformCmd {
    static ID: string;
    matrix: Matrix;
    pivotX: number;
    pivotY: number;
    static create(matrix: Matrix, pivotX: number, pivotY: number): TransformCmd;
    recover(): void;
    run(context: Context, gx: number, gy: number): void;
    readonly cmdID: string;
}
