import {Broadphase} from './Broadphase.js';
import {Vec3} from '../math/Vec3.js';
import {World, AddBodyEvent, RemoveBodyEvent} from '../world/World.js';
import {Body, BODYTYPE} from '../objects/Body.js';
import { AABB } from './AABB.js';

class NullArea{
}

class OneGrid{
	//临时实现
	bodies:Body[];
}

var gridid:int[] = [];

export class gridInfo{
	//udpateAABB=false;
	body:Body;
	/** 处于静态的时候，记录所占用的格子，用于清理。由于边界会调整，所以用格子对象而不是id */
	grids:OneGrid[]|null=null;
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
		this.sys.onBodySleep(this.body);
	}
	onWakeupEvent(){
		this.sys.onBodyWakeup(this.body);
	}

	/** 注意这个会调用很多次 */
	onNeedUpdate(){
		if(this.activeid<0)
			this.sys.onBodyWakeup(this.body);
	}
}

/**
 * 基于格子的宽阶段碰撞检测。
 * 分成静止和动态两个格子，动态的每次都清理
 * 静态的一直保存，一旦active就要从静态格子删除
 * 注意 超出范围的会被忽略
 * 
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

	activeBodies:Body[]=[];

	/** 静态对象或者sleep的对象占的格子 */
	//staticGrid:[]=[];
	private staticGrid:Map<number,OneGrid>=new Map();
	/** 动态对象占的格子 */
	//dynamicGrid:[]=[];
	private dynamicGrid:Map<number,OneGrid>=new Map();

	/** temp 以后分开 */
	private grids:OneGrid[]=[];

	private activeGrid:[]=[];

	private addBodyListener:EventListener;
	private removeBodyListener:EventListener;

    constructor(nx:i32=10, ny:i32=10, nz:i32=10) {
        super();
        this.nx = nx;
        this.ny = ny;
        this.nz = nz;
		const nbins = this.nx * this.ny * this.nz;
		this.grids.length=nbins;
		
		
		this.addBodyListener = this.onAddBody.bind(this);
		this.removeBodyListener = this.onRemoveBody.bind(this);
	}

	/** 更新过程中发现需要调整边界了 */
	resetBBX(xmin:number,ymin:number,zmin:number, xmax:number,ymax:number,zmax:number){
		this.min.set(xmin,ymin,zmin);
		this.max.set(xmax,ymax,zmax);
	}
	
	/**
	 * 获取某个格子，这个是为了封装格子的不同实现
	 * @param x 
	 * @param y 
	 * @param z 
	 */
	getGrid(x:int,y:int,z:int):OneGrid{
		//TODO
		throw 'NI'
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
	}

	onAddBody(e:AddBodyEvent){
		// 注意type可能会变
		// 刚添加进去的时候可能还没有设置位置，aabb是不对的
		let b = e.body;
		if(b && !b?.gridinfo){
			b.gridinfo =new gridInfo(b,this);
			// 新加入的都作为uninitedbody，一旦更新一次以后，就从这里删掉了
			this.uninitedBodies.push(b);
		}
	}

	onRemoveBody(e:RemoveBodyEvent){
		let b = e.body;
	}

	onBodySleep(b:Body){
		this.deactiveBody(b);
	}
	/** body状态改变，从静态列表中删除 */
	onBodyWakeup(b:Body){
		this.activeBody(b);
	}

	onBodyMoved(b:Body){
	}

	/** 某个body表示自己处于非静止状态 */
	activeBody(b:Body){
		let acts = this.activeBodies;
		let gridinfo = b.gridinfo;
		if(gridinfo){
			if(gridinfo.activeid<0){
				// 这表示原来是静止的,已经记录在静止数组中了。或者是第一次加入
				//  从静止数组中删除这个body
				if(gridinfo.grids){
					// 清理自己记录的格子信息
					gridinfo.grids=null;
				}
				// TODO
				gridinfo.activeid = acts.length;
				// 添加到活动列表中
				acts.push(b);
			}else{
				// 已经是动态的了
			}
		}else{
			// 不应该
			console.error('err1');
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
			this.updateBody(ab);
		}
	}
	
	aabbQuery(world: World, aabb: AABB, result: Body[]): Body[] {
		throw 'NI';
	}

	//TEST 统一添加
	updateBody(b:Body){
		let cgrid = this.grids;
		
	}

    /**
	 * 
     */
    collisionPairs1(world: World, pairs1: Body[], pairs2: Body[]) {
		let wmin = this.min;
		let wmax = this.max;
		let bbxchanged=true;
		// 
		let uninited:Body[] = this.uninitedBodies;
		for( let i=0,len=uninited.length; i<len; i++){
			let b = uninited[i];
			b.updateAABB();
			let min = b.aabb.lowerBound;
			let max = b.aabb.upperBound;
			//this.updateBody(b);
			switch(b.type){
				case BODYTYPE.STATIC:
					// add static TODO
					this.updateBody(b);
					// 更新包围盒。 动态的会在下面更新
					this.updateWorldBBX(min,max,wmin,wmax);
					break;
				case BODYTYPE.DYNAMIC:
				case BODYTYPE.KINEMATIC:
					this.activeBody(b);
				break;
			}
		}

		uninited.length=0;
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

}

var GridBroadphase_collisionPairs_d = new Vec3();
