import Vec3 from './Vec3.js';
import Quaternion from './Quaternion.js';

export default class Transform {
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

    static pointToLocalFrame(position: Vec3, quaternion: Quaternion, worldPoint: Vec3, result: Vec3) {
        var result = result || new Vec3();
        worldPoint.vsub(position, result);
        quaternion.conjugate(tmpQuat);
        tmpQuat.vmult(result, result);
        return result;
    }

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

}

const tmpQuat = new Quaternion();


