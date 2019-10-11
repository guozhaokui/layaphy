import { PhyVoxelData } from "../../shapes/Voxel";
import { voxdata } from './../../shapes/Voxel';

/**
 * 创建一个box的体素数据
 * @param xs 
 * @param ys 
 * @param zs 
 * @param solid 
 */
export function VoxBuildBox(xs:i32,ys:i32,zs:i32, solid:boolean):voxdata[]{
	//let dt = vox.vo
	let dt:voxdata[] = []; 
	let border=false;
	for(let z=0; z<zs; z++){
		border=(z==0||z==zs-1);
		for(let y=0; y<ys; y++){
			border=border||(y==0||y==ys-1);
			for(let x=0; x<xs; x++){
				border=border||(x==0||x==xs-1);
				if(solid){
					dt.push({x,y,z,color:0xffffffff})
				}else{
					if(border){
						dt.push({x,y,z,color:0xffffffff});
					}
				}
			}
		}
	}
	return dt;
}


function BuildSphere(vox:PhyVoxelData, r:i32, x:i32,y:i32,z:i32, solid:boolean):PhyVoxelData{
    throw 'NI';
}

function BuildTerrain(vox:PhyVoxelData, minv:i32, maxv:i32, up:'x'|'y'|'z', solid:boolean):PhyVoxelData{
    throw 'NI';
}

function BuildFromMesh(gridsz:f32):PhyVoxelData{
    throw 'NI';
}

function createTestData() {
	var result:any = {};
	
	function makeVoxels(l:number[], h:number[], f:(i:int,j:int,k:int)=>void) {
	  var d = [ h[0]-l[0], h[1]-l[1], h[2]-l[2] ]
		, v = new Array(d[0]*d[1]*d[2])
		, n = 0;
	  for(var k=l[2]; k<h[2]; ++k)
	  for(var j=l[1]; j<h[1]; ++j)
	  for(var i=l[0]; i<h[0]; ++i, ++n) {
		v[n] = f(i,j,k);
	  }
	  return {voxels:v, dims:d};
	}
	  
	for(var i=1; i<=16; i<<=1) {
	  result[i + 'x' + i + 'x' + i] = makeVoxels([0,0,0], [i,i,i], function() { return true; });
	}
  
	result['Hole'] = makeVoxels([0,0,0], [16,16,1], function(i,j,k) {
	  return Math.abs(i-7) > 3 || Math.abs(j-7) > 3;
	});
	
	result['Boss'] = makeVoxels([0,0,0], [16,16,4], function(i,j,k) {
	  return (k == 0) ||
		(Math.abs(i-4) < 2 && Math.abs(j-5) < 2 && k< 2) ||
		(10 <= i && i < 14 && 2 <= j && j < 15);
	});
	
	result['T-Shape'] = makeVoxels([0,0,0], [16,16,3], function(i,j,k) {
	  return (( 6 <= i && i < 10 && 2 <= j && j < 13) ||
		( 2 <= i && i < 14 && 8 <= j && j < 13));
	});
	
	result['Clover'] = makeVoxels([0,0,0], [17,17,1], function(i,j,k) {
	  if(i == 0 && Math.abs(j-8) <= 2) {
		return false;
	  } else if(i == 16 && Math.abs(j-8) <= 2) {
		return false;
	  } else if(j == 0 && Math.abs(i-8) <= 2) {
		return false;
	  } else if(j == 16 && Math.abs(i-8) <= 2) {
		return false;
	  } else {
		return true;
	  }
	});
	
	result['Triangle'] = makeVoxels([0,0,0], [17,17,1], function(i,j,k) {
	  return (i < j);
	});
	
	result['Saw'] = makeVoxels([0,0,0], [17,3,1], function(i,j,k) {
	  if( j > 0) {
		return true;
	  }
	  return !!(i & 1);
	});
	
	result['4Holes']  = makeVoxels([0,0,0], [7,7,1], function(i,j,k) {
	  if( (i == 2 && j == 1) ||
		  (i == 5 && j == 2) ||
		  (i == 1 && j == 4) ||
		  (i == 4 && j == 5) ) {
		return false;    
	  }
	  return true;
	});
	
	result["Matt's Example"]  = makeVoxels([0,0,0], [4,5,1], function(i,j,k) {
	  if( (i == 1 && j == 1) ||
		  (i == 2 && j == 3) ) {
		return false;    
	  }
	  return true;
	});
	
	result['Checker'] = makeVoxels([0,0,0], [8,8,8], function(i,j,k) {
	  return !!((i+j+k)&1);
	});
	
	result['Noise'] = makeVoxels([0,0,0], [16,16,16], function(i,j,k) {
	  return Math.random() < 0.1;
	});
	
	result['HollowCube'] = makeVoxels([0,0,0], [16,16,16], function(i,j,k) {
	  return ( i < 1 || i >= 15 || j < 1 || j >= 15 || k < 1 || k >= 15 );
	});
	
	result['Sphere'] = makeVoxels([-16,-16,-16], [16,16,16], function(i,j,k) {
	  return i*i+j*j+k*k <= 16*16
	});
  
	result['Hill'] = makeVoxels([-16, 0, -16], [16,16,16], function(i,j,k) {
	  return j <= 16 * Math.exp(-(i*i + k*k) / 64);
	});
	
	result['Valley'] = makeVoxels([0,0,0], [32,32,32], function(i,j,k) {
	  return j <= (i*i + k*k) * 31 / (32*32*2) + 1;
	});
	
	result['SineTerrain'] = makeVoxels([0,0,0], [32, 8, 32], function(i,j,k) {
	   return j <= 3.0 * Math.sin(Math.PI * i / 12.0 - Math.PI * k * 0.1) + 4.0;
	});
	
	
	
	result['Empty'] = { voxels : [], dims : [0,0,0] };
  
	return result;
  }
  