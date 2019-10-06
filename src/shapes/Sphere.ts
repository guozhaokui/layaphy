import Quaternion from '../math/Quaternion.js';
import Vec3 from '../math/Vec3.js';
import Shape, { SHAPETYPE, HitPointInfo } from './Shape.js';
import { Voxel } from './Voxel.js';

var box_to_sphere = new Vec3();
var hitbox_tmpVec1 = new Vec3();
var boxInvQ = new Quaternion();
var ptdist = new Vec3();
var qtoax_x = new Vec3();
var qtoax_y = new Vec3();
var qtoax_z = new Vec3();
/**
 * Spherical shape
 * @class Sphere
 * @constructor
 * @extends Shape
 * @param {Number} radius The radius of the sphere, a non-negative number.
 * @author schteppe / http://github.com/schteppe
 */
export default class Sphere extends Shape {
	onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void { }
	radius = 1;
	constructor(radius: number) {
		super();
		this.margin = radius;
		this.type = SHAPETYPE.SPHERE;
		this.radius = radius !== undefined ? radius : 1.0;

		if (this.radius < 0) {
			throw new Error('The sphere radius cannot be negative.');
		}

		this.updateBoundingSphereRadius();
	}

	calculateLocalInertia(mass: number, target = new Vec3()) {
		const I = 2.0 * mass * this.radius * this.radius / 5.0;
		target.x = I;
		target.y = I;
		target.z = I;
		return target;
	}

	volume() {
		return 4.0 * Math.PI * this.radius / 3.0;
	}

	updateBoundingSphereRadius() {
		this.boundingSphereRadius = this.radius;
	}

	calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3) {
		const r = this.radius;
		min.x = pos.x - r;
		max.x = pos.x + r;
		min.y = pos.y - r;
		max.y = pos.y + r;
		min.z = pos.z - r;
		max.z = pos.z + r;
	}

	/**
	 * 
	 * @param pos1 
	 * @param other 
	 * @param pos2 
	 * @param hitpos 	自己身上的全局碰撞点
	 * @param hitnorm 	把自己推开的方向，即对方的法线
	 * @param otherhitpos 对方的全局碰撞点
	 * @return 返回碰撞深度，<0表示没有碰撞
	 */
	static SpherehitSphere(r1: f32, pos1: Vec3, r2: f32, pos2: Vec3, hitpos: Vec3 | null, hitnorm: Vec3 | null, otherhitpos: Vec3 | null, justtest: boolean): f32 {
		let p1 = pos1;
		let p2 = pos2;
		let dx = p1.x - p2.x; // 从对方指向自己
		let dy = p1.y - p2.y;
		let dz = p1.z - p2.z;
		let r = r1 + r2;
		let rr = r * r;
		let dd = dx * dx + dy * dy + dz * dz;
		let deep: f32 = -1;
		if (rr < dd)
			return -1;

		if (justtest)
			return 1;
		if (dd < 1e-6) {//重合了
			deep = r;
			if (hitnorm) hitnorm.set(0, 1, 0);
			if (hitpos) hitpos.set(p1.x, p1.y - r1, p1.z);
			if (otherhitpos) otherhitpos.set(p2.x, p2.y + r2, p2.z);
			return deep;
		}

		let d = Math.sqrt(dd);
		deep = r - d;
		let nx = dx / d;
		let ny = dy / d;
		let nz = dz / d;
		if (hitpos) {
			hitpos.set(p1.x - nx * r1, p1.y - ny * r1, p1.z - nz * r1);
		}
		if (hitnorm) {
			hitnorm.set(nx, ny, nz);
		}
		if (otherhitpos) {
			otherhitpos.set(p2.x + nx * r2, p2.y + ny * r2, p2.z + nz * r2);
		}
		return d;
	}

	/**
	 * sphere和box的碰撞检测
	 * @param myPos 
	 * @param boxHalf 
	 * @param boxPos 
	 * @param boxQuat 
	 * @param hitPos 
	 * @param hitpos1 
	 * @param hitNormal 把自己推开的方向，即对方的法线
	 * @param justtest 
	 * 
	 * TODO 可以考虑用点到面的距离来实现，可能会简单一些
	 * d:number[6]=signeddist(faces,P)
	 * 外部距离:
	 * 	+d:number[] = d 中>0的
	 * dist = ||+d||  // 最多是三个平方和的开方
	 * 内部距离：
	 * 	最大的一个，或者abs后最小的一个
	 */
	static hitBox(myPos: Vec3, R: number, boxHalf: Vec3, boxPos: Vec3, boxQuat: Quaternion, hitPos: Vec3, hitpos1: Vec3, hitNormal: Vec3, justtest: boolean): f32 {
		// 转到盒子空间
		myPos.vsub(boxPos, box_to_sphere);
		let invQbox = boxInvQ;
		boxQuat.conjugate(invQbox);// 求逆
		invQbox.vmult(box_to_sphere, box_to_sphere);//把圆心转到box空间
		//判断球心在哪个区间
		let half = boxHalf
		let wx = half.x;
		let wy = half.y;
		let wz = half.z;
		let x = box_to_sphere.x;
		let y = box_to_sphere.y;
		let z = box_to_sphere.z;
		let nearpt = hitbox_tmpVec1;
		let setpt = false;
		let deep = -1;
		//debug
		let ax = qtoax_x;
		let ay = qtoax_y;
		let az = qtoax_z;
		boxQuat.vmultAxis(ax, ay, az);	//TODO 可以用四元数转mat3来做
		/*
		let phyr = PhyRender.inst;
		phyr.addVec1(boxPos,ax,10,0xff0000);
		phyr.addVec1(boxPos,ay,10, 0x00ff00);
		phyr.addVec1(boxPos,az,10, 0x0000ff);
		*/
		//debug
		if (x < -wx) {// x 轴左侧
			if (y < -wy) {// y轴下侧
				if (z < -wz) {
					//min点 球心到min的距离<R则碰撞
					nearpt.set(-wx, -wy, -wz);
					setpt = true;
				} else if (z >= -wz && z <= wz) {
					//-x,-y,-z -> -x,-y, z 线段 。-z到z
					nearpt.set(-wx, -wy, z);
					setpt = true;
				} else {
					// -x,-y, z点
					nearpt.set(-wx, -wy, wz);
					setpt = true;
				}
			} else if (y >= -wy && y <= wy) { // y 中间
				if (z < -wz) {
					//-x,-y,-z,   -x,y,-z 线段
					nearpt.set(-wx, y, -wz);
					setpt = true;
				} else if (z >= -wz && z <= wz) {
					// -x 面
					deep = x + R + wx;
					if (deep > 0) {
						if (justtest) return 1;
						hitNormal.set(-ax.x, -ax.y, -ax.z);
						myPos.addScaledVector(-R, hitNormal, hitPos);
						myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
						return deep;
					} else {
						return -1;
					}
				} else {
					// -x,-y,z -> -x,y,z 线段	-y -> y
					nearpt.set(-wx, y, wz);
					setpt = true;
				}
			} else {
				if (z < -wz) {
					// -x,y,-z 点
					nearpt.set(-wx, wy, -wz);
					setpt = true;
				} else if (z >= -wz && z <= wz) {
					//-x,y,-z -> -x,y,z 线段
					nearpt.set(-wx, wy, z);
					setpt = true;
				} else {
					//-x,y,z点
					nearpt.set(-wx, wy, wz);
					setpt = true;
				}
			}
		} else if (x >= -wx && x <= wx) {
			if (y < -wy) {
				if (z < -wz) {
					//-x,-y,-z   x,-y,-z 线段
					nearpt.set(x, -wy, -wz);
					setpt = true;
				} else if (z >= -wz && z <= wz) {
					//-y面
					deep = y + R + wy;
					if (deep > 0) {
						//碰撞
						if (justtest) return 1;
						hitNormal.set(-ay.x, -ay.y, -ay.z);
						myPos.addScaledVector(-R, hitNormal, hitPos);
						myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
						return deep;
					} else {
						return -1;
					}
				} else {
					// -x,-y,z -> x,-y,z 线段
					nearpt.set(x, -wy, wz);
					setpt = true;
				}
			} else if (y >= -wy && y <= wy) {
				if (z < -wz) {
					// -z 面
					deep = z + R + wz;
					if (deep > 0) {
						if (justtest) return 1;
						hitNormal.set(-az.x, -az.y, -az.z);
						myPos.addScaledVector(-R, hitNormal, hitPos);
						myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
						return deep;
					} else {
						return -1;
					}
				} else if (z >= -wz && z <= wz) {
					// box内部
					// 取一个最接近表面的方向
					//TODO 
				} else {
					// +z 面
					deep = wz - (z - R);
					if (deep > 0) {
						if (justtest) return 1;
						hitNormal.set(az.x, az.y, az.z);
						myPos.addScaledVector(-R, hitNormal, hitPos);
						myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
						return deep;
					} else {
						return -1;
					}
				}
			} else {
				if (z < -wz) {
					//-x,y,-z -> x,y,-z 线段
					nearpt.set(x, wy, -wz);
					setpt = true;
				} else if (z >= -wz && z <= wz) {
					// +y 面
					deep = wy - (y - R);
					if (deep > 0) {
						if (justtest) return 1;
						hitNormal.set(ay.x, ay.y, ay.z);
						myPos.addScaledVector(-R, hitNormal, hitPos);
						myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
						return deep;
					} else {
						return -1;
					}
				} else {
					// -x,y,z -> x,y,z 线段
					nearpt.set(x, wy, wz);
					setpt = true;
				}
			}
		} else {
			if (y < -wy) {
				if (z < -wz) {
					//x,-y,-z 点
					setpt = true;
					nearpt.set(wx, -wy, -wz);
				} else if (z >= -wz && z <= wz) {
					//x,-y,-z -> x,-y,z 线段
					nearpt.set(wx, -wy, z);
					setpt = true;
				} else {
					// x,-y,z 点
					nearpt.set(wx, -wy, wz);
					setpt = true;
				}
			} else if (y >= -wy && y <= wy) {
				if (z < -wz) {
					//x,-y,-z  ->  x,y,-z 线段
					nearpt.set(wx, y, -wz);
					setpt = true;
				} else if (z >= -wz && z <= wz) {
					// +x 面
					deep = wx - (x - R);
					if (deep > 0) {
						if (justtest) return 1;
						hitNormal.set(ax.x, ax.y, ax.z);
						myPos.addScaledVector(-R, hitNormal, hitPos);
						myPos.addScaledVector(-(R - deep), hitNormal, hitpos1);
						return deep;
					} else {
						return -1;
					}
				} else {
					// x,-y,z  -> x,y,z 线段
					nearpt.set(wx, y, wz);
					setpt = true;
				}
			} else {
				if (z < -wz) {
					//x,y,-z 点
					nearpt.set(wx, wy, -wz);
					setpt = true;
				} else if (z >= -wz && z <= wz) {
					//x,y,-z  -> x,y,z 线段
					nearpt.set(wx, wy, z);
					setpt = true;
				} else {
					//max点
					nearpt.set(wx, wy, wz);
					setpt = true;
				}
			}
		}
		// 把nearpt转回世界空间
		if (!setpt)
			return -1;
		boxQuat.vmult(nearpt, nearpt);
		nearpt.vadd(boxPos, nearpt);
		// 计算距离和碰撞点
		myPos.vsub(nearpt, ptdist);// ptdits 指向球心
		let l2 = ptdist.lengthSquared();
		if (l2 > R * R) {
			return -1;
		}
		let l = Math.sqrt(l2);
		deep = R - l;
		let invl = 1 / l;
		ptdist.scale(invl, hitNormal);
		myPos.addScaledVector(-R, hitNormal, hitPos);
		hitpos1.copy(nearpt);
		//console.log('deep',deep)
		return deep;
	}

	hitVoxel(myPos: Vec3, voxel: Voxel, voxPos: Vec3, voxQuat: Quaternion, hitpoints: HitPointInfo[], justtest: boolean): boolean {
		// 只需与外壳
		/**
		 * 与所有的格子比较，取正的最小距离，法线是当前距离的法线
		 * 由于voxel可能是凹的，可能会有多个点
		 */
		// 把voxel转换到sphere空间
		let rPos = hitVoxelTmpVec1;
		voxPos.vsub(myPos,rPos);

		// 先用最笨的方法验证流程
		let voxdt = voxel.voxData.data;
		let gridw = voxel.voxData.gridsz;
		let r = gridw / 2;
		let min = voxel.voxData.aabbmin;    //原始包围盒
		let max = voxel.voxData.aabbmax;
		let tmpV = new Vec3();  //xyz格子坐标
		let hitpos = new Vec3();
		let hitpos1 = new Vec3();
		let hitnorm = new Vec3();
		let hit = false;

		for (let i = 0, sz = voxdt.length; i < sz; i++) {
			let dt = voxdt[i];
			// 把xyz映射到box空间
			tmpV.set(dt.x + 0.5, dt.y + 0.5, dt.z + 0.5);// 在格子的中心
			min.addScaledVector(gridw, tmpV, tmpV);// tmpV = min + (vox.xyz+0.5)*gridw
			//tmpV现在是在vox空间内的一个点
			voxQuat.vmult(tmpV,tmpV);//TODO 直接用矩阵的方向
			tmpV.vadd(voxPos,tmpV);
			//tmpV现在是box空间的点了，计算碰撞信息
			// 这里的法线是推开自己的
			let deep = Sphere.SpherehitSphere(this.radius,myPos,r,tmpV,hitpos,hitnorm,hitpos1,justtest);
			if (deep < 0)
				continue;
			if (justtest)
				return true;
			//转换回世界空间
			let hi = new HitPointInfo();
			hi.posi.copy(hitpos);
			hi.posj.copy(hitpos1);
			hi.normal.copy(hitnorm);
			hitpoints.push(hi);
			hit = true;
		}
		return hit;
	}

	hitVoxel1(myPos: Vec3, voxel: Voxel, voxPos: Vec3, voxQuat: Quaternion, hitpoints: HitPointInfo[], justtest: boolean): boolean {
		let lodnum = voxel.bitDataLod.length;
		// 根据自己的包围盒确定用那一层lod，lod主要是用来过滤空白的
		let R = this.radius;
		// 把球转换到voxel空间
		let sphInVox = hitVoxelTmpVec1;
		myPos.vsub(voxPos,sphInVox);
		// 旋转相对位置
		voxQuat.conjugate(hitvoxelInvQ);
		hitvoxelInvQ.vmult(sphInVox,sphInVox);
		// 计算球占用的范围
		let sphminx = sphInVox.x-R;
		let sphminy = sphInVox.y-R;
		let sphminz = sphInVox.z-R;
		let sphmaxx = sphInVox.x+R;
		let sphmaxy = sphInVox.y+R;
		let sphmaxz = sphInVox.z+R;

		let localbbxmin = voxel.voxData.aabbmin;
		let localbbxmax = voxel.voxData.aabbmax;
		// 采用平面的方法，不要用点的方法
		// 怎么把碰撞分散到多帧中
	}

}

var hitVoxelTmpVec1 = new Vec3();
var hitvoxelInvQ=new Quaternion();