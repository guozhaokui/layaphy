import { GJK_sSV, GJK_sSimlex, GJK } from "./GJK";
import Vec3 from "../math/Vec3";

declare type sSV = GJK_sSV;

const EPA_MAX_VERTICES = 128;
const EPA_MAX_FACES = EPA_MAX_VERTICES * 2;
const EPA_MAX_ITERATIONS = 255;
const EPA_ACCURACY = 1e-12;
const EPA_PLANE_EPS = 1e-14;

/**
 * 平面定义
 */
export class EPA_sFace {
	/** 平面法线 */
	n = new Vec3();
	d = 0;
	c: sSV[] = new Array(3);//sSV*[]
	f: EPA_sFace[] = new Array(3);//sFace*[]
	l: (EPA_sFace | null)[] = new Array(2);//sFace*[]
	e = [0, 0, 0];
	pass: i32 = 0;
	copy(o: EPA_sFace) {
		this.n.copy(o.n);
		this.d = o.d;

		let c1 = this.c; let c2 = o.c;
		c1[0] = c2[0]; c1[1] = c2[1]; c1[2] = c2[2];

		let f1 = this.f; let f2 = o.f;
		f1[0] = f2[0]; f1[1] = f2[1]; f1[2] = f2[2];

		this.l[0] = o.l[0]; this.l[1] = o.l[1];

		this.e[0] = o.e[0]; this.e[1] = o.e[1]; this.e[2] = o.e[2]

		this.pass = o.pass;
	}
}


export class EPA_sList {
	/**sFace* */
	root: EPA_sFace | null = null;
	count: i32 = 0;
}

export class EPA_sHorizon {
	/** sFAce* */
	cf: EPA_sFace | null = null;
	/** sFace*  */
	ff: EPA_sFace | null = null;
	nf = 0;
}

export enum EPA_eStatus {
	Valid,
	Touching,
	Degenerated,
	NonConvex,
	InvalidHull,
	OutOfFaces,
	OutOfVertices,
	AccuraryReached,
	FallBack,
	Failed
}

/**
 * 初始化一个数组，并用cls的对象填满
 * @param cls 
 * @param n 
 */
function newArray<T>(cls: new () => T, n: i32): T[] {
	let ret: T[] = new Array<T>(n);
	for (let i = 0; i < n; i++) {
		ret[i] = new cls();
	}
	return ret;
}

export class EPA {
	m_status = EPA_eStatus.Failed;
	m_result = new GJK_sSimlex();
	m_normal = new Vec3();
	m_depth = 0;
	m_sv_store = newArray<GJK_sSV>(GJK_sSV, EPA_MAX_VERTICES);
	m_fc_store = newArray<EPA_sFace>(EPA_sFace, EPA_MAX_FACES);
	m_nextsv = 0;
	m_hull = new EPA_sList();
	m_stock = new EPA_sList();

	constructor() {
		this.Initialize();
	}

	bind(fa: EPA_sFace, ea: i32, fb: EPA_sFace, eb: i32) {
		fa.e[ea] = eb;
		fa.f[ea] = fb;
		fb.e[eb] = ea;
		fb.f[eb] = fa;
	}

	append(list: EPA_sList, face: EPA_sFace) {
		face.l[0] = null;
		face.l[1] = list.root;
		if (list.root) list.root.l[0] = face;
		list.root = face;
		++list.count;
	}

	remove(list: EPA_sList, face: EPA_sFace) {
		if (face.l[1]) face.l[1].l[0] = face.l[0];
		if (face.l[0]) face.l[0].l[1] = face.l[1];
		if (face == list.root) list.root = face.l[1];
		--list.count;
	}

	Initialize() {
		this.m_status = EPA_eStatus.Failed;
		this.m_normal.set(0, 0, 0);
		this.m_depth = 0;
		this.m_nextsv = 0;
		for (let i = 0; i < EPA_MAX_FACES; ++i) {
			this.append(this.m_stock, this.m_fc_store[EPA_MAX_FACES - i - 1]);
		}
	}

	Evaluate(gjk: GJK, guess: Vec3): EPA_eStatus {
		let m_hull = this.m_hull;
		let simplex = gjk.m_simplex;
		let bind = this.bind;
		let newface = this.newface;
		let m_normal = this.m_normal;
		let m_result = this.m_result;
		let m_sv_store = this.m_sv_store;

		let d1 = new Vec3();
		let d2 = new Vec3();
		let d3 = new Vec3();
		let projection = new Vec3();

		if ((simplex.rank > 1) && gjk.EncloseOrigin()) {
			/* Clean up				*/
			while (m_hull.root) {
				let f = m_hull.root;
				this.remove(m_hull, f);
				this.append(this.m_stock, f);
			}
			this.m_status = EPA_eStatus.Valid;
			this.m_nextsv = 0;
			/* Orient simplex		*/
			simplex.c[0].w.vsub(simplex.c[3].w, d1);
			simplex.c[1].w.vsub(simplex.c[3].w, d2);
			simplex.c[2].w.vsub(simplex.c[3].w, d3);
			//if (gjk.det(simplex.c[0].w - simplex.c[3].w, simplex.c[1].w - simplex.c[3].w, simplex.c[2].w - simplex.c[3].w) < 0) {
			if (gjk.det(d1, d2, d3) < 0) {
				let tmp = simplex.c[0]; simplex.c[0] = simplex.c[1]; simplex.c[1] = tmp;	//swap(simplex.c[0], simplex.c[1]);
				let tmp1 = simplex.p[0]; simplex.p[0] = simplex.p[1]; simplex.p[1] = tmp1; // Swap(simplex.p[0], simplex.p[1]);
			}
			/* Build initial hull	*/
			let tetra:EPA_sFace[] = [
				newface(simplex.c[0], simplex.c[1], simplex.c[2], true) as EPA_sFace,
				newface(simplex.c[1], simplex.c[0], simplex.c[3], true) as EPA_sFace,
				newface(simplex.c[2], simplex.c[1], simplex.c[3], true) as EPA_sFace,
				newface(simplex.c[0], simplex.c[2], simplex.c[3], true) as EPA_sFace
			];

			if (m_hull.count == 4) {
				let best = this.findbest() as EPA_sFace;
				let outer =new EPA_sFace();
				outer.copy( best);
				let pass = 0;
				let iterations = 0;
				bind(tetra[0], 0, tetra[1], 0);
				bind(tetra[0], 1, tetra[2], 0);
				bind(tetra[0], 2, tetra[3], 0);
				bind(tetra[1], 1, tetra[3], 2);
				bind(tetra[1], 2, tetra[2], 1);
				bind(tetra[2], 2, tetra[3], 1);
				this.m_status = EPA_eStatus.Valid;
				for (; iterations < EPA_MAX_ITERATIONS; ++iterations) {
					if (this.m_nextsv < EPA_MAX_VERTICES) {
						let horizon = new EPA_sHorizon();
						let w = m_sv_store[this.m_nextsv++];
						let valid = true;
						best.pass = ++pass;
						gjk.getsupport(best.n, w);
						let wdist = best.n.dot(w.w) - best.d;
						if (wdist > EPA_ACCURACY) {
							for (let j = 0; (j < 3) && valid; ++j) {
								valid = valid && this.expand(pass, w, best.f[j], best.e[j], horizon);
							}
							if (valid && (horizon.nf >= 3)) {
								this.bind(horizon.cf as EPA_sFace, 1, horizon.ff as EPA_sFace, 2);
								this.remove(m_hull, best);
								this.append(this.m_stock, best);
								best = this.findbest() as EPA_sFace;
								outer.copy( best);
							}
							else {
								this.m_status = EPA_eStatus.InvalidHull;
								break;
							}
						}
						else {
							this.m_status = EPA_eStatus.AccuraryReached;
							break;
						}
					}
					else {
						this.m_status = EPA_eStatus.OutOfVertices;
						break;
					}
				}
				outer.n.addScaledVector(outer.d,outer.n,projection);//projection = outer.n * outer.d;
				m_normal = outer.n;
				this.m_depth = outer.d;
				m_result.rank = 3;
				m_result.c[0] = outer.c[0];
				m_result.c[1] = outer.c[1];
				m_result.c[2] = outer.c[2];

				outer.c[1].w.vsub(projection,d1);
				outer.c[2].w.vsub(projection,d2);
				d1.cross(d2,d3);
				m_result.p[0] = d3.length();//Cross(outer.c[1].w - projection, outer.c[2].w - projection).length();

				outer.c[2].w.vsub(projection,d1);
				outer.c[0].w.vsub(projection,d2);
				d1.cross(d2,d3);
				m_result.p[1] = d3.length();//Cross(outer.c[2].w - projection, outer.c[0].w - projection).length();
				
				outer.c[0].w.vsub(projection,d1);
				outer.c[1].w.vsub(projection,d2);
				d1.cross(d2,d3);
				m_result.p[2] = d3.length();//Cross(outer.c[0].w - projection, outer.c[1].w - projection).length();
				let sum = m_result.p[0] + m_result.p[1] + m_result.p[2];
				m_result.p[0] /= sum;
				m_result.p[1] /= sum;
				m_result.p[2] /= sum;
				return this.m_status;
			}
		}
		/* Fallback		*/
		this.m_status = EPA_eStatus.FallBack;
		guess.negate(m_normal);
		let nl = m_normal.length();
		if (nl > 0)
			m_normal.scale(1/nl,m_normal); //m_normal = m_normal / nl;
		else
			m_normal.set(1, 0, 0);
		this.m_depth = 0;
		this.m_result.rank = 1;
		this.m_result.c[0] = simplex.c[0];
		this.m_result.p[0] = 1;
		return this.m_status;
	}

	/**
	 * dist 直接放到face.d中了
	 * @param face 
	 * @param a 
	 * @param b 
	 * @param dist 
	 */
	getedgedist(face: EPA_sFace, a: sSV, b: sSV): boolean {
		let ba = new Vec3();
		let n_ab = new Vec3();

		b.w.vsub(a.w, ba);	//ba = b.w-a.w
		ba.cross(face.n, n_ab);	//n_ab=baxface.n Outward facing edge normal direction, on triangle plane
		let a_dot_nab = a.w.dot(n_ab);  // Only care about the sign to determine inside/outside, so not normalization required

		if (a_dot_nab < 0) {
			// Outside of edge a.b
			let ba_l2 = ba.lengthSquared();
			let a_dot_ba = a.w.dot(ba);
			let b_dot_ba = b.w.dot(ba);

			if (a_dot_ba > 0) {
				// Pick distance vertex a
				face.d = a.w.length();
			}
			else if (b_dot_ba < 0) {
				// Pick distance vertex b
				face.d = b.w.length();
			}
			else {
				// Pick distance to edge a.b
				let a_dot_b = a.w.dot(b.w);
				face.d = Math.sqrt(Math.max((a.w.lengthSquared() * b.w.lengthSquared() - a_dot_b * a_dot_b) / ba_l2, 0));
			}

			return true;
		}

		return false;
	}

	newface(a: sSV, b: sSV, c: sSV, forced: boolean): EPA_sFace|null {//sFace*
		let d1 = new Vec3();
		let d2 = new Vec3();

		let m_stock = this.m_stock;
		let m_hull = this.m_hull;
		if (m_stock.root) {
			let face = m_stock.root;
			this.remove(m_stock, face);
			this.append(m_hull, face);
			face.pass = 0;
			face.c[0] = a;
			face.c[1] = b;
			face.c[2] = c;
			b.w.vsub(a.w, d1);
			c.w.vsub(a.w, d2);
			d1.cross(d2, face.n);
			//face.n = Cross(b.w - a.w, c.w - a.w);
			let l = face.n.length();
			let v = l > EPA_ACCURACY;

			if (v) {
				if (!(this.getedgedist(face, a, b ) ||
					this.getedgedist(face, b, c ) ||
					this.getedgedist(face, c, a ))) {
					// Origin projects to the interior of the triangle
					// Use distance to triangle plane
					face.d = a.w.dot(face.n)/l;
				}

				face.n.scale(1/l, face.n);
				if (forced || (face.d >= -EPA_PLANE_EPS)) {
					return face;
				}
				else
					this.m_status = EPA_eStatus.NonConvex;
			}
			else
				this.m_status = EPA_eStatus.Degenerated;

			this.remove(m_hull, face);
			this.append(m_stock, face);
			return null;
		}
		this.m_status = m_stock.root ? EPA_eStatus.OutOfVertices : EPA_eStatus.OutOfFaces;
		return null;
	}

	findbest(): EPA_sFace | null {//sFace*
		let m_hull = this.m_hull;
		let minf = m_hull.root;
		if (minf) {
			let mind = minf.d * minf.d;
			for (let f = minf.l[1]; f; f = f.l[1]) {
				let sqd = f.d * f.d;
				if (sqd < mind) {
					minf = f;
					mind = sqd;
				}
			}
		}
		return minf;
	}

	expand(pass: i32, w: sSV, f: EPA_sFace, e: i32, horizon: EPA_sHorizon): boolean {
		let i1m3 = [1, 2, 0];
		let i2m3 = [2, 0, 1];
		if (f.pass != pass) {
			let e1 = i1m3[e];
			if ((f.n.dot(w.w) - f.d) < -EPA_PLANE_EPS) {
				let nf = this.newface(f.c[e1], f.c[e], w, false);
				if (nf) {
					this.bind(nf, 0, f, e);
					if (horizon.cf)
						this.bind(horizon.cf, 1, nf, 2);
					else
						horizon.ff = nf;
					horizon.cf = nf;
					++horizon.nf;
					return true;
				}
			}
			else {
				let e2 = i2m3[e];
				f.pass = pass;
				if (this.expand(pass, w, f.f[e1], f.e[e1], horizon) &&
					this.expand(pass, w, f.f[e2], f.e[e2], horizon)) {
					this.remove(this.m_hull, f);
					this.append(this.m_stock, f);
					return true;
				}
			}
		}
		return false;
	}
}
