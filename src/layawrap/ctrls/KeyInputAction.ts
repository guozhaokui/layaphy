import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Camera } from "laya/d3/core/Camera";

export class OperatorInfo{
	applyop:any;	// 本次属性修改
	lastop:any;		// 属性的原始值
}

export interface IAction{
	startAction(node:Sprite3D,cam:Camera,mousex:number,mousey:number):void;
	apply(outop:OperatorInfo):void;
	cancel():void;
	onKeyEvent(key:number, down:boolean):void;
	onMouseMove(mx:number, my:number):void;
}

export class KeyInputAction {
	private strValue='';	// 输入的角度
	protected useInput=false;	// 一旦开始输入，鼠标就不再控制了
	protected altdown=false;
	protected shift=false;
	private  isUp=true;

	onKeyEvent(keycode:int,down:boolean){
		if(down && !this.isUp)	// 不重复处理down消息
			return;
		this.isUp=!down;

		if( keycode>=48 && keycode<=57){//0~9
			// 避免一直触发
			if(down){
				this.strValue += String.fromCharCode(keycode);
				this._onInputValueChanged();
			}
		}	

		switch(keycode){
			case 190:	//.
				if(down){
					this.strValue+='.';
					this._onInputValueChanged();
				}
				break;
			case 8:		//backspace
				if(down){
					this.strValue= this.strValue.substr(0,this.strValue.length-1);
					this._onInputValueChanged();
				}
				break;
			case 18:
				this.altdown=down;
				break;
			case 16:
				this.shift=down;
				break;
		}		
	}

	_startAction(node:Sprite3D, cam:Camera){
		this.strValue='';
	}	

	private _onInputValueChanged(){
		this.useInput=true;
		let v = Number(this.strValue);
		if(isNaN(v)){
			console.log('输入错误，强制清空:',v);
			v=0;
			this.strValue='';
		}else
			this.onInputValueChanged(v);
	}	

	protected onInputValueChanged(v:number){}
}