import Quaternion from '../math/Quaternion.js';
import Vec3 from '../math/Vec3.js';
import Shape, { SHAPETYPE, HitPointInfo, HitPointInfoArray } from './Shape.js';
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
		voxPos.vsub(myPos, rPos);

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
			voxQuat.vmult(tmpV, tmpV);//TODO 直接用矩阵的方向
			tmpV.vadd(voxPos, tmpV);
			//tmpV现在是box空间的点了，计算碰撞信息
			// 这里的法线是推开自己的
			let deep = Sphere.SpherehitSphere(this.radius, myPos, r, tmpV, hitpos, hitnorm, hitpos1, justtest);
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

	// 球主要检测6个方向是否正面碰撞，非正面碰撞的，每个格子元素用球模拟
	// hiti 球的碰撞点， hitj voxel的碰撞点
	hitVoxel1(myPos: Vec3, voxel: Voxel, voxPos: Vec3, voxQuat: Quaternion, hitpoints: HitPointInfoArray, justtest: boolean): boolean {
		//DEBUG
		//myPos.x = -2.7391107533614116;
		//myPos.y = 0.7659256782678245;
		//myPos.z = 1.275891510408701;
		//DEBUG

		hitpoints.length = 0;

		let R = this.radius;
		let voxmin = voxel.aabbmin;
		let voxmax = voxel.aabbmax;

		// 把球转换到voxel空间
		/** 球在vox空间的坐标 */
		let sphInVox = hitVoxelTmpVec1;
		myPos.vsub(voxPos, sphInVox);
		// 旋转相对位置
		let invQ = hitvoxelInvQ;
		voxQuat.conjugate(invQ);
		invQ.vmult(sphInVox, sphInVox);

		let gridw = voxel.gridw;
		let voxr = gridw / 2;

		// 计算球占用的范围
		let sphminx = sphInVox.x - R;
		let sphminy = sphInVox.y - R;
		let sphminz = sphInVox.z - R;
		let sphmaxx = sphInVox.x + R;
		let sphmaxy = sphInVox.y + R;
		let sphmaxz = sphInVox.z + R;

		// 球心所在格子
		let cgridx = Math.floor((sphInVox.x - voxmin.x) / gridw);
		let cgridy = Math.floor((sphInVox.y - voxmin.y) / gridw);
		let cgridz = Math.floor((sphInVox.z - voxmin.z) / gridw);

		let voxszx = voxel.dataxsize;
		let voxszy = voxel.dataysize;
		let voxszz = voxel.datazsize;

		let cgridxvalid = cgridx >= 0 && cgridx < voxszx
		let cgridyvalid = cgridy >= 0 && cgridy < voxszy;
		let cgridzvalid = cgridz >= 0 && cgridz < voxszz;

		// 球的包围盒的格子范围
		let gridminx = Math.floor((sphminx - voxmin.x) / gridw);
		if (gridminx >= voxszx) return false;
		if (gridminx < 0) gridminx = 0;

		let gridminy = Math.floor((sphminy - voxmin.y) / gridw);
		if (gridminy >= voxszy) return false;
		if (gridminy < 0) gridminy = 0;

		let gridminz = Math.floor((sphminz - voxmin.z) / gridw);
		if (gridminz >= voxszz) return false;
		if (gridminz < 0) gridminz = 0;

		let gridmaxx = Math.floor((sphmaxx - voxmin.x) / gridw);
		if (gridmaxx < 0) return false;
		if (gridmaxx >= voxszx) gridmaxx = voxszx - 1;

		let gridmaxy = Math.floor((sphmaxy - voxmin.y) / gridw);
		if (gridmaxy < 0) return false;
		if (gridmaxy >= voxszy) gridmaxy = voxszy - 1;

		let gridmaxz = Math.floor((sphmaxz - voxmin.z) / gridw);
		if (gridmaxz < 0) return false;
		if (gridmaxz >= voxszz) gridmaxz = voxszz - 1;

		let i = 0;

		// 如果球形已经进入盒子了，找一个最近面出来
		if (cgridxvalid && cgridyvalid && cgridzvalid && voxel.getVox(cgridx, cgridy, cgridz)) {
			if (justtest)
				return true;
			// 如果球心已经撞到实心的格子中了，朝着6个方向寻找最近出点
			// 如果边缘也是实心的话的处理
			// x正方向
			let mindist = voxmax.x - sphInVox.x;	// 先假设是到aabb的距离
			let mindistid = 0;
			for (i = cgridx + 1; i < voxszx; i++) {
				if (!voxel.getVox(i, cgridy, cgridz)) {
					mindist = gridw * i + voxmin.x - sphInVox.x;
					break;
				}
			}

			// x负方向
			let dist1 = sphInVox.x - voxmin.x;
			if (dist1 < mindist) {
				mindist = dist1;
				mindistid = 1;
			}
			for (i = cgridx - 1; i >= 0; i--) {
				if (!voxel.getVox(i, cgridy, cgridz)) {
					dist1 = sphInVox.x - (gridw * (i + 1) + voxmin.x);
					if (dist1 < mindist) {
						mindist = dist1;
						mindistid = 1;
					}
					break;
				}
			}

			//y+
			dist1 = voxmax.y - sphInVox.y;
			if (dist1 < mindist) {
				mindist = dist1;
				mindistid = 2;
			}
			for (i = cgridy + 1; i < voxszy; i++) {
				if (!voxel.getVox(cgridx, i, cgridz)) {
					dist1 = i * gridw + voxmin.y - sphInVox.y;
					if (dist1 < mindist) {
						mindist = dist1;
						mindistid = 2;
					}
				}
			}

			//y-
			dist1 = sphInVox.y - voxmin.y;
			if (dist1 < mindist) {
				mindist = dist1;
				mindistid = 3;
			}
			for (i = cgridy - 1; i >= 0; i--) {
				if (!voxel.getVox(cgridx, i, cgridy)) {
					dist1 = sphInVox.y - ((i + 1) * gridw + voxmin.y);
					if (dist1 < mindist) {
						mindist = dist1;
						mindistid = 3;
					}
					break;
				}
			}

			//z+
			dist1 = voxmax.z - sphInVox.z;
			if (dist1 < mindist) {
				mindist = dist1;
				mindistid = 4;
			}
			for (i = cgridz + 1; i < voxszz; i++) {
				if (!voxel.getVox(cgridx, cgridy, i)) {
					dist1 = i * gridw + voxmin.z - sphInVox.z;
					if (dist1 < mindist) {
						mindist = dist1;
						mindistid = 4;
					}
					break;
				}
			}

			//z-
			dist1 = sphInVox.z - voxmin.z;
			if (dist1 < mindist) {
				mindist = dist1;
				mindistid = 5;
			}
			for (i = cgridz - 1; i >= 0; i--) {
				if (!voxel.getVox(cgridx, cgridy, i)) {
					dist1 = sphInVox.z - ((i + 1) * gridw + voxmin.z);
					if (dist1 < mindist) {
						mindist = dist1;
						mindistid = 5;
					}
					break;
				}
			}

			let hitinfo = hitpoints.getnew();
			let posi = hitinfo.posi;
			let posj = hitinfo.posj;
			let norm = hitinfo.normal;

			switch (mindistid) {
				case 0://想从+x弹出
					posi.set(sphminx, sphInVox.y, sphInVox.z);
					posj.set(sphInVox.x + mindist, sphInVox.y, sphInVox.z)	//不能加R，碰撞点就是sphInVox+dist
					norm.set(1, 0, 0);
					break;
				case 1://想从-x弹出
					posi.set(sphmaxz, sphInVox.y, sphInVox.z);
					posj.set(sphInVox.x - mindist, sphInVox.y, sphInVox.z)
					norm.set(-1, 0, 0);
					break;
				case 2://+y
					posi.set(sphInVox.x, sphminy, sphInVox.z);
					posj.set(sphInVox.x, sphInVox.y + mindist, sphInVox.z)
					norm.set(0, 1, 0);
					break;
				case 3://-y
					posi.set(sphInVox.x, sphmaxy, sphInVox.z);
					posj.set(sphInVox.x, sphInVox.y - mindist, sphInVox.z)
					norm.set(0, -1, 0);
					break;
				case 4://+z
					posi.set(sphInVox.x, sphInVox.y, sphminz);
					posj.set(sphInVox.x, sphInVox.y, sphInVox.z + mindist)
					norm.set(0, 0, 1);
					break;
				case 5://-z
					posi.set(sphInVox.x, sphInVox.y, sphmaxz);
					posj.set(sphInVox.x, sphInVox.y, sphInVox.z - mindist)
					norm.set(0, 0, -1);
					break;
			}

		} else {
			// 如果球心在外面，先进一步缩小范围
			// 注意这时候包围盒检测已经通过了，所以不用再做包围盒相关检测
			//maxx
			// 判断x的话，必须yz都在有效范围内，否则不会相交
			if (cgridyvalid && cgridzvalid) {
				for (i = Math.max(cgridx + 1, gridminx); i <= gridmaxx; i++) {//cgridx必须 从有效点开始，但是又不能修改cgridx，因为下面要用，所以用max
					if (voxel.getVox(i, cgridy, cgridz)) {
						// 添加碰撞信息 注意这时候是voxel空间的
						let hitinfo = hitpoints.getnew();
						hitinfo.posi.set(sphmaxx, sphInVox.y, sphInVox.z);	// 球的碰撞点
						hitinfo.posj.set(gridw * i + voxmin.x, sphInVox.y, sphInVox.z);
						hitinfo.normal.set(-1, 0, 0);	// 推开球
						gridmaxx = i - 1;
						if (justtest) return true;
						break;
					}
				}
				//minx
				for (i = Math.min(cgridx - 1, gridmaxx); i >= gridminx; i--) {
					if (voxel.getVox(i, cgridy, cgridz)) {
						let hitinfo = hitpoints.getnew();
						hitinfo.posi.set(sphminx, sphInVox.y, sphInVox.z);	// 球的碰撞点
						hitinfo.posj.set(gridw * (i + 1) + voxmin.x, sphInVox.y, sphInVox.z);
						hitinfo.normal.set(1, 0, 0);
						gridminx = i + 1;
						if (justtest) return true;
						break;
					}
				}
			}

			//maxy
			if (cgridxvalid && cgridzvalid) {
				for (i = Math.max(cgridy + 1, gridminy); i <= gridmaxy; i++) {
					if (voxel.getVox(cgridx, i, cgridz)) {
						let hitinfo = hitpoints.getnew();
						hitinfo.posi.set(sphInVox.x, sphmaxy, sphInVox.z);	// 球的碰撞点
						hitinfo.posj.set(sphInVox.x, gridw * i + voxmin.y, sphInVox.z);
						hitinfo.normal.set(0, -1, 0);
						gridmaxy = i - 1;
						if (justtest) return true;
						break;
					}
				}
				//miny
				for (i = Math.min(cgridy - 1, gridmaxy); i >= gridminy; i--) {
					if (voxel.getVox(cgridx, i, cgridz)) {
						let hitinfo = hitpoints.getnew();
						hitinfo.posi.set(sphInVox.x, sphminy, sphInVox.z);	// 球的碰撞点
						hitinfo.posj.set(sphInVox.x, gridw * (i + 1) + voxmin.y, sphInVox.z);
						hitinfo.normal.set(0, 1, 0);
						gridminy = i + 1;
						if (justtest) return true;
						break;
					}
				}
			}

			if (cgridxvalid && cgridyvalid) {
				//maxz
				for (i = Math.max(cgridz + 1, gridminz); i <= gridmaxz; i++) {
					if (voxel.getVox(cgridx, cgridy, i)) {
						let hitinfo = hitpoints.getnew();
						hitinfo.posi.set(sphInVox.x, sphInVox.y, sphmaxz);	// 球的碰撞点
						hitinfo.posj.set(sphInVox.x, sphInVox.y, gridw * i + voxmin.z);
						hitinfo.normal.set(0, 0, -1);
						gridmaxz = i - 1;
						if (justtest) return true;
						break;
					}
				}

				//minz 
				for (i = Math.min(cgridz - 1, gridmaxz); i >= gridminz; i--) {
					if (voxel.getVox(cgridx, cgridy, i)) {
						let hitinfo = hitpoints.getnew();
						hitinfo.posi.set(sphInVox.x, sphInVox.y, sphminz);	// 球的碰撞点
						hitinfo.posj.set(sphInVox.x, sphInVox.y, gridw * (i + 1) + voxmin.z);
						hitinfo.normal.set(0, 0, 1);
						gridminz = i + 1;
						if (justtest) return true;
						break;
					}
				}
			}

			// 先把上面的碰撞转换到世界空间，因为下面用的是球的碰撞，都是在世界空间进行的
			let hl = hitpoints.length;
			for (i = 0; i < hl; i++) {
				let hi = hitpoints.data[i];
				voxQuat.vmult(hi.posi, hi.posi); voxPos.vadd(hi.posi, hi.posi);
				voxQuat.vmult(hi.posj, hi.posj); voxPos.vadd(hi.posj, hi.posj);
				voxQuat.vmult(hi.normal, hi.normal);
			}

			let tmpV = hitVoxelTmpVec2;
			let hitpos = hitvoxHitPos1;
			let hitpos1 = hitVoxHitPos2;
			let hitnorm = hitVoxHitNorm;
			// 把缩小后的范围中的所有的格子当做球来处理
			for (let z = gridminz; z <= gridmaxz; z++) {
				for (let y = gridminy; y <= gridmaxy; y++) {
					for (let x = gridminx; x <= gridmaxx; x++) {
						//TODO 上面检查的几个点就不用做了
						if (voxel.getVox(x, y, z)) {
							// 把xyz映射到box空间
							tmpV.set(x + 0.5, y + 0.5, z + 0.5);// 在格子的中心
							voxmin.addScaledVector(gridw, tmpV, tmpV);// tmpV = min + (vox.xyz+0.5)*gridw
							//tmpV现在是在vox空间内的一个点
							voxQuat.vmult(tmpV, tmpV);//TODO 直接用矩阵的方向
							tmpV.vadd(voxPos, tmpV);
							//tmpV现在是世界空间的点了，计算碰撞信息
							// 这里的法线是推开自己的
							let deep = Sphere.SpherehitSphere(R, myPos, voxr, tmpV, hitpos, hitnorm, hitpos1, justtest);
							if (deep < 0)
								continue;
							if (justtest)
								return true;
							let hi = hitpoints.getnew();
							hi.posi.copy(hitpos);
							hi.posj.copy(hitpos1);
							hi.normal.copy(hitnorm);
						}
					}
				}
			}
		}

		//debug
		/*
		if (hitpoints.length > 0) {
			for (let i = 0; i < hitpoints.length; i++) {
				let hi = hitpoints.data[i];
				if (hi.posi.x < voxmin.x) {
					debugger;
				}
			}
		}
		*/
		//debug

		return hitpoints.length > 0;
		//let lodnum = voxel.bitDataLod.length;
		// 根据自己的包围盒确定用那一层lod，lod主要是用来过滤空白的

		// 采用平面的方法，不要用点的方法
		// 根据球心的位置来决定遍历方向
		// 计算应该从什么lod开始
		//voxel.getLOD()
		// 怎么把碰撞分散到多帧中

		// 计算包围盒包含的voxel之中的所有的平面（补全），顶点，边
		// 某个方向如果碰撞点在平面下，则使用，多个平面取最深的
	}

	/**
	 * 与一个有孔的格子组成的平面碰撞，假设平面是法线向上，在水平面上
	 * @param mypos 
	 * @param R 
	 * @param grid 
	 * @param xszie 
	 * @param ysize 
	 * @param xoff 		格子的原点所在位置
	 * @param yoff 
	 * @param gridw 	格子的宽度
	 * @param hitpoints 
	 * @param justtest 
	 */
	static hitGridPlane(mypos: Vec3, R: number, grid: number[], xszie: int, ysize: int, xoff: number, yoff: number, gridw: number, hitpoints: HitPointInfo[], justtest: boolean): boolean {

		if (mypos.y > R)
			return false;
		let gridx = ((mypos.x - xoff) / gridw) | 0;
		let gridy = ((mypos.y - yoff) / gridw) | 0;
		if (gridx < 0) {
			if (gridy < 0) {

			} else if (gridy > ysize) {

			} else {
			}
		} else if (gridx >= xszie) {
			if (gridy < 0) {

			} else if (gridy > ysize) {

			} else {
			}
		} else {
			if (gridy < 0) {

			} else if (gridy > ysize) {

			} else {
				// 正常情况
				if (grid[gridy * xszie + gridx]) {
					//脚下有格子，最简单的情况
				} else {
					//从当前点往外扩散，遇到边则停止，不再相撞也停止
				}
			}
		}

		// 球与平面的切面的包围盒，找出最近的，计算
		// 看看球的包围盒覆盖的范围，找出离球最近的边
		// 边是共享的，因此要避免重复计算

	}

}

var hitVoxelTmpVec1 = new Vec3();
var hitVoxelTmpVec2 = new Vec3();
var hitvoxHitPos1 = new Vec3();
var hitVoxHitPos2 = new Vec3();
var hitVoxHitNorm = new Vec3();
var hitvoxelInvQ = new Quaternion();