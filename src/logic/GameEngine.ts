// src/logic/GameEngine.ts
import { Paddle } from '../objects/Paddle';
import { Ball } from '../objects/Ball';
import { Bricks } from '../objects/Bricks';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private animationFrame = 0;
  private paddle: Paddle;
  private ball: Ball;
  private bricks: Bricks;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D context');
    this.ctx = ctx;
    this.paddle = new Paddle(canvas.width, canvas.height);
    this.ball = new Ball(canvas.width, canvas.height);
    this.bricks = new Bricks(3, 5);
    this.setupListeners();
  }

  private setupListeners() {
    document.addEventListener('keydown', e => this.paddle.onKeyDown(e));
    document.addEventListener('keyup', e => this.paddle.onKeyUp(e));
  }

  public start() {
    this.loop();
  }

  public stop() {
    cancelAnimationFrame(this.animationFrame);
  }

  private loop = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.bricks.draw(this.ctx);
    this.paddle.update();
    this.paddle.draw(this.ctx);
    this.ball.update(this.paddle, this.bricks, this.canvas.height);
    this.ball.draw(this.ctx);
    this.animationFrame = requestAnimationFrame(this.loop);
  };
}
