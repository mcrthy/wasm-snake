import CONFIG from './config';

export class Animator {
  constructor() {
    this.frame = {
      start: null,
      delta: null,
    }
  }

  animate(func) {
    if (!this.frame.start) this.frame.start = performance.now();
    this.frame.delta = performance.now() - this.frame.start;
    
    if (this.frame.delta >= CONFIG.INTERVAL) {
      func.call();
      this.frame.start = null;
    }

    requestAnimationFrame(this.animate.bind(this, func.bind(this)));
  }
}