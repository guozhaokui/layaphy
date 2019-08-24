import { WebGL } from "../webgl/WebGL";
export class RunDriver {
}
RunDriver.createShaderCondition = function (conditionScript) {
    var fn = "(function() {return " + conditionScript + ";})";
    return window.Laya._runScript(fn);
};
RunDriver.changeWebGLSize = function (w, h) {
    WebGL.onStageResize(w, h);
};
