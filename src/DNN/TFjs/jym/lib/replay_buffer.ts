
import {sample} from './util'; 

declare var Deque:any;

export class ReplayBuffer {
  bufferSize: number;
  memory: any;
  batchSize: number;
  constructor(bufferSize:number, batchSize:number) {
    this.bufferSize = bufferSize;
    this.memory = new Deque(bufferSize+1);
    this.batchSize = batchSize;
  }
  add (state, action, reward, nextState, done) {
    this.memory.push({state, action, reward, nextState, done});
    if (this.memory.length > this.bufferSize) {
      this.memory.shift();
    }
  }
  sample() {
    const experiences = sample(this.memory, this.batchSize);        
    return {
      states: experiences.map(x => x.state), 
      actions: experiences.map(x => x.action), 
      rewards: experiences.map(x => [x.reward]), 
      nextStates: experiences.map(x => x.nextState), 
      dones: experiences.map(x => [x.done]),
    };        
  }

  get length() {
    return this.memory.length;
  }
}
  
