import { Game } from "wasm-snake";
import { Animator } from "./animator";
import CONFIG from './config';
import { Controller } from './controller';
import { View } from "./view";

export class GameManager {
  constructor() {
    this.startNewGame();

    this.view = new View();
    this.controller = new Controller();
    this.animator = new Animator();

    this.frame = {
      start: null,
      delta: null,
    }
  }

  startNewGame() {
    this.game = new Game(
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
  
  run() {
    this.animator.animate(this.tick.bind(this));
  }
}