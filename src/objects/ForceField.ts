import { Shape } from "../shapes/Shape";
import { Body, BODYTYPE } from "./Body";

export class ForceField extends Body{
	attachedBody:Body;	// 怎么设置不与这个body发生碰撞
	constructor(){
		super();
		this.type=BODYTYPE.TRIGGER;
	}

}