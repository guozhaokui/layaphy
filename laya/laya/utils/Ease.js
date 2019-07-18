export class Ease {
    static linearNone(t, b, c, d) {
        return c * t / d + b;
    }
    static linearIn(t, b, c, d) {
        return c * t / d + b;
    }
    static linearInOut(t, b, c, d) {
        return c * t / d + b;
    }
    static linearOut(t, b, c, d) {
        return c * t / d + b;
    }
    static bounceIn(t, b, c, d) {
        return c - Ease.bounceOut(d - t, 0, c, d) + b;
    }
    static bounceInOut(t, b, c, d) {
        if (t < d * 0.5)
            return Ease.bounceIn(t * 2, 0, c, d) * .5 + b;
        else
            return Ease.bounceOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
    static bounceOut(t, b, c, d) {
        if ((t /= d) < (1 / 2.75))
            return c * (7.5625 * t * t) + b;
        else if (t < (2 / 2.75))
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        else if (t < (2.5 / 2.75))
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        else
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
    }
    static backIn(t, b, c, d, s = 1.70158) {
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    }
    static backInOut(t, b, c, d, s = 1.70158) {
        if ((t /= d * 0.5) < 1)
            return c * 0.5 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    }
    static backOut(t, b, c, d, s = 1.70158) {
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    }
    static elasticIn(t, b, c, d, a = 0, p = 0) {
        var s;
        if (t == 0)
            return b;
        if ((t /= d) == 1)
            return b + c;
        if (!p)
            p = d * .3;
        if (!a || (c > 0 && a < c) || (c < 0 && a < -c)) {
            a = c;
            s = p / 4;
        }
        else
            s = p / Ease.PI2 * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * Ease.PI2 / p)) + b;
    }
    static elasticInOut(t, b, c, d, a = 0, p = 0) {
        var s;
        if (t == 0)
            return b;
        if ((t /= d * 0.5) == 2)
            return b + c;
        if (!p)
            p = d * (.3 * 1.5);
        if (!a || (c > 0 && a < c) || (c < 0 && a < -c)) {
            a = c;
            s = p / 4;
        }
        else
            s = p / Ease.PI2 * Math.asin(c / a);
        if (t < 1)
            return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * Ease.PI2 / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * Ease.PI2 / p) * .5 + c + b;
    }
    static elasticOut(t, b, c, d, a = 0, p = 0) {
        var s;
        if (t == 0)
            return b;
        if ((t /= d) == 1)
            return b + c;
        if (!p)
            p = d * .3;
        if (!a || (c > 0 && a < c) || (c < 0 && a < -c)) {
            a = c;
            s = p / 4;
        }
        else
            s = p / Ease.PI2 * Math.asin(c / a);
        return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * Ease.PI2 / p) + c + b);
    }
    static strongIn(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    }
    static strongInOut(t, b, c, d) {
        if ((t /= d * 0.5) < 1)
            return c * 0.5 * t * t * t * t * t + b;
        return c * 0.5 * ((t -= 2) * t * t * t * t + 2) + b;
    }
    static strongOut(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    }
    static sineInOut(t, b, c, d) {
        return -c * 0.5 * (Math.cos(Math.PI * t / d) - 1) + b;
    }
    static sineIn(t, b, c, d) {
        return -c * Math.cos(t / d * Ease.HALF_PI) + c + b;
    }
    static sineOut(t, b, c, d) {
        return c * Math.sin(t / d * Ease.HALF_PI) + b;
    }
    static quintIn(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    }
    static quintInOut(t, b, c, d) {
        if ((t /= d * 0.5) < 1)
            return c * 0.5 * t * t * t * t * t + b;
        return c * 0.5 * ((t -= 2) * t * t * t * t + 2) + b;
    }
    static quintOut(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    }
    static quartIn(t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    }
    static quartInOut(t, b, c, d) {
        if ((t /= d * 0.5) < 1)
            return c * 0.5 * t * t * t * t + b;
        return -c * 0.5 * ((t -= 2) * t * t * t - 2) + b;
    }
    static quartOut(t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    }
    static cubicIn(t, b, c, d) {
        return c * (t /= d) * t * t + b;
    }
    static cubicInOut(t, b, c, d) {
        if ((t /= d * 0.5) < 1)
            return c * 0.5 * t * t * t + b;
        return c * 0.5 * ((t -= 2) * t * t + 2) + b;
    }
    static cubicOut(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    }
    static quadIn(t, b, c, d) {
        return c * (t /= d) * t + b;
    }
    static quadInOut(t, b, c, d) {
        if ((t /= d * 0.5) < 1)
            return c * 0.5 * t * t + b;
        return -c * 0.5 * ((--t) * (t - 2) - 1) + b;
    }
    static quadOut(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    }
    static expoIn(t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b - c * 0.001;
    }
    static expoInOut(t, b, c, d) {
        if (t == 0)
            return b;
        if (t == d)
            return b + c;
        if ((t /= d * 0.5) < 1)
            return c * 0.5 * Math.pow(2, 10 * (t - 1)) + b;
        return c * 0.5 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
    static expoOut(t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    }
    static circIn(t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    }
    static circInOut(t, b, c, d) {
        if ((t /= d * 0.5) < 1)
            return -c * 0.5 * (Math.sqrt(1 - t * t) - 1) + b;
        return c * 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    }
    static circOut(t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    }
}
Ease.HALF_PI = Math.PI * 0.5;
Ease.PI2 = Math.PI * 2;
