

export abstract class RLEnv{
	init(){

	}
	reset_game(){

	}

	abstract getStateNum():number;

	/**
	 * 返回支持的动作
	 * 
	 */
	abstract getActionSet():number[];

	/**
	 * 获取状态
	 */
	abstract getGameState():number[];

	/**
	 * 当前得分
	 */
	abstract score():number;

	/**
	 * 是否结束了
	 */
	abstract game_over():boolean;

	/**
	 * 执行某个动作
	 * @param a 
	 */
	act(a:number){

	}

	/**
	 * 执行某个连续量
	 * @param a 
	 * @param v 
	 */
	actA(a:number, v:number){

	}
}