// src/objects/Bricks.ts
import { BRICK_COLORS } from '../constants/assets';
import { DynamicGameDimensions } from '../constants/game';
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
  private dimensions: DynamicGameDimensions;
  private rows: number;
  private maxRows: number;

  constructor(
    dimensions: DynamicGameDimensions,
    private onBrickDestroyed?: () => void,
    maxRows?: number
  ) {
    this.dimensions = dimensions;
    this.rows = dimensions.brickRows;
    this.maxRows = maxRows ?? this.rows;

    for (let c = 0; c < dimensions.brickCols; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.rows; r++) {
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
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (this.bricks[c][r].status === BRICK_ACTIVE) {
          return false;
        }
      }
    }
    return true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const b = this.bricks[c][r];
        if (b.status === BRICK_ACTIVE) {
          const brickX = c * (this.dimensions.brickWidth + this.dimensions.brickPadding) + this.dimensions.brickOffsetLeft;
          const brickY = r * (this.dimensions.brickHeight + this.dimensions.brickPadding) + this.dimensions.brickOffsetTop;
          b.x = brickX;
          b.y = brickY;
          
          // Desenhar a imagem do brick
          const brickImage = AssetLoader.getImage(BRICK_COLORS[b.colorIndex]);
          if (brickImage) {
            ctx.drawImage(
              brickImage,
              brickX,
              brickY,
              this.dimensions.brickWidth,
              this.dimensions.brickHeight
            );
          } else {
            // Fallback para retângulo colorido se a imagem não carregou
            ctx.fillStyle = '#00d4ff';
            ctx.fillRect(brickX, brickY, this.dimensions.brickWidth, this.dimensions.brickHeight);
          }
        }
      }
    }
  }


  collide(ball: { position: { x: number; y: number; radius: number }; bounceY: () => void; registerBrickHit: () => void }) {
  addRow() {
    if (this.rows >= this.maxRows) {
      console.warn(`Maximum rows limit (${this.maxRows}) reached. Cannot add more rows.`);
      if (this.onMaxRowsReached) {
        this.onMaxRowsReached();
      }
      return;
    }
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      this.bricks[c].unshift({
        x: 0,
        y: 0,
        status: BRICK_ACTIVE,
        colorIndex: Math.floor(Math.random() * BRICK_COLORS.length)
      });
    }
    this.rows += 1;
  }

  collide(ball: { position: { x: number; y: number; radius: number }; bounceY: () => void }): boolean {
    let collided = false;
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const b = this.bricks[c][r];
        if (b.status === BRICK_ACTIVE) {
          if (
            ball.position.x > b.x &&
            ball.position.x < b.x + this.dimensions.brickWidth &&
            ball.position.y > b.y &&
            ball.position.y < b.y + this.dimensions.brickHeight
          ) {
            ball.bounceY();
            ball.registerBrickHit();
            b.status = BRICK_DESTROYED;
            if (this.onBrickDestroyed) {
              this.onBrickDestroyed();
            }
            collided = true;
          }
        }
      }
    }
    return collided;
  }
}
