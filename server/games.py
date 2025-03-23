import pygame
import random
import time
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Games")

@mcp.tool()
def whack_a_mole(round_time:int, required_score:int)->str:
    # Initialize pygame
    pygame.init()
    # Game settings
    WIDTH, HEIGHT = 600, 600
    GRID_SIZE = 3  # 3x3 grid
    CELL_SIZE = WIDTH // GRID_SIZE
    MOLE_APPEAR_TIME = 800  # Milliseconds a mole appears

    # Colors
    WHITE = (255, 255, 255)
    BLACK = (0, 0, 0)

    # Load images (ensure the path is correct on your system)
    mole_img = pygame.image.load(r"./server/zombie.jpg")
    mole_img = pygame.transform.scale(mole_img, (CELL_SIZE, CELL_SIZE))

    # Set up display
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Whack-A-Zombie")

    # Game variables
    score = 0
    mole_position = (random.randint(0, GRID_SIZE - 1), random.randint(0, GRID_SIZE - 1))
    last_mole_time = pygame.time.get_ticks()

    # Function to draw grid lines
    def draw_grid():
        for x in range(0, WIDTH, CELL_SIZE):
            pygame.draw.line(screen, BLACK, (x, 0), (x, HEIGHT))
        for y in range(0, HEIGHT, CELL_SIZE):
            pygame.draw.line(screen, BLACK, (0, y), (WIDTH, y))

    # Function to draw the mole (or zombie)
    def draw_mole():
        x, y = mole_position
        screen.blit(mole_img, (x * CELL_SIZE, y * CELL_SIZE))

    # Function to check if the mole was clicked
    def check_click(pos):
        nonlocal score, mole_position
        x, y = pos[0] // CELL_SIZE, pos[1] // CELL_SIZE
        if (x, y) == mole_position:
            score += 1
            return True
        return False

    # Game loop initialization
    running = True
    start_time = time.time()
    won = False

    while running:
        # Fill screen and redraw grid and mole
        screen.fill(WHITE)
        draw_grid()
        draw_mole()

        # Timer countdown
        time_left = round_time - int(time.time() - start_time)
        if time_left <= 0:
            running = False 
            return "User has failed to complete the given mission" # End game if time runs out

        # Display score and time left
        font = pygame.font.Font(None, 36)
        text = font.render(f"Score: {score}  Time: {time_left}s", True, BLACK)
        screen.blit(text, (20, 20))
        pygame.display.flip()

        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
                return "User has failed to complete the given mission with his score of " + str(score)
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if check_click(event.pos):
                    # Change mole position immediately upon hit
                    mole_position = (random.randint(0, GRID_SIZE - 1), random.randint(0, GRID_SIZE - 1))

        # Change mole position after MOLE_APPEAR_TIME milliseconds
        if pygame.time.get_ticks() - last_mole_time > MOLE_APPEAR_TIME:
            mole_position = (random.randint(0, GRID_SIZE - 1), random.randint(0, GRID_SIZE - 1))
            last_mole_time = pygame.time.get_ticks()

        # Check win condition
        if score >= required_score:
            won = True
            running = False

    # Display win/lose message
    screen.fill(WHITE)
    font = pygame.font.Font(None, 50)
    message = "You Win! 🎉" if won else "Game Over! 😢"
    text = font.render(message, True, BLACK)
    screen.blit(text, (WIDTH // 3, HEIGHT // 3))
    pygame.display.flip()

    # Pause before closing
    time.sleep(2)
    pygame.quit()
    print("Final Score:", score)
    return score

# Run the game with a 15-second time limit and a required score of 2.
if __name__ == "__main__":
    mcp.run(transport="stdio")
