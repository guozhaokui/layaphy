import Equation from '../equations/Equation.js';
import Body, { BODYTYPE } from '../objects/Body.js';
import World from '../world/World.js';
import Solver from './Solver.js';

class _Node{
    body:Body|null;
    children:_Node[];
    eqs:Equation[]
    visited= false
}

/**
 * Splits the equations into islands and solves them independently. Can improve performance.
 * @param {Solver} subsolver
 */
export default class SplitSolver extends Solver {
    iterations = 10;
    tolerance = 1e-7;
    subsolver: SplitSolver;
    nodes:_Node[] = [];
    nodePool:_Node[] = [];

    constructor(subsolver: SplitSolver) {
        super();
        this.subsolver = subsolver;
        // Create needed nodes, reuse if possible
        while (this.nodePool.length < 128) {
            this.nodePool.push(this.createNode());
        }
    }

    createNode():_Node {
        return { body: null, children: [], eqs: [], visited: false };
    }

    /**
     * Solve the subsystems
     */
    solve(dt: number, world: World) {
        const nodes = SplitSolver_solve_nodes;
        const nodePool = this.nodePool;
        const bodies = world.bodies;
        const equations = this.equations;
        const Neq = equations.length;
        const Nbodies = bodies.length;
        const subsolver = this.subsolver;

        // Create needed nodes, reuse if possible
        while (nodePool.length < Nbodies) {
            nodePool.push(this.createNode());
        }
        nodes.length = Nbodies;
        for (var i = 0; i < Nbodies; i++) {
            nodes[i] = nodePool[i];
        }

        // Reset node values
        for (var i = 0; i !== Nbodies; i++) {
            const node = nodes[i];
            node.body = bodies[i];
            node.children.length = 0;
            node.eqs.length = 0;
            node.visited = false;
        }
        for (let k = 0; k !== Neq; k++) {
            const eq = equations[k];
            const i = bodies.indexOf(eq.bi);
            const j = bodies.indexOf(eq.bj);
            const ni = nodes[i];
            const nj = nodes[j];
            ni.children.push(nj);
            ni.eqs.push(eq);
            nj.children.push(ni);
            nj.eqs.push(eq);
        }

        let child;
        let n = 0;
        let eqs = SplitSolver_solve_eqs;

        subsolver.tolerance = this.tolerance;
        subsolver.iterations = this.iterations;

        const dummyWorld = SplitSolver_solve_dummyWorld as unknown as World;
        while ((child = getUnvisitedNode(nodes))) {
            eqs.length = 0;
            dummyWorld.bodies.length = 0;
            bfs(child, visitFunc, dummyWorld.bodies, eqs);

            const Neqs = eqs.length;

            eqs = eqs.sort(sortById);

            for (var i = 0; i !== Neqs; i++) {
                subsolver.addEquation(eqs[i]);
            }

            subsolver.solve(dt, dummyWorld);
            subsolver.removeAllEquations();
            n++;
        }

        return n;
    }
}

// Returns the number of subsystems
var SplitSolver_solve_nodes:_Node[] = []; // All allocated node objects
//const SplitSolver_solve_nodePool = []; // All allocated node objects
var SplitSolver_solve_eqs:Equation[] = [];   // Temp array
//const SplitSolver_solve_bds = [];   // Temp array
var SplitSolver_solve_dummyWorld = { bodies: [] }; // Temp object

const STATIC = BODYTYPE.STATIC;
function getUnvisitedNode(nodes:_Node[]):_Node|null {
    const Nnodes = nodes.length;
    for (let i = 0; i !== Nnodes; i++) {
        const node = nodes[i];
        // 不可见，并且不是static
        if (!node.visited && node.body && !(node.body.type & STATIC)) {
            return node;
        }
    }
    return null;
}

const queue:_Node[] = [];
function bfs(root:_Node, visitFunc:(node:_Node, bds:Body[], eqs:Equation[])=>void, bds:Body[], eqs:Equation[]) {
    queue.push(root);
    root.visited = true;
    visitFunc(root, bds, eqs);
    while (queue.length) {
        const node = queue.pop() as _Node;
        // Loop over unvisited child nodes
        let child;
        while ((child = getUnvisitedNode(node.children))) {
            child.visited = true;
            visitFunc(child, bds, eqs);
            queue.push(child);
        }
    }
}

function visitFunc(node:_Node, bds:Body[], eqs:Equation[]):void {
    if(!node.body)
        return;
    bds.push(node.body);
    const Neqs = node.eqs.length;
    for (let i = 0; i !== Neqs; i++) {
        const eq = node.eqs[i];
        if (!eqs.includes(eq)) {
            eqs.push(eq);
        }
    }
}

function sortById(a: Equation, b: Equation) {
    return a.id - b.id;
}