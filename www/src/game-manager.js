import { Game } from "wasm-snake";
import CONFIG from './config';
import { Controller } from './controller';


export class GameManager {
  constructor() {
    this.restart();

    this.bestScore = 0;
    this.bestScoreText = document.getElementById("best-score");
    this.currentScoreText = document.getElementById("current-score");

    this.canvas = document.getElementById("snake-canvas");
    this.canvas.height = (CONFIG.CELL_SIZE + 1) * CONFIG.HEIGHT + 1;
    this.canvas.width = (CONFIG.CELL_SIZE + 1) * CONFIG.WIDTH + 1;
    this.ctx = this.canvas.getContext('2d');

    
    this.setBestScore();

    this.frame = {
      start: null,
      delta: null,
    }

    this.controller = new Controller();
  }

  restart() {
    this.game = Game.new(
      CONFIG.WIDTH,
      CONFIG.HEIGHT,
      CONFIG.DIRECTION,
    )
  };

  setBestScore() {
    const score = this.game.score();

    if (score >= this.bestScore) {
      this.bestScore = score;
      this.bestScoreText.innerHTML = "Best: " + this.bestScore;
    }
  }

  setCurrentScore() {
    this.currentScoreText.innerHTML = "Current: " + this.game.score();
  }

  drawGrid() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = CONFIG.GRID_COLOR;

    // Vertical lines.
    for (let i = 0; i <= CONFIG.WIDTH; i++) {
      this.ctx.moveTo(i * (CONFIG.CELL_SIZE + 1) + 1, 0);
      this.ctx.lineTo(i * (CONFIG.CELL_SIZE + 1) + 1, (CONFIG.CELL_SIZE + 1) * CONFIG.HEIGHT + 1);
    }

    // Horizontal lines.
    for (let j = 0; j <= CONFIG.HEIGHT; j++) {
      this.ctx.moveTo(0,                           j * (CONFIG.CELL_SIZE + 1) + 1);
      this.ctx.lineTo((CONFIG.CELL_SIZE + 1) * CONFIG.WIDTH + 1, j * (CONFIG.CELL_SIZE + 1) + 1);
    }

    this.ctx.stroke();
  }

  drawCells() {
    this.ctx.beginPath();
  
    for (let row = 0; row < CONFIG.HEIGHT; row++) {
      for (let col = 0; col < CONFIG.WIDTH; col++) {
        
        if (this.game.is_snake(row, col)) {
          this.ctx.fillStyle = CONFIG.SNAKE_COLOR;
        } else if (this.game.is_food(row, col)) {
          this.ctx.fillStyle = CONFIG.FOOD_COLOR;
        } else {
          this.ctx.fillStyle = CONFIG.OFF_COLOR;
        }
  
        this.ctx.fillRect(
          col * (CONFIG.CELL_SIZE + 1) + 1,
          row * (CONFIG.CELL_SIZE + 1) + 1,
          CONFIG.CELL_SIZE,
          CONFIG.CELL_SIZE
        );
      }
    }
  
    this.ctx.stroke();
  };

  tick() {
    if (this.game.is_over()) {
      this.setBestScore();
      this.restart();
    }
  
    this.setCurrentScore();
  
    this.drawGrid();
    this.drawCells();
  
    this.game.tick(this.controller.direction);
  }

  animate(func) {
    if (!this.frame.start) this.frame.start = performance.now();
    this.frame.delta = performance.now() - this.frame.start;
    
    if (this.frame.delta >= CONFIG.INTERVAL) {
      func.call();
      this.frame.start = null;
    }

    // TODO: Refactor....too much this
    requestAnimationFrame(this.animate.bind(this, func.bind(this)));
  }

  run() {
    this.animate(this.tick);
  }
}