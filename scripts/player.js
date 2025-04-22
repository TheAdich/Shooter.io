import { ctx,socket,otherPlayers } from '../main.js';

const CELL_SIZE = 18;
const MOVE_DURATION = 100;

class Player {
    constructor(row, col, img) {
        this.row = row;
        this.col = col;
        this.img = img;

        // pixel-based position
        this.pixelX = col * CELL_SIZE;
        this.pixelY = row * CELL_SIZE;

        this.isMoving = false;
    }

    draw() {
        ctx.drawImage(this.img, this.pixelX, this.pixelY, CELL_SIZE, CELL_SIZE);
    }

    move(dx, dy, obstacles, grid, newImg) {
        if (this.isMoving) return;

        const newRow = this.row + dy;
        const newCol = this.col + dx;

        // Check grid boundaries
        if (!grid.isInActiveArea(newRow, newCol)) return;

        // Check obstacle collision
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].row === newRow && obstacles[i].col === newCol) return;
        }

        // Check other players collision
        for(const playerId in otherPlayers) {
            if(otherPlayers[playerId].row===newRow && otherPlayers[playerId].col===newCol) return;
        }

        // Update logical position
        const targetX = newCol * CELL_SIZE;
        const targetY = newRow * CELL_SIZE;
        const startX = this.col * CELL_SIZE;
        const startY = this.row * CELL_SIZE;

        this.isMoving = true;
        this.img = newImg;

        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / MOVE_DURATION, 1);

            this.pixelX = startX + (targetX - startX) * progress;
            this.pixelY = startY + (targetY - startY) * progress;

            
           
            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.row = newRow;
                this.col = newCol;
                this.pixelX = targetX;
                this.pixelY = targetY;
                this.isMoving = false;
                socket.emit('playerMovement',{
                    row:newRow,
                    col:newCol,
                    imgDirection:newImg.src.includes('Up') ? 'up' : newImg.src.includes('Down') ? 'down' : this.img.src.includes('Left') ? 'left' : 'right'
                })
                //console.log('player moved',newRow,newCol);
            }
        };

        requestAnimationFrame(animate);
    }
}

export default Player;
