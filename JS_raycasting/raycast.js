const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const COLOR_DARK_GRAY = "#222";
const COLOR_WHITE = "#FFF";
const COLOR_PLAYER = "#00F";
const COLOR_RAYS = "#F00";
const COLOR_WALLS = "#FFF";
const COLOR_MAX_INTENSITY_DISTANCE = 120;
const COLOR_SHADING_FACTOR = 400;

const FOV_ANGLE = (60 * Math.PI) / 180;
const WALL_STRIP_WIDTH = 2; // width of each ray
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;
const MINIMAP_SCALE_FACTOR = 0.25;

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
                rect(
                    tileX * MINIMAP_SCALE_FACTOR,
                    tileY * MINIMAP_SCALE_FACTOR,
                    TILE_SIZE * MINIMAP_SCALE_FACTOR,
                    TILE_SIZE * MINIMAP_SCALE_FACTOR
                );
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
        this.moveSpeed = 3.0;
        this.rotationSpeed = (3 * Math.PI) / 180;
    }

    render() {
        noStroke();
        fill(COLOR_PLAYER);
        circle(
            this.x * MINIMAP_SCALE_FACTOR,
            this.y * MINIMAP_SCALE_FACTOR,
            this.radius * MINIMAP_SCALE_FACTOR
        );
        stroke(COLOR_PLAYER);
        line(
            this.x * MINIMAP_SCALE_FACTOR,
            this.y * MINIMAP_SCALE_FACTOR,
            (this.x + Math.cos(this.rotationAngle) * 30) * MINIMAP_SCALE_FACTOR,
            (this.y + Math.sin(this.rotationAngle) * 30) * MINIMAP_SCALE_FACTOR
        );
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
        this.wasHitVertical = false;
        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;
        this.isRayFacingRight =
            this.rayAngle > 1.5 * Math.PI || this.rayAngle < 0.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }

    cast() {
        let xIntersept,
            yIntersept,
            xStep,
            yStep,
            nextHorzTouchX,
            nextHorzTouchY,
            nextVertTouchX,
            nextVertTouchY;
        let foundHorzWallHit = false,
            foundVertWallHit = false,
            horzWallHitX = 0,
            horzWallHitY = 0,
            vertWallHitX = 0,
            vertWallHitY = 0;
        let horzHitDistance, vertHitDistance;

        //////////////////////////////////////
        // HORIZONTAL RAY-GRID INTERSECTION
        //////////////////////////////////////
        // Find the (x, y) coordinates of the closest horizontal grid interception
        yIntersept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        if (this.isRayFacingDown) {
            yIntersept += TILE_SIZE;
        }
        xIntersept =
            player.x + (yIntersept - player.y) / Math.tan(this.rayAngle);

        // Calculate the increment for xstep and ystep
        yStep = TILE_SIZE;
        if (this.isRayFacingUp) {
            yStep *= -1;
        }
        xStep = TILE_SIZE / Math.tan(this.rayAngle);
        xStep *= this.isRayFacingLeft && xStep > 0 ? -1 : 1;
        xStep *= this.isRayFacingRight && xStep < 0 ? -1 : 1;

        // Finding the first horizontal intersection
        nextHorzTouchX = xIntersept;
        nextHorzTouchY = yIntersept;
        // Increment xstep and ystep until we find a wall
        while (
            nextHorzTouchX >= 0 &&
            nextHorzTouchX <= WINDOW_WIDTH &&
            nextHorzTouchY >= 0 &&
            nextHorzTouchY <= WINDOW_HEIGHT
        ) {
            if (
                grid.hasWallAt(
                    nextHorzTouchX,
                    nextHorzTouchY - (this.isRayFacingUp ? 1 : 0)
                )
            ) {
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;
                break;
            }
            nextHorzTouchX += xStep;
            nextHorzTouchY += yStep;
        }

        //////////////////////////////////////
        // VERTICAL RAY-GRID INTERSECTION
        //////////////////////////////////////
        // Find the (x, y) coordinates of the closest vertical grid interception
        xIntersept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        if (this.isRayFacingRight) {
            xIntersept += TILE_SIZE;
        }
        yIntersept =
            player.y + Math.tan(this.rayAngle) * (xIntersept - player.x);

        // Calculate the increment for xstep and ystep
        xStep = TILE_SIZE;
        if (this.isRayFacingLeft) {
            xStep *= -1;
        }
        yStep = Math.tan(this.rayAngle) * TILE_SIZE;
        if (
            (this.isRayFacingUp && yStep > 0) ||
            (this.isRayFacingDown && yStep < 0)
        ) {
            yStep *= -1;
        }

        // Finding the first vertical intersection
        nextVertTouchX = xIntersept;
        nextVertTouchY = yIntersept;
        // Increment xstep and ystep until we find a wall
        while (
            nextVertTouchX >= 0 &&
            nextVertTouchX <= WINDOW_WIDTH &&
            nextVertTouchY >= 0 &&
            nextVertTouchY <= WINDOW_HEIGHT
        ) {
            if (
                grid.hasWallAt(
                    nextVertTouchX - (this.isRayFacingLeft ? 1 : 0),
                    nextVertTouchY
                )
            ) {
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
                break;
            }
            nextVertTouchX += xStep;
            nextVertTouchY += yStep;
        }

        // Calculate both horz and vert distances and choose correct hit point (smallest distance)
        horzHitDistance = foundHorzWallHit
            ? distanceBetweenPoints(
                  player.x,
                  player.y,
                  horzWallHitX,
                  horzWallHitY
              )
            : Number.MAX_VALUE;
        vertHitDistance = foundVertWallHit
            ? distanceBetweenPoints(
                  player.x,
                  player.y,
                  vertWallHitX,
                  vertWallHitY
              )
            : Number.MAX_VALUE;

        // Store the information about closest hit point
        this.wasHitVertical = vertHitDistance < horzHitDistance;
        this.wallHitX = this.wasHitVertical ? vertWallHitX : horzWallHitX;
        this.wallHitY = this.wasHitVertical ? vertWallHitY : horzWallHitY;
        this.distance = this.wasHitVertical ? vertHitDistance : horzHitDistance;
    }

    render() {
        stroke(COLOR_RAYS);
        line(
            player.x * MINIMAP_SCALE_FACTOR,
            player.y * MINIMAP_SCALE_FACTOR,
            this.wallHitX * MINIMAP_SCALE_FACTOR,
            this.wallHitY * MINIMAP_SCALE_FACTOR
        );
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
    let rayAngle, ray, angleIncrement;

    // Start first ray substracting half of the FOV
    rayAngle = player.rotationAngle - FOV_ANGLE / 2;
    rays = [];

    // Loop all columns in order to cast the rays
    angleIncrement = FOV_ANGLE / NUM_RAYS;
    for (let col = 0; col < NUM_RAYS; col++) {
        ray = new Ray(rayAngle);
        ray.cast();
        rays.push(ray);
        rayAngle += angleIncrement;
    }
}

function render3DProjectedWalls() {
    let ray,
        wallStripHeight,
        rayDistance,
        distanceToProjPlane,
        distanceShadingFactor,
        colorIntensity;
    let colorChosen = { r: 255, g: 255, b: 255 };


    // Found using trigonometry
    distanceToProjPlane = (WINDOW_WIDTH / 2) * Math.tan(FOV_ANGLE / 2);
    for (let i = 0; i < rays.length; i++) {
        ray = rays[i];
        // Calculating distance removing distorsion
        rayDistance =
            ray.distance * Math.cos(player.rotationAngle - ray.rayAngle);
        wallStripHeight = (TILE_SIZE / rayDistance) * distanceToProjPlane;

        // Evaluating the color
        colorIntensity = ray.wasHitVertical ? 180 : 255;
        if (rayDistance < COLOR_MAX_INTENSITY_DISTANCE) {
            colorChosen.r = colorIntensity;
            colorChosen.g = colorIntensity;
            colorChosen.b = colorIntensity;
        } else {
            distanceShadingFactor =
                1 -
                Math.abs(rayDistance - COLOR_MAX_INTENSITY_DISTANCE) /
                    COLOR_SHADING_FACTOR;
            colorChosen.r = distanceShadingFactor * colorIntensity;
            colorChosen.g = distanceShadingFactor * colorIntensity;
            colorChosen.b = distanceShadingFactor * colorIntensity;
        }

        // Drawing the walls
        fill(color(colorChosen.r, colorChosen.g, colorChosen.b));
        noStroke();
        rect(
            i * WALL_STRIP_WIDTH,
            (WINDOW_HEIGHT - wallStripHeight) / 2,
            WALL_STRIP_WIDTH,
            wallStripHeight
        );
    }
}

function normalizeAngle(angle) {
    angle %= 2 * Math.PI;
    if (angle < 0) {
        angle += 2 * Math.PI;
    }
    return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
    // Initialize objects
}

function update() {
    player.update();
    castAllRays();
}

function draw() {
    clear(COLOR_DARK_GRAY);
    update();
    render3DProjectedWalls();
    grid.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();
}
