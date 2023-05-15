const connect = (callback) => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.addEventListener('open', (event) => {
        callback(socket);
    });
};

let isConnected = false;

const handleSubmit = (event) => {
    event.preventDefault();

    let nick = document.getElementById('nick');
    connect((socket) => {
        isConnected = true;
        socket.send(nick.value);
    });

    nick.value = "";
};

const canvasWidth = 864;
const canvasHeight = 600;

const gameState = {
    running: false,
    player1YPos: canvasWidth / 2 - 64,
    player2YPos: canvasWidth / 2 - 64,
    ballPos: [canvasWidth / 2 - 16, canvasHeight / 2 - 16],
    message: ""
};

let canvas = document.getElementById('gameCanvas');
let context = canvas.getContext('2d');

context.fillStyle = 'green';
context.fillRect(0, 0, 32, 600);
context.fillRect(832, 0, 32, 600);

const render = () => {
    context.clearRect(32, 0, canvasWidth - 64, canvasHeight);
    context.fillRect(64, gameState.player1YPos, 32, 128);
    context.fillRect(canvasWidth - 3 * 32, gameState.player2YPos, 32, 128);
    context.fillRect(gameState.ballPos[0], gameState.ballPos[1], 32, 32);

    if (!gameState.running) {
        context.font = "30px Arial";
        context.textAlign = "center";
        context.fillText(gameState.message, canvasWidth / 2, canvasHeight - 64);
    }
};

const socket = new WebSocket('ws://localhost:8080');
socket.addEventListener('open', (event) => {
    
});

socket.addEventListener('message', (event) => {
    const object = JSON.parse(event.data);
    console.log(event.data);

    gameState.running = object.running;
    gameState.player1YPos = object.player1YPos;
    gameState.player2YPos = object.player2YPos;
    gameState.ballPos = object.ballPos;
    gameState.message = object.message;

    render();
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        socket.send('-1');
    } else if (event.key === 'ArrowDown') {
        socket.send('1')
    }
});

window.addEventListener('beforeunload', (event) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
});