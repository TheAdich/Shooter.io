import {ctx} from '../main.js';
const CELL_SIZE=18;


class Obstacle{
    constructor(row,col,img){
        this.row=row;
        this.col=col;
        this.img=img;
    }
    draw(){
        
        ctx.drawImage(this.img,this.col*CELL_SIZE,this.row*CELL_SIZE,CELL_SIZE,CELL_SIZE);
    }
}

export default Obstacle;