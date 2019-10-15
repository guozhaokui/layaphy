import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { GreedyMesh } from "./VoxelRender/VoxelMesh";
import { Vector3 } from "laya/d3/math/Vector3";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Mesh } from "laya/d3/resource/models/Mesh";
import {Vec3} from "../../math/Vec3";

function updateMin(min:Vec3, x:number,y:number, z:number){
	min.x>x && (min.x=x);
	min.y>y && (min.y=y);
	min.z>z && (min.z=z);
}

function updateMax(max:Vec3, x:number,y:number, z:number){
	max.x<x && (max.x=x);
	max.y<y && (max.y=y);
	max.z<z && (max.z=z);
}

/**
 * 
 * @param data 
 * @param xn 
 * @param yn 
 * @param zn 
 * @param min 外部提供的包围盒
 * @param max 
 */
export function createVoxMesh(data: any, xn: i32, yn: i32, zn: i32, min: Vector3, max: Vector3): Mesh {
	var vertDecl = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
	let quad = GreedyMesh(data, [xn, yn, zn]);
	let vertex: number[] = [];
	let index: number[] = [];

	let sx = max.x - min.x;
	let sy = max.y - min.y;
	let sz = max.z - min.z;
	let ux = sx / xn;//x的单位
	let uy = sy / yn;
	let uz = sz / zn;
	let vn = 0;
	quad.forEach(v => {
		let v0 = v[0];
		let v1 = v[1];
		let v2 = v[2];
		let v3 = v[3];
		let n1 = v[4];
		v0.x
		vertex.push(
			v0.x * ux + min.x, v0.y * uy + min.y, v0.z * uz + min.z, n1.x, n1.y, n1.z, 0, 0,
			v1.x * ux + min.x, v1.y * uy + min.y, v1.z * uz + min.z, n1.x, n1.y, n1.z, 1, 0,
			v2.x * ux + min.x, v2.y * uy + min.y, v2.z * uz + min.z, n1.x, n1.y, n1.z, 1, 1,
			v3.x * ux + min.x, v3.y * uy + min.y, v3.z * uz + min.z, n1.x, n1.y, n1.z, 1, 0);
		index.push(vn + 0, vn + 1, vn + 3, vn + 1, vn + 2, vn + 3);
		vn += 4;
	});

	let vert = new Float32Array(vertex);
	let idx = new Uint16Array(index);
	return PrimitiveMesh._createMesh(vertDecl, vert, idx)
}

export function createGridPlane(xslice: int, ysclie: int, w: number, h: number, pos: Vec3) {

}

/**
 * 
 * @param hdata  地形数据。00是xz原点
 * @param w 
 * @param h 
 * @param scale 
 * @param pos 
 */
export function createTerrainMesh(hdata: Uint8Array, w: int, h: int, scale: Vec3, pos: Vec3, min:Vec3, max:Vec3) {
	var vertDecl = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
	let vertex: number[][] = [];//new Array(w*h*8);
	//let quadNum = (w - 1) * (h - 1);
	let index: number[] = [];//new Array(quadNum*6);
	let gridw = scale.x / (w-1);
	min.set(1e8,1e8,1e8);
	max.set(-1e8,-1e8,-1e8);
	// 先给顶点位置赋值
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			let v = hdata[y*w+x]*scale.y/255;
			let vx = x * gridw+pos.x;
			let vy = pos.y+v;
			let vz = y * gridw+pos.z;
			vertex.push([vx,vy,vz,0,1,0,0,0]);
			updateMin(min,vx,vy,vz);
			updateMax(max,vx,vy,vz);	
		}
	}

	// 计算法线
	let e1 = new Vec3();
	let e2 = new Vec3();
	let norm = new Vec3();
	for(let y=1; y<h-1; y++){
		for(let x=1; x<w-1; x++){
			//     0
			//     ^
			//  1  x->  2
			//     3
			let cpos = y*w+x;
			let curv = vertex[cpos]
			let v0=vertex[cpos-w]; 
			let v1=vertex[cpos-1];
			let v2=vertex[cpos+1];
			let v3=vertex[cpos+w];
			e1.set(v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]);
			e2.set(v0[0]-v3[0], v0[1]-v3[1], v0[2]-v3[2]);
			e1.cross(e2,norm);
			norm.normalize();
			curv[3]=norm.x;
			curv[4]=norm.y;
			curv[5]=norm.z;
		}
	}

	// 填充index
	for(let y=0; y<h-1; y++){
		for(let x=0; x<w-1; x++){
			//  0   1
			//  2   3
			let v0 = y*w+x; let v1 = y*w+x+1;
			let v2 = v0+w; let v3 = v1+w;
			index.push(v0, v1, v2, v2,v1,v3);
		}
	}

	let nvert = new Array<number>(w*h*8);
	let cp = 0;
	for(let y=0; y<h; y++){
		for(let x=0; x<w; x++){
			let cpos = y*w+x;
			let curv = vertex[cpos]
			nvert[cp++]=curv[0];
			nvert[cp++]=curv[1];
			nvert[cp++]=curv[2];
			nvert[cp++]=curv[3];
			nvert[cp++]=curv[4];
			nvert[cp++]=curv[5];
			nvert[cp++]=curv[6];
			nvert[cp++]=curv[7];
		}
	}

	let vert = new Float32Array(nvert);//(vertex.reduce((a,c)=>{return a.concat(c);},[]));
	let idx = new Uint16Array(index);
	return PrimitiveMesh._createMesh(vertDecl, vert, idx)

}