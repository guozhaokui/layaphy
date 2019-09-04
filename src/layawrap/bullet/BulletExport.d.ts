
interface MotionStateInfo{
    num:i32;    //多少个需要同步的运动对象
    ptr:i32;    //int[]指针，每个保存这运动对象的id
}
interface BulletExport{
    __heap_base:i32,
    __data_end:i32,
    mem:WebAssembly.Memory,
    buffer:ArrayBuffer,
    u8buffer:Uint8Array,
    u32buffer:Uint32Array,
    i32buffer:Int32Array,
    f32buffer:Float32Array,
    f64buffer:Float64Array,
    // for check。 获取测试浮点数地址，看看是否是约定的值
    getCheckPtr:()=>i32,
    //c
    malloc:(sz:i32)=>i32,
    free:(ptr:i32)=>void,

    //world
    createWorld:()=>i32;
    deleteWorld:(worldptr:i32)=>void,
    world_addBody:(bodyptr:i32)=>void,
    world_removeBody:(bodyptr:i32)=>void,
    world_setG:(worldptr:i32, x:f32,y:f32,z:f32)=>void,
    world_step:(worldptr:i32, fixdt:f32,dt:f32, maxstep:i32)=>void,
    world_getAllMotionState:()=>i32,    //MotionStateInfo。所有对象都计算完后需要同步，这个地址保存所有的需要同步的对象的信息。
    //shape
    createBox:(x:f32,y:f32,z:f32, m:f32)=>i32,
    createCapsule:(h:f32,r:f32)=>void,
    createPlane:(nx:f32,ny:f32,nz:f32,d:f32)=>i32,
    createSphere:(r:f32)=>i32,
    deleteShape:(shapeptr:i32)=>void,
    // body
    RBInfoSetInertia:(x:f32,y:f32,z:f32)=>void,
    RBInfoSetMass:(m:f32)=>void,
    RBInfoSetShape:(s:i32)=>void,
    createRigidBodyByRBInfo:()=>i32,
    deleteRigidBody:(body:i32)=>void,
    bodySetID:(body:i32,id:i32)=>void,
    bodySetG:(x:f32,y:f32,z:f32)=>void,
    bodySetVel:(x:f32,y:f32,z:f32)=>void,
    bodyGetPose:(body:i32)=>i32,
    bodySetTransform:(trans:i32)=>void;

    //utils
    getATmpTransorm:()=>i32;
    test:()=>void,
}
