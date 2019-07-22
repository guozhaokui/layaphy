import { BoundBox } from "../../laya/laya/d3/math/BoundBox";
import { Vector3 } from "../../laya/laya/d3/math/Vector3";
import { Matrix3x3 } from "../../laya/laya/d3/math/Matrix3x3";

export function AABBOverlaps(A:BoundBox, B:BoundBox){
    if( A.min.x>B.max.x || A.max.x<B.min.x || 
        A.min.y>B.max.y || A.max.y<B.min.y ||
        A.min.z>B.max.z || A.max.z<B.min.z)
    return false;
    return true;
}

export function Vec3Trans(a:Vector3, mat:Matrix3x3, o:Vector3){
    var e = mat.elements;
    let x=a.x,y=a.y,z=a.z;
    o.x=x*e[0]+y*e[3]+z*e[6];
    o.y=x*e[1]+y*e[4]+z*e[7];
    o.z=x*e[2]+y*e[5]+z*e[8];
    return o;
}