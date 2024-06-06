#################################################
#              Variable definitions             #
#################################################

# GENERAL
NAME			=	./raycast
CC				=	gcc
ifndef NOFLAGS
	CFLAGS		=	-Wall -Werror -Wextra -std=c99
endif
HFLAGS			=	-I$(HEADERS_DIR)
EXT_LIB_FLAGS	=	-lSDL2

# HEADERS
HEADERS_DIR		=	includes/
HEADERS_FILES	=	raycasting.h
HEADERS			=	$(addprefix $(HEADERS_DIR), $(HEADERS_FILES))

# SRCS
SRCS_MAIN_DIR	=	srcs/
SRCS_FILES		=	raycasting.c
SRCS			=	$(addprefix $(SRCS_MAIN_DIR), $(SRCS_FILES))

# OBJS
OBJS_MAIN_DIR	=	objs/
OBJS_FILES		=	$(SRCS_FILES:.c=.o)
OBJS			=	$(addprefix $(OBJS_MAIN_DIR), $(OBJS_FILES))

# DEPS
DEPS_MAIN_DIR	=	deps/
DEPS_FILES		=	$(OBJS_FILES:.o=.d)
DEPS			=	$(addprefix $(DEPS_MAIN_DIR), $(DEPS_FILES))


#################################################
#               Rule definitions                #
#################################################

all: $(NAME)

$(NAME): $(OBJS)
	$(CC) $(CFLAGS) $(HFLAGS) $(OBJS) $(EXT_LIB_FLAGS) -o $@

$(OBJS_MAIN_DIR)%.o: $(SRCS_MAIN_DIR)%.c
	@mkdir -p $(@D)
	@mkdir -p $(DEPS_MAIN_DIR)$(dir $*)
	$(CC) $(CFLAGS) $(HFLAGS) -MP -MMD -MF $(DEPS_MAIN_DIR)$*.d -c $< -o $@ 

run: $(NAME)
	$(NAME)

clean:
	rm -rf $(OBJS_MAIN_DIR)
	rm -rf $(DEPS_MAIN_DIR)

fclean: clean
	rm -f $(NAME)

re: fclean all

.PHONY: all run clean fclean re
