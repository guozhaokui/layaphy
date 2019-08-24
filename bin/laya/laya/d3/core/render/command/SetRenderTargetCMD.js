import { Command } from "./Command";
export class SetRenderTargetCMD extends Command {
    constructor() {
        super(...arguments);
        this._renderTexture = null;
    }
    static create(renderTexture) {
        var cmd;
        cmd = SetRenderTargetCMD._pool.length > 0 ? SetRenderTargetCMD._pool.pop() : new SetRenderTargetCMD();
        cmd._renderTexture = renderTexture;
        return cmd;
    }
    run() {
        this._renderTexture._start();
    }
    recover() {
        SetRenderTargetCMD._pool.push(this);
        this._renderTexture = null;
    }
}
SetRenderTargetCMD._pool = [];
