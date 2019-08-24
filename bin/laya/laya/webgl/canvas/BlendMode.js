import { WebGLContext } from "../WebGLContext";
export class BlendMode {
    static _init_(gl) {
        BlendMode.fns = [BlendMode.BlendNormal, BlendMode.BlendAdd, BlendMode.BlendMultiply, BlendMode.BlendScreen, BlendMode.BlendOverlay, BlendMode.BlendLight, BlendMode.BlendMask, BlendMode.BlendDestinationOut];
        BlendMode.targetFns = [BlendMode.BlendNormalTarget, BlendMode.BlendAddTarget, BlendMode.BlendMultiplyTarget, BlendMode.BlendScreenTarget, BlendMode.BlendOverlayTarget, BlendMode.BlendLightTarget, BlendMode.BlendMask, BlendMode.BlendDestinationOut];
    }
    static BlendNormal(gl) {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }
    static BlendAdd(gl) {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.DST_ALPHA);
    }
    static BlendMultiply(gl) {
        WebGLContext.setBlendFunc(gl, gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
    }
    static BlendScreen(gl) {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE);
    }
    static BlendOverlay(gl) {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_COLOR);
    }
    static BlendLight(gl) {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE);
    }
    static BlendNormalTarget(gl) {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }
    static BlendAddTarget(gl) {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.DST_ALPHA);
    }
    static BlendMultiplyTarget(gl) {
        WebGLContext.setBlendFunc(gl, gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
    }
    static BlendScreenTarget(gl) {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE);
    }
    static BlendOverlayTarget(gl) {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_COLOR);
    }
    static BlendLightTarget(gl) {
        WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE);
    }
    static BlendMask(gl) {
        WebGLContext.setBlendFunc(gl, gl.ZERO, gl.SRC_ALPHA);
    }
    static BlendDestinationOut(gl) {
        WebGLContext.setBlendFunc(gl, gl.ZERO, gl.ZERO);
    }
}
BlendMode.activeBlendFunction = null;
BlendMode.NAMES = ["normal", "add", "multiply", "screen", "overlay", "light", "mask", "destination-out"];
BlendMode.TOINT = { "normal": 0, "add": 1, "multiply": 2, "screen": 3, "overlay": 4, "light": 5, "mask": 6, "destination-out": 7, "lighter": 1 };
BlendMode.NORMAL = "normal";
BlendMode.ADD = "add";
BlendMode.MULTIPLY = "multiply";
BlendMode.SCREEN = "screen";
BlendMode.OVERLAY = "overlay";
BlendMode.LIGHT = "light";
BlendMode.MASK = "mask";
BlendMode.DESTINATIONOUT = "destination-out";
BlendMode.LIGHTER = "lighter";
BlendMode.fns = [];
BlendMode.targetFns = [];
