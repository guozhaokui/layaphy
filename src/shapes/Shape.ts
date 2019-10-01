

import Material from '../material/Material.js';
import Quaternion from '../math/Quaternion.js';
import Vec3 from '../math/Vec3.js';
import Body from '../objects/Body.js';
import { MinkowskiShape } from './MinkowskiShape.js';

export enum SHAPETYPE{
    SPHERE= 1,
    PLANE= 2,
    BOX= 4,
    COMPOUND= 8,
    CONVEXPOLYHEDRON= 16,
    HEIGHTFIELD= 32,
    PARTICLE= 64,
    CYLINDER= 128,
    TRIMESH= 256,
    CAPSULE=512,
    VOXEL=1024,
}

function Path(target:any) {
    console.log("I am decorator.")
}

export class HitPointInfo{
    posi=new Vec3();
    posj=new Vec3();
    normal=new Vec3();
}

/**
 * Base class for shapes
 */
@Path
export default abstract class Shape {
    static idCounter = 0;
    id = Shape.idCounter++;
    type = 0;

    /**
     * The local bounding sphere radius of this shape.
     */
    boundingSphereRadius = 0;
    //aabb:BoundBox

    /**
     * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled.
     */
    collisionResponse = true;

    collisionFilterGroup = 1;

    collisionFilterMask = -1;

    material: Material|null = null;
    body: Body;

	hasPreNarrowPhase=false;    // 是否要执行 onPreNarrowpase

	minkowski:MinkowskiShape|null=null;
	margin=0.04;	// 缺省的margin，如果形状过小或者有其他特殊特点，可以在子类里面设置
    constructor(options?: { type: number, collisionResponse: boolean, collisionFilterGroup: number, collisionFilterMask: number, material: Material }) {
        if(options){
            this.type = options.type || 0;
            this.collisionResponse = options.collisionResponse ? options.collisionResponse : true;
            this.collisionFilterGroup = options.collisionFilterGroup !== undefined ? options.collisionFilterGroup : 1;
            this.collisionFilterMask = options.collisionFilterMask !== undefined ? options.collisionFilterMask : -1;
            this.material = options.material ? options.material : null;
        }
    }

    /**
     * Computes the bounding sphere radius. The result is stored in the property .boundingSphereRadius
     */
    abstract updateBoundingSphereRadius():void;

    abstract calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3):void;
    /**
     * Get the volume of this shape
     */
    abstract volume():number;

    /**
     * Calculates the inertia in the local frame for this shape.
     * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    abstract calculateLocalInertia(mass: number, target: Vec3):void;

    abstract onPreNarrowpase(stepId:i32,pos:Vec3, quat:Quaternion):void;
}


