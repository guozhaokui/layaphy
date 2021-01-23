import { Configuration } from './../../neurojs/network';
import { Model, State } from "../../neurojs/network";
import {INeuralNetworkOptions, NeuralNetwork} from "brain.js"

declare var neurojs: any;


abstract class Algorithm {
    abstract get_weights(): Float64Array;
    abstract set_weights(w: Float64Array): void;
    abstract sample(): void;
    abstract predict(): void;
    abstract learn(): void;

}

export class CarDQN extends Algorithm {
    actor:Configuration;
    critic:Configuration;
    actorState:State;
    criticState:State;

    constructor(statNum: int, actNum: int) {
        debugger;
        super();
        this.createActor();
        let modActor: Model = new neurojs.Network.Model([
            { type: 'input', size: statNum },
            { type: 'fc', size: 50, activation: 'relu' },
            { type: 'fc', size: 50, activation: 'relu' },
            { type: 'fc', size: 50, activation: 'relu', dropout: 0.5 },
            { type: 'fc', size: actNum, activation: 'tanh' },
            { type: 'regression' }
        ]);

        let modCritic: Model = new neurojs.Network.Model([
            { type: 'input', size: statNum + actNum },
            { type: 'fc', size: 100, activation: 'relu' },
            { type: 'fc', size: 100, activation: 'relu' },
            { type: 'fc', size: 1 },
            { type: 'regression' }
        ]);

        let configActor: Configuration = this.actor = modActor.newConfiguration();
        let configCritic: Configuration = this.critic = modCritic.newConfiguration();
        this.actorState = configActor.newState();
        this.criticState = configCritic.newState();
        configActor.useOptimizer({
            type: 'ascent',
            method: 'adadelta',
            regularization: { l2: 1e-2 }
        })

        configCritic.useOptimizer({
            type: 'descent',
            method: 'adadelta',
            regularization: { l2: 1e-3 }
        });
    }


    createActor(){
        
    }
    createActorByBrainJs(){
        const config:INeuralNetworkOptions = {
            binaryThresh: 0.5,
            hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
            activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
            leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
          };        

        let net = new NeuralNetwork(config);
        net.train([
            { input: [0, 0], output: [0] },
            { input: [0, 1], output: [1] },
            { input: [1, 0], output: [1] },
            { input: [1, 1], output: [0] },
        ]);
        let n = net.run([1,0])
        debugger;
    }

    get_weights(): Float64Array {
        throw new Error("Method not implemented.");
    }
    set_weights(w: Float64Array): void {
        throw new Error("Method not implemented.");
    }
    sample(): void {
        throw new Error("Method not implemented.");
    }
    predict(): void {
        throw new Error("Method not implemented.");
    }
    learn(): void {
        this.actor.optimize(true);
        this.critic.optimize(true);

        //
        let loss = 0; //target-cur
        this.actorState.out.dw[0]=loss;
        this.actorState.propagate();
    }    
}