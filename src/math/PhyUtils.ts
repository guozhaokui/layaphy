import { BoundBox } from "../../laya/laya/d3/math/BoundBox";

export function AABBOverlaps(A:BoundBox, B:BoundBox){
    if( A.min.x>B.max.x || A.max.x<B.min.x || 
        A.min.y>B.max.y || A.max.y<B.min.y ||
        A.min.z>B.max.z || A.max.z<B.min.z)
    return false;
    return true;
}