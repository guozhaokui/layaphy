import { EarcutNode } from "./EarcutNode";
export class Earcut {
    static earcut(data, holeIndices, dim) {
        dim = dim || 2;
        var hasHoles = holeIndices && holeIndices.length, outerLen = hasHoles ? holeIndices[0] * dim : data.length, outerNode = Earcut.linkedList(data, 0, outerLen, dim, true), triangles = [];
        if (!outerNode)
            return triangles;
        var minX, minY, maxX, maxY, x, y, invSize;
        if (hasHoles)
            outerNode = Earcut.eliminateHoles(data, holeIndices, outerNode, dim);
        if (data.length > 80 * dim) {
            minX = maxX = data[0];
            minY = maxY = data[1];
            for (var i = dim; i < outerLen; i += dim) {
                x = data[i];
                y = data[i + 1];
                if (x < minX)
                    minX = x;
                if (y < minY)
                    minY = y;
                if (x > maxX)
                    maxX = x;
                if (y > maxY)
                    maxY = y;
            }
            invSize = Math.max(maxX - minX, maxY - minY);
            invSize = invSize !== 0 ? 1 / invSize : 0;
        }
        Earcut.earcutLinked(outerNode, triangles, dim, minX, minY, invSize);
        return triangles;
    }
    static linkedList(data, start, end, dim, clockwise) {
        var i, last;
        if (clockwise === (Earcut.signedArea(data, start, end, dim) > 0)) {
            for (i = start; i < end; i += dim)
                last = Earcut.insertNode(i, data[i], data[i + 1], last);
        }
        else {
            for (i = end - dim; i >= start; i -= dim)
                last = Earcut.insertNode(i, data[i], data[i + 1], last);
        }
        if (last && Earcut.equals(last, last.next)) {
            Earcut.removeNode(last);
            last = last.next;
        }
        return last;
    }
    static filterPoints(start, end) {
        if (!start)
            return start;
        if (!end)
            end = start;
        var p = start, again;
        do {
            again = false;
            if (!p.steiner && (Earcut.equals(p, p.next) || Earcut.area(p.prev, p, p.next) === 0)) {
                Earcut.removeNode(p);
                p = end = p.prev;
                if (p === p.next)
                    break;
                again = true;
            }
            else {
                p = p.next;
            }
        } while (again || p !== end);
        return end;
    }
    static earcutLinked(ear, triangles, dim, minX, minY, invSize, pass = null) {
        if (!ear)
            return;
        if (!pass && invSize)
            Earcut.indexCurve(ear, minX, minY, invSize);
        var stop = ear, prev, next;
        while (ear.prev !== ear.next) {
            prev = ear.prev;
            next = ear.next;
            if (invSize ? Earcut.isEarHashed(ear, minX, minY, invSize) : Earcut.isEar(ear)) {
                triangles.push(prev.i / dim);
                triangles.push(ear.i / dim);
                triangles.push(next.i / dim);
                Earcut.removeNode(ear);
                ear = next.next;
                stop = next.next;
                continue;
            }
            ear = next;
            if (ear === stop) {
                if (!pass) {
                    Earcut.earcutLinked(Earcut.filterPoints(ear, null), triangles, dim, minX, minY, invSize, 1);
                }
                else if (pass === 1) {
                    ear = Earcut.cureLocalIntersections(ear, triangles, dim);
                    Earcut.earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
                }
                else if (pass === 2) {
                    Earcut.splitEarcut(ear, triangles, dim, minX, minY, invSize);
                }
                break;
            }
        }
    }
    static isEar(ear) {
        var a = ear.prev, b = ear, c = ear.next;
        if (Earcut.area(a, b, c) >= 0)
            return false;
        var p = ear.next.next;
        while (p !== ear.prev) {
            if (Earcut.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                Earcut.area(p.prev, p, p.next) >= 0)
                return false;
            p = p.next;
        }
        return true;
    }
    static isEarHashed(ear, minX, minY, invSize) {
        var a = ear.prev, b = ear, c = ear.next;
        if (Earcut.area(a, b, c) >= 0)
            return false;
        var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x), minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y), maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x), maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);
        var minZ = Earcut.zOrder(minTX, minTY, minX, minY, invSize), maxZ = Earcut.zOrder(maxTX, maxTY, minX, minY, invSize);
        var p = ear.nextZ;
        while (p && p.z <= maxZ) {
            if (p !== ear.prev && p !== ear.next &&
                Earcut.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                Earcut.area(p.prev, p, p.next) >= 0)
                return false;
            p = p.nextZ;
        }
        p = ear.prevZ;
        while (p && p.z >= minZ) {
            if (p !== ear.prev && p !== ear.next &&
                Earcut.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
                Earcut.area(p.prev, p, p.next) >= 0)
                return false;
            p = p.prevZ;
        }
        return true;
    }
    static cureLocalIntersections(start, triangles, dim) {
        var p = start;
        do {
            var a = p.prev, b = p.next.next;
            if (!Earcut.equals(a, b) && Earcut.intersects(a, p, p.next, b) && Earcut.locallyInside(a, b) && Earcut.locallyInside(b, a)) {
                triangles.push(a.i / dim);
                triangles.push(p.i / dim);
                triangles.push(b.i / dim);
                Earcut.removeNode(p);
                Earcut.removeNode(p.next);
                p = start = b;
            }
            p = p.next;
        } while (p !== start);
        return p;
    }
    static splitEarcut(start, triangles, dim, minX, minY, invSize) {
        var a = start;
        do {
            var b = a.next.next;
            while (b !== a.prev) {
                if (a.i !== b.i && Earcut.isValidDiagonal(a, b)) {
                    var c = Earcut.splitPolygon(a, b);
                    a = Earcut.filterPoints(a, a.next);
                    c = Earcut.filterPoints(c, c.next);
                    Earcut.earcutLinked(a, triangles, dim, minX, minY, invSize);
                    Earcut.earcutLinked(c, triangles, dim, minX, minY, invSize);
                    return;
                }
                b = b.next;
            }
            a = a.next;
        } while (a !== start);
    }
    static eliminateHoles(data, holeIndices, outerNode, dim) {
        var queue = [], i, len, start, end, list;
        for (i = 0, len = holeIndices.length; i < len; i++) {
            start = holeIndices[i] * dim;
            end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            list = Earcut.linkedList(data, start, end, dim, false);
            if (list === list.next)
                list.steiner = true;
            queue.push(Earcut.getLeftmost(list));
        }
        queue.sort(Earcut.compareX);
        for (i = 0; i < queue.length; i++) {
            Earcut.eliminateHole(queue[i], outerNode);
            outerNode = Earcut.filterPoints(outerNode, outerNode.next);
        }
        return outerNode;
    }
    static compareX(a, b) {
        return a.x - b.x;
    }
    static eliminateHole(hole, outerNode) {
        outerNode = Earcut.findHoleBridge(hole, outerNode);
        if (outerNode) {
            var b = Earcut.splitPolygon(outerNode, hole);
            Earcut.filterPoints(b, b.next);
        }
    }
    static findHoleBridge(hole, outerNode) {
        var p = outerNode, hx = hole.x, hy = hole.y, qx = -Infinity, m;
        do {
            if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
                var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
                if (x <= hx && x > qx) {
                    qx = x;
                    if (x === hx) {
                        if (hy === p.y)
                            return p;
                        if (hy === p.next.y)
                            return p.next;
                    }
                    m = p.x < p.next.x ? p : p.next;
                }
            }
            p = p.next;
        } while (p !== outerNode);
        if (!m)
            return null;
        if (hx === qx)
            return m.prev;
        var stop = m, mx = m.x, my = m.y, tanMin = Infinity, tan;
        p = m.next;
        while (p !== stop) {
            if (hx >= p.x && p.x >= mx && hx !== p.x &&
                Earcut.pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
                tan = Math.abs(hy - p.y) / (hx - p.x);
                if ((tan < tanMin || (tan === tanMin && p.x > m.x)) && Earcut.locallyInside(p, hole)) {
                    m = p;
                    tanMin = tan;
                }
            }
            p = p.next;
        }
        return m;
    }
    static indexCurve(start, minX, minY, invSize) {
        var p = start;
        do {
            if (p.z === null)
                p.z = Earcut.zOrder(p.x, p.y, minX, minY, invSize);
            p.prevZ = p.prev;
            p.nextZ = p.next;
            p = p.next;
        } while (p !== start);
        p.prevZ.nextZ = null;
        p.prevZ = null;
        Earcut.sortLinked(p);
    }
    static sortLinked(list) {
        var i, p, q, e, tail, numMerges, pSize, qSize, inSize = 1;
        do {
            p = list;
            list = null;
            tail = null;
            numMerges = 0;
            while (p) {
                numMerges++;
                q = p;
                pSize = 0;
                for (i = 0; i < inSize; i++) {
                    pSize++;
                    q = q.nextZ;
                    if (!q)
                        break;
                }
                qSize = inSize;
                while (pSize > 0 || (qSize > 0 && q)) {
                    if (pSize !== 0 && (qSize === 0 || !q || p.z <= q.z)) {
                        e = p;
                        p = p.nextZ;
                        pSize--;
                    }
                    else {
                        e = q;
                        q = q.nextZ;
                        qSize--;
                    }
                    if (tail)
                        tail.nextZ = e;
                    else
                        list = e;
                    e.prevZ = tail;
                    tail = e;
                }
                p = q;
            }
            tail.nextZ = null;
            inSize *= 2;
        } while (numMerges > 1);
        return list;
    }
    static zOrder(x, y, minX, minY, invSize) {
        x = 32767 * (x - minX) * invSize;
        y = 32767 * (y - minY) * invSize;
        x = (x | (x << 8)) & 0x00FF00FF;
        x = (x | (x << 4)) & 0x0F0F0F0F;
        x = (x | (x << 2)) & 0x33333333;
        x = (x | (x << 1)) & 0x55555555;
        y = (y | (y << 8)) & 0x00FF00FF;
        y = (y | (y << 4)) & 0x0F0F0F0F;
        y = (y | (y << 2)) & 0x33333333;
        y = (y | (y << 1)) & 0x55555555;
        return x | (y << 1);
    }
    static getLeftmost(start) {
        var p = start, leftmost = start;
        do {
            if (p.x < leftmost.x)
                leftmost = p;
            p = p.next;
        } while (p !== start);
        return leftmost;
    }
    static pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
        return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
            (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
            (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
    }
    static isValidDiagonal(a, b) {
        return a.next.i !== b.i && a.prev.i !== b.i && !Earcut.intersectsPolygon(a, b) &&
            Earcut.locallyInside(a, b) && Earcut.locallyInside(b, a) && Earcut.middleInside(a, b);
    }
    static area(p, q, r) {
        return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    }
    static equals(p1, p2) {
        return p1.x === p2.x && p1.y === p2.y;
    }
    static intersects(p1, q1, p2, q2) {
        if ((Earcut.equals(p1, q1) && Earcut.equals(p2, q2)) ||
            (Earcut.equals(p1, q2) && Earcut.equals(p2, q1)))
            return true;
        return Earcut.area(p1, q1, p2) > 0 !== Earcut.area(p1, q1, q2) > 0 &&
            Earcut.area(p2, q2, p1) > 0 !== Earcut.area(p2, q2, q1) > 0;
    }
    static intersectsPolygon(a, b) {
        var p = a;
        do {
            if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                Earcut.intersects(p, p.next, a, b))
                return true;
            p = p.next;
        } while (p !== a);
        return false;
    }
    static locallyInside(a, b) {
        return Earcut.area(a.prev, a, a.next) < 0 ?
            Earcut.area(a, b, a.next) >= 0 && Earcut.area(a, a.prev, b) >= 0 :
            Earcut.area(a, b, a.prev) < 0 || Earcut.area(a, a.next, b) < 0;
    }
    static middleInside(a, b) {
        var p = a, inside = false, px = (a.x + b.x) / 2, py = (a.y + b.y) / 2;
        do {
            if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
                (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
                inside = !inside;
            p = p.next;
        } while (p !== a);
        return inside;
    }
    static splitPolygon(a, b) {
        var a2 = new EarcutNode(a.i, a.x, a.y), b2 = new EarcutNode(b.i, b.x, b.y), an = a.next, bp = b.prev;
        a.next = b;
        b.prev = a;
        a2.next = an;
        an.prev = a2;
        b2.next = a2;
        a2.prev = b2;
        bp.next = b2;
        b2.prev = bp;
        return b2;
    }
    static insertNode(i, x, y, last) {
        var p = new EarcutNode(i, x, y);
        if (!last) {
            p.prev = p;
            p.next = p;
        }
        else {
            p.next = last.next;
            p.prev = last;
            last.next.prev = p;
            last.next = p;
        }
        return p;
    }
    static removeNode(p) {
        p.next.prev = p.prev;
        p.prev.next = p.next;
        if (p.prevZ)
            p.prevZ.nextZ = p.nextZ;
        if (p.nextZ)
            p.nextZ.prevZ = p.prevZ;
    }
    static signedArea(data, start, end, dim) {
        var sum = 0;
        for (var i = start, j = end - dim; i < end; i += dim) {
            sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
            j = i;
        }
        return sum;
    }
}
