import { CommandEncoder } from "./CommandEncoder";
export class LayaGL {
    createCommandEncoder(reserveSize = 128, adjustSize = 64, isSyncToRenderThread = false) {
        return new CommandEncoder(this, reserveSize, adjustSize, isSyncToRenderThread);
    }
    beginCommandEncoding(commandEncoder) {
    }
    endCommandEncoding() {
    }
    static getFrameCount() {
        return 0;
    }
    static syncBufferToRenderThread(value, index = 0) {
    }
    static createArrayBufferRef(arrayBuffer, type, syncRender) {
    }
    static createArrayBufferRefs(arrayBuffer, type, syncRender, refType) {
    }
    matrix4x4Multiply(m1, m2, out) {
    }
    evaluateClipDatasRealTime(nodes, playCurTime, realTimeCurrentFrameIndexs, addtive) {
    }
}
LayaGL.EXECUTE_JS_THREAD_BUFFER = 0;
LayaGL.EXECUTE_RENDER_THREAD_BUFFER = 1;
LayaGL.EXECUTE_COPY_TO_RENDER = 2;
LayaGL.EXECUTE_COPY_TO_RENDER3D = 3;
LayaGL.ARRAY_BUFFER_TYPE_DATA = 0;
LayaGL.ARRAY_BUFFER_TYPE_CMD = 1;
LayaGL.ARRAY_BUFFER_REF_REFERENCE = 0;
LayaGL.ARRAY_BUFFER_REF_COPY = 1;
LayaGL.UPLOAD_SHADER_UNIFORM_TYPE_ID = 0;
LayaGL.UPLOAD_SHADER_UNIFORM_TYPE_DATA = 1;
