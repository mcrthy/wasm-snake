import { Cell, Direction, Game } from "wasm-snake";
import { memory } from "wasm-snake/wasm_snake_bg";

const CELL_SIZE = 10; // px
const GRID_COLOR = "#CCCCCC";
const OFF_COLOR = "#FFFFFF";
const SNAKE_COLOR = "#000000";
const FOOD_COLOR = "#FF0000";

const HEIGHT = 32;
const WIDTH = 32;
const STARTING_DIRECTION = Direction.up;

let game = Game.new(WIDTH, HEIGHT, STARTING_DIRECTION);

const canvas = document.getElementById("snake-canvas");
canvas.height = (CELL_SIZE + 1) * HEIGHT + 1;
canvas.width = (CELL_SIZE + 1) * WIDTH + 1;

const ctx = canvas.getContext('2d');

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= WIDTH; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * HEIGHT + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= HEIGHT; j++) {
    ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * WIDTH + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

const drawCells = () => {
  ctx.beginPath();

  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      
      if (game.is_snake(row, col)) {
        ctx.fillStyle = SNAKE_COLOR;
      } else if (game.is_food(row, col)) {
        ctx.fillStyle = FOOD_COLOR;
      } else {
        ctx.fillStyle = OFF_COLOR;
      }

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

let direction = STARTING_DIRECTION;

window.addEventListener('keydown', (e) => {
  if (e.key == 'w') {
    direction = Direction.Up;
  } else if (e.key == 's') {
    direction = Direction.Down;
  } else if (e.key == 'd') {
    direction = Direction.Right;
  } else if (e.key == 'a') {
    direction = Direction.Left
  }
})

const renderLoop = () => {
  if (game.is_over()) {
    game = Game.new(WIDTH, HEIGHT, STARTING_DIRECTION);
  }

  drawGrid();
  drawCells();

  game.tick(direction);

  setTimeout( () => requestAnimationFrame(renderLoop), 100);
};

requestAnimationFrame(renderLoop);