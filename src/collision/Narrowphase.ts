import { PhyWorld } from "../phyWorld";
import { PhyBody, BODYTYPE } from "../PhyBody";
import { Vector3 } from "../../laya/laya/d3/math/Vector3";
import { Quaternion } from "../../laya/laya/d3/math/Quaternion";
import { PhyShape } from "../shapes/Shape";
import { PhySphere } from "../shapes/Sphere";

export class Narrowphase{
    static tmpVec1 = new Vector3();
    static tmpVec2 = new Vector3();
    static tmpQuat1 = new Quaternion();
    static tmpQuat2 = new Quaternion();    

    contactPointPool:any[];     // contact对象池

    constructor(world:PhyWorld){

    }


    getContacts(p1:PhyBody[], p2:PhyBody[], world:PhyWorld, result:any[], oldcontects:any[], frictionResult:any, frictionPool){
        var qi = Narrowphase.tmpQuat1;
        var qj = Narrowphase.tmpQuat2;
        var xi = Narrowphase.tmpVec1;
        var xj = Narrowphase.tmpVec2;        

        for(let k=0, N=p1.length; k!==N; k++){
            let bi = p1[k],
                bj = p2[k];
            
            //TODO 根据bi和bj查表获得物理材质 world.getContactMtl(bi.mtl,bj.mtl)

            let justtest = (
                ( (bi.type&BODYTYPE.KINEMATIC)&&(bj.type&BODYTYPE.STATIC)) ||
                ( (bi.type&BODYTYPE.STATIC)&&(bj.type&BODYTYPE.KINEMATIC))||
                ((bi.type&BODYTYPE.KINEMATIC)&&(bj.type&BODYTYPE.KINEMATIC))
            );

            
            for(let i=0;i<bi.shapes.length; i++){
                let si = bi.shapes[i];

                for( let j=0; j<bj.shapes.length; j++){
                    let sj = bj.shapes[j];
                }
            }
        }
    }

    createContactEquation(bi:PhyBody, bj:PhyBody, si:PhyShape, sj:PhyShape, overrideShapeA:PhyShape, overrideShapeB:PhyShape){

    }

    planeBox(si:PhySphere,sj:PhySphere,xi:Vector3,xj:Vector3,qi:Quaternion,qj:Quaternion,bi:PhyBody,bj:PhyBody,rsi:PhyShape,rsj:PhyShape,justTest:boolean){
        
    }    

    /**
     * 两个球体的碰撞
     * @param si 
     * @param sj 
     * @param xi 
     * @param xj 
     * @param qi 
     * @param qj 
     * @param bi 
     * @param bj 
     * @param rsi 
     * @param rsj 
     * @param justTest 
     */
    sphereSphere(si:PhySphere,sj:PhySphere,xi:Vector3,xj:Vector3,qi:Quaternion,qj:Quaternion,bi:PhyBody,bj:PhyBody,rsi:PhyShape,rsj:PhyShape,justTest:boolean){

        if(justTest){
            // 只判断是否碰撞
            return Vector3.scalarLengthSquared(xi) < Math.pow(si.radius + sj.radius, 2);
        }

        // We will have only one contact in this case
        var r = this.createContactEquation(bi,bj,si,sj,rsi,rsj);

        // Contact normal
        xj.vsub(xi, r.ni);
        r.ni.normalize();

        // Contact point locations
        r.ri.copy(r.ni);
        r.rj.copy(r.ni);
        r.ri.mult(si.radius, r.ri);
        r.rj.mult(-sj.radius, r.rj);

        r.ri.vadd(xi, r.ri);
        r.ri.vsub(bi.position, r.ri);

        r.rj.vadd(xj, r.rj);
        r.rj.vsub(bj.position, r.rj);

        this.result.push(r);

        this.createFrictionEquationsFromContact(r, this.frictionResult);
    }

    planeConvex(planeShape:PhyShape, convexShape:PhyShape, xi:Vector3, xj:Vector3, planeQuat:Quaternion, convexQuat:Quaternion, bi:PhyBody, bj:PhyBody){
        let worldVertex = new Vector3(),
            worldNormal = new Vector3();
        worldNormal.setValue(0,0,1);
        // 用四元数旋转planenormal

    }

}