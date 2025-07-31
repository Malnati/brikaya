// src/objects/Paddle.ts
import { PADDLE_SPEED, GAME_COLOR } from '../constants/game';
import { DynamicGameDimensions } from '../constants/game';
import { ASSET_PATHS } from '../constants/assets';
import { AssetLoader } from '../utils/assetLoader';

const KEY_LEFT = 'ArrowLeft';
const KEY_RIGHT = 'ArrowRight';

export class Paddle {
  private x: number;
  private dx = 0;
  private readonly width: number;
  private readonly height: number;

  constructor(private canvasWidth: number, private canvasHeight: number, dimensions: DynamicGameDimensions) {
    this.width = dimensions.paddleWidth;
    this.height = dimensions.paddleHeight;
    this.x = (canvasWidth - this.width) / 2;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === KEY_LEFT) this.dx = -PADDLE_SPEED;
    if (event.key === KEY_RIGHT) this.dx = PADDLE_SPEED;
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === KEY_LEFT || event.key === KEY_RIGHT) this.dx = 0;
  }

  setPosition(x: number) {
    // Centralizar a raquete na posição do touch
    this.x = x - this.width / 2;
    
    // Manter dentro dos limites do canvas
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvasWidth) this.x = this.canvasWidth - this.width;
  }

  update() {
    this.x += this.dx;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvasWidth) this.x = this.canvasWidth - this.width;
  }

  draw(ctx: CanvasRenderingContext2D) {
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
      ctx.fillStyle = GAME_COLOR;
      ctx.fillRect(this.x, this.canvasHeight - this.height, this.width, this.height);
    }
  }

  get position() {
    return { x: this.x, y: this.canvasHeight - this.height, width: this.width, height: this.height };
  }
}
