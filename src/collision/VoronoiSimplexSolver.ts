import Vec3 from "../math/Vec3";

const ORIGIN = new Vec3();
/**
 * 子多面体的最近点的结果
 */
class SubSimplexClosestResult{
	closestPointOnSimplex = new Vec3();
	//MASK for m_usedVertices
	//stores the simplex vertex-usage, using the MASK,
	// if m_usedVertices & MASK then the related vertex is used
	//btUsageBitfield m_usedVertices;
	usedVertices=0;
	barycentricCoords=[0,0,0,0];	// 重心坐标，最多到四面体，所以保留4个
	degenerate=false;				// simplex退化了

	reset(){
		this.degenerate = false;
		this.setBarycentricCoordinates();
		this.usedVertices=0;
	}

	isValid(){
		let bcC = this.barycentricCoords;
		return  (bcC[0] >= 0.) &&
					 (bcC[1] >= 0.) &&
					 (bcC[2] >= 0.) &&
					 (bcC[3] >= 0.);
	}

	setBarycentricCoordinates( a=0, b=0, c=0, d=0){
		let bcC = this.barycentricCoords;
		bcC[0] = a;
		bcC[1] = b;
		bcC[2] = c;
		bcC[3] = d;
	}
}

export class VoronoiSimplexSolver{
	MAXVERTS=5;
	vertNum=0;		//当前指针，
	needUpdate=true;
	vecW  =[new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];		// P-Q. 注意不要看成是矢量，是Minkowski多边形上的点，
	pointP=[new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
	pointQ=[new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];

	/**  计算出的新的方向，也就是需要下一步扩展单形的方向 */
	cachedV=new Vec3();

	cachedP=new Vec3();
	cachedQ=new Vec3();
	lastW:Vec3;		//优化用，这个是对象指针，可以直接比较
	cachedBC = new SubSimplexClosestResult();
	cachedValidClosest=false;

	reset(){
		this.vertNum=0;
		this.needUpdate=true;
	}

	addVertex(w:Vec3,pWorld:Vec3,qWorld:Vec3){
		this.lastW=w;
		this.needUpdate=true;
		let n = this.vertNum;
		this.vecW[n].copy(w);
		this.pointP[n].copy(pWorld);
		this.pointQ[n].copy(qWorld);
		this.vertNum++;
	}

	inSimplex(p:Vec3):boolean{
		let found=false;
		let num = this.vertNum;
		for(let i=0; i<num; i++){

		}
		return found;
	}

	closest(newDir:Vec3):boolean{
		let succes = this.updateClosestVectorAndPoints();
		// 如果点正好在单形上，会返回false，怎么处理
		//newDir.copy(this.cachedV);
		// 更新采样方向，要朝向原点，所以取cachedV的反向
		this.cachedV.negate(newDir);
		return succes;
	}

	fullSimplex():boolean{
		return this.vertNum>=4;
	}

	//去掉不用的
	reduceVertices(used:i32){

	}

	compute_points(p1:Vec3, p2:Vec3){
		this.updateClosestVectorAndPoints();
		p1.copy(this.cachedP);
		p2.copy(this.cachedQ);
	}

	closestPtPointTriangle(p:Vec3, a:Vec3, b:Vec3, c:Vec3, result:SubSimplexClosestResult){
		let ab = new Vec3();
		let ac = new Vec3();
		let ap = new Vec3();
		let bc = new Vec3();

		result.usedVertices=0;
		let closest = result.closestPointOnSimplex;
		// Check if P in vertex region outside A
		b.vsub(a,ab);
		c.vsub(a,ac);
		p.vsub(a,ap);
		let d1 = ab.dot(ap);
		let d2 = ac.dot(ap);
		if (d1 <= 0.0 && d2 <= 0.0){
			closest.copy(a);
			result.usedVertices|=1;// usedVertexA = true;
			result.setBarycentricCoordinates(1, 0, 0);
			return ;  // a; // barycentric coordinates (1,0,0)
		}
	
		// Check if P in vertex region outside B
		let bp =new Vec3();
		p.vsub(b,bp);
		let d3 = ab.dot(bp);
		let d4 = ac.dot(bp);
		if (d3 >= 0.0 && d4 <= d3){
			closest.copy(b);
			result.usedVertices|=2;//usedVertexB = true;
			result.setBarycentricCoordinates(0, 1, 0);
			return ;  // b; // barycentric coordinates (0,1,0)
		}
		// Check if P in edge region of AB, if so return projection of P onto AB
		let vc = d1 * d4 - d3 * d2;
		if (vc <= 0.0 && d1 >= 0.0 && d3 <= 0.0){
			let v = d1 / (d1 - d3);
			a.addScaledVector(v,ab,closest);// = a+v*ab
			result.usedVertices|=3;//usedVertexA = true; usedVertexB = true;
			result.setBarycentricCoordinates(1 - v, v, 0);
			return ;
			//return a + v * ab; // barycentric coordinates (1-v,v,0)
		}
	
		// Check if P in vertex region outside C
		let cp = new Vec3();
		p.vsub(c,cp);
		let d5 = ab.dot(cp);
		let d6 = ac.dot(cp);
		if (d6 >= 0.0 && d5 <= d6){
			result.closestPointOnSimplex = c;
			result.usedVertices|=4;//usedVertexC = true;
			result.setBarycentricCoordinates(0, 0, 1);
			return ;  //c; // barycentric coordinates (0,0,1)
		}
	
		// Check if P in edge region of AC, if so return projection of P onto AC
		let vb = d5 * d2 - d1 * d6;
		if (vb <= 0.0 && d2 >= 0.0 && d6 <= 0.0){
			let w = d2 / (d2 - d6);
			a.addScaledVector(w,ac,closest);//closest = a + w * ac;
			result.usedVertices|=5;//usedVertexA = true;usedVertexC = true;
			result.setBarycentricCoordinates(1 - w, 0, w);
			return ;
			//return a + w * ac; // barycentric coordinates (1-w,0,w)
		}
	
		// Check if P in edge region of BC, if so return projection of P onto BC
		let va = d3 * d6 - d5 * d4;
		if (va <= 0.0 && (d4 - d3) >= 0.0 && (d5 - d6) >= 0.0){
			let w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
			c.vsub(b,bc);
			b.addScaledVector(w,bc,closest);//closest = b + w * (c - b);
			result.usedVertices|=6;//usedVertexB = true; usedVertexC = true;
			result.setBarycentricCoordinates(0, 1 - w, w);
			return ;
			// return b + w * (c - b); // barycentric coordinates (0,1-w,w)
		}
	
		// P inside face region. Compute Q through its barycentric coordinates (u,v,w)
		let denom = 1.0 / (va + vb + vc);
		let v = vb * denom;
		let w = vc * denom;
		a.addScaledVector(v,ab,closest);
		closest.addScaledVector(w,ac,closest);//closest = a + ab * v + ac * w;
		result.usedVertices|=7;//usedVertexA = true; usedVertexB = true; usedVertexC = true;
		result.setBarycentricCoordinates(1 - v - w, v, w);
		//	return a + ab * v + ac * w; // = u*a + v*b + w*c, u = va * denom = btScalar(1.0) - v - w
	}
	
	/**
	 * 判断一个点在平面的外面，平面是abc，d是平面内的一个点，用于确定内部
	 * @param p 
	 * @param a 
	 * @param b 
	 * @param c 
	 * @param d 
	 * @return -1 在面上， 0 在内面， 1 在外面（与d同侧）
	 */
	pointOutsideOfPlane(p:Vec3, a:Vec3, b:Vec3, c:Vec3, d:Vec3){
		let ac=new Vec3();
		let ab = new Vec3();
		let ap = new Vec3();
		let ad = new Vec3();
		let normal = new Vec3();

		c.vsub(a,ac);//ac=c-a
		b.vsub(a,ab);//ab=b-a
		ab.cross(ac,normal);//normal=abxac

		p.vsub(a,ap);//ap = p-a;
		d.vsub(a,ad);//ad = d-a;

		let signp = ap.dot(normal);  // [AP AB AC]
		let signd = ad.dot(normal);  // [AD AB AC]
	
		if (signd * signd < ((1e-8) * (1e-8))){
			//如果在平面上
			return -1;
		}
		// 如果点在外面，则一定与d分别在平面的两侧，则符号相反
		return (signp * signd < 0.)?1:0;
	}

	/**
	 * 查找点p在四面体abcd上最近的面，得到的结果放在finalResult中
	 * TODO 优化，感觉太啰嗦
	 * @param p 
	 * @param a 
	 * @param b 
	 * @param c 
	 * @param d 
	 * @param finalResult 
	 * @return 
	 */
	closestPtPointTetrahedron( p:Vec3, a:Vec3, b:Vec3, c:Vec3, d:Vec3,finalResult:SubSimplexClosestResult){
		let tempResult = new SubSimplexClosestResult();
	
		// Start out assuming point inside all halfspaces, so closest to itself
		finalResult.closestPointOnSimplex.copy(p);
		finalResult.usedVertices=0;
		finalResult.usedVertices=15;//ABCD
	
		let pointOutsideABC = this.pointOutsideOfPlane(p, a, b, c, d);
		let pointOutsideACD = this.pointOutsideOfPlane(p, a, c, d, b);
		let pointOutsideADB = this.pointOutsideOfPlane(p, a, d, b, c);
		let pointOutsideBDC = this.pointOutsideOfPlane(p, b, d, c, a);
	
		if (pointOutsideABC < 0 || pointOutsideACD < 0 || pointOutsideADB < 0 || pointOutsideBDC < 0){
			//p 在多面体的面上了。查找最近点失败
			finalResult.degenerate = true;
			return false;
		}
	
		if (!pointOutsideABC && !pointOutsideACD && !pointOutsideADB && !pointOutsideBDC){
			// 如果点已经在四面体内部了。。TODO
			return false;
		}
	
		// p在四面体的外面，但是不知道距离哪一个面最近，需要挨个测试，找到最近的（最多需要测试3次）
		let bestSqDist = 1e10;
		let pq = new Vec3();
		// If point outside face abc then compute closest point on abc
		if (pointOutsideABC){
			this.closestPtPointTriangle(p, a, b, c, tempResult);
			let q = tempResult.closestPointOnSimplex;
			q.vsub(p,pq);
			let sqDist = pq.dot(pq);
			// Update best closest point if (squared) distance is less than current best
			if (sqDist < bestSqDist){
				bestSqDist = sqDist;
				finalResult.closestPointOnSimplex.copy(q);
				//convert result bitmask!
				finalResult.usedVertices=7;//ABC
				finalResult.setBarycentricCoordinates(
					tempResult.barycentricCoords[0],//A
					tempResult.barycentricCoords[1],//B
					tempResult.barycentricCoords[2],//C
					0);
			}
		}
	
		// Repeat test for face acd
		if (pointOutsideACD){
			this.closestPtPointTriangle(p, a, c, d, tempResult);
			let q = tempResult.closestPointOnSimplex;
			//convert result bitmask!
			q.vsub(p,pq);
			let sqDist = pq.dot(pq);
			if (sqDist < bestSqDist){
				bestSqDist = sqDist;
				finalResult.closestPointOnSimplex.copy(q);
				finalResult.usedVertices=13;//ACD
				finalResult.setBarycentricCoordinates(
					tempResult.barycentricCoords[0],//A
					0,
					tempResult.barycentricCoords[1],//B
					tempResult.barycentricCoords[2]);//C
			}
		}
		// Repeat test for face adb
	
		if (pointOutsideADB){
			this.closestPtPointTriangle(p, a, d, b, tempResult);
			let q = tempResult.closestPointOnSimplex;
			q.vsub(p,pq);
			let sqDist = pq.dot(pq);
			if (sqDist < bestSqDist){
				bestSqDist = sqDist;
				finalResult.closestPointOnSimplex.copy(q);
				finalResult.usedVertices=11;//ABD
				finalResult.setBarycentricCoordinates(
					tempResult.barycentricCoords[0],//A
					tempResult.barycentricCoords[2],//C
					0,
					tempResult.barycentricCoords[1]);//B
			}
		}
		// Repeat test for face bdc
	
		if (pointOutsideBDC){
			this.closestPtPointTriangle(p, b, d, c, tempResult);
			let q = tempResult.closestPointOnSimplex;
			q.vsub(p,pq);
			let sqDist = pq.dot(pq);
			if (sqDist < bestSqDist){
				bestSqDist = sqDist;
				finalResult.closestPointOnSimplex = q;
				finalResult.usedVertices=14;//BCD
					finalResult.setBarycentricCoordinates(
					0,
					tempResult.barycentricCoords[0],	//A
					tempResult.barycentricCoords[2],	//C
					tempResult.barycentricCoords[1]);	//B
			}
		}
		return true;
	}	

	/**
	 * 计算单形上最接近原点的点，以及朝向原点的方向
	 */
	updateClosestVectorAndPoints():boolean{
		if(this.needUpdate){
			let cachedBC = this.cachedBC;
			let cachedP = this.cachedP;
			let cachedQ = this.cachedQ;
			let cachedV = this.cachedV;
			let Vs = this.vecW;
			let Ps = this.pointP;
			let Qs = this.pointQ;
			this.needUpdate=false;
			cachedBC.reset();
			switch( this.vertNum){
				case 0: this.cachedValidClosest=false; break;
				case 1:	// 一个支撑
					cachedP.copy(Ps[0]);
					cachedQ.copy(Qs[0]);
					cachedV.copy(Vs[0]);
					cachedBC.reset();
					cachedBC.setBarycentricCoordinates(1,0,0,0);
					this.cachedValidClosest = true;	//一个总是true
				break;
				case 2:	// 线段
				{
					let from = Vs[0];
					let to = Vs[1];
					let nearest = new Vec3();
					let fromTo = new Vec3();
					to.vsub(from,fromTo);
					let t = -from.dot(fromTo);	// from_Origin 在 fromTo上的投影 。
					// 判断第二次的朝向是不是比第一次更靠近原点方向
					if (t > 0){
						// 原点投影在正向
						let dotVV = fromTo.dot(fromTo);
						if (t < dotVV){
							// 投影在线段上
							t /= dotVV;
							//diff -= t * v;
							cachedBC.usedVertices|=3;//使用第一第二个点
						}else{
							// 投影在线段外，需要重来，退化成一个点
							t = 1;
							//diff -= v;
							cachedBC.usedVertices|=2;	// 使用第二个点
						}
					}else{
						// t在from外，当前的simplex不行，退化成一个点重来
						t = 0;
						cachedBC.usedVertices|=1;	// 使用第一个点
					}
					cachedBC.setBarycentricCoordinates(1 - t, t);
					from.addScaledVector(t, fromTo,nearest);
	
					// 更新p1,p2
					let p0 = Ps[0], p1=Ps[1];
					let q0 = Qs[0], q1=Qs[1];
					cachedP.x = p0.x + t*(p1.x-p0.x);
					cachedP.y = p0.y + t*(p1.y-p0.y);
					cachedP.z = p0.z + t*(p1.z-p0.z);
					cachedQ.x = q0.x + t*(q1.x-q0.x);
					cachedQ.y = q0.y + t*(q1.y-q0.y);
					cachedQ.z = q0.z + t*(q1.z-q0.z);
					cachedP.vsub(cachedQ,cachedV);
					this.reduceVertices(cachedBC.usedVertices);
					this.cachedValidClosest = cachedBC.isValid();
				}
				break;
				case 3:	// 三角形
				{
					//closest point origin from triangle
					let vecW = this.vecW;
					let a = vecW[0];
					let b = vecW[1];
					let c = vecW[2];
					this.closestPtPointTriangle(ORIGIN, a, b, c, cachedBC);
					let bcCoord = cachedBC.barycentricCoords;
					{
						let a=bcCoord[0],b=bcCoord[1],c=bcCoord[2];
						let p0=Ps[0],p1=Ps[1],p2=Ps[2];
						let q0=Qs[0],q1=Qs[1],q2=Qs[2];
						cachedP.x = p0.x*a+p1.x*b+p2.x*c;
						cachedP.y = p0.y*a+p1.y*b+p2.y*c;
						cachedP.z = p0.z*a+p1.z*b+p2.z*c;
						cachedQ.x = q0.x*a+q1.x*b+q2.x*c;
						cachedQ.y = q0.y*a+q1.y*b+q2.y*c;
						cachedQ.z = q0.z*a+q1.z*b+q2.z*c;
					}
					cachedP.vsub(cachedQ,cachedV);

					this.reduceVertices(cachedBC.usedVertices);
					this.cachedValidClosest = cachedBC.isValid();		
				}		
				break;
				case 4: // 四面体
				{
					let a = Vs[0];
					let b = Vs[1];
					let c = Vs[2];
					let d = Vs[3];

					let hasSeparation = this.closestPtPointTetrahedron(ORIGIN, a, b, c, d, cachedBC);

					if (hasSeparation){
						let bcCoord = cachedBC.barycentricCoords;
						let a=bcCoord[0], b = bcCoord[1], c=bcCoord[2], d=bcCoord[3];
						let p0=Ps[0], p1=Ps[1], p2=Ps[2], p3=Ps[3];
						let q0=Qs[0], q1=Qs[1], q2=Qs[2], q3=Qs[3];
						cachedP.x =p0.x*a+p1.x*b+p2.x*c+p3.x*d;
						cachedP.y =p0.y*a+p1.y*b+p2.y*c+p3.y*d;
						cachedP.z =p0.z*a+p1.z*b+p2.z*c+p3.z*d;	
						cachedQ.x =q0.x*a+q1.x*b+q2.x*c+q3.x*d; 
						cachedQ.y =q0.y*a+q1.y*b+q2.y*c+q3.y*d; 
						cachedQ.z =q0.z*a+q1.z*b+q2.z*c+q3.z*d; 
						cachedP.vsub(cachedQ,cachedV);
						this.reduceVertices(cachedBC.usedVertices);
					}
					else{
						//					printf("sub distance got penetration\n");
						if (cachedBC.degenerate){
							//如果点已经在表面上了，则正常
							this.cachedValidClosest = false;
						}
						else{
							this.cachedValidClosest = true;
							//degenerate case == false, penetration = true + zero
							cachedV.set(0,0,0);
						}
						break;
					}

					this.cachedValidClosest = cachedBC.isValid();
					//closest point origin from tetrahedron
				}
				break;
				default:
						this.cachedValidClosest = false;
			}
		}
		return this.cachedValidClosest;
	}
}