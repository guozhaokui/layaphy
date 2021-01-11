
declare module cannon {
/**
 * A Quaternion describes a rotation in 3D space. The Quaternion is mathematically defined as Q = x*i + y*j + z*k + w, where (i,j,k) are imaginary basis vectors. (x,y,z) can be seen as a vector related to the axis of rotation, while the real multiplier, w, is related to the amount of rotation.
 * @see http://en.wikipedia.org/wiki/Quaternion
 */
class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x: number, y: number, z: number, w: number): this;
    toString(): string;
    toArray(): number[];
    /**
     * Set the quaternion components given an axis and an angle.
     * @param  angle in radians
     */
    setFromAxisAngle(axis: Vec3, angle: number): this;
    /**
     * Converts the quaternion to axis/angle representation.
     * @method toAxisAngle
     * @param  [targetAxis] A vector object to reuse for storing the axis.
     * @return  An array, first elemnt is the axis and the second is the angle in radians.
     */
    toAxisAngle(targetAxis?: Vec3): (number | Vec3)[];
    /**
     * Set the quaternion value given two vectors. The resulting rotation will be the needed rotation to rotate u to v.
     */
    setFromVectors(u: Vec3, v: Vec3): this;
    mult(q: Quaternion, target?: Quaternion): Quaternion;
    /**
     * Get the inverse quaternion rotation.
     */
    inverse(target?: Quaternion): Quaternion;
    /**
     * Get the quaternion conjugate
     */
    conjugate(target?: Quaternion): Quaternion;
    /**
     * Normalize the quaternion. Note that this changes the values of the quaternion.
     */
    normalize(): this;
    /**
     * Approximation of quaternion normalization. Works best when quat is already almost-normalized.
     * @see http://jsperf.com/fast-quaternion-normalization
     * @author unphased, https://github.com/unphased
     */
    normalizeFast(): this;
    /**
     * Multiply the quaternion by a vector
     */
    vmult(v: Vec3, target?: Vec3): Vec3;
    vmultAxis(x: Vec3, y: Vec3, z: Vec3): void;
    /**
     * Copies value of source to this quaternion.
     */
    copy(q: Quaternion): this;
    /**
     * Convert the quaternion to euler angle representation. Order: YZX, as this page describes: http://www.euclideanspace.com/maths/standards/index.htm
     * @param string order Three-character string e.g. "YZX", which also is default.
     */
    toEuler(target: Vec3, order?: string): void;
    /**
     * See http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m
     * @method setFromEuler
     * @param  order The order to apply angles: 'XYZ' or 'YXZ' or any other combination
     */
    setFromEuler(x: number, y: number, z: number, order?: string): this;
    /**
     */
    clone(): Quaternion;
    /**
     * Performs a spherical linear interpolation between two quat
     *
     * @method slerp
     * @param  toQuat second operand
     * @param  t interpolation amount between the self quaternion and toQuat
     * @param  [target] A quaternion to store the result in. If not provided, a new one will be created.
     */
    slerp(toQuat: Quaternion, t: number, target?: Quaternion): Quaternion;
    /**
     * Rotate an absolute orientation quaternion given an angular velocity and a time step.
     * 根据角速度和dt来计算新的四元数。
     * @param   angularVelocity  当前角速度
     * @param   dt      帧时间
     * @param   angularFactor 提供一个缩放系数
     * @param   target
     * @return  The "target" object
     */
    integrate(angularVelocity: Vec3, dt: number, angularFactor: Vec3, target?: Quaternion): Quaternion;
}

/**
 * A 3x3 matrix.
 * @class Mat3
 * @constructor
 * @param array elements Array of nine elements. Optional.
 * @author schteppe / http://github.com/schteppe
 * TODO  实现太啰嗦，有时间改一下
 */
class Mat3 {
    ele: number[];
    constructor(elements?: number[]);
    /**
     * Sets the matrix to identity
     * @method identity
     * @todo Should perhaps be renamed to setIdentity() to be more clear.
     * @todo Create another function that immediately creates an identity matrix eg. eye()
     */
    identity(): void;
    /**
     * Set all elements to zero
     * @method setZero
     */
    setZero(): void;
    /**
     * Sets the matrix diagonal elements from a Vec3
     */
    setTrace(vec3: Vec3): void;
    /**
     * Matrix-Vector multiplication
     * @method vmult
     * @param  v The vector to multiply with
     * @param  target Optional, target to save the result in.
     */
    vmult(v: Vec3, target?: Vec3): Vec3;
    /**
     * Matrix-scalar multiplication
     */
    smult(s: number): void;
    /**
     * Matrix multiplication
     * 结果是 this*m ?
     * @param  m Matrix to multiply with from left side.
     * @return  The result.
     */
    mmult(m: Mat3, target?: Mat3): Mat3;
    /**
     * Scale each column of the matrix
     * 相当于把v当成一个对角矩阵，然后 this * diag(v)
     * @method scale
     * @param  v
     * @return  The result.
     */
    scale(v: Vec3, target?: Mat3): Mat3;
    /**
     * Solve Ax=b
     * @method solve
     * @param  b The right hand side
     * @param  target Optional. Target vector to save in.
     * @return The solution x
     * @todo should reuse arrays
     */
    solve(b: Vec3, target?: Vec3): Vec3;
    static solve3x4(eqns: number[], target?: Vec3): boolean;
    /**
     * Get an element in the matrix by index. Index starts at 0, not 1!!!
     * @method e
     * @param  row
     * @param  column
     * @param  value Optional. If provided, the matrix element will be set to this value.
     */
    e(row: number, column: number, value?: number): f32 | undefined;
    /**
     * Copy another matrix into this matrix object.
     * @method copy
     * @param  source
     * @return  this
     */
    copy(source: Mat3): this;
    /**
     * Returns a string representation of the matrix.
     * @method toString
     * @return string
     */
    toString(): string;
    /**
     * reverse the matrix
     * @method reverse
     * @param  target Optional. Target matrix to save in.
     * @return  The solution x
     */
    reverse(target?: Mat3): Mat3;
    /**
     * Set the matrix from a quaterion
     */
    setRotationFromQuaternion(q: Quaternion): this;
    /**
     * Transpose the matrix
     * @method transpose
     * @param   target Where to store the result.
     * @return  The target Mat3, or a new Mat3 if target was omitted.
     */
    transpose(target?: Mat3): Mat3;
}

class Vec3 {
    static ZERO: Vec3;
    static UNIT_X: Vec3;
    static UNIT_Y: Vec3;
    static UNIT_Z: Vec3;
    x: f32;
    y: f32;
    z: f32;
    constructor(x?: f32, y?: f32, z?: f32);
    cross(v: Vec3, target?: Vec3): Vec3;
    set(x: number, y: number, z: number): this;
    setZero(): void;
    vadd(v: Vec3, target?: Vec3): Vec3;
    vsub(v: Vec3, target?: Vec3): Vec3;
    /**
     * Get the cross product matrix a_cross from a vector, such that a x b = a_cross * b = c
     * @see http://www8.cs.umu.se/kurser/TDBD24/VT06/lectures/Lecture6.pdf
     */
    crossmat(): Mat3;
    /**
     * Normalize the vector. Note that this changes the values in the vector.
     */
    normalize(): number;
    /**
     * Get the version of this vector that is of length 1.
     * @param  target Optional target to save in
     * @return  Returns the unit vector
     */
    unit(target?: Vec3): Vec3;
    /**
     * Get the length of the vector
     */
    length(): number;
    /**
     * Get the squared length of the vector
     */
    lengthSquared(): number;
    /**
     * Get distance from this point to another point
     */
    distanceTo(p: Vec3): number;
    /**
     * Get squared distance from this point to another point
     */
    distanceSquared(p: Vec3): number;
    /**
     * Multiply all the components of the vector with a scalar.
     * @deprecated Use .scale instead
     * @param  target The vector to save the result in.
     * @return
     * @deprecated Use .scale() instead
     */
    scale(scalar: number, target?: Vec3): Vec3;
    /**
     * Multiply the vector with an other vector, component-wise.
     */
    vmul(v: Vec3, target?: Vec3): Vec3;
    /**
     * Scale a vector and add it to this vector. Save the result in "target". (target = this + vector * scalar)
     * target = this + scalar*v
     */
    addScaledVector(scalar: number, v: Vec3, target?: Vec3): Vec3;
    /**
     * Calculate dot product
     */
    dot(v: Vec3): number;
    isZero(): boolean;
    /**
     * Make the vector point in the opposite direction.
     */
    negate(target?: Vec3): Vec3;
    /**
     * 计算这个向量的两个tangent
     * @param t1
     * @param t2
     */
    tangents(t1: Vec3, t2: Vec3): void;
    /**
     * Converts to a more readable format
     */
    toString(): string;
    /**
     * Converts to an array
     */
    toArray(): number[];
    /**
     * Copies value of source to this vector.
     */
    copy(v: Vec3): this;
    /**
     * Do a linear interpolation between two vectors
     */
    lerp(v: Vec3, t: number, target: Vec3): void;
    /**
     * Check if a vector equals is almost equal to another one.
     */
    almostEquals(v: Vec3, precision?: f32): boolean;
    /**
     * Check if a vector is almost zero
     */
    almostZero(precision?: number): boolean;
    /**
     * Check if the vector is anti-parallel to another vector.
     * @param    precision Set to zero for exact comparisons
     */
    isAntiparallelTo(v: Vec3, precision?: number): boolean;
    /**
     * Clone the vector
     */
    clone(): Vec3;
}

class Transform {
    position: Vec3;
    quaternion: Quaternion;
    constructor(options?: {
        position: Vec3;
        quaternion: Quaternion;
    });
    /**
     * Get a global point in local transform coordinates.
     */
    pointToLocal(worldPoint: Vec3, result: Vec3): Vec3;
    /**
     * Get a local point in global transform coordinates.
     */
    pointToWorld(localPoint: Vec3, result: Vec3): Vec3;
    vectorToWorldFrame(localVector: Vec3, result: Vec3): Vec3;
    /**
     * 把一个世界空间的点转换到本地空间
     * @param position
     * @param quaternion
     * @param worldPoint
     * @param result
     */
    static pointToLocalFrame(position: Vec3, quaternion: Quaternion, worldPoint: Vec3, result: Vec3): Vec3;
    /**
     * 把一个本地空间的点转到世界空间
     * @param position
     * @param quaternion
     * @param localPoint
     * @param result
     */
    static pointToWorldFrame(position: Vec3, quaternion: Quaternion, localPoint: Vec3, result: Vec3): Vec3;
    static vectorToWorldFrame(quaternion: Quaternion, localVector: Vec3, result: Vec3): Vec3;
    static vectorToLocalFrame(position: Vec3, quaternion: Quaternion, worldVector: Vec3, result: Vec3): Vec3;
    /**
     * 把旋转和位置转换成本地的一个矩阵和相对位置
     * @param pos
     * @param q
     * @param rpos 本地相对坐标
     * @param mat 本地矩阵
     */
    toLocalMat(pos: Vec3, q: Quaternion, rpos: Vec3, mat: Mat3): void;
    static posQToLocalMat(mypos: Vec3, myQ: Quaternion, pos: Vec3, q: Quaternion, rpos: Vec3, mat: Mat3): void;
}

/**
 * An element containing 6 entries, 3 spatial and 3 rotational degrees of freedom.
 */
class JacobianElement {
    spatial: Vec3;
    rotational: Vec3;
    constructor();
    /**
     * Multiply with other JacobianElement
     */
    multiplyElement(element: JacobianElement): number;
    /**
     * Multiply with two vectors
     */
    multiplyVectors(spatial: Vec3, rotational: Vec3): number;
}

/**
 * Equation base class
 * @author schteppe
 * @param  minForce Minimum (read: negative max) force to be applied by the constraint.
 * @param  maxForce Maximum (read: positive max) force to be applied by the constraint.
 */
class Equation {
    static ID: u32;
    id: u32;
    minForce: f32;
    maxForce: f32;
    bi: Body;
    bj: Body;
    a: f32;
    b: f32;
    eps: f32;
    jacobianElementA: JacobianElement;
    jacobianElementB: JacobianElement;
    enabled: boolean;
    /**
     * A number, proportional to the force added to the bodies.
     */
    multiplier: f32;
    constructor(bi: Body, bj: Body, minForce?: f32, maxForce?: f32);
    /**
     * Recalculates a,b,eps.
     * @param stiffness
     * @param relaxation 	d 几步稳定约束。>0
     * @param timeStep      单位是秒
     */
    setSpookParams(stiffness: f32, relaxation: f32, timeStep: f32): void;
    /**
     * Computes the RHS of the SPOOK equation
     * SPOOK式子的右半部分
     *  Sλ = B = -aGq - bGW -hGiMf
     */
    computeB(h: f32): number;
    /**
     * Computes G*q, where q are the generalized body coordinates
     */
    computeGq(): number;
    /**
     * Computes G*W, where W are the body velocities
     */
    computeGW(): number;
    /**
     * Computes G*Wlambda, where W are the body velocities
     */
    computeGWlambda(): number;
    /**
     * Computes G*inv(M)*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
     */
    computeGiMf(): number;
    /**
     * Computes G*inv(M)*G'
     */
    computeGiMGt(): number;
    /**
     * Add constraint velocity to the bodies.
     * 由于约束力而产生的的对速度的修改
     */
    addToWlambda(deltalambda: number): void;
    /**
     * Compute the denominator part of the SPOOK equation: C = G*inv(M)*G' + eps
     */
    computeC(): number;
}

/**
 * @author schteppe
 */
class Material {
    static idCounter: number;
    id: number;
    static infiniteFriction: number;
    name?: string;
    friction: number;
    _restitution: number;
    set restitution(v: number);
    get restitution(): number;
    constructor(name?: string, friction?: number, restitution?: number);
}

interface MinkowskiShape {
    margin: number;
    /**
     * 获取某个方向的支撑点
     * @param dir 必须是规格化的
     * @param sup 返回的支持点
     */
    getSupportVertex(dir: Vec3, sup: Vec3): Vec3;
    /**
     * 获取去掉margin的支撑点。例如球的就是一个点
     * @param dir
     * @param sup
     */
    getSupportVertexWithoutMargin(dir: Vec3, sup: Vec3): Vec3;
}

class HitPointInfo {
    posi: Vec3;
    posj: Vec3;
    normal: Vec3;
}
class HitPointInfoArray {
    data: HitPointInfo[];
    private _length;
    getnew(): HitPointInfo;
    set length(n: int);
    get length(): int;
    reserve(n: int): void;
}
/**
 * Base class for shapes
 */
class Shape {
    static idCounter: number;
    id: number;
    type: number;
    /**
     * The local bounding sphere radius of this shape.
     */
    boundSphR: number;
    /**
     * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled.
     */
    collisionResponse: boolean;
    collisionFilterGroup: number;
    collisionFilterMask: number;
    material: Material | null;
    body: Body;
    hasPreNarrowPhase: boolean;
    minkowski: MinkowskiShape | null;
    /** margin，gjkepa的时候用，例如球的margin就是半径，如果形状过小或者有其他特殊特点，可以在子类里面设置 */
    margin: number;
    enable: boolean;
    constructor(options?: {
        type: number;
        collisionResponse: boolean;
        collisionFilterGroup: number;
        collisionFilterMask: number;
        material: Material;
    });
    /**
     * Computes the bounding sphere radius. The result is stored in the property .boundingSphereRadius
     */
    updateBndSphR(): void;
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void;
    /**
     * Get the volume of this shape
     */
    volume(): number;
    /**
     * Calculates the inertia in the local frame for this shape.
     * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    calculateLocalInertia(mass: number, target: Vec3): void;
    onPreNarrowpase(stepId: i32, pos: Vec3, quat: Quaternion): void;
    setScale(x: number, y: number, z: number, recalcMassProp?: boolean): void;
}

/**
 * Contact/non-penetration constraint equation
 * 接触公式，目标是希望保持两个点保持接触，而不是分开，所以也可以用来做连接约束。
 * @author schteppe
 * TODO 复用
 */
class ContactEquation extends Equation {
    /** 补偿值。保持一定距离 公式中的 e? */
    restitution: number;
    /**
     * World-oriented vector that goes from the center of bi to the contact point.
     * 从bi中心指向碰撞点的向量。世界空间。
     */
    ri: Vec3;
    /**
     * World-oriented vector that starts in body j position and goes to the contact point.
     * 从bj中心指向碰撞点的向量。世界空间。
     */
    rj: Vec3;
    /**
     * Contact normal, pointing out of body i.
     * 碰撞法线，指向第一个对象外面。世界空间
     */
    ni: Vec3;
    si: Shape;
    sj: Shape;
    constructor(bodyA: Body, bodyB: Body, maxForce?: number);
    private static rixn;
    private static rjxn;
    private static temp3;
    computeB(h: number): number;
    private static _vi;
    private static _vj;
    private static _xi;
    private static _xj;
    private static _relVel;
    /**
     * Get the current relative velocity in the contact point.
     * 计算相撞在法线方向的速度的力量 dot(relv, normal) ,相对于i
     */
    getImpactVelocityAlongNormal(): number;
}

class ContactInfo {
    body: Body;
    hitpos: Vec3;
    hitnorm: Vec3;
    myshape: Shape | null;
    othershape: Shape | null;
}
/**
 * 每个body保留一份所有的碰撞信息。不能按照碰撞对保存，因为可能a-b, b-a,c
 */
class ContactInfoMgr {
    added: ContactInfo[];
    addlen: number;
    removed: ContactInfo[];
    removedLen: number;
    allc: ContactInfo[];
    allcLen: number;
    newTick(): void;
    /**
     * 通知与b发生碰撞了， 这个函数同时维护remove列表，
     * 如果与b碰撞了，必须把上次记录的所有的与b相关的碰撞信息都从removed列表中移除
     * @param b
     * @return 是否找到了b
     */
    private hitBody;
    /**
     * 触发器碰撞事件
     * @param other
     * @param si
     * @param sj
     */
    addTriggerContact(other: Body, si: Shape, sj: Shape): void;
    /**
     * 普通接触的碰撞事件
     * @param me
     * @param c
     */
    addContact(me: Body, c: ContactEquation): void;
    /**
     * 添加碰撞信息。
     * @param other
     * @param hitpos 	trigger的话是null
     * @param hitnorm 	trigger的话是null
     * @param shapei
     * @param shapej
     */
    private _addC;
}

interface eventHandler {
    (evt: any): void;
}
/**
 * Base class for objects that dispatches events.
 * @class EventTarget
 * @constructor
 */
class EventTarget {
    _listeners: {
        [type: string]: eventHandler[];
    } | null;
    constructor();
    /**
     * Add an event listener
     * @method addEventListener
     * @param  {String} type
     * @param  {Function} listener
     * @return {EventTarget} The self object, for chainability.
     */
    addEventListener(type: string, listener: eventHandler): EventTarget;
    /**
     * Check if an event listener is added
     * @method hasEventListener
     * @param  {String} type
     * @param  {Function} listener
     * @return {Boolean}
     */
    hasEventListener(type: string, listener: eventHandler): boolean;
    /**
     * Check if any event listener of the given type is added
     * @method hasAnyEventListener
     * @param  {String} type
     * @return {Boolean}
     */
    hasAnyEventListener(type: string): boolean;
    /**
     * Remove an event listener
     * @method removeEventListener
     * @param  {String} type
     * @param  {Function} listener
     * @return {EventTarget} The self object, for chainability.
     */
    removeEventListener(type: string, listener: eventHandler): EventTarget;
    /**
     * Emit an event.
     * @method dispatchEvent
     * @param  {Object} event
     * @param  {String} event.type
     * @return {EventTarget} The self object, for chainability.
     */
    dispatchEvent(event: any): EventTarget;
}

/**
 * Base class for broadphase implementations
 * @class Broadphase
 * @constructor
 * @author schteppe
 */
abstract class Broadphase {
    /**
    * The world to search for collisions in.
    */
    world: World;
    /**
     * If set to true, the broadphase uses bounding boxes for intersection test, else it uses bounding spheres.
     */
    useBoundingBoxes: boolean;
    /**
     * Set to true if the objects in the world moved.
     */
    dirty: boolean;
    constructor();
    /**
     * Get the collision pairs from the world
     */
    abstract collisionPairs(world: World, p1: Body[], p2: Body[]): void;
    /**
     * Check if a body pair needs to be intersection tested at all.
     */
    needBroadphaseCollision(bodyA: Body, bodyB: Body): boolean;
    /**
     * Check if the bounding volumes of two bodies intersect.
      */
    intersectionTest(bodyA: Body, bodyB: Body, pairs1: Body[], pairs2: Body[]): void;
    /**
     * Check if the bounding spheres of two bodies are intersecting.
     */
    doBoundingSphereBroadphase(bodyA: Body, bodyB: Body, pairs1: Body[], pairs2: Body[]): void;
    /**
     * Check if the bounding boxes of two bodies are intersecting.
     */
    doBoundingBoxBroadphase(bodyA: Body, bodyB: Body, pairs1: Body[], pairs2: Body[]): void;
    /**
     * Removes duplicate pairs from the pair arrays.
     */
    makePairsUnique(pairs1: Body[], pairs2: Body[]): void;
    /**
     * To be implemented by subcasses
     */
    setWorld(world: World): void;
    /**
     * Returns all the bodies within the AABB.
     */
    aabbQuery(world: World, aabb: AABB, result: Body[]): Body[];
    hasRayQuery(): boolean;
    /**
     * 为了优化提供一个rayQuery接口，如果
     * @param world
     * @param from
     * @param to
     * @param gridcb  每个格子的回调。函数传入当前格子的body列表，返回值为true表示希望停止前进
     */
    rayQuery(world: World, from: Vec3, to: Vec3, gridcb: (dt: Body[]) => boolean): void;
    sphereQuery(world: World, pos: Vec3, radius: number, result: Body[]): Body[];
    /**
     * Check if the bounding spheres of two bodies overlap.
     * 检查两个body的包围球是否碰撞
     */
    static boundingSphereCheck(bodyA: Body, bodyB: Body): void;
}

/**
 * Storage for Ray casting data.
 */
class RaycastResult {
    rayFromWorld: Vec3;
    rayToWorld: Vec3;
    hitNormalWorld: Vec3;
    hitPointWorld: Vec3;
    hasHit: boolean;
    shape: Shape | null;
    directionWorld: Vec3;
    suspensionLength: f32;
    /**
     * The hit body, or null.
     */
    body: Body | null;
    /**
     * The index of the hit triangle, if the hit shape was a trimesh.
     */
    hitFaceIndex: number;
    /**
     * Distance to the hit. Will be set to -1 if there was no hit.
     */
    distance: number;
    /**
     * If the ray should stop traversing the bodies.
     */
    _shouldStop: boolean;
    groundObject: i32;
    constructor();
    /**
     * Reset all result data.
     * @method reset
     */
    reset(): void;
    /**
     * @method abort
     */
    abort(): void;
    set(rayFromWorld: Vec3, rayToWorld: Vec3, hitNormalWorld: Vec3, hitPointWorld: Vec3, shape: Shape, body: Body, distance: number): void;
}

/**
 * Constraint base class
 * @author schteppe
 */
class Constraint {
    static idCounter: number;
    /**
     * Equations to be solved in this constraint
     */
    equations: Equation[];
    bodyA: Body;
    bodyB: Body;
    id: number;
    /**
     * Set to true if you want the bodies to collide when they are connected.
     */
    collideConnected: boolean;
    constructor(bodyA: Body, bodyB: Body, wakeupBodies: boolean);
    /**
     * Update all the equations with data.
     */
    update(): void;
    /**
     * Enables all equations in the constraint.
     */
    enable(): void;
    /**
     * Disables all equations in the constraint.
     */
    disable(): void;
}

/**
 * Constrains the slipping in a contact along a tangent
 * @author schteppe
 */
class FrictionEquation extends Equation {
    ri: Vec3;
    rj: Vec3;
    t: Vec3;
    /**
     *
     * @param bodyA
     * @param bodyB
     * @param slipForce should be +-F_friction = +-mu * F_normal = +-mu * m * g
     */
    constructor(bodyA: Body, bodyB: Body, slipForce: number);
    computeB(h: number): number;
}

class hitInfo {
    point: Vec3;
    normal: Vec3;
    depth: f32;
    constructor(point: Vec3, normal: Vec3, depth: f32);
}
/**
 * A set of polygons describing a convex shape.
 * @description The shape MUST be convex for the code to work properly. No polygons may be coplanar (contained
 * in the same 3D plane), instead these should be merged into one polygon.
 *
 * @param {array} points An array of Vec3's
 * @param {array} faces Array of integer arrays, describing which vertices that is included in each face.
 *
 * @author qiao / https://github.com/qiao (original author, see https://github.com/qiao/three.js/commit/85026f0c769e4000148a67d45a9e9b9c5108836f)
 * @author schteppe / https://github.com/schteppe
 * @see http://www.altdevblogaday.com/2011/05/13/contact-generation-between-3d-convex-meshes/
 * @see http://bullet.googlecode.com/svn/trunk/src/BulletCollision/NarrowPhaseCollision/btPolyhedralContactClipping.cpp
 *
 * @todo Move the clipping functions to ContactGenerator?
 * @todo Automatically merge coplanar polygons in constructor.
 */
interface polygon extends Array<number> {
    connectedFaces?: i32[];
}
class ConvexPolyhedron extends Shape {
    /**
     * Array of Vec3
     */
    vertices: Vec3[];
    worldVertices: Vec3[];
    worldVerticesNeedsUpdate: boolean;
    /**
     * Array of integer arrays, indicating which vertices each face consists of
     */
    faces: polygon[];
    /**
     * Array of Vec3
     */
    faceNormals: Vec3[];
    worldFaceNormalsNeedsUpdate: boolean;
    worldFaceNormals: Vec3[];
    /**
     * Array of Vec3
     */
    uniqueEdges: Vec3[];
    /**
     * If given, these locally defined, normalized axes are the only ones being checked when doing separating axis check.
     */
    uniqueAxes: Vec3[] | null;
    /**
     *
     * @param points
     * @param faces 二维数组。每个面由那几个顶点组成
     * @param uniqueAxes
     */
    constructor(points?: Vec3[], faces?: polygon[], uniqueAxes?: Vec3[]);
    /**
     * Computes uniqueEdges
     */
    computeEdges(): void;
    /**
     * Compute the normals of the faces. Will reuse existing Vec3 objects in the .faceNormals array if they exist.
     */
    computeNormals(): void;
    /**
     * Compute the normal of a face from its vertices
     */
    getFaceNormal(i: number, target: Vec3): void;
    /**
     * @method clipAgainstHull
     * @param {Vec3} posA
     * @param {Quaternion} quatA
     * @param {ConvexPolyhedron} hullB
     * @param {Vec3} posB
     * @param {Quaternion} quatB
     * @param {Vec3} separatingNormal
     * @param {Number} minDist Clamp distance
     * @param {Number} maxDist
     * @param {array} result The an array of contact point objects, see clipFaceAgainstHull
     * @see http://bullet.googlecode.com/svn/trunk/src/BulletCollision/NarrowPhaseCollision/btPolyhedralContactClipping.cpp
     */
    clipAgainstHull(posA: Vec3, quatA: Quaternion, hullB: ConvexPolyhedron, //{ faces, faceNormals, vertices },
    posB: Vec3, quatB: Quaternion, separatingNormal: Vec3, minDist: f32, maxDist: f32, result: hitInfo[]): void;
    /**
     * Find the separating axis between this hull and another
     * 查找两个hull的分离轴
     * @param  hullB
     * @param  posA
     * @param  quatA
     * @param  posB
     * @param  quatB
     * @param  target The target vector to save the axis in 。 如果发生了碰撞，这个深度最浅的分离轴
     * @return Returns false if a separation is found, else true
     */
    findSeparatingAxis(hullB: ConvexPolyhedron, posA: Vec3, quatA: Quaternion, posB: Vec3, quatB: Quaternion, target: Vec3, faceListA: number[] | null, faceListB: number[] | null): boolean;
    /**
     * Test separating axis against two hulls. Both hulls are projected onto the axis and the overlap size is returned if there is one.
     * 用axis来投影两个hull，看是否发生重叠
     * @parame axis 世界空间的向量
     * @return  The overlap depth, or -10 if no penetration.
     */
    testSepAxis(axis: Vec3, hullB: ConvexPolyhedron, posA: Vec3, quatA: Quaternion, posB: Vec3, quatB: Quaternion): number;
    /**
     * @method calculateLocalInertia
     * @param   mass
     * @param   target
     */
    calculateLocalInertia(mass: number, target: Vec3): void;
    /**
     * @method getPlaneConstantOfFace
     * @param   face_i Index of the face
     */
    getPlaneConstantOfFace(face_i: i32): f32;
    /**
     * Clip a face against a hull.
     * @param  separatingNormal
     * @param  posA
     * @param  quatA
     * @param  worldVertsB1 An array of Vec3 with vertices in the world frame.
     * @param  minDist Distance clamping
     * @param  maxDist
     * @param Array result Array to store resulting contact points in. Will be objects with properties: point, depth, normal. These are represented in world coordinates.
     */
    clipFaceAgainstHull(separatingNormal: Vec3, posA: Vec3, quatA: Quaternion, worldVertsB1: Vec3[], minDist: number, maxDist: number, result: hitInfo[]): void;
    /**
     * Clip a face in a hull against the back of a plane.
     * @method clipFaceAgainstPlane
     * @param {Array} inVertices
     * @param {Array} outVertices
     * @param {Vec3} planeNormal
     * @param {Number} planeConstant The constant in the mathematical plane equation
     */
    clipFaceAgainstPlane(inVertices: Vec3[], outVertices: Vec3[], planeNormal: Vec3, planeConstant: f32): Vec3[];
    computeWorldVertices(position: Vec3, quat: Quaternion): void;
    computeLocalAABB(aabbmin: Vec3, aabbmax: Vec3): void;
    /**
     * Updates .worldVertices and sets .worldVerticesNeedsUpdate to false.
     */
    computeWorldFaceNormals(quat: Quaternion): void;
    /**
     * @method updateBndSphR
     */
    updateBndSphR(): void;
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void;
    /**
     * Get approximate convex volume
     * @method volume
     * @return {Number}
     */
    volume(): number;
    /**
     * Get an average of all the vertices positions
     */
    getAveragePointLocal(target?: Vec3): Vec3;
    /**
     * Transform all local points. Will change the .vertices
     */
    transformAllPoints(offset: Vec3, quat: Quaternion): void;
    /**
     * Checks whether p is inside the polyhedra. Must be in local coords. The point lies outside of the convex hull of the other points
     *  if and only if the direction of all the vectors from it to those other points are on less than one half of a sphere around it.
     * @param   p      A point given in local coordinates
     * @return
     */
    pointIsInside(p: Vec3): false | 1 | -1;
    /**
     * Get face normal given 3 vertices
     */
    static computeNormal(va: Vec3, vb: Vec3, vc: Vec3, target: Vec3): void;
    /**
     * Get max and min dot product of a convex hull at position (pos,quat) projected onto an axis. Results are saved in the array maxmin.
     * @param {ConvexPolyhedron} hull
     * @param  axis 投射轴，世界空间
     * @param  pos  hull的位置
     * @param  quat hull的朝向
     * @param  result result[0] and result[1] will be set to maximum and minimum, respectively.
     */
    static project(hull: ConvexPolyhedron, axis: Vec3, pos: Vec3, quat: Quaternion, result: number[]): void;
    onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void;
}

/**
 * A 3d box shape.
 */
class Box extends Shape implements MinkowskiShape {
    halfExtents: Vec3;
    origHalfExt: Vec3 | null;
    /**
     * Used by the contact generator to make contacts with other convex polyhedra for example
     * 把BOX转成convex
     */
    convexPolyhedronRepresentation: ConvexPolyhedron;
    minkowski: this;
    constructor(halfExtents: Vec3);
    getSupportVertex(dir: Vec3, sup: Vec3): Vec3;
    getSupportVertexWithoutMargin(dir: Vec3, sup: Vec3): Vec3;
    onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void;
    /**
     * Updates the local convex polyhedron representation used for some collisions.
     */
    updateConvexPolyhedronRepresentation(): void;
    calculateLocalInertia(mass: number, target?: Vec3): Vec3;
    /**
     * Get the box 6 side normals
     * @param       sixTargetVectors An array of 6 vectors, to store the resulting side normals in.
     * @param quat             Orientation to apply to the normal vectors. If not provided, the vectors will be in respect to the local frame.
     */
    getSideNormals(sixTargetVectors: Vec3[], quat: Quaternion): Vec3[];
    volume(): number;
    updateBndSphR(): void;
    forEachWorldCorner(pos: Vec3, quat: Quaternion, callback: (x: number, y: number, z: number) => void): void;
    static boxext1: Vec3;
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void;
    static orioff: Vec3;
    /**
     * 如果原点不在中心的包围盒的更新
     * @param pos
     * @param quat
     * @param scale
     * @param min 	相对于原点的min
     * @param max 	相对于原点的max
     */
    static calculateWorldAABB1(pos: Vec3, quat: Quaternion, scale: Vec3 | null, min: Vec3, max: Vec3, outmin: Vec3, outmax: Vec3): void;
    static calculateWorldAABB11(pos: Vec3, quat: Quaternion, scale: Vec3, min: Vec3, max: Vec3, outmin: Vec3, outmax: Vec3): void;
    setScale(x: number, y: number, z: number, recalcMassProp?: boolean): void;
    static calculateInertia(halfExtents: Vec3, mass: number, target: Vec3): void;
    /**
     * 球与本地空间的盒子的碰撞信息
     * 这个与sphere.ts中的hitbox有点重复了
     * @param pos 球的位置
     * @param r     球的半径
     * @param hitpos1   球的碰撞点
     * @param hitpos2   盒子的碰撞点
     * @param hitNormal  碰撞法线，推开球的方向
     */
    static sphereHitBox(pos: Vec3, r: number, halfext: Vec3, hitpos: Vec3, hitpost2: Vec3, hitNormal: Vec3): f32;
    /**
     *
     * @param myPos
     * @param myQ
     * @param voxel
     * @param voxPos
     * @param voxQuat
     * @param hitpoints  其中的法线是推开voxel的
     * @param justtest
     */
    hitVoxel(myPos: Vec3, myQ: Quaternion, voxel: Voxel, voxPos: Vec3, voxQuat: Quaternion, hitpoints: HitPointInfo[], justtest: boolean): boolean;
    hitAAQuad(mypos: Vec3, myQ: Quaternion, minx: number, miny: number, maxx: number, maxy: number): void;
    /**
     * 收集射线检测的结果，排除重复点，一旦到达两个碰撞点就给newst和newed赋值，并返回true
     * @param t 碰撞点的时间
     * @param x 碰撞点的位置
     * @param y
     * @param z
     * @param newst
     * @param newed
     */
    private static _rayHitBoxChkHitInfo;
    /**
     * 计算线段和box的两个交点。如果起点或者终点在内部，则直接使用。
     * 返回false 则无碰撞
     * @param st
     * @param ed
     * @param min
     * @param max
     * @param newSt
     * @param newEd
     */
    static rayHitBox(st: Vec3, ed: Vec3, min: Vec3, max: Vec3, newSt: Vec3, newEd: Vec3): boolean;
}

interface voxdata {
    x: i32;
    y: i32;
    z: i32;
    color: i32;
}
class hashData {
    x: i32;
    y: i32;
    z: i32;
    v: i32;
}
/**
 * 原始数据构造
 * 除了第一层以外都是完整八叉树  用来做大块的判断 上层完整的话，占0层的1/7的内存
 * 第一层用hash来保存
 */
class SparseVoxData {
    data: voxdata[];
    dataLod: voxdata[][];
    private gridsz;
    dataszx: i32;
    dataszy: i32;
    dataszz: i32;
    maxsz: i32;
    /** local坐标的包围盒。相对于本地原点 */
    aabbmin: Vec3;
    aabbmax: Vec3;
    hashdata: hashData[][];
    constructor(dt: voxdata[], xn: i32, yn: i32, zn: i32, min: Vec3, max: Vec3);
    static hashSparseVox(vox: SparseVoxData): hashData[][];
    travAll(cb: (x: i32, y: i32, z: i32, v: i32) => void): void;
    getRaw(x: i32, y: i32, z: i32): i32;
    get(x: i32, y: i32, z: i32): i32;
    genLOD(): void;
    OBBCheck(min: Vec3, max: Vec3, mat: Mat3): void;
}
/**
 * 每一级的voxel数据
 */
class VoxelBitData {
    xs: number;
    ys: number;
    zs: number;
    dt: Uint8Array;
    /** 由于上面为了对齐可能有多余的，这里记录实际数据 */
    rx: number;
    ry: number;
    rz: number;
    /**
     * 由于不是POT
     * 可能会扩展bbx，例如 上一级x有6个格子,对应的xs=3, bbx=0~6， 每个格子宽度为1
     * 下一级的时候，xs=2，表示4个格子，比直接除2多出一个来，所以要扩展 上一级gridx*2 = 2
     * 如果下一级没有扩展，则不变，例如 8->4->2->1
     */
    max: Vec3;
    min: Vec3;
    /**
     * xyzsize是数据个数，这里会用bit来保存，所以里面每个轴会除以2
     * @param xsize
     * @param ysize
     * @param zsize
     * @param min  原始包围盒大小
     * @param max
     */
    constructor(xsize: i32, ysize: i32, zsize: i32, min: Vec3, max: Vec3);
    setBit(x: i32, y: i32, z: i32): void;
    getBit(x: i32, y: i32, z: i32): boolean | 0;
    /**
     * 生成上一级数据，并且填充
     */
    genParent(): VoxelBitData | null;
}
interface CubeModule {
    _data: Uint8Array;
    _dx: int;
    _dy: int;
    _dz: int;
    _lx: int;
    _ly: int;
    _lz: int;
}
interface IOrigVoxData {
    /** 只有SparseVoxeData 有 */
    dataszx: int;
    dataszy: int;
    dataszz: int;
    /** 遍历，只有sparseVoxelData有 */
    travAll?(f: (x: int, y: int, z: int, v: int) => void): void;
    /** 原始包围盒 */
    aabbmin: Vec3;
    aabbmax: Vec3;
    fillVoxBitData(dt: VoxelBitData): void;
}

class Voxel extends Shape {
    voxData: IOrigVoxData;
    bitDataLod: VoxelBitData[];
    dataxsize: number;
    dataysize: number;
    datazsize: number;
    cpos: Vec3;
    quat: Quaternion;
    pos: Vec3;
    centroid: Vec3;
    mat: Mat3;
    /** 别的形状都是直接改变参数，这里为了简单通用，记下了scale。注意非均匀缩放是有问题的。动态改变的话会破坏刚体的假设 */
    scale: Vec3 | null;
    invScale: Vec3 | null;
    maxScale: number;
    aabbmin: Vec3;
    aabbmax: Vec3;
    addToSceTick: number;
    /** 没有缩放的时候的格子的大小 */
    gridw: number;
    /** 简化为box时的情况 */
    box: Box | null;
    constructor(dt: SparseVoxData | CubeModule, scale?: number);
    private initFromSparseVoxData;
    /** 从layame的格子信息中构造。注意可能有效率问题 */
    private initFromCubeModule;
    /**
     * 根据定义的中间接口构造
     * @param dt
     * @param scale 每个格子的缩放，这个并不记录，相当于会直接修改形状，影响参数是每个格子的大小和包围盒。
     * 				下面的setScale是真正记录的缩放。
     */
    private initFromVData;
    /**
     * 按照box来处理voxel
     * @param b
     */
    setAsBox(b: boolean): void;
    /**
     * voxel的缩放只能是均匀的。
     * @param x
     * @param y
     * @param z
     * @param recalcMassProp
     */
    setScale(x: number, y: number, z: number, recalcMassProp?: boolean): void;
    updateAABB(): void;
    getVox(x: i32, y: i32, z: i32): boolean | 0;
    calcCentroid(): void;
    calculateLocalInertia(mass: number, target: Vec3): void;
    AABBCheck(min: Vec3, max: Vec3, onlytest?: boolean): boolean;
    getLOD(szx: f32, szy: f32, szz: f32): i32;
    getLODByW(w: number): void;
    updateBndSphR(): void;
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void;
    onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void;
    setData(dt: Uint8Array, xnum: i32, ynum: i32, znum: i32, xs: f32, ys: f32, zs: f32): void;
    fill(): void;
    volume(): number;
    hitPlane(myPos: Vec3, planePos: Vec3, planeNorm: Vec3, hitPos: Vec3): f32;
    hitVoxel(otherPos: Vec3, otherQuat: Quaternion, hitPos: Vec3): f32;
    checkAABB(): boolean;
    checkSphere(pos: Vec3, r: f32, hitnorm: Vec3): f32;
    getNormal(x: i32, y: i32, z: i32, nout: Vec3): Vec3;
    hitCapsule(): void;
    rayCast(ori: Vec3, dir: Vec3): RaycastResult;
    /**
     * 取出某一层的某个区域边信息，注意结果不允许保存
     * @param dirid 哪个方向， 0表示yz平面  1表示xz平面 2表示xy平面
     * @param id  0表示0层的底
     */
    getEdge(dirid: i32, id: i32, ustart: i32, vstart: i32, uend: i32, vend: i32): number[];
    pointToWorld(pt: Vec3, out: Vec3): Vec3;
    /**
     * 把格子坐标xyz，根据pos和Q转换成世界坐标min,max
     * @param x
     * @param y
     * @param z
     * @param pos
     * @param Q
     * @param min
     * @param max
     */
    xyzToPos(x: int, y: int, z: int, pos: Vec3, Q: Quaternion, min: Vec3, max: Vec3): void;
    /**
     * 射线经过voxel的路径。原理是每次根据碰撞到每个分隔面的时间取最近的。
     * @param st  voxel空间的起点
     * @param ed  voxel空间的终点
     * @param visitor 返回true则继续
     */
    rayTravel(st: Vec3, ed: Vec3, visitor: (x: int, y: int, z: int, has: boolean) => boolean): void;
    private _dtToStr;
    toJSON(): string;
    fromJSON(data: string): void;
}

/**
 * TODO y向上直立的capsule
 */
/**
 * 缺省主轴是z轴
 */
class Capsule extends Shape implements MinkowskiShape {
    radius: f32;
    height: f32;
    noTrans: boolean;
    axis: Vec3;
    voxel: Voxel | null;
    minkowski: this;
    constructor(r?: f32, h?: f32);
    /**
     * MinkowskiShape 的接口
     * 暂时沿着z
     * @param dir 必须是规格化的
     * @param sup
     */
    getSupportVertex(dir: Vec3, sup: Vec3): Vec3;
    getSupportVertexWithoutMargin(dir: Vec3, sup: Vec3): Vec3;
    /**
     * 计算halfh向量变换后的值
     * @param q
     */
    calcDir(q: Quaternion): Vec3;
    /**
     * 某个方向上最远距离，相对于自己的原点。前提是已经计算了轴向了。类似于包围盒， dir*maxD 不一定在胶囊上，只有平行和垂直的时候才在表面上
     * @param pos 胶囊所在世界空间的位置
     * @param dir 世界空间的朝向
     * @param outPos 最远的地方的点。 法线就是方向
     */
    supportPoint(myPos: Vec3, dir: Vec3, outPos: Vec3): f32;
    supportPoint_norm(myPos: Vec3, normDir: Vec3, outPos?: Vec3): f32;
    pointDistance(pos: Vec3, p: Vec3): f32;
    /**
     * 到一个平面的距离，如果碰撞了，取碰撞点。
     * 碰撞法线一定是平面法线
     * @param hitPos   世界坐标的碰撞位置	.在自己身上
     * @param hitNormal 碰撞点的法线，这个应该取对方的，意味着把碰撞点沿着这个法线推出
     * @return 进入深度， <0表示没有碰撞
     */
    hitPlane(myPos: Vec3, planePos: Vec3, planeNorm: Vec3, hitPos: Vec3): f32;
    static boxquatmat: Mat3;
    static boxinvquat: Quaternion;
    static boxCapLocal: Vec3;
    static boxX: Vec3;
    static boxY: Vec3;
    /**
     * capsule 与BOX碰撞。 相当于一个线段与一个膨胀了的盒子做检测
     * @param myPos
     * @param boxHalf
     * @param boxPos
     * @param boxQuat
     * @param hitPos
     * @param hitpos1
     * @param hitNormal 把自己推开的法线，即对方身上的，朝向自己的。
     * @param justtest
     */
    hitBox(myPos: Vec3, boxHalf: Vec3, boxPos: Vec3, boxQuat: Quaternion, hitPos: Vec3, hitpos1: Vec3, hitNormal: Vec3, justtest: boolean): f32;
    /**
     *
     * @param myPos
     * @param cap
     * @param capPos
     * @param hitPos
     * @param hitPos 	另一个对象的碰撞点
     * @param hitNormal 把自己推开的法线，即对方身上的，朝向自己的。
     * @param justtest
     */
    hitCapsule(myPos: Vec3, cap: Capsule, capPos: Vec3, hitPos: Vec3, hitPos1: Vec3, hitNormal: Vec3, justtest: boolean): f32;
    /**
     *
     * @param myPos
     * @param r2  球的半径
     * @param sphPos
     * @param hitPos 	自己身上的碰撞点
     * @param hitNormal 是球上面的法线（与自己的相反）
     * @param justtest  只检测碰撞，不要具体结果
     */
    hitSphere(myPos: Vec3, r2: f32, sphPos: Vec3, hitPos: Vec3, hitPos1: Vec3, hitNormal: Vec3, justtest: boolean): f32;
    /**
     * 计算胶囊的转动惯量
     * 用圆柱和半球的转动惯量，结合平移轴原理组合出来
     * @param mass
     * @param target
     * @see http://en.wikipedia.org/wiki/List_of_moments_of_inertia
     * @see https://zh.wikipedia.org/wiki/%E8%BD%89%E5%8B%95%E6%85%A3%E9%87%8F%E5%88%97%E8%A1%A8
     */
    calculateLocalInertia(mass: f32, target: Vec3): void;
    updateBndSphR(): void;
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void;
    volume(): f32;
    onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void;
    voxelize(): Voxel;
}

/**
 * A plane, facing in the Z direction. The plane has its surface at z=0 and everything below z=0 is assumed to be solid plane. To make the plane face in some other direction than z, you must put it inside a Body and rotate that body. See the demos.
 */
class Plane extends Shape {
    worldNormal: Vec3;
    worldNormalNeedsUpdate: boolean;
    boundSphR: number;
    constructor();
    computeWorldNormal(quat: Quaternion): void;
    calculateLocalInertia(mass: number, target?: Vec3): Vec3;
    volume(): number;
    onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void;
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void;
    updateBndSphR(): void;
}


/**
 * 渲染物理线框
 */
class PhyRender extends IPhyRender {
    sce: laya.d3.core.scene.Scene3D;
    phyworld: World;
    drawAllShape: boolean;
    renders: laya.d3.core.pixelLine.PixelLineSprite3D[];
    posInd: Vector3;
    posIndColor: laya.d3.math.Color;
    setPosInd: boolean;
    enable: boolean;
    /** 持久显示的点，直到clear */
    private persistPoint;
    /** 持久显示的矢量。格式是 vec,pos,vec,pos, ... 直到clear */
    private persistVec;
    static inst: PhyRender;
    constructor(sce: laya.d3.core.scene.Scene3D, world: World);
    getInst(): PhyRender;
    showPos(x: f32, y: f32, z: f32): void;
    /**
     * 在st位置显示dir矢量
     * @param stx
     * @param sty
     * @param stz
     * @param dirx
     * @param diry
     * @param dirz
     * @param color
     */
    addVec(stx: number, sty: number, stz: number, dirx: number, diry: number, dirz: number, color: number): void;
    addVec1(st: Vec3, dir: Vec3, scale: number, color: number): void;
    addPersistPoint(x: number | Vec3, y?: number, z?: number, name?: string): number;
    delPersistPoint(id: i32): void;
    addPersistVec(dx: number | Vec3, dy: number | Vec3, dz?: number, x?: number, y?: number, z?: number, name?: string): number;
    delPersistVec(id: i32): void;
    clearPersist(): void;
    addSeg(stx: number, sty: number, stz: number, edx: number, edy: number, edz: number, color: number): void;
    addSegV3(st: Vec3, ed: Vec3, color: number): void;
    /**
     * 显示一个点
     * @param px
     * @param py
     * @param pz
     * @param color
     */
    addPoint(px: number, py: number, pz: number, color: number): void;
    addPoint1(p: Vec3, color: number): void;
    drawLine(pts: Vec3[], color: number): void;
    drawLine1(pts: Vec3[], h: Vec3, color: number): void;
    addAABB(min: Vec3, max: Vec3, color: number): void;
    stepStart(): void;
    stepEnd(): void;
    internalStep(): void;
    static boxVert: Vec3[];
    transBox(halfExt: Vec3, pos: Vec3, quat: Quaternion): Vec3[];
    showShape(shape: Shape, pos: Vec3, quat: Quaternion): void;
    /**
     *
     * @param vin 局部坐标位置
     * @param pos 对象在世界空间的坐标
     * @param q    对象在世界空间的朝向
     * @param vout 转换成世界空间的点
     */
    transVec3(vin: Vec3, pos: Vec3, q: Quaternion, vout: Vec3): Vec3;
    createCapsuleLine(cap: Capsule, pos: Vec3, q: Quaternion): void;
    createPlaneLine(plane: Plane, pos: Vec3, q: Quaternion): void;
    showUI(s: laya.display.Sprite, x: number, y: number, z: number): void;
}

/**
 * Defines what happens when two materials meet.
 * @class ContactMaterial
 * @constructor
 * @param {Material} m1
 * @param {Material} m2
 * @param {object} [options]
 * @param {Number} [options.friction=0.3]
 * @param {Number} [options.restitution=0.3]
 * @param {number} [options.contactEquationStiffness=1e7]
 * @param {number} [options.contactEquationRelaxation=3]
 * @param {number} [options.frictionEquationStiffness=1e7]
 * @param {Number} [options.frictionEquationRelaxation=3]
 */
class ContactMaterial extends Material {
    static idCounter: number;
    /**
     * Identifier of this material
     */
    id: number;
    /**
     * Participating materials
     * @todo  Should be .materialA and .materialB instead
     */
    materials: Material[];
    /**
     * Friction coefficient
     */
    /**
     * Restitution coefficient
     * 范围是0到1， 1的弹性最大
     */
    /**
     The stiffness approximately corresponds to the stiffness of a spring, which gives a force F=-k*x where x is the displacement of the spring.
     Regularization time is corresponds to the number of time steps you need to take to stabilize the constraint (larger value => softer contact).
    */
    /**
     * Stiffness of the produced contact equations
     */
    contactEquationStiffness: number;
    /**
     * Relaxation time of the produced contact equations
     */
    contactEquationRelaxation: number;
    /**
     * Stiffness of the produced friction equations
     */
    frictionEquationStiffness: number;
    /**
     * Relaxation time of the produced friction equations
     */
    frictionEquationRelaxation: number;
    constructor(m1: Material | null, m2: Material | null, friction: number, restitution: number);
}

/**
 * Constraint equation solver base class.
 * @author schteppe / https://github.com/schteppe
 */
class Solver {
    equations: Equation[];
    constructor();
    /**
     * Should be implemented in subclasses!
     */
    solve(dt: number, world: World): number;
    addEquation(eq: Equation): void;
    removeEquation(eq: Equation): void;
    /**
     * remove all equations
     */
    removeAllEquations(): void;
}

/**
 * @class TupleDictionary
 * @constructor
 */
class TupleDictionary<T> {
    data: {
        keys: string[];
        [key: string]: any;
    };
    constructor();
    get(i: i32, j: i32): T;
    set(i: i32, j: i32, value: T): void;
    reset(): void;
}

/**
 * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a given distance.
 * @class Heightfield
 * @extends Shape
 * @constructor
 * @param {Array} data An array of Y values that will be used to construct the terrain.
 * @param {object} options
 * @param {Number} [options.minValue] Minimum value of the data points in the data array. Will be computed automatically if not given.
 * @param {Number} [options.maxValue] Maximum value.
 * @param {Number} [options.elementSize=0.1] World spacing between the data points in X direction.
 * @todo Should be possible to use along all axes, not just y
 * @todo should be possible to scale along all axes
 *
 * @example
 *     // Generate some height data (y-values).
 *     var data = [];
 *     for(var i = 0; i < 1000; i++){
 *         var y = 0.5 * Math.cos(0.2 * i);
 *         data.push(y);
 *     }
 *
 *     // Create the heightfield shape
 *     var heightfieldShape = new Heightfield(data, {
 *         elementSize: 1 // Distance between the data points in X and Y directions
 *     });
 *     var heightfieldBody = new Body();
 *     heightfieldBody.addShape(heightfieldShape);
 *     world.addBody(heightfieldBody);
 */
class Heightfield extends Shape {
    /**
     * An array of numbers, or height values, that are spread out along the x axis.
     */
    data: f32[][];
    minValue: f32;
    maxValue: f32;
    /**
     * The width of each element
     * 每个格子的宽度
     * @todo elementSizeX and Y
     */
    elementSize: f32;
    cacheEnabled: boolean;
    pillarConvex: ConvexPolyhedron;
    pillarOffset: Vec3;
    _cachedPillars: {
        [key: string]: {
            convex: ConvexPolyhedron;
            offset: Vec3;
        };
    };
    constructor(data: number[][], minValue: number | null | undefined, maxValue: number | null | undefined, elementSize: number);
    /**
     * Call whenever you change the data array.
     */
    update(): void;
    onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void;
    /**
     * Update the .minValue property
     */
    updateMinValue(): void;
    /**
     * Update the .maxValue property
     */
    updateMaxValue(): void;
    /**
     * Set the height value at an index. Don't forget to update maxValue and minValue after you're done.
     */
    setHeightValueAtIndex(xi: number, yi: number, value: number): void;
    /**
     * Get max/min in a rectangle in the matrix data
     * @param   [result] An array to store the results in.
     * @return  The result array, if it was passed in. Minimum will be at position 0 and max at 1.
     */
    getRectMinMax(iMinX: number, iMinY: number, iMaxX: number, iMaxY: number, result?: f32[]): void;
    /**
     * Get the index of a local position on the heightfield. The indexes indicate the rectangles, so if your terrain is made of N x N height data points, you will have rectangle indexes ranging from 0 to N-1.
     * 根据空间位置来确定对应的数据的位置
     * @param   result Two-element array
     * @param   clamp If the position should be clamped to the heightfield edge.
     * @return 如果不在范围内，则false
     */
    getIndexOfPosition(x: number, y: number, result: number[], clamp: bool): boolean;
    /**
     * 返回x,y所在位置的三角形，返回三角形的三个点
     * @param x
     * @param y
     * @param edgeClamp
     * @param a
     * @param b
     * @param c
     * 返回是否在上半三角形
     */
    getTriangleAt(x: f32, y: f32, edgeClamp: bool, a: Vec3, b: Vec3, c: Vec3): bool;
    getNormalAt(x: f32, y: f32, edgeClamp: bool, result: Vec3): void;
    getNormal(x: int, y: int, result: Vec3): void;
    /**
     * Get an AABB of a square in the heightfield
     * @param  {number} xi
     * @param  {number} yi
     * @param  {AABB} result
     */
    getAabbAtIndex(xi: i32, yi: i32, result: AABB): void;
    /**
     * Get the height in the heightfield at a given position
     * 获取xy位置的高度
     */
    getHeightAt(x: f32, y: f32, edgeClamp: bool): number;
    getCacheConvexTrianglePillarKey(xi: number, yi: number, getUpperTriangle: boolean): string;
    getCachedConvexTrianglePillar(xi: number, yi: number, getUpperTriangle: boolean): {
        convex: ConvexPolyhedron;
        offset: Vec3;
    };
    setCachedConvexTrianglePillar(xi: number, yi: number, getUpperTriangle: boolean, convex: ConvexPolyhedron, offset: Vec3): void;
    clearCachedConvexTrianglePillar(xi: number, yi: number, getUpperTriangle: boolean): void;
    getPlane(xi: int, yi: int, upper: boolean, a: Vec3, b: Vec3, c: Vec3, norm: Vec3): number;
    /**
     * Get a triangle from the heightfield
     */
    getTriangle(xi: int, yi: int, upper: boolean, a: Vec3, b: Vec3, c: Vec3): void;
    /**
     * Get a triangle in the terrain in the form of a triangular convex shape.
     * 把xy位置的地块转成一个convex，保存到 this.pllarConvex中
     * xi,yi定位到data中的索引
     */
    getConvexTrianglePillar(xi: i32, yi: i32, getUpperTriangle: boolean): void;
    calculateLocalInertia(mass: number, target?: Vec3): Vec3;
    volume(): number;
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void;
    updateBndSphR(): void;
    static getRPoitnTNorm: Vec3;
    static getRPointTmpN: Vec3;
    /**
     * 根据所在位置和球的半径，计算加厚以后的新的xi,yi处的点。用来进行球和地面的碰撞检测
     * 周围四个点可能在一个平面，也可能再两个，三个，四个。。，假设最多4个
     *  + ---------------> x
     *  |      1
     *  | 2  xi,yi  3
     *  |      4
     *  v
     *  z
     * 所有的平面都沿着自己的法线增厚R，则新的交点一定在各个法线的合向量方向，沿着这个方向直到到达d的投影距离
     * @param xi
     * @param yi
     * @param p
     */
    _getRPoint(R: number, xi: int, yi: int, p: Vec3): Vec3;
    /**
     * 最简假设的情况。地形很大，球一定小于格子
     * 在大于blockAng的情况下只能下滑
     * 返回 0 没有碰撞 1 碰撞了 2 碰撞了，但是不允许控制，处于下滑状态
     * 太陡的地方的处理：不能直接推出去，比如从一个缓坡走到悬崖
     * 按理说悬崖的处理应该是逻辑做的，需要判断整体的高度
     * @param pos
     * @param R
     * @param cliffAng
     * @param stopOnCliff
     * @param stepHeight
     * @param hitPos
     * @param hitDeep 碰撞结果，需要回退的值
     */
    hitSmallSphere(pos: Vec3, R: number, cliffAng: number, stopOnCliff: boolean, stepHeight: number, hitPos: Vec3, hitDeep: Vec3): int;
    /**
     * 与本地空间的一个球相撞，给角色控制器用的。因此只要一个等效的碰撞点和碰撞法线就行
     * @param pos
     * @param R
     * @param blockAng  多大角度会阻挡前进，按照与地面的夹角算。单位是弧度
     * @param stepHeight  开跨越多高的障碍
     * @param hitPos
     * @param hitNorm
     */
    hitSphere1(pos: Vec3, R: number, blockAng: number, stepHeight: number, hitPos: Vec3, hitNorm: Vec3): boolean;
    /**
     * Sets the height values from an image. Currently only supported in browser.
     * @param
     * @param scale 地形的大小,z是高度。以后改成y是高度 TODO yz
     */
    setHeightsFromImage(image: HTMLImageElement, scale: Vec3): ImageData | undefined;
}

/**
 * Particle shape.
 * @author schteppe
 */
class Particle extends Shape {
    constructor();
    calculateLocalInertia(mass: number, target?: Vec3): Vec3;
    volume(): number;
    updateBndSphR(): void;
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void;
    onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void;
}

/**
 * Spherical shape
 * @class Sphere
 * @constructor
 * @extends Shape
 * @param {Number} radius The radius of the sphere, a non-negative number.
 * @author schteppe / http://github.com/schteppe
 */
class Sphere extends Shape implements MinkowskiShape {
    onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void;
    radius: number;
    oriRadius: number;
    minkowski: this;
    constructor(radius: number);
    getSupportVertex(dir: Vec3, sup: Vec3): Vec3;
    getSupportVertexWithoutMargin(dir: Vec3, sup: Vec3): Vec3;
    calculateLocalInertia(mass: number, target?: Vec3): Vec3;
    volume(): number;
    updateBndSphR(): void;
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void;
    /** 只取最大的 */
    setScale(x: number, y: number, z: number, recalcMassProp?: boolean): void;
    /**
     *
     * @param pos1
     * @param other
     * @param pos2
     * @param hitpos 	自己身上的全局碰撞点
     * @param hitnorm 	把自己推开的方向，即对方的法线
     * @param otherhitpos 对方的全局碰撞点
     * @return 返回碰撞深度，<0表示没有碰撞
     */
    static SpherehitSphere(r1: f32, pos1: Vec3, r2: f32, pos2: Vec3, hitpos: Vec3 | null, hitnorm: Vec3 | null, otherhitpos: Vec3 | null, justtest: boolean): f32;
    /**
     * sphere和box的碰撞检测
     * @param myPos
     * @param boxHalf
     * @param boxPos
     * @param boxQuat
     * @param hitPos 	球的碰撞点
     * @param hitpos1 	box的 碰撞点
     * @param hitNormal 把球推开的方向，即box的法线
     * @param justtest
     *
     * TODO 可以考虑用点到面的距离来实现，可能会简单一些
     * d:number[6]=signeddist(faces,P)
     * 外部距离:
     * 	+d:number[] = d 中>0的
     * dist = ||+d||  // 最多是三个平方和的开方
     * 内部距离：
     * 	最大的一个，或者abs后最小的一个
     */
    static hitBox(myPos: Vec3, R: number, boxHalf: Vec3, boxPos: Vec3, boxQuat: Quaternion, hitPos: Vec3, hitpos1: Vec3, hitNormal: Vec3, justtest: boolean): f32;
    /**
     * 把 hitpoints 中的碰撞点和法线转换到世界空间
     * @param hitpoints 碰撞点数组
     * @param voxPos 	vox的位置
     * @param voxQuat 	vox的旋转
     * @param scale   voxel 的缩放
     */
    private _voxHitInfoToWorld;
    /**
     * 球和voxel的碰撞检测
     * 球主要检测6个方向是否正面碰撞，非正面碰撞的，每个格子元素用球模拟
     * @param myPos
     * @param voxel
     * @param voxPos
     * @param voxQuat
     * @param hitpoints
     * @param justtest
     *
     * TODO 只与表面的vox检测就行，表面的满足了，内部的一定满足
     */
    hitVoxel(myPos: Vec3, voxel: Voxel, voxPos: Vec3, voxQuat: Quaternion, hitpoints: HitPointInfoArray, justtest: boolean): boolean;
}

/**
 * @class OctreeNode
 * @param {object} [options]
 * @param {Octree} [options.root]
 * @param {AABB} [options.aabb]
 */
class OctreeNode<T> {
    /**
     * The root node
     */
    root: OctreeNode<T>;
    /**
     * Boundary of this node
     */
    aabb: AABB;
    /**
     * Contained data at the current node level.
     */
    data: T[];
    maxDepth: f32;
    /**
     * Children to this node
     */
    children: OctreeNode<T>[];
    constructor(root: OctreeNode<T> | null, aabb?: AABB);
    reset(aabb?: AABB, options?: any): void;
    /**
     * Insert data into this node
     */
    insert(aabb: AABB, elementData: T, level?: number): boolean;
    /**
     * Create 8 equally sized children nodes and put them in the .children array.
     */
    subdivide(): void;
    /**
     * Get all data, potentially within an AABB
     * @return  The "result" object
     */
    aabbQuery(aabb: AABB, result: number[]): number[];
    /**
     * Get all data, potentially intersected by a ray.
     */
    rayQuery(ray: Ray, treeTransform: Transform, result: number[]): number[];
    /**
     * @method removeEmptyNodes
     */
    removeEmptyNodes(): void;
}
/**
 * @class Octree
 * @param {AABB} aabb The total AABB of the tree
 * @param {object} [options]
 * @param {number} [options.maxDepth=8]
 * @extends OctreeNode
 */
class Octree<T> extends OctreeNode<T> {
    maxDepth: number;
    constructor(aabb?: AABB, maxDepth?: i32);
}

/**
 * @class Trimesh
 * @constructor
 * @param {array} vertices
 * @param {array} indices
 * @extends Shape
 * @example
 *     // How to make a mesh with a single triangle
 *     var vertices = [
 *         0, 0, 0, // vertex 0
 *         1, 0, 0, // vertex 1
 *         0, 1, 0  // vertex 2
 *     ];
 *     var indices = [
 *         0, 1, 2  // triangle 0
 *     ];
 *     var trimeshShape = new Trimesh(vertices, indices);
 */
class Trimesh extends Shape {
    onPreNarrowpase(stepId: number, pos: Vec3, quat: Quaternion): void;
    vertices: Float32Array;
    /**
     * Array of integers, indicating which vertices each triangle consists of. The length of this array is thus 3 times the number of triangles.
     */
    indices: Int16Array;
    /**
     * The normals data.
     */
    normals: Float32Array;
    /**
     * The local AABB of the mesh.
     */
    aabb: AABB;
    /**
     * References to vertex pairs, making up all unique edges in the trimesh.
     */
    edges: Int16Array;
    /**
     * Local scaling of the mesh. Use .setScale() to set it.
     */
    scale: Vec3;
    /**
     * The indexed triangles. Use .updateTree() to update it.
     */
    tree: Octree<number>;
    constructor(vertices: number[], indices: number[]);
    /**
     * @method updateTree
     */
    updateTree(): void;
    /**
     * Get triangles in a local AABB from the trimesh.
     * @param  result An array of integers, referencing the queried triangles.
     */
    getTrianglesInAABB(aabb: AABB, result: number[]): number[];
    setScale(x: number, y: number, z: number): void;
    /**
     * Compute the normals of the faces. Will save in the .normals array.
     * @method updateNormals
     */
    updateNormals(): void;
    /**
     * Update the .edges property
     */
    updateEdges(): void;
    /**
     * Get an edge vertex
     * @method getEdgeVertex
     * @param   edgeIndex
     * @param   firstOrSecond 0 or 1, depending on which one of the vertices you need.
     * @param   vertexStore Where to store the result
     */
    getEdgeVertex(edgeIndex: number, firstOrSecond: number, vertexStore: Vec3): void;
    /**
     * Get a vector along an edge.
     */
    getEdgeVector(edgeIndex: number, vectorStore: Vec3): void;
    /**
     * Get vertex i.
     */
    getVertex(i: number, out: Vec3): Vec3;
    /**
     * Get raw vertex i
     */
    private _getUnscaledVertex;
    /**
     * Get a vertex from the trimesh,transformed by the given position and quaternion.
     */
    getWorldVertex(i: number, pos: Vec3, quat: Quaternion, out: Vec3): Vec3;
    /**
     * Get the three vertices for triangle i.
     */
    getTriangleVertices(i: number, a: Vec3, b: Vec3, c: Vec3): void;
    /**
     * Compute the normal of triangle i.
     */
    getNormal(i: number, target: Vec3): Vec3;
    calculateLocalInertia(mass: number, target: Vec3): Vec3;
    /**
     * Compute the local AABB for the trimesh
     */
    computeLocalAABB(aabb: AABB): void;
    /**
     * Update the .aabb property
     * @method updateAABB
     */
    updateAABB(): void;
    /**
     * Will update the .boundingSphereRadius property
     * @method updateBndSphR
     */
    updateBndSphR(): void;
    /**
     * @method calculateWorldAABB
     * @param {Vec3}        pos
     * @param {Quaternion}  quat
     * @param {Vec3}        min
     * @param {Vec3}        max
     */
    calculateWorldAABB(pos: Vec3, quat: Quaternion, min: Vec3, max: Vec3): void;
    /**
     * Get approximate volume
     */
    volume(): number;
    /**
     * Get face normal given 3 vertices
     */
    static computeNormal(va: Vec3, vb: Vec3, vc: Vec3, target: Vec3): void;
    /**
     * Create a Trimesh instance, shaped as a torus.
     */
    static createTorus(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, arc?: number): Trimesh;
}

/**
 * Helper class for the World. Generates ContactEquations.
 * @class Narrowphase
 * @constructor
 * @todo Sphere-ConvexPolyhedron contacts
 * @todo Contact reduction
 * @todo  should move methods to prototype
 */
class Narrowphase {
    /**
     * Internal storage of pooled contact points.
     */
    private contactPointPool;
    private frictionEquationPool;
    private v3pool;
    world: World;
    /**
     * 碰撞结果保存为 ContactEquation
     */
    result: ContactEquation[];
    frictionResult: FrictionEquation[];
    /** 当前使用的材质 */
    private currentContactMaterial;
    /**
     * @property {Boolean} enableFrictionReduction
     */
    enableFrictionReduction: boolean;
    private curm1;
    private curm2;
    constructor(world: World);
    test_setContactMtl(mtl: ContactMaterial): void;
    /**
     * Make a contact object, by using the internal pool or creating a new one.
     */
    createContactEquation(bi: Body, bj: Body, si: Shape, sj: Shape, overrideShapeA: Shape | null, overrideShapeB: Shape | null): ContactEquation;
    enableFriction(b: boolean): void;
    /**
     * 根据contact创建摩擦约束。每个contact会创建两个摩擦约束，在tangent的两个方向
     * @param contactEq
     * @param outArray
     */
    createFrictionEquationsFromContact(contactEq: ContactEquation, outArray: FrictionEquation[]): boolean | undefined;
    createFrictionFromAverage(numContacts: number): void;
    /**
     * 不同版本的摩擦力和弹力的计算方法
     */
    /**
     * v0
     * 	摩擦力=(a+b)/2
     *  弹力 = a*b
     * @param mi
     * @param mj
     * @param mo
     */
    private contactMtlAlg_v0;
    private _getContactMtl;
    /**
     * 判断两个对象是否会相撞
     * @param b1
     * @param b2
     * @param world
     */
    hitTest(bi: Body, bj: Body): boolean;
    /**
     * Generate all contacts between a list of body pairs
     * @param  p1 Array of body indices
     * @param  p2 Array of body indices
     * @param  world
     * @param  result Array to store generated contacts
     * @param  oldcontacts Optional. Array of reusable contact objects
     */
    getContacts(p1: Body[], p2: Body[], world: World, result: ContactEquation[], oldcontacts: ContactEquation[], frictionResult: FrictionEquation[], frictionPool: FrictionEquation[]): void;
    boxBox(si: Box, sj: Box, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    boxConvex(si: Box, sj: ConvexPolyhedron, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    boxParticle(si: Box, sj: Particle, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    sphereSphere(si: Sphere, sj: Sphere, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape | null, rsj: Shape | null, justTest: boolean): boolean;
    planeTrimesh(planeShape: Plane, trimeshShape: Trimesh, planePos: Vec3, trimeshPos: Vec3, planeQuat: Quaternion, trimeshQuat: Quaternion, planeBody: Body, trimeshBody: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    /**
     * 球与mesh的碰撞
     * @param sphereShape
     * @param trimeshShape
     * @param spherePos
     * @param trimeshPos
     * @param sphereQuat
     * @param trimeshQuat
     * @param sphereBody
     * @param trimeshBody
     * @param rsi
     * @param rsj
     * @param justTest
     */
    sphereTrimesh(sphereShape: Sphere, trimeshShape: Trimesh, spherePos: Vec3, trimeshPos: Vec3, sphereQuat: Quaternion, trimeshQuat: Quaternion, sphereBody: Body, trimeshBody: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    private static nor1;
    spherePlane(sphere: Sphere, plane: Plane, sphPos: Vec3, planePos: Vec3, qi: Quaternion, planeQ: Quaternion, sphBody: Body, planeBody: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    bigSphereBox(si: Sphere, sj: Box, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    gjk(si: Shape, sj: Shape, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape | null, rsj: Shape | null, justTest: boolean): boolean;
    sphereBox(si: Sphere, sj: Box, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    sphereConvex(si: Sphere, sj: ConvexPolyhedron, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    sphereVoxel(sphere: Sphere, voxel: Voxel, pos1: Vec3, pos2: Vec3, q1: Quaternion, q2: Quaternion, body1: Body, body2: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    CapsuleCapsule(cap1: Capsule, cap2: Capsule, pos1: Vec3, pos2: Vec3, q1: Quaternion, q2: Quaternion, body1: Body, body2: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    sphereCapsule(sphere: Sphere, capsule: Capsule, sphPos: Vec3, capPos: Vec3, sphQ: Quaternion, capQ: Quaternion, sphBody: Body, capBody: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    planeCapsule(plane: Plane, capsule: Capsule, planePos: Vec3, capPos: Vec3, planeQ: Quaternion, capQ: Quaternion, planeBody: Body, capBody: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    static trans1: Transform;
    static trans2: Transform;
    boxCapsule(box: Box, capsule: Capsule, boxPos: Vec3, capPos: Vec3, boxQ: Quaternion, capQ: Quaternion, boxBody: Body, capBody: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    boxVoxel(box: Box, voxel: Voxel, pos1: Vec3, pos2: Vec3, q1: Quaternion, q2: Quaternion, body1: Body, body2: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    planeBox(si: Plane, sj: Box, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    planeConvex(planeShape: Plane, convexShape: ConvexPolyhedron, planePosition: Vec3, convexPosition: Vec3, planeQuat: Quaternion, convexQuat: Quaternion, planeBody: Body, convexBody: Body, si: Shape, sj: Shape, justTest: boolean): boolean;
    convexConvex(si: ConvexPolyhedron, sj: ConvexPolyhedron, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape | null, rsj: Shape | null, justTest: boolean, faceListA?: number[] | null, faceListB?: number[] | null): boolean;
    planeParticle(sj: Plane, si: Particle, xj: Vec3, xi: Vec3, qj: Quaternion, qi: Quaternion, bj: Body, bi: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    sphereParticle(sj: Sphere, si: Particle, xj: Vec3, xi: Vec3, qj: Quaternion, qi: Quaternion, bj: Body, bi: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    convexParticle(sj: ConvexPolyhedron, si: Particle, xj: Vec3, xi: Vec3, qj: Quaternion, qi: Quaternion, bj: Body, bi: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    convexHeightfield(convexShape: ConvexPolyhedron, hfShape: Heightfield, convexPos: Vec3, hfPos: Vec3, convexQuat: Quaternion, hfQuat: Quaternion, convexBody: Body, hfBody: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    boxHeightfield(si: Box, sj: Heightfield, xi: Vec3, xj: Vec3, qi: Quaternion, qj: Quaternion, bi: Body, bj: Body, rsi: Shape, rsj: Shape, justTest: boolean): boolean;
    sphereHeightfield(sphereShape: Sphere, hfShape: Heightfield, spherePos: Vec3, hfPos: Vec3, sphereQuat: Quaternion, hfQuat: Quaternion, sphereBody: Body, hfBody: Body, rsi: Shape | null, rsj: Shape | null, justTest: boolean): boolean;
}

class PhyEvent {
    type: string;
    constructor(name: string);
}
class AddBodyEvent extends PhyEvent {
    body: Body | null;
    constructor(body: Body | null);
}
class RemoveBodyEvent extends PhyEvent {
    body: Body | null;
    constructor(body: Body | null);
}
abstract class IPhyRender {
    abstract stepStart(): void;
    abstract stepEnd(): void;
    abstract internalStep(): void;
    abstract addSeg(stx: f32, sty: f32, stz: f32, dirx: f32, diry: f32, dirz: f32, color: i32): void;
    abstract addPoint(px: f32, py: f32, pz: f32, color: i32): void;
    abstract addVec(stx: number, sty: number, stz: number, dirx: number, diry: number, dirz: number, color: number): void;
    abstract addVec1(st: Vec3, dir: Vec3, scale: number, color: number): void;
    abstract addPersistPoint(x: number | Vec3, y?: number, z?: number, name?: string): number;
    abstract delPersistPoint(id: i32): void;
    abstract addPersistVec(dx: number | Vec3, dy: number | Vec3, dz?: number, x?: number, y?: number, z?: number, name?: string): number;
    abstract delPersistVec(id: i32): void;
    abstract clearPersist(): void;
    abstract addPoint1(p: Vec3, color: number): void;
    abstract drawLine(pts: Vec3[], color: number): void;
    abstract drawLine1(pts: Vec3[], h: Vec3, color: number): void;
    abstract addAABB(min: Vec3, max: Vec3, color: number): void;
}
/**
 * The physics world
 */
class World extends EventTarget {
    /**
     * Currently / last used timestep. Is set to -1 if not available. This value is updated before each internal step, which means that it is "fresh" inside event callbacks.
     */
    dt: number;
    /**
     * Makes bodies go to sleep when they've been inactive
     */
    allowSleep: boolean;
    /**
     * All the current contacts (instances of ContactEquation) in the world.
     */
    contacts: ContactEquation[];
    frictionEquations: FrictionEquation[];
    /**
     * How often to normalize quaternions. Set to 0 for every step, 1 for every second etc.. A larger value increases performance. If bodies tend to explode, set to a smaller value (zero to be sure nothing can go wrong).
     */
    quatNormalizeSkip: i32;
    /**
     * Set to true to use fast quaternion normalization. It is often enough accurate to use. If bodies tend to explode, set to false.
     * @see Quaternion.normalizeFast
     * @see Quaternion.normalize
     */
    quatNormalizeFast: boolean;
    /**
     * The wall-clock time since simulation start
     * 物理系统累计时间
     */
    time: f32;
    /**
     * Number of timesteps taken since start
     */
    stepnumber: f32;
    /** step 实际经历的时间，因为可能有多个internalstep */
    stepTime: number;
    default_dt: f32;
    nextId: i32;
    gravity: Vec3;
    /**
     * The broadphase algorithm to use. Default is NaiveBroadphase
     */
    _broadphase: Broadphase;
    get broadphase(): Broadphase;
    set broadphase(b: Broadphase);
    /**
     * @property bodies
     */
    bodies: Body[];
    /** 处于激活状态的body。例如回调就是基于这个的 */
    activeBodis: Body[];
    /**
     * The solver algorithm to use. Default is GSSolver
     */
    solver: Solver;
    constraints: Constraint[];
    narrowphase: Narrowphase;
    /** 当前帧的collisionMatrix */
    /**
     * CollisionMatrix from the previous step.
     * 上一帧的collisionMatrix
     */
    /**
     * All added materials
     */
    materials: Material[];
    /**
     * 接触材质，发生碰撞后，根据a，b的材质，到这里找对应的接触材质
     */
    contactmaterials: ContactMaterial[];
    /**
     * Used to look up a ContactMaterial given two instances of Material.
     */
    contactMaterialTable: TupleDictionary<ContactMaterial>;
    defaultMaterial: Material;
    tempMaterial: ContactMaterial;
    /**
     * This contact material is used if no suitable contactmaterial is found for a contact.
     * 缺省材质
     */
    defaultContactMaterial: ContactMaterial;
    doProfiling: boolean;
    private profile;
    /**
     * Time accumulator for interpolation. See http://gafferongames.com/game-physics/fix-your-timestep/
     */
    accumulator: f32;
    subsystems: {
        update: () => void;
    }[];
    /**
     * Dispatched after a body has been added to the world.
     */
    addBodyEvent: AddBodyEvent;
    /**
     * Dispatched after a body has been removed from the world.
     * @param  body The body that has been removed from the world.
     */
    removeBodyEvent: RemoveBodyEvent;
    private idToBodyMap;
    _phyRender: PhyRender;
    /**
     * 没有动态的，则不计算。只要有一次加过动态的，就算
     */
    _noDynamic: boolean;
    private _pause;
    constructor(options?: any);
    set phyRender(r: IPhyRender);
    get phyRender(): IPhyRender;
    enableFriction(b: boolean): void;
    /**
     * 接触事件
     */
    /**
     * Sets all body forces in the world to zero.
     */
    clearForces(): void;
    /**
     * Get the contact material between materials m1 and m2
     * @return The contact material if it was found.
     */
    getContactMaterial(m1: Material, m2: Material): ContactMaterial;
    /**
     * Get number of objects in the world.
     * @deprecated
     */
    numObjects(): number;
    /**
     * Add a rigid body to the simulation.
     * @todo If the simulation has not yet started, why recrete and copy arrays for each body? Accumulate in dynamic arrays in this case.
     * @todo Adding an array of bodies should be possible. This would save some loops too
     * @deprecated Use .addBody instead
     */
    addBody(body: Body): void;
    /**
     * Add a constraint to the simulation.
     */
    addConstraint(c: Constraint): void;
    /**
     * Removes a constraint
     */
    removeConstraint(c: Constraint): void;
    /**
     * Raycast test
     * @deprecated Use .raycastAll, .raycastClosest or .raycastAny instead.
     */
    rayTest(from: Vec3, to: Vec3, result: RaycastResult): void;
    /**
     * Ray cast against all bodies. The provided callback will be executed for each hit with a RaycastResult as single argument.
     * @method raycastAll
     * @param  {Object} options
     * @param  {number} [options.collisionFilterMask=-1]
     * @param  {number} [options.collisionFilterGroup=-1]
     * @param  {boolean} [options.skipBackfaces=false]
     * @param  {boolean} [options.checkCollisionResponse=true]
     * @param  {Function} callback
     * @return  True if any body was hit.
     */
    raycastAll(from: Vec3, to: Vec3, options: any, callback: (result: RaycastResult) => void): boolean;
    /**
     * Ray cast, and stop at the first result. Note that the order is random - but the method is fast.
     * @method raycastAny
     * @param  {Vec3} from
     * @param  {Vec3} to
     * @param  {Object} options
     * @param  {number} [options.collisionFilterMask=-1]
     * @param  {number} [options.collisionFilterGroup=-1]
     * @param  {boolean} [options.skipBackfaces=false]
     * @param  {boolean} [options.checkCollisionResponse=true]
     * @param  {RaycastResult} result
     * @return {boolean} True if any body was hit.
     */
    raycastAny(from: Vec3, to: Vec3, options: any, result: RaycastResult): boolean;
    /**
     * Ray cast, and return information of the closest hit.
     * @method raycastClosest
     * @param  {Vec3} from
     * @param  {Vec3} to
     * @param  {Object} options
     * @param  {number} [options.collisionFilterMask=-1]
     * @param  {number} [options.collisionFilterGroup=-1]
     * @param  {boolean} [options.skipBackfaces=false]
     * @param  {boolean} [options.checkCollisionResponse=true]
     * @param  {RaycastResult} result
     * @return  True if any body was hit.
     */
    raycastClosest(from: Vec3, to: Vec3, options: any, result: RaycastResult): boolean;
    /**
     * Remove a rigid body from the simulation.
     * @method remove
     * @param {Body} body
     * @deprecated Use .removeBody instead
     */
    remove(body: Body): void;
    /**
     * Remove a rigid body from the simulation.
     */
    getBodyById(id: number): Body;
    getShapeById(id: i32): Shape | null;
    /**
     * Adds a material to the World.
     * @todo Necessary?
     */
    addMaterial(m: Material): void;
    /**
     * Adds a contact material to the World
     * @method addContactMaterial
     * @param  cmat
     */
    addContactMaterial(cmat: ContactMaterial): World;
    /**
     * Step the physics world forward in time.
     *
     * There are two modes. The simple mode is fixed timestepping without interpolation. In this case you only use the first argument.
     * The second case uses interpolation. In that you also provide the time since the function was last used, as well as the maximum fixed timesteps to take.
     *
     * @param dt                       The fixed time step size to use. 单位是秒
     * @param [timeSinceLastCalled]    The time elapsed since the function was last called. 如果为0则直接使用dt来计算，表示固定时间间隔
     * @param [maxSubSteps=10]         Maximum number of fixed steps to take per function call. 最大插值次数
     *
     * @example
     *     // fixed timestepping without interpolation
     *     world.step(1/60);
     */
    step(dt: number, timeSinceLastCalled?: number, maxSubSteps?: number): void;
    internalStep(dt: number): void;
    pause(b?: boolean): void;
}

export function setPhyRender(r:IPhyRender):void;
export function getPhyRender():IPhyRender;


/**
 * 在Body身上记录grid相关的信息。
 */
class GridInfo {
    body: Body;
    /**
     * 这个是记录自己的所占用的所有的格子
     * 用于清理。由于边界会调整，所以用格子对象而不是id
     * 而是指向包含自己的列表
    */
    grids: GridInfo[][] | null;
    sys: GridBroadphase;
    /** 在活动列表的位置，用于快速移除,-1表示不在活动列表中 */
    activeid: number;
    private sleepListener;
    private awakeListener;
    constructor(body: Body, sys: GridBroadphase);
    onSleepEvent(): void;
    onWakeupEvent(): void;
    /** 注意这个会调用很多次 */
    onNeedUpdate(): void;
}
/**
 * 基于格子的宽阶段碰撞检测。
 * 分成静止和动态两个格子，动态的每次都清理，不过为了供射线检测等其他随时使用的地方，需要每帧间有效
 * 静态的一直保存，一旦active就要从静态格子删除
 *
 * 在集中处理动态对象之后，每次对某个动态对象的修改都会导致更新当前对象的格子，以保证结果正确
 *
 * 注意 超出范围的会被忽略
 *
 * 总格子数不用太大
 *
 * 流程
 * 	world.update
 * 		// 把动态对象分到格子中	：当前格子存的上一帧
 * 			不要了，用上一帧的 @1
 * 			clear动态
 * 		solve
 * 		计算新的位置			：希望当前存的是当前帧的
 * 			更新动态对象的格子		@1
 * 		applyPose to Render
 *
 * 	其他对象的update
 * 		逻辑，例如射线检测
 */
class GridBroadphase extends Broadphase {
    static MaxValue: number;
    static MinValue: number;
    static bigBodySize: number;
    objnum: number;
    /** 格子大小 */
    gridsz: number;
    min: Vec3;
    max: Vec3;
    objsMin: Vec3;
    objsMax: Vec3;
    nx: number;
    ny: number;
    nz: number;
    /** 新加入的都作为uninitedbody，一旦更新一次以后，就从这里删掉了 */
    uninitedBodies: Body[];
    /** 活动对象。因为活动对象是每次都重新计算所在格子，所以需要单独记录 */
    activeBodies: GridInfo[];
    /** 静态对象或者sleep的对象占的格子 */
    private staticGrid;
    /** 动态对象占的格子 */
    private dynaGrid;
    /** 不归格子管理的模型，例如超大模型，距离太远的模型。这些模型放到格子中占用的格子太多，或者导致空间太大，所以单独处理 */
    private otherBodies;
    /** 有活动对象的格子 */
    private addBodyListener;
    private removeBodyListener;
    constructor(nx?: i32, ny?: i32, nz?: i32);
    onAddBody(e: AddBodyEvent): void;
    onRemoveBody(e: RemoveBodyEvent): void;
    /**
     * 有的body刚加进来，还没有分配是动态的还是静态的
     */
    private handle_uninitedBody;
    onBodySleep(b: GridInfo): void;
    /** body状态改变，从静态列表中删除 */
    onBodyWakeup(b: GridInfo): void;
    onBodyMoved(b: GridInfo): void;
    private removeFromActiveBody;
    /**
     * 直接加到静态格子中，如果之前是动态的要处理一下
     * @param b
     */
    private addToStatic;
    /**
     * 超出世界格子范围了。这个暂时放到其他中用暴力检测
     * @param b
     */
    private outofWorldAABB;
    /**
     * 添加到动态列表中
     * @param b
     */
    private addToDynamic;
    private removeFromOtherBodies;
    /** 更新过程中发现需要调整边界了 */
    private resetBBX;
    private autoCalcGridsz;
    setWorld(world: World): void;
    private updateWorldBBX;
    /**
     *  开始用暴力方法
     *  满足一定条件之后放到格子中
     * 	满足一定条件后修改格子的宽度
     *  包围盒变化太大的情况下修改包围盒的大小
     */
    hasRayQuery(): boolean;
    rayIntersectGrids(ray: Ray, grids: GridInfo[], rundataStack: BodyRunDataStack, checkid: int): boolean;
    /**
     * 不能单独调用。只允许Ray调用。这里没有对ray执行reset
     * @param world
     * @param ray
     */
    rayIntersect(ray: Ray, rundatastack: BodyRunDataStack, checkid: int): boolean;
    aabbQuery(world: World, aabb: AABB, result: Body[]): Body[];
    sphereQuery(world: World, pos: Vec3, radius: number, result?: Body[]): Body[];
    /**
     * 动态格子内部的互相检测
     * @param grid
     * @param pairs1
     * @param pairs2
     */
    private collisionInGrid;
    /**
     * 动态格子中的每个对象与静态格子中的每个对象检测
     * @param dynaGrid
     * @param stGrid
     * @param pairs1
     * @param pairs2
     */
    private dynaGridCollisionWithStaticGrid;
    /**
     *
     */
    collisionPairs(world: World, pairs1: Body[], pairs2: Body[]): void;
    renderGrid(render: PhyRender): void;
    printDbgInfo(): void;
}

interface BodyInitOptions {
    position?: Vec3;
    velocity?: Vec3;
    angularVelocity?: Vec3;
    quaternion?: Quaternion;
    material?: Material;
    type?: number;
    linearDamping?: number;
    angularDamping?: number;
    allowSleep?: boolean;
    sleepSpeedLimit?: number;
    sleepTimeLimit?: number;
    collisionFilterGroup?: number;
    collisionFilterMask?: number;
    fixedRotation?: boolean;
    linearFactor?: Vec3;
    angularFactor?: Vec3;
}
const enum BODYTYPE {
    /**
     * A dynamic body is fully simulated. Can be moved manually by the user, but normally they move according to forces.
     * A dynamic body can collide with all body types. A dynamic body always has finite, non-zero mass.
     */
    DYNAMIC = 1,
    /**
     * A static body does not move during simulation and behaves as if it has infinite mass.
     * Static bodies can be moved manually by setting the position of the body. The velocity of a static body is always zero.
     * Static bodies do not collide with other static or kinematic bodies.
     * 静态对象不记录碰撞信息
     * 不计算转动惯量
     */
    STATIC = 2,
    /**
     * A kinematic body moves under simulation according to its velocity. They do not respond to forces.
     * They can be moved manually, but normally a kinematic body is moved by setting its velocity.
     * A kinematic body behaves as if it has infinite mass. Kinematic bodies do not collide with other static or kinematic bodies.
     * 能记录碰撞信息。无物理运动（会自己根据位置计算速度）
     */
    KINEMATIC = 4,
    /**
     * 触发器，任何类型的对象与触发器都只进行碰撞检测
     * TODO 以后改成bit位表示？
     * trigger对象也不是动态对象，不计算转动惯量，因此不会物理运动。能记录碰撞信息，
     * 如果需要能物理运动且只是触发的，用动态对象去掉物理响应来做
     */
    TRIGGER = 8
}
const enum BODY_SLEEP_STATE {
    AWAKE = 0,
    SLEEPY = 1,
    SLEEPING = 2
}
/**
 * Base class for all body types.
 * @example
 *     var body = new Body({
 *         mass: 1
 *     });
 *     var shape = new Sphere(1);
 *     body.addShape(shape);
 *     world.addBody(body);
 */
class Body extends EventTarget {
    /**
     * Dispatched after two bodies collide. This event is dispatched on each
     * of the two bodies involved in the collision.
     */
    static EVENT_COLLIDE_ENTER: string;
    static EVENT_COLLIDE_EXIT: string;
    static idCounter: number;
    /**
     * Dispatched after a sleeping body has woken up.
     */
    static wakeupEvent: {
        type: string;
    };
    /**
     * Dispatched after a body has gone in to the sleepy state.
     */
    static sleepyEvent: {
        type: string;
    };
    /**
     * Dispatched after a body has fallen asleep.
     */
    static sleepEvent: {
        type: string;
    };
    id: number;
    index: number;
    name: string;
    enable: boolean;
    /** 是否允许射线检测。 TODO 用collisionResponse*/
    enableRayTest: boolean;
    world: World | null;
    /**
     * integrate之前调用
     * 这时候已经完成碰撞处理了
     * integrate包含更新速度和位置
     */
    preIntegrate: (b: Body) => void | undefined;
    /**
     * integrate之后调用
     */
    postIntegrate: (b: Body) => void | undefined;
    /** 每次resolve计算的v增量 */
    vlambda: Vec3;
    collisionFilterGroup: number;
    collisionFilterMask: number;
    /**
     * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled.
     */
    collisionResponse: boolean;
    /**
     * World space position of the body.
     */
    position: Vec3;
    previousPosition: Vec3;
    /**
     * Interpolated position of the body.
     * 在上次位置和这次位置之间的插值的值,还不知道有什么用
     */
    interpolatedPosition: Vec3;
    /**
     * Initial position of the body
     */
    initPosition: Vec3;
    /**
     * World space velocity of the body.
     */
    velocity: Vec3;
    initVelocity: Vec3;
    /**
     * Linear force on the body in world space.
     */
    force: Vec3;
    _mass: f32;
    invMass: f32;
    material: Material | null;
    /** 线速度衰减系数，0到1 */
    private _linearDamping;
    ldampPow: number;
    get linearDamping(): number;
    set linearDamping(v: number);
    type: BODYTYPE;
    /**
     * If true, the body will automatically fall to sleep.
     */
    allowSleep: boolean;
    /**
     * Current sleep state.
     */
    sleepState: BODY_SLEEP_STATE;
    /**
     * If the speed (the norm of the velocity) is smaller than this value, the body is considered sleepy.
     */
    sleepSpeedLimit: number;
    /**
     * If the body has been sleepy for this sleepTimeLimit seconds, it is considered sleeping.
     */
    sleepTimeLimit: number;
    timeLastSleepy: number;
    /** 由于碰撞后满足wakeup条件，需要wakeup了。 一次性的 */
    _wakeUpAfterNarrowphase: boolean;
    /**
     * World space rotational force on the body, around center of mass.
     */
    torque: Vec3;
    /**
     * World space orientation of the body.
     */
    quaternion: Quaternion;
    previousQuaternion: Quaternion;
    /**
     * Interpolated orientation of the body.
     */
    interpolatedQuaternion: Quaternion;
    private _scale;
    /**
     * Angular velocity of the body, in world space. Think of the angular velocity as a vector, which the body rotates around. The length of this vector determines how fast (in radians per second) the body rotates.
     */
    angularVelocity: Vec3;
    initAngularVelocity: Vec3;
    shapes: Shape[];
    /**
     * Position of each Shape in the body, given in local Body space.
     */
    shapeOffsets: (Vec3 | null)[];
    /**
     * Orientation of each Shape, given in local Body space.
     */
    shapeOrientations: (Quaternion | null)[];
    inertia: Vec3;
    invInertia: Vec3;
    invInertiaWorld: Mat3;
    invMassSolve: number;
    invInertiaSolve: Vec3;
    invInertiaWorldSolve: Mat3;
    /**
     * Set to true if you don't want the body to rotate. Make sure to run .updateMassProperties() after changing this.
     */
    fixedRotation: boolean;
    private _angularDamping;
    adampPow: number;
    set angularDamping(v: number);
    get angularDamping(): number;
    /**
     * Use this property to limit the motion along any world axis. (1,1,1) will allow motion along all axes while (0,0,0) allows none.
     * 1,1,1可以理解，就是一切按照物理来，0,0,0可以理解，就是关掉受力，其他的无法理解，建议不要用。
     */
    linearFactor: Vec3;
    /**
     * Use this property to limit the rotational motion along any world axis. (1,1,1) will allow rotation along all axes while (0,0,0) allows none.
     */
    angularFactor: Vec3;
    /**
     * World space bounding box of the body and its shapes.
     */
    aabb: AABB;
    private _aabbNeedsUpdate;
    /**
     * Total bounding radius of the Body including its shapes, relative to body.position.
     */
    boundingRadius: number;
    /** 每次resolve计算的w增量 */
    wlambda: Vec3;
    /** 如果是kinematic对象，用速度控制还是用位置控制。 */
    kinematicUsePos: boolean;
    userData: any;
    contact: ContactInfoMgr | null;
    /** 每个刚体自定义的重力，设置以后，不再受到全局重力影响 */
    bodyGravity: Vec3 | null;
    /** 控制是否显示包围盒 */
    dbgShow: boolean;
    /** 格子管理相关信息。以后拿出去 */
    gridinfo: GridInfo | null;
    /** 运行时数据，不可持久保存，可以优化一些算法，例如重复检测判断 */
    runData: any;
    ccdSpeedThreshold: number;
    constructor(mass?: number, shape?: Shape | null, pos?: Vec3 | null, options?: BodyInitOptions);
    set mass(v: f32);
    get mass(): f32;
    setPos(x: number, y: number, z: number): void;
    set aabbNeedsUpdate(b: boolean);
    get aabbNeedsUpdate(): boolean;
    setScale(x: number, y: number, z: number): void;
    /**
     * Wake the body up.
     * @method wakeUp
     */
    wakeUp(): void;
    /**
     * Force body sleep
     * @method sleep
     */
    sleep(): void;
    isSleep(): boolean;
    /**
     * Called every timestep to update internal sleep timer and change sleep state if needed.
     * @param time The world time in seconds
     */
    sleepTick(time: number): void;
    /**
     * If the body is sleeping, it should be immovable / have infinite mass during solve. We solve it by having a separate "solve mass".
     * @TODO 问题：sleeping状态下，如果要solve，则必然会被唤醒，所以感觉这里有问题
     */
    updateSolveMassProperties(): void;
    /**
     * Convert a world point to local body frame.
     */
    pointToLocalFrame(worldPoint: Vec3, result?: Vec3): Vec3;
    /**
     * Convert a world vector to local body frame.
     */
    vectorToLocalFrame(worldVector: Vec3, result?: Vec3): Vec3;
    /**
     * Convert a local body point to world frame.
     */
    pointToWorldFrame(localPoint: Vec3, result?: Vec3): Vec3;
    /**
     * Convert a local body point to world frame.
     */
    vectorToWorldFrame(localVector: Vec3, result: Vec3): Vec3;
    /**
     * Add a shape to the body with a local offset and orientation.
     * 注意，这个shape目前不要共享，因为1. 如果有缩放，这个shape会被修改，2.。。
     * @return The body object, for chainability.
     */
    addShape(shape: Shape, _offset?: Vec3, _orientation?: Quaternion): this;
    onShapeChange(): void;
    /**
     * 同时添加多个shape，避免每次都重新计算转动惯量
     */
    addShapes(): void;
    /**
     * Update the bounding radius of the body. Should be done if any of the shapes are changed.
     */
    updateBoundingRadius(): void;
    /**
     * Updates the .aabb
     * 计算世界空间的AABB
     */
    updateAABB(): void;
    /**
     * Update .inertiaWorld and .invInertiaWorld
     * 转动惯量转到世界空间 I'=RIR'
     */
    updateInertiaWorld(force?: boolean): void;
    /**
     * Apply force to a world point. This could for example be a point on the Body surface. Applying force this way will add to Body.force and Body.torque.
     * @param  force The amount of force to add.
     * @param   relativePoint A point relative to the center of mass to apply the force on.
     */
    applyForce(force: Vec3, relativePoint: Vec3): void;
    /**
     * Apply force to a local point in the body.
     * @param   force The force vector to apply, defined locally in the body frame.
     * @param   localPoint A local point in the body to apply the force on.
     */
    applyLocalForce(localForce: Vec3, localPoint: Vec3): void;
    /**
     * Apply impulse to a world point. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
     * 施加一个本地坐标系下的冲量。影响线速度和角速度。
     * @param   impulse The amount of impulse to add.
     * @param   relativePoint A point relative to the center of mass to apply the force on.
     */
    applyImpulse(impulse: Vec3, relativePoint: Vec3): void;
    /**
     * Apply locally-defined impulse to a local point in the body.
     * @param  force The force vector to apply, defined locally in the body frame.
     * @param  localPoint A local point in the body to apply the force on.
     */
    applyLocalImpulse(localImpulse: Vec3, localPoint: Vec3): void;
    set isTrigger(b: boolean);
    get isTrigger(): boolean;
    /** 获得整体的接触法线。这里不判断是否接触 */
    getContactNormal(norm: Vec3): void;
    /**
     * Should be called whenever you change the body shape or mass.
     * 更新对象的转动惯量相关值
     */
    updateMassProperties(): void;
    /**
     * Get world velocity of a point in the body.
     */
    getVelocityAtWorldPoint(worldPoint: Vec3, result: Vec3): Vec3;
    /**
     * 把位置移到刚发生碰撞的地方
     * @param dt
     */
    integrateToTimeOfImpact(dt: number): boolean;
    /**
     * Move the body forward in time.
     * 先更新速度，使用新的速度计算位置
     * @param  dt Time step
     * @param  quatNormalize Set to true to normalize the body quaternion
     * @param  quatNormalizeFast If the quaternion should be normalized using "fast" quaternion normalization
     */
    integrate(dt: f32, quatNormalize: boolean, quatNormalizeFast: boolean): void;
    preCollision: () => void;
}

const enum RayMode {
    CLOSEST = 1,
    ANY = 2,
    ALL = 4
}
interface hitworldOptions {
    mode?: RayMode;
    result?: RaycastResult;
    skipBackfaces?: boolean;
    collisionFilterMask?: int;
    collisionFilterGroup?: int;
    from?: Vec3;
    to?: Vec3;
    callback?: () => void;
}
/**
 * 为了节省内存，Body中保存一个通用的rundata。可能很多地方需要使用，因此需要一个stack以便修改恢复
 */
class BodyRunDataStack {
    static rundataStack: any[];
    /** 当前开始的位置，恢复的时候就是到这里 */
    curStackBase: number;
    curStackPtr: number;
    startFrame(): void;
    pushBody(b: Body): void;
    /**
     * 恢复到curStackBase开始的地方
     */
    ret(): void;
}
/**
 * A line in 3D space that intersects bodies and return points.
 */
class Ray {
    from: Vec3;
    to: Vec3;
    _direction: Vec3;
    ignoreTrigger: boolean;
    /** 超过这么长就要分段进行了 */
    static StepLen: number;
    static checkid: number;
    static bodyRunDataStack: [];
    /**
     * The precision of the ray. Used when checking parallelity etc.
     */
    precision: number;
    /**
     * Set to true if you want the Ray to take .collisionResponse flags into account on bodies and shapes.
     */
    checkCollisionResponse: boolean;
    /**
     * If set to true, the ray skips any hits with normal.dot(rayDirection) < 0.
     */
    skipBackfaces: boolean;
    collisionFilterMask: number;
    collisionFilterGroup: number;
    /**
     * The intersection mode. Should be Ray.ANY, Ray.ALL or Ray.CLOSEST.
     */
    mode: RayMode;
    /**
     * Current result object.
     */
    result: RaycastResult;
    /**
     * Will be set to true during intersectWorld() if the ray hit anything.
     */
    hasHit: boolean;
    /**
     * 不检查背面
     */
    ignoreBack: boolean;
    /**
     * Current, user-provided result callback. Will be used if mode is Ray.ALL.
     */
    callback: (r: RaycastResult) => void;
    constructor(from?: Vec3, to?: Vec3);
    /**
     * Do itersection against all bodies in the given World.
     */
    intersectWorld(world: World, options: hitworldOptions): boolean;
    intersectBody(body: Body, result?: RaycastResult): void;
    /**
     * @method intersectBodies
     * @param {Array} bodies An array of Body objects.
     * @param {RaycastResult} [result] Deprecated
     */
    intersectBodies(bodies: Body[], result?: RaycastResult): void;
    /**
     * Updates the _direction vector.
     * @private
     * @method _updateDirection
     */
    _updateDirection(): void;
    intersectShape(shape: Shape, quat: Quaternion, position: Vec3, body: Body): void;
    private intersectBox;
    private intersectPlane;
    /**
     * Get the world AABB of the ray.
     */
    getAABB(aabb: AABB): void;
    private intersectHeightfield;
    /**
     * 射线与球的碰撞
     * @param shape
     * @param quat
     * @param position
     * @param body
     * @param reportedShape
     */
    intersectSphere(shape: Sphere, quat: Quaternion, position: Vec3, body: Body, reportedShape: Shape): void;
    /**
     * 是否与凸体相交
     * @param shape
     * @param quat
     * @param position
     * @param body
     * @param reportedShape
     * @param options
     */
    intersectConvex(shape: ConvexPolyhedron, quat: Quaternion, position: Vec3, body: Body, reportedShape: Shape, options?: {
        faceList: number[];
    }): void;
    /**
     * 这个没有Quaternion参数，因为假设只依赖body当前朝向。因为这个函数依赖axis
     * 内部向外不算碰撞
     * @param capsule
     * @param position
     * @param body
     * @param reportedShape
     */
    intersectCapsule(capsule: Capsule, position: Vec3, quat: Quaternion, body: Body, reportedShape: Shape): void;
    /**
     * @method intersectTrimesh
     * @todo Optimize by transforming the world to local space first.
     * @todo Use Octree lookup
     */
    intersectTrimesh(mesh: Trimesh, quat: Quaternion, position: Vec3, body: Body, reportedShape: Shape, options?: {
        faceList: Boolean;
    }): void;
    /**
     * 射线与voxel的相交
     * @param voxel
     * @param quat 	voxel的旋转
     * @param position 	voxel的位置
     * @param body
     * @param reportedShape
     */
    intersectVoxel(voxel: Voxel, quat: Quaternion, position: Vec3, body: Body, reportedShape: Shape): void;
    /**
     * 发生了一个碰撞，记录并判断是否需要继续。
     * 只有类型是ANY才会立即返回
     * @param normal 		碰撞点的normal
     * @param hitPointWorld 世界坐标的碰撞点
     * @param shape
     * @param body
     * @param hitFaceIndex
     * @return True if the intersections should continue
     */
    private reportIntersection;
    static pointInTriangle(p: Vec3, a: Vec3, b: Vec3, c: Vec3): boolean;
}

class AABB {
    lowerBound: Vec3;
    upperBound: Vec3;
    constructor(lowerBound?: Vec3, upperBound?: Vec3);
    /**
     * Set the AABB bounds from a set of points.
     */
    setFromPoints(points: Vec3[], position?: Vec3, quaternion?: Quaternion, skinSize?: number): AABB;
    /**
     * Copy bounds from an AABB to this AABB
     */
    copy(aabb: AABB): this;
    /**
     * Clone an AABB
     */
    clone(): AABB;
    combine(a: AABB, b: AABB): void;
    /**
     * Extend this AABB so that it covers the given AABB too.
     */
    extend(aabb: AABB): void;
    static Overlaps(min1: Vec3, max1: Vec3, min2: Vec3, max2: Vec3): boolean;
    /**
     * Returns true if the given AABB overlaps this AABB.
     */
    overlaps(aabb: AABB): boolean;
    volume(): number;
    surfaceArea(): number;
    /**
     * Returns true if the given AABB is fully contained in this AABB.
     */
    contains(aabb: AABB): boolean;
    getCorners(a: Vec3, b: Vec3, c: Vec3, d: Vec3, e: Vec3, f: Vec3, g: Vec3, h: Vec3): void;
    /**
     * Get the representation of an AABB in another frame.
     */
    toLocalFrame(frame: Transform, target: AABB): AABB;
    /**
     * Get the representation of an AABB in the global frame.
     */
    toWorldFrame(frame: Transform, target: AABB): AABB;
    /**
     * Check if the AABB is hit by a ray.
     */
    overlapsRay(ray: Ray): boolean;
    margin(m: number): void;
}

/**
 * Constrains two bodies to be at a constant distance from each others center of mass.
 * @author schteppe
 * @param  [distance] The distance to keep. If undefined, it will be set to the current distance between bodyA and bodyB
 * @param  [maxForce=1e6]
 * 用distance中点方作为碰撞点来实现
 */
class DistanceConstraint extends Constraint {
    distance: number;
    distanceEquation: ContactEquation;
    constructor(bodyA: Body, bodyB: Body, distance?: f32, maxForce?: f32);
    update(): void;
}

/**
 * Rotational constraint. Works to keep the local vectors orthogonal to each other in world space.
 * 旋转约束。A只能绕着axisA旋转，B只能绕着axisB旋转。
 * @author schteppe
 */
class RotationalEquation extends Equation {
    axisA: Vec3;
    axisB: Vec3;
    maxAngle: number;
    constructor(bodyA: Body, bodyB: Body, maxForce?: f32, axisA?: Vec3, axisB?: Vec3);
    computeB(h: number): number;
}

/**
 * Rotational motor constraint. Tries to keep the relative angular velocity of the bodies to a given value.
 * @author schteppe
 */
class RotationalMotorEquation extends Equation {
    /**
     * World oriented rotational axis
     */
    axisA: Vec3;
    /**
     * World oriented rotational axis
     */
    axisB: Vec3;
    /**
     * Motor velocity
     * @property {Number} targetVelocity
     */
    targetVelocity: number;
    constructor(bodyA: Body, bodyB: Body, maxForce?: number);
    computeB(h: f32): number;
}

/**
 * Connects two bodies at given offset points.
 * 把A的pivotA与B的pivotB连到一起。限制xyz方向三个自由度,只允许旋转
 * 为什么不用distance=0来实现呢
 *
 * @example
 *     var bodyA = new Body({ mass: 1 });
 *     var bodyB = new Body({ mass: 1 });
 *     bodyA.position.set(-1, 0, 0);
 *     bodyB.position.set(1, 0, 0);
 *     bodyA.addShape(shapeA);
 *     bodyB.addShape(shapeB);
 *     world.addBody(bodyA);
 *     world.addBody(bodyB);
 *     var localPivotA = new Vec3(1, 0, 0);
 *     var localPivotB = new Vec3(-1, 0, 0);
 *     var constraint = new PointToPointConstraint(bodyA, localPivotA, bodyB, localPivotB);
 *     world.addConstraint(constraint);
 */
class PointToPointConstraint extends Constraint {
    pivotA: Vec3;
    pivotB: Vec3;
    equationX: ContactEquation;
    equationY: ContactEquation;
    equationZ: ContactEquation;
    /**
     * @param bodyA
     * @param pivotA The point relative to the center of mass of bodyA which bodyA is constrained to.
     * @param bodyB Body that will be constrained in a similar way to the same point as bodyA. We will therefore get a link between bodyA and bodyB. If not specified, bodyA will be constrained to a static point.
     * @param pivotB See pivotA.
     * @param maxForce The maximum force that should be applied to constrain the bodies.
     *
     * 创建了xyz三个 ContactEquation 来实现的，保持三个方向的连接。
     */
    constructor(bodyA: Body, pivotA: Vec3, bodyB: Body, pivotB: Vec3, maxForce?: number);
    update(): void;
}

/**
 * Hinge constraint. Think of it as a door hinge. It tries to keep the door in the correct place and with the correct orientation.
 * @class HingeConstraint
 * @constructor
 * @author schteppe
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {object} [options]
 * @param {Vec3} [options.pivotA] A point defined locally in bodyA. This defines the offset of axisA.
 *                                A的连接点，本地坐标
 * @param {Vec3} [options.axisA] An axis that bodyA can rotate around, defined locally in bodyA.
 *                                A的连接轴，系统会保持AB的连接点重合，并且AB的连接轴重合
 * @param {Vec3} [options.pivotB]
 * @param {Vec3} [options.axisB]
 * @param {Number} [options.maxForce=1e6]
 * @extends PointToPointConstraint
 */
class HingeConstraint extends PointToPointConstraint {
    /**
     * Rotation axis, defined locally in bodyA.
     */
    axisA: Vec3;
    /**
     * Rotation axis, defined locally in bodyB.
     */
    axisB: Vec3;
    rotationalEquation1: RotationalEquation;
    rotationalEquation2: RotationalEquation;
    motorEquation: RotationalMotorEquation;
    /** TODO 这个目前还没有实现 */
    motorTargetVelocity: f32;
    constructor(bodyA: Body, bodyB: Body, maxForce?: f32, pivotA?: Vec3, pivotB?: Vec3, axisA?: Vec3, axisB?: Vec3);
    /**
     * @method enableMotor
     */
    enableMotor(): void;
    /**
     * @method disableMotor
     */
    disableMotor(): void;
    setMotorSpeed(speed: f32): void;
    setMotorMaxForce(maxForce: number): void;
    update(): void;
}

/**
 * @class WheelInfo
 * @constructor
 * @param {Object} [options]
 *
 * @param {Vec3} [options.chassisConnectionPointLocal]
 * @param {Vec3} [options.chassisConnectionPointWorld]
 * @param {Vec3} [options.directionLocal]
 * @param {Vec3} [options.directionWorld]
 * @param {Vec3} [options.axleLocal]
 * @param {Vec3} [options.axleWorld]
 * @param {number} [options.suspensionRestLength=1]
 * @param {number} [options.suspensionMaxLength=2]
 * @param {number} [options.radius=1]
 * @param {number} [options.suspensionStiffness=100]
 * @param {number} [options.dampingCompression=10]
 * @param {number} [options.dampingRelaxation=10]
 * @param {number} [options.frictionSlip=10000]
 * @param {number} [options.steering=0]
 * @param {number} [options.rotation=0]
 * @param {number} [options.deltaRotation=0]
 * @param {number} [options.rollInfluence=0.01]
 * @param {number} [options.maxSuspensionForce]
 * @param {boolean} [options.isFrontWheel=true]
 * @param {number} [options.clippedInvContactDotSuspension=1]
 * @param {number} [options.suspensionRelativeVelocity=0]
 * @param {number} [options.suspensionForce=0]
 * @param {number} [options.skidInfo=0]
 * @param {number} [options.suspensionLength=0]
 * @param {number} [options.maxSuspensionTravel=1]
 * @param {boolean} [options.useCustomSlidingRotationalSpeed=false]
 * @param {number} [options.customSlidingRotationalSpeed=-0.1]
 */
class WheelInfo {
    id: number;
    /**
     * Max travel distance of the suspension, in meters.
     * 悬挂系统允许移动的最大范围。
     */
    maxSuspensionTravel: number;
    /**
     * Speed to apply to the wheel rotation when the wheel is sliding.
     * 当滑动的时候，设置的轮胎转速
     */
    customSlidingRotationalSpeed: number;
    /**
     * If the customSlidingRotationalSpeed should be used.
     */
    useCustomSlidingRotationalSpeed: boolean;
    sliding: boolean;
    /**
     * 轮子与底盘的连接点。
     * 世界空间的是以后更新的时候计算出来的
     */
    chassisConnectionPointLocal: Vec3;
    chassisConnectionPointWorld: Vec3;
    /** 向下的方向 */
    directionLocal: Vec3;
    directionWorld: Vec3;
    /** 轮轴方向 */
    axleLocal: Vec3;
    axleWorld: Vec3;
    /** 悬挂系统在正常状态下的长度。还可以伸长和压缩，范围是 maxSuspensionTravel */
    suspensionRestLength: number;
    /** 悬挂系统允许的最大长度 */
    suspensionMaxLength: number;
    /** 轮胎半径 */
    radius: number;
    /** 悬挂系统的硬度。变形*硬度=提供的悬挂力 */
    suspensionStiffness: number;
    /** 悬挂压缩过程中的阻尼 */
    dampingCompression: number;
    /** 悬挂放松过程中的阻尼 */
    dampingRelaxation: number;
    /** 静摩擦系数。悬挂力乘这个系数表示提供的静摩擦力，超过了就开始打滑 */
    frictionSlip: number;
    /** 方向盘方向，0表示向前 */
    steering: number;
    /**
     * 当前轮子的转动弧度
     */
    rotation: number;
    deltaRotation: number;
    /** 转速 */
    /** 侧滑力作用位置，0表示在质心，不易翻车，1表示在接触点，易翻车 */
    rollInfluence: number;
    maxSuspensionForce: number;
    engineForce: number;
    brake: number;
    isFrontWheel: boolean;
    clippedInvContactDotSuspension: number;
    /** 悬挂系统的相对速度。 */
    suspensionRelativeVelocity: number;
    /** 悬挂系统提供的力，>0 */
    suspensionForce: number;
    /** 当前的悬挂系统的长度 */
    suspensionLength: number;
    /** 由于侧滑导致的力 */
    sideImpulse: number;
    /** 提供的向前的力 */
    forwardImpulse: number;
    raycastResult: RaycastResult;
    /** 轮子的世界空间的位置和旋转  */
    worldTransform: Transform;
    /** 轮胎是否接触地面 */
    isInContact: boolean;
    /** 打滑比例 */
    slipInfo: i32;
    /** 侧滑比例 */
    skidInfo: number;
    constructor(options?: any);
    updateWheel(chassis: Body): void;
}

/**
 * Vehicle helper class that casts rays from the wheel positions towards the ground and applies forces.
 * @class RaycastVehicle
 * @constructor
 * @param {object} [options]
 * @param {Body} [options.chassisBody] The car chassis body.
 * @param {integer} [options.indexRightAxis] Axis to use for right. x=0, y=1, z=2
 * @param {integer} [options.indexLeftAxis]
 * @param {integer} [options.indexUpAxis]
 */
class RaycastVehicle {
    chassisBody: Body;
    /**
     * An array of WheelInfo objects.
     */
    wheelInfos: WheelInfo[];
    /**
     * Will be set to true if the car is sliding.
     */
    sliding: boolean;
    world: World | null;
    /** 最大轮胎转速 */
    wheelRPM: number;
    maxSpeed: number;
    /**
     * Index of the right axis, 0=x, 1=y, 2=z
     */
    /**
     * Index of the forward axis, 0=x, 1=y, 2=z
     */
    /**
     * Index of the up axis, 0=x, 1=y, 2=z
     */
    dbgShowSlideForce: boolean;
    dbgShowSuspForce: boolean;
    dbgShowDriveForce: boolean;
    /** 当前速度，单位是 Km/h */
    currentVehicleSpeedKmHour: number;
    preStepCallback: () => void;
    constructor(chassisBody: Body, indexRightAxis?: i32, indexForwardAxis?: i32, indexUpAxis?: i32);
    /**
     * Add a wheel. For information about the options, see WheelInfo.
     * @param  [options]
     */
    addWheel(options?: {}): i32;
    /**
     * Set the steering value of a wheel.
     */
    setSteeringValue(value: f32, wheelIndex: i32): void;
    /**
     * Set the wheel force to apply on one of the wheels each time step
     */
    applyEngineForce(value: f32, wheelIndex: i32): void;
    /**
     * Set the braking force of a wheel
     */
    setBrake(brake: number, wheelIndex: i32): void;
    /**
     * Add the vehicle including its constraints to the world.
     */
    addToWorld(world: World): void;
    /**
     * Get one of the wheel axles, world-oriented.
     */
    getVehicleAxisWorld(axisIndex: i32, result: Vec3): void;
    /**
     * 主逻辑
     * @param timeStep
     */
    updateVehicle(timeStep: number): void;
    updateSuspension(deltaTime: f32): void;
    /**
     * Remove the vehicle including its constraints from the world.
     */
    removeFromWorld(world: World): void;
    /**
     * wheel做射线检测
     * @param wheel
     * @return 返回距离地面的高度，-1表示没有接触地面
     */
    castRay(wheel: WheelInfo): number;
    updateWheelTransformWorld(wheel: WheelInfo): void;
    /**
     * Update one of the wheel transform.
     * Note when rendering wheels: during each step, wheel transforms are updated BEFORE the chassis; ie. their position becomes invalid after the step.
     * Thus when you render wheels, you must update wheel transforms before rendering them. See raycastVehicle demo for an example.
     * @param wheelIndex The wheel index to update.
     */
    updateWheelTransform(wheelIndex: i32): void;
    /**
     * Get the world transform of one of the wheels
     * @param   wheelIndex
     */
    getWheelTransformWorld(wheelIndex: number): Transform;
    updateFriction(timeStep: number): void;
}

var carData: {
    modelUrl: string;
    chassisNode: string;
    wheelflNode: string;
    wheelfrNode: string;
    wheelrlNode: string;
    wheelrrNode: string;
    /**
     * 重心。是整个车的原点，其他的位置都根据他来算
     * 	1. 车身物理的shape根据这个来偏移
     *  2. 车身模型根据这个来偏移：模型原点在000，所以移动模型的时候，要减去这个
     */
    center: Vec3;
    chassisBox: Vec3;
    chassisBoxPos: Vec3;
    mass: number;
    /** 单轮拉力 */
    DanLunLaLi: number;
    /** 脚刹力 */
    JiaoShaLi: number;
    /** 手刹力 */
    ShouShaLi: number;
    radius: number;
    /** 悬挂平时长度:0.2, */
    suspensionRestLength: number;
    /** 悬挂最大移动范围:0.3 */
    maxSuspensionTravel: number;
    /** 悬挂提供的最大力 */
    maxSuspensionForce: number;
    /** 悬挂硬度 */
    suspensionStiffness: number;
    /** 悬挂压缩阻尼 */
    dampingCompression: number;
    /** 悬挂放松阻尼 */
    dampingRelaxation: number;
    /** 侧滑翻滚系数 */
    rollInfluence: number;
    /** 滑动时轮胎转速 */
    customSlidingRotationalSpeed: number;
    /** 开启滑动时轮胎转速 */
    useCustomSlidingRotationalSpeed: boolean;
    /** 轮胎静摩擦系数 */
    StaticFric: number;
    /** 最大速度 */
    MaxSpeed: number;
    flpos: Vec3;
    frpos: Vec3;
    rlpos: Vec3;
    rrpos: Vec3;
};
class Car {
    private static tmpV1;
    scene3D: laya.d3.core.scene.Scene3D;
    world: World;
    carData: typeof carData;
    /** 控制车身的根节点。可能不是车身模型，例如可能有好几层父子关系，为了给外部方便获取位置，需要设置根节点。缺省是设置的车身 */
    renderRoot: laya.d3.core.Sprite3D;
    renderRootOffq: Quaternion;
    wheels: laya.d3.core.MeshSprite3D[];
    wheelsOffQuat: Quaternion[];
    private wheelstrackf;
    private wheelstrackr;
    private wheelstrackslid;
    private tracklen;
    private wheelBrake;
    private isBraking;
    phyCar: RaycastVehicle;
    showTrack: boolean;
    showCenter: boolean;
    onUpdatePoseEnd: (pos: Vec3, quat: Quaternion) => void;
    constructor(sce: laya.d3.core.scene.Scene3D, world: World);
    set showSlideForce(b: boolean);
    get showSlideForce(): boolean;
    set showSuspForce(b: boolean);
    get showSuspForce(): boolean;
    set showDriveForce(b: boolean);
    get showDriveForce(): boolean;
    /**
     *
     * @param data
     * @param renderModel 如果传入这个参数，则不再自己加载。外部负责加载并加到场景中。模型必须符合制定的规则。
     */
    parse(data: typeof carData, renderModel: laya.d3.core.Sprite3D | null): void;
    /** 获得当前速度，单位是Km/H */
    getSpeed(): number;
    onModelLoaded(model: laya.d3.core.Sprite3D, addtoSce?: boolean): void;
    /**
     * 设置根渲染对象。物理对渲染的控制就是通过这个对象进行的。
     * @param s
     */
    setRootObj(s: laya.d3.core.Sprite3D): void;
    enable(): void;
    accel(k: number): void;
    reversing(k: number): void;
    steer(v: number, isDeg?: boolean): void;
    handbrake(f: number | null): void;
    brake(b: boolean): void;
    updatePose(): void;
    op_steerLeft: boolean;
    op_steerRight: boolean;
    op_acc: boolean;
    op_rev: boolean;
    op_handbrake: boolean;
    op_brake: boolean;
    onkeyEvent(e: Event, down: boolean): void;
    updateCtrl(): void;
    addForce(x: number, y: number, z: number): void;
}


/*
    Shape: typeof Shape;
    Body: typeof Body;
    World: typeof World;
    DistanceConstraint: typeof DistanceConstraint;
    HingeConstraint: typeof HingeConstraint;
    Vec3: typeof Vec3;
    Quaternion: typeof Quaternion;
    Mat3: typeof Mat3;
    AABB: typeof AABB;
    Box: typeof Box;
    Sphere: typeof Sphere;
    Capsule: typeof Capsule;
    Voxel: typeof Voxel;
    Ray: typeof Ray;
    RaycastResult: typeof RaycastResult;
    Material: typeof Material;
    ContactMaterial: typeof ContactMaterial;
    RaycastVehicle: typeof RaycastVehicle;
    Car: typeof Car;
*/    
}

