import { Cell, Direction, Game } from "wasm-snake";
import { memory } from "wasm-snake/wasm_snake_bg";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const OFF_COLOR = "#FFFFFF";
const ON_COLOR = "#000000";

// Construct the universe, and get its width and height.
const game = Game.new();
const width = game.width();
const height = game.height();

const canvas = document.getElementById("snake-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = game.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
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

let direction = game.direction();

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
  game.tick(direction);

  drawGrid();
  drawCells();

  setTimeout( () => requestAnimationFrame(renderLoop), 100);
};

requestAnimationFrame(renderLoop);