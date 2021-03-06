import { Matrix } from "../../maths/Matrix";
import { ShaderDefines2D } from "../shader/d2/ShaderDefines2D";
export declare class RenderState2D {
    static _MAXSIZE: number;
    static EMPTYMAT4_ARRAY: any[];
    static TEMPMAT4_ARRAY: any[];
    static worldMatrix4: any[];
    static worldMatrix: Matrix;
    static matWVP: any;
    static worldAlpha: number;
    static worldScissorTest: boolean;
    static worldShaderDefines: ShaderDefines2D;
    static worldFilters: any[];
    static width: number;
    static height: number;
    static mat2MatArray(mat: Matrix, matArray: any[]): any[];
    static restoreTempArray(): void;
    static clear(): void;
}
