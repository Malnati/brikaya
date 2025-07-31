// src/objects/Paddle.ts

const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const PADDLE_SPEED = 7;

export class Paddle {
  private x: number;
  private dx = 0;
  private readonly width = PADDLE_WIDTH;
  private readonly height = PADDLE_HEIGHT;

  constructor(private canvasWidth: number, private canvasHeight: number) {
    this.x = (canvasWidth - this.width) / 2;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') this.dx = -PADDLE_SPEED;
    if (event.key === 'ArrowRight') this.dx = PADDLE_SPEED;
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') this.dx = 0;
  }

  update() {
    this.x += this.dx;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvasWidth) this.x = this.canvasWidth - this.width;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(this.x, this.canvasHeight - this.height, this.width, this.height);
  }

  get position() {
    return { x: this.x, y: this.canvasHeight - this.height, width: this.width, height: this.height };
  }
}
