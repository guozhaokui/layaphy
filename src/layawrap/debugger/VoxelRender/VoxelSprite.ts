import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector3 } from "laya/d3/math/Vector3";
import { VoxelMaterial } from "./VoxelMtl";
import { Bounds } from "laya/d3/core/Bounds";
import { GreedyMesh } from "./VoxelMesh";
import { Mesh } from "laya/d3/resource/models/Mesh";
import Vec3 from "../../../math/Vec3";


export class VoxelSprite extends MeshSprite3D{
	mesh:Mesh;
    constructor(data:any,xn:i32,yn:i32,zn:i32){
        let mesh = VoxelSprite.createMesh(data, xn,yn,zn);// PrimitiveMesh.createQuad(10,10) ;//PrimitiveMesh.createBox(1,1,1);
        super(mesh);
        //mesh.bounds = new Bounds(new Vector3(-2,-2,-2), new Vector3(2,2,2));
        var selfMaterial = new VoxelMaterial();
        this.meshRenderer.material = selfMaterial;
        this.transform.translate(new Vector3(3, 0, 0));
        //this.transform.rotate(new Vector3(90, 0, 0), true, false);
	}
	
	createQuad(long: number = 1, width: number = 1) {
		//定义顶点数据结构
		var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
		var halfLong: number = long / 2;
		var halfWidth: number = width / 2;

		var vertices: Float32Array = new Float32Array([-halfLong, halfWidth, 0, 0, 0, 1, 0, 0, halfLong, halfWidth, 0, 0, 0, 1, 1, 0, -halfLong, -halfWidth, 0, 0, 0, 1, 0, 1, halfLong, -halfWidth, 0, 0, 0, 1, 1, 1]);
		var indices: Uint16Array = new Uint16Array([0, 1, 2, 3, 2, 1]);

		return PrimitiveMesh._createMesh(vertexDeclaration, vertices, indices);
	}	

    static createMesh(data:any,xn:i32,yn:i32,zn:i32){
		var vertDecl = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
		let quad = GreedyMesh({get:data.get},[xn,yn,zn]);
		let vertex:number[]=[];
		let index:number[]=[];

		let vn=0;
		quad.forEach(v=>{
			let v0 = v[0];
			let v1 = v[1];
			let v2 = v[2];
			let v3 = v[3];
			let n1 = v[4];
			vertex.push(
				v0.x,v0.y,v0.z,n1.x,n1.y,n1.z,0,0,
				v1.x,v1.y,v1.z,n1.x,n1.y,n1.z,1,0,
				v2.x,v2.y,v2.z,n1.x,n1.y,n1.z,1,1,
				v3.x,v3.y,v3.z,n1.x,n1.y,n1.z,1,0);
			index.push(vn+0,vn+1,vn+3,vn+1,vn+2,vn+3);
			vn+=4;
		});

        let vert = new Float32Array(vertex);
        let idx = new Uint16Array(index);
        return PrimitiveMesh._createMesh(vertDecl,vert,idx)
    }
}
