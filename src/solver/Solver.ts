import { Equation } from "../equations/Equation";
import { PhyWorld } from "../phyWorld";

export class Solver{
    equations:Equation[]=[];

    /**
     * 返回迭代次数
     * @param dt 
     * @param world 
     */
    solve(dt:number, world:PhyWorld){
        return 0;
    }
    
    addEquation(eq:Equation){
        if(eq.enabled)
            this.equations.push(eq);
    }
    
    removeEquation(eq:Equation){
        let i = this.equations.indexOf(eq);
        if(i!=-1){
            this.equations.splice(i,1);
        }
    }
    
    clear(){
        this.equations.length=0;
    }
}