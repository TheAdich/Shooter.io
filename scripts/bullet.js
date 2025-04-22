import { ctx } from "../main.js";
const CELL_SIZE = 18;
class Bullet {
    constructor(x,y,speed = 5) {
        this.x = x;
        this.y = y;
        this.pixelX = x*CELL_SIZE + CELL_SIZE/2;
        this.pixelY = y*CELL_SIZE + CELL_SIZE/2;
        this.speed = speed;
        this.radius = CELL_SIZE/4;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.pixelX, this.pixelY, CELL_SIZE/4 , 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
    }
    shoot(direction, grid, obstacles, otherPlayers) {
        //8 directions
        if (direction === "up") {
            this.pixelY -= this.speed;
            this.y -= this.speed / CELL_SIZE;
        } else if (direction === "down") {
            this.pixelY += this.speed;
            this.y += this.speed / CELL_SIZE;
        } else if (direction === "left") {
            this.pixelX -= this.speed;
            this.x -= this.speed / CELL_SIZE;
        } else if (direction === "right") {
            this.pixelX += this.speed;
            this.x += this.speed / CELL_SIZE;
        }
        //check if bullet is in active region or not 
        // check if bullet hit obstacles or other players

        //true means bullet is in active region and not hit any obstacles or other players
        //false means bullet is out of active region or hit any obstacles or other players
        return this.checkCollision(grid, obstacles, otherPlayers);
    }

    checkCollision(grid, obstacles, otherPlayers) {
        console.log("checking collision");
        //with rectanglular obstacles
        for (let i = 0; i < obstacles.length; i++) {
            let closestX = this.pixelX;
            let closestY = this.pixelY;

            if (this.pixelX < obstacles[i].col * CELL_SIZE) closestX = obstacles[i].col * CELL_SIZE;
            else if (this.pixelX > obstacles[i].col * CELL_SIZE + CELL_SIZE) closestX = obstacles[i].col * CELL_SIZE + CELL_SIZE;

            if (this.pixelY < obstacles[i].row * CELL_SIZE) closestY = obstacles[i].row * CELL_SIZE;
            else if (this.pixelY > obstacles[i].row * CELL_SIZE + CELL_SIZE) closestY = obstacles[i].row * CELL_SIZE + CELL_SIZE;

            const distanceX = this.pixelX - closestX;
            const distanceY = this.pixelY - closestY;
            //console.log(this.pixelX + " " + this.pixelY, " " + obstacles[i].col * CELL_SIZE + " " + obstacles[i].row * CELL_SIZE);
            //console.log("distanceX: " + distanceX + " distanceY: " + distanceY, " radius: " + this.radius);
            if (distanceX * distanceX + distanceY * distanceY <= this.radius * this.radius) {
                //bullet hit the obstacle
                console.log("hit the obstacle");
                return false;
            }
        }
        //with other players
        for (const playerId in otherPlayers) {
            let closestX = this.pixelX;
            let closestY = this.pixelY;

            if (this.pixelX < otherPlayers[playerId].col * CELL_SIZE) closestX = otherPlayers[playerId].col * CELL_SIZE;
            else if (this.pixelX > otherPlayers[playerId].col * CELL_SIZE + CELL_SIZE) closestX = otherPlayers[playerId].col * CELL_SIZE + CELL_SIZE;

            if (this.pixelY < otherPlayers[playerId].row * CELL_SIZE) closestY = otherPlayers[playerId].row * CELL_SIZE;
            else if (this.pixelY > otherPlayers[playerId].row * CELL_SIZE + CELL_SIZE) closestY = otherPlayers[playerId].row * CELL_SIZE + CELL_SIZE;

            const distanceX = this.pixelX - closestX;
            const distanceY = this.pixelY - closestY;

            if (distanceX * distanceX + distanceY * distanceY <= this.radius * this.radius) {
                //bullet hit the playter
                console.log("hit the player");
                return false;
            }
        }
        // hit the wall
        if (!grid.isInActiveArea(this.y,this.x)) {
            console.log("hit the wall");
            return false;
        }
        return true;

    }
}

export default Bullet;