import { clampNumber } from "./math-utils.js";

class Vector2 {
    static left = new Vector2(-1, 0);
    static zero = new Vector2(0, 0);

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    addScalar(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }

    multiply(v) {
        this.x *= v.x;
        this.y *= v.y;
        return this;
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    rotate(radians) {
        this.x = Math.cos(radians) * this.x - Math.sin(radians) * this.y;
        this.y = Math.sin(radians) * this.x - Math.cos(radians) * this.y;
        return this;
    }

    negate() {
        return this.multiplyScalar(-1);
    }

    clampScalar(min, max) {
        if (this.x > max)
            this.x = max;
        else if (this.x < min)
            this.x = min;

        if (this.y > max)
            this.y = max;
        else if (this.y < min)
            this.y = min;
        return this;
    }

    clamp(min, max) {
        this.x = clampNumber(this.x, min.x, max.x);
        this.y = clampNumber(this.y, min.y, max.y);
        return this;
    }

    setY(y) {
        this.y = y;
        return this;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
}

export default Vector2;