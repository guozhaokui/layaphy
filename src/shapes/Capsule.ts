import { Mat3 } from "../math/Mat3";
import { Quaternion } from "../math/Quaternion";
import { Vec3 } from "../math/Vec3";
import { MinkowskiShape } from "./MinkowskiShape";
import { Shape, SHAPETYPE } from "./Shape";
import { Sphere } from "./Sphere";
import { Voxel } from "./Voxel";
//import { quat_AABBExt_mult } from "./Box";

//let aabbExt = new Vec3();
let tmpVec1 = new Vec3();
let tmpVec2 = new Vec3();
let tmpVec3 = new Vec3();
let tmpVec4 = new Vec3();
let tmpVec5 = new Vec3();
let tmpVec6 = new Vec3();
let tmpDir1 = new Vec3();
let tmpDir2 = new Vec3();
let A1 = new Vec3();

/**
 * TODO y向上直立的capsule
 */

/**
 * 缺省主轴是z轴
 */
export class Capsule extends Shape implements MinkowskiShape{
	radius: f32;
	height: f32;		// 高度
	noTrans = false;    // 站立的胶囊，可以简单处理
	axis: Vec3 = new Vec3();          // 主轴。是一半
	voxel: Voxel | null = null;
	//mat = new Mat3();
	minkowski = this;

	constructor(r: f32 = 1, h: f32 = 1) {
		super();
		this.type = SHAPETYPE.CAPSULE;
		this.radius = r;
		this.height = h;
		this.axis.set(0, 0, h / 2);
		this.hasPreNarrowPhase = true;
		this.margin = r;				//对capsule来说margin可以大到r
	}

	/**
	 * MinkowskiShape 的接口
	 * 暂时沿着z
	 * @param dir 必须是规格化的
	 * @param sup 
	 */
	getSupportVertex(dir: Vec3, sup: Vec3): Vec3 {
		if(dir.z>0){//现在假设z轴向上
			sup.set(0,0,this.height/2);
		}else{
			sup.set(0,0,-this.height/2);
		}
		sup.addScaledVector(this.radius,dir,sup);// 线段 + 球
		return sup;
	}	
	getSupportVertexWithoutMargin(dir: Vec3, sup: Vec3): Vec3 {
		if(dir.z>0){//现在假设z轴向上
			sup.set(0,0,this.height/2);
		}else{
			sup.set(0,0,-this.height/2);
		}
		return sup;
	}	
    /**
     * 计算halfh向量变换后的值
     * @param q 
     */
	calcDir(q: Quaternion): Vec3 {
		//0,0,1 被旋转以后
		let qx = q.x, qy = q.y, qz = q.z, qw = q.w;
		let axis = this.axis;
		let h = this.height;
		let halfh: f32 = h / 2;
		//rx=(qw*qw + qx*qx - qz*qz -qy*qy)*x +( 2*qx*qy -2*qz*qw)*y + (2*qy*qw + 2*qx*qz )*z;
		axis.x = (qy * qw + qx * qz) * h;
		//ry=(2*qz*qw +2*qx*qy)*x + (qw*qw +qy*qy -qx*qx -qz*qz)*y + (-2*qx*qw +2*qy*qz)*z;
		axis.y = (-qx * qw + qy * qz) * h;
		//rz=(-2*qy*qw   +2*qx*qz)*x + (2*qx*qw  +2*qy*qz ) *y +  (qw2 +qz2 -qy2 -qx2)*z;
		axis.z = (qw * qw + qz * qz - qy * qy - qx * qx) * halfh;
		//this.mat.setRotationFromQuaternion( q );
		return axis;
	}

    /**
     * 某个方向上最远距离，相对于自己的原点。前提是已经计算了轴向了。类似于包围盒， dir*maxD 不一定在胶囊上，只有平行和垂直的时候才在表面上
     * @param pos 胶囊所在世界空间的位置
     * @param dir 世界空间的朝向
     * @param outPos 最远的地方的点。 法线就是方向
     */
	supportPoint(myPos: Vec3, dir: Vec3, outPos: Vec3): f32 {
		dir.normalize();
		return this.supportPoint_norm(myPos, dir, outPos);
	}

	supportPoint_norm(myPos: Vec3, normDir: Vec3, outPos?: Vec3): f32 {
		let axis = this.axis;
		let d = axis.dot(normDir);
		let nextend = false;
		if (d < 0) {
			d = -d;
			nextend = true;   //取另一头
		}
		let l = d + this.radius;   //自身原点到这个点的距离
		if (outPos) {
			// 需要计算最远的点在哪
			if (d < 1e-6) {//只有垂直的时候，在圆柱上，稍微一动，就转到球上了
				myPos.addScaledVector(this.radius, normDir, outPos);
			} else {
				if (nextend) {
					myPos.vsub(axis, outPos);
					outPos.addScaledVector(this.radius, normDir, outPos);
				} else {
					myPos.vadd(axis, outPos);
					outPos.addScaledVector(this.radius, normDir, outPos);
				}
			}
		}
		return l;
	}

	// 要求已经计算axis了    
	pointDistance(pos: Vec3, p: Vec3): f32 {
		let halfh = this.height / 2;
		let dx = p.x - pos.x;
		let dy = p.y - pos.y;
		//let dz = p.z - pos.z;
		//let dist:f32=-1;
		if (this.noTrans) {
			// 如果是直立的，最简单。 需要注意坐标系，这里假设z向上
			let dz = p.z - pos.z;
			if (dz > halfh) {
				// 超过上面的点
				dz -= halfh;
				return Math.sqrt(dx * dx + dy * dy + dz * dz);
			} else if (dz > -halfh) {
				// 超过下面的点
				return Math.sqrt(dx * dx + dy * dy);
			} else {
				// 低于下面的点
				dz += halfh;
				return Math.sqrt(dx * dx + dy * dy + dz * dz);
			}
		} else {

		}
		return 0;
	}

    /**
     * 到一个平面的距离，如果碰撞了，取碰撞点。
     * 碰撞法线一定是平面法线
     * @param hitPos   世界坐标的碰撞位置	.在自己身上
	 * @param hitNormal 碰撞点的法线，这个应该取对方的，意味着把碰撞点沿着这个法线推出
     * @return 进入深度， <0表示没有碰撞
     */
	hitPlane(myPos: Vec3, planePos: Vec3, planeNorm: Vec3, hitPos: Vec3): f32 {
		// 反向最远的点就是距离平面最近的点
		tmpVec1.set(-planeNorm.x, -planeNorm.y, -planeNorm.z);
		this.supportPoint_norm(myPos, tmpVec1, hitPos);
		//下面判断hitPos是否在平面下面
		let planeToHit = tmpVec2;
		hitPos.vsub(planePos, planeToHit);
		let d = planeToHit.dot(planeNorm);
		if (d > 0)    // 没有碰撞
			return -1;
		return -d;
	}

	static boxquatmat = new Mat3();
	static boxinvquat = new Quaternion();
	static boxCapLocal = new Vec3();
	static boxX = new Vec3();
	static boxY = new Vec3();
	/**
	 * capsule 与BOX碰撞。 相当于一个线段与一个膨胀了的盒子做检测
	 * @param myPos 
	 * @param boxHalf 
	 * @param boxPos 
	 * @param boxQuat 
	 * @param hitPos 
	 * @param hitpos1 
	 * @param hitNormal 把自己推开的法线，即对方身上的，朝向自己的。
	 * @param justtest 
	 */
	hitBox(myPos: Vec3, boxHalf: Vec3, boxPos: Vec3, boxQuat: Quaternion, hitPos: Vec3, hitpos1: Vec3, hitNormal: Vec3, justtest: boolean): f32 {
		let r = this.radius;
		let m33 = Capsule.boxquatmat;
		m33.setRotationFromQuaternion(boxQuat);	//TODO 以后自己保存四元数，和矩阵，就可以去掉这个了
		let axis = this.axis;
		let p0 = tmpVec1;	// 相对位置的起点
		let p1 = tmpVec2;	// 相对位置的终点

		myPos.vsub(axis, p0).vsub(boxPos, p0);// p0 = myPos-axis-boxPos
		myPos.vadd(axis, p1).vsub(boxPos, p1);// p1 = myPos+axis-boxPos

		// 把这两个点转到box空间
		let invQ = Capsule.boxinvquat;
		boxQuat.conjugate(invQ);
		invQ.vmult(p0, p0);
		invQ.vmult(p1, p1);

		let capLocal = Capsule.boxCapLocal;		// capsule的中心向量
		let w = tmpVec3;						// capsule的半长向量, 从中点指向p0
		p0.vadd(p1, capLocal).scale(0.5, capLocal);	// (p0+p1)/2
		p0.vsub(capLocal, w);

		let abs = Math.abs;
		// 用分离轴的方式来找到最浅碰撞深度
		let sepAx = tmpVec4; //分离轴
		let minD = 0; 		// 最小深度
		// 分离轴 A
		// box的半长投影       boxsize.x* |dot(boxX,A)| + boxsize.y*|dot(boxY,A)| + boxsize.z*|dot(boxZ,A)|
		// capsule的半长投影   dot(A,w)
		// 两个对象的中心的投影 dot(A,capLocal)
		// 深度 = box的半长投影 +capsule中心和box中心的投影 - 两个中心的投影

		// A = 1,0,0
		let overlap = boxHalf.x + abs(w.x) + r - abs(capLocal.x);
		if (overlap < 0) {
			return -1;	// 没有发生碰撞
		}
		minD = overlap; sepAx.set(1, 0, 0);
		// 0,1,0
		overlap = boxHalf.y + abs(w.y) + r - abs(capLocal.y);
		if (overlap < 0) {
			return -1;
		}
		if (overlap < minD) {
			minD = overlap;
			sepAx.set(0, 1, 0);
		}
		// 0,0,1
		overlap = boxHalf.z + abs(w.z) + r - abs(capLocal.z);
		if (overlap < 0) {
			return -1;
		}
		if (overlap < minD) {
			minD = overlap;
			sepAx.set(0, 0, 1);
		}

		let capDir = tmpVec6;
		capDir.set(w.x, w.y, w.z).normalize();	// 把朝向规格化一下，以便与能与上面的深度做比较
		//A = cross({1,0,0},capDir)
		//{ (y * vz) - (z * vy),
		// (z * vx) - (x * vz),
		// (x * vy) - (y * vx) }
		let A = tmpVec5;
		A.set(0, -capDir.z, capDir.y);
		// dot(A,capLocal) > |dot(w,A)| + boxsize.x* |A.x| + boxsize.y*|A.y)| + boxsize.z*|A.z|
		overlap = boxHalf.y * abs(A.y) + boxHalf.z * abs(A.z) + abs(w.y * A.y + w.z * A.z) + r - abs(capLocal.y * A.y + capLocal.z * A.z);
		if (overlap < 0) {
			return -1;
		}
		if (overlap < minD) {
			minD = overlap;
			sepAx.set(A.x, A.y, A.z);
		}
		// cross({0,1,0},capDir)
		A.set(capDir.z, 0, -capDir.x);
		overlap = boxHalf.x * abs(A.x) + boxHalf.z * abs(A.z) + abs(w.x * A.x + w.z * A.z) + r - abs(capLocal.x * A.x + capLocal.z * A.z);
		if (overlap < 0) {
			return -1;
		}
		if (overlap < minD) {
			minD = overlap;
			sepAx.set(A.x, A.y, A.z);
		}

		// cross({0,0,1},capDir)
		A.set(-capDir.y, capDir.x, 0);
		overlap = boxHalf.x * abs(A.x) + boxHalf.y * abs(A.y) + abs(w.x * A.x + w.y * A.y) + r - abs(capLocal.x * A.x + capLocal.y * A.y);
		if (overlap < 0) {
			return -1;
		}
		if (overlap < minD) {
			minD = overlap;
			sepAx.set(A.x, A.y, A.z);
		}
		// 发生碰撞了，确定碰撞点和碰撞法线
		if (justtest) {
			return 1;
		}
		return minD;
	}

	/**
	 * 
	 * @param myPos 
	 * @param cap 
	 * @param capPos 
	 * @param hitPos 
	 * @param hitPos 	另一个对象的碰撞点
	 * @param hitNormal 把自己推开的法线，即对方身上的，朝向自己的。
	 * @param justtest 
	 */
	hitCapsule(myPos: Vec3, cap: Capsule, capPos: Vec3, hitPos: Vec3, hitPos1: Vec3, hitNormal: Vec3, justtest: boolean): f32 {
		let r1 = this.radius;
		let r2 = cap.radius;
		let ax1 = this.axis;
		let ax2 = cap.axis;
		let D1 = tmpDir1; ax1.scale(2, D1);
		let D2 = tmpDir2; ax2.scale(2, D2);
		let P1 = tmpVec1; myPos.vsub(ax1, P1);	//我的起点
		let P2 = tmpVec2; capPos.vsub(ax2, P2);	//对方的起点
		let d = tmpVec3; P1.vsub(P2, d);
		// 两个线段之间的距离: | P1+t1D1 -(P2+t2D2) |
		// P1-P2 = d
		// (d + t1D1-t2D2)^2 是距离的平方，对这个取全微分
		// 2(d+t1D1-t2D2)*D1, -2(d+t1D1-t2D2)*D2 这两个都是0
		// 显然这时候与D1,D2都垂直
		// -dD1 -t1D1^2 + t2D1D2  = 0
		// -dD2 -t1D1D2 + t2D2^2  = 0
		// 先用多项式的方法求解 Ax=b
		// | -D1^2  D1D2 | |t1|    |dD1|
		// |             | |  |  = |   |
		// | -D1D2  D2^2 | |t2|    |dD2|
		//
		// 如果平行，则有个方向的d永远为0
		let A = -D1.dot(D1); let B = D1.dot(D2);
		let C = -B; let D = D2.dot(D2);
		let b1 = d.dot(D1);
		let b2 = d.dot(D2);
		let adbc = A * D - B * C;
		if (adbc > -1e-6 && adbc < 1e-6) {
			//平行
			return -1;
		}
		let dd = 1 / adbc; //只要胶囊没有退化为球，这个就没有问题
		let t1 = (D * b1 - B * b2) * dd;
		let t2 = (-C * b1 + A * b2) * dd;
		let QQ = Sphere.SpherehitSphere;
		let deep = 0;
		//根据t1,t2所在范围，一共有9种组合
		if (t1 < 0) {
			if (t2 < 0) {
				//p1和p2
				deep = QQ(r1, P1, r2, P2, hitPos, hitNormal, hitPos1, justtest);
			} else if (t2 > 1) {
				//p1和p2+D2
				let p2e = tmpVec4;
				P2.vadd(D2, p2e);
				deep = QQ(r1, P1, r2, p2e, hitPos, hitNormal, hitPos1, justtest);
			} else {
				//p1和线段2，只能取t1=0,重新计算这时候对应的t2
				t2 = b2 / D;
				let np = tmpVec4;
				P2.addScaledVector(t2, D2, np);
				deep = QQ(r1, P1, r2, np, hitPos, hitNormal, hitPos1, justtest);
			}
		} else if (t1 > 1) {
			let p1e = tmpVec4;
			P1.vadd(D1, p1e);
			if (t2 < 0) {
				//p1+d1和p2
				deep = QQ(r1, p1e, r2, P2, hitPos, hitNormal, hitPos1, justtest);
			} else if (t2 > 1) {
				//p1+d1和p2+d2
				let p2e = tmpVec5;
				P2.vadd(D2, p2e);
				deep = QQ(r1, p1e, r2, p2e, hitPos, hitNormal, hitPos1, justtest);
			} else {
				//p1+d1和线段2
				// 取t1=1, 从新计算t2
				t2 = (b2 - C) / D;
				let np = tmpVec5;
				P2.addScaledVector(t2, D2, np);
				deep = QQ(r1, p1e, r2, np, hitPos, hitNormal, hitPos1, justtest);
			}
		} else {
			let p1 = tmpVec4;
			let p2 = tmpVec5;
			P1.addScaledVector(t1, D1, p1);
			if (t2 < 0) {
				//线段1和p2
				//取t2=0,重新计算t1
				t1 = b1 / A;
				p2 = P2;
			} else if (t2 > 1) {
				//线段1和p2+d2
				//取t2=1重新计算t1
				t1 = (b1 - B) / A;
				P2.vadd(D2, p2);
			} else {
				P2.addScaledVector(t2, D2, p2);
			}
			deep = QQ(r1, p1, r2, p2, hitPos, hitNormal, hitPos1, justtest);
		}
		return deep;
	}

	/**
	 * 
	 * @param myPos 
	 * @param r2  球的半径
	 * @param sphPos 
	 * @param hitPos 	自己身上的碰撞点
	 * @param hitNormal 是球上面的法线（与自己的相反）
	 * @param justtest  只检测碰撞，不要具体结果
	 */
	hitSphere(myPos: Vec3, r2: f32, sphPos: Vec3, hitPos: Vec3, hitPos1: Vec3, hitNormal: Vec3, justtest: boolean): f32 {
		let p0 = tmpVec1;
		let dp = tmpVec2;
		let D = A1;
		let axis = this.axis;
		axis.scale(2, D);
		let r1 = this.radius;

		let r = r1 + r2;
		let rr = r * r;
		myPos.vsub(axis, p0);//p0=mypos-axis
		p0.vsub(sphPos, dp); //dp=p0-sph.pos
		// D=2*axis
		// px=p0+t*D
		// dist = (px-sph.pos)^2 = (p0-sph.pos+t*D)^2 = (dp+t*D)^2 
		// dist最小的情况 = (dp+tD)*D=0
		// 求出最靠近点的t t=-dp*D/(D*D) = -dot(dp,D)/dot(D,D) 
		let t = -dp.dot(D) / D.dot(D);
		let nearestPos = tmpVec3;
		if (t < 0) {
			// 直接计算p0到球的位置
			nearestPos = p0;
		} else if (t > 1) {
			// 直接计算p1到球的位置
			p0.vadd(D, nearestPos);
		} else {
			p0.addScaledVector(t, D, nearestPos);
		}

		let deep = Sphere.SpherehitSphere(r1, nearestPos, r2, sphPos, hitPos, hitNormal, hitPos1, justtest);
		return deep;
	}

    /**
     * 计算胶囊的转动惯量
     * 用圆柱和半球的转动惯量，结合平移轴原理组合出来
     * @param mass 
     * @param target 
     * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
     * @see https://zh.wikipedia.org/wiki/%E8%BD%89%E5%8B%95%E6%85%A3%E9%87%8F%E5%88%97%E8%A1%A8
     */
	calculateLocalInertia(mass: f32, target: Vec3) {
		let h = this.height;
		let r = this.radius;
		let r2 = r * r;
		let h2 = h * h;
		target.x = target.y = mass / 60 * (39 * r2 + 35 * h2);
		target.z = 9 / 10 * mass * r2;
	}

	updateBndSphR(): void {
		this.boundSphR = this.radius + this.height / 2;
	}

	calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void {
		let r = this.radius;
        /*
        let h =this.height;
        aabbExt.set(r,r,h/2+r);
        quat_AABBExt_mult(quat,aabbExt,min);//暂存到min中
        pos.vadd(min,max);
        pos.vsub(min,min);
        */
		// calcDir后会一直重用
		let ext = this.calcDir(quat);
		let mx = Math.abs(ext.x) + r;
		let my = Math.abs(ext.y) + r;
		let mz = Math.abs(ext.z) + r;
		min.x = pos.x - mx; min.y = pos.y - my; min.z = pos.z - mz;
		max.x = pos.x + mx; max.y = pos.y + my; max.z = pos.z + mz;

	}

	volume(): f32 {
		let r = this.radius;
		let h = this.height;
		let p = Math.PI;
		return h * p * r * r + 3 / 4 * p * r * r * r;
	}

	onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void {
		this.calcDir(quat);
	}

	voxelize(): Voxel {
		throw 'NI';
	}

}