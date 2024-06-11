#ifndef RAYCASTING_H
# define RAYCASTING_H

# define PI                     3.14159265
# define TWO_PI                 6.28318530

# define TILE_SIZE              64
# define MAP_NUM_ROWS           13
# define MAP_NUM_COLS           20
# define MINIMAP_SCALE_FACTOR   1.0

# define WINDOW_TITLE	        "Raycasting"
# define WINDOW_WIDTH	        (MAP_NUM_COLS * TILE_SIZE)
# define WINDOW_HEIGHT	        (MAP_NUM_ROWS * TILE_SIZE)

# define FOV_ANGLE              (60 * (PI / 180))
# define NUM_RAYS               WINDOW_WIDTH

# define PLAYER_DIR_LINE_LEN    40

# define FPS                    30
# define FRAME_TIME_LEN         (1000 / FPS) // time in ms for each frame

typedef struct s_player t_player;

struct s_player
{
    float   x;
    float   y;
    float   width;
    float   height;
    int     turn_direction; // -1 for left, 1 for right
    int     walk_direction; // -1 for back, 1 for front
    float   rotation_angle;
    float   walk_speed;
    float   turn_speed;
};

void move_player(float delta_time);

#endif
