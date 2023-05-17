class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vec2) {
        this.x += vec2.x;
        this.y += vec2.y;
        return this;
    }

    addScalar(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }

    multiply(scalar) {
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
    }
}

export default Vec2;