import { Pool } from "../../utils/Pool";
export class AlphaCmd {
    static create(alpha) {
        var cmd = Pool.getItemByClass("AlphaCmd", AlphaCmd);
        cmd.alpha = alpha;
        return cmd;
    }
    recover() {
        Pool.recover("AlphaCmd", this);
    }
    run(context, gx, gy) {
        context.alpha(this.alpha);
    }
    get cmdID() {
        return AlphaCmd.ID;
    }
}
AlphaCmd.ID = "Alpha";
