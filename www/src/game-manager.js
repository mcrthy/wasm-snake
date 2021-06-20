import { Game } from "wasm-snake";
import CONFIG from './config';
import { Controller } from './controller';
import { View } from "./view";

export class GameManager {
  constructor() {
    this.startNewGame();

    this.view = new View();
    this.controller = new Controller();

    this.frame = {
      start: null,
      delta: null,
    }
  }

  startNewGame() {
    this.game = Game.new(
      CONFIG.WIDTH,
      CONFIG.HEIGHT,
      CONFIG.DIRECTION,
    )
  };

  tick() {
    if (this.game.is_over()) {
      this.view.setBestScore(this.game.score());
      this.startNewGame();
    }
  
    this.view.setCurrentScore(this.game.score());
    this.view.render(this.game);
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