import Material from './Material.js';

/**
 * Defines what happens when two materials meet.
 * @class ContactMaterial
 * @constructor
 * @param {Material} m1
 * @param {Material} m2
 * @param {object} [options]
 * @param {Number} [options.friction=0.3]
 * @param {Number} [options.restitution=0.3]
 * @param {number} [options.contactEquationStiffness=1e7]
 * @param {number} [options.contactEquationRelaxation=3]
 * @param {number} [options.frictionEquationStiffness=1e7]
 * @param {Number} [options.frictionEquationRelaxation=3]
 */
export default class ContactMaterial extends Material {
    static idCounter = 0;

    /**
     * Identifier of this material
     */
    id = ContactMaterial.idCounter++;

    /**
     * Participating materials
     * @todo  Should be .materialA and .materialB instead
     */
    materials: Material[];

    /**
     * Friction coefficient
     */
    friction: number = 0.3;

    /**
     * Restitution coefficient
     */
    restitution: number = 0.3;

    /**
     The stiffness approximately corresponds to the stiffness of a spring, which gives a force F=-k*x where x is the displacement of the spring. 
     Regularization time is corresponds to the number of time steps you need to take to stabilize the constraint (larger value => softer contact).
    */    

    /**
     * Stiffness of the produced contact equations
     */
    contactEquationStiffness=1e7;   // SPOOK: ε = .. k

    /**
     * Relaxation time of the produced contact equations
     */
    contactEquationRelaxation=3;    // SPOOK : d

    /**
     * Stiffness of the produced friction equations
     */
    frictionEquationStiffness: number = 1e7;

    /**
     * Relaxation time of the produced friction equations
     */
    frictionEquationRelaxation: number =3;

    constructor(m1: Material, m2: Material, friction:number, restitution:number) {
        super('contactMaterial', friction, restitution);
        this.materials = [m1, m2];
    }
}

