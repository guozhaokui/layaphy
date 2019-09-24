import Vec3 from "../../../math/Vec3";

function GreedyMesh(volume: ArrayLike<number>, dims: number[]) {
	function f(i: i32, j: i32, k: i32) {
		return volume[i + dims[0] * (j + dims[1] * k)];
	}
	//Sweep over 3-axes
	var quads = [];
	for (var d = 0; d < 3; ++d) {
		var i, j, k, l, w, h
			, u = (d + 1) % 3
			, v = (d + 2) % 3
			, x = [0, 0, 0]
			, q = [0, 0, 0]
			, mask = new Int32Array(dims[u] * dims[v]);
		q[d] = 1;
		for (x[d] = -1; x[d] < dims[d];) {
			//Compute mask
			var n = 0;
			for (x[v] = 0; x[v] < dims[v]; ++x[v])
				for (x[u] = 0; x[u] < dims[u]; ++x[u]) {
					mask[n++] =	(0 <= x[d] ? f(x[0], x[1], x[2]) : false) !=(x[d] < dims[d] - 1 ? f(x[0] + q[0], x[1] + q[1], x[2] + q[2]) : false);
				}
			//Increment x[d]
			++x[d];
			//Generate mesh for mask using lexicographic ordering
			n = 0;
			for (j = 0; j < dims[v]; ++j)
				for (i = 0; i < dims[u];) {
					if (mask[n]) {
						//Compute width
						for (w = 1; mask[n + w] && i + w < dims[u]; ++w) {
						}
						//Compute height (this is slightly awkward
						var done = false;
						for (h = 1; j + h < dims[v]; ++h) {
							for (k = 0; k < w; ++k) {
								if (!mask[n + k + h * dims[u]]) {
									done = true;
									break;
								}
							}
							if (done) {
								break;
							}
						}
						//Add quad
						x[u] = i; x[v] = j;
						var du = [0, 0, 0]; du[u] = w;
						var dv = [0, 0, 0]; dv[v] = h;
						quads.push([
							[x[0], x[1], x[2]]
							, [x[0] + du[0], x[1] + du[1], x[2] + du[2]]
							, [x[0] + du[0] + dv[0], x[1] + du[1] + dv[1], x[2] + du[2] + dv[2]]
							, [x[0] + dv[0], x[1] + dv[1], x[2] + dv[2]]
						]);
						//Zero-out mask
						for (l = 0; l < h; ++l)
							for (k = 0; k < w; ++k) {
								mask[n + k + l * dims[u]] = false;
							}
						//Increment counters and continue
						i += w; n += w;
					} else {
						++i; ++n;
					}
				}
		}
	}
	return quads;
}


//Naive meshing (with face culling)
function CulledMesh(volume:number[], dims:number[]) {
	//Precalculate direction vectors for convenience
	var dir = new Array(3);
	for(var i=0; i<3; ++i) {
	  dir[i] = [[0,0,0], [0,0,0]];
	  dir[i][0][(i+1)%3] = 1;
	  dir[i][1][(i+2)%3] = 1;
	}
	//March over the volume
	var quads = []
	  , x = [0,0,0]
	  , B = [[false,true]    //Incrementally update bounds (this is a bit ugly)
			,[false,true]
			,[false,true]]
	  , n = -dims[0]*dims[1];
	for(           B[2]=[false,true],x[2]=-1; x[2]<dims[2]; B[2]=[true,(++x[2]<dims[2]-1)])
	for(n-=dims[0],B[1]=[false,true],x[1]=-1; x[1]<dims[1]; B[1]=[true,(++x[1]<dims[1]-1)])
	for(n-=1,      B[0]=[false,true],x[0]=-1; x[0]<dims[0]; B[0]=[true,(++x[0]<dims[0]-1)], ++n) {
	  //Read current voxel and 3 neighboring voxels using bounds check results
	  var p =   (B[0][0] && B[1][0] && B[2][0]) ? volume[n]                 : false
		, b = [ (B[0][1] && B[1][0] && B[2][0]) ? volume[n+1]               : false
			  , (B[0][0] && B[1][1] && B[2][0]) ? volume[n+dims[0]]         : false
			  , (B[0][0] && B[1][0] && B[2][1]) ? volume[n+dims[0]*dims[1]] : false
			];
	  //Generate faces
	  for(var d=0; d<3; ++d)
	  if(p != b[d]) {
		var t = [x[0],x[1],x[2]]
		  , u = dir[d][0]
		  , v = dir[d][1];
		++t[d];
		quads.push([
			[t[0],           t[1],           t[2]          ]
		  , [t[0]+u[0],      t[1]+u[1],      t[2]+u[2]     ]
		  , [t[0]+u[0]+v[0], t[1]+u[1]+v[1], t[2]+u[2]+v[2]]
		  , [t[0]     +v[0], t[1]     +v[1], t[2]     +v[2]]
		]);
	  }
	}
	return quads;
  }
  
  function StupidMesh(volume:number[], dims:number[]) {
	var quads = [], x = [0,0,0], n = 0;
	for(x[2]=0; x[2]<dims[2]; ++x[2])
	for(x[1]=0; x[1]<dims[1]; ++x[1])
	for(x[0]=0; x[0]<dims[0]; ++x[0])
	if(volume[n++]) {
	  for(var d=0; d<3; ++d) {
		var t = [x[0], x[1], x[2]]
		  , u = [0,0,0]
		  , v = [0,0,0]; 
		u[(d+1)%3] = 1;
		v[(d+2)%3] = 1;
		for(var s=0; s<2; ++s) {
		  t[d] = x[d] + s;
		  quads.push([
			  [t[0],           t[1],           t[2]          ]
			, [t[0]+u[0],      t[1]+u[1],      t[2]+u[2]     ]
			, [t[0]+u[0]+v[0], t[1]+u[1]+v[1], t[2]+u[2]+v[2]]
			, [t[0]     +v[0], t[1]     +v[1], t[2]     +v[2]]
		  ]);
		}
	  }
	}
	return quads;
  }
  