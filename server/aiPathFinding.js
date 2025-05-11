const PF = require('pathfinding');
//caching the grid and pathfinder after initialization
let grid = null;
let pathFinder = null;

const initializeGridAndPathFinder = (obstacles) => {
    const GRID_COLS = 27;
    const GRID_ROWS = 27;
    grid = new PF.Grid(GRID_ROWS, GRID_COLS);
    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        grid.setWalkableAt(obstacle.row, obstacle.col, false);
    }
    pathFinder = new PF.AStarFinder({
        allowDiagonal: false,
    });
}

const getNextMove = (aiPlayer, player, obstacles) => {
    try {
        if (!grid || !pathFinder) {
            initializeGridAndPathFinder(obstacles);
        }
        
        const gridClone = grid.clone();
        const path = pathFinder.findPath(
            aiPlayer.row, aiPlayer.col,
            player.row, player.col,
            gridClone
        );
        

        if (path && path.length > 1) {
            const nextMove = path[1];
            return { row: nextMove[0], col: nextMove[1] };
        }
        
        // If no path found, return current position
        return { row: aiPlayer.row, col: aiPlayer.col };
    } catch (error) {
        console.error('Error in pathfinding:', error);
        return { row: aiPlayer.row, col: aiPlayer.col };
    }
}

module.exports = { getNextMove };
















