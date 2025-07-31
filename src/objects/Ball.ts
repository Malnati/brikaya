// src/objects/Ball.ts

const BALL_RADIUS = 10;
const BALL_SPEED = 2;

export class Ball {
  private x: number;
  private y: number;
  private dx = BALL_SPEED;
  private dy = -BALL_SPEED;
  private readonly radius = BALL_RADIUS;

  constructor(private canvasWidth: number, private canvasHeight: number) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 30;
  }

  update(paddle: { position: { x: number; y: number; width: number; height: number } }, bricks: { collide: (ball: Ball) => void }, maxHeight: number) {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x + this.dx > this.canvasWidth - this.radius || this.x + this.dx < this.radius) {
      this.dx = -this.dx;
    }
    if (this.y + this.dy < this.radius) {
      this.dy = -this.dy;
    } else if (this.y + this.radius > maxHeight) {
      const paddlePos = paddle.position;
      if (this.x > paddlePos.x && this.x < paddlePos.x + paddlePos.width) {
        this.dy = -this.dy;
      }
    }

    bricks.collide(this);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
  }

  get position() {
    return { x: this.x, y: this.y, radius: this.radius };
  }

  bounceY() {
    this.dy = -this.dy;
  }
}
