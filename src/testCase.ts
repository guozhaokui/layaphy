import { SparseVoxData } from "./shapes/VoxelData";
import { Voxel } from "./shapes/Voxel";
import { Body } from "./objects/Body";
import { World } from "./world/World";
import { Sphere } from "./shapes/Sphere";
import { Vec3 } from "./math/Vec3";
import { Narrowphase } from "./world/Narrowphase";
import { ContactEquation } from "./equations/ContactEquation";
import { FrictionEquation } from "./equations/FrictionEquation";
import { GridBroadphase } from "./collision/GridBroadphase";
import { Box } from "./shapes/Box";
import { NaiveBroadphase } from "./collision/NaiveBroadPhase";
import { RaycastResult } from "./collision/RaycastResult";


// 测试例子，以后放到test中
export function test_sphere_vox(){
	var voxdata = new SparseVoxData([{x:0,y:0,z:0,color:1}],1,1,1,new Vec3(),new Vec3())
	var vox = new Voxel(voxdata,1);
	var voxbody = new Body(0, vox);
	voxbody.setPos(0,0,0);

	var world = new World();
	world.addBody(voxbody);

	var sphere = new Body(1, new Sphere(0.5));
	sphere.setPos(0,0,0);
	sphere.velocity = new Vec3();

	let np = new Narrowphase(world);
	let contacts:ContactEquation[] = [];
	let oldcontacts:ContactEquation[] = [];
	let friR:FrictionEquation[]=[];
	np.getContacts([voxbody],[sphere],world,contacts,oldcontacts, friR,[]);

	// 大格子
	// 小格子
	// 均匀缩放
	// 不均匀缩放
	//voxbody.addEventListener('',()=>{});
	//world.step(1/60);
	debugger;
}

export function test_gridbroadphase1(){
	let world = new World();
	let broadphase:GridBroadphase = world.broadphase = new GridBroadphase();
	
	let b1 = new Body( 1, new Box(new Vec3(1,1,1)));
	world.addBody(b1);

	let b2 = new Body( 1, new Box( new Vec3(1,1,1)));
	world.addBody(b2);

	let b3 = new Body( 1, new Box( new Vec3(1,1,1)));
	world.addBody(b3);

	let p1:Body[]=[];
	let p2:Body[]=[];
	broadphase.collisionPairs(world, p1, p2);
	debugger;
}

export function test_raycastInner(){
	let world = new World();
	let broadphase:NaiveBroadphase = new NaiveBroadphase();
	world.broadphase = broadphase;
	
	let result = new RaycastResult();
	world.raycastAny( new Vec3(), new Vec3(),{},result);
	
}