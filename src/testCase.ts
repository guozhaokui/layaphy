import { SparseVoxData } from "./shapes/VoxelData";
import { Voxel } from "./shapes/Voxel";
import { Body } from "./objects/Body";
import { World } from "./world/World";
import { Sphere } from "./shapes/Sphere";
import { Vec3 } from "./math/Vec3";
import { Narrowphase } from "./world/Narrowphase";
import { ContactEquation } from "./equations/ContactEquation";
import { FrictionEquation } from "./equations/FrictionEquation";


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