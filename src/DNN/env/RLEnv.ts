

export abstract class RLEnv{
    height(arg0: any[], height: any, width: any) {
        throw new Error('Method not implemented.');
    }
    width(arg0: any[], height: any, width: any) {
        throw new Error('Method not implemented.');
    }
	init(){

	}
	abstract reset_game():number[];

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
	 * 执行某个动作并且返回对状态的影响
	 * @param act 
	 */
	//async ctrl(act:int):Promise<{state:number[], reward:number, done:boolean}>{throw 'NI'};

	/**
	 * 执行某个连续量
	 * @param a 
	 * @param v 
	 */
	actA(a:number, v:number){

	}

	/**
	 * 游戏的一个step。与输入无关
	 */
	abstract gameStep():void;
}