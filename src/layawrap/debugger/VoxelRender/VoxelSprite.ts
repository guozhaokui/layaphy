import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector3 } from "laya/d3/math/Vector3";
import { SelfMaterial } from "./VoxelMtl";


export class VoxelSprite extends MeshSprite3D{
    constructor(){
        super();
    }

    setData(data:Uint8Array){
        var vertDecl: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV");
        let vert = new Float32Array();
        let idx = new Uint16Array();
        let mesh = PrimitiveMesh._createMesh(vertDecl,vert,idx)
    }
}


function createVoxelMesh(){
    let cube = new MeshSprite3D( PrimitiveMesh.createBox(1,1,1));
    cube.transform.translate(new Vector3(3, 0, 0));
    cube.transform.rotate(new Vector3(90, 0, 0), true, false);

    var selfMaterial = new SelfMaterial();
    //var diffuserTexture: Texture2D = Loader.getRes("res/selves/selfshader/brickwall.jpg");
    //selfMaterial.diffuserTexture = diffuserTexture;
    
    cube.meshRenderer.material = selfMaterial;
}