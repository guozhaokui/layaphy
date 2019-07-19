import { PhyWorld } from "../phyWorld";
import { PhyBody } from "../PhyBody";

export class Narrowphase{
    constructor(world:PhyWorld){

    }


    getContacts(p1:PhyBody[], p2:PhyBody[], world:PhyWorld, result:any[], oldcontects:any[], frictionResult:any, frictionPool){
        for(let k=0, N=p1.length; k!==N; k++){
            let bi = p1[k],
                bj = p2[k];
            
            //TODO 根据bi和bj查表获得物理材质 world.getContactMtl(bi.mtl,bj.mtl)
            
        }
    }
}