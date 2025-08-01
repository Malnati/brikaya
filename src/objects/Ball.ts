// src/objects/Ball.ts
import { BALL_SPEED } from '../constants/game';
import { DynamicGameDimensions } from '../constants/game';
import { ASSET_PATHS } from '../constants/assets';
import { AssetLoader } from '../utils/assetLoader';
import { collisionTracker } from '../utils/collisionTracker';
import { LOG } from '../utils/logger';

const BALL_INITIAL_Y_OFFSET = 30;
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60 graus

export class Ball {
  private x: number;
  private y: number;
  private dx = BALL_SPEED;
  private dy = -BALL_SPEED;
  private readonly radius: number;
  private blockHitsThisRun = 0;
  private paddleCollision = false;

  constructor(private canvasWidth: number, canvasHeight: number, dimensions: DynamicGameDimensions) {
    this.radius = dimensions.ballRadius;
    this.x = canvasWidth / 2;
    this.y = canvasHeight - BALL_INITIAL_Y_OFFSET;
    LOG(`⚽ Ball inicializada: pos=(${this.x}, ${this.y}), raio=${this.radius}`);
  }

  async update(
    paddle: { position: { x: number; y: number; width: number; height: number } },
    bricks: { 
      collide: (
        ball: Ball, 
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
      ) => Promise<boolean> 
    },
    maxHeight: number,
    gameState: { 
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
    this.x += this.dx;
    this.y += this.dy;

    // Colisão com as paredes laterais
    if (this.x + this.dx > this.canvasWidth - this.radius || this.x + this.dx < this.radius) {
      const wallType = this.x + this.dx > this.canvasWidth - this.radius ? 'right' : 'left';
      LOG(`🧱 Colisão com parede ${wallType} detectada em (${Math.round(this.x)}, ${Math.round(this.y)})`);
      
      const velocityBefore = { dx: this.dx, dy: this.dy };
      this.dx = -this.dx;
      const velocityAfter = { dx: this.dx, dy: this.dy };
      
      gameLogger.logCollision(
        gameState,
        [{ x: this.x, y: this.y, velocity: velocityAfter, radius: this.radius }],
        paddle.position,
        {
          type: 'wall',
          ballPosition: { x: this.x, y: this.y },
          wallType,
          velocityBefore,
          velocityAfter
        }
      ).catch(error => ERROR('❌ Erro ao registrar colisão com parede:', error));
      
      collisionTracker.logWallCollision(
        { x: this.x, y: this.y },
        velocityAfter,
        gameState,
        wallType
      ).catch(error => ERROR('❌ Erro ao registrar colisão com parede:', error));
    }
    
    // Colisão com o teto
    if (this.y + this.dy < this.radius) {
      LOG(`🏠 Colisão com teto detectada em (${Math.round(this.x)}, ${Math.round(this.y)})`);
      
      const velocityBefore = { dx: this.dx, dy: this.dy };
      this.dy = -this.dy;
      const velocityAfter = { dx: this.dx, dy: this.dy };
      
      gameLogger.logCollision(
        gameState,
        [{ x: this.x, y: this.y, velocity: velocityAfter, radius: this.radius }],
        paddle.position,
        {
          type: 'ceiling',
          ballPosition: { x: this.x, y: this.y },
          velocityBefore,
          velocityAfter
        }
      ).catch(error => ERROR('❌ Erro ao registrar colisão com teto:', error));
      
      collisionTracker.logCeilingCollision(
        { x: this.x, y: this.y },
        velocityAfter,
        gameState
      ).catch(error => ERROR('❌ Erro ao registrar colisão com teto:', error));
    }

    // PRIMEIRO: Colisão com blocos
    await bricks.collide(this, gameState);

    // DEPOIS: Colisão com a raquete ou verificação de fim de jogo
    if (this.y + this.radius > maxHeight) {
      const paddlePos = paddle.position;
      if (this.x > paddlePos.x && this.x < paddlePos.x + paddlePos.width) {
        LOG(`🏓 Bola bateu na raquete em x=${this.x}, raquete=${paddlePos.x}-${paddlePos.x + paddlePos.width}`);
        
        const hitPosition = (this.x - paddlePos.x) / paddlePos.width;
        LOG(`🏓 Registrando colisão com raquete - Hit position: ${hitPosition.toFixed(2)}`);
        
        const velocityBefore = { dx: this.dx, dy: this.dy };
        
        gameLogger.logCollision(
          gameState,
          [{ x: this.x, y: this.y, velocity: velocityBefore, radius: this.radius }],
          paddlePos,
          {
            type: 'paddle',
            ballPosition: { x: this.x, y: this.y },
            targetPosition: paddlePos,
            hitPosition
          }
        ).catch(error => ERROR('❌ Erro ao registrar colisão com raquete:', error));
        
        collisionTracker.logPaddleCollision(
          { x: this.x, y: this.y },
          velocityBefore,
          gameState,
          paddlePos,
          hitPosition
        ).catch(error => ERROR('❌ Erro ao registrar colisão com raquete:', error));
        
        this.handlePaddleCollision(paddlePos);
        this.paddleCollision = true;
        return Promise.resolve(true);
      } else {
        // A bolinha passou pela raquete
        LOG(`💀 BOLA PERDIDA! x=${this.x}, y=${this.y}, raquete=${paddlePos.x}-${paddlePos.x + paddlePos.width}`);
        
        LOG(`💀 Registrando bola perdida - Posição: (${Math.round(this.x)}, ${Math.round(this.y)})`);
        
        const lostBallVelocity = { dx: this.dx, dy: this.dy };
        
        gameLogger.logBallLost(
          gameState,
          [{ x: this.x, y: this.y, velocity: lostBallVelocity, radius: this.radius }],
          paddlePos,
          { x: this.x, y: this.y },
          lostBallVelocity
        ).catch(error => ERROR('❌ Erro ao registrar bola perdida:', error));
        
        collisionTracker.logBallLost(
          { x: this.x, y: this.y },
          lostBallVelocity,
          gameState,
          paddlePos
        ).catch(error => ERROR('❌ Erro ao registrar bola perdida:', error));
        
        return Promise.resolve(false);
      }
    }
    return Promise.resolve(true);
  }

  private handlePaddleCollision(paddlePos: { x: number; y: number; width: number; height: number }) {
    // Calcula onde na raquete a bolinha bateu (0 = borda esquerda, 1 = borda direita)
    const hitPosition = (this.x - paddlePos.x) / paddlePos.width;
    
    // Converte a posição de hit para um ângulo (-MAX_BOUNCE_ANGLE a +MAX_BOUNCE_ANGLE)
    // Isso cria uma física mais realista onde o ângulo depende da posição do hit
    const angle = (hitPosition - 0.5) * 2 * MAX_BOUNCE_ANGLE;
    
    // Calcula a velocidade total com uma pequena variação baseada na posição do hit
    // Isso torna o jogo mais dinâmico e imprevisível
    const baseSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    const speedVariation = 0.8 + (hitPosition * 0.4); // Varia entre 0.8x e 1.2x da velocidade base
    const speed = baseSpeed * speedVariation;
    
    // Aplica o novo ângulo e velocidade
    this.dx = speed * Math.sin(angle);
    this.dy = -speed * Math.cos(angle); // Sempre para cima após bater na raquete
    
    // Garante que a bolinha não fique presa na raquete
    this.y = paddlePos.y - this.radius;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const ballImage = AssetLoader.getImage(ASSET_PATHS.BALL);
    
    if (ballImage) {
      // Desenha a imagem da bolinha
      ctx.drawImage(
        ballImage,
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2
      );
    } else {
      // Fallback para círculo branco se a imagem não carregou
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.closePath();
    }
  }

  get position() {
    return { x: this.x, y: this.y, radius: this.radius };
  }

  getVelocity() {
    return { dx: this.dx, dy: this.dy };
  }

  bounceY() {
    this.dy = -this.dy;
  }

  registerBrickHit() {
    this.blockHitsThisRun += 1;
  }

  getBrickHitsThisRun() {
    return this.blockHitsThisRun;
  }

  resetBrickHits() {
    this.blockHitsThisRun = 0;
  }

  consumePaddleCollision() {
    const collided = this.paddleCollision;
    this.paddleCollision = false;
    return collided;
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setDirection(angle: number) {
    const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    this.dx = speed * Math.sin(angle);
    this.dy = -speed * Math.cos(angle);
  }
}
