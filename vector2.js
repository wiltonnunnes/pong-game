class Vector2 {
    static left = new Vector2(-1, 0);

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
        return this.multiply(-1);
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
        return this;
    }
}

export default Vector2;