import { delay } from "../../../layawrap/Async";
import { RLEnv } from "../RLEnv";
import { CarCtrl } from "./CarCtrlGame";


export class QLearingAgent{
    Q:any[]=[];
    lr=0.01;
    gamma=0.9;
    epsilon=0.1;
    actnum=0;
    stateShape:int[];
    stateDist:int[];

    constructor(stateShape:int[], actNum:int, lr=0.01, gamma=0.9, egreedy=0.1){
        this.actnum=actNum;
        this.lr=lr;
        this.gamma=gamma;
        this.epsilon=egreedy;
        this.stateShape=stateShape;
        this.stateDist=stateShape.concat();
        //计算每个维度的间距。由于顺序是 [z,y,x],所以间距也要反过来
        let d = stateShape.length;
        let dist=1;
        for(let i=0; i<d; i++){
            this.stateDist[d-1-i]=dist;
            dist*=stateShape[d-1-i];
        }
        let n = this.getQSize(stateShape);
        this.Q.length=n;
        for(let i=0; i<n; i++){
            this.Q[i] =new Array(actNum);
            this.Q[i].fill(0);
        }
    }

    getQSize(shape:int[]){
        let n=shape.length;
        let v = shape[0];
        for(let i=1; i<n; i++){
            v*=shape[i]
        }
        return v;
    }

    getQIdx(shapeidx:int[]){
        let n = shapeidx.length;
        let dist = this.stateDist;
        let pos =0;
        for(let i=0; i<n; i++){
            let ci = shapeidx[i];
            if(ci>=this.stateShape[i])ci=this.stateShape[i]-1;
            pos += ci*dist[i];
        }
        return pos;
    }

    createQ_2(shape:int[],actnum:int){
        let y = shape[1];
        let x = shape[0];
        this.Q = new Array(y);
        for(let i=0; i<y; i++){
            let cQ = this.Q[i]=new Array(x);
            for(let xi=0; xi<x; xi++){
                cQ[xi] = new Array(actnum);
                cQ[xi].fill(0);
            }
        }
    }

    createQ_3(shape:int[],actnum:int){
        let z = shape[2];
        let y = shape[1];
        let x = shape[0];

        this.Q=new Array(z);
        for(let zi=0; zi<z; zi++){
            let cQZ = this.Q[zi] = new Array(y);
            for(let yi=0; yi<y; yi++){
                let CQY = cQZ[yi];
                for(let xi=0; xi<x; xi++){
                    CQY[xi]=new Array(actnum);
                    CQY[xi].fill(0);
                }
            }
        }
    }

    predict(state:int[]):int{
        let idx = this.getQIdx(state);
        let qa = this.Q[idx];
        let {maxi} = this.max(qa);
        return maxi;
    }

    sample(state:int[]){
        if(Math.random()<this.epsilon){
            return (Math.random()*this.actnum)|0;
        }else{
            return this.predict(state)
        }
    }

    max(qa:number[]){
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

    learn(state:int[],act:int,R:number,nstate:int[],done:boolean){
        //debugger;
        let QTarget=R;
        if(!done){
            let idx = this.getQIdx(nstate);
            QTarget=R+this.gamma*this.max(this.Q[idx]).maxv
        }
        //更新Q
        let qidx = this.getQIdx(state);
        let predictQ = this.Q[qidx][act]
        this.Q[qidx][act]+=this.lr*(QTarget-predictQ);
    }

    save(){

    }
    load(){

    }
}

export class TestQLearning{
    agent:QLearingAgent;
    game = new CarCtrl();
    curState=0;
    // 因为延迟奖励所以记录上一次的
    lastState:int[];
    lastAct=0;  // 0统一为什么都不做
    totalR=0;
    constructor(){
        this.agent = new QLearingAgent(this.game.getStateShape(), this.game.getActionSet().length)
    }

    run_learn(){
        let agent = this.agent;
        let game = this.game;
    }

    run_test(){
        let game = this.game;
        let agent = this.agent;
        console.log('TEST');
        let episodenum=1;
        for(let ei=0; ei<episodenum; ei++){
            this.totalR=0;
            game.reset_game();
            let ss = game.gameStep();
            this.think(ss,false);
            console.log('act',this.lastAct,'pos',game.car.pos)
            let frm=0;
            while(frm<20000){
                let ss = game.gameStep();
                if(ss){
                    if(this.think(ss,false)){
                        break;
                    }
                    console.log('act',this.lastAct,'pos',game.car.pos,'vel',game.car.vel)
                }
                frm++;
            }
            console.log('TotalReward:',this.totalR,'usefrm:',frm);
        }
    }

    /**
     * 如果认为游戏结束了，就返回true
     */
    think(worldinfo:any,learn=true){
        //if(frm==0) return false;
        //if(frm%6!=0) return false;

        //let worldinfo = this.game.checkGame();
        let curS = worldinfo.state;
        let lastS = this.lastState;

        let act=0;
        if(learn){
            // done的话，当前state可能是无效的，不过正好learn不需要
            // done的话，learn必须要处理，因为这时候包含重要的reward
            this.agent.learn(lastS,this.lastAct, worldinfo.reward, curS,worldinfo.done);
            act = this.agent.sample(curS);
        }else{
            act = this.agent.predict(curS);
        }
        this.lastAct =act;
        // 执行了上个动作后的新状态
        this.lastState = curS.concat();
        this.game.act(act);
        this.totalR+=worldinfo.reward;
        //console.log('curstate:',this.game.car.pos,this.game.car.vel,this.lastState,this.lastAct,worldinfo.state,worldinfo.reward,worldinfo.done)
        return worldinfo.done;
    }

    gamestep(){
        this.game.gameStep();
    }

    train(){
        
        let game = this.game;
        let agent = this.agent;
        let episodenum=3000000;
        for(let ei=0; ei<episodenum; ei++){
            this.totalR=0;
            game.reset_game();
            game.gameStep();
            this.lastState = game.lastState.concat();
            let frm=0;
            while(frm<20000){
                let ss = game.gameStep();
                if(ss){
                    if(this.think(ss,true)){
                        break;
                    }
                }
                frm++;
            }
            ei%10000==0&&console.log('TotalReward:',this.totalR);
        }
        

        //测试
        debugger;
        this.run_test();

    }

}