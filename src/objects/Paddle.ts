// src/objects/Paddle.ts
import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED, GAME_COLOR } from '../constants/game';

const KEY_LEFT = 'ArrowLeft';
const KEY_RIGHT = 'ArrowRight';

import { ASSET_PATHS, PADDLE_IMAGE_SIZE } from '../constants/assets';
import { AssetLoader } from '../utils/assetLoader';

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
    if (event.key === KEY_LEFT) this.dx = -PADDLE_SPEED;
    if (event.key === KEY_RIGHT) this.dx = PADDLE_SPEED;
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === KEY_LEFT || event.key === KEY_RIGHT) this.dx = 0;
  }

  update() {
    this.x += this.dx;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvasWidth) this.x = this.canvasWidth - this.width;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = GAME_COLOR;
    ctx.fillRect(this.x, this.canvasHeight - this.height, this.width, this.height);

    const paddleImage = AssetLoader.getImage(ASSET_PATHS.PADDLE);
    
    if (paddleImage) {
      // Draw image at paddle position
      ctx.drawImage(
        paddleImage,
        this.x,
        this.canvasHeight - this.height,
        this.width,
        this.height
      );
    } else {
      // Fallback to original rectangle rendering
      ctx.fillStyle = '#0095DD';
      ctx.fillRect(this.x, this.canvasHeight - this.height, this.width, this.height);
    }
  }

  get position() {
    return { x: this.x, y: this.canvasHeight - this.height, width: this.width, height: this.height };
  }
}
