import { Vec3 } from "../math/Vec3";
import { Quaternion } from "../math/Quaternion";

interface PhyObj{
	name:string;
	parts:PhyN_Base[];
}

interface PhyN_Base{
	name:string;
	type:string;
}

interface PhyShapeBase{
	type:string;
}


interface PN_Dyna extends PhyN_Base{
	mass:number;
	shape:PhyShapeBase;
	shapeParam:Object;
	pos?:Vec3;
	qua?:Quaternion;
}

interface PhyMaterial{
}

interface PhyC_Base{
	name:string;
	type:'p2p'|'p2pdist'|'hinge'|'dist';
}

/** 把两个对象上的两个点重合 */
interface PhyC_Point2Point{
	A:string;
	B:string;
	pa:Vec3;
	Pb:Vec3;
}

interface PhyC_Dist{
	A:string;
	B:string;
	dist:number;
}

interface PhyC_Point2PointDist{
	A:string;
	B:string;
	pa:Vec3;
	pb:Vec3;
	dist:number;
}

interface PhyC_Hinge{
	A:string;
	B:string;
	pa:Vec3;
	pb:Vec3;
	Axisa:Vec3;
	Axisb:Vec3;
}

interface PhyN_Spring{
	restLength:number;
	stiffness:number;
	damping:number;
	A:string;
	B:string;
}

interface PhyC_Cone{
	A:string;
	B:string;
	Axisa:Vec3;
	Axisb:Vec3;
	angle:number;
}

export function loadPhyObj(obj:PhyObj){

}

