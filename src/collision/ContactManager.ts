import { Vec3 } from "../math/Vec3";
import { ContactEquation } from "../equations/ContactEquation";
import { Body } from "../objects/Body";

// 优化的时候避免对象重用导致被多个其他对象的修改

// 由于 ContactEquation 会重用，且为了保证api的封装性，碰撞信息不保留ContactEquation
export class ContactInfo{
	body:Body;			// 对方
	hitpos = new Vec3();	// 自己的碰撞点
	hitnorm = new Vec3();	// 对方的法线
}

var hitpos = new Vec3();
var hitnorm = new Vec3();

/**
 * 每个body保留一份所有的碰撞信息。不能按照碰撞对保存，因为可能a-b, b-a,c
 */
export class ContactInfoMgr{
	added:ContactInfo[]=[];
	addlen=0;

	removed:ContactInfo[]=[];	// 一开始记录上次碰撞的，每发现一个碰撞就从这里删掉所有的相关的，最后剩下的就是表示exit的
	removedLen=0;

	allc:ContactInfo[]=[]; // 当前所有接触的
	allcLen=0;

	newTick(){
		// 交换一下all和remove
		let tmp = this.removed;
		this.removed=this.allc;
		this.removedLen=this.allcLen;	// 上次的所有的碰撞信息

		this.allc = tmp;
		this.allcLen=0;

		// 新增清零
		this.addlen=0;

		//console.log('newtick lastnum=',this.removedLen);
	}

	/**
	 * 这个维护remove列表，因此如果与b碰撞了，必须把上次记录的所有的与b相关的都从removed中移除
	 * @param b 
	 */
	private hitBody(b:Body):boolean{
		let sz = this.removedLen;
		let rm = this.removed;
		let find=false;
		for(let i=0; i<sz; i++){
			let v = this.removed[i];
			if( v.body==b ){
				// 由于重用的问题，不能直接覆盖，需要交换，覆盖会导致两个元素其实指向同一个对象
				let tmp = rm[i];
				rm[i]=rm[this.removedLen-1];
				rm[this.removedLen-1]=tmp;
				this.removedLen--;
				sz--;
				i--;
				find=true;
			}
		}
		//console.log('hitbody remove removedlen=',this.removedLen);
		return find;
	}

	addContact(me:Body, c:ContactEquation){
		let other:Body;
		if(c.bi==me){
			//me=i
			other=c.bj;
			me.position.vadd(c.ri,hitpos);
			c.ni.negate(hitnorm);	//hitnorm = -c.ni
		}else{
			other=c.bi;
			me.position.vadd(c.rj,hitpos);
			hitnorm.copy(c.ni);	//hitnorm = c.ni
		}

		// 添加全部碰撞信息
		let addall:ContactInfo;
		if(this.allcLen>=this.allc.length){
			addall = new ContactInfo();
			this.allc.push(addall);
		}else{
			addall = this.allc[this.allcLen];
		}
		addall.body=other;
		addall.hitpos.copy(hitpos);
		addall.hitnorm.copy(hitnorm);
		this.allcLen++;

		//现在还有，所以需要从remove中删除
		let lastC = this.hitBody(other);	// 删除对方
		if(!lastC){
			// 上次没有，所以是新增加的
			let add:ContactInfo;
			if(this.addlen>=this.added.length){
				add = new ContactInfo();
				this.added.push(add);
			}else{
				add = this.added[this.addlen];
			}
			add.body = other;
			add.hitpos.copy(hitpos);
			add.hitnorm.copy(hitnorm);
			this.addlen++;
		}
	}
}