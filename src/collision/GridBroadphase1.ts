import {Broadphase} from './Broadphase.js';
import {Vec3} from '../math/Vec3.js';
import {World, AddBodyEvent, RemoveBodyEvent} from '../world/World.js';
import {Body, BODYTYPE} from '../objects/Body.js';
import { AABB } from './AABB.js';
import { PhyRender } from '../layawrap/PhyRender.js';

/**
 * 在Body身上记录grid相关的信息。
 */
export class GridInfo{
	//udpateAABB=false;
	body:Body;
	isDynamic=false;
	/** 处于静态的时候，记录所占用的格子，用于清理。由于边界会调整，所以用格子对象而不是id 
	 * 指向包含自己的列表
	*/
	grids:Body[]|null=null;
	sys:GridBroadphase1;
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
	private grids:Body[][]=[];
	clear(){

	}
	add(gridinfo:GridInfo){

	}
	remove(gridinfo:GridInfo){
		
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

	/** 格子大小 */
	gridsz=10;

	//当前包围盒
	min=new Vec3(-100,-100,-100);
	max=new Vec3(100,100,100);

    nx = 10;
    ny = 10;
	nz = 10;

	/** 新加入的都作为uninitedbody，一旦更新一次以后，就从这里删掉了 */
	uninitedBodies:Body[]=[];

	/** 活动对象。因为活动对象是每次都重新计算所在格子，所以需要单独记录 */
	activeBodies:Body[]=[];

	/** 静态对象或者sleep的对象占的格子 */
	private staticGrid = new GridMgr();
	/** 动态对象占的格子 */
	private dynaGrid = new GridMgr();

	/** 有活动对象的格子 */
	private activeGrid:[]=[];

	private addBodyListener:EventListener;
	private removeBodyListener:EventListener;
	private afterIntegrate:EventListener;

    constructor(nx:i32=10, ny:i32=10, nz:i32=10) {
        super();
        this.nx = nx;
        this.ny = ny;
        this.nz = nz;
		const nbins = this.nx * this.ny * this.nz;
		
		this.addBodyListener = this.onAddBody.bind(this);
		this.removeBodyListener = this.onRemoveBody.bind(this);
		this.afterIntegrate = this.onAfterIntegrate.bind(this);
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
			//TODO ginfo.grids;
			// TODO 从active列表中删除
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
			b.updateAABB();
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
					this.activeBodies.push(b);

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
	activeBody(b:GridInfo){
		let acts = this.activeBodies;
		let gridinfo = b;
		if(!b.isDynamic){
			// 这表示原来是静止的,已经记录在静止数组中了。或者是第一次加入
			b.isDynamic=true;
			//  从静止数组中删除这个body
			if(gridinfo.grids){
				// 清理自己记录的格子信息
				gridinfo.grids=null;
			}
			// TODO
			gridinfo.activeid = acts.length;
		}else{
			// 已经是动态的了
		}
	}

	deactiveBody(b:Body){
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
	private addToStatic(b:GridInfo){

		// 从动态中删除
		// 加入静态
	}

	private addToDynamic(b:GridInfo){
		if(!b.isDynamic){
			// 这表示原来是静止的,已经记录在静止数组中了。或者是第一次加入
			b.isDynamic=true;
			//  从静止数组中删除这个body
			if(b.grids){
				// 清理自己记录的格子信息
				b.grids=null;
			}
		} 

		// 加入动态
	}

	/**
	 * 处理Active列表中的对象,添加到动态格子中
	 */
	private updateAllDynamic(){
		let acts = this.activeBodies;
		let n = acts.length;
		for(let i=0; i<n; i++){
			let cact=acts[i];
			this.addToDynamic(cact.gridinfo as GridInfo);
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
	clearGrid(x:int,y:int,z:int){

	}

	setWorld(world: World) {
		world.addEventListener('addBody',this.addBodyListener);
		world.addEventListener('removeBody',this.removeBodyListener);
		world.addEventListener('postStep', this.onAfterIntegrate)
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

	/** 根据动态对象，得到需要计算的格子，然后与静态格子 */
	updateAllDynaBody(){
		let activeGrid = this.activeGrid;
		activeGrid.length=0;

		let wmin = this.min;
		let wmax = this.max;
		let acts = this.activeBodies;
		for( let i=0,l=acts.length; i<l; i++){
			let ab = acts[i];
			ab.updateAABB();
			let min = ab.aabb.lowerBound;
			let max = ab.aabb.upperBound;
			//TODO 计算ab所占格子,填充到activegrid中
			// 更新包围盒
			this.updateWorldBBX(min,max,wmin,wmax);
			//temp
			this.addToDynamic(ab.gridinfo as GridInfo);
		}
	}

	// ==================    ==================
	/**
	 * 所有body的位置根据物理更新了，这时候计算动态对象的格子
	 */
	private onAfterIntegrate(){
		this.updateAllDynaBody();
	}

	// ============== BroadPhase 接口 ===================

	aabbQuery(world: World, aabb: AABB, result: Body[]): Body[] {
		throw 'NI';
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
		// 根据动态对象得到所有的动态格子
		this.updateAllDynaBody();

		let worldxs = wmax.x-wmin.x;
		let worldys = wmax.y-wmin.y;
		let worldzs = wmax.z-wmin.z;
		let gridsz = this.gridsz;
		let xn = Math.ceil(worldxs/gridsz);
		let yn = Math.ceil(worldys/gridsz);
		let zn = Math.ceil(worldzs/gridsz);


		console.log('worldinfo min,max',wmin,wmax,worldxs,worldys,worldzs);

		let activegrid = this.activeGrid;
		// TODO activegrid中的所有做检测
		
		//this.makePairsUnique(pairs1, pairs2);
		// TODO 清理动态格子的结果
	}
	
    /**
     * Get all the collision pairs in the physics world
     */
    collisionPairs(world:World, pairs1:Body[], pairs2:Body[]) {
		//TEST
		this.collisionPairs1(world,pairs1,pairs2);
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

var GridBroadphase_collisionPairs_d = new Vec3();
