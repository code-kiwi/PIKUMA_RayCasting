#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <SDL2/SDL.h>
#include <math.h>

#include "raycasting.h"

const int map[MAP_NUM_ROWS][MAP_NUM_COLS] =
{
	{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ,1, 1, 1, 1, 1, 1, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
    {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
};
SDL_Window		*window = NULL;
SDL_Renderer	*renderer = NULL;
bool			is_game_running = false;
int				ticks_last_frame = 0;
t_player		player;

bool	initialize_window(void)
{
	if (SDL_Init(SDL_INIT_EVERYTHING) != 0)
	{
		fprintf(stderr, "Error initializing SDL\n");
		return (false);
	}
	window = SDL_CreateWindow(
		WINDOW_TITLE,
		SDL_WINDOWPOS_CENTERED,
		SDL_WINDOWPOS_CENTERED,
		WINDOW_WIDTH,
		WINDOW_HEIGHT,
		SDL_WINDOW_BORDERLESS
	);
	if (window == NULL)
	{
		fprintf(stderr, "Error creating SDL window\n");
		return (false);
	}
	renderer = SDL_CreateRenderer(window, -1, 0);
	if (renderer == NULL)
	{
		fprintf(stderr, "Error creating SDL renderer\n");
		return (false);
	}
	SDL_SetRenderDrawBlendMode(renderer, SDL_BLENDMODE_BLEND);
	return (true);
}

void	destroy_window()
{
	SDL_DestroyRenderer(renderer);
	SDL_DestroyWindow(window);
	SDL_Quit();
}

void	setup(void)
{
	player.x = WINDOW_WIDTH / 2;
	player.y = WINDOW_HEIGHT / 2;
	player.width = 5;
	player.height = 5;
	player.turn_direction = 0;
	player.walk_direction = 0;
	player.rotation_angle = PI / 2;
	player.walk_speed = 100; // pixels per second
	player.turn_speed = 45 * (PI / 180); // radians per second
}

void	update(void)
{
	float	delta_time;
	int		time_to_wait;

	// Compute how long we have to wait until the reach of target frame time and wait if we are running to fast
	time_to_wait = ticks_last_frame + FRAME_TIME_LEN - SDL_GetTicks();
	if (time_to_wait > 0 && time_to_wait <= FRAME_TIME_LEN)
		SDL_Delay(time_to_wait);

	// Compute the delat time to be used as an update factor when changing game objects
	delta_time = (SDL_GetTicks() - ticks_last_frame) / 1000.0f;

	// Store the milliseconds of the current frame to be used in the future
	ticks_last_frame = SDL_GetTicks();

	// Update our objects as a function of delta time
	move_player(delta_time);
}

void process_input()
{
	SDL_Event	event;

	SDL_PollEvent(&event);
	switch (event.type)
	{
		case SDL_QUIT:
			is_game_running = false;
			break ;
		case SDL_KEYDOWN:
			if (event.key.keysym.sym == SDLK_ESCAPE)
				is_game_running = false;
			else if (event.key.keysym.sym == SDLK_UP)
				player.walk_direction = 1;
			else if (event.key.keysym.sym == SDLK_DOWN)
				player.walk_direction = -1;
			else if (event.key.keysym.sym == SDLK_RIGHT)
				player.turn_direction = 1;
			else if (event.key.keysym.sym == SDLK_LEFT)
				player.turn_direction = -1;
			break ;
		case SDL_KEYUP:
			if (event.key.keysym.sym == SDLK_UP || event.key.keysym.sym == SDLK_DOWN)
				player.walk_direction = 0;
			else if (event.key.keysym.sym == SDLK_RIGHT || event.key.keysym.sym == SDLK_LEFT)
				player.turn_direction = 0;
			break ;
	}
}

void move_player(float delta_time)
{
	float	move_step;
	float	new_x, new_y;

	// Handling rotation move
	player.rotation_angle += player.turn_direction * player.turn_speed * delta_time;

	// Handling walk move
	move_step = player.walk_direction * player.walk_speed * delta_time;
	new_x = player.x + cos(player.rotation_angle) * move_step;
	new_y = player.y + sin(player.rotation_angle) * move_step;

	player.x = new_x;
	player.y = new_y;
}

void render_map()
{
	int			i, j;
	int			tile_x, tile_y;
	int			tile_color;
	SDL_Rect	tile_rect;

	for (i = 0; i < MAP_NUM_ROWS; i++)
	{
		for (j = 0; j < MAP_NUM_COLS; j++)
		{
			tile_x = j * TILE_SIZE;
			tile_y = i * TILE_SIZE;
			tile_color = map[i][j] != 0 ? 255 : 0;

			SDL_SetRenderDrawColor(renderer, tile_color, tile_color, tile_color, 255);
			tile_rect.h = TILE_SIZE * MINIMAP_SCALE_FACTOR;
			tile_rect.w = TILE_SIZE * MINIMAP_SCALE_FACTOR;
			tile_rect.x = tile_x * MINIMAP_SCALE_FACTOR;
			tile_rect.y = tile_y * MINIMAP_SCALE_FACTOR;
			SDL_RenderFillRect(renderer, &tile_rect);
		}
	}
}

void	render_player()
{
	SDL_Rect	player_rect;

	SDL_SetRenderDrawColor(renderer, 0, 0, 255, 255);
	player_rect.x = player.x * MINIMAP_SCALE_FACTOR;
	player_rect.y = player.y * MINIMAP_SCALE_FACTOR;
	player_rect.h = player.height * MINIMAP_SCALE_FACTOR;
	player_rect.w = player.width * MINIMAP_SCALE_FACTOR;
	SDL_RenderFillRect(renderer, &player_rect);

	SDL_RenderDrawLine(
		renderer,
		player.x * MINIMAP_SCALE_FACTOR,
		player.y * MINIMAP_SCALE_FACTOR,
		(player.x + cos(player.rotation_angle) * PLAYER_DIR_LINE_LEN) * MINIMAP_SCALE_FACTOR,
		(player.y + sin(player.rotation_angle) * PLAYER_DIR_LINE_LEN) * MINIMAP_SCALE_FACTOR
	);
}

void render(void)
{
	SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
	SDL_RenderClear(renderer);

	render_map();
	// render_rays();
	render_player();

	SDL_RenderPresent(renderer);
}

int	main(void)
{
	is_game_running = initialize_window();
	setup();
	while (is_game_running)
	{
		process_input();
		update();
		render();
	}
	destroy_window();
	return (0);
}
