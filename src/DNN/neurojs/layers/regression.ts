
class OutputLayer{
    output=true;
    constructor(input, opt){

    }

    result(ctx){

    }
}

class SoftmaxLayer extends OutputLayer{

}

class RegressionLayer extends OutputLayer{
    passthrough=true;
    constructor(inp, opt){
        super(inp,opt);
    }

    loss(ctx,desired:number){
        let loss=0;
    }

    toGradientVector(desired:number|number[]|Float64Array, actual:number[], out:Float64Array|undefined):Float64Array {
    }
}