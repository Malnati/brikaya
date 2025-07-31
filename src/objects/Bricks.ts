// src/objects/Bricks.ts

const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;

interface Brick {
  x: number;
  y: number;
  status: number;
}

export class Bricks {
  private bricks: Brick[][] = [];

  constructor(private rows: number, private cols: number) {
    for (let c = 0; c < cols; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < rows; r++) {
        this.bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const b = this.bricks[c][r];
        if (b.status === 1) {
          const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
          const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
          b.x = brickX;
          b.y = brickY;
          ctx.fillStyle = '#0095DD';
          ctx.fillRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
        }
      }
    }
  }

  collide(ball: { position: { x: number; y: number; radius: number }; bounceY: () => void }) {
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const b = this.bricks[c][r];
        if (b.status === 1) {
          if (
            ball.position.x > b.x &&
            ball.position.x < b.x + BRICK_WIDTH &&
            ball.position.y > b.y &&
            ball.position.y < b.y + BRICK_HEIGHT
          ) {
            ball.bounceY();
            b.status = 0;
          }
        }
      }
    }
  }
}
