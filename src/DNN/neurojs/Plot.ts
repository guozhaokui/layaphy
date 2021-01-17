import { Sprite } from "laya/display/Sprite";
import { Context } from "laya/resource/Context";

let DATANUM = 256;

export class PlotData {
    id: number;
    name: string;
    color: number;
    scale = 1.0;
    /** 缩略的数据 */
    datas = new Float32Array(DATANUM*2);// min,max
    //originData:number[] = [];
    /** 几个合成一个 */
    merge=1;
    mergeNum=0;
    datapos = 0;
    maxv=0;
    minv=0;

    // 一组的最大最小值
    mergeMin=0;
    mergeMax=0;

    constructor(id: number, color: number, name: string, scale: number) {
        this.id = id;
        this.color = color;
        this.name = name;
        this.scale = scale;
    }

    addData(v: number): void {
        //this.originData.push(v);
        if(this.maxv<v)this.maxv=v;
        if(this.minv>v)this.minv=v;

        if(this.mergeNum==0){
            this.mergeMin=v;
            this.mergeMax=v;
        }else{
            if(this.mergeMin>v)this.mergeMin=v;
            if(this.mergeMax<v)this.mergeMax=v;
        }

        this.mergeNum++;
        if(this.mergeNum>=this.merge){
            this.datas[this.datapos<<1]=this.mergeMin;
            this.datas[(this.datapos<<1)+1]=this.mergeMax;
            this.mergeNum=0;
            this.datapos++;
        }
        if(this.datapos>=DATANUM-1){
            // 合并前面的
            let n = this.datapos/2;
            let dt = this.datas;
            for(let i=0; i<n; i++){
                dt[i<<1]=Math.min(dt[i<<2], dt[(i+1)<<2]);//min
                dt[(i<<1)+1]=Math.max(dt[(i<<2)+1],dt[((i+1)<<2)+1]);//max
            }
            this.merge<<=1;
            this.datapos=n;
        }
    }
}

export class PlotConfig{
    bgalpha?=0.2;
    width?=800;
    height?=600;
}

export class Plot extends Sprite {
    //private static _lastTm = 0;	//perf Data
    private static _now = performance ? performance.now.bind(performance) : Date.now;
    private datas: PlotData[] = [];
    plogconfig = new PlotConfig();
    gMinV = 0;
    gMaxV = 100;

    private textSpace = 40;	//留给刻度文字的

    constructor(options:PlotConfig) {
        super();
        Object.assign(this.plogconfig,options);
        this.customRenderEnable = true;
    }

    addDataDef(id: number, color: number, name: string, scale: number): void {
        this.datas[id] = new PlotData(id, color, name, scale);
    }

    addData(id: number, v: number): void {
        this.datas[id].addData(v);
    }

    private v2y(v: number): number {
        return this.y + this.plogconfig.height! * (1 - (v - this.gMinV) / this.gMaxV);
    }

    drawHLine(ctx: Context, v: number, color: string, text: string): void {
        var sx = this.x;
        //var ex = this.x + this.hud_width;
        var sy = this.v2y(v);
        ctx.fillText(text,sx,sy-6,'16px Arial','green','left');
        sx += this.textSpace;
        ctx.fillStyle = color;
        ctx.fillRect(sx, sy, this.x + this.plogconfig.width!, 1, null);
    }

    /**
     * 
     * @param ctx 
     * @param x 
     * @param y 
     * @override
     */
    customRender(ctx: Context, x: number, y: number): void {
        ctx.save();
        ctx.fillRect(this.x, this.y, this.plogconfig.width!, this.plogconfig.height! + 4, '#000000cc');
        ctx.globalAlpha = this.plogconfig.bgalpha!;
        /*
        for ( var i = 0; i < gMaxV; i+=30) {
            drawHLine(ctx, i, 'green', '' + i);// '' + Math.round(1000 / (i + 1)));
        }
        */
        //this.drawHLine(ctx, 0, 'green', '0');

        //数据
        for (var di = 0, sz = this.datas.length; di < sz; di++) {
            var cd = this.datas[di];
            if (!cd) continue;
            var dtlen = cd.datas.length;
            var dx = (this.plogconfig.width! - this.textSpace) / dtlen;
            var cx = 0;
            var _cx = this.x + this.textSpace;
            ctx.fillStyle = cd.color;

            let n = cd.datapos;
            let scale = this.plogconfig.height!/(cd.maxv-cd.minv);// viewh/data
            let sty=0;
            let h1=0;
            for( let vi=0; vi<n-1; vi++){
                let min = cd.datas[vi<<1];
                let max = cd.datas[(vi<<1)+1];
                let minv = (min-cd.minv)*scale;
                let maxv = (max-cd.minv)*scale;
                sty = this.plogconfig.height!-maxv;
                h1=maxv-minv+1;
                ctx.fillRect(_cx,sty, dx+1, h1, null);
                _cx+=dx;
            }
            let lastmin = cd.datas[(n-1)<<1];
            //let lastmax = cd.datas[((n-1)<<1)+1];

            ctx.fillText(cd.name+' '+lastmin,_cx,sty+h1/2,'14px Arial','white','')
        }
        ctx.restore();
    }
}

