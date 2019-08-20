import World from "../world/World";
import Equation from "../equations/Equation";

/**
 * Constraint equation solver base class.
 * @author schteppe / https://github.com/schteppe
 */
export default class Solver {
    //All equations to be solved
    equations:Equation[] = [];
    constructor() {
    }

    /**
     * Should be implemented in subclasses!
     */
    solve(dt:number, world:World) {
        // Should return the number of iterations done!
        return 0;
    }

    addEquation(eq:Equation) {
        if (eq.enabled) {
            this.equations.push(eq);
        }
    }

    removeEquation(eq:Equation) {
        const eqs = this.equations;
        const i = eqs.indexOf(eq);
        if (i !== -1) {
            eqs.splice(i, 1);
        }
    }

    /**
     * remove all equations
     */
    removeAllEquations() {
        this.equations.length = 0;
    }
}

