import { VoxelData } from "../../shapes/Voxel";

function BuildBox(vox:VoxData, xs:i32,ys:i32,zs:i32, x:i32, y:i32, z:i32, solid:boolean):VoxelData{
    let dt = vox.vo
}


function BuildSphere(vox:VoxData, r:i32, x:i32,y:i32,z:i32, solid:boolean):VoxData{
    throw 'NI';
}

function BuildTerrain(vox:VoxData, minv:i32, maxv:i32, up:'x'|'y'|'z', solid:boolean):VoxData{
    throw 'NI';
}

function BuildFromMesh(gridsz:f32):VoxData{
    throw 'NI';
}