import { Command } from "./Command";
export class SetShaderDataTextureCMD extends Command {
    constructor() {
        super(...arguments);
        this._shaderData = null;
        this._nameID = 0;
        this._texture = null;
    }
    static create(shaderData, nameID, texture) {
        var cmd;
        cmd = SetShaderDataTextureCMD._pool.length > 0 ? SetShaderDataTextureCMD._pool.pop() : new SetShaderDataTextureCMD();
        cmd._shaderData = shaderData;
        cmd._nameID = nameID;
        cmd._texture = texture;
        return cmd;
    }
    run() {
        this._shaderData.setTexture(this._nameID, this._texture);
    }
    recover() {
        SetShaderDataTextureCMD._pool.push(this);
        this._shaderData = null;
        this._nameID = 0;
        this._texture = null;
    }
}
SetShaderDataTextureCMD._pool = [];
