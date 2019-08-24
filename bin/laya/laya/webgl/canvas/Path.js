export class Path {
    constructor() {
        this._lastOriX = 0;
        this._lastOriY = 0;
        this.paths = [];
        this._curPath = null;
    }
    beginPath(convex) {
        this.paths.length = 1;
        this._curPath = this.paths[0] = new renderPath();
        this._curPath.convex = convex;
    }
    closePath() {
        this._curPath.loop = true;
    }
    newPath() {
        this._curPath = new renderPath();
        this.paths.push(this._curPath);
    }
    addPoint(pointX, pointY) {
        this._curPath.path.push(pointX, pointY);
    }
    push(points, convex) {
        if (!this._curPath) {
            this._curPath = new renderPath();
            this.paths.push(this._curPath);
        }
        else if (this._curPath.path.length > 0) {
            this._curPath = new renderPath();
            this.paths.push(this._curPath);
        }
        var rp = this._curPath;
        rp.path = points.slice();
        rp.convex = convex;
    }
    reset() {
        this.paths.length = 0;
    }
}
class renderPath {
    constructor() {
        this.path = [];
        this.loop = false;
        this.convex = false;
    }
}
