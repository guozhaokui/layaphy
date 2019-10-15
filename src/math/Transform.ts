import {Vec3} from './Vec3.js';
import {Quaternion} from './Quaternion.js';
import {Mat3} from './Mat3.js';

export class Transform {
    position = new Vec3();
    quaternion = new Quaternion();
    constructor(options?: { position: Vec3, quaternion: Quaternion }) {
        if(options){
            if (options.position) {
                this.position.copy(options.position);
            }
    
            if (options.quaternion) {
                this.quaternion.copy(options.quaternion);
            }
    
        }
    }

    /**
     * Get a global point in local transform coordinates.
     */
    pointToLocal(worldPoint: Vec3, result: Vec3) {
        return Transform.pointToLocalFrame(this.position, this.quaternion, worldPoint, result);
    }

    /**
     * Get a local point in global transform coordinates.
     */
    pointToWorld(localPoint: Vec3, result: Vec3) {
        return Transform.pointToWorldFrame(this.position, this.quaternion, localPoint, result);
    }

    vectorToWorldFrame(localVector: Vec3, result: Vec3) {
        var result = result || new Vec3();
        this.quaternion.vmult(localVector, result);
        return result;
    }

    /**
     * 把一个世界空间的点转换到本地空间
     * @param position 
     * @param quaternion 
     * @param worldPoint 
     * @param result 
     */
    static pointToLocalFrame(position: Vec3, quaternion: Quaternion, worldPoint: Vec3, result: Vec3) {
        var result = result || new Vec3();
        worldPoint.vsub(position, result);
        quaternion.conjugate(tmpQuat);
        tmpQuat.vmult(result, result);
        return result;
    }

    /**
     * 把一个本地空间的点转到世界空间
     * @param position 
     * @param quaternion 
     * @param localPoint 
     * @param result 
     */
    static pointToWorldFrame(position: Vec3, quaternion: Quaternion, localPoint: Vec3, result: Vec3) {
        var result = result || new Vec3();
        quaternion.vmult(localPoint, result);
        result.vadd(position, result);
        return result;
    };


    static vectorToWorldFrame(quaternion: Quaternion, localVector: Vec3, result: Vec3) {
        quaternion.vmult(localVector, result);
        return result;
    }

    static vectorToLocalFrame(position: Vec3, quaternion: Quaternion, worldVector: Vec3, result: Vec3) {
        var result = result || new Vec3();
        quaternion.w *= -1;
        quaternion.vmult(worldVector, result);
        quaternion.w *= -1;
        return result;
    }

    /**
     * 把旋转和位置转换成本地的一个矩阵和相对位置
     * @param pos 
     * @param q 
     * @param rpos 本地相对坐标
     * @param mat 本地矩阵
     */
    toLocalMat(pos:Vec3, q:Quaternion, rpos:Vec3, mat:Mat3){
        pos.vsub(this.position,rpos);   // 转成相对位置
        let invQ = tolocalMatInvQ;
        this.quaternion.conjugate(invQ);// 自己的旋转的逆
        let invMat = tolocalMat;
        invMat.setRotationFromQuaternion(invQ); // 自己的逆矩阵
        // 对方的矩阵
        mat.setRotationFromQuaternion(q);
        // 把对方的矩阵映射到本地空间
        mat.mmult(invMat,mat);
    }

    static posQToLocalMat(mypos:Vec3, myQ:Quaternion, pos:Vec3, q:Quaternion, rpos:Vec3, mat:Mat3){
        pos.vsub(mypos,rpos);   // 转成相对位置
        let invQ = tolocalMatInvQ;
        myQ.conjugate(invQ);// 自己的旋转的逆
        let invMat = tolocalMat;
        invMat.setRotationFromQuaternion(invQ); // 自己的逆矩阵
        // 对方的矩阵
        mat.setRotationFromQuaternion(q);
        // 把对方的矩阵映射到本地空间
        mat.mmult(invMat,mat);
    }    

}

const tmpQuat = new Quaternion();
const tolocalMatInvQ = new Quaternion();
const tolocalMat = new Mat3();

