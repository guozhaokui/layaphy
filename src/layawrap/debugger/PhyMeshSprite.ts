import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { VoxelMaterial } from "./VoxelMtl";


export class PhyMeshSprite extends MeshSprite3D{
	mesh:Mesh;
	bbxmin:Vector3;
	bbxmax:Vector3;
    constructor(mesh:Mesh, min:Vector3,max:Vector3){
        //let mesh = PhyMeshSprite.createMesh(data, xn,yn,zn,min,max);// PrimitiveMesh.createQuad(10,10) ;//PrimitiveMesh.createBox(1,1,1);
        super(mesh);
        //mesh.bounds = new Bounds(new Vector3(-2,-2,-2), new Vector3(2,2,2));
        var selfMaterial = new VoxelMaterial();
        this.meshRenderer.material = selfMaterial;
        //this.transform.translate(new Vector3(3, 0, 0));
		//this.transform.rotate(new Vector3(90, 0, 0), true, false);
		this.bbxmin=min;
		this.bbxmax=max;
	}
}
