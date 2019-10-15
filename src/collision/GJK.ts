import {Vec3} from "../math/Vec3";
import { MinkowskiDiff } from "./GJKEPA2";

const GJK_MIN_DISTANCE = 1e-12;
const GJK_DUPLICATED_EPS = 1e-12;
const GJK_ACCURACY = 1e-12;
const GJK_MAX_ITERATIONS = 128;
const GJK_SIMPLEX2_EPS = 0;
const GJK_SIMPLEX3_EPS = 0;
const GJK_SIMPLEX4_EPS = 0;

/** support vertex */
export class GJK_sSV {
	/** 采样方向 */
	d = new Vec3();	
	/** 采样得到的点 */
	w = new Vec3();  
	copy(o:GJK_sSV){
		this.d.copy(o.d);
		this.w.copy(o.w);
		return this;
	}
}

/** 当前单形的描述 */
export class GJK_sSimlex {
	/** 支撑点，最多4个，包含采样方向和采样点 */
	supv: GJK_sSV[] = [];//4
	p = [0, 0, 0, 0];
	rank = 0;	// 单形类型。1点， 2线段 3三角形 4四面体
}

export const enum GJK_eStatus {
	Valid = 0,
	Inside = 1,
	Failed = 2
}

var vec3_4 = [new Vec3(), new Vec3(), new Vec3(), new Vec3()];

export class GJK {
	m_shape:MinkowskiDiff;
	m_ray = new Vec3();				// 当前检测方向
	m_distance = 0;
	/** simplex[2] */
	m_simplices = [new GJK_sSimlex(), new GJK_sSimlex()];
	m_store = [new GJK_sSV(), new GJK_sSV(), new GJK_sSV(), new GJK_sSV()];
	m_free: GJK_sSV[] = new Array(4);	// 保存删除的点
	m_nfree = 0;	// m_free的有效长度
	m_current = 0;
	/** 当前使用的simplex */
	m_simplex: GJK_sSimlex;
	m_status = GJK_eStatus.Failed;

	constructor() {
		this.Initialize();
	}

	Initialize() {
		this.m_ray.set(0, 0, 0);
		this.m_nfree = 0;
		this.m_status = GJK_eStatus.Failed;
		this.m_current = 0;
		this.m_distance = 0;
	}

	/**
	 * 执行GJK算法
	 * @param shapearg 	
	 * @param guess 初始检测方向
	 * @TODO 由于这个函数会多次调用，需要想办法优化其中的空间转换部分的代码
	 */
	Evaluate(shapearg: MinkowskiDiff, guess: Vec3) {
		let m_simplices = this.m_simplices;
		let m_ray = this.m_ray;
		let iterations = 0;
		let sqdist = 0;
		let alpha = 0;
		let lastw = vec3_4;//Vec3[4]
		let clastw = 0;
		/* Initialize solver		*/
		let m_free = this.m_free;
		let m_store = this.m_store;
		m_free[0] = m_store[0];
		m_free[1] = m_store[1];
		m_free[2] = m_store[2];
		m_free[3] = m_store[3];
		this.m_nfree = 4;
		this.m_current = 0;
		this.m_status = GJK_eStatus.Valid;
		this.m_shape = shapearg;
		this.m_distance = 0;

		/* Initialize simplex		*/
		let curSimp = m_simplices[0];
		curSimp.rank = 0;

		m_ray.copy(guess);
		let sqrl = m_ray.lengthSquared();

		// 采样第一个simplex
		let smpDir = new Vec3(1, 0, 0);
		if (sqrl > 0) {
			m_ray.negate(smpDir);
		}
		this.appendvertice(curSimp, smpDir);

		curSimp.p[0] = 1;
		m_ray.copy(curSimp.supv[0].w);

		sqdist = sqrl;
		lastw[0].copy(m_ray);	// lastw = simp[0].c[0].w
		lastw[1].copy(m_ray);
		lastw[2].copy(m_ray);
		lastw[3].copy(m_ray);

		let tmpD = new Vec3();
		let weights = [0, 0, 0, 0];
		let retMask = [0];
		let current = this.m_current;
		do {
			let next = 1 - current;	//只在0,1之间切换
			/** 当前的simplex */
			let cs = m_simplices[current];
			/** 下一个simplex */
			let ns = m_simplices[next];
			/* Check zero							*/
			/** 采样方向的长度 */
			let rl = m_ray.length();
			if (rl < GJK_MIN_DISTANCE) { /* Touching or inside				*/
				this.m_status = GJK_eStatus.Inside;
				break;
			}
			/* Append new vertice in -'v' direction	*/
			m_ray.negate(smpDir);
			this.appendvertice(cs, smpDir);	// 添加一个新的采样
			/**新的采样点 */
			let w = cs.supv[cs.rank - 1].w;
			let found = false;
			for (let i = 0; i < 4; ++i) {
				w.vsub(lastw[i], tmpD);//tmpD = w-lastw[i]
				if (tmpD.lengthSquared() < GJK_DUPLICATED_EPS) {
					//如果新的采样点已经与上4次中的某个重合了，则认为结束了
					found = true;
					break;
				}
			}
			if (found) { /* Return old simplex				*/
				// 删掉重合的点，结束。
				this.removevertice(m_simplices[current]);
				break;
			}
			else { /* Update lastw					*/
				// 更新 lastw，lastw[++%4]=w
				lastw[clastw = (clastw + 1) & 3].copy(w);
			}
			/* Check for termination				*/
			/** 采样点在采样方向上投影的长度 */
			let omega = m_ray.dot(w) / rl;
			alpha = Math.max(omega, alpha);	// 取大的
			if (((rl - alpha) - (GJK_ACCURACY * rl)) <= 0) { /* Return old simplex				*/
				//如果新采样的长度跟原来的差不多，结束
				this.removevertice(m_simplices[current]);
				break;
			}
			/* Reduce simplex						*/
			weights[2] = 0; weights[3] = 0; //初始化为0
			retMask[0] = 0;
			switch (cs.rank) {
				case 2:
					sqdist = this.projectorigin2(cs.supv[0].w, cs.supv[1].w, weights, retMask);
					break;
				case 3:
					sqdist = this.projectorigin3(cs.supv[0].w, cs.supv[1].w, cs.supv[2].w, weights, retMask);
					break;
				case 4:
					sqdist = this.projectorigin4(cs.supv[0].w, cs.supv[1].w, cs.supv[2].w, cs.supv[3].w, weights, retMask);
					break;
			}

			let mask = retMask[0];
			//如果距离有效。计算新的采样方向
			if (sqdist >= 0) { /* Valid	*/
				ns.rank = 0;
				m_ray.set(0, 0, 0);
				this.m_current = current = next;

				for (let i = 0, ni = cs.rank; i < ni; ++i) {
					if (mask & (1 << i)) {
						// 如果weights[i]存在数据
						// 这里的作用是去掉空白的数据，并且更新ray
						ns.supv[ns.rank] = cs.supv[i];
						let cwt = weights[i];
						ns.p[ns.rank++] = cwt;
						let cw = cs.supv[i].w;
						m_ray.x += cw.x * cwt;
						m_ray.y += cw.y * cwt;
						m_ray.z += cw.z * cwt;
					}
					else {
						m_free[this.m_nfree++] = cs.supv[i];
					}
				}
				if (mask == 15) this.m_status = GJK_eStatus.Inside;
			}
			else { /* Return old simplex				*/
				this.removevertice(m_simplices[current]);
				break;
			}
			this.m_status = ((++iterations) < GJK_MAX_ITERATIONS) ? this.m_status : GJK_eStatus.Failed;
		} while (this.m_status == GJK_eStatus.Valid);

		this.m_simplex = m_simplices[this.m_current];
		switch (this.m_status) {
			case GJK_eStatus.Valid:
				this.m_distance = m_ray.length();
				break;
			case GJK_eStatus.Inside:
				this.m_distance = 0;
				break;
			default:
				{
				}
		}
		return this.m_status;
	}

	/**
	 * 构建四面体，把原点包起来
	 * @return false
	 */
	EncloseOrigin(): boolean {
		let m_simplex = this.m_simplex;
		let d = new Vec3();
		let p = new Vec3();
		let n = new Vec3();
		let axis = new Vec3();
		let negv = new Vec3();
		let d1 = new Vec3();
		let d2 = new Vec3();
		let d3 = new Vec3();

		switch (m_simplex.rank) {
			case 1: {
				// 如果只有一个点，需要6个正方向采样，变成线段再看
				for (let i = 0; i < 3; ++i) {
					axis.set(i==0?1:0, i==1?1:0, i==2?1:0);// 1,0,0;  0,1,0;  0,0,1
					this.appendvertice(m_simplex, axis);
					if (this.EncloseOrigin()) return true;
					this.removevertice(m_simplex);
					axis.negate(negv);					// 取反再检测一下
					this.appendvertice(m_simplex, negv);// -axis
					if (this.EncloseOrigin()) return true;
					this.removevertice(m_simplex);
				}
			}
				break;
			case 2: {
				m_simplex.supv[1].w.vsub(m_simplex.supv[0].w, d);//	let d = m_simplex.c[1].w - m_simplex.c[0].w;
				for (let i = 0; i < 3; ++i) {
					axis.set(i==0?1:0, i==1?1:0, i==2?1:0);	// 1,0,0;  0,1,0;  0,0,1
					d.cross(axis,p);	//p=d x axis
					if (p.lengthSquared() > 0) {
						this.appendvertice(m_simplex, p);
						if (this.EncloseOrigin()) return true;
						this.removevertice(m_simplex);
						p.negate(negv);
						this.appendvertice(m_simplex, negv);	// -p
						if (this.EncloseOrigin()) return true;
						this.removevertice(m_simplex);
					}
				}
			}
				break;
			case 3: {
				m_simplex.supv[1].w.vsub(m_simplex.supv[0].w, d1);
				m_simplex.supv[2].w.vsub(m_simplex.supv[0].w,d2);
				//Vector3 n = Cross(m_simplex.c[1].w - m_simplex.c[0].w,	m_simplex.c[2].w - m_simplex.c[0].w);
				d1.cross(d2,n);
				if (n.lengthSquared() > 0) {
					this.appendvertice( m_simplex, n);
					if (this.EncloseOrigin()) return true;
					this.removevertice( m_simplex);
					n.negate(negv);
					this.appendvertice( m_simplex, negv);//-n
					if (this.EncloseOrigin()) return true;
					this.removevertice( m_simplex);
				}
			}
				break;
			case 4: {
				m_simplex.supv[0].w.vsub( m_simplex.supv[3].w, d1);
				m_simplex.supv[1].w.vsub( m_simplex.supv[3].w, d2);
				m_simplex.supv[2].w.vsub( m_simplex.supv[3].w, d3);
				//if (Math.abs(this.det(m_simplex.c[0].w - m_simplex.c[3].w, m_simplex.c[1].w - m_simplex.c[3].w, m_simplex.c[2].w - m_simplex.c[3].w)) > 0)
				if (Math.abs(this.det(d1, d2, d3)) > 0)
					return true;
			}
				break;
		}
		return false;
	}

	/**
	 * 沿着方向d采样shape，结果放到sv中
	 * @param d 
	 * @param sv 
	 */
	getsupport(d: Vec3, sv: GJK_sSV) {
		let l = d.length();
		d.scale(1 / l, sv.d); // 规格化d. sv.d=d/||d||
		this.m_shape.Support(sv.d,false,sv.w);	// 在方向d上采样，放到 sv.w
	}

	/**
	 * simplex 删除一个点，降级一下
	 * @param simplex 
	 */
	removevertice(simplex: GJK_sSimlex) {
		this.m_free[this.m_nfree++] = simplex.supv[--simplex.rank];
	}

	/**
	 * simplex根据采样方向，增加新的点
	 * @param simplex 
	 * @param v 
	 */
	appendvertice(simplex: GJK_sSimlex, v: Vec3) {
		simplex.p[simplex.rank] = 0;
		simplex.supv[simplex.rank] = this.m_free[--this.m_nfree]; // 回收支撑点
		this.getsupport(v, simplex.supv[simplex.rank++]);
	}

	det(a: Vec3, b: Vec3, c: Vec3): number {
		return (a.y * b.z * c.x + a.z * b.x * c.y -
			a.x * b.z * c.y - a.y * b.x * c.z +
			a.x * b.y * c.z - a.z * b.y * c.x);
	}

	static proj2_d = new Vec3();
	/**
	 * 原点投影到线段上。返回最接近原点的点到原点的距离
	 * @param a 点1
	 * @param b 点2
	 * @param w out 重心坐标
	 * @param m mask bit位表示使用了w的哪个位置
	 */
	projectorigin2(a: Vec3, b: Vec3, w: number[], m: i32[]): number {
		let d = GJK.proj2_d;
		b.vsub(a, d);	//d=b-a;
		let l = d.lengthSquared();
		if (l > GJK_SIMPLEX2_EPS) {
			let t = l > 0 ? -a.dot(d) / l : 0;
			if (t >= 1) {	// 原点超过b
				w[0] = 0;
				w[1] = 1;
				m[0] = 2;
				return (b.lengthSquared());
			}
			else if (t <= 0) {// 原点<a
				w[0] = 1;
				w[1] = 0;
				m[0] = 1;
				return (a.lengthSquared());
			}
			else {
				w[0] = 1 - (w[1] = t);
				m[0] = 3;
				a.addScaledVector(t, d, d);
				return d.lengthSquared();//a+d*t
			}
		}
		return -1;
	}

	/**
	 * 找到三角形上最接近原点的点
	 * @param a 
	 * @param b 
	 * @param c 
	 * @param w 
	 * @param m 
	 */
	projectorigin3(a: Vec3, b: Vec3, c: Vec3, w: number[], m: i32[]): number {
		let imd3 = [1, 2, 0];
		let vt = [a, b, c];
		let n = new Vec3();
		let ba = new Vec3();
		let cb = new Vec3();
		let ac = new Vec3();
		let n1 = new Vec3();
		let p = new Vec3();
		let pb = new Vec3();
		let pc = new Vec3();
		let tmp = new Vec3();

		a.vsub(b, ba);
		b.vsub(c, cb);
		c.vsub(a, ac);
		let dl = [ba, cb, ac];
		dl[0].cross(dl[1], n); //n = dl[0]xdl[1]
		let l = n.lengthSquared();
		if (l > GJK_SIMPLEX3_EPS) {
			let mindist = -1;
			let subw = [0., 0.];
			for (let i = 0; i < 3; ++i) {
				dl[i].cross(n, n1);
				if (vt[i].dot(n1) > 0) {
					let j = imd3[i];
					let subd = this.projectorigin2(vt[i], vt[j], subw, m);//m重用了
					let subm = m[0];
					if ((mindist < 0) || (subd < mindist)) {
						mindist = subd;
						m[0] = (((subm & 1) ? 1 << i : 0) + ((subm & 2) ? 1 << j : 0));
						w[i] = subw[0];
						w[j] = subw[1];
						w[imd3[j]] = 0;
					}
				}
			}
			if (mindist < 0) {
				let d = a.dot(n);
				let s = Math.sqrt(l);
				n.scale(d / l, p);	// p = n*(d/l)
				mindist = p.lengthSquared();
				m[0] = 7;	// 0,1,2 三个
				b.vsub(p, pb);//pb=b-p
				c.vsub(p, pc);//pc=c-p
				dl[1].cross(pb, tmp);	//dl[1] x pb
				w[0] = tmp.length() / s;
				dl[2].cross(pc, tmp);	//dl[2] x pc
				w[1] = tmp.length() / s;
				w[2] = 1 - (w[0] + w[1]);
			}
			return mindist;
		}
		return -1;
	}

	projectorigin4(a: Vec3, b: Vec3, c: Vec3, d: Vec3, w: number[], m: number[]): number {
		let imd3 = [1, 2, 0];
		let vt = [a, b, c, d];
		let da = new Vec3();
		let db = new Vec3();
		let dc = new Vec3();
		let cb = new Vec3();
		let ba = new Vec3();
		let n = new Vec3();
		let n1 = new Vec3();
		a.vsub(d, da);//da=a-b
		b.vsub(d, db);//db=b-d
		c.vsub(d, dc);//dc=c-d
		b.vsub(c, cb);//cb=b-c
		a.vsub(b, ba);//ba=a-b
		cb.cross(ba, n);//n=cbxba
		let dl = [da, db, c];
		let vl = this.det(dl[0], dl[1], dl[2]);
		let ng = (vl * a.dot(n)) <= 0;
		if (ng && (Math.abs(vl) > GJK_SIMPLEX4_EPS)) {
			let mindist = -1;
			let subw = [0., 0., 0.];
			let subm = 0;
			for (let i = 0; i < 3; ++i) {
				let j = imd3[i];
				dl[i].cross(dl[j], n1);
				let s = vl * d.dot(n1);//s = vl * d.(dl[i]xdl[j])
				if (s > 0) {
					let subd = this.projectorigin3(vt[i], vt[j], d, subw, m);
					subm = m[0];	// 重用m
					if ((mindist < 0) || (subd < mindist)) {
						mindist = subd;
						m[0] = ((subm & 1 ? 1 << i : 0) + (subm & 2 ? 1 << j : 0) + (subm & 4 ? 8 : 0));
						w[i] = subw[0];
						w[j] = subw[1];
						w[imd3[j]] = 0;
						w[3] = subw[2];
					}
				}
			}
			if (mindist < 0) {
				mindist = 0;
				m[0] = 15;
				w[0] = this.det(c, b, d) / vl;
				w[1] = this.det(a, c, d) / vl;
				w[2] = this.det(b, a, d) / vl;
				w[3] = 1 - (w[0] + w[1] + w[2]);
			}
			return mindist;
		}
		return -1;
	}
}
