const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
const COLOR_DARK_GRAY = "#222";
const COLOR_WHITE = "#FFF";
const COLOR_PLAYER = "#00F";

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];
    }

    render() {
        let tileX;
        let tileY;
        let tileColor;

        for (let i = 0; i < MAP_NUM_ROWS; i++) {
            for (let j = 0; j < MAP_NUM_COLS; j++) {
                tileX = j * TILE_SIZE;
                tileY = i * TILE_SIZE;
                tileColor =
                    this.grid[i][j] == 1 ? COLOR_DARK_GRAY : COLOR_WHITE;
                stroke(COLOR_DARK_GRAY);
                fill(tileColor);
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    hasWallAt(x, y) {
        let row, col;

        if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
            return true;
        }
        row = Math.floor(y / TILE_SIZE);
        col = Math.floor(x / TILE_SIZE);
        return this.grid[row][col] === 1;
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 5;
        this.turnDirection = 0; // -1 if left, +1 if right
        this.walkDirection = 0; // -1 if back, +1 if front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 2.0;
        this.rotationSpeed = (2 * Math.PI) / 180;
    }

    render() {
        noStroke();
        fill(COLOR_PLAYER);
        circle(this.x, this.y, this.radius);
        stroke(COLOR_PLAYER);
        line(
            this.x,
            this.y,
            this.x + 20 * Math.cos(this.rotationAngle),
            this.y + 20 * Math.sin(this.rotationAngle)
        );
    }

    update() {
        let moveStep, newPlayerX, newPlayerY, gridRow, gridCol;

        this.rotationAngle += this.turnDirection * this.rotationSpeed;
        moveStep = this.walkDirection * this.moveSpeed;
        newPlayerX = this.x + moveStep * Math.cos(this.rotationAngle);
        newPlayerY = this.y + moveStep * Math.sin(this.rotationAngle);
        if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }
}

const grid = new Map();
const player = new Player();

function keyPressed() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = 1;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirection = 1;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirection = -1;
    }
}

function keyReleased() {
    if (keyCode == UP_ARROW || keyCode == DOWN_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == RIGHT_ARROW || keyCode == LEFT_ARROW) {
        player.turnDirection = 0;
    }
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
    // Initialize objects
}

function update() {
    player.update();
}

function draw() {
    update();
    grid.render();
    player.render();
    // Render all objects frame by frame
}
