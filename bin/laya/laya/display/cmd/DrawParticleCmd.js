import { Pool } from "../../utils/Pool";
export class DrawParticleCmd {
    static create(_temp) {
        var cmd = Pool.getItemByClass("DrawParticleCmd", DrawParticleCmd);
        cmd._templ = _temp;
        return cmd;
    }
    recover() {
        this._templ = null;
        Pool.recover("DrawParticleCmd", this);
    }
    run(context, gx, gy) {
        context.drawParticle(gx, gy, this._templ);
    }
    get cmdID() {
        return DrawParticleCmd.ID;
    }
}
DrawParticleCmd.ID = "DrawParticleCmd";
