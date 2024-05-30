const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
const COLOR_DARK_GRAY = "#222";
const COLOR_WHITE = "#FFF";
const COLOR_PLAYER = "#00F";
const COLOR_RAYS = "#A0F";
const FOV_ANGLE = (60 * Math.PI) / 180;
const WALL_STRIP_WIDTH = 30; // width of each ray
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

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
        // stroke(COLOR_PLAYER);
        // line(
        //     this.x,
        //     this.y,
        //     this.x + Math.cos(this.rotationAngle) * 30,
        //     this.y + Math.sin(this.rotationAngle) * 30
        // );
    }

    update() {
        let moveStep, newPlayerX, newPlayerY, gridRow, gridCol;

        this.rotationAngle = normalizeAngle(
            this.rotationAngle + this.turnDirection * this.rotationSpeed
        );
        moveStep = this.walkDirection * this.moveSpeed;
        newPlayerX = this.x + moveStep * Math.cos(this.rotationAngle);
        newPlayerY = this.y + moveStep * Math.sin(this.rotationAngle);
        if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.isRayFaceingDown = this.rayAngle >= 0 && this.rayAngle < Math.PI;
        this.isRayFaceingUp = !this.isRayFaceingDown;
        this.isRayFaceingRight =
            this.rayAngle >= 1.5 * Math.PI || this.rayAngle <= 0.5 * Math.PI;
        this.isRayFaceingLeft = !this.isRayFaceingRight;
    }

    render() {
        stroke(COLOR_RAYS);
        line(
            player.x,
            player.y,
            player.x + Math.cos(this.rayAngle) * 30,
            player.y + Math.sin(this.rayAngle) * 30
        );
    }

    cast(columnId) {
        let xIntersept,
            yIntersept,
            xStep,
            yStep,
            nextHorzTouchX,
            nextHorzTouchY;
        let foundHorzWallHit = false,
            wallHitX = 0,
            wallHitY = 0;

        //////////////////////////////////////
        // HORIZONTAL RAY-GRID INTERSECTION
        //////////////////////////////////////

        // Find the (x, y) coordinates of the closest horizontal grid interception
        yIntersept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        if (this.isRayFaceingDown) {
            yIntersept += TILE_SIZE;
        }
        xIntersept =
            player.x + (yIntersept - player.y) / Math.tan(this.rayAngle);

        // Calculate the increment for xstep and ystep
        yStep = TILE_SIZE;
        if (this.isRayFaceingUp) {
            yStep *= -1;
        }
        xStep = TILE_SIZE / Math.tan(this.rayAngle);
        if (
            (this.isRayFaceingLeft && xStep > 0) ||
            (this.isRayFaceingRight && xStep < 0)
        ) {
            xStep *= -1;
        }

        // Finding the first horizontal intersection
        nextHorzTouchX = xIntersept;
        nextHorzTouchY = yIntersept;
        // Adding/Substracting one pixel in order to be inside of the next tile
        if (this.isRayFaceingUp) {
            nextHorzTouchY -= 1;
        } else if (this.isRayFaceingDown) {
            nextHorzTouchY += 1;
        }
        // Increment xstep and ystep until we find a wall
        while (
            nextHorzTouchX >= 0 &&
            nextHorzTouchX <= WINDOW_WIDTH &&
            nextHorzTouchY >= 0 &&
            nextHorzTouchY <= WINDOW_HEIGHT
        ) {
            if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY)) {
                foundHorzWallHit = true;
                wallHitX = nextHorzTouchX;
                wallHitY = nextHorzTouchY;
                stroke("red");
                line(player.x, player.y, wallHitX, wallHitY);
                break;
            }
            nextHorzTouchX += xStep;
            nextHorzTouchY += yStep;
        }
    }
}

const grid = new Map();
const player = new Player();
let rays = [];

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

function castAllRays() {
    let colId, rayAngle, ray, angleIncrement;

    colId = 0;

    // Start first ray substracting half of the FOV
    rayAngle = player.rotationAngle - FOV_ANGLE / 2;
    rays = [];

    // Loop all columns in order to cast the rays
    angleIncrement = FOV_ANGLE / NUM_RAYS;
    // for (let i = 0; i < NUM_RAYS; i++) {
    for (let i = 0; i < 1; i++) {
        ray = new Ray(rayAngle);
        ray.cast(colId);
        rays.push(ray);
        rayAngle += angleIncrement;
        colId++;
    }
}

function normalizeAngle(angle) {
    angle %= 2 * Math.PI;
    if (angle < 0) {
        angle += 2 * Math.PI;
    }
    return angle;
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
    // Initialize objects
}

function update() {
    player.update();
}

function draw() {
    // Render all objects frame by frame
    update();
    grid.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();
    castAllRays();
}
