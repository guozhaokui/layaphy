import { Sprite3D } from "laya/d3/core/Sprite3D";
import { RigidBody } from "laya/physics/RigidBody";
import { World } from "../../world/World";
import { Vector3 } from "laya/d3/math/Vector3";

class Component{
	name:string;
	sp:Sprite3D;
}

class Item extends Sprite3D{ 

}
class PhyItem extends Item {

}

class PhyPosCtrl extends Component{
	sp:Item;

	//on('changePos')
	// 输入，使用渲染的位置同步物理
	// zhunbeiwuli(),updateBound
	render_setPose(){

	}

	// 输出，应用物理的位置
	out_applyPose(){

	}
}

class PhyRigidBody{
	body:RigidBody;

}

class charctrl_phyState{
	state:int;
	handleEvt(evt:int){
	}

	tick(){

	}
}
class CharCtrl{
	// 斜坡滑动
	// 边界阻挡
	// 碰撞能推走但是，不会产生速度
	onHit(dx:number,dy:number,dz:number){

	}

	toTarget(from:Vector3,to:Vector3){
		
	}
}

class CharCtrl_xiepo{

}

class CharCtrl_bianjie{

}

class PhySystem{
	world:World;
	
	onUpdate(){
		this.world.step(1/60);

		// foreach body apply PhyPos
	}
}

class PhyManager{
	bodies:any[];
}

class BulletObj{
	update(){

	}
}

var obj = new PhyItem()
obj.addComponent(PhyRigidBody);
obj.addComponent(PhyPosCtrl)

var role = new PhyItem();
role.addComponent(PhyPosCtrl);
role.addComponent(CharCtrl);