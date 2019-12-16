import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Camera } from "laya/d3/core/Camera";

export class OperatorInfo{
	applyop:any;	// 本次属性修改
	lastop:any;		// 属性的原始值
}

export interface IAction{
	startAction(node:Sprite3D,cam:Camera):void;
	apply(outop:OperatorInfo):void;
	cancel():void;
	onKeyEvent(key:number, down:boolean):void;
	onMouseMove(mx:number, my:number):void;
}

export class KeyInputAction {
	private strValue='';	// 输入的角度
	protected useInput=false;	// 一旦开始输入，鼠标就不再控制了

	onKeyEvent(keycode:int,down:boolean){
		if( keycode>=48 && keycode<=57){//0~9
			this.strValue+= String.fromCharCode(keycode);
			this._onInputValueChanged();
		}	

		switch(keycode){
			case 190:	//.
				this.strValue+='.';
				this._onInputValueChanged();
				break;
			case 8:		//backspace
				this.strValue= this.strValue.substr(0,this.strValue.length-1);
				this._onInputValueChanged();
				break;
		}		
	}

	startAction(node:Sprite3D, cam:Camera){
		this.strValue='';
	}	

	private _onInputValueChanged(){
		this.useInput=true;
		this.onInputValueChanged(Number(this.strValue));
	}	

	protected onInputValueChanged(v:number){}
}