import { Vol } from "./convnet_vol";

export interface ILayer{
	forward(V:Vol, is_training?:boolean):Vol;
	backward(v:Vol):Vol;

}