import { BlitScreenQuadCMD } from "./BlitScreenQuadCMD";
import { SetRenderTargetCMD } from "./SetRenderTargetCMD";
import { SetShaderDataTextureCMD } from "./SetShaderDataTextureCMD";
export class CommandBuffer {
    constructor() {
        this._camera = null;
        this._commands = [];
    }
    _apply() {
        for (var i = 0, n = this._commands.length; i < n; i++)
            this._commands[i].run();
    }
    setShaderDataTexture(shaderData, nameID, source) {
        this._commands.push(SetShaderDataTextureCMD.create(shaderData, nameID, source));
    }
    blitScreenQuad(source, dest, shader = null, shaderData = null, subShader = 0) {
        this._commands.push(BlitScreenQuadCMD.create(source, dest, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_QUAD));
    }
    blitScreenTriangle(source, dest, shader = null, shaderData = null, subShader = 0) {
        this._commands.push(BlitScreenQuadCMD.create(source, dest, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_TRIANGLE));
    }
    setRenderTarget(renderTexture) {
        this._commands.push(SetRenderTargetCMD.create(renderTexture));
    }
    clear() {
        for (var i = 0, n = this._commands.length; i < n; i++)
            this._commands[i].recover();
        this._commands.length = 0;
    }
}
