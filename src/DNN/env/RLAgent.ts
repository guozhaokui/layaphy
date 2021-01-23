
export abstract class RLAgent{
	/** 探索概率 */
	e_greedy=0.1;
	/** 随着训练逐步收敛，探索的程度慢慢降低 */
	e_greed_decrement=0;

	/**
	 * 根据状态选择一个动作。
	 * 一定的概率是随机探索
	 * 
	 * @param state 
	 */
	abstract sample(state:number[]):number;

	/**
	 * 游戏执行一步
	 */
	abstract playStep():void;

	/**
	 * 计算一个最优动作
	 * @param state 
	 */
	abstract predict(state:number[]):number;

	/**
	 * 更新网络
	 * @param state 
	 * @param act 
	 * @param reward 
	 * @param nextstate 
	 * @param done 
	 */
	abstract learn(state:number[],act:number[],reward:number,nextstate:number[],done:boolean):number;
}