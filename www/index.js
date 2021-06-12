import { Cell, Direction, Game } from "wasm-snake";
import { memory } from "wasm-snake/wasm_snake_bg";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const OFF_COLOR = "#FFFFFF";
const ON_COLOR = "#000000";

const HEIGHT = 64;
const WIDTH = 64;
const STARTING_DIRECTION = Direction.up;

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
  const cellsPtr = game.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, WIDTH * HEIGHT);

  ctx.beginPath();

  for (let row = 0; row < HEIGHT; row++) {
    for (let col = 0; col < WIDTH; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Off
        ? OFF_COLOR
        : ON_COLOR;

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

const getIndex = (row, column) => {
  return row * WIDTH + column;
};

let game = Game.new(WIDTH, HEIGHT, STARTING_DIRECTION);
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