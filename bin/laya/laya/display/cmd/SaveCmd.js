import { Pool } from "../../utils/Pool";
export class SaveCmd {
    static create() {
        var cmd = Pool.getItemByClass("SaveCmd", SaveCmd);
        return cmd;
    }
    recover() {
        Pool.recover("SaveCmd", this);
    }
    run(context, gx, gy) {
        context.save();
    }
    get cmdID() {
        return SaveCmd.ID;
    }
}
SaveCmd.ID = "Save";
