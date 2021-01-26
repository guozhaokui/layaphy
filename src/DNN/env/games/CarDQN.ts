
import * as tf from '@tensorflow/tfjs';
import { RLEnv } from '../RLEnv';
import { ReplayMemory } from './replay_memory';

declare var tfvis: any;

abstract class Algorithm {
    abstract get_weights(): Float64Array;
    abstract set_weights(w: Float64Array): void;
    abstract sample(env:RLEnv): void;
    abstract predict(env:RLEnv): void;
    abstract learn(): void;

}


/**
 * Copy the weights from a source deep-Q network to another.
 *
 * @param {tf.LayersModel} destNetwork The destination network of weight
 *   copying.
 * @param {tf.LayersModel} srcNetwork The source network for weight copying.
 */
function copyWeights(destNetwork: tf.LayersModel, srcNetwork: tf.LayersModel) {
    // https://github.com/tensorflow/tfjs/issues/1807:
    // Weight orders are inconsistent when the trainable attribute doesn't
    // match between two `LayersModel`s. The following is a workaround.
    // TODO(cais): Remove the workaround once the underlying issue is fixed.
    let originalDestNetworkTrainable;
    if (destNetwork.trainable !== srcNetwork.trainable) {
        originalDestNetworkTrainable = destNetwork.trainable;
        destNetwork.trainable = srcNetwork.trainable;
    }

    destNetwork.setWeights(srcNetwork.getWeights());

    // Weight orders are inconsistent when the trainable attribute doesn't
    // match between two `LayersModel`s. The following is a workaround.
    // TODO(cais): Remove the workaround once the underlying issue is fixed.
    // `originalDestNetworkTrainable` is null if and only if the `trainable`
    // properties of the two LayersModel instances are the same to begin
    // with, in which case nothing needs to be done below.
    if (originalDestNetworkTrainable != null) {
        destNetwork.trainable = originalDestNetworkTrainable;
    }
}


/**
 * 在一个滑动窗口范围内计算平均值
 */
class MovingAverager {
    buffer: number[];
    constructor(bufferLength:int) {
      this.buffer = [];
      for (let i = 0; i < bufferLength; ++i) {
        this.buffer.push(0);
      }
    }
  
    append(x:number) {
      this.buffer.shift();
      this.buffer.push(x);
    }
  
    average() {
      return this.buffer.reduce((x, prev) => x + prev) / this.buffer.length;
    }
  }
  

export class CarDQN extends Algorithm {
    onlineNetwork: tf.Sequential;
    targetNetwork: tf.Sequential;
    optimizer: tf.AdamOptimizer;
    replayBufferSize: int;
    replayMemory: ReplayMemory;
    frameCount: int;
    epsilon: any;
    epsilonDecayFrames: number;
    epsilonFinal: any;
    epsilonInit: number;
    epsilonIncrement_: number;
    cumulativeReward_: any;
    syncEveryFrames=100;
    batchSize=40;
    acts:int[];
    game:RLEnv;

    constructor(game:RLEnv,stateNum: int, acts: int[], learningRate: number, buffersize: int,batchSize:int) {
        super();
        this.game=game;
        this.acts=acts;
        let actNum = acts.length;
        this.batchSize=batchSize;
        this.onlineNetwork = this.createDeepQNetwork(stateNum, actNum);
        this.targetNetwork = this.createDeepQNetwork(stateNum, actNum);
        // Freeze taget network: it's weights are updated only through copying from the online network.
        this.targetNetwork.trainable = false;

        this.optimizer = tf.train.adam(learningRate);

        this.replayBufferSize = buffersize;
        this.replayMemory = new ReplayMemory(buffersize);
        this.frameCount = 0;
        this.reset();
    }

    createDeepQNetwork(numState: int, numActions: int) {
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 100, activation: 'relu', inputShape: [numState] }));
        model.add(tf.layers.dense({ units: 100, activation: 'relu' }));
        model.add(tf.layers.dropout({ rate: 0.25 }));
        model.add(tf.layers.dense({ units: numActions }));
        return model;
    }    

    reset() {
        throw new Error('Method not implemented.');
    }

    private getRandomAction(){
        let acts = this.acts;
        let n = acts.length;
        let i = (Math.random()*n)%n;
        return acts[i];
    }

    /**
     * 选择一个动作。
     * 根据网络预测选择
     * 较小的概率随机选择
     * 
     * @param env 
     */
    sample(env:RLEnv) {
        this.epsilon = this.frameCount >= this.epsilonDecayFrames ? this.epsilonFinal : this.epsilonInit + this.epsilonIncrement_ * this.frameCount;
        this.frameCount++;

        // The epsilon-greedy algorithm.
        let action=0;
        const state = env.getGameState();
        if (Math.random() < this.epsilon) {
            // Pick an action at random.
            action = this.getRandomAction();
        } else {
            // Greedily pick an action based on online DQN output.
            tf.tidy(() => {
                let state = env.getGameState();
                let buff = tf.buffer([1,1]);    // batch=1，input=1
                state.forEach((v,i)=>buff.set(v,0,i));
                const stateTensor = buff.toTensor();// getStateTensor(state, this.game.height, this.game.width)
                action = this.acts[(this.onlineNetwork.predict(stateTensor) as tf.Tensor).argMax(-1).dataSync()[0]];
            });
        }

        const { state: nextState, reward, done } = this.game.step(action);

        // 添加一条新的经验
        this.replayMemory.append([state, action, reward, done, nextState]);

        this.cumulativeReward_ += reward;
        const output = {
            action,
            cumulativeReward: this.cumulativeReward_,
            done,
        };
        if (done) {
            this.reset();
        }
        return output;
    }


    /**
     * Perform training on a randomly sampled batch from the replay buffer.
     *
     * @param {number} batchSize Batch size.
     * @param {number} gamma Reward discount rate. Must be >= 0 and <= 1.
     * @param {tf.train.Optimizer} optimizer The optimizer object used to update
     *   the weights of the online network.
     */
    trainOnReplayBatch(batchSize: number, gamma: number, optimizer: tf.Optimizer) {
        // Get a batch of examples from the replay buffer.
        const batch = this.replayMemory.sample(batchSize);
        const lossFunction = () => tf.tidy(() => {
            const stateTensor = getStateTensor(batch.map(example => example[0]), this.game.height, this.game.width);
            const actionTensor = tf.tensor1d(batch.map(example => example[1]), 'int32');
            const qs = this.onlineNetwork.apply(stateTensor, { training: true }).mul(tf.oneHot(actionTensor, NUM_ACTIONS)).sum(-1);

            const rewardTensor = tf.tensor1d(batch.map(example => example[2]));
            const nextStateTensor = getStateTensor(batch.map(example => example[4]), this.game.height, this.game.width);
            const nextMaxQTensor = this.targetNetwork.predict(nextStateTensor).max(-1);
            const doneMask = tf.scalar(1).sub(tf.tensor1d(batch.map(example => example[3])).asType('float32'));
            const targetQs = rewardTensor.add(nextMaxQTensor.mul(doneMask).mul(gamma));
            return tf.losses.meanSquaredError(targetQs, qs);
        });

        // Calculate the gradients of the loss function with repsect to the weights
        // of the online DQN.
        const grads = tf.variableGrads(lossFunction);
        // Use the gradients to update the online DQN's weights.
        optimizer.applyGradients(grads.grads);
        tf.dispose(grads);
        // TODO(cais): Return the loss value here?
    }


    /**
     * @param {number} batchSize Batch size for training.
     * @param {number} gamma Reward discount rate. Must be a number >= 0 and <= 1.
     * @param {number} learnigRate
     * @param {number} cumulativeRewardThreshold The threshold of moving-averaged
     *   cumulative reward from a single game. The training stops as soon as this
     *   threshold is achieved.
     * @param {number} maxNumFrames Maximum number of frames to train for.
     * @param {number} syncEveryFrames The frequency at which the weights are copied
     *   from the online DQN of the agent to the target DQN, in number of frames.
     * @param {string} savePath Path to which the online DQN of the agent will be
     *   saved upon the completion of the training.
     */
    async train(batchSize: number, gamma: number, learningRate: number, cumulativeRewardThreshold: number, maxNumFrames: number) {
    }

    get_weights(): Float64Array {
        throw new Error("Method not implemented.");
    }
    set_weights(w: Float64Array): void {
        throw new Error("Method not implemented.");
    }
    predict(env:RLEnv): void {
        throw new Error("Method not implemented.");
    }

    learn(): void {
        let summaryWriter;

        for (let i = 0; i < this.replayBufferSize; ++i) {
            this.playStep();
        }

        // Moving averager: cumulative reward across 100 most recent 100 episodes.
        const rewardAverager100 = new MovingAverager(100);
        // Moving averager: fruits eaten across 100 most recent 100 episodes.
        const eatenAverager100 = new MovingAverager(100);

        const optimizer = this.optimizer;
        let tPrev = new Date().getTime();
        let frameCountPrev = this.frameCount;
        let averageReward100Best = -Infinity;
        while (true) {
            this.trainOnReplayBatch(this.batchSize, gamma, optimizer);
            const { cumulativeReward, done, fruitsEaten } = this.playStep();
            if (done) {
                const t = new Date().getTime();
                const framesPerSecond =(this.frameCount - frameCountPrev) / (t - tPrev) * 1e3;
                tPrev = t;
                frameCountPrev = this.frameCount;

                rewardAverager100.append(cumulativeReward);
                eatenAverager100.append(fruitsEaten);
                const averageReward100 = rewardAverager100.average();
                const averageEaten100 = eatenAverager100.average();

                console.log(
                    `Frame #${agent.frameCount}: ` +
                    `cumulativeReward100=${averageReward100.toFixed(1)}; ` +
                    `eaten100=${averageEaten100.toFixed(2)} ` +
                    `(epsilon=${agent.epsilon.toFixed(3)}) ` +
                    `(${framesPerSecond.toFixed(1)} frames/s)`);
                if (summaryWriter != null) {
                    summaryWriter.scalar('cumulativeReward100', averageReward100, this.frameCount);
                    summaryWriter.scalar('eaten100', averageEaten100, this.frameCount);
                    summaryWriter.scalar('epsilon', this.epsilon, this.frameCount);
                    summaryWriter.scalar('framesPerSecond', framesPerSecond, this.frameCount);
                }
                if (averageReward100 >= cumulativeRewardThreshold || this.frameCount >= maxNumFrames) {
                    // TODO(cais): Save online network.
                    break;
                }
                if (averageReward100 > averageReward100Best) {
                    averageReward100Best = averageReward100;
                }
            }
            if (this.frameCount % this.syncEveryFrames === 0) {
                copyWeights(this.targetNetwork, this.onlineNetwork);
                console.log('Sync\'ed weights from online network to target network');
            }
        }
    }
    playStep() {
        throw new Error('Method not implemented.');
    }
}