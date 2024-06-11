#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <SDL2/SDL.h>

#include "raycasting.h"

SDL_Window		*window = NULL;
SDL_Renderer	*renderer = NULL;
bool			is_game_running = false;

int				playerX, playerY;

int				ticks_last_frame = 0;

void	setup(void)
{
	playerX = 0;
	playerY = 0;
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

	// Update our objects
	playerX += 32 * delta_time;
	playerY += 32 * delta_time;
}

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
			break ;
	}
}

void render(void)
{
	SDL_Rect	rect = { playerX, playerY, 20, 20 };

	SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
	SDL_RenderClear(renderer);

	SDL_SetRenderDrawColor(renderer, 255, 255, 0, 255);
	SDL_RenderFillRect(renderer, &rect);

	SDL_RenderPresent(renderer);
}

int	main(void)
{
	is_game_running = initialize_window();
	while (is_game_running)
	{
		process_input();
		update();
		render();
	}
	destroy_window();
	return (0);
}
