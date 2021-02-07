import {Quaternion} from '../math/Quaternion.js';
import {Vec3} from '../math/Vec3.js';
import {Shape, SHAPETYPE, HitPointInfo, HitPointInfoArray } from './Shape.js';
import { Voxel } from './Voxel.js';
import { MinkowskiShape } from './MinkowskiShape.js';

/** 从box指向球的向量，球心在box空间的本地位置（反向旋转了） */
var box_to_sphere = new Vec3();
var hitbox_tmpVec1 = new Vec3();
var boxInvQ = new Quaternion();
var ptdist = new Vec3();
var qtoax_x = new Vec3();
var qtoax_y = new Vec3();
var qtoax_z = new Vec3();

var boxFaceNorml=[new Vec3(1,0,0),  new Vec3(-1,0,0), 
	new Vec3(0,1,0),  new Vec3(0,-1,0),
	new Vec3(0,0,1),  new Vec3(0,0,-1)];
var boxFaceDist = [0,0,0,0,0,0];
var extsubpos=new Vec3();

/**
 * Spherical shape
 * @class Sphere
 * @constructor
 * @extends Shape
 * @param {Number} radius The radius of the sphere, a non-negative number.
 * @author schteppe / http://github.com/schteppe
 */
export class Sphere extends Shape implements MinkowskiShape {
	onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void { }
	radius = 1;
	oriRadius=1;	// 原始半径，用来应用缩放的
	minkowski=this;
	constructor(radius: number) {
		super();
		this.margin = radius;
		this.type = SHAPETYPE.SPHERE;
		this.radius = radius !== undefined ? radius : 1.0;
		this.oriRadius=this.radius;

		if (this.radius < 0) {
			throw new Error('The sphere radius cannot be negative.');
		}

		this.updateBndSphR();
	}

	getSupportVertex(dir: Vec3, sup: Vec3): Vec3 {
		let r = this.radius;
		sup.set(dir.x*r,dir.y*r, dir.z*r);
		return sup;
	}
	getSupportVertexWithoutMargin(dir: Vec3, sup: Vec3): Vec3 {
		sup.set(0,0,0);
		return sup;
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

	updateBndSphR() {
		this.boundSphR = this.radius;
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

	/** 只取最大的 */
	setScale(x:number,y:number,z:number, recalcMassProp:boolean=false){
		let s = Math.max(Math.abs(x),Math.abs(y),Math.abs(z));
		this.radius = this.oriRadius*s;
		this.margin=this.radius;
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
		return deep;
	}

	/**
	 * sphere和box的碰撞检测
	 * @param myPos 
	 * @param boxHalf 
	 * @param boxPos 
	 * @param boxQuat 
	 * @param hitPos 	球的碰撞点
	 * @param hitpos1 	box的 碰撞点
	 * @param hitNormal 把球推开的方向，即box的法线
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
		/** 碰撞深度，即推开这个距离就能解除碰撞 */
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
					let minidist = 100000;
					let miniface=-1;
					// 从6个面中选一个最浅的作为碰撞面
					// extx - dot(ax_x,box_to_spher)
					// 根据box_to_spher的朝向判断哪个面
					// let x= box_to_sphere.x
					if(false){
					if(x>0){
						let dist = half.x-x;
						if(minidist>dist){
							minidist=dist;
							miniface=0;
						}						
					}else{
						let dist = -x-half.x;
						if(minidist>dist){
							minidist=dist;
							miniface=1;
						}						
					}
					if(y>0){
						let dist = half.y-y;
						if(minidist>dist){
							minidist=dist;
							miniface=2;
						}						
					}else{
						let dist = -y-half.y;
						if(minidist>dist){
							minidist=dist;
							miniface=3;
						}						
					}
					if(z>0){
						let dist = half.z-z;
						if(minidist>dist){
							minidist=dist;
							miniface=4;
						}						
					}else{
						let dist = -z-half.z;
						if(minidist>dist){
							minidist=dist;
							miniface=5;
						}						
					}
					}else{
					
					for(let fi=0; fi<6; fi++){
						box_to_sphere.vsub(half, extsubpos);
						let dist = boxFaceDist[fi] = Math.abs( extsubpos.dot(boxFaceNorml[fi]));// dot(ext,norm) - dot(mypos,norm)
						if(minidist>dist){
							minidist=dist;
							miniface=fi;
						}
					}
					}
					if(miniface>=0&&miniface<6){
						deep = minidist+R;
						//hitNormal.copy(boxFaceNorml[miniface]);
						boxQuat.vmult(boxFaceNorml[miniface],hitNormal);
						myPos.addScaledVector(-R,hitNormal,hitPos);
						myPos.addScaledVector(minidist,hitNormal,hitpos1);
					}
					return deep;
					// kkk
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


	/**
	 * 把 hitpoints 中的碰撞点和法线转换到世界空间
	 * @param hitpoints 碰撞点数组
	 * @param voxPos 	vox的位置
	 * @param voxQuat 	vox的旋转
	 * @param scale   voxel 的缩放
	 */
	private  _voxHitInfoToWorld(hitpoints:HitPointInfoArray,voxPos:Vec3, voxQuat:Quaternion, scale:Vec3|null){
		let hl = hitpoints.length;
		for (let i = 0; i < hl; i++) {
			let hi = hitpoints.data[i];
			voxQuat.vmult(hi.posi, hi.posi); 
			if(scale){
				hi.posi.vmul(scale,hi.posi);
			}
			voxPos.vadd(hi.posi, hi.posi);

			voxQuat.vmult(hi.posj, hi.posj); 
			if(scale){
				hi.posj.vmul(scale,hi.posj);
			}
			voxPos.vadd(hi.posj, hi.posj);

			voxQuat.vmult(hi.normal, hi.normal);
			// 法线不用缩放,除非有镜像
			if(scale) {
				if(scale.x<0) hi.normal.x*=-1;
				if(scale.y<0) hi.normal.y*=-1;
				if(scale.z<0) hi.normal.z*=-1;
			}
		}		
	}

	/**
	 * 球和voxel的碰撞检测
	 * 球主要检测6个方向是否正面碰撞，非正面碰撞的，每个格子元素用球模拟
	 * @param myPos 
	 * @param voxel 
	 * @param voxPos 
	 * @param voxQuat 
	 * @param hitpoints 
	 * @param justtest 
	 * 
	 * TODO 只与表面的vox检测就行，表面的满足了，内部的一定满足
	 */
	hitVoxel(myPos: Vec3, voxel: Voxel, voxPos: Vec3, voxQuat: Quaternion, hitpoints: HitPointInfoArray, justtest: boolean): boolean {
		//DEBUG
		//myPos.x = -0.47377423035846794;
		//myPos.y = -0.028011225545816587;
		//myPos.z = 3.8401824198470447;
		//DEBUG
		hitpoints.length = 0;
		let scale = voxel.scale;
		let invScale = voxel.invScale;

		let R = this.radius;
		/** vox 原始包围盒的大小 */
		let voxmin = voxel.voxData.aabbmin;// voxel.aabbmin;  要用原始aabb，因为计算相对
		/** vox 原始包围盒的大小 */
		let voxmax = voxel.voxData.aabbmax;// voxel.aabbmax;

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
		var maxvoxr = voxr*voxel.maxScale;
		// 缩放
		var invsx=1;
		var invsy=1;
		var invsz=1;
		if(invScale){
			// 在格子空间的位置要考虑缩放
			sphInVox.vmul(invScale,sphInVox);
			invsx=invScale.x;
			invsy=invScale.y;
			invsz=invScale.z;
			// R/=voxel.maxScale;	// 半径也要修改 // 为了能处理不均匀缩放，球的半径不缩放，这样就能保证还是一个球，然后只要处理采样voxel的位置就行
		}

		// 计算球占用的范围
		let sphminx = sphInVox.x - R*invsx;
		let sphminy = sphInVox.y - R*invsy;
		let sphminz = sphInVox.z - R*invsz;
		let sphmaxx = sphInVox.x + R*invsx;
		let sphmaxy = sphInVox.y + R*invsy;
		let sphmaxz = sphInVox.z + R*invsz;

		// 球心所在格子。 sphInVox已经是考虑缩放的位置了，所以可以直接除以原始gridw。
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
		/** 球的格子的范围。最小值。下面会进一步缩小这个范围值 */
		let gridminx = Math.floor((sphminx - voxmin.x) / gridw);
		if (gridminx >= voxszx) return false;	// 球的包围盒与vox的包围盒的粗略检测
		if (gridminx < 0) gridminx = 0;

		let gridminy = Math.floor((sphminy - voxmin.y) / gridw);
		if (gridminy >= voxszy) return false;
		if (gridminy < 0) gridminy = 0;

		let gridminz = Math.floor((sphminz - voxmin.z) / gridw);
		if (gridminz >= voxszz) return false;
		if (gridminz < 0) gridminz = 0;

		/** 球的最远格子 */
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

		// 先只检测轴方向的碰撞。

		// 如果球形已经进入盒子了，找一个最近面出来
		// 有个问题是出来以后其实还是有可能处于碰撞状态的。不过这个可能可以通过下一帧解决
		if (cgridxvalid && cgridyvalid && cgridzvalid && voxel.getVox(cgridx, cgridy, cgridz)) {
			if (justtest)
				return true;
			// 如果球心已经撞到实心的格子中了，朝着6个方向寻找最近出点
			// 如果边缘也是实心的话的处理
			let velInVox = hitVoxelTmpVel;
			let sphvel = this.body.velocity;
			//console.log('球进入格子了',sphvel.x,sphvel.y,sphvel.z)
			// 把球的速度转换到vox空间 
			invQ.vmult(sphvel, velInVox);
			if(scale){
				velInVox.x*=scale.x;
				velInVox.y*=scale.y;
				velInVox.z*=scale.z;
			}

			/** 不参考速度方向，直接比较所有方向找一个最近的 */
			let NotCheckSphVel = false;

			let mindist = 1e6;
			let mindistid = 0;
			let dist1 = 0;

			// x正方向
			if (NotCheckSphVel || velInVox.x <= 0) {	// 如果x速度<0则检查x正方向
				dist1 = Math.abs(voxmax.x - sphInVox.x);	// 先假设是到aabb的距离
				if (dist1 < mindist) {	// 要统计最近距离
					mindist = dist1;
					mindistid = 0;
				}
				// 然后从当前格子向后（相对于速度）遍历，找到第一个空的，这就是这个速度方向的最近的*外*面
				for (i = cgridx + 1; i < voxszx; i++) {
					if (!voxel.getVox(i, cgridy, cgridz)) {
						mindist = gridw * i + voxmin.x - sphInVox.x;
						break;
					}
				}
			}

			// x负方向
			if (NotCheckSphVel || velInVox.x >= 0) {
				dist1 = Math.abs(sphInVox.x - voxmin.x);
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
			}
			//y+
			if (NotCheckSphVel || velInVox.y <= 0) {
				dist1 = Math.abs(voxmax.y - sphInVox.y);
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
						break;	// 找到空的以后就要停止
					}
				}
			}
			//y-
			if (NotCheckSphVel || velInVox.y >= 0) {
				dist1 = Math.abs(sphInVox.y - voxmin.y);
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
			}

			//z+
			if (NotCheckSphVel || velInVox.z <= 0) {
				dist1 = Math.abs( voxmax.z - sphInVox.z);
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
			}

			//z-
			if (NotCheckSphVel || velInVox.z >= 0) {
				dist1 = Math.abs( sphInVox.z - voxmin.z);
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
			}

			// 已经确定了弹出方向和碰撞深度，下面构造碰撞信息
			let hitinfo = hitpoints.getnew();
			/** posi 是球的碰撞点 */
			let posi = hitinfo.posi;
			/** posj 是格子的碰撞点 */
			let posj = hitinfo.posj;
			/** 碰撞点的格子的法线 */
			let norm = hitinfo.normal;

			switch (mindistid) {
				case 0://想从+x弹出
					posi.set(sphminx, sphInVox.y, sphInVox.z);
					posj.set(sphInVox.x + mindist, sphInVox.y, sphInVox.z)	//不能加R，碰撞点就是sphInVox+dist
					norm.set(1, 0, 0);
					break;
				case 1://想从-x弹出
					posi.set(sphmaxx, sphInVox.y, sphInVox.z);
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

			// 碰撞点要转换到世界空间
			this._voxHitInfoToWorld(hitpoints, voxPos, voxQuat, scale);

		} else {// 如果球心在外面，先进一步缩小范围
			// 注意这时候包围盒检测已经通过了，所以不用再做包围盒相关检测
			//maxx
			// 判断x的话，必须yz都在有效范围内，否则不会相交

			// 根据vox和球的比例，采用简单的遍历球的方法或者只处理正面的方法。
			// 如果格子很大，则只处理正面的方法就够了。如果格子很小，则遍历覆盖的格子
			// 对于缩放变形很大的格子不能用遍历格子用球模拟的方法，会有严重错误
			if(maxvoxr>R/6){	// 格子和R的比例的值可能需要调整。当比例差不多（例如两倍）的时候，用格子非常不准，例如人无法在格子地面上站住
				if (cgridyvalid && cgridzvalid) {// yz 在范围内，测试x方向
					// x正方向
					for (i = Math.max(cgridx + 1, gridminx); i <= gridmaxx; i++) {//cgridx必须 从有效点开始，但是又不能修改cgridx，因为下面要用，所以用max
						// 在球的x正方向范围内，如果有数据，表示会碰撞
						if (voxel.getVox(i, cgridy, cgridz)) {
							// 添加碰撞信息 注意这时候是voxel空间的
							let hitinfo = hitpoints.getnew();
							hitinfo.posi.set(sphmaxx, sphInVox.y, sphInVox.z);	// 球的碰撞点
							hitinfo.posj.set(gridw * i + voxmin.x, sphInVox.y, sphInVox.z);
							hitinfo.normal.set(-1, 0, 0);	// 推开球
							gridmaxx = i - 1;	// 现在没什么用了
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
				this._voxHitInfoToWorld(hitpoints, voxPos, voxQuat, scale);
	
			}else{
				// 遍历重合格子处理，这时候就是把范围内的所有的vox当成一个球来算
				let curVoxOri = hitVoxelTmpVec2;
				let hitpos = hitvoxHitPos1;
				let hitpos1 = hitVoxHitPos2;
				let hitnorm = hitVoxHitNorm;

				function voxhitsphere(R:number,sphPos:Vec3, voxr:number, voxpos:Vec3){

				}

				// 如果vox是静态对象，可以合并为一个等价点
				let nx=0,px=0;
				let ny=0,py=0;
				let nz=0,pz=0;

				// 根据球的中心位置来确定方向。注意可能左右都有碰撞
				// TODO 只检测外层。 在越来越远的方向一旦有碰撞了下面的就不用检测了
				for (let z = gridminz; z <= gridmaxz; z++) {
					for (let y = gridminy; y <= gridmaxy; y++) {
						for (let x = gridminx; x <= gridmaxx; x++) {
							if (voxel.getVox(x, y, z)) {
	
								// 把xyz转到世界空间
								curVoxOri.set(x + 0.5, y + 0.5, z + 0.5);// 在格子的中心
								voxmin.addScaledVector(gridw, curVoxOri, curVoxOri);// tmpV = min + (vox.xyz+0.5)*gridw
								if(scale){
									curVoxOri.vmul(scale, curVoxOri);	//缩放
								}
								//curVoxOri现在是在vox空间内的一个点
								voxQuat.vmult(curVoxOri, curVoxOri);//TODO 直接用矩阵的方向
								curVoxOri.vadd(voxPos, curVoxOri);
								//tmpV现在是世界空间的点了，计算碰撞信息
	
								// 这里的法线是推开自己的
								let deep = Sphere.SpherehitSphere(R, myPos, maxvoxr, curVoxOri, hitpos, hitnorm, hitpos1, justtest);
								if (deep < 0)
									continue;
								if (justtest)
									return true;
								//统计
								let hx = hitnorm.x*deep;
								let hy = hitnorm.y*deep;
								let hz = hitnorm.z*deep;
								if(hx>px)px=hx;if(hx<nx)nx=hx;
								if(hy>py)py=hy;if(hy<ny)ny=hy;
								if(hz>pz)pz=hz;if(hz<nz)nz=hz;

								// 
								/*
								let hi = hitpoints.getnew();
								hi.posi.copy(hitpos);
								hi.posj.copy(hitpos1);
								hi.normal.copy(hitnorm);
								*/
							}
						}
					}
				}			

				// 计算等价碰撞
				let fx = px+nx;
				let fy = py+ny;
				let fz = pz+nz;
				// 太小的认为是误差
				if(Math.abs(fx)<1e-4)fx=0;
				if(Math.abs(fy)<1e-4)fy=0;
				if(Math.abs(fz)<1e-4)fz=0;

				/* 
				 模拟一个等价碰撞，假设是与一个点碰撞，这个点是静态的不可动，所以碰撞点的效果是把球往normal方向拉动deep
				       |-------------R----------|
				                        deep
				 mypos +-------------|<---------|
								  otherhit     myHit
				 对方碰撞点和对方位置重合
				*/
				if(fx!=0||fy!=0||fz!=0){
					let hi = hitpoints.getnew();
					let len = Math.sqrt( fx*fx+fy*fy+fz*fz);
					let nx = fx/len,ny=fy/len,nz=fz/len;
					let posi = hi.posi;
					posi.set(myPos.x-R*nx,myPos.y-R*ny,myPos.z-R*nz);	// 当前位置 沿着法线反向移动R
					hi.posj.set(posi.x+fx,posi.y+fy,posi.z+fz);			// posi 加上碰撞深度
					hi.normal.set(nx,ny,nz);
				}
			}

		}

		//debug
		/*
		if (hitpoints.length > 0) {
			console.log('hit num=', hitpoints.length);
			
			for (let i = 0; i < hitpoints.length; i++) {
				let hi = hitpoints.data[i];
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
}

var hitVoxelTmpVec1 = new Vec3();
var hitVoxelInvScale = new Vec3();
var hitVoxelTmpVec2 = new Vec3();
var hitVoxelTmpVel = new Vec3();
var hitvoxHitPos1 = new Vec3();
var hitVoxHitPos2 = new Vec3();
var hitVoxHitNorm = new Vec3();
var hitvoxelInvQ = new Quaternion();