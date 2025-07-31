// src/objects/Ball.ts
import { BALL_RADIUS, BALL_SPEED, GAME_COLOR } from '../constants/game';

const BALL_INITIAL_Y_OFFSET = 30;
import { ASSET_PATHS, BALL_IMAGE_SIZE } from '../constants/assets';
import { AssetLoader } from '../utils/assetLoader';

const BALL_RADIUS = 10;
const BALL_SPEED = 2;

export class Ball {
  private x: number;
  private y: number;
  private dx = BALL_SPEED;
  private dy = -BALL_SPEED;
  private readonly radius = BALL_RADIUS;

  constructor(private canvasWidth: number, canvasHeight: number) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - BALL_INITIAL_Y_OFFSET;
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
    ctx.fillStyle = GAME_COLOR;
    ctx.fill();
    ctx.closePath();

    const ballImage = AssetLoader.getImage(ASSET_PATHS.BALL);
    
    if (ballImage) {
      // Draw image centered on ball position
      const imageSize = BALL_IMAGE_SIZE.WIDTH;
      ctx.drawImage(
        ballImage, 
        this.x - imageSize / 2, 
        this.y - imageSize / 2, 
        imageSize, 
        imageSize
      );
    } else {
      // Fallback to original circle rendering
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0095DD';
      ctx.fill();
      ctx.closePath();
    }
  }

  get position() {
    return { x: this.x, y: this.y, radius: this.radius };
  }

  bounceY() {
    this.dy = -this.dy;
  }
}
