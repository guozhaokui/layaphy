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

export class gridInfo{
	//udpateAABB=false;
	body:Body;
	/** 处于静态的时候，记录所占用的格子，用于清理 */
	grids:number[]|null=null;
	sys:GridBroadphase1;
	/** 在活动列表的位置，用于快速移除 */
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
	/** 格子大小 */
    nx = 10;
    ny = 10;
	nz = 10;

	uninitedBodies:Body[]=[];
	activeBodies:Body[]=[];

	/** 静态对象或者sleep的对象占的格子 */
	//staticGrid:[]=[];
	staticGrid:Map<number,OneGrid>=new Map();
	/** 动态对象占的格子 */
	//dynamicGrid:[]=[];
	dynamicGrid:Map<number,OneGrid>=new Map();

	private activeGrid:[];

	private addBodyListener:EventListener;
	private removeBodyListener:EventListener;

    constructor(nx:i32=10, ny:i32=10, nz:i32=10) {
        super();
        this.nx = nx;
        this.ny = ny;
        this.nz = nz;
        const nbins = this.nx * this.ny * this.nz;
		
		this.addBodyListener = this.onAddBody.bind(this);
		this.removeBodyListener = this.onRemoveBody.bind(this);
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
			this.uninitedBodies.push(b);
		}

		//b?.aabb;
		switch(b?.type){
			case BODYTYPE.STATIC:
				break;
			case BODYTYPE.DYNAMIC:
				break;
			case BODYTYPE.KINEMATIC:
				break;
		}
	}

	onRemoveBody(e:RemoveBodyEvent){
		let b = e.body;
	}

	onBodySleep(b:Body){
	}
	onBodyWakeup(b:Body){
	}

	onBodyMoved(b:Body){
	}

	/** 某个body表示自己处于非静止状态 */
	activeBody(b:Body){
		let acts = this.activeBodies;
		let gridinfo = b.gridinfo;
		if(gridinfo){
			if(gridinfo.grids){
				// 这表示原来是静止的，已经记录在静止数组中了
				//  从静止数组中删除这个body
				// TODO
				// 清理自己记录的格子信息
				gridinfo.grids=null;
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

	/** 根据动态对象，得到需要计算的格子，然后与静态格子 */
	updateAllDynaBody(){
		let activeGrid = this.activeGrid;
		activeGrid.length=0;

		let acts = this.activeBodies;
		for( let i=0,l=acts.length; i<l; i++){
			let ab = acts[i];
			//TODO 计算ab所占格子,填充到activegrid中
		}
	}
	aabbQuery(world: World, aabb: AABB, result: Body[]): Body[] {
		throw 'NI';
	}

	updateBody(b:Body){

	}

    /**
	 * 
     */
    collisionPairs1(world: World, pairs1: Body[], pairs2: Body[]) {
		// 
		let uninited:Body[] = this.uninitedBodies;
		uninited.forEach( (b:Body)=>{
			this.updateBody(b);
		});
		uninited.length=0;
		// 根据动态对象得到所有的动态格子
		// 
		this.updateAllDynaBody();
		let activegrid = this.activeGrid;
		// TODO activegrid中的所有做检测
		
        //this.makePairsUnique(pairs1, pairs2);
	}
	
    /**
     * Get all the collision pairs in the physics world
     */
    collisionPairs(world:World, pairs1:Body[], pairs2:Body[]) {
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
