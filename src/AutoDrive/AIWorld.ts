
declare const neurojs:any;

export class AIWorld{
	constructor(){

	}

	init(){
		/**
		 * 输入：水平夹角
		 * 		距离
		 * 		速度
		 * 输出：
		 * 		刹车
		 * 		方向盘
		 */
		let input = 3;
		let actions=2;

		let actor = neurojs.Network.Model([
			{ type: 'input', size: input },
			{ type: 'fc', size: 50, activation: 'relu' },
			{ type: 'fc', size: 50, activation: 'relu' },
			{ type: 'fc', size: 50, activation: 'relu', dropout: 0.5 },
			{ type: 'fc', size: actions, activation: 'tanh' },
			{ type: 'regression' }
		]);

		let critic = neurojs.Network.Model([
            { type: 'input', size: input + actions },
            { type: 'fc', size: 100, activation: 'relu' },
            { type: 'fc', size: 100, activation: 'relu' },
            { type: 'fc', size: 1 },
            { type: 'regression' }			
		]);
	}

}