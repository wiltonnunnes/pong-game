import { WebSocketServer } from "ws";
import http from 'http';
import fs from 'fs';

const hostname = '127.0.0.1';
const port = 3000;

const customReadFile = (filePath, res) => {
    fs.readFile(filePath, (err, data) => {
        res.statusCode = 200;
        res.write(data);
        return res.end();
    });
}

const server = http.createServer((req, res) => {
    let url = req.url;
    if (url.indexOf('.') == -1) {
        res.setHeader('Content-Type', 'text/html');
        customReadFile('index.htm', res);
    } else if (url.indexOf('.css') != -1) {
        res.setHeader('Content-Type', 'text/css');
        customReadFile(`public/css${url}`, res);
    } else if (url.indexOf('.js') != -1) {
        res.setHeader('Content-Type', 'text/javascript');
        customReadFile(`public/js${url}`, res);
    } else {

    }
});

import Vec2 from "./vec2.js";

const MAXBOUNCEANGLE = 5 * Math.PI / 12;
const PADDLEHEIGHT = 128;

const speed = 20;

let socket1 = null;
let socket2 = null;

const courtDimension = [864, 600];

const paddle1 = {
    x: 64,
    y: courtDimension[1] / 2 - 64,
    w: 32,
    h: 128
};

const paddle2 = {
    x: courtDimension[0] - 96,
    y: courtDimension[1] / 2 - 64,
    w: 32,
    h: 128
};

const ball = {
    x: courtDimension[0] / 2 - 16,
    y: courtDimension[1] / 2 - 16,
    w: 32,
    h: 32,
    v: new Vec2(-1, 0).multiply(speed)
};

const createState = () => {
    if (socket2 !== null) {
        return {
            running: true,
            player1YPos: paddle1.y,
            player2YPos: paddle2.y,
            ballPos: [ball.x, ball.y],
            message: ""
        };
    } else {
        return {
            running: false,
            player1YPos: courtDimension[1] / 2 - 64,
            player2YPos: courtDimension[1] / 2 - 64,
            ballPos: [courtDimension[0] / 2 - 16, courtDimension[1] / 2 - 16],
            message: "Esperando por um Adversário"
        }
    }
};

const detectCollision = (x1, w1, x2, w2) => {
    return (x1 <= x2 + w2 && x1 + w1 >= x2);
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

const clamp = (value, min, max) => {
    if (value < min)
        return min;
    else if (value > max)
        return max;
    else
        return value;
};

const webSocketServer = new WebSocketServer({ port: 8080 });

webSocketServer.on('connection', (socket) => {
    let paddle;
    const state = JSON.stringify(createState());
    if (socket1 === null) {
        socket1 = socket;
        socket.send(state);
        paddle = paddle1;
    } else {
        socket2 = socket;
        socket.send(state);
        socket1.send(state);
        paddle = paddle2;
    }

    socket.on('message', (msg) => {
        paddle.y = clamp(paddle.y + parseInt(msg) * speed, 0, courtDimension[1] - paddle.h);
        socket1.send(JSON.stringify(createState()));
        if (socket2 !== null)
            socket2.send(JSON.stringify(createState()));
    });

    socket.on('close', () => {
        socket = null;
        broadcast(JSON.stringify(createState()));
    });
});

let frame = 1000 / 60;
let loop = () => {
    if (socket1 !== null && socket2 !== null) {
        if (detectCollision(ball.x, ball.w, paddle1.x, paddle1.w)) {
            ball.v.rotate(calcBounceAngle(paddle1.y, ball.y + ball.h / 2));
        }
        if (detectCollision(ball.x, ball.w, paddle2.x, paddle2.w)) {
            ball.v.rotate(calcBounceAngle(paddle2.y, ball.y + ball.h / 2));
        }

        ball.x += ball.v.x;
        ball.y += ball.v.y;
        broadcast(JSON.stringify(createState()));
    }

    setTimeout(loop, frame);
};
setTimeout(loop, frame);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
