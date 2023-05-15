class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(x, y) {
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
}

export default Vec2;