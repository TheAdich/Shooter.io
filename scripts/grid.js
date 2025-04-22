import { ctx } from '../main.js';



const CELL_SIZE = 18;

//making grid
class Grid {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.topActiveRow = 0;
        this.leftActiveCol = 0;
        this.bottomActiveRow = rows - 1;
        this.rightActiveCol = cols - 1;
        this.GridTileImage = null;
        this.BoundaryTileImage = null;
    }

    setImage(img) {
        this.GridTileImage = img;
    }
    setBoundaryImage(img) {
        this.BoundaryTileImage = img;
    }

    shrinkGrid() {
        if (this.bottomActiveRow - this.topActiveRow > 1 && this.rightActiveCol - this.leftActiveCol > 1) {
            this.topActiveRow++;
            this.leftActiveCol++;
            this.bottomActiveRow--;
            this.rightActiveCol--;
        }
        //fill the unactive area with black color
        if (this.bottomActiveRow - this.topActiveRow > 2 && this.rightActiveCol - this.leftActiveCol > 2) {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (!this.isInActiveArea(row, col)) {
                        ctx.clearRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                        ctx.drawImage(this.BoundaryTileImage, col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    }
                }
            }
        }

    }

    isInActiveArea(row, col) {
        return row >= this.topActiveRow && row <= this.bottomActiveRow && col >= this.leftActiveCol && col <= this.rightActiveCol;
    }

    draw() {
        if (!this.GridTileImage) return;

        for (let row = this.topActiveRow; row <= this.bottomActiveRow; row++) {
            for (let col = this.leftActiveCol; col <= this.rightActiveCol; col++) {
                ctx.drawImage(this.GridTileImage, col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }

}

export default Grid;