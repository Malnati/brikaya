// src/objects/Bricks.ts
import { BRICK_WIDTH, BRICK_HEIGHT, BRICK_PADDING, BRICK_OFFSET_TOP, BRICK_OFFSET_LEFT, GAME_COLOR } from '../constants/game';
import { BRICK_COLORS } from '../constants/assets';
import { AssetLoader } from '../utils/assetLoader';

const BRICK_ACTIVE = 1;
const BRICK_DESTROYED = 0;

interface Brick {
  x: number;
  y: number;
  status: number;
  colorIndex: number;
}

export class Bricks {
  private bricks: Brick[][] = [];

  constructor(private rows: number, private cols: number, private onBrickDestroyed?: () => void) {
    
    for (let c = 0; c < cols; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < rows; r++) {
        this.bricks[c][r] = { 
          x: 0, 
          y: 0, 
          status: BRICK_ACTIVE,
          colorIndex: Math.floor(Math.random() * BRICK_COLORS.length)
        };
      }
    }
  }



  // Método para verificar se todos os blocos foram destruídos
  isAllDestroyed(): boolean {
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (this.bricks[c][r].status === BRICK_ACTIVE) {
          return false;
        }
      }
    }
    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const b = this.bricks[c][r];
        if (b.status === BRICK_ACTIVE) {
          const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
          const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
          b.x = brickX;
          b.y = brickY;
          
          // Desenhar a imagem do brick
          const brickImage = AssetLoader.getImage(BRICK_COLORS[b.colorIndex]);
          if (brickImage) {
            ctx.drawImage(
              brickImage,
              brickX,
              brickY,
              BRICK_WIDTH,
              BRICK_HEIGHT
            );
          } else {
            // Fallback para retângulo colorido se a imagem não carregou
            ctx.fillStyle = GAME_COLOR;
            ctx.fillRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
          }
        }
      }
    }
  }

  collide(ball: { position: { x: number; y: number; radius: number }; bounceY: () => void }) {
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const b = this.bricks[c][r];
        if (b.status === BRICK_ACTIVE) {
          if (
            ball.position.x > b.x &&
            ball.position.x < b.x + BRICK_WIDTH &&
            ball.position.y > b.y &&
            ball.position.y < b.y + BRICK_HEIGHT
          ) {
            ball.bounceY();
            b.status = BRICK_DESTROYED;
            if (this.onBrickDestroyed) {
              this.onBrickDestroyed();
            }
          }
        }
      }
    }
  }
}
