import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { ILaya } from "../../ILaya";
export class HitArea {
    contains(x, y) {
        if (!HitArea._isHitGraphic(x, y, this.hit))
            return false;
        return !HitArea._isHitGraphic(x, y, this.unHit);
    }
    static _isHitGraphic(x, y, graphic) {
        if (!graphic)
            return false;
        var cmds = graphic.cmds;
        if (!cmds && graphic._one) {
            cmds = HitArea._cmds;
            cmds.length = 1;
            cmds[0] = graphic._one;
        }
        if (!cmds)
            return false;
        var i, len;
        len = cmds.length;
        var cmd;
        for (i = 0; i < len; i++) {
            cmd = cmds[i];
            if (!cmd)
                continue;
            switch (cmd.cmdID) {
                case "Translate":
                    x -= cmd.tx;
                    y -= cmd.ty;
            }
            if (HitArea._isHitCmd(x, y, cmd))
                return true;
        }
        return false;
    }
    static _isHitCmd(x, y, cmd) {
        if (!cmd)
            return false;
        var rst = false;
        switch (cmd.cmdID) {
            case "DrawRect":
                HitArea._rect.setTo(cmd.x, cmd.y, cmd.width, cmd.height);
                rst = HitArea._rect.contains(x, y);
                break;
            case "DrawCircle":
                var d;
                x -= cmd.x;
                y -= cmd.y;
                d = x * x + y * y;
                rst = d < cmd.radius * cmd.radius;
                break;
            case "DrawPoly":
                x -= cmd.x;
                y -= cmd.y;
                rst = HitArea._ptInPolygon(x, y, cmd.points);
                break;
        }
        return rst;
    }
    static _ptInPolygon(x, y, areaPoints) {
        var p = HitArea._ptPoint;
        p.setTo(x, y);
        var nCross = 0;
        var p1x, p1y, p2x, p2y;
        var len;
        len = areaPoints.length;
        for (var i = 0; i < len; i += 2) {
            p1x = areaPoints[i];
            p1y = areaPoints[i + 1];
            p2x = areaPoints[(i + 2) % len];
            p2y = areaPoints[(i + 3) % len];
            if (p1y == p2y)
                continue;
            if (p.y < Math.min(p1y, p2y))
                continue;
            if (p.y >= Math.max(p1y, p2y))
                continue;
            var tx = (p.y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x;
            if (tx > p.x)
                nCross++;
        }
        return (nCross % 2 == 1);
    }
    get hit() {
        if (!this._hit)
            this._hit = new ILaya.Graphics();
        return this._hit;
    }
    set hit(value) {
        this._hit = value;
    }
    get unHit() {
        if (!this._unHit)
            this._unHit = new ILaya.Graphics();
        return this._unHit;
    }
    set unHit(value) {
        this._unHit = value;
    }
}
HitArea._cmds = [];
HitArea._rect = new Rectangle();
HitArea._ptPoint = new Point();
