#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <SDL2/SDL.h>

#include "raycasting.h"

SDL_Window		*window = NULL;
SDL_Renderer	*renderer = NULL;
bool			is_game_running = false;

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

int	main(void)
{
	is_game_running = initialize_window();
	while (is_game_running)
	{
		//process_input();
		//update();
		//render();
	}
	destroy_window();
	return (0);
}
