import {Vec3} from "../math/Vec3";

export interface MinkowskiShape{
	margin:number;
	/**
	 * 获取某个方向的支撑点
	 * @param dir 必须是规格化的
	 * @param sup 返回的支持点
	 */
	getSupportVertex(dir:Vec3, sup:Vec3):Vec3;
	/**
	 * 获取去掉margin的支撑点。例如球的就是一个点
	 * @param dir 
	 * @param sup 
	 */
	getSupportVertexWithoutMargin(dir:Vec3, sup:Vec3):Vec3;
}