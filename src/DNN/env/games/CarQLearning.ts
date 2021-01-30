import { RLEnv } from "../RLEnv";


export class QLearingAgent{
    Q:Float32Array[]=[];
    lr=0.01;
    gamma=0.9;
    epsilon=0.1;
    actnum=0;

    constructor(stateNum:int, actNum:int, lr=0.01, gamma=0.9, egreedy=0.1){
        this.actnum=actNum;
        this.lr=lr;
        this.gamma=gamma;
        this.epsilon=egreedy;
        this.Q.length=stateNum;
        this.Q.forEach( (v,i)=>{this.Q[i]=new Float32Array(actNum);});
    }

    predict(state:int):int{
        let qa = this.Q[state];
        let {maxi} = this.max(qa);
        return maxi;
    }

    sample(state:int){
        if(Math.random()<this.epsilon){
            return (Math.random()*this.actnum)|0;
        }else{
            return this.predict(state)
        }
    }

    max(qa:Float32Array){
        let maxv=qa[0];
        let maxi=0;
        for(let i=1; i<qa.length;i++){
            let v = qa[i];
            if(maxv<v){
                maxv=v;
                maxi=i;
            }
        }
        return {maxv,maxi}
    }

    learn(state:int,act:int,R:number,nstate:int,done:boolean){
        let QTarget=R;
        if(!done){
            QTarget=R+this.gamma*this.max(this.Q[nstate]).maxv
        }
        //更新Q
        let predictQ = this.Q[state][act]
        this.Q[state][act]+=this.lr*(QTarget-predictQ);
    }

    save(){

    }
    load(){

    }
}

class Test{
    agent = new QLearingAgent(50*100,3);
    game:RLEnv;
    run_episode(){
        let agent = this.agent;
        let game = this.game;
        let gamestate = game.reset_game()[0];
        let act = agent.predict(gamestate)
        while(true){

            let runstate = game.step(act)
        }
    }

    train(){
        let game:RLEnv;
        let tnum=1000;
        let episodenum=100;
        let agent = this.agent;
        for(let i=0;i<tnum;i++){
            for(let ei=0; ei<episodenum; ei++){
                game.reset_game();
                while(true){
                    //if done break;
                }
            }
        }
        while()
    }

}