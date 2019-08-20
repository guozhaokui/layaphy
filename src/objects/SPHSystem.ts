import Vec3 from '../math/Vec3.js';
import Body from './Body.js';

/**
 * Smoothed-particle hydrodynamics system
 * 光滑粒子流体系统
 */
export default class SPHSystem {
    particles: Body[] = [];

    /**
     * Density of the system (kg/m3).
     */
    density = 1;

    /**
     * Distance below which two particles are considered to be neighbors.
     * It should be adjusted so there are about 15-20 neighbor particles within this radius.
     * 光滑长度，所在范围是一个粒子的基本单元
     */
    smoothingRadius = 1;

    speedOfSound = 1;

    /**
     * Viscosity of the system.
     * 粘度
     */
    viscosity = 0.01;

    eps = 0.000001;

    // Stuff Computed per particle
    pressures:number[] = [];
    densities:number[] = [];
    neighbors:Body[][] = [];

    constructor() {
    }

    /**
     * Add a particle to the system.
     */
    add(particle: Body) {
        this.particles.push(particle);
        if (this.neighbors.length < this.particles.length) {
            this.neighbors.push([]);
        }
    }

    /**
     * Remove a particle from the system.
     */
    remove(particle: Body) {
        const idx = this.particles.indexOf(particle);
        if (idx !== -1) {
            this.particles.splice(idx, 1);
            if (this.neighbors.length > this.particles.length) {
                this.neighbors.pop();
            }
        }
    }

    /**
     * Get neighbors within smoothing volume, save in the array neighbors
     */
    getNeighbors(particle: Body, neighbors: Body[]) {
        const N = this.particles.length;
        const id = particle.id;
        const R2 = this.smoothingRadius * this.smoothingRadius;
        const dist = SPHSystem_getNeighbors_dist;
        for (let i = 0; i !== N; i++) {
            const p = this.particles[i];
            p.position.vsub(particle.position, dist);
            if (id !== p.id && dist.lengthSquared() < R2) {
                neighbors.push(p);
            }
        }
    }

    update() {
        const N = this.particles.length;
        const dist = SPHSystem_update_dist;
        const cs = this.speedOfSound;
        const eps = this.eps;

        for (var i = 0; i !== N; i++) {
            const p = this.particles[i]; // Current particle
            var neighbors = this.neighbors[i];

            // Get neighbors
            neighbors.length = 0;
            this.getNeighbors(p, neighbors);
            neighbors.push(this.particles[i]); // Add current too
            var numNeighbors = neighbors.length;

            // Accumulate density for the particle
            let sum = 0.0;
            for (var j = 0; j !== numNeighbors; j++) {

                //printf("Current particle has position %f %f %f\n",objects[id].pos.x(),objects[id].pos.y(),objects[id].pos.z());
                p.position.vsub(neighbors[j].position, dist);
                const len = dist.length();

                const weight = this.w(len);
                sum += neighbors[j].mass * weight;
            }

            // Save
            this.densities[i] = sum;
            this.pressures[i] = cs * cs * (this.densities[i] - this.density);
        }

        // Add forces

        // Sum to these accelerations
        const a_pressure = SPHSystem_update_a_pressure;
        const a_visc = SPHSystem_update_a_visc;
        const gradW = SPHSystem_update_gradW;
        const r_vec = SPHSystem_update_r_vec;
        const u = SPHSystem_update_u;

        for (var i = 0; i !== N; i++) {

            const particle = this.particles[i];

            a_pressure.set(0, 0, 0);
            a_visc.set(0, 0, 0);

            // Init vars
            let Pij: number;
            let nabla: number;
            let Vij: number;

            // Sum up for all other neighbors
            var neighbors = this.neighbors[i];
            var numNeighbors = neighbors.length;

            //printf("Neighbors: ");
            for (var j = 0; j !== numNeighbors; j++) {

                const neighbor = neighbors[j];
                //printf("%d ",nj);

                // Get r once for all..
                particle.position.vsub(neighbor.position, r_vec);
                const r = r_vec.length();

                // Pressure contribution
                Pij = -neighbor.mass * (this.pressures[i] / (this.densities[i] * this.densities[i] + eps) + this.pressures[j] / (this.densities[j] * this.densities[j] + eps));
                this.gradw(r_vec, gradW);
                // Add to pressure acceleration
                gradW.scale(Pij, gradW);
                a_pressure.vadd(gradW, a_pressure);

                // Viscosity contribution
                neighbor.velocity.vsub(particle.velocity, u);
                u.scale(1.0 / (0.0001 + this.densities[i] * this.densities[j]) * this.viscosity * neighbor.mass, u);
                nabla = this.nablaw(r);
                u.scale(nabla, u);
                // Add to viscosity acceleration
                a_visc.vadd(u, a_visc);
            }

            // Calculate force
            a_visc.scale(particle.mass, a_visc);
            a_pressure.scale(particle.mass, a_pressure);

            // Add force to particles
            particle.force.vadd(a_visc, particle.force);
            particle.force.vadd(a_pressure, particle.force);
        }
    }

    // Calculate the weight using the W(r) weightfunction
    w(r: number) {
        // 315
        const h = this.smoothingRadius;
        return 315.0 / (64.0 * Math.PI * (h ** 9)) * ((h * h - r * r) ** 3);
    }

    // calculate gradient of the weight function
    gradw(rVec: Vec3, resultVec: Vec3) {
        const r = rVec.length();
        const h = this.smoothingRadius;
        rVec.scale(945.0 / (32.0 * Math.PI * (h ** 9)) * ((h * h - r * r) ** 2), resultVec);
    }

    // Calculate nabla(W)
    nablaw(r: number) {
        const h = this.smoothingRadius;
        const nabla = 945.0 / (32.0 * Math.PI * (h ** 9)) * (h * h - r * r) * (7 * r * r - 3 * h * h);
        return nabla;
    }
}

var SPHSystem_getNeighbors_dist = new Vec3();
var SPHSystem_update_dist = new Vec3(); // Relative velocity
var SPHSystem_update_a_pressure = new Vec3();
var SPHSystem_update_a_visc = new Vec3();
var SPHSystem_update_gradW = new Vec3();
var SPHSystem_update_r_vec = new Vec3();
var SPHSystem_update_u = new Vec3();
