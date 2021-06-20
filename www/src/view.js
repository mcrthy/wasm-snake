import CONFIG from './config';

export class View {
  constructor() {
    this.bestScoreText = document.getElementById("best-score");
    this.currentScoreText = document.getElementById("current-score");

    this.canvas = document.getElementById("snake-canvas");
    this.canvas.height = (CONFIG.CELL_SIZE + 1) * CONFIG.HEIGHT + 1;
    this.canvas.width = (CONFIG.CELL_SIZE + 1) * CONFIG.WIDTH + 1;

    this.ctx = this.canvas.getContext('2d');
  }

  setBestScore(score) {
    const bestScore = localStorage.getItem('bestScore');

    if (score >= bestScore) {
      localStorage.setItem('bestScore', score);
      this.bestScoreText.innerHTML = "Best: " + score;
    }
  }

  setCurrentScore(score) {
    this.currentScoreText.innerHTML = "Current: " + score;
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

  drawCells(game) {
    this.ctx.beginPath();
  
    for (let row = 0; row < CONFIG.HEIGHT; row++) {
      for (let col = 0; col < CONFIG.WIDTH; col++) {
        
        if (game.is_snake(row, col)) {
          this.ctx.fillStyle = CONFIG.SNAKE_COLOR;
        } else if (game.is_food(row, col)) {
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

  render(game) {
    this.drawGrid();
    this.drawCells(game);
  }
}