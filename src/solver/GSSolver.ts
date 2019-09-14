import { PhyRender } from './../layawrap/PhyRender';
import Solver from './Solver.js';
import World from '../world/World.js';

/**
 * Constraint equation Gauss-Seidel solver.
 * @todo The spook parameters should be specified for each constraint, not globally.
 * @author schteppe / https://github.com/schteppe
 * @see https://www8.cs.umu.se/kurser/5DV058/VT09/lectures/spooknotes.pdf
 */
export default class GSSolver extends Solver {
    /**
     * The number of solver iterations determines quality of the constraints in the world. The more iterations, the more correct simulation. More iterations need more computations though. If you have a large gravity force in your world, you will need more iterations.
     */
    iterations = 10;

    /**
     * When tolerance is reached, the system is assumed to be converged.
     */
    tolerance = 1e-7;

    _phyr:PhyRender|null=null;
    constructor() {
        super();
    }

    solve(dt:number, world:World) {
        let iter = 0;
        const maxIter = this.iterations;
        const tolSquared = this.tolerance * this.tolerance;
        const equations = this.equations;
        const Neq = equations.length;
        const bodies = world.bodies;
        const Nbodies = bodies.length;
        const h = dt;
        //let q:number;
        let B:number;
        let invC:number;
        let deltalambda:number;
        let deltalambdaTot:number;
        let GWlambda:number;
        let lambdaj:number;

        // Update solve mass
        if (Neq !== 0) {
            for (var i = 0; i !== Nbodies; i++) {
                // 准备好每个对象的invMass, invInertia, invInertiaWorld
                bodies[i].updateSolveMassProperties();
            }
        }

        // Things that does not change during iteration can be computed once
        const invCs = GSSolver_solve_invCs; //
        const Bs = GSSolver_solve_Bs;       //每个式子的Bs
        const lambda = GSSolver_solve_lambda;   //
        Bs.length = lambda.length = invCs.length = Neq;

        // 把 lamba[]清零
        // 在迭代期间 B和invCs是不变的，所以可以先计算出来
        for (var i = 0; i !== Neq; i++) {
            var c = equations[i];
            lambda[i] = 0.0;
            Bs[i] = c.computeB(h);
            invCs[i] = 1.0 / c.computeC();
        }

        if (Neq !== 0) {
            // 把每个Body的vlambda和wlambda清零
            for (var i = 0; i !== Nbodies; i++) {
                var b = bodies[i];
                b.vlambda.set(0,0,0);
                b.wlambda.set(0,0,0);
            }

            // Iterate over equations
            for (iter = 0; iter !== maxIter; iter++) {
                // Accumulate the total error for each iteration.
                deltalambdaTot = 0.0;
                for (let j = 0; j !== Neq; j++) {
                    var c = equations[j];
                    // Compute iteration
                    B = Bs[j];
                    invC = invCs[j];
                    lambdaj = lambda[j];
                    GWlambda = c.computeGWlambda();
                    deltalambda = invC * (B - GWlambda - c.eps * lambdaj);

                    // Clamp if we are not within the min/max interval
                    if (lambdaj + deltalambda < c.minForce) {
                        deltalambda = c.minForce - lambdaj;
                    } else if (lambdaj + deltalambda > c.maxForce) {
                        deltalambda = c.maxForce - lambdaj;
                    }
                    lambda[j] += deltalambda;

                    deltalambdaTot += deltalambda > 0.0 ? deltalambda : -deltalambda; // abs(deltalambda)

                    // 更新C关联的两个对象的速度 vlambda 和角速度 wlambda
                    c.addToWlambda(deltalambda);
                }

                // If the total error is small enough - stop iterate
                if (deltalambdaTot * deltalambdaTot < tolSquared) {
                    break;
                }
            }

            // Add result to velocity
            let phyr = this._phyr;
            /**
             * 已经计算出λ了，下面计算新的速度
             */
            for (var i = 0; i !== Nbodies; i++) {
                const b = bodies[i];
                const v = b.velocity;
                const w = b.angularVelocity;

                // 线速度
                b.vlambda.vmul(b.linearFactor, b.vlambda);
                v.vadd(b.vlambda, v);

                // 角速度
                b.wlambda.vmul(b.angularFactor, b.wlambda);
                w.vadd(b.wlambda, w);

                phyr && phyr.addRay(b.position.x, b.position.y, b.position.z, b.vlambda.x*10, b.vlambda.y*10, b.vlambda.z*10, 0xffff);
            }

            // Set the .multiplier property of each equation
            let l = equations.length;
            const invDt = 1 / h;
            while (l--) {
                equations[l].multiplier = lambda[l] * invDt;        // 这个好像没有用
            }
        }
        //console.log('Err=',deltalambdaTot,'iter=',iter);
        return iter;
    }
}

// Just temporary number holders that we want to reuse each solve.
var GSSolver_solve_lambda:number[] = []; 
var GSSolver_solve_invCs:number[] = [];
var GSSolver_solve_Bs:number[] = [];
