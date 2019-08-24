import { Pool } from "../../utils/Pool";
export class TranslateCmd {
    static create(tx, ty) {
        var cmd = Pool.getItemByClass("TranslateCmd", TranslateCmd);
        cmd.tx = tx;
        cmd.ty = ty;
        return cmd;
    }
    recover() {
        Pool.recover("TranslateCmd", this);
    }
    run(context, gx, gy) {
        context.translate(this.tx, this.ty);
    }
    get cmdID() {
        return TranslateCmd.ID;
    }
}
TranslateCmd.ID = "Translate";
