import { Solver } from "./Solver";
import { PhyWorld } from "../phyWorld";

/**
 * Gauss-Seidel solver
 */
export class GSSolver extends Solver{
    iterations=10;  //迭代次数
    tolerance=1e-7; // 收敛判断 When tolerance is reached, the system is assumed to be converged.
    constructor(){
        super();
    }

    solve(dt:number,world:PhyWorld){
        let iter = 0,
            maxIter = this.iterations,
            tolSquared = this.tolerance*this.tolerance,
            equations = this.equations,
            Neq = equations.length,
            bodies = world.bodies,
            Nbodies = bodies.length,
            h = dt,
            q, B, invC, deltalambda, deltalambdaTot, GWlambda, lambdaj;

            for(iter=0; iter!=maxIter; iter++){
                
            }

            return iter;
    }
}