import { Mat3 } from '../math/Mat3.js';
import { Quaternion } from '../math/Quaternion.js';
import { Transform } from '../math/Transform.js';
import { Vec3 } from '../math/Vec3.js';
import { ConvexPolyhedron } from './ConvexPolyhedron.js';
import { MinkowskiShape } from './MinkowskiShape.js';
import { HitPointInfo, Shape, SHAPETYPE } from './Shape.js';
import { Sphere } from './Sphere.js';
import { Voxel } from './Voxel.js';

// v可以与target相同
export function quat_AABBExt_mult(q:Quaternion, v:Vec3, target = new Vec3()) {
    const {x,y,z} = v;
    const qx = q.x;
    const qy = q.y;
    const qz = q.z;
    const qw = q.w;

    let qx2=qx*qx, qy2=qy*qy, qz2=qz*qz, qw2=qw*qw;
    let xy=2*qx*qy,zw=2*qz*qw,yw=2*qy*qw,xw=2*qx*qw,xz=2*qx*qz,yz=2*qy*qz;
    // q*v
    //const ix = qw * x + qy * z - qz * y;
    //const iy = qw * y + qz * x - qx * z;
    //const iz = qw * z + qx * y - qy * x;
    //const iw = -qx * x - qy * y - qz * z;

    //target.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    //target.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    //target.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    // 其实就相当于把四元数转成矩阵了
    //(qw*x - qz*y + qy*z )*qw + (qx*x + qy*y + qz*z)*qx - (qz*x + qw*y  - qx*z)*qz + (-qy*x + qx*y + qw*z  )*qy
    // Math.abs((qw*qw + qx*qx - qz*qz -qy*qy)*x) +Math.abs(( 2*qx*qy -2*qz*qw)*y) + Math.abs((2*qy*qw + 2*qx*qz )*z);
    target.x = Math.abs((qw2 + qx2 - qz2 -qy2)*x) +Math.abs(( xy -zw)*y) + Math.abs((yw + xz )*z);
    //(qw*y + qz*x - qx*z)*qw + (-qx*x - qy*y - qz*z)*-qy + (qw*z + qx*y - qy*x)*-qx + (qw*x + qy*z - qz*y)*qz
    //target.y = Math.abs((2*qz*qw +2*qx*qy)*x) + Math.abs((qw*qw +qy*qy -qx*qx -qz*qz)*y) + Math.abs((-2*qx*qw +2*qy*qz)*z);
    target.y = Math.abs((zw +xy)*x) + Math.abs((qw2 +qy2 -qx2 -qz2)*y) + Math.abs((-xw +yz)*z);
    //(qw * z + qx * y - qy * x) * qw + (qx * x + qy * y + qz * z) * qz + (-qw * x - qy * z + qz * y) * qy + (qw * y + qz * x - qx * z) * qx;
    //target.z = Math.abs((-2*qy*qw   +2*qx*qz)*x) + Math.abs((2*qx*qw  +2*qy*qz ) *y) +  Math.abs((qw2 +qz2 -qy2 -qx2)*z);
    target.z = Math.abs((-yw   +xz)*x) + Math.abs((xw  +yz ) *y) +  Math.abs((qw2 +qz2 -qy2 -qx2)*z);

    return target;
}    

function _ptInBox(pt: Vec3, min: Vec3, max: Vec3) {
	return (pt.x >= min.x && pt.y < max.x &&
		pt.y >= min.y && pt.y < max.y &&
		pt.z >= min.z && pt.z < max.z);
}

function _ptInQuad(x:number,y:number, minx:number, miny:number, maxx:number, maxy:number):boolean{
	return (x>=minx && x<=maxx && y>=miny && y<=maxy);
}

var _segHitBox:number[]=new Array(4);
/** 射线与box检测的当前的碰撞点的个数。 */
var _segHitBoxNum=0;

/**
 * A 3d box shape.
 */
export class Box extends Shape implements MinkowskiShape {
	halfExtents: Vec3;
	origHalfExt:Vec3|null = null;		// 原始大小。如果有缩放，则这个就会有值

    /**
     * Used by the contact generator to make contacts with other convex polyhedra for example
     * 把BOX转成convex
     */
	convexPolyhedronRepresentation:ConvexPolyhedron;
	minkowski=this;

    constructor(halfExtents: Vec3) {
        super();
        this.type = SHAPETYPE.BOX;
        this.halfExtents = halfExtents;
        this.updateConvexPolyhedronRepresentation();
        this.updateBndSphR();
	}
	
	getSupportVertex(dir: Vec3, sup: Vec3): Vec3 {
		let sz = this.halfExtents;
		sup.x = dir.x>=0?sz.x:-sz.x;
		sup.y = dir.y>=0?sz.y:-sz.y;
		sup.z = dir.z>=0?sz.z:-sz.z;
		return sup;
	}	
	getSupportVertexWithoutMargin(dir: Vec3, sup: Vec3): Vec3 {
		let sz = this.halfExtents;
		let margin =this.margin;
		let lx =sz.x-margin; let ly=sz.y-margin; let lz=sz.z-margin;
		sup.x = dir.x>=0?lx:-lx;
		sup.y = dir.y>=0?ly:-ly;
		sup.z = dir.z>=0?lz:-lz;
		return sup;
	}

    onPreNarrowpase(stepId: number,pos:Vec3,quat:Quaternion): void {}
    /**
     * Updates the local convex polyhedron representation used for some collisions.
     */
    updateConvexPolyhedronRepresentation() {
        const sx = this.halfExtents.x;
        const sy = this.halfExtents.y;
        const sz = this.halfExtents.z;
        const V = Vec3;

        const vertices = [
            new V(-sx, -sy, -sz),
            new V(sx, -sy, -sz),
            new V(sx, sy, -sz),
            new V(-sx, sy, -sz),
            new V(-sx, -sy, sz),
            new V(sx, -sy, sz),
            new V(sx, sy, sz),
            new V(-sx, sy, sz)
        ];

        const indices = [
            [3, 2, 1, 0], // -z
            [4, 5, 6, 7], // +z
            [5, 4, 0, 1], // -y
            [2, 3, 7, 6], // +y
            [0, 4, 7, 3], // -x
            [1, 2, 6, 5], // +x
        ];

        /*
        const axes = [
            new V(0, 0, 1),
            new V(0, 1, 0),
            new V(1, 0, 0)
        ];
        */

        const h = new ConvexPolyhedron(vertices, indices);
        this.convexPolyhedronRepresentation = h;
        h.material = this.material;
    }

    calculateLocalInertia(mass: number, target = new Vec3()) {
        Box.calculateInertia(this.halfExtents, mass, target);
        return target;
    }

    /**
     * Get the box 6 side normals
     * @param       sixTargetVectors An array of 6 vectors, to store the resulting side normals in.
     * @param quat             Orientation to apply to the normal vectors. If not provided, the vectors will be in respect to the local frame.
     */
    getSideNormals(sixTargetVectors: Vec3[], quat: Quaternion) {
        const sides = sixTargetVectors;
        const ex = this.halfExtents;
        sides[0].set(ex.x, 0, 0);
        sides[1].set(0, ex.y, 0);
        sides[2].set(0, 0, ex.z);
        sides[3].set(-ex.x, 0, 0);
        sides[4].set(0, -ex.y, 0);
        sides[5].set(0, 0, -ex.z);

        if (quat !== undefined) {
            for (let i = 0; i !== sides.length; i++) {
                quat.vmult(sides[i], sides[i]);
            }
        }

        return sides;
    }

    volume() {
        return 8.0 * this.halfExtents.x * this.halfExtents.y * this.halfExtents.z;
    }

    updateBndSphR() {
        this.boundSphR = this.halfExtents.length();
    }

    forEachWorldCorner(pos: Vec3, quat: Quaternion, callback: (x: number, y: number, z: number) => void) {
        const e = this.halfExtents;
        const corners = [[e.x, e.y, e.z],
        [-e.x, e.y, e.z],
        [-e.x, -e.y, e.z],
        [-e.x, -e.y, -e.z],
        [e.x, -e.y, -e.z],
        [e.x, e.y, -e.z],
        [-e.x, e.y, -e.z],
        [e.x, -e.y, e.z]];
        for (let i = 0; i < corners.length; i++) {
            worldCornerTempPos.set(corners[i][0], corners[i][1], corners[i][2]);
            quat.vmult(worldCornerTempPos, worldCornerTempPos);
            pos.vadd(worldCornerTempPos, worldCornerTempPos);
            callback(worldCornerTempPos.x,
                worldCornerTempPos.y,
                worldCornerTempPos.z);
        }
    }

    /*
    private _rotateExtents(extents:Vector3, rotation:Matrix4x4, out:Vector3):void {
        var extentsX:number = extents.x;
        var extentsY:number = extents.y;
        var extentsZ:number = extents.z;
        var matElements:Float32Array = rotation.elements;
        out.x = Math.abs(matElements[0] * extentsX) + Math.abs(matElements[4] * extentsY) + Math.abs(matElements[8] * extentsZ);
        out.y = Math.abs(matElements[1] * extentsX) + Math.abs(matElements[5] * extentsY) + Math.abs(matElements[9] * extentsZ);
        out.z = Math.abs(matElements[2] * extentsX) + Math.abs(matElements[6] * extentsY) + Math.abs(matElements[10] * extentsZ);
    } 
    */   


    static boxext1=new Vec3();
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3) {
        const e = this.halfExtents;
        let newext = Box.boxext1;
        quat_AABBExt_mult(quat,e,newext);
        pos.vsub(newext,min);
        pos.vadd(newext,max);
        return ;
        /*
        worldCornersTemp[0].set(e.x, e.y, e.z);
        worldCornersTemp[1].set(-e.x, e.y, e.z);
        worldCornersTemp[2].set(-e.x, -e.y, e.z);
        worldCornersTemp[3].set(-e.x, -e.y, -e.z);
        worldCornersTemp[4].set(e.x, -e.y, -e.z);
        worldCornersTemp[5].set(e.x, e.y, -e.z);
        worldCornersTemp[6].set(-e.x, e.y, -e.z);
        worldCornersTemp[7].set(e.x, -e.y, e.z);

        var wc = worldCornersTemp[0];
        quat.vmult(wc, wc);
        pos.vadd(wc, wc);
        max.copy(wc);
        min.copy(wc);
        for (let i = 1; i < 8; i++) {
            var wc = worldCornersTemp[i];
            quat.vmult(wc, wc);
            pos.vadd(wc, wc);
            const x = wc.x;
            const y = wc.y;
            const z = wc.z;
            if (x > max.x) {
                max.x = x;
            }
            if (y > max.y) {
                max.y = y;
            }
            if (z > max.z) {
                max.z = z;
            }

            if (x < min.x) {
                min.x = x;
            }
            if (y < min.y) {
                min.y = y;
            }
            if (z < min.z) {
                min.z = z;
            }
        }
        */
	}
	
	static orioff:Vec3 = new Vec3();
	/**
	 * 如果原点不在中心的包围盒的更新
	 * @param pos 
	 * @param quat 
	 * @param scale 
	 * @param min 	相对于原点的min
	 * @param max 	相对于原点的max
	 */
    static calculateWorldAABB1(pos: Vec3, quat: Quaternion, scale:Vec3, min: Vec3, max: Vec3, outmin:Vec3, outmax:Vec3) {
		let ext = Box.boxext1;
		ext.x = (max.x-min.x)/2;
		ext.y = (max.y-min.y)/2;
		ext.z = (max.z-min.z)/2;
		let off = Box.orioff;
		off.x = (max.x+min.x)/2;
		off.y = (max.y+min.y)/2;
		off.z = (max.z+min.z)/2;
		quat.vmult(off,off).vmul(scale,off); // 把这个偏移旋转一下  rot(off)*scale
		quat_AABBExt_mult(quat,ext,ext).vmul(scale,ext);// 旋转原点在中心的包围盒	rot(ext)*scale
        pos.vsub(ext,outmin).vadd(off,outmin);	// 计算原点在中心的包围盒	(pos+ext)+off
		pos.vadd(ext,outmax).vadd(off,outmax);	// (pos-ext)+off
        return ;
	}	
	
	//原始的包围盒计算，用来验证算法的
    static calculateWorldAABB11(pos: Vec3, quat: Quaternion, scale:Vec3, min: Vec3, max: Vec3, outmin:Vec3, outmax:Vec3):void {
		let conr=new Array<Vec3>(8).fill(new Vec3());
		conr.forEach((v,i,arr)=>{conr[i]=new Vec3();});
        conr[0].set(min.x, min.y, min.z);
        conr[1].set(min.x, max.y, min.z);
        conr[2].set(min.x, max.y, max.z);
        conr[3].set(min.x, min.y, max.z);
        conr[4].set(max.x, min.y, min.z);
        conr[5].set(max.x, max.y, min.z);
        conr[6].set(max.x, max.y, max.z);
        conr[7].set(max.x, min.y, max.z);

		// 第一个点
        var wc = conr[0];
        quat.vmult(wc, wc).vmul(scale,wc);
        pos.vadd(wc, wc);
        outmax.copy(wc);
		outmin.copy(wc);
		// 剩下的7个点
        for (let i = 1; i < 8; i++) {
            var wc = conr[i];
            quat.vmult(wc, wc).vmul(scale,wc);
            pos.vadd(wc, wc);
            const x = wc.x;
            const y = wc.y;
            const z = wc.z;
            if (x > outmax.x) {
                outmax.x = x;
            }
            if (y > outmax.y) {
                outmax.y = y;
            }
            if (z > outmax.z) {
                outmax.z = z;
            }

            if (x < outmin.x) {
                outmin.x = x;
            }
            if (y < outmin.y) {
                outmin.y = y;
            }
            if (z < outmin.z) {
                outmin.z = z;
            }
        }
    }	

	setScale(x:number,y:number,z:number, recalcMassProp:boolean=false){
		let orig = this.origHalfExt;
		let ext = this.halfExtents;
		if(x!=1||y!=1||z!=1){
			if(!orig){
				this.origHalfExt = orig = new Vec3();
				orig.copy(ext);
			}
			// 注意处理负的缩放的问题 .TODO 先临时处理负的情况，以后遇到实际问题再说
			ext.set(Math.abs(orig.x*x),Math.abs(orig.y*y),Math.abs(orig.z*z));
		}else{
			if(orig){
				ext.copy(orig);
				this.origHalfExt=null;
			}
		}
        this.updateConvexPolyhedronRepresentation();
        this.updateBndSphR();
	}

    static calculateInertia(halfExtents: Vec3, mass: number, target: Vec3) {
        const e = halfExtents;
        target.x = 1.0 / 12.0 * mass * (2 * e.y * 2 * e.y + 2 * e.z * 2 * e.z);
        target.y = 1.0 / 12.0 * mass * (2 * e.x * 2 * e.x + 2 * e.z * 2 * e.z);
        target.z = 1.0 / 12.0 * mass * (2 * e.y * 2 * e.y + 2 * e.x * 2 * e.x);
    }
    
    /**
     * 球与本地空间的盒子的碰撞信息
     * 这个与sphere.ts中的hitbox有点重复了
     * @param pos 球的位置
     * @param r     球的半径
     * @param hitpos1   球的碰撞点 
     * @param hitpos2   盒子的碰撞点
     * @param hitNormal  碰撞法线，推开球的方向
     */
    static sphereHitBox(pos:Vec3, r:number, halfext:Vec3, hitpos:Vec3, hitpost2:Vec3, hitNormal:Vec3):f32{
		/*
        let dir=0;
        let pdist=[];
        let szx = halfext.x;
        let szy = halfext.y;
        let szz = halfext.z;
        let pxd = pos.x-szx;
        let nxd = szx+szx;
        let pyd = pos.y-szy;
        let nyd = pos.y+szy;
        let pzd = pos.z-szz;
		let nzd = pos.z+szz;
		*/
        return -1;
    }

    /**
     * 
     * @param myPos 
     * @param myQ 
     * @param voxel 
     * @param voxPos 
     * @param voxQuat 
     * @param hitpoints  其中的法线是推开voxel的
     * @param justtest 
     */
	hitVoxel(myPos: Vec3, myQ:Quaternion, voxel:Voxel, voxPos: Vec3, voxQuat: Quaternion, hitpoints:HitPointInfo[], justtest: boolean): boolean {
        // 把voxel转换到box空间
        let rPos = hitVoxelTmpVec1;
        let rMat = hitVoxelTmpMat;
        Transform.posQToLocalMat(myPos,myQ,voxPos,voxQuat, rPos,rMat);  //TODO 这个还没有验证
        // 先用最笨的方法验证流程
		let voxdt = voxel.voxData.data;
		if(!voxdt)
			return false;
        let gridw = voxel.gridw;//.voxData.gridsz;
        let r = gridw/2;
        let min = voxel.voxData.aabbmin;    //原始包围盒
        //let max = voxel.voxData.aabbmax;
        let tmpV = new Vec3();  //xyz格子坐标
        let hitpos = new Vec3();
        let hitpos1 = new Vec3();
        let hitnorm = new Vec3();
        let boxpos = new Vec3(0,0,0);
        let boxQ = new Quaternion(0,0,0,1);
        let hit = false;
        
        for( let i=0,sz=voxdt.length; i<sz; i++){
            let dt = voxdt[i];
            // 把xyz映射到box空间
            tmpV.set(dt.x+0.5,dt.y+0.5,dt.z+0.5);// 在格子的中心
            min.addScaledVector(gridw,tmpV,tmpV);// tmpV = min + (vox.xyz+0.5)*gridw
            //tmpV现在是在vox空间内的一个点
            //转换到box空间
            rMat.vmult(tmpV,tmpV);
            tmpV.vadd(rPos,tmpV);
            //tmpV现在是box空间的点了，计算碰撞信息
            // 这里的法线是推开sphere的
            let deep = Sphere.hitBox(tmpV, r, this.halfExtents,boxpos,boxQ,hitpos,hitpos1,hitnorm,justtest);
            if(deep<0)
                continue;
            if(justtest)
                return true;
            //转换回世界空间
            let hi = new HitPointInfo();
            myQ.vmult(hitpos, hi.posi); myPos.vadd(hi.posi,hi.posi);
            myQ.vmult(hitpos1,hi.posj); myPos.vadd(hi.posj,hi.posj);
            myQ.vmult(hitnorm,hi.normal);
            hitpoints.push(hi);
            hit=true;
        }
		return hit;
	}

	hitAAQuad(mypos:Vec3, myQ:Quaternion, minx:number,miny:number, maxx:number,maxy:number){
	}

	/**
	 * 收集射线检测的结果，排除重复点，一旦到达两个碰撞点就给newst和newed赋值，并返回true
	 * @param t 碰撞点的时间
	 * @param x 碰撞点的位置
	 * @param y 
	 * @param z 
	 * @param newst 
	 * @param newed 
	 */
	private static _rayHitBoxChkHitInfo(t:number,x:number,y:number,z:number,newst:Vec3, newed:Vec3):boolean{
		// 只要找到两个有效交点就停止
		let hitinfo = _segHitBox;

		if(_segHitBoxNum==0 && t>=0&&t<=1){//第一个点
			hitinfo[0]=t; hitinfo[1]=x; hitinfo[2]=y; hitinfo[3]=z;
			_segHitBoxNum++;
			return false;
		}
		// 在有效范围内，且与已有的不重合，则是第二个点
		if(t>=0&&t<=1 && Math.abs(t-hitinfo[0])>1e-6){
			if(t>hitinfo[0]){//时间更靠后
				newst.set(hitinfo[1],hitinfo[2],hitinfo[3]);
				newed.set(x,y,z);
			}else{// 时间更靠前，颠倒st，ed
				newst.set(x,y,z);
				newed.set(hitinfo[1],hitinfo[2],hitinfo[3]);
			}
			return true;
		}
		return false;
	}

	/**
	 * 计算线段和box的两个交点。如果起点或者终点在内部，则直接使用。  
	 * 返回false 则无碰撞
	 * @param st 
	 * @param ed 
	 * @param min 
	 * @param max 
	 * @param newSt 
	 * @param newEd 
	 */
	static rayHitBox(st: Vec3, ed: Vec3, min: Vec3, max: Vec3, newSt: Vec3, newEd: Vec3):boolean {
		let hitinfo = _segHitBox;
		_segHitBoxNum=0;
		
		// 计算与6个面的交点，然后判断每个交点是否在范围内
		if (_ptInBox(st, min, max)) {//起点的判断
			Box._rayHitBoxChkHitInfo(0,st.x,st.y,st.z,newSt,newEd);
		}
		if (_ptInBox(ed, min, max)) {//终点的判断
			if(Box._rayHitBoxChkHitInfo(1,ed.x,ed.y,ed.z,newSt,newEd)){
				return true;
			}
		}

		let dirx = ed.x - st.x;
		let diry = ed.y - st.y;
		let dirz = ed.z - st.z;
		let eps = 1e-10;

		let t = 0;
		let hitx = 0;
		let hity = 0;
		let hitz = 0;
		// minx
		// maxx
		if (Math.abs(dirx) > eps) {
			t = (min.x - st.x) / dirx;
			if (t > 0 && t < 1) {
				hity = st.y + diry * t;
				hitz = st.z + dirz * t;
				if(_ptInQuad(hity,hitz,min.y,min.z,max.y,max.z)){
					if(Box._rayHitBoxChkHitInfo(t,min.x,hity,hitz,newSt,newEd)){
						return true;
					}
				}
			}

			t = (max.x - st.x) / dirx;
			if (t > 0 && t < 1) {
				hity = st.y + diry * t;
				hitz = st.z + dirz * t;
				if(_ptInQuad(hity,hitz,min.y,min.z,max.y,max.z)){
					if(Box._rayHitBoxChkHitInfo(t,max.x,hity,hitz,newSt,newEd)){
						return true;
					}
				}
			}
		}

		// miny
		// maxy
		if (Math.abs(diry) > eps) {
			t = (min.y - st.y) / diry;
			if(t>0&&t<1){
				hitx=st.x+dirx*t;
				hitz=st.z+dirz*t;
				if(_ptInQuad(hitx,hitz,min.x,min.z,max.x,max.z)){
					if(Box._rayHitBoxChkHitInfo(t,hitx,min.y,hitz,newSt,newEd)){
						return true;
					}
				}
			}
			t = (max.y - st.y) / diry;
			if(t>0&&t<1){
				hitx=st.x+dirx*t;
				hitz=st.z+dirz*t;
				if(_ptInQuad(hitx,hitz,min.x,min.z,max.x,max.z)){
					if(Box._rayHitBoxChkHitInfo(t,hitx,max.y,hitz,newSt,newEd)){
						return true;
					}
				}
			}
		}
		// minz
		// maxz
		if (Math.abs(dirz) > eps) {
			t = (min.z - st.z) / dirz;
			if(t>0&&t<1){
				hitx=st.x+dirx*t;
				hity=st.y+diry*t;
				if(_ptInQuad(hitx,hity,min.x,min.y,max.x,max.y)){
					if(Box._rayHitBoxChkHitInfo(t,hitx,hity,min.z,newSt,newEd)){
						return true;
					}
				}
			}
			t = (max.z - st.z) / dirz;
			if(t>0&&t<1){
				hitx=st.x+dirx*t;
				hity=st.y+diry*t;
				if(_ptInQuad(hitx,hity,min.x,min.y,max.x,max.y)){
					if(Box._rayHitBoxChkHitInfo(t,hitx,hity,max.z,newSt,newEd)){
						return true;
					}
				}
			}
		}
		// 可能没有碰撞，或者只有一个碰撞点
		if(_segHitBoxNum==1){
			newSt.set(hitinfo[1],hitinfo[2],hitinfo[3]);
			newEd.set(newSt.x,newSt.y,newSt.z);
			return true;
		}
		return false;
	}
}


var worldCornerTempPos = new Vec3();
//const worldCornerTempNeg = new Vec3();
var hitVoxelTmpVec1 = new Vec3();
var hitVoxelTmpMat = new Mat3();