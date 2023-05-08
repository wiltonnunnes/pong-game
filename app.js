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
    v: [-1, 0]
};

const createState = () => {
    return {
        player1YPos: paddle1.y,
        player2YPos: paddle2.y,
        ballPos: [ball.x, ball.y]
    };
};

const detectCollision = (x1, w1, x2, w2) => {
    return (x1 <= x2 + w2 && x1 + w1 >= x2);
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
    if (socket1 === null) {
        socket1 = socket;
        socket.send(JSON.stringify(createState()));
        paddle = paddle1;
    } else {
        socket2 = socket;
        socket.send(JSON.stringify(createState()));
        socket1.send(JSON.stringify(createState()));
        paddle = paddle2;
    }

    socket.on('message', (msg) => {
        paddle.y = clamp(paddle.y + parseInt(msg) * speed, 0, courtDimension[1] - paddle.h);
        socket1.send(JSON.stringify(createState()));
        if (socket2 !== null)
            socket2.send(JSON.stringify(createState()));
    });
});

let frame = 10000 / 60;
let loop = () => {
    if (detectCollision(ball.x, ball.w, paddle1.x, paddle1.w)) {
        ball.v[0] *= -1;
        ball.v[1] *= ball.y + ball.h / 2 - paddle1.y + paddle1.h / 2;
    }
    if (detectCollision(ball.x, ball.w, paddle2.x, paddle2.w)) {
        ball.v[0] *= -1;
        ball.v[1] *= (ball.y + ball.h / 2) - (paddle2.y + paddle2.h / 2);
    }

    ball.x += ball.v[0] * speed;
    ball.y += ball.v[1] * speed;
    if (socket1 !== null) {
        socket1.send(JSON.stringify(createState()));
    }
    if (socket2 !== null)
        socket2.send(JSON.stringify(createState()));
    setTimeout(loop, frame);
};
setTimeout(loop, frame);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
