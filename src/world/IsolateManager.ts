import { Body } from "../objects/Body";

/**
 * 管理场景中的互相关联的都处于sleep状态的对象组
 * TODO
 * 	动态对象不可能在空中sleep，所以一定要记录并维持之前的碰撞对象，只要不是与static对象碰撞，都不允许一个iso只有一个对象
 */
class IsolateManager{
	isolates:Body[][]=[];
	constructor(){
	}
	addSleepObj(b:Body){
	}
	wakeupObj(b:Body){
	}
}
