import { Pool } from "../../utils/Pool";
export class TransformCmd {
    static create(matrix, pivotX, pivotY) {
        var cmd = Pool.getItemByClass("TransformCmd", TransformCmd);
        cmd.matrix = matrix;
        cmd.pivotX = pivotX;
        cmd.pivotY = pivotY;
        return cmd;
    }
    recover() {
        this.matrix = null;
        Pool.recover("TransformCmd", this);
    }
    run(context, gx, gy) {
        context._transform(this.matrix, this.pivotX + gx, this.pivotY + gy);
    }
    get cmdID() {
        return TransformCmd.ID;
    }
}
TransformCmd.ID = "Transform";
