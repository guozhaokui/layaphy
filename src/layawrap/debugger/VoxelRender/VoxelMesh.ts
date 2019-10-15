import {Vec3} from "../../../math/Vec3";

export function GreedyMesh(volume:{get:(x:number,y:number,z:number)=>number}|number[], dims: number[]) {
	performance.mark('greedystart');
	function _get(i: i32, j: i32, k: i32){
		return (volume as number[])[i + dims[0] * (j + dims[1] * k)];
	}
	let get=(volume as any).get || _get;
	//Sweep over 3-axes
	var quads = [];
	for (var d = 0; d < 3; ++d) {
		var i, j, k, l, w, h
			, u = (d + 1) % 3	//x d=0,u=1,v=2   y:d=1,u=2,v=0  z:d=2,u=0,v=1
			, v = (d + 2) % 3
			, x = [0, 0, 0]
			, q = [0, 0, 0];

		let ds = dims[d];
		let vs = dims[v];
		let us = dims[u];

		let normal=[0,0,0];
		normal[d]=-1;

		/** 大小为当前扫描平面的分辨率 */
		let mask = new Int32Array(us*vs);
			
		q[d] = 1;

		for (x[d] = -1; x[d] < ds;) {
			//normal[d]*=-1;
			//Compute mask
			var n = 0;
			for (x[v] = 0; x[v] < vs; ++x[v]){
				for (x[u] = 0; x[u] < us; ++x[u]) {
					// 在有效范围内取 0<= <dims[]-1
					// 在当前轴上，前进一步，看是不是一样
					// get(x0,x1,x2)!=get(x0+axis.x, x1+axis.y, x2+axis.z)
					let pre = 0 <= x[d] ? get(x[0], x[1], x[2]) : false;
					let cur = x[d] < ds - 1 ? get(x[0] + q[0], x[1] + q[1], x[2] + q[2]) : false;
					let v = (pre!=cur)?1:0;
					if(v && pre) v|=2;	//表示对面，用来区分法线
					mask[n++] = v;
				}
			}
			//Increment x[d]
			++x[d];
			//Generate mesh for mask using lexicographic ordering
			// 根据mask生成mesh。
			n = 0;
			for (j = 0; j < vs; ++j){
				for (i = 0; i < us;) {
					let cmask=mask[n];
					if (cmask) {
						// 每次扫过一个连续的w和尽可能大的h来添加
						//Compute width
						//查找mask，看有多少连续的，=>w 
						for (w = 1; mask[n + w]==cmask && i + w < us; ++w) {}
						//Compute height (this is slightly awkward
						//计算h
						var done = false;
						for (h = 1; j + h < vs; ++h) {
							for (k = 0; k < w; ++k) {
								if (mask[n + k + h * us]!=cmask) {
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
						let x0=x[0],x1=x[1],x2=x[2];
						let du0=du[0],du1=du[1],du2=du[2];
						let dv0=dv[0],dv1=dv[1],dv2=dv[2];
						let back = cmask&2;
						let nx=normal[0];
						let ny=normal[1];
						let nz=normal[2];
						quads.push([
							new Vec3(x0, x1, x2)
							, new Vec3(x0 + du0, x1 + du1, x2 + du2)
							, new Vec3(x0 + du0 + dv0, x1 + du1 + dv1, x2 + du2 + dv2)
							, new Vec3(x0 + dv0, x1 + dv1, x2 + dv2)
							, new Vec3(back?-nx:nx,back?-ny:ny,back?-nz:nz)
						]);

						// 已经分配过的mask要删掉，防止被再用
						for (l = 0; l < h; ++l)
							for (k = 0; k < w; ++k) {
								mask[n + k + l * us] = 0;
							}
						//Increment counters and continue
						i += w; n += w;
					} else {
						//mask为0，表示不是当前方向的边界,
						++i;//i 的 for循环继续
						++n;//下一个mask
					}
				}
			}
		}
	}
	performance.mark('greedyend');
	performance.measure('greedytime', 'greedystart', 'greedyend');
	console.log( 'greedy time:',performance.getEntriesByName('greedytime')[0].duration, '四边形：',quads.length)
	return quads;
}


//Naive meshing (with face culling)
function CulledMesh(volume: number[], dims: number[]) {
	//Precalculate direction vectors for convenience
	var dir = new Array(3);
	for (var i = 0; i < 3; ++i) {
		dir[i] = [[0, 0, 0], [0, 0, 0]];
		dir[i][0][(i + 1) % 3] = 1;
		dir[i][1][(i + 2) % 3] = 1;
	}
	//March over the volume
	var quads = [], x = [0, 0, 0];
	var B = [[false, true],    //Incrementally update bounds (this is a bit ugly)
	[false, true],
	[false, true]]
	var n = -dims[0] * dims[1];
	for (B[2] = [false, true], x[2] = -1; x[2] < dims[2]; B[2] = [true, (++x[2] < dims[2] - 1)])
		for (n -= dims[0], B[1] = [false, true], x[1] = -1; x[1] < dims[1]; B[1] = [true, (++x[1] < dims[1] - 1)])
			for (n -= 1, B[0] = [false, true], x[0] = -1; x[0] < dims[0]; B[0] = [true, (++x[0] < dims[0] - 1)], ++n) {
				//Read current voxel and 3 neighboring voxels using bounds check results
				var p = (B[0][0] && B[1][0] && B[2][0]) ? volume[n] : false
					, b = [(B[0][1] && B[1][0] && B[2][0]) ? volume[n + 1] : false
						, (B[0][0] && B[1][1] && B[2][0]) ? volume[n + dims[0]] : false
						, (B[0][0] && B[1][0] && B[2][1]) ? volume[n + dims[0] * dims[1]] : false
					];
				//Generate faces
				for (var d = 0; d < 3; ++d)
					if (p != b[d]) {
						var t = [x[0], x[1], x[2]]
							, u = dir[d][0]
							, v = dir[d][1];
						++t[d];
						quads.push([
							[t[0], t[1], t[2]]
							, [t[0] + u[0], t[1] + u[1], t[2] + u[2]]
							, [t[0] + u[0] + v[0], t[1] + u[1] + v[1], t[2] + u[2] + v[2]]
							, [t[0] + v[0], t[1] + v[1], t[2] + v[2]]
						]);
					}
			}
	return quads;
}

function StupidMesh(volume: number[], dims: Vec3) {
	//vert:number[3]
	//quad : vert[4]
	//quads: quad[]
	var quads: number[][][] = [], xyz = [0, 0, 0], n = 0;
	for (xyz[2] = 0; xyz[2] < dims.z; ++xyz[2])
		for (xyz[1] = 0; xyz[1] < dims.y; ++xyz[1])
			for (xyz[0] = 0; xyz[0] < dims.x; ++xyz[0])
				if (volume[n++]) {
					for (var d = 0; d < 3; ++d) {
						var t = [xyz[0], xyz[1], xyz[2]]
							, u = [0, 0, 0]
							, v = [0, 0, 0];
						u[(d + 1) % 3] = 1;
						v[(d + 2) % 3] = 1;
						for (var s = 0; s < 2; ++s) {
							t[d] = xyz[d] + s;
							quads.push([
								[t[0], t[1], t[2]]
								, [t[0] + u[0], t[1] + u[1], t[2] + u[2]]
								, [t[0] + u[0] + v[0], t[1] + u[1] + v[1], t[2] + u[2] + v[2]]
								, [t[0] + v[0], t[1] + v[1], t[2] + v[2]]
							]);
						}
					}
				}
	return quads;
}

