import { PhyBody } from "../PhyBody";

export class Equation{
    static gid=0;
    id=Equation.gid++;
    bi:PhyBody;
    bj:PhyBody;
    enabled=true;
    multiplier=0;
    //SPOOK参数
    a=0;
    b=0;
    eps=0;
    constructor(bi:PhyBody, bj:PhyBody, minForce=-1e6, maxForce=1e6){
        this.bi=bi;
        this.bj=bj;

        this.setSpookParams(1e7,4,1/60);
    }
    
    setSpookParams(stiffness:number,relaxation:number,timeStep:number){
        let d = relaxation,
        k = stiffness,
        h = timeStep;
        this.a = 4.0 / (h * (1 + 4 * d));
        this.b = (4.0 * d) / (1 + 4 * d);
        this.eps = 4.0 / (h * h * k * (1 + 4 * d));
    }

    computeB(a,b,h){

    }

    computeGq(){

    }

    computeGW(){

    }

    computeGWlambda(){

    }

    computeGiMf(){

    }

    computeGiMGt(){

    }

    addToWlambda(){

    }

    compoteC(){
        
    }
}