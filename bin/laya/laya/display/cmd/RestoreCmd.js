import { Pool } from "../../utils/Pool";
export class RestoreCmd {
    static create() {
        var cmd = Pool.getItemByClass("RestoreCmd", RestoreCmd);
        return cmd;
    }
    recover() {
        Pool.recover("RestoreCmd", this);
    }
    run(context, gx, gy) {
        context.restore();
    }
    get cmdID() {
        return RestoreCmd.ID;
    }
}
RestoreCmd.ID = "Restore";
