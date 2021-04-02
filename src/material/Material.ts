
/**
 * @author schteppe
 */

export class Material {
    static idCounter = 0;
    id = Material.idCounter++;

	static infiniteFriction=1e6;

    name?: string;

    friction = 0.3;

	_restitution = 0;
	
	set restitution(v){
		this._restitution=v;
	}

	get restitution(){
		return this._restitution;
	}

    constructor(name?:string,friction=0.3,restitution=0) {
        this.name = name;
        this.friction = friction;
        this.restitution = restitution;
	}
	toJSON():any{
		return {
			//type:'Material',
			id:this.id,
			friction:this.friction,
			_restitution:this._restitution
		}
	}
}
