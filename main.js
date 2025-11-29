import Grid from './scripts/grid.js';
import Obstacle from './scripts/obstacle.js';
import Player from './scripts/player.js';
import Bullet from './scripts/bullet.js';
import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";



//handling socket connection and functionalities
export const socket = io('http://localhost:5000');
socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id);
});

export const otherPlayers = {};
let bullets = []
let otherPlayerBullets = [];
let isPlayerInitialized = false;
let isAiPlayerInitialized = false;
let isObstacleInitialized = false;
let gameLoopStarted = false;
let isAllImagesLoaded = false;


const canvas = document.getElementById('game-canvas');
export const ctx = canvas.getContext('2d');


const CELL_SIZE = 18;
const GRID_ROWS = Math.floor(canvas.height / CELL_SIZE);
const GRID_COLS = Math.floor(canvas.width / CELL_SIZE);



const grid = new Grid(GRID_ROWS, GRID_COLS);


//images 

const GridTileImage = new Image();
GridTileImage.src = '../assets/grid/GridTile.png';

const BoundaryTileImage = new Image();
BoundaryTileImage.src = '../assets/grid/boundaryTile.png';

const ObstacleImage1 = new Image();
ObstacleImage1.src = '../assets/obstacles/Tree1.png';

const ObstacleImage2 = new Image();
ObstacleImage2.src = '../assets/obstacles/Tree2.png';

const ObstacleImage3 = new Image();
ObstacleImage3.src = '../assets/obstacles/Tree3.png';


const PlayerImage_Up = new Image();
PlayerImage_Up.src = '../assets/players/P1_Up.png';

const PlayerImage_Down = new Image();
PlayerImage_Down.src = '../assets/players/P1_Down.png';


const PlayerImage_Left = new Image();
PlayerImage_Left.src = '../assets/players/P1_Left.png';

const PlayerImage_Right = new Image();
PlayerImage_Right.src = '../assets/players/P1_Right.png';

const CPUImage_Up = new Image();
CPUImage_Up.src = '../assets/players/CPU_Up.png';

const CPUImage_Down = new Image();
CPUImage_Down.src = '../assets/players/CPU_Down.png';


const CPUImage_Left = new Image();
CPUImage_Left.src = '../assets/players/CPU_Left.png';

const CPUImage_Right = new Image();
CPUImage_Right.src = '../assets/players/CPU_Right.png';



//obstacle array and images loading


export let obstacles = null;
let player = null;
let aiPlayer = null;



Promise.all([
    new Promise((resolve) => {
        GridTileImage.onload = resolve
    }),
    new Promise((resolve) => {
        BoundaryTileImage.onload = resolve
    }),
    new Promise((resolve) => {
        ObstacleImage1.onload = resolve
    }),
    new Promise((resolve) => {
        ObstacleImage2.onload = resolve
    }),
    new Promise((resolve) => {
        ObstacleImage3.onload = resolve
    }),
    new Promise((resolve) => {
        PlayerImage_Up.onload = resolve
    }),
    new Promise((resolve) => {
        PlayerImage_Down.onload = resolve
    }),
    new Promise((resolve) => {
        PlayerImage_Left.onload = resolve
    }),
    new Promise((resolve) => {
        PlayerImage_Right.onload = resolve
    }),


]).then(() => {
    grid.setImage(GridTileImage);
    grid.setBoundaryImage(BoundaryTileImage);
    isAllImagesLoaded = true;
    tryStartGameLoop();

})

//shrinkGrid function

let isShrinking = false;
// setInterval(()=>{

//     isShrinking=true;
// },3000)


function tryStartGameLoop() {
    if (isPlayerInitialized && isObstacleInitialized && isAiPlayerInitialized && !gameLoopStarted && isAllImagesLoaded) {
        gameLoopStarted = true;
        gameLoop();
    }
}

function gameLoop() {
    if (!isPlayerInitialized || !isObstacleInitialized || !isAiPlayerInitialized) return;
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isShrinking) {
        grid.shrinkGrid();
        isShrinking = false;
    }

    grid.draw();
    if (obstacles) {
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].draw();
        }
    }
    player.draw();
    aiPlayer.draw();
    Object.values(otherPlayers).forEach((otherPlayer) => {
        otherPlayer.draw();
    })

    for (let i = 0; i < bullets.length; i++) {
        console.log(bullets[i]);
        const bullet = bullets[i].bullet;
        const direction = bullets[i].direction;
        const collision = bullet.shoot(direction, grid, obstacles, otherPlayers);
        bullet.draw();
        if (!collision) {
            bullets.splice(i, 1);
            continue;
        }

    }

    for (let i = 0; i < otherPlayerBullets.length; i++) {
        console.log(otherPlayerBullets[i]);
        const bullet = otherPlayerBullets[i].bullet;
        const direction = otherPlayerBullets[i].direction;
        //otherPlayers consists of all other players except the socketPlayer who had shoot and the current player who is shooting
        const otherPlayerId = otherPlayerBullets[i].id;
        const filteredOtherPlayers = {};
        for (const playerId in otherPlayers) {
            if (playerId === otherPlayerId) continue;
            filteredOtherPlayers[playerId] = otherPlayers[playerId];
        }
        //adding current player to filteredOtherPlayers
        filteredOtherPlayers[socket.id] = player;
        const collision = bullet.shoot(direction, grid, obstacles, filteredOtherPlayers);
        bullet.draw();
        if (!collision) {
            otherPlayerBullets.splice(i, 1);
            continue;
        }

    }



    requestAnimationFrame(gameLoop);
}


//Player movement
document.addEventListener('keydown', (event) => {
    if (!obstacles) return;
    switch (event.key) {
        case 'ArrowUp':
            player.move(0, -1, obstacles, grid, PlayerImage_Up);
            break;
        case 'ArrowDown':
            player.move(0, 1, obstacles, grid, PlayerImage_Down);
            break;
        case 'ArrowLeft':
            player.move(-1, 0, obstacles, grid, PlayerImage_Left);
            break;
        case 'ArrowRight':
            player.move(1, 0, obstacles, grid, PlayerImage_Right);
            break;
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        //console.log('shooting bullet');
        console.log(player.row, player.col);
        const bullet = new Bullet(player.col, player.row);
        //bullet.draw();
        const direction = player.img.src.includes('Up') ? 'up' : player.img.src.includes('Down') ? 'down' : player.img.src.includes('Left') ? 'left' : 'right';
        bullets.push({ bullet, direction });
        socket.emit('shootBullet', { bullet, direction });
    }
})

socket.on('otherPlayerBullet', (data) => {
    console.log(data);
    const bullet = new Bullet(data.bullet.x, data.bullet.y);
    const direction = data.direction;
    const id = data.id;
    otherPlayerBullets.push({ bullet, direction, id });
})


socket.on('yourPlayer', (playerData) => {
    player = new Player(playerData.row, playerData.col, PlayerImage_Down);
    isPlayerInitialized = true;
    tryStartGameLoop();
})

socket.on('aiPlayer', (aiPlayerData) => {
    aiPlayer = new Player(aiPlayerData.row, aiPlayerData.col, CPUImage_Down);
    otherPlayers[aiPlayerData.id] = aiPlayer;
    isAiPlayerInitialized = true;
    tryStartGameLoop();
})

socket.on('aiPlayerMoved', (aiPlayerData) => {
    //initial ai player position
    let initialAiPlayerRow=aiPlayer.row;
    let initialAiPlayerCol=aiPlayer.col;
    //current ai player position
    let currentAiPlayerRow=aiPlayerData.row;
    let currentAiPlayerCol=aiPlayerData.col;
    //finding in which direction ai player is moving and updating the image
    if(initialAiPlayerRow>currentAiPlayerRow){
        aiPlayer.img=CPUImage_Up;
    }
    else if(initialAiPlayerRow<currentAiPlayerRow){
        aiPlayer.img=CPUImage_Down;
    }
    else if(initialAiPlayerCol>currentAiPlayerCol){
        aiPlayer.img=CPUImage_Left;
    }
    else if(initialAiPlayerCol<currentAiPlayerCol){
        aiPlayer.img=CPUImage_Right;
    }
    
    animateMovement(aiPlayer, aiPlayerData.row, aiPlayerData.col);
})

socket.on('obstacles', (obstacleData) => {
    obstacles = [];
    for (let i = 0; i < obstacleData.length; i++) {
        const obstacle = new Obstacle(obstacleData[i].row, obstacleData[i].col, ObstacleImage1);
        obstacles.push(obstacle);
    }
    isObstacleInitialized = true;
    tryStartGameLoop();
})

socket.on('existingPlayers', (players) => {
    for (const playerId in players) {
        if (playerId === socket.id) continue;
        const player = players[playerId];
        otherPlayers[playerId] = new Player(player.row, player.col, PlayerImage_Down);
    }
})



socket.on('newPlayer', (playerData) => {
    const player = new Player(playerData.row, playerData.col, PlayerImage_Down);
    otherPlayers[playerData.id] = player;
})

function animateMovement(player, targetRow, targetCol) {
    

        const targetX = targetCol * CELL_SIZE;
        const targetY = targetRow * CELL_SIZE;
        const startX = player.col * CELL_SIZE;
        const startY = player.row * CELL_SIZE;

        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / 100, 1); // Adjust duration as needed

            player.pixelX = startX + (targetX - startX) * progress;
            player.pixelY = startY + (targetY - startY) * progress;
            player.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                player.row = targetRow;
                player.col = targetCol;
                player.pixelX = targetX;
                player.pixelY = targetY;
            }
        }
        requestAnimationFrame(animate);

}
socket.on('playerMoved', (data) => {
    if (otherPlayers[data.id]) {
        
        otherPlayers[data.id].img = data.imgDirection === 'up' ? PlayerImage_Up : data.imgDirection === 'down' ? PlayerImage_Down : data.imgDirection === 'left' ? PlayerImage_Left : PlayerImage_Right;

        animateMovement(otherPlayers[data.id], data.row, data.col);
    }
    else {
        const player = new Player(data.row, data.col, PlayerImage_Down);
        otherPlayers[data.id] = player;
    }
})










