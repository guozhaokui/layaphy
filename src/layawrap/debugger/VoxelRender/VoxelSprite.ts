import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector3 } from "laya/d3/math/Vector3";
import { VoxelMaterial } from "./VoxelMtl";
import { Bounds } from "laya/d3/core/Bounds";


export class VoxelSprite extends MeshSprite3D{
    constructor(){
        let mesh = PrimitiveMesh.createBox(1,1,1);
        super(mesh);
        //mesh.bounds = new Bounds(new Vector3(-2,-2,-2), new Vector3(2,2,2));
        var selfMaterial = new VoxelMaterial();
        this.meshRenderer.material = selfMaterial;
        this.transform.translate(new Vector3(3, 0, 0));
        //this.transform.rotate(new Vector3(90, 0, 0), true, false);
    }

    createMesh(data:Uint8Array,xn:i32,yn:i32,zn:i32, gridscale:f32):void{
        var vertDecl: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
        let vert = new Float32Array();
        let idx = new Uint16Array();
        let mesh = PrimitiveMesh._createMesh(vertDecl,vert,idx)
    }

    createVoxelMesh(){
    
        var selfMaterial = new VoxelMaterial();
        //var diffuserTexture: Texture2D = Loader.getRes("res/selves/selfshader/brickwall.jpg");
        //selfMaterial.diffuserTexture = diffuserTexture;
        
    }
}
