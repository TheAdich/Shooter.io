const express=require('express');
const cors=require('cors');
const {createServer}=require('http');
const {Server}=require('socket.io');
const app=express();
const server=createServer(app);
app.use(cors(
    {
        origin:'http://127.0.0.1:5500',
        methods:['GET','POST'],
        credentials:true,
    }
));

const io=new Server(server,{
    cors:{
        origin:'http://127.0.0.1:5500',
        methods:['GET','POST'],
        credentials:true,
    }
});

let players={};
let obstacles=[];
//Server Side Obstacle Generation
const genrateObstacles=(rows,cols,obstacleCount)=>{
    
    for(let i=0;i<obstacleCount;i++){
        const row=Math.floor(Math.random()*(rows-3))+2;
        const col=Math.floor(Math.random()*(cols-3))+2;
        obstacles.push({row,col});
    }
    
}

genrateObstacles(27,27,75);

io.on('connection',(socket)=>{
    //Initializing grid and obstacles
    
    socket.emit('obstacles',obstacles);
    
    //Initializing player
    console.log('New player connected:',socket.id);
    players[socket.id]={
        id:socket.id,
        row:Math.floor(Math.random()*27),
        col:Math.floor(Math.random()*27),
        imgDirection:'down'
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
    
    //Sending exisitng players to the new player
    socket.emit('yourPlayer',players[socket.id]);
    socket.emit('existingPlayers',players);
    //Sending new player to all other players
    socket.broadcast.emit('newPlayer',{
        id:socket.id,
        row:players[socket.id].row,
        col:players[socket.id].col,
        imgDirection:players[socket.id].imgDirection
    });
    //Listening for player movement
    socket.on('playerMovement',(data)=>{
        if(players[socket.id]){
            players[socket.id].row=data.row;
            players[socket.id].col=data.col;
            players[socket.id].imgDirection=data.imgDirection;
        }
        socket.broadcast.emit('playerMoved',{
            id:socket.id,
            row:data.row,
            col:data.col,
            imgDirection:data.imgDirection
        });
    })

    //Listening for bullet shooting
    socket.on('shootBullet',(data)=>{
        //console.log(data);
        socket.broadcast.emit('otherPlayerBullet',{
            id:socket.id,
            bullet:data.bullet,
            direction:data.direction,
        });
    })

    //Listening for player disconnection
    socket.on('disconnect',()=>{
        delete players[socket.id];
        socket.broadcast.emit('playerDisconnected',socket.id);
        console.log('Player disconnected:',socket.id);
    })
})

server.listen(5000,()=>{
    console.log('Server is running on port 5000');
})