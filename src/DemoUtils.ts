import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { CannonBody } from "./layawrap/CannonBody";
import { Material, Material as PhyMtl } from "./material/Material";
import { Quaternion } from "./math/Quaternion";
import { Vec3 } from "./math/Vec3";
import { Box } from "./shapes/Box";
import { Capsule } from "./shapes/Capsule";
import { ConvexPolyhedron } from "./shapes/ConvexPolyhedron";
import { Sphere } from "./shapes/Sphere";
import { Ray as PhyRay, hitworldOptions, RayMode } from "./collision/Ray";
import { Ray } from "laya/d3/math/Ray";
import { Camera } from "laya/d3/core/Camera";
import { Vector2 } from "laya/d3/math/Vector2";
import { Laya } from "Laya";
import { World } from "./world/World";
import { HingeConstraint } from "./constraints/HingeConstraint";
import { PointToPointConstraint } from "./constraints/PointToPointConstraint";
import { ConeTwistConstraint } from "./constraints/ConeTwistConstraint";
import { Mat3 } from "./math/Mat3";
import { Body } from "./objects/Body";
import { SparseVoxData, CubeModule } from "./shapes/VoxelData";
import { Voxel } from "./shapes/Voxel";
import { createVoxMesh } from "./layawrap/debugger/PhyMesh";
import { PhyMeshSprite } from "./layawrap/debugger/PhyMeshSprite";
import { Mesh2Voxel } from "./tools/Mesh2Voxel";
import { download } from "./layawrap/Async";

var scene:Scene3D;
var mtl:BaseMaterial;
let zup2yupQ = new Quaternion();
zup2yupQ.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);

export function initDemo(sce:Scene3D, m:BaseMaterial){
	scene = sce;
	mtl=m;
}

var tmpPos=new Vec3();
var tmpQ=new Quaternion();

export function ZupPos2Yup(pos:Vec3,out:Vec3){
	zup2yupQ.vmult(pos,out);
}

export function ZupQuat2Yup(quat:Quaternion,out:Quaternion){
	zup2yupQ.mult(quat,out);
}

export function addZupBox(size:Vec3, mass:number, pos:Vec3, q:Quaternion){
	zup2yupQ.vmult(pos,tmpPos);	// 转到Yup
	zup2yupQ.mult(q,tmpQ);		// 转到Yup

	let box = new MeshSprite3D(PrimitiveMesh.createBox(size.x,size.y,size.z));
	scene.addChild(box);
	var rigidBody = new CannonBody();// box.addComponent(CannonBody) as CannonBody;
	rigidBody.renderobj=box;
	var boxShape = new Box(new Vec3(size.x / 2, size.y / 2, size.z / 2));
	rigidBody.phyBody.position.copy(tmpPos);
	rigidBody.phyBody.quaternion.copy(tmpQ);
    rigidBody.addShape(boxShape);
	rigidBody.setMass(mass);
	rigidBody.phyBody.aabbNeedsUpdate=true;	//TODO 这个怎么能自动实现
    return rigidBody;
}

export function addBox( size:Vec3, pos:Vec3, mass:number, phyMtl:PhyMtl, randr=false):CannonBody {
	let box = new MeshSprite3D(PrimitiveMesh.createBox(size.x,size.y,size.z));
    scene.addChild(box);
    box.meshRenderer.material = mtl;
    var transform = box.transform;
    var p = transform.position;
    p.setValue(pos.x, pos.y, pos.z);
    transform.position = p;
	//设置欧拉角
	if(randr){
	    var rotationEuler = transform.rotationEuler;
	    rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;
	}

	var rigidBody = new CannonBody();// box.addComponent(CannonBody) as CannonBody;
	rigidBody.renderobj=box;
	//rigidBody.phyBody.setScale(3,1,1);
    var boxShape = new Box(new Vec3(size.x / 2, size.y / 2, size.z / 2));
	rigidBody.addShape(boxShape);
	rigidBody.setMass(mass);
	rigidBody.phyBody.material = phyMtl;
    return rigidBody;
}

export function addRenderCylinder(r:number,h:number){
	let m = new MeshSprite3D(PrimitiveMesh.createCylinder(r,h,16))
	scene.addChild(m);
	m.meshRenderer.material=mtl;
	return m;
}

export function addCapsule(r: f32, h: f32, x: f32, y: f32, z: f32,randr=false): CannonBody {
    var cap = scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(r, h + r + r, 10, 10))) as MeshSprite3D;
    cap.meshRenderer.material = mtl;
    var transform = cap.transform;
    var pos = transform.position;
    pos.setValue(x, y, z);
    transform.position = pos;
	//设置欧拉角
	if(randr){
		var rotationEuler = transform.rotationEuler;
		let rx = Math.random() * 360;
		let ry = Math.random() * 360;
		let rz = Math.random() * 360;
		rotationEuler.setValue(rx, ry, rz);
		transform.rotationEuler = rotationEuler;
	}

    let shapeq = new Quaternion();
    shapeq.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);

	var phy = new CannonBody();// cap.addComponent(CannonBody) as CannonBody;
	phy.renderobj=cap;
    phy.addShape(new Capsule(r, h), new Vector3(), shapeq);
	phy.setMass(1);
	phy.setName('capsule')
    return phy;
}

export function addSphere(r: f32, x: f32, y: f32, z: f32,mass=1): CannonBody {
	let sph = new MeshSprite3D(PrimitiveMesh.createSphere(r, 12, 12));
    scene.addChild(sph);
    sph.meshRenderer.material = mtl;
    var transform = sph.transform;
    var pos = transform.position;
    pos.setValue(x, y, z);
    transform.position = pos;

	var phy = new CannonBody();// sph.addComponent(CannonBody) as CannonBody;
	phy.renderobj=sph;
	//phy.phyBody.setScale(3,1,1);
    phy.addShape(new Sphere(r));
    phy.setMass(mass);
    return phy;
}

export function addTetra(v0:Vec3, v1:Vec3, v2:Vec3, v3:Vec3){
    new ConvexPolyhedron([v0,v1,v2,v3],[[0,1,2],[0,2,3],[0,3,1],[1,2,3]]);
}

export interface PhyObj{
	name:string;
	dim:Vec3;
	pos:Vec3;
	quat:Quaternion;
	mass:number;
}

function createNodeByType(type:string):any{
	switch(type){
		case 'Body':
			return new CannonBody();
			break;
	}

}

interface unpackable{
	initByJSONData(data:any):void;
}

export interface nodeProxy{
	//createNode(type:string):any;
	getRealNode():any;
	setProp(name:string, value:any, node:any, loader:JSONLoader):void;
	setPropEnd( node:any, loader:JSONLoader):void;
}

/**
 * 遍历所有的节点，创建对应的对象，设置属性
 * 管理引用关系
 * 具体加载需要有一个代理类，接收对应的属性，并赋值给实际对象
 * 有个潜规则是假设每个节点有type属性。没有也可以，但是不能分类了
 * 
 * node 动态增加
 * 		___id
 * 		___proxynode
 * 		___parent
 * 这里做遍历的事情，具体加载器就只要管一层就行了。
 */
export class JSONLoader{
	typesMap:{[key:string]:any[]}={};	// 

	getNodeByName(name:string,type:string){

	}

	loadJSON(obj:any, creater:(l:JSONLoader,nodeObj:any)=>nodeProxy|null){
		let allnodes:any[]=[];
		// 遍历所有节点。 创建空对象
		let cid=0;
		//obj.___id=cid++;
		//obj.___proxynode = null;
		//obj.___parent=null;

		let typesMap = this.typesMap;
		let stack:any[]=[];
		stack.push(obj);
		while(stack.length>0){
			let cn = stack.pop();
			allnodes.push(cn);
			// 分组
			let type = cn.type;
			if(type && typeof(type)==='string'){
				if(!typesMap[type])
					typesMap[type]=[];
				typesMap[type].push(cn);
			}

			// 属性，成员
			for(let i in cn){
				if(i=='___parent')
					continue;
				if(typeof(cn[i])==='object'){
					cn[i].___parent=cn;
					stack.push(cn[i]);
				}
			}
			// 这个放到后面，不要影响cn的结构
			cn.___id=cid++;
			cn.___proxynode = creater(this, cn);
		}

		// 设置属性
		allnodes.forEach( cn=>{
			let proxy = cn.___proxynode;
			if(proxy){
				for(let i in cn){
					if(i=='___id' || i=='___proxynode' || i=='___parent')
						continue;
					proxy.setProp(i, cn[i], cn, this);
				}
				proxy.setPropEnd(cn,this);
			}
		});
	}
}

export function raycast(world:World, cam:Camera, cb:(pt:Vec3, norm:Vec3)=>void){
	let ray = new Ray(new Vector3(), new Vector3());
	cam.viewportPointToRay(new Vector2(Laya.stage.mouseX, Laya.stage.mouseY), ray);
	let len = 10000;
	let phyRay = new PhyRay();
	phyRay.from.set(ray.origin.x, ray.origin.y, ray.origin.z);
	phyRay.to.set(ray.origin.x+ray.direction.x * len, ray.origin.y+ray.direction.y * len, ray.origin.z+ray.direction.z * len);
	let options: hitworldOptions = { mode: RayMode.CLOSEST };
	if (phyRay.intersectWorld(world, options)) {
		let r = phyRay.result;
		cb(r.hitPointWorld, r.hitNormalWorld);
		//phyr.addPersistPoint( hitpt);
	}	
}


var tmpV1 = new Vec3();
var tmpQ = new Quaternion();
function worldPosToLocal(pos: Vec3, body: Body): Vec3 {
	let ret = new Vec3();
	let rpos = tmpV1;
	pos.vsub(body.position, rpos);
	let invq = tmpQ;
	body.quaternion.conjugate(invq);
	invq.vmult(rpos, ret);
	return ret;
}

/**
 * 把全局的q转到body空间
 * @param q 
 * @param body 
 */
function worldQToLocal(q: Quaternion, body: Body): Quaternion {
	let invq = tmpQ;
	body.quaternion.conjugate(invq);
	let ret = new Quaternion();
	//q.mult(invq,ret);
	invq.mult(q, ret);
	//DEBUG
	/*
	var axx = new Vec3();
	var axy = new Vec3();
	var axz = new Vec3();
	ret.vmultAxis(axx,axy,axz);
	*/
	//DEBUG
	return ret;
}
 
function getZAxisFromQ(q: Quaternion) {
	let ret = new Vec3();
	let m = new Mat3();
	m.setRotationFromQuaternion(q);
	//ret.set(m.ele[6], m.ele[7], m.ele[8])
	let e =m.ele;
	ret.set(e[2],e[5],e[8]);	//第三列是z轴。不是第三行
	return ret;
}

function deg2r(deg: number) {
	return deg * Math.PI / 180;
}

/**
 * 加载一个组合对象，这个对象是一个数组，包含body和constraint。例如
 * 
 [
 {
  "name": "Cube",
  "dim": {"x": 2, "y": 2, "z": 2  },
  "pos": {"x": 0, "y": 0, "z": 0  },
  "quat": {"x": 0, "y": 0, "z": -0.36059334874153137, "w": 0.9327231645584106  },
  "mass": 1
 },
 {
  "name": "Cube.001",
  "dim": { "x": 2, "y": 2, "z": 2  },
  "pos": { "x": 0, "y": 0, "z": 2.2614493370056152  },
  "quat": { "x": 0, "y": 0, "z": -0.36059334874153137, "w": 0.9327231645584106  },
  "mass": 1
 },
 {
  "name": "Empty",
  "pos": { "x": 0, "y": 0, "z": 1.1762117147445679  },
  "quat": { "x": -0.7088689208030701, "y": 0, "z": 0, "w": 0.7053402066230774  },
  "type": "C_HINGE",
  "A": "Cube.001",
  "B": "Cube"
 }
]
 * 
 * @param o 
 * @param world 
 */
export function loadObj(o: Object[],world:World) {
	// 创建body
	var allpart: { [key: string]: Body } = {};
	o.forEach((obj: any) => {
		if (!obj.type || obj.type == "Rigid") {
			let b = addZupBox(obj.dim, obj.mass, obj.pos, obj.quat);
			b.setName(obj.name);
			allpart[obj.name] = b.phyBody;
		}
	});
	// 创建constraint
	o.forEach((c: any) => {
		switch (c.type) {
			case 'C_POINT': {
				let a = allpart[c.A];
				let b = allpart[c.B];
				let cpos = new Vec3(c.pos.x, c.pos.y, c.pos.z);
				let cquat = new Quaternion(c.quat.x, c.quat.y, c.quat.z, c.quat.w);
				//pos和quat转到y向上
				ZupPos2Yup(cpos, cpos);
				ZupQuat2Yup(cquat, cquat);
				let ct1 = new PointToPointConstraint(a,
					worldPosToLocal(cpos, a),
					b,
					worldPosToLocal(cpos, b));

				let ct = new ConeTwistConstraint(a, b, 1e10,
					worldPosToLocal(cpos, a),
					worldPosToLocal(cpos, b),
					getZAxisFromQ(worldQToLocal(cquat, a)),
					getZAxisFromQ(worldQToLocal(cquat, b)),
					deg2r(10), deg2r(0), false); //TODO 这个twistangle有问题
				ct.collideConnected = false;
				world.addConstraint(ct);
			}
				break;
			case 'C_HINGE': {
				let a = allpart[c.A];	// a,b这时候的位置已经被修改成y向上了。
				let b = allpart[c.B];
				let cpos = new Vec3(c.pos.x, c.pos.y, c.pos.z);
				let cquat = new Quaternion(c.quat.x, c.quat.y, c.quat.z, c.quat.w);
				//pos和quat转到y向上
				ZupPos2Yup(cpos, cpos);
				ZupQuat2Yup(cquat, cquat);

				let h = new HingeConstraint(a, b, 1e6,
					worldPosToLocal(cpos, a),
					worldPosToLocal(cpos, b),
					getZAxisFromQ(worldQToLocal(cquat, a)),
					getZAxisFromQ(worldQToLocal(cquat, b)));
				h.collideConnected = false;
				world.addConstraint(h);
			}
				break;
			case '':
				break;
			default:
				break;
		}
		//if(C.type ==)
	});
}

let emitPos = new Vec3();
let emitDir = new Vec3();

export function mouseDownEmitObj(scrx: number, scry: number, cam:Camera, lockEmit:boolean=false, phymtl:Material|null=null){
	let worlde = cam.transform.worldMatrix.elements;
	let stpos = new Vec3(worlde[12], worlde[13], worlde[14]);
	let dir = new Vec3(worlde[8], worlde[9], worlde[10]);

	let ray = new Ray(new Vector3(), new Vector3());
	cam.viewportPointToRay(new Vector2(scrx,scry), ray);
	if(!lockEmit){
		emitPos.set(ray.origin.x, ray.origin.y, ray.origin.z);
		//DEBUG
		//emitPos.set(-31.65083976589477,20.991332874362374,66.50135643487836 );
	}

	stpos.set(emitPos.x, emitPos.y, emitPos.z);

	if(!lockEmit){
		emitDir.set(ray.direction.x, ray.direction.y, ray.direction.z);
		//DEBUG
		//emitDir.set(-0.18446392214973648,-0.17484450459282244,-0.9671620653431494);
	}
	
	dir.set(emitDir.x,emitDir.y,emitDir.z);
	let sp = addSphere(.3, stpos.x, stpos.y, stpos.z);
	//let sp = addBox(new Vec3(1,1,1), stpos,1,phymtl as Material);
	//sp.setMaterial(phySph);
	let v = 20;
	setTimeout(() => {
		//sp.owner.destroy();
		sp._onDestroy();
	}, 11000);
	sp.setVel(dir.x * v, dir.y * v, dir.z * v);

}


export function createVoxelBox(xs:int,ys:int,zs:int,scale=1,pos?:Vec3,q?:Quaternion){
	let voxdata:CubeModule={
		_data:new Uint8Array(xs*ys*zs/8),
		_lx:xs,
		_ly:ys,
		_lz:zs,
		_dx:0,
		_dy:0,
		_dz:0
	};
	voxdata._data.fill(0xff);
	let phyvox = new Voxel(voxdata,1);
	let dt = phyvox.bitDataLod[0];

	let min = dt.min as any as Vector3;
	let max = dt.max as any as Vector3;
	let mesh = createVoxMesh(
		{ get: function (x: int, y: int, z: int) { return dt.getBit(x, y, z); } }, 
		dt.xs * 2, dt.ys * 2, dt.zs * 2, 
		dt.rx, dt.ry, dt.rz, min, max);// PrimitiveMesh.createQuad(10,10) ;//PrimitiveMesh.createBox(1,1,1);		
	let vox = new PhyMeshSprite(mesh, min, max);
	//vox.createMesh();
	scene.addChild(vox);
	vox.transform.localPosition.setValue(0, 0, 0);
	var phy =  new CannonBody();// vox.addComponent(CannonBody) as CannonBody;
	phy.renderobj=vox;
	phy.phyBody.dbgShow=true;
	if(scale){
		phy.phyBody.setScale(scale,scale,scale);
		vox.transform.scale =  new Vector3(scale,scale,scale);
	}
	phy.addShape(phyvox);
	if(pos){
		phy.phyBody.setPos(pos.x,pos.y,pos.z);
	}
	
	if(q){
		phy.phyBody.quaternion.copy(q);
	}

	phy.setMass(0);
}

/**
 * 加载一个自定义模型。格子化他。
 * @param url 
 */
export async function loadVoxTest(url:string,pos?:Vec3,q?:Quaternion,scale?:Vec3){
	let dt = await download(url);
	// 数据只有顶点数组，是一个三角形列表。
	
	let m2v = new Mesh2Voxel();	
	m2v.loadTmp(dt,0.25, (voxdata: SparseVoxData) => {
		console.time('voxel');
		
		let phyvox = new Voxel(voxdata,3);
		console.timeEnd('voxel');

		let dt = phyvox.bitDataLod[0];
		let min = dt.min as any as Vector3;
		let max = dt.max as any as Vector3;
		let mesh = createVoxMesh(
			{ get: function (x: int, y: int, z: int) { return dt.getBit(x, y, z); } }, 
			dt.xs * 2, dt.ys * 2, dt.zs * 2, dt.rx, dt.ry, dt.rz, min, max);// PrimitiveMesh.createQuad(10,10) ;//PrimitiveMesh.createBox(1,1,1);		
		let vox = new PhyMeshSprite(mesh, min, max);
		//vox.createMesh();
		scene.addChild(vox);
		vox.transform.localPosition.setValue(0, 0, 0);
		var phy =  new CannonBody();// vox.addComponent(CannonBody) as CannonBody;
		phy.renderobj=vox;
		phy.phyBody.dbgShow=true;
		if(scale){
			phy.phyBody.setScale(scale.x,scale.y,scale.z);
			vox.transform.scale =  new Vector3(scale.x, scale.y, scale.z);
		}
		phy.addShape(phyvox);
		if(pos){
			phy.phyBody.setPos(pos.x,pos.y,pos.z);
		}
		
		if(q){
			phy.phyBody.quaternion.copy(q);
		}

		phy.setMass(0);
	});
}

export function loadVoxel(file:string, pos?:Vec3,q?:Quaternion,scale?:Vec3) {
	let m2v = new Mesh2Voxel();	
	m2v.loadObj(file, 0.1, (voxdata: SparseVoxData) => {
		console.time('voxel');
		
		let phyvox = new Voxel(voxdata,3);
		console.timeEnd('voxel');

		let dt = phyvox.bitDataLod[0];
		let min = dt.min as any as Vector3;
		let max = dt.max as any as Vector3;
		let mesh = createVoxMesh(
			{ get: function (x: int, y: int, z: int) { return dt.getBit(x, y, z); } }, 
			dt.xs * 2, dt.ys * 2, dt.zs * 2, dt.rx, dt.ry, dt.rz, min, max);// PrimitiveMesh.createQuad(10,10) ;//PrimitiveMesh.createBox(1,1,1);		
		let vox = new PhyMeshSprite(mesh, min, max);
		//vox.createMesh();
		scene.addChild(vox);
		vox.transform.localPosition.setValue(0, 0, 0);
		var phy =  new CannonBody();// vox.addComponent(CannonBody) as CannonBody;
		phy.renderobj=vox;
		phy.phyBody.dbgShow=true;
		if(scale){
			phy.phyBody.setScale(scale.x,scale.y,scale.z);
			vox.transform.scale =  new Vector3(scale.x, scale.y, scale.z);
		}
		phy.addShape(phyvox);
		if(pos){
			phy.phyBody.setPos(pos.x,pos.y,pos.z);
		}
		
		if(q){
			phy.phyBody.quaternion.copy(q);
		}

		phy.setMass(0);
	});
}
