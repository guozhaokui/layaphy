export class Pool {
    static getPoolBySign(sign) {
        return Pool._poolDic[sign] || (Pool._poolDic[sign] = []);
    }
    static clearBySign(sign) {
        if (Pool._poolDic[sign])
            Pool._poolDic[sign].length = 0;
    }
    static recover(sign, item) {
        if (item[Pool.POOLSIGN])
            return;
        item[Pool.POOLSIGN] = true;
        Pool.getPoolBySign(sign).push(item);
    }
    static recoverByClass(instance) {
        if (instance) {
            var className = instance["__className"] || instance.constructor._$gid;
            if (className)
                Pool.recover(className, instance);
        }
    }
    static _getClassSign(cla) {
        var className = cla["__className"] || cla["_$gid"];
        if (!className) {
            cla["_$gid"] = className = Pool._CLSID + "";
            Pool._CLSID++;
        }
        return className;
    }
    static createByClass(cls) {
        return Pool.getItemByClass(Pool._getClassSign(cls), cls);
    }
    static getItemByClass(sign, cls) {
        if (!Pool._poolDic[sign])
            return new cls();
        var pool = Pool.getPoolBySign(sign);
        if (pool.length) {
            var rst = pool.pop();
            rst[Pool.POOLSIGN] = false;
        }
        else {
            rst = new cls();
        }
        return rst;
    }
    static getItemByCreateFun(sign, createFun, caller = null) {
        var pool = Pool.getPoolBySign(sign);
        var rst = pool.length ? pool.pop() : createFun.call(caller);
        rst[Pool.POOLSIGN] = false;
        return rst;
    }
    static getItem(sign) {
        var pool = Pool.getPoolBySign(sign);
        var rst = pool.length ? pool.pop() : null;
        if (rst) {
            rst[Pool.POOLSIGN] = false;
        }
        return rst;
    }
}
Pool._CLSID = 0;
Pool.POOLSIGN = "__InPool";
Pool._poolDic = {};
