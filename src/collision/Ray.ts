import { Quaternion } from '../math/Quaternion.js';
import { Transform } from '../math/Transform.js';
import { Vec3 } from '../math/Vec3.js';
import { Body } from '../objects/Body.js';
import { Box } from '../shapes/Box.js';
import { ConvexPolyhedron } from '../shapes/ConvexPolyhedron.js';
import { Heightfield } from '../shapes/Heightfield.js';
import { Plane } from '../shapes/Plane.js';
import { Shape, SHAPETYPE } from '../shapes/Shape.js';
import { Sphere } from '../shapes/Sphere.js';
import { Trimesh } from '../shapes/Trimesh.js';
import { Voxel } from '../shapes/Voxel.js';
import { World } from '../world/World.js';
import { AABB } from './AABB.js';
import { RaycastResult } from './RaycastResult.js';

var tmpVec1 = new Vec3();
var tmpVec2 = new Vec3();
var tmpVec3 = new Vec3();
var tmpQ = new Quaternion();

export const enum RayMode{
	CLOSEST=1,	// 最靠近的
	ANY=2,	// 任意一个碰到的
	ALL=4,	// 碰到的所有的
}

export interface hitworldOptions{
	mode?:RayMode;
	result?:RaycastResult;
	skipBackfaces?:boolean;
	collisionFilterMask?:int;
	collisionFilterGroup?:int;
	from?:Vec3;
	to?:Vec3;
	callback?:()=>void
}
/**
 * A line in 3D space that intersects bodies and return points.
 */
export class Ray {
	from = new Vec3();
	to = new Vec3();
	_direction = new Vec3();

    /**
     * The precision of the ray. Used when checking parallelity etc.
     */
	precision = 0.0001;

    /**
     * Set to true if you want the Ray to take .collisionResponse flags into account on bodies and shapes.
     */
	checkCollisionResponse = true;

    /**
     * If set to true, the ray skips any hits with normal.dot(rayDirection) < 0.
     */
	skipBackfaces = false;
	collisionFilterMask = -1;
	collisionFilterGroup = -1;

    /**
     * The intersection mode. Should be Ray.ANY, Ray.ALL or Ray.CLOSEST.
     */
	mode = RayMode.ANY;

    /**
     * Current result object.
     */
	result = new RaycastResult();

    /**
     * Will be set to true during intersectWorld() if the ray hit anything.
     */
	hasHit = false;

    /**
     * Current, user-provided result callback. Will be used if mode is Ray.ALL.
     */
	callback: (r: RaycastResult) => void;

	constructor(from?: Vec3, to?: Vec3) {
		from && (this.from = from.clone());
		to && (this.to = to.clone());
	}

    /**
     * Do itersection against all bodies in the given World.
     */
	intersectWorld(world: World, options:hitworldOptions ) {
		this.mode = options.mode || RayMode.ANY;
		this.result = options.result || new RaycastResult();
		this.skipBackfaces = !!options.skipBackfaces;
		this.collisionFilterMask = typeof (options.collisionFilterMask) !== 'undefined' ? options.collisionFilterMask : -1;
		this.collisionFilterGroup = typeof (options.collisionFilterGroup) !== 'undefined' ? options.collisionFilterGroup : -1;
		if (options.from) {
			this.from.copy(options.from);
		}
		if (options.to) {
			this.to.copy(options.to);
		}
		this.callback = options.callback || (() => { });
		this.hasHit = false;

		this.result.reset();
		this._updateDirection();

		this.getAABB(tmpAABB);
		tmpArray.length = 0;
		world.broadphase.aabbQuery(world, tmpAABB, tmpArray);
		this.intersectBodies(tmpArray);

		return this.hasHit;
	}

	intersectBody(body: Body, result?: RaycastResult) {
		if (result) {
			this.result = result;
			this._updateDirection();
		}
		const checkCollisionResponse = this.checkCollisionResponse;

		if (checkCollisionResponse && !body.collisionResponse) {
			return;
		}

		if ((this.collisionFilterGroup & body.collisionFilterMask) === 0 || (body.collisionFilterGroup & this.collisionFilterMask) === 0) {
			return;
		}

		let xi = intersectBody_xi;
		let qi = intersectBody_qi;

		for (let i = 0, N = body.shapes.length; i < N; i++) {
			const shape = body.shapes[i];
			if(!shape.enable)
				continue;
			if (checkCollisionResponse && !shape.collisionResponse) {
				continue; // Skip
			}

			let shapeq = body.shapeOrientations[i];
			if(shapeq)
				body.quaternion.mult(shapeq, qi);
			else 
				qi.copy(body.quaternion);

			let shapeoff = body.shapeOffsets[i];
			if(shapeoff){
				body.quaternion.vmult(shapeoff, xi);
				xi.vadd(body.position, xi);
			}
			else
				xi.copy( body.position);
				
			this.intersectShape(
				shape,
				qi,
				xi,
				body
			);

			if (this.result._shouldStop) {
				break;
			}
		}
	}

    /**
     * @method intersectBodies
     * @param {Array} bodies An array of Body objects.
     * @param {RaycastResult} [result] Deprecated
     */
	intersectBodies(bodies: Body[], result?: RaycastResult) {
		if (result) {
			this.result = result;
			this._updateDirection();
		}

		for (let i = 0, l = bodies.length; !this.result._shouldStop && i < l; i++) {
			this.intersectBody(bodies[i]);
		}
	}

    /**
     * Updates the _direction vector.
     * @private
     * @method _updateDirection
     */
	_updateDirection() {
		this.to.vsub(this.from, this._direction);
		this._direction.normalize();
	}

	intersectShape(shape: Shape, quat: Quaternion, position: Vec3, body: Body) {
		const from = this.from;
		// Checking boundingSphere
		const distance = distanceFromIntersection(from, this._direction, position);
		if (distance > shape.boundSphR) {
			return;
		}

		switch (shape.type) {
			case SHAPETYPE.BOX: this.intersectBox(shape as Box, quat, position, body, shape); break;
			case SHAPETYPE.SPHERE: this.intersectSphere(shape as Sphere, quat, position, body, shape); break;
			case SHAPETYPE.PLANE: this.intersectPlane(shape as Plane, quat, position, body, shape); break;
			case SHAPETYPE.CONVEXPOLYHEDRON: this.intersectConvex(shape as ConvexPolyhedron, quat, position, body, shape); break;
			case SHAPETYPE.TRIMESH: this.intersectTrimesh(shape as Trimesh, quat, position, body, shape); break;
			case SHAPETYPE.HEIGHTFIELD: this.intersectHeightfield(shape as Heightfield, quat, position, body, shape); break;
			case SHAPETYPE.CAPSULE: break;
			case SHAPETYPE.VOXEL: this.intersectVoxel(shape as Voxel, quat, position, body, shape); break;
		}
        /*
        const intersectMethod = this[shape.type];
        if (intersectMethod) {
            intersectMethod.call(this, shape, quat, position, body, shape);
        }
        */
	}

	private intersectBox(shape: Box, quat: Quaternion, position: Vec3, body: Body, reportedShape: Shape) {
		return this.intersectConvex(shape.convexPolyhedronRepresentation, quat, position, body, reportedShape);
	}

	private intersectPlane(shape: Plane, quat: Quaternion, position: Vec3, body: Body, reportedShape: Shape) {
		const from = this.from;
		const to = this.to;
		const direction = this._direction;

		// Get plane normal
		const worldNormal = new Vec3(0, 0, 1);
		quat.vmult(worldNormal, worldNormal);

		const len = new Vec3();
		from.vsub(position, len);
		const planeToFrom = len.dot(worldNormal);
		to.vsub(position, len);
		const planeToTo = len.dot(worldNormal);

		if (planeToFrom * planeToTo > 0) {
			// "from" and "to" are on the same side of the plane... bail out
			return;
		}

		if (from.distanceTo(to) < planeToFrom) {
			return;
		}

		const n_dot_dir = worldNormal.dot(direction);

		if (Math.abs(n_dot_dir) < this.precision) {
			// No intersection
			return;
		}

		const planePointToFrom = new Vec3();
		const dir_scaled_with_t = new Vec3();
		const hitPointWorld = new Vec3();

		from.vsub(position, planePointToFrom);
		const t = -worldNormal.dot(planePointToFrom) / n_dot_dir;
		direction.scale(t, dir_scaled_with_t);
		from.vadd(dir_scaled_with_t, hitPointWorld);

		this.reportIntersection(worldNormal, hitPointWorld, reportedShape, body, -1);
	}

    /**
     * Get the world AABB of the ray.
     */
	getAABB(aabb: AABB) {
		const to = this.to;
		const from = this.from;
		aabb.lowerBound.x = Math.min(to.x, from.x);
		aabb.lowerBound.y = Math.min(to.y, from.y);
		aabb.lowerBound.z = Math.min(to.z, from.z);
		aabb.upperBound.x = Math.max(to.x, from.x);
		aabb.upperBound.y = Math.max(to.y, from.y);
		aabb.upperBound.z = Math.max(to.z, from.z);
	}


	private intersectHeightfield(shape: Heightfield, quat: Quaternion, position: Vec3, body: Body, reportedShape: Shape) {
		//const data = shape.data;
		//const w = shape.elementSize;

		// Convert the ray to local heightfield coordinates
		const localRay = intersectHeightfield_localRay; //new Ray(this.from, this.to);
		localRay.from.copy(this.from);
		localRay.to.copy(this.to);
		Transform.pointToLocalFrame(position, quat, localRay.from, localRay.from);
		Transform.pointToLocalFrame(position, quat, localRay.to, localRay.to);
		localRay._updateDirection();

		// Get the index of the data points to test against
		const index = intersectHeightfield_index;

		let iMinZ=0, iMinX=0;
		let iMaxZ;
		// Set to max
		let iMaxX = iMaxZ = shape.data.length - 1;

		const aabb = new AABB();
		localRay.getAABB(aabb);

		// min所在的位置
		shape.getIndexOfPosition(aabb.lowerBound.x, aabb.lowerBound.z, index, true);
		iMinX = Math.max(iMinX, index[0]);	//限制到>=0
		iMinZ = Math.max(iMinZ, index[1]);
		// max所在的位置
		shape.getIndexOfPosition(aabb.upperBound.x, aabb.upperBound.z, index, true);
		iMaxX = Math.min(iMaxX, index[0] + 1);// 限制一下
		iMaxZ = Math.min(iMaxZ, index[1] + 1);

		for (let j = iMinZ; j < iMaxZ; j++) {
			for (let i = iMinX; i < iMaxX; i++) {

				if (this.result._shouldStop) {
					return;
				}

				//当前数据块与射线的aabb检测
				shape.getAabbAtIndex(i, j, aabb);
				if (!aabb.overlapsRay(localRay)) {
					continue;
				}

				// 下面与三角形检测
				// Lower triangle
				shape.getConvexTrianglePillar(i, j, false);
				Transform.pointToWorldFrame(position, quat, shape.pillarOffset, worldPillarOffset);
				this.intersectConvex(shape.pillarConvex, quat, worldPillarOffset, body, reportedShape, intersectConvexOptions);

				if (this.result._shouldStop) {
					return;
				}

				// Upper triangle
				shape.getConvexTrianglePillar(i, j, true);
				Transform.pointToWorldFrame(position, quat, shape.pillarOffset, worldPillarOffset);
				this.intersectConvex(shape.pillarConvex, quat, worldPillarOffset, body, reportedShape, intersectConvexOptions);
			}
		}
	}

	intersectSphere(shape: Sphere, quat: Quaternion, position: Vec3, body: Body, reportedShape: Shape) {
		const from = this.from;
		const to = this.to;
		const r = shape.radius;

		const a = (to.x - from.x) ** 2 + (to.y - from.y) ** 2 + (to.z - from.z) ** 2;
		const b = 2 * ((to.x - from.x) * (from.x - position.x) + (to.y - from.y) * (from.y - position.y) + (to.z - from.z) * (from.z - position.z));
		const c = (from.x - position.x) ** 2 + (from.y - position.y) ** 2 + (from.z - position.z) ** 2 - r ** 2;

		const delta = b ** 2 - 4 * a * c;

		const intersectionPoint = Ray_intersectSphere_intersectionPoint;
		const normal = Ray_intersectSphere_normal;

		if (delta < 0) {
			// No intersection
			return;

		} else if (delta === 0) {
			// single intersection point
			from.lerp(to, delta, intersectionPoint);

			intersectionPoint.vsub(position, normal);
			normal.normalize();

			this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);

		} else {
			const d1 = (- b - Math.sqrt(delta)) / (2 * a);
			const d2 = (- b + Math.sqrt(delta)) / (2 * a);

			if (d1 >= 0 && d1 <= 1) {
				from.lerp(to, d1, intersectionPoint);
				intersectionPoint.vsub(position, normal);
				normal.normalize();
				this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
			}

			if (this.result._shouldStop) {
				return;
			}

			if (d2 >= 0 && d2 <= 1) {
				from.lerp(to, d2, intersectionPoint);
				intersectionPoint.vsub(position, normal);
				normal.normalize();
				this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
			}
		}
	}

    /**
     * 是否与凸体相交
     * @param shape 
     * @param quat 
     * @param position 
     * @param body 
     * @param reportedShape 
     * @param options 
     */
	intersectConvex(shape: ConvexPolyhedron, quat: Quaternion, position: Vec3, body: Body, reportedShape: Shape, options?: { faceList: number[] }) {
		//const minDistNormal = intersectConvex_minDistNormal;
		const normal = intersectConvex_normal;
		const vector = intersectConvex_vector;
		//const minDistIntersect = intersectConvex_minDistIntersect;
		const faceList = (options && options.faceList) || null;

		// Checking faces
		const faces = shape.faces;

		const vertices = shape.vertices;
		const normals = shape.faceNormals;
		const direction = this._direction;

		const from = this.from;
		const to = this.to;
		const fromToDistance = from.distanceTo(to);

		//const minDist = -1;
		const Nfaces = faceList ? faceList.length : faces.length;
		const result = this.result;

		let ptInTri = Ray.pointInTriangle;
		for (let j = 0; !result._shouldStop && j < Nfaces; j++) {
			const fi = faceList ? faceList[j] : j;

			const face = faces[fi];
			const faceNormal = normals[fi];
			const q = quat;
			const x = position;

			// determine if ray intersects the plane of the face
			// note: this works regardless of the direction of the face normal

			// Get plane point in world coordinates...
			vector.copy(vertices[face[0]]);
			q.vmult(vector, vector);
			vector.vadd(x, vector);

			// ...but make it relative to the ray from. We'll fix this later.
			vector.vsub(from, vector);

			// Get plane normal
			q.vmult(faceNormal, normal);

			// If this dot product is negative, we have something interesting
			const dot = direction.dot(normal);

			// Bail out if ray and plane are parallel
			if (Math.abs(dot) < this.precision) {
				continue;
			}

			// calc distance to plane
			const scalar = normal.dot(vector) / dot;

			// if negative distance, then plane is behind ray
			if (scalar < 0) {
				continue;
			}

			// if (dot < 0) {

			// Intersection point is from + direction * scalar
			direction.scale(scalar, intersectPoint);
			intersectPoint.vadd(from, intersectPoint);

			// a is the point we compare points b and c with.
			a.copy(vertices[face[0]]);
			q.vmult(a, a);
			x.vadd(a, a);

			for (let i = 1; !result._shouldStop && i < face.length - 1; i++) {
				// Transform 3 vertices to world coords
				b.copy(vertices[face[i]]);
				c.copy(vertices[face[i + 1]]);
				q.vmult(b, b);
				q.vmult(c, c);
				x.vadd(b, b);
				x.vadd(c, c);

				const distance = intersectPoint.distanceTo(from);

				if (!(ptInTri(intersectPoint, a, b, c) || ptInTri(intersectPoint, b, a, c)) || distance > fromToDistance) {
					continue;
				}

				this.reportIntersection(normal, intersectPoint, reportedShape, body, fi);
			}
			// }
		}
	}

    /**
     * @method intersectTrimesh
     * @todo Optimize by transforming the world to local space first.
     * @todo Use Octree lookup
     */
	intersectTrimesh(mesh: Trimesh, quat: Quaternion, position: Vec3, body: Body, reportedShape: Shape, options?: { faceList: Boolean }) {
		const normal = intersectTrimesh_normal;
		const triangles = intersectTrimesh_triangles;
		const treeTransform = intersectTrimesh_treeTransform;
		//const minDistNormal = intersectConvex_minDistNormal;
		const vector = intersectConvex_vector;
		//const minDistIntersect = intersectConvex_minDistIntersect;
		//const localAABB = intersectTrimesh_localAABB;
		const localDirection = intersectTrimesh_localDirection;
		const localFrom = intersectTrimesh_localFrom;
		const localTo = intersectTrimesh_localTo;
		const worldIntersectPoint = intersectTrimesh_worldIntersectPoint;
		const worldNormal = intersectTrimesh_worldNormal;
		//const faceList = (options && options.faceList) || null;

		// Checking faces
		const indices = mesh.indices;

		//const vertices = mesh.vertices;
		//const normals = mesh.normals;

		const from = this.from;
		const to = this.to;
		const direction = this._direction;

		//const minDist = -1;
		treeTransform.position.copy(position);
		treeTransform.quaternion.copy(quat);

		// Transform ray to local space!
		Transform.vectorToLocalFrame(position, quat, direction, localDirection);
		Transform.pointToLocalFrame(position, quat, from, localFrom);
		Transform.pointToLocalFrame(position, quat, to, localTo);

		localTo.x *= mesh.scale.x;
		localTo.y *= mesh.scale.y;
		localTo.z *= mesh.scale.z;
		localFrom.x *= mesh.scale.x;
		localFrom.y *= mesh.scale.y;
		localFrom.z *= mesh.scale.z;

		localTo.vsub(localFrom, localDirection);
		localDirection.normalize();

		const fromToDistanceSquared = localFrom.distanceSquared(localTo);

		mesh.tree.rayQuery(this, treeTransform, triangles);

		var ptInTri = Ray.pointInTriangle;
		for (let i = 0, N = triangles.length; !this.result._shouldStop && i !== N; i++) {
			const trianglesIndex = triangles[i];

			mesh.getNormal(trianglesIndex, normal);

			// determine if ray intersects the plane of the face
			// note: this works regardless of the direction of the face normal

			// Get plane point in world coordinates...
			mesh.getVertex(indices[trianglesIndex * 3], a);

			// ...but make it relative to the ray from. We'll fix this later.
			a.vsub(localFrom, vector);

			// If this dot product is negative, we have something interesting
			const dot = localDirection.dot(normal);

			// Bail out if ray and plane are parallel
			// if (Math.abs( dot ) < this.precision){
			//     continue;
			// }

			// calc distance to plane
			const scalar = normal.dot(vector) / dot;

			// if negative distance, then plane is behind ray
			if (scalar < 0) {
				continue;
			}

			// Intersection point is from + direction * scalar
			localDirection.scale(scalar, intersectPoint);
			intersectPoint.vadd(localFrom, intersectPoint);

			// Get triangle vertices
			mesh.getVertex(indices[trianglesIndex * 3 + 1], b);
			mesh.getVertex(indices[trianglesIndex * 3 + 2], c);

			const squaredDistance = intersectPoint.distanceSquared(localFrom);

			if (!(ptInTri(intersectPoint, b, a, c) || ptInTri(intersectPoint, a, b, c)) || squaredDistance > fromToDistanceSquared) {
				continue;
			}

			// transform intersectpoint and normal to world
			Transform.vectorToWorldFrame(quat, normal, worldNormal);
			Transform.pointToWorldFrame(position, quat, intersectPoint, worldIntersectPoint);
			this.reportIntersection(worldNormal, worldIntersectPoint, reportedShape, body, trianglesIndex);
		}
		triangles.length = 0;
	}

	/**
	 * 射线与voxel的相交
	 * @param voxel 
	 * @param quat 	voxel的旋转
	 * @param position 	voxel的位置
	 * @param body 
	 * @param reportedShape 
	 */
	intersectVoxel(voxel: Voxel, quat: Quaternion, position: Vec3, body: Body, reportedShape: Shape) {
		const from = this.from;
		const to = this.to;
		// 世界空间的包围盒
		// TEMP
		voxel.pos = position;
		voxel.quat = quat;
		voxel.updateAABB();
		// TEMP
		let voxmin = voxel.aabbmin;
		let voxmax = voxel.aabbmax;

		// 判断包围盒
		let minx = from.x < to.x ? from.x : to.x;
		let miny = from.y < to.y ? from.y : to.y;
		let minz = from.z < to.z ? from.z : to.z;
		let maxx = from.x > to.x ? from.x : to.x;
		let maxy = from.y > to.y ? from.y : to.y;
		let maxz = from.z > to.z ? from.z : to.z;

		if (maxx < voxmin.x ||
			minx > voxmax.x ||
			maxy < voxmin.y ||
			miny > voxmax.y ||
			maxz < voxmin.z ||
			minz > voxmax.z
		) return;

		// from to转到voxel空间
		let invQ = tmpQ;
		quat.conjugate(invQ);
		let fromLocal = tmpVec1;
		let toLocal = tmpVec2;
		from.vsub(position,fromLocal); invQ.vmult(fromLocal,fromLocal); 
		to.vsub(position,toLocal); invQ.vmult(toLocal,toLocal);
		if(voxel.invScale){
			fromLocal.vmul(voxel.invScale,fromLocal);
			toLocal.vmul(voxel.invScale, toLocal);
		}

		const intersectionPoint = Ray_intersectSphere_intersectionPoint;
		const normal = Ray_intersectSphere_normal;

		// 包围盒检查通过，下面检查voxel
		//test
		voxel.pos=position;	//position是临时的，因此只能使用前随时设置
		voxel.quat=quat;
		//test
		voxel.rayTravel(fromLocal,toLocal,(x:int,y:int,z:int,b:boolean)=>{
			if(!b)
				return true;
			var pmin= new Vec3();
			var pmax = new Vec3();
			voxel.xyzToPos(x,y,z,position,quat,pmin,pmax);
			//console.log('hit',x,y,z);
			//let phyr =  (window as any).phyr as PhyRender;// getPhyRender();
			//phyr.addAABB(new Vec3(),pmax,0xff00);
			//phyr.addPersistPoint( pmin );
			//phyr.addPersistPoint( pmax );
			intersectionPoint.copy(pmax);	//TODO 先粗略的加一个，碰撞点
			return false;
		});

		// 转回世界空间
		this.reportIntersection(normal, intersectionPoint, reportedShape, body, -1);
	}

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
	private reportIntersection(normal: Vec3, hitPointWorld: Vec3, shape: Shape, body: Body, hitFaceIndex?: number) {
		const from = this.from;
		const to = this.to;
		const distance = from.distanceTo(hitPointWorld);
		const result = this.result;

		// Skip back faces?
		if (this.skipBackfaces && normal.dot(this._direction) > 0) {
			return;
		}

		result.hitFaceIndex = typeof (hitFaceIndex) !== 'undefined' ? hitFaceIndex : -1;

		switch (this.mode) {
			case RayMode.ALL:
				this.hasHit = true;
				result.set(
					from,
					to,
					normal,
					hitPointWorld,
					shape,
					body,
					distance
				);
				result.hasHit = true;
				this.callback(result);
				break;

			case RayMode.CLOSEST:

				// Store if closer than current closest
				if (distance < result.distance || !result.hasHit) {
					this.hasHit = true;
					result.hasHit = true;
					result.set(
						from,
						to,
						normal,
						hitPointWorld,
						shape,
						body,
						distance
					);
				}
				break;

			case RayMode.ANY:

				// Report and stop.
				this.hasHit = true;
				result.hasHit = true;
				result.set(
					from,
					to,
					normal,
					hitPointWorld,
					shape,
					body,
					distance
				);
				result._shouldStop = true;
				break;
		}
	}

    /*
     * As per "Barycentric Technique" as named here http://www.blackpawn.com/texts/pointinpoly/default.html But without the division
     */

	static pointInTriangle(p: Vec3, a: Vec3, b: Vec3, c: Vec3) {
		c.vsub(a, v0);
		b.vsub(a, v1);
		p.vsub(a, v2);

		const dot00 = v0.dot(v0);
		const dot01 = v0.dot(v1);
		const dot02 = v0.dot(v2);
		const dot11 = v1.dot(v1);
		const dot12 = v1.dot(v2);

		let u: number;
		let v: number;

		return ((u = dot11 * dot02 - dot01 * dot12) >= 0) &&
			((v = dot00 * dot12 - dot01 * dot02) >= 0) &&
			(u + v < (dot00 * dot11 - dot01 * dot01));
	}

}



var tmpAABB = new AABB();
var tmpArray: Body[] = [];

const v1 = new Vec3();
const v2 = new Vec3();


/**
 * Shoot a ray at a body, get back information about the hit.
 * @method intersectBody
 * @private
 * @param {Body} body
 * @param {RaycastResult} [result] Deprecated - set the result property of the Ray instead.
 */
var intersectBody_xi = new Vec3();
var intersectBody_qi = new Quaternion();

//const vector = new Vec3();
//const normal = new Vec3();
var intersectPoint = new Vec3();

var a = new Vec3();
var b = new Vec3();
var c = new Vec3();
//const d = new Vec3();

//const tmpRaycastResult = new RaycastResult();

var intersectConvexOptions = {
	faceList: [0]
};
var worldPillarOffset = new Vec3();
var intersectHeightfield_localRay = new Ray();
var intersectHeightfield_index: i32[] = [];
//const intersectHeightfield_minMax = [];

var Ray_intersectSphere_intersectionPoint = new Vec3();
var Ray_intersectSphere_normal = new Vec3();

var intersectConvex_normal = new Vec3();
//var intersectConvex_minDistNormal = new Vec3();
//var intersectConvex_minDistIntersect = new Vec3();
var intersectConvex_vector = new Vec3();

var intersectTrimesh_normal = new Vec3();
var intersectTrimesh_localDirection = new Vec3();
var intersectTrimesh_localFrom = new Vec3();
var intersectTrimesh_localTo = new Vec3();
var intersectTrimesh_worldNormal = new Vec3();
var intersectTrimesh_worldIntersectPoint = new Vec3();
//var intersectTrimesh_localAABB = new AABB();
var intersectTrimesh_triangles: i32[] = [];
var intersectTrimesh_treeTransform = new Transform();

var v0 = new Vec3();
const intersect = new Vec3();
function distanceFromIntersection(from: Vec3, direction: Vec3, position: Vec3) {
	// v0 is vector from from to position
	position.vsub(from, v0);
	const dot = v0.dot(direction);
	// intersect = direction*dot + from
	direction.scale(dot, intersect);
	intersect.vadd(from, intersect);
	const distance = position.distanceTo(intersect);
	return distance;
}

