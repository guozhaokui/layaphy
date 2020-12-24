
export class SensorBase{
    dimensions=1;
    data:Float64Array;

    /**
     * 返回sensor数据
     */
    read():Float64Array{throw 'NI'}
    
    update(){}
}

export class DistanceSensor extends SensorBase{
    constructor(){
        super();
        this.dimensions=3;
    }
}

export class SpeedSensor extends SensorBase{
    constructor(){
        super();
        this.dimensions=1;
    }

}