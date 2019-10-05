import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { GreedyMesh } from "./VoxelMesh";
import { VoxelMaterial } from "./VoxelMtl";


export class VoxelSprite extends MeshSprite3D{
	mesh:Mesh;
	bbxmin:Vector3;
	bbxmax:Vector3;
    constructor(data:any,xn:i32,yn:i32,zn:i32,min:Vector3,max:Vector3){
        let mesh = VoxelSprite.createMesh(data, xn,yn,zn,min,max);// PrimitiveMesh.createQuad(10,10) ;//PrimitiveMesh.createBox(1,1,1);
        super(mesh);
        //mesh.bounds = new Bounds(new Vector3(-2,-2,-2), new Vector3(2,2,2));
        var selfMaterial = new VoxelMaterial();
        this.meshRenderer.material = selfMaterial;
        //this.transform.translate(new Vector3(3, 0, 0));
		//this.transform.rotate(new Vector3(90, 0, 0), true, false);
		this.bbxmin=min;
		this.bbxmax=max;
	}

    static createMesh(data:any,xn:i32,yn:i32,zn:i32,min:Vector3, max:Vector3){
		var vertDecl = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
		let quad = GreedyMesh(data,[xn,yn,zn]);
		let vertex:number[]=[];
		let index:number[]=[];

		let sx = max.x-min.x;
		let sy = max.y-min.y;
		let sz = max.z-min.z;
		let ux = sx/xn;//x的单位
		let uy = sy/yn;
		let uz = sz/zn;
		let vn=0;
		quad.forEach(v=>{
			let v0 = v[0];
			let v1 = v[1];
			let v2 = v[2];
			let v3 = v[3];
			let n1 = v[4];
			v0.x
			vertex.push(
				v0.x*ux+min.x, v0.y*uy+min.y, v0.z*uz+min.z, n1.x,n1.y,n1.z,0,0,
				v1.x*ux+min.x, v1.y*uy+min.y, v1.z*uz+min.z, n1.x,n1.y,n1.z,1,0,
				v2.x*ux+min.x, v2.y*uy+min.y, v2.z*uz+min.z, n1.x,n1.y,n1.z,1,1,
				v3.x*ux+min.x, v3.y*uy+min.y, v3.z*uz+min.z, n1.x,n1.y,n1.z,1,0);
			index.push(vn+0,vn+1,vn+3,vn+1,vn+2,vn+3);
			vn+=4;
		});

        let vert = new Float32Array(vertex);
        let idx = new Uint16Array(index);
        return PrimitiveMesh._createMesh(vertDecl,vert,idx)
    }
}
