import { PhyWorld } from "../phyWorld";
import { PhyBody, BODYTYPE, BODYSTATE } from "../PhyBody";
import { BoundBox } from "../../laya/laya/d3/math/BoundBox";
import { AABBOverlaps } from "../math/PhyUtils";

/**
 * 宽检测的基类
 */
export class Broadphase{

    dirty=true; // 有对象移动了

    /**
     * 获得物理世界的碰撞列表
     * @param world 
     * @param p1 
     * @param p2 
     */
    collisionPairs(world:PhyWorld,p1:any[],p2:any[]){

    }

    /**
     * 检查两个对象是否需要做宽检测
     * @param A 
     * @param b 
     */
    needBroadphaseCollision(A:PhyBody, B:PhyBody){
        // 检测组
        if( (A.collisionFilterGroup&B.collisionFilterMask)==0 ||
            (B.collisionFilterGroup&A.collisionFilterMask)==0 )
            return false;

        // 检测类型。如果两个对象都是staic或者sleeping，则忽略
        if( ( (A.type&BODYTYPE.STATIC)!=0 || A.sleepState==BODYSTATE.SLEEPING ) &&
        ( (B.type&BODYTYPE.STATIC)!=0 || B.sleepState==BODYSTATE.SLEEPING ))
            return false;

        return true;
    }

    intersectionTest(A:PhyBody, B:PhyBody, p1:any[], p2:any[]){
        this.doBoundingBoxBroadphase(A,B,p1,p2);
    }

    doBoundingBoxBroadphase(A:PhyBody, B:PhyBody, p1:any[], p2:any[]){
        if( AABBOverlaps(A.AABB,B.AABB)){
            p1.push(A);
            p2.push(B);
        }
    }        

}