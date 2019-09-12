import Shape, { SHAPETYPE } from './Shape.js';
import Vec3 from '../math/Vec3.js';
import Quaternion from '../math/Quaternion.js';

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
}
