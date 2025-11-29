const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { getNextMove } = require('./aiPathFinding');

const app = express();
const server = createServer(app);
app.use(cors(
    {
        origin: 'http://127.0.0.1:5500',
        methods: ['GET', 'POST'],
        credentials: true,
    }
));

const io = new Server(server, {
    cors: {
        origin: 'http://127.0.0.1:5500',
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

let players = {};
let aiPlayer = null;
let obstacles = [];
//Server Side Obstacle Generation
const genrateObstacles = (rows, cols, obstacleCount) => {

    for (let i = 0; i < obstacleCount; i++) {
        const row = Math.floor(Math.random() * (rows - 3)) + 2;
        const col = Math.floor(Math.random() * (cols - 3)) + 2;
        obstacles.push({ row, col });
    }

}

genrateObstacles(27, 27, 75);

const checkAiPlayerPosition = (aiPlayer) => {
    while (true) {
        let isValid = true;
        for (let otherPlayer of Object.values(players)) {
            if (otherPlayer.id !== aiPlayer.id &&
                otherPlayer.row === aiPlayer.row &&
                otherPlayer.col === aiPlayer.col) {
                isValid = false;
                break;
            }
        }
        if (isValid) break;

        // Generate new position
        aiPlayer.row = Math.floor(Math.random() * 27);
        aiPlayer.col = Math.floor(Math.random() * 27);
    }
}

//randomly pick a nearest target based on hamming distance of players
const pickRandomTarget = () => {

    const time=Date.now();

    if(aiPlayer.lockUntil && (aiPlayer.lockUntil > time)){
        return aiPlayer.target;
    }


    if (!aiPlayer || Object.keys(players).length === 0) return null;

    const nearestPlayers = [];

    for (const id in players) {
        const p = players[id];

        const hamming_d =
            Math.abs(p.row - aiPlayer.row) +
            Math.abs(p.col - aiPlayer.col);

        nearestPlayers.push({
            hamming_d,
            player_id: id
        });
    }

    nearestPlayers.sort((a, b) => {
        if (a.hamming_d === b.hamming_d) {
            return a.player_id.localeCompare(b.player_id);
        }
        return a.hamming_d - b.hamming_d;
    });

  
    const chosen = nearestPlayers[0];
    aiPlayer.lockUntil=time+4000;

    return aiPlayer.target=players[chosen.player_id];
};







io.on('connection', (socket) => {
    //Initializing grid and obstacles

    socket.emit('obstacles', obstacles);

    //Initializing player
    console.log('New player connected:', socket.id);
    players[socket.id] = {
        id: socket.id,
        row: Math.floor(Math.random() * 27),
        col: Math.floor(Math.random() * 27),
        imgDirection: 'down'
    }
    //Check if player created is on fresh grid or not otherwise genrate random position till condition is not satisfied
    while (true) {
        let isValid = true;
        for (let otherPlayer of Object.values(players)) {
            if (otherPlayer.id !== socket.id &&
                otherPlayer.row === players[socket.id].row &&
                otherPlayer.col === players[socket.id].col) {
                isValid = false;
                break;
            }
        }
        if (isValid) break;

        // Generate new position
        players[socket.id].row = Math.floor(Math.random() * 27);
        players[socket.id].col = Math.floor(Math.random() * 27);
    }
    //Initializing ai player
    aiPlayer = {
        id: 'aiPlayer',
        row: Math.floor(Math.random() * 27),
        col: Math.floor(Math.random() * 27),
        imgDirection: 'down'
    }
    //Check if ai player created is on fresh grid or not otherwise genrate random position till condition is not satisfied
    checkAiPlayerPosition(aiPlayer);
    //Sending exisitng players to the new player
    socket.emit('yourPlayer', players[socket.id]);
    socket.emit('existingPlayers', players);
    socket.emit('aiPlayer', aiPlayer);
    //Sending new player to all other players
    socket.broadcast.emit('newPlayer', {
        id: socket.id,
        row: players[socket.id].row,
        col: players[socket.id].col,
        imgDirection: players[socket.id].imgDirection
    });
    //Listening for player movement
    socket.on('playerMovement', (data) => {
        if (players[socket.id]) {
            players[socket.id].row = data.row;
            players[socket.id].col = data.col;
            players[socket.id].imgDirection = data.imgDirection;
        }
        socket.broadcast.emit('playerMoved', {
            id: socket.id,
            row: data.row,
            col: data.col,
            imgDirection: data.imgDirection
        });
    })

    //Listening for bullet shooting
    socket.on('shootBullet', (data) => {
        //console.log(data);
        socket.broadcast.emit('otherPlayerBullet', {
            id: socket.id,
            bullet: data.bullet,
            direction: data.direction,
        });
    })

    //Listening for player disconnection
    socket.on('disconnect', () => {
        delete players[socket.id];
        socket.broadcast.emit('playerDisconnected', socket.id);
        console.log('Player disconnected:', socket.id);
    })

    


    setInterval(() => {
        const choosenPlayer = pickRandomTarget();
        if (choosenPlayer) {
            const nextMove = getNextMove(aiPlayer, choosenPlayer, obstacles);
            if (nextMove) {
                aiPlayer.row = nextMove.row;
                aiPlayer.col = nextMove.col;
                io.emit('aiPlayerMoved', aiPlayer);
            }
        }
    }, 500)

})

server.listen(5000, () => {
    console.log('Server is running on port 5000');
})

module.exports = {
    obstacles,
    aiPlayer
}
