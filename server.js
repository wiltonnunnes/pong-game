import Vector2 from "./vector2.js";
import { clampNumber } from "./math-utils.js";
import { WebSocketServer } from "ws";

const MAXBOUNCEANGLE = 5 * Math.PI / 12;
const PADDLEHEIGHT = 128;
const PADDLEWIDTH = 32;
const COURTWIDTH = 864;
const COURTHEIGHT = 600;
const BALLRADIUS = 32;

const paddleSpeed = 10;
const ballSpeed = 10;

let socket1 = null;
let socket2 = null;

let points1 = 0;
let points2 = 0;

const maxPoints = 10;

const paddle1 = {
    position: new Vector2(PADDLEWIDTH * 2, COURTHEIGHT / 2 - PADDLEHEIGHT / 2), 
    scale: new Vector2(PADDLEWIDTH, PADDLEHEIGHT)
};

const paddle2 = {
    position: new Vector2(COURTWIDTH - PADDLEWIDTH * 3, COURTHEIGHT / 2 - PADDLEHEIGHT / 2), 
    scale: new Vector2(PADDLEWIDTH, PADDLEHEIGHT)
};

const ball = {
    position: new Vector2(COURTWIDTH / 2 - BALLRADIUS / 2, COURTHEIGHT / 2 - BALLRADIUS / 2),
    scale: new Vector2(BALLRADIUS, BALLRADIUS)
};

const court = {
    position: new Vector2(PADDLEWIDTH, 0),
    scale: new Vector2(COURTWIDTH - PADDLEWIDTH * 2, COURTHEIGHT)
};

const topLine = {
    position: new Vector2(PADDLEWIDTH, -1),
    scale: new Vector2(COURTWIDTH - PADDLEWIDTH * 2, 0)
};

const bottomLine = {
    position: new Vector2(PADDLEWIDTH, COURTHEIGHT + 1),
    scale: new Vector2(COURTWIDTH - PADDLEWIDTH * 2, 0)
};

const leftLine = {
    position: new Vector2(-1, 0),
    scale: new Vector2(0, COURTHEIGHT)
};

const rightLine = {
    position: new Vector2(COURTWIDTH + 1, 0),
    scale: new Vector2(0, COURTHEIGHT)
};

let ballVelocity = new Vector2(-ballSpeed, 0);

const createState = () => {
    if (socket2 !== null) {
        return {
            running: true,
            paddle1YPos: paddle1.position.y,
            paddle2YPos: paddle2.position.y,
            ballPos: [ball.position.x, ball.position.y],
            message: "",
            points1: points1,
            points2: points2
        };
    } else {
        return {
            running: false,
            paddle1YPos: COURTHEIGHT / 2 - PADDLEHEIGHT / 2,
            paddle2YPos: COURTHEIGHT / 2 - PADDLEHEIGHT / 2,
            ballPos: [COURTWIDTH / 2 - BALLRADIUS / 2, COURTHEIGHT / 2 - BALLRADIUS / 2],
            message: "Esperando por um Adversário",
            points1: points1,
            points2: points2
        }
    }
};

const checkCollision = (obj1, obj2) => {
    return (
        obj1.position.x < obj2.position.x + obj2.scale.x && 
        obj1.position.x + obj1.scale.x > obj2.position.x && 
        obj1.position.y < obj2.position.y + obj2.scale.y && 
        obj1.position.y + obj1.scale.y > obj2.position.y
    );
};

const calcBounceAngle = (paddleY, intersectY) => {
    let relativeIntersectY = paddleY + PADDLEHEIGHT / 2 - intersectY;
    let normalizedRelativeIntersectY = relativeIntersectY / (PADDLEHEIGHT / 2);
    return normalizedRelativeIntersectY * MAXBOUNCEANGLE;
};

const broadcast = (msg) => {
    if (socket1 != null && socket1.readyState === socket1.OPEN) {
        socket1.send(msg);
    }
    if (socket2 != null && socket2.readyState === socket2.OPEN) {
        socket2.send(msg);
    }
};

const randomUnitVector = () => {
    
};

const maxClients = 2;
let rooms = {};

const webSocketServer = new WebSocketServer({ port: 8080 });

webSocketServer.on('connection', (socket) => {
    socket.send(JSON.stringify(createState()));
    let paddle;
    if (socket1 === null) {
        socket1 = socket;
        paddle = paddle1;
    } else {
        socket2 = socket;
        paddle = paddle2;
    }

    socket.on('message', (mouseY) => {
        paddle.position.setY(clampNumber(paddle.position.y + parseInt(mouseY) * paddleSpeed, 0, COURTHEIGHT - paddle.scale.y));
        broadcast(JSON.stringify(createState()));
    });

    socket.on('close', () => {
        if (socket === socket1) {
            socket1 = null;
        } else {
            socket2 = null;
        }
        broadcast(JSON.stringify(createState()));
    });

    const genKey = (length) => {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const createRoom = () => {
        const room = genKey(5);
        rooms[room] = [socket];
    };
});

let frame = 1000 / 60;
let loop = () => {
    if (socket1 !== null && socket2 !== null) {
        if (checkCollision(ball, paddle1) && ballVelocity.x < 0) {
            ballVelocity.rotate(calcBounceAngle(paddle1.position.y, ball.position.y + ball.scale.y / 2));
            ballVelocity.multiply(new Vector2(-1, 1));
        }
        if (checkCollision(ball, paddle2) && ballVelocity.x > 0) {
            ballVelocity.rotate(calcBounceAngle(paddle2.position.y, ball.position.y + ball.scale.y / 2));
            ballVelocity.multiply(new Vector2(-1, -1));
        }
        if (checkCollision(ball, topLine)) {
            ballVelocity.multiply(new Vector2(1, -1));
        }
        if (checkCollision(ball, bottomLine)) {
            ballVelocity.multiply(new Vector2(1, -1));
        }
        if (checkCollision(ball, leftLine)) {
            points2 += 1;
            ballVelocity = new Vector2(-ballSpeed, 0);
            ball.position = new Vector2(COURTWIDTH / 2 - BALLRADIUS / 2, COURTHEIGHT / 2 - BALLRADIUS / 2);
        }
        if (checkCollision(ball, rightLine)) {
            points1 += 1;
            ballVelocity = new Vector2(-ballSpeed, 0);
            ball.position = new Vector2(COURTWIDTH / 2 - BALLRADIUS / 2, COURTHEIGHT / 2 - BALLRADIUS / 2);
        }

        ball.position.add(ballVelocity);
        broadcast(JSON.stringify(createState()));
    }

    setTimeout(loop, frame);
};
setTimeout(loop, frame);