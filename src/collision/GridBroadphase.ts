import {Broadphase} from './Broadphase.js';
import {Vec3} from '../math/Vec3.js';
import {World, AddBodyEvent, RemoveBodyEvent} from '../world/World.js';
import {Body, BODYTYPE} from '../objects/Body.js';
import { AABB } from './AABB.js';
import { PhyRender } from '../layawrap/PhyRender.js';
import { Box } from '../shapes/Box.js';
import { Ray, BodyRunDataStack, RayMode } from './Ray.js';

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
	sys:GridBroadphase;		//TODO 去掉这个，节省内存
	/** 在活动列表的位置，用于快速移除,-1表示不在活动列表中 */
	activeid=-1; 	// -1表示静态， -2表示大模型
	private sleepListener:EventListener;
	private awakeListener:EventListener;
	constructor(body:Body,sys:GridBroadphase){
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

/**
 * 通用格子管理类
 * 
 */
class GridMgr{
	objnum=0;
	/** 记录对象列表 [包含的所有的对象][格子xyz组成的hash] */
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

	/**
	 * 清理。目前只有动态对象格子用到
	 */
	newTick(){
		this.tick++;
		this.activeGrids.length=0;
		this.objnum=0;
	}

	static cleanGridInfo(b:GridInfo):boolean{
		let find=false;
		if(b.grids){
			// 清理自己记录的格子信息
			b.grids.forEach( (g:GridInfo[])=>{
				let pos = g.indexOf(b);
				if(pos>=0){
					find=true;
					g[pos]=g[g.length-1];
					g.pop();
				}
			});
			b.grids=null;
		}
		return find;
	}

	add(b:GridInfo){
		this.objnum++;
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
		if(GridMgr.cleanGridInfo(b)){
			this.objnum--;
		}
	}

	/**
	 * 根据aabb唤醒可能影响到的对象
	 * @param min 
	 * @param max 
	 */
	wakeupByAABB(min:Vec3, max:Vec3){

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
 * 
 * 分成静止和动态两个格子，动态的每次都更新每个对象的位置并分配格子，不过为了供射线检测等其他随时使用的地方，需要每帧间有效。
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
export class GridBroadphase extends Broadphase {
	// 超过最大范围就不管了，防止出现一个body不断下落导致的范围越来越大的问题。
	static MaxValue = 1e6;	//1e6如果用八叉树的话是20层
	static MinValue = -1e6;
	static bigBodySize=1000;	// 超过这个值的算作超大对象。这个会动态改变

	objnum=0;
	/** 格子大小 */
	gridsz=20;

	//当前包围盒
	min=new Vec3(-1000,-1000,-1000);
	max=new Vec3(1000,1000,1000);

	// 场景中的对象实际占用的空间
	objsMin = new Vec3(10000,10000,10000);
	objsMax = new Vec3(-10000,-10000,-10000);

    nx = 10;
    ny = 10;
	nz = 10;

	/** 新加入的都作为uninitedbody，一旦更新一次以后，就从这里删掉了 */
	uninitedBodies:Body[]=[];

	/** 活动对象。因为活动对象是每次都重新计算所在格子，所以需要单独记录 */
	activeBodies:GridInfo[]=[];

	/** 静态对象或者sleep的对象占的格子 */
	private staticGrid:GridMgr; 
	/** 动态对象占的格子 */
	private dynaGrid:GridMgr;

	/** 不归格子管理的模型，例如超大模型，距离太远的模型。这些模型放到格子中占用的格子太多，或者导致空间太大，所以单独处理 */
	private otherBodies:Body[]=[];

	/** 有活动对象的格子 */
	//private activeGrids:[]=[];

	private addBodyListener:EventListener;
	private removeBodyListener:EventListener;

    constructor(nx:i32=100, ny:i32=100, nz:i32=100) {
		super();
		this.useBoundingBoxes=true;	// 反正都要计算包围盒，就用aabb判断把
        this.nx = nx;
        this.ny = ny;
		this.nz = nz;
		this.gridsz = (this.max.x-this.min.x)/nx;
		GridBroadphase.bigBodySize = this.gridsz*40;
		this.staticGrid = new GridMgr(this.min,this.max,this.gridsz,false);
		this.dynaGrid = new GridMgr(this.min,this.max,this.gridsz,true);
		this.addBodyListener = this.onAddBody.bind(this);
		this.removeBodyListener = this.onRemoveBody.bind(this);
		// debug info
		let win = window as any;
		if(!win.wuli) win.wuli={};
		if(win.wuli){
			win.wuli.gridmgr=this;
		}
	}

	//============== body的维护部分 ================

	onAddBody(e:AddBodyEvent){
		this.objnum++;

		let b = e.body;
		if(!b) return;
		// 注意type可能会变
		// 刚添加进去的时候可能还没有设置位置，aabb是不对的
		this.uninitedBodies.push(b);
	}

	onRemoveBody(e:RemoveBodyEvent){
		this.objnum--;
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
			if(ginfo.activeid>=0){
				// 从动态对象删除
				this.removeFromActiveBody(b);
				this.dynaGrid.remove(ginfo);
			}
			else this.staticGrid.remove(ginfo);

			// 在其他对象列表中么
			pos = this.otherBodies.indexOf(b);
			if(pos>=0){
				this.otherBodies[pos]=this.otherBodies[this.otherBodies.length-1];
				this.otherBodies.pop();
				return;
			}
		}

	}

	/**
	 * 有的body刚加进来，还没有分配是动态的还是静态的
	 */
	private handle_uninitedBody(){
		let wmin = this.objsMin;
		let wmax = this.objsMax;

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

	// ============= 格子分配管理==================

	private removeFromActiveBody(b:Body):boolean{
		//查找并删除
		let acts = this.activeBodies;
		let i=0,l = acts.length;
		for(;i<l; i++){
			let cg = acts[i];
			if(cg.body==b){
				acts[i]=acts[l-1];
				acts[i].activeid=i;
				acts.pop();
				return true;
			}
		}
		return false;
	}
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
		}else if(b.activeid==-2){
			// 从其他列表中删除
			this.removeFromOtherBodies(b.body);
			b.activeid=-1;	// 防止下面走不到
		}else{
			// 清理原来的静态信息
			this.staticGrid.remove(b);
		}

		// 清理自己记录的格子信息 加入静态
		let aabb = b.body.aabb;
		let bmax = aabb.upperBound;
		let bmin = aabb.lowerBound;
		let bigsize = GridBroadphase.bigBodySize;
		if(bmax.x-bmin.x>bigsize ||
			bmax.y-bmin.y>bigsize ||
			bmax.z-bmin.z>bigsize || this.outofWorldAABB(aabb)){
				if(b.activeid!=-2)
					this.otherBodies.push(b.body);
				b.activeid=-2;
			}else{
				this.staticGrid.add(b);
			}		
	}

	/**
	 * 超出世界格子范围了。这个暂时放到其他中用暴力检测
	 * @param b 
	 */
	private outofWorldAABB(b:AABB):boolean{
		let min = b.lowerBound;
		let max = b.upperBound;
		let wmin = this.min;
		let wmax = this.max;
		if(	max.x>wmax.x ||
			max.y>wmax.y ||
			max.z>wmax.z ||
			min.x<wmin.x ||
			min.y<wmin.y ||
			min.z<wmin.z
			) return true;
		return false;
	}

	/**
	 * 添加到动态列表中
	 * @param b 
	 */
	private addToDynamic(b:GridInfo){
		// 太大的物体还是单独处理吧
		let aabb = b.body.aabb;
		let bmax = aabb.upperBound;
		let bmin = aabb.lowerBound;
		let bigsize = GridBroadphase.bigBodySize;
		if(bmax.x-bmin.x>bigsize ||
			bmax.y-bmin.y>bigsize ||
			bmax.z-bmin.z>bigsize || this.outofWorldAABB(aabb)){
				if(b.activeid!=-2)
					this.otherBodies.push(b.body);
				b.activeid=-2;
				return;
		}		

		if(b.activeid<0){
			if(b.activeid==-2){
				// 从其他列表中删除。既然没有满足上面的条件，说明大小合适
				this.removeFromOtherBodies(b.body);
			}else{
				// 这表示原来是静止的,已经记录在静止数组中了。或者是第一次加入
				this.staticGrid.remove(b);
			}
			// 加入动态
			b.activeid=this.activeBodies.length;
			this.activeBodies.push(b);
		}else{
			// 已经是动态的了，检查一下
			if(this.activeBodies[b.activeid]!=b){
				console.error('eeeee ');
			}
		}
	}

	private removeFromOtherBodies(b:Body){
		let others = this.otherBodies;
		let pos = others.indexOf(b);
		if(pos>=0){
			others[pos]=others[others.length-1];
			others.pop();
		}
	}

	/** 更新过程中发现需要调整边界了 */
	private resetBBX(xmin:number,ymin:number,zmin:number, xmax:number,ymax:number,zmax:number){
		this.min.set(xmin,ymin,zmin);
		this.max.set(xmax,ymax,zmax);
	}
	

	private autoCalcGridsz(){

	}

	setWorld(world: World) {
		world.addEventListener('addBody',this.addBodyListener);
		world.addEventListener('removeBody',this.removeBodyListener);
	}

	private updateWorldBBX(bmin:Vec3,bmax:Vec3,wmin:Vec3,wmax:Vec3){
		// 加最大值限制会不会有问题呢
		if(bmin.x<wmin.x && bmin.x>GridBroadphase.MinValue) wmin.x=bmin.x;
		if(bmin.y<wmin.y && bmin.y>GridBroadphase.MinValue) wmin.y=bmin.y;
		if(bmin.z<wmin.z && bmin.z>GridBroadphase.MinValue) wmin.z=bmin.z;
		if(bmax.x>wmax.x && bmax.x<GridBroadphase.MaxValue) wmax.x=bmax.x;
		if(bmax.y>wmax.y && bmax.y<GridBroadphase.MaxValue) wmax.y=bmax.y;
		if(bmax.z>wmax.z && bmax.z<GridBroadphase.MaxValue) wmax.z=bmax.z;
	}

	// ============== 格子策略管理 ===================
	/**
	 *  开始用暴力方法
	 *  满足一定条件之后放到格子中
	 * 	满足一定条件后修改格子的宽度
	 *  包围盒变化太大的情况下修改包围盒的大小
	 */


	// ============== BroadPhase 接口 ===================

	hasRayQuery(){return true;}


	rayIntersectGrids(ray:Ray, grids: GridInfo[], rundataStack:BodyRunDataStack,checkid:int):boolean {
		// 注意ray必须已经reset了
		for (let i = 0, l = grids.length; i < l; i++) {
			let curbody = grids[i].body;
			if(!curbody.enable) continue;
			// 已经检查了
			if(curbody.runData==checkid) continue;
			// 记录修改rundata的body
			curbody.runData=checkid;
			rundataStack.pushBody(curbody); 

			curbody.aabbNeedsUpdate && curbody.updateAABB();
			ray.intersectBody(curbody);
			if(ray.result._shouldStop)
				return true;
		}
		return ray.result.hasHit;
	}	

	/**
	 * 不能单独调用。只允许Ray调用。这里没有对ray执行reset
	 * @param world 
	 * @param ray 
	 */
	rayIntersect( ray:Ray, rundatastack:BodyRunDataStack, checkid:int):boolean{
		let min = this.min;
		let max = this.max;
		let w = this.gridsz;

		//先用包围盒裁剪
		let nst = rayQuery_tmpV1;
		let ned = rayQuery_tmpV2;

		let from = ray.from;
		let to = ray.to;
		if (!Box.rayHitBox(from, to, min, max, nst, ned))
			return false;

		nst.x-=min.x; nst.y-=min.y; nst.z-=min.z;
		ned.x-=min.x; ned.y-=min.y; ned.z-=min.z;
		//debug
		//let phyr =  getPhyRender();
		//let wpos = new Vec3();
		//phyr.addPersistPoint( this.pointToWorld(nst, wpos));
		//phyr.addPersistPoint( this.pointToWorld(ned,wpos));
		//debug

		//dir
		let nx = ned.x - nst.x;
		let ny = ned.y - nst.y;
		let nz = ned.z - nst.z;
		let len = Math.sqrt(nx * nx + ny * ny + nz * nz);	// voxel中没有 sqrt 是为什么
		let dirx = nx / len;
		let diry = ny / len;
		let dirz = nz / len;

		// 起点格子
		let x0 = (nst.x / w) | 0;	// 不可能<0所以可以直接 |0
		let y0 = (nst.y / w) | 0;
		let z0 = (nst.z / w) | 0;

		// 终点格子
		let x1 = (ned.x / w) | 0;
		let y1 = (ned.y / w) | 0;
		let z1 = (ned.z / w) | 0;

		// 由于点可能在边缘，因此有可能正好超出，做一下保护
		let sizex = this.nx;
		let sizey = this.ny;
		let sizexy=sizex*sizey
		let maxx = this.nx-1;
		let maxy = this.ny-1;
		let maxz = this.nz-1;

		if(x0>maxx) x0=maxx;
		if(x1>maxx) x1=maxx;
		if(y0>maxy) y0=maxy;
		if(y1>maxy) y1=maxy;
		if(z0>maxz) z0=maxz;
		if(z1>maxz) z1=maxz;

		//确定前进方向
		let sx = x1 > x0 ? 1 : x1 < x0 ? -1 : 0;
		let sy = y1 > y0 ? 1 : y1 < y0 ? -1 : 0;
		let sz = z1 > z0 ? 1 : z1 < z0 ? -1 : 0;

		// 从开始到结束的长度
		let fdx = Math.abs(ned.x - nst.x);
		let fdy = Math.abs(ned.y - nst.y);
		let fdz = Math.abs(ned.z - nst.z);

		let absdirx = Math.abs(dirx);
		let absdiry = Math.abs(diry);
		let absdirz = Math.abs(dirz);

		let t = Math.sqrt((fdx * fdx + fdy * fdy + fdz * fdz)/(absdirx*absdirx+absdiry*absdiry+absdirz*absdirz));//其实也可以判断x,y,z但是由于不知道方向，所以把复杂的事情留到循环外面
		// 每经过一个格子需要的时间
		let xt = absdirx > 1e-6 ? w / absdirx : 10000;
		let yt = absdiry > 1e-6 ? w / absdiry : 10000;
		let zt = absdirz > 1e-6 ? w / absdirz : 10000;

		//由于起点不在0,0,0因此需要计算到下一个面的时间，第一次需要计算，以后直接加就行
		let t1 = nst.x % w/w;
		let t2 = nst.y % w/w;
		let t3 = nst.z % w/w;
		if(sx>0)t1=1-t1;
		if(sy>0)t2=1-t2;
		if(sz>0)t3=1-t3;
		let maxX = t1 * xt;
		let maxY = t2 * yt;
		let maxZ = t3 * zt;

		let cx = x0;
		let cy = y0;
		let cz = z0;
		let end = false;
		let staticGrid = this.staticGrid;
		let dynamicGrid = this.dynaGrid;
		while (!end) {
			let id = cx+cy*sizex+cz*sizexy;
			let sbodies = dynamicGrid.grids[id];
			if(sbodies){
				this.rayIntersectGrids(ray,sbodies, rundatastack,checkid);
				if(ray.result._shouldStop)
					return true;
			}
			let dbodies = staticGrid.grids[id];
			if(dbodies){
				this.rayIntersectGrids(ray,dbodies,rundatastack,checkid);
				if(ray.result._shouldStop)
					return true;
			}

			// 要求最近点的话，如果当前格子有碰撞，则没有必要继续下面的格子了。不过还要继续检测大对象
			// 210322 不能break，因为不能保证是最近的，特别是可能static的先检测到了，但是实际距离很远
			//if(ray.mode==RayMode.CLOSEST && ray.result.hasHit)
			//	break;

			//取穿过边界用的时间最少的方向，前进一格
			//同时更新当前方向的边界
			if (maxX <= maxY && maxX <= maxZ) {//x最小，表示最先遇到x面
				end = maxX > t || cx==x1;  //先判断end。否则加了delta之后可能还没有完成就end了
				cx += sx;
				maxX += xt;
			} else if (maxY <= maxX && maxY <= maxZ) {//y最小
				end = maxY > t || cy==y1;
				cy += sy;
				maxY += yt;
			} else {	// z最小
				end = maxZ > t || cz==z1;
				cz += sz;
				maxZ += zt;
			}
		}
		// big body
		let bigs = this.otherBodies;
		let bignum = bigs.length;
		for(let i=0; i<bignum; i++){
			let bigb = bigs[i];
			bigb.aabbNeedsUpdate && bigb.updateAABB();
			ray.intersectBody(bigb);
			if(ray.result._shouldStop)
				return true;
		}
		return ray.result.hasHit
	}


	aabbQuery(world: World, aabb: AABB, result: Body[]): Body[] {
		let min = aabb.lowerBound;
		let max = aabb.upperBound;
		result.length=0;
		// dynamic
		this.dynaGrid.aabbQuery(min,max,result);
		// static
		this.staticGrid.aabbQuery(min,max,result);
		// big obj
		let bigs = this.otherBodies;
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

	sphereQuery(world:World, pos:Vec3, radius:number,result:Body[] = []):Body[]{
		let bodies = world.bodies;
		let rr = radius*radius;
        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];

			// 先用最简单，最不精确的方法做
			b.position.vsub(pos,tmpVec1);
			if(tmpVec1.lengthSquared()<rr){
				result.push(b);
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
				if(bi==bj) continue;
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
				if(bi==bj)continue;
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
    collisionPairs(world: World, pairs1: Body[], pairs2: Body[]) {
		let wmin = this.objsMin;
		let wmax = this.objsMax;

		// 
		this.handle_uninitedBody();

		// 动态的直接清理重建
		let dynaGrid = this.dynaGrid;
		dynaGrid.newTick();
		dynaGrid.clear();

		let bigs = this.otherBodies;
		let bignum = this.otherBodies.length;
		let acts = this.activeBodies;
		// 根据动态对象得到所有的动态格子。同时处理大对象
		// 动态对象每次都全部更新，通过 add 添加到格子管理器中
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

			// 动态对象每次都重新分配格子，根据aabb更新到动态格子中
			dynaGrid.add(abg);

			// 动态对象与大的静态对象的检测
			for(let j=0; j<bignum; j++){
				let bj = bigs[j];
				if(bi==bj)continue;
                if (!this.needBroadphaseCollision(bi, bj)) {
                    continue;
                }
                this.intersectionTest(bi, bj, pairs1, pairs2);
			}
		}

		//let worldxs = wmax.x-wmin.x;
		//let worldys = wmax.y-wmin.y;
		//let worldzs = wmax.z-wmin.z;
		//let gridsz = this.gridsz;

		//let xn = Math.ceil(worldxs/gridsz);
		//let yn = Math.ceil(worldys/gridsz);
		//let zn = Math.ceil(worldzs/gridsz);

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
	
	// ============== 调试辅助接口 ==============

	renderGrid(render:PhyRender){
		//render.addAABB()
		let sgs = this.staticGrid.grids;
		for(let m in sgs){
			let bds = sgs[m];
			
		}
	}

	printDbgInfo(){
		let stgrid = this.staticGrid.grids;
		let dynagrid = this.dynaGrid.grids;
		let stnum=0;
		let stbodynum=0;
		for(let gs in stgrid){
			stnum++;
			stbodynum+=stgrid[gs].length;
		}
		let dynanum=0;
		let dynabodynum=0;
		for(let gs in dynagrid){
			dynanum++;
			dynabodynum+=dynagrid[gs].length;
		}

		console.log(`
 	    对象个数:${this.objnum},${this.staticGrid.objnum},${this.dynaGrid.objnum}
        格子大小:${this.gridsz}
  实际对象包围盒:${this.objsMin}, ${this.objsMax}
   动态对象个数:${this.activeBodies.length}
 不用格子管理的:${this.otherBodies.length}
   静态格子平均:${(stbodynum/stnum)|0}
   动态格子平均:${(dynabodynum/dynanum)|0}
`);
	}

}

var rayQuery_tmpV1=new Vec3();
var rayQuery_tmpV2=new Vec3();
var tmpVec1=new Vec3();