
/**
 * @author schteppe
 */

export class Material {
    static idCounter = 0;
    id = Material.idCounter++;

	static infiniteFriction=1e6;

    name?: string;

    /**
     * Friction for this material. If non-negative, it will be used instead of the friction given by ContactMaterials. 
	 * If there's no matching ContactMaterial, the value from .defaultContactMaterial in the World will be used.
     */
    friction = -1;

    /**
     * Restitution for this material. If non-negative, it will be used instead of the restitution given by ContactMaterials. 
	 * If there's no matching ContactMaterial, the value from .defaultContactMaterial in the World will be used.
     */
    restitution = -1;

    constructor(name?:string,friction=-1,restitution=-1) {
        this.name = name;
        this.friction = friction;
        this.restitution = restitution;
	}
}
