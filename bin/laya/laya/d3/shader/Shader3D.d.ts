import { SubShader } from "./SubShader";
export declare class Shader3D {
    static RENDER_STATE_CULL: number;
    static RENDER_STATE_BLEND: number;
    static RENDER_STATE_BLEND_SRC: number;
    static RENDER_STATE_BLEND_DST: number;
    static RENDER_STATE_BLEND_SRC_RGB: number;
    static RENDER_STATE_BLEND_DST_RGB: number;
    static RENDER_STATE_BLEND_SRC_ALPHA: number;
    static RENDER_STATE_BLEND_DST_ALPHA: number;
    static RENDER_STATE_BLEND_CONST_COLOR: number;
    static RENDER_STATE_BLEND_EQUATION: number;
    static RENDER_STATE_BLEND_EQUATION_RGB: number;
    static RENDER_STATE_BLEND_EQUATION_ALPHA: number;
    static RENDER_STATE_DEPTH_TEST: number;
    static RENDER_STATE_DEPTH_WRITE: number;
    static PERIOD_CUSTOM: number;
    static PERIOD_MATERIAL: number;
    static PERIOD_SPRITE: number;
    static PERIOD_CAMERA: number;
    static PERIOD_SCENE: number;
    static debugMode: boolean;
    static propertyNameToID(name: string): number;
    static compileShader(name: string, subShaderIndex: number, passIndex: number, publicDefine: number, spriteDefine: number, materialDefine: number): void;
    static add(name: string, attributeMap?: any, uniformMap?: any, enableInstancing?: boolean): Shader3D;
    static find(name: string): Shader3D;
    constructor(name: string, attributeMap: any, uniformMap: any, enableInstancing: boolean);
    addSubShader(subShader: SubShader): void;
    getSubShaderAt(index: number): SubShader;
}
