import {Body} from "../objects/Body";
import {Vec3} from "../math/Vec3";
import {Shape} from "../shapes/Shape";

class ManifoldPoint {
    // Whether this manifold point is persisting or not.
    warmStarted = false;
    //  The position of this manifold point.
    position = new Vec3();
    // 碰撞点相对于第一个shape的相对位置
    localPoint1 = new Vec3();
    // 碰撞点相对于第2个shape的相对位置
    localPoint2 = new Vec3();
    // The normal vector of this manifold point.
    normal = new Vec3();
    // The tangent vector of this manifold point.
    tangent = new Vec3();
    // The binormal vector of this manifold point.
    binormal = new Vec3();
    // 法线方向上的碰撞冲量
    normalImpulse = 0;
    // tangent方向上的碰撞冲量
    tangentImpulse = 0;
    // 副法线方向上的碰撞冲量
    binormalImpulse = 0;
    // The denominator in normal direction.
    normalDenominator = 0;
    // The denominator in tangent direction.
    tangentDenominator = 0;
    // The denominator in binormal direction.
    binormalDenominator = 0;
    // 碰撞深度
    penetration = 0;
}

/**
 * 用来跨帧记录两个对象的碰撞信息
 * 碰撞的时候添加碰撞点
 * 规则
 *  每帧只取一个碰撞点，添加进去
 *  最多保留4个碰撞点
 *      保留撞入深度最深的碰撞点
 *      根据碰撞点在AB两个物体上的距离是否仍然在对穿或者接触决定是否需要删除
 *      选取构成四边形面积最大的碰撞点
 */
export class ContactManifold {
    numPoints: i32 = 0;
    bodyA: Body;
    bodyB: Body;
    points: ManifoldPoint[] = [    // 保留4个接触点
        new ManifoldPoint(),
        new ManifoldPoint(),
        new ManifoldPoint(),
        new ManifoldPoint()
    ];

    constructor() {
    }

    //Reset the manifold.
    reset(shape1: Shape, shape2: Shape): void {
        this.bodyA = shape1.body;
        this.bodyB = shape2.body;
        this.numPoints = 0;
    }

    //  Add a point into this manifold.
    addPoint(x:f32, y:f32, z:f32, nx:f32, ny:f32, nz:f32, penetration:f32, flip:boolean) {
        let p = this.points[this.numPoints++];
        p.position.set(x, y, z);
        p.normal.set(nx, ny, nz);

        //p.localPoint1.vsub(p.position, this.bodyA.position).applyMatrix3(this.bodyA.rotation);
        //p.localPoint2.vsub(p.position, this.bodyB.position).applyMatrix3(this.bodyB.rotation);

        p.normalImpulse = 0;

        if (flip) p.normal.negate();

        p.penetration = penetration;
        p.warmStarted = false;

    }

    UpdateManifolds(){

    }

    /**
     * 删除最无效的点
     */
    RearrangeContactPoints(){
        let maxDepth:f32=1e6;
        //let deepestIndex:i32=0;
        let ptNum = this.numPoints;
        let pts = this.points;
        for(let i=0; i<ptNum; i++){
            let cp = pts[i];
            if( cp.penetration<maxDepth){
                //deepestIndex=i;
                maxDepth = cp.penetration;
            }
        }

        //let newPoint = pts[3];//4-1
        //let indexToRemove=;
        this.numPoints--;
    }
}

export class ManifoldManager{
	get(a:Body, b:Body):ContactManifold{
		throw 'ni'
	}
	
	foreach(){

	}
}