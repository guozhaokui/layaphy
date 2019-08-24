export declare class WebGLContext {
    static mainContext: WebGLRenderingContext;
    static useProgram(gl: WebGLRenderingContext, program: any): boolean;
    static setDepthTest(gl: WebGLRenderingContext, value: boolean): void;
    static setDepthMask(gl: WebGLRenderingContext, value: boolean): void;
    static setDepthFunc(gl: WebGLRenderingContext, value: number): void;
    static setBlend(gl: WebGLRenderingContext, value: boolean): void;
    static setBlendFunc(gl: WebGLRenderingContext, sFactor: number, dFactor: number): void;
    static setBlendFuncSeperate(gl: WebGLRenderingContext, srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void;
    static setCullFace(gl: WebGLRenderingContext, value: boolean): void;
    static setFrontFace(gl: WebGLRenderingContext, value: number): void;
    static activeTexture(gl: WebGLRenderingContext, textureID: number): void;
    static bindTexture(gl: WebGLRenderingContext, target: any, texture: any): void;
    static __init_native(): void;
    static useProgramForNative(gl: WebGLRenderingContext, program: any): boolean;
    static setDepthTestForNative(gl: WebGLRenderingContext, value: boolean): void;
    static setDepthMaskForNative(gl: WebGLRenderingContext, value: boolean): void;
    static setDepthFuncForNative(gl: WebGLRenderingContext, value: number): void;
    static setBlendForNative(gl: WebGLRenderingContext, value: boolean): void;
    static setBlendFuncForNative(gl: WebGLRenderingContext, sFactor: number, dFactor: number): void;
    static setCullFaceForNative(gl: WebGLRenderingContext, value: boolean): void;
    static setFrontFaceForNative(gl: WebGLRenderingContext, value: number): void;
    static activeTextureForNative(gl: WebGLRenderingContext, textureID: number): void;
    static bindTextureForNative(gl: WebGLRenderingContext, target: any, texture: any): void;
    static bindVertexArrayForNative(gl: WebGLContext, vertexArray: any): void;
}
