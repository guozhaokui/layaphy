import { VertexShuriKenParticle } from "./VertexShuriKenParticle";
import { VertexDeclaration } from "../VertexDeclaration";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
export declare class VertexShurikenParticleBillboard extends VertexShuriKenParticle {
    static readonly vertexDeclaration: VertexDeclaration;
    readonly cornerTextureCoordinate: Vector4;
    readonly positionStartLifeTime: Vector4;
    readonly velocity: Vector3;
    readonly startColor: Vector4;
    readonly startSize: Vector3;
    readonly startRotation0: Vector3;
    readonly startRotation1: Vector3;
    readonly startRotation2: Vector3;
    readonly startLifeTime: number;
    readonly time: number;
    readonly startSpeed: number;
    readonly random0: Vector4;
    readonly random1: Vector4;
    readonly simulationWorldPostion: Vector3;
    constructor(cornerTextureCoordinate: Vector4, positionStartLifeTime: Vector4, velocity: Vector3, startColor: Vector4, startSize: Vector3, startRotation0: Vector3, startRotation1: Vector3, startRotation2: Vector3, ageAddScale: number, time: number, startSpeed: number, randoms0: Vector4, randoms1: Vector4, simulationWorldPostion: Vector3);
}
