import Vec3 from "../math/Vec3";

export interface MinkowskiShape{
	/**
	 * 获取某个方向的支撑点
	 * @param dir 必须是规格化的
	 * @param sup 返回的支持点
	 */
	getSupportVertex(dir:Vec3, sup:Vec3):Vec3;
}