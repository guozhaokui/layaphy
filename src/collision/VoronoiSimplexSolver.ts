import Vec3 from "../math/Vec3";

class SubSimplexClosestResult{
	closestPointOnSimplex = new Vec3();
	//MASK for m_usedVertices
	//stores the simplex vertex-usage, using the MASK,
	// if m_usedVertices & MASK then the related vertex is used
	//btUsageBitfield m_usedVertices;
	usedVertices=0;
	barycentricCoords=[0,0,0,0];	// 重心坐标，最多到四面体，所以保留4个
	degenerate=false;

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
	vecW  =[new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];		// P-Q
	pointP=[new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];
	pointQ=[new Vec3(), new Vec3(), new Vec3(), new Vec3(), new Vec3()];

	/**  计算出的新的方向，也就是需要下一步扩展单形的方向 */
	cachedV=new Vec3();

	cachedP1=new Vec3();
	cachedP2=new Vec3();
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
		let num = this.vertNum;
		for(let i=0; i<num; i++){

		}
	}

	closest(newDir:Vec3):boolean{
		let succes = this.updateClosestVectorAndPoints();
		newDir.copy(this.cachedV);
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
		p1.copy(this.cachedP1);
		p2.copy(this.cachedP2);
	}

	/**
	 * 计算单形上最接近原点的点，以及朝向原点的方向
	 */
	updateClosestVectorAndPoints():boolean{
		if(this.needUpdate){
			this.needUpdate=false;
			this.cachedBC.reset();
			switch( this.vertNum){
				case 0: this.cachedValidClosest=false; break;
				case 1:	// 点
					throw '1point';
				break;
				case 2:	// 线段
					let cachedBC = this.cachedBC;
					let from = this.vecW[0];
					let to = this.vecW[1];
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
	
					let cachedP1 = this.cachedP1;
					let cachedP2 = this.cachedP2;
					let cachedV = this.cachedV;
					let pointsP = this.pointQ;
					let pointsQ = this.pointQ;
					// 更新p1,p2
					//cachedP1 = simplexPointsP[0] + t * (m_simplexPointsP[1] - m_simplexPointsP[0]);
					//cachedP2 = simplexPointsQ[0] + t * (m_simplexPointsQ[1] - m_simplexPointsQ[0]);
					
					cachedP1.vsub(cachedP2,cachedV);
					this.reduceVertices(cachedBC.usedVertices);
					this.cachedValidClosest = cachedBC.isValid();
				break;
				case 3:	// 三角形
				break;
				case 4: // 四面体
				break;

			}
		}
	}
}