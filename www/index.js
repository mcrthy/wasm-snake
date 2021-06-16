import { Direction, Game } from "wasm-snake";

const CELL_SIZE = 10; // px
const GRID_COLOR = "#CCCCCC";
const OFF_COLOR = "#FFFFFF";
const SNAKE_COLOR = "#000000";
const FOOD_COLOR = "#FF0000";

const HEIGHT = 32;
const WIDTH = 32;

const fps = new class {
  constructor() {
    this.fps = document.getElementById("fps");
    this.frames = [];
    this.lastFrameTimeStamp = performance.now();
  }

  render() {
    // Convert the delta time since the last frame render into a measure
    // of frames per second.
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = 1 / delta * 1000;

    // Save only the latest 100 timings.
    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    // Find the max, min, and mean of our 100 latest timings.
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (let i = 0; i < this.frames.length; i++) {
      sum += this.frames[i];
      min = Math.min(this.frames[i], min);
      max = Math.max(this.frames[i], max);
    }
    let mean = sum / this.frames.length;

    // Render the statistics.
    this.fps.textContent = `
Frames per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
  }
};


const STARTING_DIRECTION = Direction.up;

let game = Game.new(WIDTH, HEIGHT, STARTING_DIRECTION);

let bestScore = 0;

const currentScoreText = document.getElementById("current-score");
const bestScoreText = document.getElementById("best-score");

const canvas = document.getElementById("snake-canvas");
canvas.height = (CELL_SIZE + 1) * HEIGHT + 1;
canvas.width = (CELL_SIZE + 1) * WIDTH + 1;

const ctx = canvas.getContext('2d');

const setCurrentScore = () => {
  currentScoreText.innerHTML = "Current: " + game.score();
}

const setBestScore = () => {
  let score = game.score();
  if (score >= bestScore) {
    bestScore = score;
    bestScoreText.innerHTML = "Best: " + bestScore;
  }
}

setBestScore();

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

const progressGame = () => {
  if (game.is_over()) {
    setBestScore();
    game = Game.new(WIDTH, HEIGHT, STARTING_DIRECTION);
  }

  setCurrentScore();

  drawGrid();
  drawCells();

  game.tick(direction);
}

const INTERVAL = 100; // 100 ms animation interval

let frame = {
  start: null,
  delta: null,
};

const run = (func) => {
  if (!frame.start) frame.start = performance.now();
  frame.delta = performance.now() - frame.start;

  fps.render();

  if (frame.delta >= INTERVAL) {
    func.call();
    frame.start = null;
  }

  requestAnimationFrame(run.bind(null, func));
}

run(progressGame);