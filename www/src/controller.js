import { Direction } from "wasm-snake";

export class Controller {
  constructor() {
    window.addEventListener('keydown', (e) => {
      if (e.key == 'w') {
        this.direction = Direction.Up;
      } else if (e.key == 's') {
        this.direction = Direction.Down;
      } else if (e.key == 'd') {
        this.direction = Direction.Right;
      } else if (e.key == 'a') {
        this.direction = Direction.Left
      }
    })
  }
}