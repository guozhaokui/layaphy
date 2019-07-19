import { Vector3 } from "../../laya/laya/d3/math/Vector3";

/**
 * 空间和旋转6个自由度
 */
export class JacobianElement{
    spatial=new Vector3();
    rotational = new Vector3();

    multiplyElement(ele:JacobianElement){
        return Vector3.dot(this.spatial, ele.spatial)+Vector3.dot(this.rotational,ele.rotational);
    }

    multiplyVectors(spatial:Vector3, rotational:Vector3){
        return Vector3.dot(this.spatial,spatial)+Vector3.dot(this.rotational,rotational);
    }
}