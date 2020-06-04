import {Broadphase} from './Broadphase.js';
import {Vec3} from '../math/Vec3.js';
import {World, AddBodyEvent, RemoveBodyEvent} from '../world/World.js';
import {Body, BODYTYPE} from '../objects/Body.js';
import { AABB } from './AABB.js';
import { PhyRender } from '../layawrap/PhyRender.js';
import { Box } from '../shapes/Box.js';

/**
 * 在Body身上记录grid相关的信息。
 */
export class GridInfo{
	//udpateAABB=false;
	body:Body;
	/** 
	 * 这个是记录自己的所占用的所有的格子
	 * 用于清理。由于边界会调整，所以用格子对象而不是id 
	 * 而是指向包含自己的列表
	*/
	grids:GridInfo[][]|null=null;
	sys:GridBroadphase1;		//TODO 去掉这个，节省内存
	/** 在活动列表的位置，用于快速移除,-1表示不在活动列表中 */
	activeid=-1; 	
	private sleepListener:EventListener;
	private awakeListener:EventListener;
	constructor(body:Body,sys:GridBroadphase1){
		this.body=body;
		this.sys=sys;
		this.sleepListener = this.onSleepEvent.bind(this);
		this.awakeListener = this.onWakeupEvent.bind(this);

		body.addEventListener(Body.sleepEvent.type, this.sleepListener);
		body.addEventListener(Body.wakeupEvent.type, this.awakeListener);
	}

	onSleepEvent(){
		this.sys.onBodySleep(this);
	}
	onWakeupEvent(){
		this.sys.onBodyWakeup(this);
	}

	/** 注意这个会调用很多次 */
	onNeedUpdate(){
		if(this.activeid<0)
			this.sys.onBodyWakeup(this);
	}
}

class GridMgr{
	/** 记录对象列表 */
	grids:GridInfo[][]=[];
	/** 添加到活动列表的时间。用来快速判断是否重复添加 */	
	private addToActiveTick:int[]=[];

	/** 记录当前帧被更新的格子 */
	activeGrids:int[]=[];
	/** 是否要记录被更新的格子 */
	private recActive=false;
	private  tick=0;
	private min=new Vec3();
	private max=new Vec3();
	private gridw=10;
	private nx=50;
	private ny=50;
	private nz=50;
	constructor(min:Vec3, max:Vec3, gridw:number, recActive:boolean){
		this.gridw=gridw;
		this.min.copy(min);
		this.max.copy(max);
		this.recActive=recActive;
		this.nx = Math.ceil((max.x-min.x)/gridw);
		this.ny = Math.ceil((max.y-min.y)/gridw);
		this.nz = Math.ceil((max.z-min.z)/gridw);
	}

	clear(){
		this.grids.length=0;
		this.addToActiveTick.length=0;
		this.activeGrids.length=0;
	}

	newTick(){
		this.tick++;
		this.activeGrids.length=0;
	}

	static cleanGridInfo(b:GridInfo){
		if(b.grids){
			// 清理自己记录的格子信息
			b.grids.forEach( (g:GridInfo[])=>{
				let pos = g.indexOf(b);
				if(pos>=0){
					g[pos]=g[g.length-1];
					g.pop();
				}
			});
			b.grids=null;
		}
	}

	add(b:GridInfo){
		// 先清理b原来的记录
		if(b.grids && b.grids.length)
			GridMgr.cleanGridInfo(b);

		var bgrids = b.grids;
		if(!bgrids){
			bgrids=b.grids=[];
		}
		let aabb = b.body.aabb;
		let bmin = aabb.lowerBound;
		let bmax = aabb.upperBound;
		let min = this.min;
		//let max = this.max;

		let nx=this.nx;
		let ny=this.ny;
		let nz=this.nz;
		let nxy=nx*ny;
		let maxx = nx-1;
		let maxy=ny-1;
		let maxz=nz-1;

		let grids = this.grids;
		let w = this.gridw;
		let xs=((bmin.x-min.x)/w)|0; if(xs<0)xs=0; if(xs>maxx)xs=maxx;
		let ys=((bmin.y-min.y)/w)|0; if(ys<0)ys=0; if(ys>maxy)ys=maxy;
		let zs=((bmin.z-min.z)/w)|0; if(zs<0)zs=0; if(zs>maxz)zs=maxz;
		let xe=Math.ceil((bmax.x-min.x)/w); if(xe<0)xe=0; if(xe>maxx)xe=maxx;
		let ye=Math.ceil((bmax.y-min.y)/w);	if(ye<0)ye=0; if(ye>maxy)ye=maxy;
		let ze=Math.ceil((bmax.z-min.z)/w); if(ze<0)ze=0; if(ze>maxz)ze=maxz;
		let rec = this.recActive;
		let recticks = this.addToActiveTick;
		for(let z=zs; z<=ze; z++){
			for(let y=ys; y<=ye; y++){
				for(let x=xs; x<=xe; x++){
					let id = x+y*nx+z*nxy;
					var cgrid = grids[id];
					if(!cgrid){
						cgrid=grids[id]=[];
					}
					cgrid.push(b);
					bgrids.push(cgrid);
					if(rec){
						if(recticks[id]!=this.tick){
							recticks[id]=this.tick;
							this.activeGrids.push(id);
						}
					}
				}
			}
		}
	}

	remove(b:GridInfo){
		GridMgr.cleanGridInfo(b);
	}


	rayQuery(from:Vec3, to:Vec3, result:Body[]){
		let min = this.min;
		let max = this.max;
		let w = this.gridw;

	}

	/**
	 * 根据一个aabb来查询可能遇到的body。
	 * 注意如果aabb很大的话，这个效率会非常低，例如长距射线检测，这种情况要用rayQuery
	 * 
	 * @param aabbmin 
	 * @param aabbmax 
	 * @param result 
	 */
	aabbQuery(aabbmin:Vec3,aabbmax:Vec3, result:Body[]){
		let nx=this.nx;
		let ny=this.ny;
		let nz=this.nz;
		let nxy=nx*ny;
		let maxx = nx-1;
		let maxy=ny-1;
		let maxz=nz-1;

		let min = this.min;
		let max = this.max;
		let grids = this.grids;
		let w = this.gridw;
		let xs=((aabbmin.x-min.x)/w)|0; if(xs<0)xs=0; if(xs>maxx)xs=maxx;
		let ys=((aabbmin.y-min.y)/w)|0; if(ys<0)ys=0; if(ys>maxy)ys=maxy;
		let zs=((aabbmin.z-min.z)/w)|0; if(zs<0)zs=0; if(zs>maxz)zs=maxz;
		let xe=Math.ceil((aabbmax.x-min.x)/w); if(xe<0)xe=0; if(xe>maxx)xe=maxx;
		let ye=Math.ceil((aabbmax.y-min.y)/w);	if(ye<0)ye=0; if(ye>maxy)ye=maxy;
		let ze=Math.ceil((aabbmax.z-min.z)/w); if(ze<0)ze=0; if(ze>maxz)ze=maxz;
		/** 避免重复添加 */
		let uniqueBody=[];
		for(let z=zs; z<=ze; z++){
			for(let y=ys; y<=ye; y++){
				for(let x=xs; x<=xe; x++){
					let id = x+y*nx+z*nxy;
					let cgrid = grids[id];
					if(!cgrid) continue;
					for(let k=0,bl=cgrid.length; k<bl; k++){
						let cb = cgrid[k].body;
						if(!uniqueBody[cb.id]){
							uniqueBody[cb.id]=1;
							result.push(cb);
						}
					}
				}
			}
		}
	}
}

/**
 * 基于格子的宽阶段碰撞检测。
 * 分成静止和动态两个格子，动态的每次都清理，不过为了供射线检测等其他随时使用的地方，需要每帧间有效
 * 静态的一直保存，一旦active就要从静态格子删除
 * 
 * 在集中处理动态对象之后，每次对某个动态对象的修改都会导致更新当前对象的格子，以保证结果正确
 * 
 * 注意 超出范围的会被忽略
 * 
 * 总格子数不用太大
 * 
 * 流程
 * 	world.update
 * 		// 把动态对象分到格子中	：当前格子存的上一帧
 * 			不要了，用上一帧的 @1
 * 			clear动态
 * 		solve
 * 		计算新的位置			：希望当前存的是当前帧的
 * 			更新动态对象的格子		@1
 * 		applyPose to Render
 * 
 * 	其他对象的update
 * 		逻辑，例如射线检测
 */
export class GridBroadphase1 extends Broadphase {
	// 超过最大范围就不管了，防止出现一个body不断下落导致的范围越来越大的问题。
	static MaxValue = 1e6;	//1e6如果用八叉树的话是20层
	static MinValue = -1e6;
	static bigBodySize=1000;	// 超过这个值的算作超大对象

	/** 格子大小 */
	gridsz=10;

	//当前包围盒
	min=new Vec3(-1000,-1000,-1000);
	max=new Vec3(1000,1000,1000);

    nx = 10;
    ny = 10;
	nz = 10;

	/** 新加入的都作为uninitedbody，一旦更新一次以后，就从这里删掉了 */
	uninitedBodies:Body[]=[];

	/** 活动对象。因为活动对象是每次都重新计算所在格子，所以需要单独记录 */
	activeBodies:GridInfo[]=[];

	/** 静态对象或者sleep的对象占的格子 */
	private staticGrid = new GridMgr(this.min,this.max,this.gridsz,false);
	/** 动态对象占的格子 */
	private dynaGrid = new GridMgr(this.min,this.max,this.gridsz,true);

	/** 超大模型。这个模型放到格子中占用的格子太多，所以单独处理 */
	private bigBodies:Body[]=[];

	/** 有活动对象的格子 */
	//private activeGrids:[]=[];

	private addBodyListener:EventListener;
	private removeBodyListener:EventListener;

    constructor(nx:i32=50, ny:i32=50, nz:i32=50) {
        super();
        this.nx = nx;
        this.ny = ny;
		this.nz = nz;
		this.gridsz = (this.max.x-this.min.x)/nx;
		
		this.addBodyListener = this.onAddBody.bind(this);
		this.removeBodyListener = this.onRemoveBody.bind(this);
	}

	//============== body的维护部分 ================

	onAddBody(e:AddBodyEvent){
		let b = e.body;
		if(!b) return;
		// 注意type可能会变
		// 刚添加进去的时候可能还没有设置位置，aabb是不对的
		this.uninitedBodies.push(b);
	}

	onRemoveBody(e:RemoveBodyEvent){
		let b = e.body;
		if(!b)return;
		// 先从未处理列表中删除
		let unhandled = this.uninitedBodies;
		let pos = unhandled.indexOf(b);
		if(pos>=0){
			unhandled[pos] = unhandled[unhandled.length-1];
			unhandled.pop();
		}else{
			// 未处理列表没有，则要从格子中删除
			let ginfo = b.gridinfo;
			if(!ginfo)return;
			if(ginfo.activeid>=0)
				this.dynaGrid.remove(ginfo);
			else this.staticGrid.remove(ginfo);
		}

		// 在大对象列表中么
		pos = this.bigBodies.indexOf(b);
		if(pos>=0){
			this.bigBodies[pos]=this.bigBodies[this.bigBodies.length-1];
			this.bigBodies.pop();
			return;
		}
	}

	/**
	 * 有的body刚加进来，还没有分配是动态的还是静态的
	 */
	private handle_uninitedBody(){
		let wmin = this.min;
		let wmax = this.max;

		let uninited:Body[] = this.uninitedBodies;
		for( let i=0,len=uninited.length; i<len; i++){
			let b = uninited[i];
			b.aabbNeedsUpdate && b.updateAABB();
			let min = b.aabb.lowerBound;
			let max = b.aabb.upperBound;
			if(!b.gridinfo){
				b.gridinfo =new GridInfo(b,this);
				// 新加入的都作为uninitedbody，一旦更新一次以后，就从这里删掉了
			}
	
			switch(b.type){
				case BODYTYPE.STATIC:
					// 静态对象直接放到格子中
					this.addToStatic(b.gridinfo)
					// 更新包围盒。 动态的会在下面更新
					break;
				case BODYTYPE.DYNAMIC:
				case BODYTYPE.KINEMATIC:
					// 动态对象先存到active列表中
					this.addToDynamic(b.gridinfo);

				break;
			}
			this.updateWorldBBX(min,max,wmin,wmax);	// TODO 要区分动态静态么
		}
		uninited.length=0;
	}	

	// ============= body状态管理 ==================
	onBodySleep(b:GridInfo){
		// TODO 延迟加入静态
		this.addToStatic(b);
	}
	/** body状态改变，从静态列表中删除 */
	onBodyWakeup(b:GridInfo){
		this.addToDynamic(b);
	}

	onBodyMoved(b:GridInfo){
		this.addToDynamic(b);
	}

	/** 某个body表示自己处于非静止状态 */
	private activeBody(b:GridInfo){
		let acts = this.activeBodies;
		let gridinfo = b;
		if(b.activeid<0){
			// 这表示原来是静止的,已经记录在静止数组中了。或者是第一次加入
			//  从静止数组中删除这个body
			if(gridinfo.grids){
				// 清理自己记录的格子信息
				gridinfo.grids=null;
			}
			gridinfo.activeid = acts.length;
		}else{
			// 已经是动态的了
		}
	}

	private deactiveBody(b:Body){
		let acts = this.activeBodies;
		let gridinfo = b.gridinfo;
		if(gridinfo){
			if(gridinfo.activeid>=0){
				// 从活动列表中删除
				acts[gridinfo.activeid] = acts[acts.length-1];
				acts.length-=1;
				// 添加到静态数组中
				let aabb = b.aabb;
				aabb.lowerBound;
				aabb.upperBound;
				//TODO 负的
				// TODO 计算所占格子
			}else{
				// 已经是静态的了
			}
			
		}else{
			console.error('err2');
		}
	}

	// ============= 格子分配管理==================

	/**
	 * 直接加到静态格子中，如果之前是动态的要处理一下
	 * @param b 
	 */
	private addToStatic(b:GridInfo){
		let acts = this.activeBodies;
		if(b.activeid>=0){
			// 从动态中删除
			if(acts[b.activeid]==b){
				let endbody = acts[acts.length-1];
				acts[b.activeid]=endbody;
				acts.pop();
				endbody.activeid=b.activeid;
			}else{
				console.error('eeee262');
			}
			b.activeid=-1;
		}
		// 清理自己记录的格子信息 加入静态
		let aabb = b.body.aabb;
		let bmax = aabb.upperBound;
		let bmin = aabb.lowerBound;
		let bigsize = GridBroadphase1.bigBodySize;
		if(bmax.x-bmin.x>bigsize ||
			bmax.y-bmin.y>bigsize ||
			bmax.z-bmin.z>bigsize){
				this.bigBodies.push(b.body);
			}else{
				this.staticGrid.add(b);
			}		
	}

	/**
	 * 添加到动态列表中
	 * @param b 
	 */
	private addToDynamic(b:GridInfo){
		if(b.activeid<0){
			// 这表示原来是静止的,已经记录在静止数组中了。或者是第一次加入
			// 加入动态
			b.activeid=this.activeBodies.length;
			this.activeBodies.push(b);
		}else{
			if(this.activeBodies[b.activeid]!=b){
				console.error('eeeee ');
			}
		}
	}

	/** 更新过程中发现需要调整边界了 */
	private resetBBX(xmin:number,ymin:number,zmin:number, xmax:number,ymax:number,zmax:number){
		this.min.set(xmin,ymin,zmin);
		this.max.set(xmax,ymax,zmax);
	}
	

	getGridByPos(x:number,y:number,z:number){
		let gridsz = this.gridsz;
		Math.floor(x/gridsz); Math.floor(y/gridsz); Math.floor(z/gridsz);
		this.nx;
	}

	private autoCalcGridsz(){

	}

	/**
	 * 某个grid中的数据没有了
	 * @param x 
	 * @param y 
	 * @param z 
	 */
	private clearGrid(x:int,y:int,z:int){

	}

	setWorld(world: World) {
		world.addEventListener('addBody',this.addBodyListener);
		world.addEventListener('removeBody',this.removeBodyListener);
	}



	private updateWorldBBX(bmin:Vec3,bmax:Vec3,wmin:Vec3,wmax:Vec3){
		// 加最大值限制会不会有问题呢
		if(bmin.x<wmin.x && bmin.x>GridBroadphase1.MinValue) wmin.x=bmin.x;
		if(bmin.y<wmin.y && bmin.y>GridBroadphase1.MinValue) wmin.y=bmin.y;
		if(bmin.z<wmin.z && bmin.z>GridBroadphase1.MinValue) wmin.z=bmin.z;
		if(bmax.x>wmax.x && bmax.x<GridBroadphase1.MaxValue) wmax.x=bmax.x;
		if(bmax.y>wmax.y && bmax.y<GridBroadphase1.MaxValue) wmax.y=bmax.y;
		if(bmax.z>wmax.z && bmax.z<GridBroadphase1.MaxValue) wmax.z=bmax.z;
	}

	// ============== BroadPhase 接口 ===================

	hasRayQuery(){return true;}

	aabbQuery(world: World, aabb: AABB, result: Body[]): Body[] {
		let min = aabb.lowerBound;
		let max = aabb.upperBound;
		result.length=0;
		// dynamic
		this.dynaGrid.aabbQuery(min,max,result);
		// static
		this.staticGrid.aabbQuery(min,max,result);
		// big obj
		let bigs = this.bigBodies;
		let bignum = bigs.length;
		for(let i=0; i<bignum; i++){
			let bigb = bigs[i];
			bigb.aabbNeedsUpdate && bigb.updateAABB();
			if(aabb.overlaps(bigb.aabb)){
				result.push(bigb);
			}
		}
		return result;
	}

	/**
	 * 动态格子内部的互相检测
	 * @param grid 
	 * @param pairs1 
	 * @param pairs2 
	 */
	private collisionInGrid(grid:GridInfo[], pairs1:Body[],pairs2:Body[]){
		let n = grid.length;
		for(let i=0; i<n; i++){
			let bi = grid[i].body;
			for(let j=i+1; j<n; j++){
				let bj = grid[j].body;
                if (!this.needBroadphaseCollision(bi, bj)) {
                    continue;
                }

                this.intersectionTest(bi, bj, pairs1, pairs2);
			}
		}
	}

	/**
	 * 动态格子中的每个对象与静态格子中的每个对象检测
	 * @param dynaGrid 
	 * @param stGrid 
	 * @param pairs1 
	 * @param pairs2 
	 */
	private dynaGridCollisionWithStaticGrid(dynaGrid:GridInfo[],stGrid:GridInfo[],pairs1:Body[], pairs2:Body[]){
		let dn = dynaGrid.length;
		let sn = stGrid.length;
		for(let i=0; i<dn; i++){
			let bi = dynaGrid[i].body;
			for(let j=0; j<sn; j++){
				let bj = stGrid[j].body;
                if (!this.needBroadphaseCollision(bi, bj)) {
                    continue;
                }

                this.intersectionTest(bi, bj, pairs1, pairs2);
			}
		}
	}

    /**
	 * 
     */
    collisionPairs1(world: World, pairs1: Body[], pairs2: Body[]) {
		let wmin = this.min;
		let wmax = this.max;
		let bbxchanged=true;

		// 
		this.handle_uninitedBody();

		// 动态的直接清理重建
		let dynaGrid = this.dynaGrid;
		dynaGrid.newTick();
		dynaGrid.clear();

		let bigs = this.bigBodies;
		let bignum = this.bigBodies.length;
		let acts = this.activeBodies;
		// 根据动态对象得到所有的动态格子。同时处理大对象
		for( let i=0,l=acts.length; i<l; i++){
			let abg = acts[i];
			// 由于是重新创建，所以不用挨个清理，直接把数组清掉就行了
			if(abg.grids)abg.grids.length=0;
			let bi = abg.body;
			bi.aabbNeedsUpdate && bi.updateAABB();
			let min = bi.aabb.lowerBound;
			let max = bi.aabb.upperBound;
			// 更新包围盒
			this.updateWorldBBX(min,max,wmin,wmax);

			// 根据aabb更新到动态格子中
			dynaGrid.add(abg);

			// 动态对象与大的静态对象的检测
			for(let j=0; j<bignum; j++){
				let bj = bigs[j];
                if (!this.needBroadphaseCollision(bi, bj)) {
                    continue;
                }
                this.intersectionTest(bi, bj, pairs1, pairs2);
			}
		}

		let worldxs = wmax.x-wmin.x;
		let worldys = wmax.y-wmin.y;
		let worldzs = wmax.z-wmin.z;
		let gridsz = this.gridsz;

		let xn = Math.ceil(worldxs/gridsz);
		let yn = Math.ceil(worldys/gridsz);
		let zn = Math.ceil(worldzs/gridsz);

		// 处理所有的动态格子
		let activeids = dynaGrid.activeGrids;
		let agrids = dynaGrid.grids;
		let stgrids = this.staticGrid.grids;
		for(let i=0,l=activeids.length; i<l; i++){
			let gridid = activeids[i];
			let grid = agrids[ gridid ];
			this.collisionInGrid(grid,pairs1,pairs2);
			// 与所有的静态的碰撞
			let stgrid = stgrids[gridid];
			if(stgrid)
				this.dynaGridCollisionWithStaticGrid(grid,stgrid,pairs1,pairs2);
		}

		this.makePairsUnique(pairs1, pairs2);
	}
	
    /**
     * Get all the collision pairs in the physics world
     */
    collisionPairs(world:World, pairs1:Body[], pairs2:Body[]) {
		//TEST
		this.collisionPairs1(world,pairs1,pairs2);
		return;
		//TESt
        const bodies = world.bodies;
        const n = bodies.length;
        let i:number;
        let j:number;
        let bi:Body;
        let bj:Body;

        // Naive N^2 ftw!
        for (i = 0; i !== n; i++) {
			bi = bodies[i];
            for (j = 0; j !== i; j++) {
                bj = bodies[j];
                if (!this.needBroadphaseCollision(bi, bj)) {
                    continue;
                }

				// 这里会更新AABB包围盒
                this.intersectionTest(bi, bj, pairs1, pairs2);
            }
        }
	}
	
	// ============== 调试辅助接口 ==============

	renderGrid(render:PhyRender){
		//render.addAABB()
	}

}
