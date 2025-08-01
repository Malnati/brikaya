// src/objects/Bricks.ts
import { BRICK_COLORS } from '../constants/assets';
import { DynamicGameDimensions } from '../constants/game';
import { AssetLoader } from '../utils/assetLoader';
import { collisionTracker } from '../utils/collisionTracker';
import { LOG, WARN } from '../utils/logger';

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
    maxRows?: number,
    private onMaxRowsReached?: () => void
  ) {
    this.dimensions = dimensions;
    this.rows = dimensions.brickRows;
    this.maxRows = maxRows ?? this.rows;

    LOG(`🏗️  Bricks: ${dimensions.brickCols}x${this.rows} = ${dimensions.brickCols * this.rows} blocos`);

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
    // Atualizar as posições dos blocos imediatamente após a criação
    for (let c = 0; c < dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const brickX = c * (dimensions.brickWidth + dimensions.brickPadding) + dimensions.brickOffsetLeft;
        const brickY = r * (dimensions.brickHeight + dimensions.brickPadding) + dimensions.brickOffsetTop;
        this.bricks[c][r].x = brickX;
        this.bricks[c][r].y = brickY;
      }
    }
    LOG(`✅ Bricks criados com sucesso`);
  }

  // Método para verificar se todos os blocos foram destruídos
  isAllDestroyed(): boolean {
    let activeBricks = 0;
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (this.bricks[c][r].status === BRICK_ACTIVE) {
          activeBricks++;
        }
      }
    }
    LOG(`🔍 isAllDestroyed: ${activeBricks} blocos ativos de ${this.dimensions.brickCols * this.rows} total`);
    return activeBricks === 0;
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


  addRow() {
    if (this.rows >= this.maxRows) {
      WARN(`Maximum rows limit (${this.maxRows}) reached. Cannot add more rows.`);
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

  async collide(
    ball: { 
      position: { x: number; y: number; radius: number }; 
      bounceY: () => void; 
      registerBrickHit: () => void;
      getVelocity: () => { dx: number; dy: number };
    },
    gameState?: { 
      score: number; 
      ballsCount: number; 
      bricksRemaining: number;
      gameWon: boolean;
      gameOver: boolean;
      level: number;
      canvasSize: { width: number; height: number };
      gameDimensions: {
        brickWidth: number;
        brickHeight: number;
        brickCols: number;
        brickRows: number;
        paddleWidth: number;
        paddleHeight: number;
        ballRadius: number;
      };
    }
  ): Promise<boolean> {
    let collided = false;
    let destroyedCount = 0;
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const b = this.bricks[c][r];
        if (b.status === BRICK_ACTIVE) {
          // Verificar colisão considerando o raio da bola
          const ballLeft = ball.position.x - ball.position.radius;
          const ballRight = ball.position.x + ball.position.radius;
          const ballTop = ball.position.y - ball.position.radius;
          const ballBottom = ball.position.y + ball.position.radius;
          
          const brickLeft = b.x;
          const brickRight = b.x + this.dimensions.brickWidth;
          const brickTop = b.y;
          const brickBottom = b.y + this.dimensions.brickHeight;
          
          if (
            ballRight > brickLeft &&
            ballLeft < brickRight &&
            ballBottom > brickTop &&
            ballTop < brickBottom
          ) {
            // Registrar colisão com bloco
            if (gameState) {
              const ballVelocity = ball.getVelocity();
              LOG(`🧱 Colisão com bloco detectada - Pos: (${Math.round(ball.position.x)}, ${Math.round(ball.position.y)}), Bloco: [${c}, ${r}], Cor: ${b.colorIndex}`);
              
              gameLogger.logBrickDestroyed(
                gameState,
                [{ x: ball.position.x, y: ball.position.y, velocity: ballVelocity, radius: ball.position.radius }],
                { x: 0, y: 0, width: 0, height: 0 }, // Paddle position será atualizada pelo GameEngine
                { x: b.x, y: b.y, width: this.dimensions.brickWidth, height: this.dimensions.brickHeight },
                { col: c, row: r },
                b.colorIndex,
                ball.position,
                ballVelocity
              ).catch(error => ERROR('❌ Erro ao registrar destruição de bloco:', error));
              
              collisionTracker.logBrickCollision(
                ball.position,
                ballVelocity,
                gameState,
                { x: b.x, y: b.y, width: this.dimensions.brickWidth, height: this.dimensions.brickHeight },
                { col: c, row: r },
                b.colorIndex
              ).catch(error => ERROR('❌ Erro ao registrar colisão com bloco:', error));
            }
            
            ball.bounceY();
            ball.registerBrickHit();
            b.status = BRICK_DESTROYED;
            destroyedCount++;
            if (this.onBrickDestroyed) {
              await this.onBrickDestroyed();
            }
            collided = true;
            break; // Sair do loop após a primeira colisão
          }
        }
      }
      if (collided) break; // Sair do loop externo também
    }
    if (destroyedCount > 0) {
      LOG(`💥 collide: ${destroyedCount} bloco(s) destruído(s)`);
    }
    return Promise.resolve(collided);
  }

  getRows(): number {
    return this.rows;
  }

  isBrickActive(col: number, row: number): boolean {
    if (col < 0 || col >= this.dimensions.brickCols || row < 0 || row >= this.rows) {
      return false;
    }
    return this.bricks[col][row].status === BRICK_ACTIVE;
  }
}
