import { RenderState } from "laya/d3/core/material/RenderState";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Color } from "laya/d3/math/Color";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Sprite } from "laya/display/Sprite";
import { RenderTexture2D } from "laya/resource/RenderTexture2D";
import { Quaternion } from "../math/Quaternion";
import {Vec3} from "../math/Vec3";
import { BODYTYPE } from "../objects/Body";
import {Capsule} from "../shapes/Capsule";
import {Plane} from "../shapes/Plane";
import {Shape, SHAPETYPE } from "../shapes/Shape";
import { Voxel } from "../shapes/Voxel";
import {World, IPhyRender, setPhyRender } from "../world/World";
import { Box } from "../shapes/Box";
import { Sphere } from "../shapes/Sphere";
import { Trimesh } from "../shapes/Trimesh";

let col1 = new Color();
let p1 = new Vector3();
let p2 = new Vector3();
let p3 = new Vector3();

/**
 * 无交互界面，已经变成图片了
 */
export class UIPlane extends MeshSprite3D {
	plane: MeshSprite3D;
	mat: UnlitMaterial;
	texture2D: RenderTexture2D;
	s:Sprite|null;
	constructor(s: Sprite | null) {
		super(PrimitiveMesh.createPlane(1, 1));
		this.s=s;
		this.plane = this;
		//this.plane.transform.rotate(new Vector3(90, 0, 0), true, true);
		//scene.addChild(this.plane);
		this.mat = new UnlitMaterial();
		this.mat.renderMode = UnlitMaterial.RENDERMODE_TRANSPARENT;
		this.mat.cull = RenderState.CULL_NONE;
		this.meshRenderer.sharedMaterial = this.mat;

		//this.texture2D = new Texture2D(256, 256);
		//this.texture2D.loadImageSource(this.cav);
		s&&this.buildTex(s);
	}

	buildTex(s?: Sprite) {
		let sp = s||this.s;
		if(!sp)
			return;
		let rt=this.texture2D;
		if(sp.getRepaint() ||!rt){
			let bound = sp.getBounds();
			if(bound.width==0||bound.height==0)
				return;

			if(!rt || rt.width!=bound.width || rt.height!=bound.height ){
				rt = this.texture2D = new RenderTexture2D(bound.width,bound.height);
			}
			sp.drawToTexture(bound.width+1, bound.height+1, 0, 0,rt);
			(sp as any)._repaint = 0; //TODO 这个应该在引擎做
			//给材质贴图
			this.mat.albedoTexture = rt;// tex.bitmap as Texture2D;
		}
	}
}
/**
 * 渲染物理线框
 */
export class PhyRender extends IPhyRender {
	sce: Scene3D;
	phyworld: World;
	drawAllShape = true;
	renders: PixelLineSprite3D[] = [];
	posInd = new Vector3();
	posIndColor = Color.BLUE;
	setPosInd = false;
	enable=true;

	/** 持久显示的点，直到clear */
	private persistPoint: Vec3[] = [];
	/** 持久显示的矢量。格式是 vec,pos,vec,pos, ... 直到clear */
	private persistVec: Vec3[] = [];
	ui1: UIPlane = new UIPlane(new Sprite());

	static inst: PhyRender;
	constructor(sce: Scene3D, world: World) {
		super();
		this.sce = sce;
		this.phyworld = world;
		world.phyRender = this;
		let r = new PixelLineSprite3D(1024 * 100);
		this.renders.push(r);
		sce.addChild(r);
		PhyRender.inst = this;
		setPhyRender(this);
		// 添加到window上，方便调试
		(window as any).phyr = this;
		(window as any).showPoint = this.addPersistPoint.bind(this);
		(window as any).showVec = this.addPersistVec.bind(this);
		(window as any).clearPhy = this.clearPersist.bind(this);

		let p1 = this.ui1.s;
		if(p1){
			p1.graphics.drawRect(0, 0, 100, 100, 'gray', 'blue');
			p1.graphics.fillText('Test', 0, 0, '20px Arial', 'green', 'left');
			this.ui1.buildTex();
		}

		sce.addChild(this.ui1);
	}

	getInst(){
		return PhyRender.inst;
	}

	showPos(x: f32, y: f32, z: f32) {
		if(!this.enable)
			return;

		this.posInd.setValue(x, y, z);
		this.setPosInd = true;
	}

	/**
	 * 在st位置显示dir矢量
	 * @param stx 
	 * @param sty 
	 * @param stz 
	 * @param dirx 
	 * @param diry 
	 * @param dirz 
	 * @param color 
	 */
	addVec(stx: number, sty: number, stz: number, dirx: number, diry: number, dirz: number, color: number): void {
		if(!this.enable)
			return;

		let r = this.renders[0];
		p1.setValue(stx, sty, stz);
		p2.setValue(dirx, diry, dirz);
		Vector3.add(p1, p2, p3);
		col1.r = ((color >> 16) & 0xff) / 255;
		col1.g = ((color >> 8) & 0xff) / 255;
		col1.b = ((color) & 0xff) / 255;
		r.addLine(p1, p3, col1, col1);
	}

	addVec1(st:Vec3, dir:Vec3,scale:number,color:number){
		if(!this.enable)
			return;

		this.addVec(st.x,st.y,st.z, dir.x*scale,dir.y*scale,dir.z*scale,color);
	}

	addPersistPoint(x: number|Vec3, y?: number, z?: number, name?: string) {
		if(!this.enable)
			return 0;

		if((x as Vec3).x!=undefined){
			this.persistPoint.push( (x as Vec3).clone());	
		}else
			this.persistPoint.push(new Vec3(x as number, y, z));
		return this.persistPoint.length - 1;
	}
	delPersistPoint(id: i32) {
		this.persistPoint = this.persistPoint.splice(id, 1);
	}
	addPersistVec(dx: number|Vec3, dy: number|Vec3, dz?: number, x: number = 0, y: number = 0, z: number = 0, name?: string) {
		if(!this.enable)
			return 0;

		if((dx as Vec3).x!=undefined){
			this.persistVec.push( (dx as Vec3).clone() ,(dy as Vec3).clone());	
		}else{
			this.persistVec.push(new Vec3(dx as number, dy as number, dz), new Vec3(x, y, z));
		}
		return this.persistVec.length / 2 - 1;
	}
	delPersistVec(id: i32) {
		this.persistVec = this.persistVec.splice(id * 2, 2)
	}
	clearPersist() {
		this.persistPoint.length = 0;
		this.persistVec.length = 0;
	}

	addSeg(stx: number, sty: number, stz: number, edx: number, edy: number, edz: number, color: number): void {
		if(!this.enable)
			return;

		let r = this.renders[0];
		p1.setValue(stx, sty, stz);
		p2.setValue(edx, edy, edz);
		col1.r = ((color >> 16) & 0xff) / 255;
		col1.g = ((color >> 8) & 0xff) / 255;
		col1.b = ((color) & 0xff) / 255;
		r.addLine(p1, p2, col1, col1);
	}

	addSegV3(st: Vec3, ed: Vec3,color: number): void {
		if(!this.enable)
			return;
		this.addSeg(st.x,st.y,st.z,ed.x,ed.y,ed.z,color);
	}


	/**
	 * 显示一个点
	 * @param px 
	 * @param py 
	 * @param pz 
	 * @param color 
	 */
	addPoint(px: number, py: number, pz: number, color: number): void {
		if(!this.enable)
			return;

		let axlen = 0.4;
		let hAxlen = 0.2;
		this.addVec(px - hAxlen, py, pz, axlen, 0, 0, color);
		this.addVec(px, py - hAxlen, pz, 0, axlen, 0, color);
		this.addVec(px, py, pz - hAxlen, 0, 0, axlen, color);
	}
	addPoint1(p:Vec3,color:number):void{
		if(!this.enable)
			return;

		this.addPoint(p.x,p.y,p.z,color);
	}

	drawLine(pts: Vec3[], color: number): void {
		if(!this.enable)
			return;

		for (let i = 0; i < pts.length - 1; i++) {
			let p1 = pts[i];
			let p2 = pts[i + 1];
			this.addSeg(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, color);
		}
	}

	// 画笼子的竖线
	drawLine1(pts: Vec3[], h: Vec3, color: number): void {
		if(!this.enable)
			return;

		for (let i = 0; i < pts.length - 1; i++) {
			let p1 = pts[i];
			this.addSeg(p1.x, p1.y, p1.z, p1.x + h.x, p1.y + h.y, p1.z + h.z, color);
		}
	}

	addAABB(min:Vec3, max:Vec3, color:number){
		if(!this.enable)
			return;

		this.addSeg(min.x,min.y,min.z, max.x, min.y, min.z, color);
		this.addSeg(max.x, min.y, min.z, max.x, min.y, max.z, color);
		this.addSeg(max.x, min.y, max.z, min.x, min.y, max.z, color);
		this.addSeg(min.x, min.y, max.z, min.x, min.y, min.z, color);

		this.addSeg(min.x,max.y,min.z, max.x, max.y, min.z, color);
		this.addSeg(max.x, max.y, min.z, max.x, max.y, max.z, color);
		this.addSeg(max.x, max.y, max.z, min.x, max.y, max.z, color);
		this.addSeg(min.x, max.y, max.z, min.x, max.y, min.z, color);


		this.addSeg(min.x,min.y,min.z, min.x,max.y,min.z, color);
		this.addSeg(max.x, min.y, min.z, max.x, max.y, min.z, color);
		this.addSeg(max.x, min.y, max.z, max.x, max.y, max.z, color);
		this.addSeg(min.x, min.y, max.z, min.x, max.y, max.z, color);
	}

	stepStart(): void {
		if(!this.enable)
			return;
		this.renders.forEach(r => {
			r.clear();
		})

		// 坐标轴
		let r = this.renders[0];
		let origin = new Vector3();
		r.addLine(origin, new Vector3(10, 0, 0), Color.RED, Color.RED);
		r.addLine(origin, new Vector3(0, 10, 0), Color.GREEN, Color.GREEN);
		r.addLine(origin, new Vector3(0, 0, 10), Color.BLUE, Color.BLUE);

		//某个指示器
		if (this.setPosInd) {
			let pi = this.posInd;
			let pic = this.posIndColor;
			r.addLine(pi, new Vector3(pi.x + 3, pi.y, pi.z), pic, pic);
			r.addLine(pi, new Vector3(pi.x, pi.y + 3, pi.z), pic, pic);
			r.addLine(pi, new Vector3(pi.x, pi.y, pi.z + 3), pic, pic);
		}

		this.persistPoint.forEach(v => {
			this.addPoint(v.x, v.y, v.z, 0xff);
		});
		let pv = this.persistVec;
		for (let i = 0, l = pv.length / 2; i < l; i++) {
			let v = pv[i * 2];
			let p = pv[i * 2 + 1];
			this.addVec(p.x, p.y, p.z, v.x, v.y, v.z, 0xff00);
		}

		let ui1 = this.ui1;
		ui1.buildTex();
	}

	stepEnd(): void {

	}

	internalStep() {
		if(!this.enable)
			return;

		let world = this.phyworld;
		let bodies = world.bodies;
		let wq = new Quaternion();
		let wpos = new Vec3();
		bodies.forEach((b, i) => {
			if(!b.dbgShow)
				return;
			let shapes = b.shapes;
			b.type & BODYTYPE.KINEMATIC;
			b.sleepState;
			shapes.forEach((s, si) => {
				let shapeq = b.shapeOrientations[si];
				if(shapeq){
					b.quaternion.mult(shapeq, wq); // 计算世界坐标系的朝向
				}else{
					wq.copy(b.quaternion);
				}

				let shapeoff = b.shapeOffsets[si];
				if(shapeoff){
					b.quaternion.vmult(shapeoff, wpos);    // 把shape的偏移用四元数变换一下
					wpos.vadd(b.position, wpos);    // 世界空间的位置
				}else{
					wpos.copy( b.position);
				}
				this.showShape(s, wpos, wq);
			});

		});
		// 所有的body的所有的shape
		// sleep的要偏暗

		// 所有的碰撞点，碰撞法线

		// body的私有信息

	}

	static boxVert=[new Vec3(),new Vec3(), new Vec3(), new Vec3(),new Vec3(),new Vec3(),new Vec3(),new Vec3()];
	transBox(halfExt:Vec3,pos:Vec3,quat:Quaternion){
		let v= PhyRender.boxVert;
		
		v[0].set(-halfExt.x,-halfExt.y,halfExt.z);
		v[1].set(-halfExt.x,-halfExt.y,-halfExt.z);
		v[2].set(halfExt.x,-halfExt.y,-halfExt.z);
		v[3].set(halfExt.x,-halfExt.y,halfExt.z);

		v[4].set(-halfExt.x,halfExt.y,halfExt.z);
		v[5].set(-halfExt.x,halfExt.y,-halfExt.z);
		v[6].set(halfExt.x,halfExt.y,-halfExt.z);
		v[7].set(halfExt.x,halfExt.y,halfExt.z);
		
		v.forEach( cv=>{
			quat.vmult(cv,cv);
			cv.vadd(pos,cv);
		});
		return v;
	}
	
	showShape(shape: Shape, pos: Vec3, quat: Quaternion): void {
		let color=0xff0000ff;
		switch (shape.type) {
			case SHAPETYPE.BOX:
				{
					let box = shape as Box;
					let	vs=this.transBox(box.halfExtents,pos,quat);
					this.addSegV3(vs[0],vs[1],color);this.addSegV3(vs[1],vs[2],color);this.addSegV3(vs[2],vs[3],color);this.addSegV3(vs[3],vs[0],color);
					this.addSegV3(vs[4],vs[5],color);this.addSegV3(vs[5],vs[6],color);this.addSegV3(vs[6],vs[7],color);this.addSegV3(vs[7],vs[4],color);
					this.addSegV3(vs[0],vs[4],color);this.addSegV3(vs[1],vs[5],color);this.addSegV3(vs[2],vs[6],color);this.addSegV3(vs[3],vs[7],color);
				}
				break;
			case SHAPETYPE.SPHERE:
				{
					let sph = shape as Sphere;
					let	vs=this.transBox(new Vec3(sph.radius,sph.radius,sph.radius),pos,quat);
					this.addSegV3(vs[0],vs[1],color);this.addSegV3(vs[1],vs[2],color);this.addSegV3(vs[2],vs[3],color);this.addSegV3(vs[3],vs[0],color);
					this.addSegV3(vs[4],vs[5],color);this.addSegV3(vs[5],vs[6],color);this.addSegV3(vs[6],vs[7],color);this.addSegV3(vs[7],vs[4],color);
					this.addSegV3(vs[0],vs[4],color);this.addSegV3(vs[1],vs[5],color);this.addSegV3(vs[2],vs[6],color);this.addSegV3(vs[3],vs[7],color);
				}
				break;
			case SHAPETYPE.PLANE:
				this.createPlaneLine(shape as Plane, pos, quat);
				break;
			case SHAPETYPE.CYLINDER:
				break;
			case SHAPETYPE.CAPSULE:
				this.createCapsuleLine(shape as Capsule, pos, quat);
				break;
			case SHAPETYPE.CONVEXPOLYHEDRON:
				break;
			case SHAPETYPE.COMPOUND:
				break;
			case SHAPETYPE.HEIGHTFIELD:
				break;
			case SHAPETYPE.TRIMESH:
				let tri = shape as Trimesh;
				let vpos = tri.vertices;
				let ind = tri.indices;
				var facenum = ind.length/3;
				for(let i=0; i<facenum; i++){
					let p1 = ind[i*3]*3;
					let p2 = ind[i*3+1]*3;
					let p3 = ind[i*3+2]*3;
					let v1 = new Vec3(vpos[p1],vpos[p1+1],vpos[p1+2]);
					this.transVec3(v1,pos,quat,v1);
					let v2 = new Vec3(vpos[p2],vpos[p2+1],vpos[p2+2]);
					this.transVec3(v2,pos,quat,v2);
					let v3 = new Vec3(vpos[p3],vpos[p3+1],vpos[p3+2]);
					this.transVec3(v3,pos,quat,v3);

					this.addSegV3(v1,v2,color);
					this.addSegV3(v2,v3,color);
					this.addSegV3(v1,v3,color);

				}
				break;
			case SHAPETYPE.VOXEL:
				{
					let vox = shape as Voxel;
					vox.pos = pos;
					vox.quat = quat;
					//vox.scale =;
					vox.updateAABB();
					this.addAABB(vox.aabbmin, vox.aabbmax, 0xff0000);
					//vox.boundingSphereRadius
				}
				break;
		}
	}

    /**
     * 
     * @param vin 局部坐标位置
     * @param pos 对象在世界空间的坐标
     * @param q    对象在世界空间的朝向
     * @param vout 转换成世界空间的点
     */
	transVec3(vin: Vec3, pos: Vec3, q: Quaternion, vout: Vec3): Vec3 {
		q.vmult(vin, vout);
		vout.vadd(pos, vout);
		return vout;
	}

	createCapsuleLine(cap: Capsule, pos: Vec3, q: Quaternion): void {
		let seg1: i32 = 16;
		let h = cap.height;
		let r = cap.radius;//*1.2;
		let i: i32 = 0;
		let pts: Vec3[] = [];
		pts.length = seg1 + 1;
		for (i = 0; i < pts.length; i++) {
			pts[i] = new Vec3();
		}
		for (i = 0; i <= seg1; i++) {
			let ang = Math.PI * 2 * i / seg1;
			let pt = new Vec3(r * Math.cos(ang), r * Math.sin(ang), h / 2);
			this.transVec3(pt, pos, q, pt);
			pts[i].copy(pt);
		}
		this.drawLine(pts, 0xffff0000);
		let hdir = new Vec3(0, 0, -h);
		q.vmult(hdir, hdir);
		this.drawLine1(pts, hdir, 0xffff0000);

		for (i = 0; i <= seg1; i++) {
			let ang = Math.PI * 2 * i / seg1;
			let pt = new Vec3(r * Math.cos(ang), r * Math.sin(ang), -h / 2);
			this.transVec3(pt, pos, q, pt);
			pts[i].copy(pt);
		}
		this.drawLine(pts, 0xffff0000);
	}

	createPlaneLine(plane: Plane, pos: Vec3, q: Quaternion): void {
		//let norm = new Vec3(0,0,1);
		//let wnorm = q.vmult(norm,norm);

	}

	showUI(s: Sprite, x: number, y: number, z: number) {

	}
}

