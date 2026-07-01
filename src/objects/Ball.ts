// src/objects/Ball.ts
import {
  calculateClampedSpeed,
  calculateInitialBallSpeed,
  DynamicGameDimensions,
  PhaseSpeedConfig,
  roundSpeedValue,
  SpeedReductionSnapshot,
  SpeedStateSnapshot
} from '../constants/game';
import { ASSET_PATHS } from '../constants/assets';
import { AssetLoader } from '../utils/assetLoader';
import { collisionTracker } from '../utils/collisionTracker';
import { ERROR, LOG } from '../utils/logger';
import { gameLogger, type LoggedGameState } from '../storage/gameLogger';
import { GAME_AUDIO_IDS, type GameAudioSink } from '../constants/audio';

const BALL_INITIAL_Y_OFFSET = 30;
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60 graus
const PADDLE_EDGE_ZONE_RATIO = 0.2;

export class Ball {
  private x: number;
  private y: number;
  private dx: number;
  private dy: number;
  private radius: number;
  private blockHitsThisRun = 0;
  private paddleCollision = false;
  private level = 1;
  private maxSpeed = 0;
  private minSpeed = 0;
  private initialSpawnSpeed = 0;
  private currentSpeed = 0;
  private reductionPerBrick = 0;
  private initialBrickCount = 0;
  private previousLevelMaxSpeed = 0;
  private levelStartedAt = Date.now();
  private lastSpeedReduction: SpeedReductionSnapshot | null = null;

  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
    private dimensions: DynamicGameDimensions,
    private speedMultiplier = 1
  ) {
    this.radius = this.dimensions.ballRadius;
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight - BALL_INITIAL_Y_OFFSET;
    const initialSpeed = calculateInitialBallSpeed(this.canvasWidth) * this.speedMultiplier;
    this.dx = initialSpeed;
    this.dy = -initialSpeed;
    this.currentSpeed = initialSpeed;
    this.initialSpawnSpeed = initialSpeed;
    this.maxSpeed = initialSpeed;
    this.minSpeed = initialSpeed;
    this.previousLevelMaxSpeed = initialSpeed;
    LOG(`⚽ Ball inicializada: pos=(${this.x}, ${this.y}), raio=${this.radius}`);
  }

  resetForLevel(
    canvasWidth: number,
    canvasHeight: number,
    dimensions: DynamicGameDimensions,
    speedMultiplier: number
  ): void {
    const initialSpeed = calculateInitialBallSpeed(canvasWidth) * speedMultiplier;

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.dimensions = dimensions;
    this.speedMultiplier = speedMultiplier;
    this.radius = dimensions.ballRadius;
    this.x = canvasWidth / 2;
    this.y = canvasHeight - BALL_INITIAL_Y_OFFSET;
    this.dx = initialSpeed;
    this.dy = -initialSpeed;
    this.currentSpeed = initialSpeed;
    this.initialSpawnSpeed = initialSpeed;
    this.maxSpeed = initialSpeed;
    this.minSpeed = initialSpeed;
    this.previousLevelMaxSpeed = initialSpeed;
    this.blockHitsThisRun = 0;
    this.paddleCollision = false;
    this.lastSpeedReduction = null;
  }

  applyPhaseSpeedConfig(config: PhaseSpeedConfig): void {
    this.level = config.level;
    this.initialBrickCount = config.initialBrickCount;
    this.initialSpawnSpeed = config.initialSpawnSpeed;
    this.maxSpeed = config.maxSpeed;
    this.minSpeed = config.minSpeed;
    this.reductionPerBrick = config.reductionPerBrick;
    this.previousLevelMaxSpeed = config.previousLevelMaxSpeed;
    this.levelStartedAt = config.levelStartedAt;
    this.blockHitsThisRun = 0;
    this.lastSpeedReduction = null;

    this.setVelocityFromAngleAndSpeed(this.getCurrentAngle(), this.initialSpawnSpeed, false);
  }

  async update(
    paddle: { position: { x: number; y: number; width: number; height: number } },
    bricks: { 
      collide: (
        ball: Ball, 
        gameState?: LoggedGameState
      ) => Promise<boolean> 
    },
    maxHeight: number,
    gameState: LoggedGameState,
    audioSink?: GameAudioSink
  ): Promise<boolean> {
    this.x += this.dx;
    this.y += this.dy;

    // Colisão com as paredes laterais
    if (this.x + this.dx > this.canvasWidth - this.radius || this.x + this.dx < this.radius) {
      const wallType = this.x + this.dx > this.canvasWidth - this.radius ? 'right' : 'left';
      LOG(`🧱 Colisão com parede ${wallType} detectada em (${Math.round(this.x)}, ${Math.round(this.y)})`);
      
      audioSink?.playAudio(GAME_AUDIO_IDS.WALL_HIT);
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
      ).catch((error) => ERROR('❌ Erro ao registrar colisão com parede:', error)); 
      
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
      
      audioSink?.playAudio(GAME_AUDIO_IDS.CEILING_HIT);
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
        const paddleAudioId = hitPosition <= PADDLE_EDGE_ZONE_RATIO || hitPosition >= 1 - PADDLE_EDGE_ZONE_RATIO
          ? GAME_AUDIO_IDS.PADDLE_HIT_EDGE
          : GAME_AUDIO_IDS.PADDLE_HIT_CENTER;
        audioSink?.playAudio(paddleAudioId);
        LOG(`🏓 Registrando colisão com raquete - Hit position: ${hitPosition.toFixed(2)}`);
        
        const velocityBefore = { dx: this.dx, dy: this.dy };
        this.handlePaddleCollision(paddlePos);
        const velocityAfter = { dx: this.dx, dy: this.dy };
        
        gameLogger.logCollision(
          gameState,
          [{ x: this.x, y: this.y, velocity: velocityAfter, radius: this.radius }],
          paddlePos,
          {
            type: 'paddle',
            ballPosition: { x: this.x, y: this.y },
            targetPosition: paddlePos,
            hitPosition,
            velocityBefore,
            velocityAfter
          }
        ).catch(error => ERROR('❌ Erro ao registrar colisão com raquete:', error));
        
        collisionTracker.logPaddleCollision(
          { x: this.x, y: this.y },
          velocityAfter,
          gameState,
          paddlePos,
          hitPosition
        ).catch(error => ERROR('❌ Erro ao registrar colisão com raquete:', error));

        this.paddleCollision = true;
        return Promise.resolve(true);
      } else {
        // A bolinha passou pela raquete
        LOG(`💀 BOLA PERDIDA! x=${this.x}, y=${this.y}, raquete=${paddlePos.x}-${paddlePos.x + paddlePos.width}`);
        
        LOG(`💀 Registrando bola perdida - Posição: (${Math.round(this.x)}, ${Math.round(this.y)})`);
        
        audioSink?.playAudio(GAME_AUDIO_IDS.BALL_LOST);
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

    // Mantém a função da raquete sobre o ângulo, mas não deixa a magnitude sair
    // da faixa [minSpeed, maxSpeed] da fase atual.
    const desiredSpeed = this.getCurrentSpeedMagnitude();
    const clampedSpeed = calculateClampedSpeed(desiredSpeed, this.minSpeed, this.maxSpeed);

    // Aplica o novo ângulo e velocidade clampada
    this.setVelocityFromAngleAndSpeed(angle, clampedSpeed);
    
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

  getCurrentSpeedMagnitude() {
    return calculateClampedSpeed(
      this.currentSpeed || Math.sqrt(this.dx * this.dx + this.dy * this.dy),
      this.minSpeed || 0,
      Number.MAX_SAFE_INTEGER
    );
  }

  bounceY() {
    this.dy = -this.dy;
  }

  registerBrickHit() {
    this.blockHitsThisRun += 1;
    this.reduceSpeedAfterBrickHit();
  }

  getBrickHitsThisRun() {
    return this.blockHitsThisRun;
  }

  resetBrickHits() {
    this.blockHitsThisRun = 0;
  }

  getLastSpeedReduction() {
    return this.lastSpeedReduction;
  }

  getSpeedStateSnapshot(): SpeedStateSnapshot {
    const currentSpeed = this.getCurrentSpeedMagnitude();
    return {
      level: this.level,
      initialBrickCount: this.initialBrickCount,
      successfulBrickHits: this.blockHitsThisRun,
      initialSpawnSpeed: this.initialSpawnSpeed,
      maxSpeed: this.maxSpeed,
      minSpeed: this.minSpeed,
      currentSpeed,
      reductionPerBrick: this.reductionPerBrick,
      previousLevelMaxSpeed: this.previousLevelMaxSpeed,
      levelStartedAt: this.levelStartedAt,
      elapsedLevelMs: Math.max(0, Date.now() - this.levelStartedAt),
      minReached: currentSpeed <= this.minSpeed
    };
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
    this.setVelocityFromAngleAndSpeed(angle, this.getCurrentSpeedMagnitude());
  }

  createClone(angleOffset: number): Ball {
    const clone = new Ball(this.canvasWidth, this.canvasHeight, this.dimensions, this.speedMultiplier);
    clone.x = this.x;
    clone.y = this.y;
    clone.level = this.level;
    clone.maxSpeed = this.maxSpeed;
    clone.minSpeed = this.minSpeed;
    clone.initialSpawnSpeed = this.initialSpawnSpeed;
    clone.currentSpeed = this.currentSpeed;
    clone.reductionPerBrick = this.reductionPerBrick;
    clone.initialBrickCount = this.initialBrickCount;
    clone.previousLevelMaxSpeed = this.previousLevelMaxSpeed;
    clone.levelStartedAt = this.levelStartedAt;
    clone.setVelocityFromAngleAndSpeed(this.getCurrentAngle() + angleOffset, this.getCurrentSpeedMagnitude(), false);
    return clone;
  }

  multiplyVelocity(multiplier: number) {
    const nextSpeed = roundSpeedValue(this.getCurrentSpeedMagnitude() * multiplier);
    const angle = this.getCurrentAngle();
    this.currentSpeed = nextSpeed;
    this.dx = nextSpeed * Math.sin(angle);
    this.dy = -nextSpeed * Math.cos(angle);
  }

  private setVelocityFromAngleAndSpeed(angle: number, speed: number, clampMax = true) {
    const maxSpeed = clampMax ? this.maxSpeed || speed : Math.max(speed, this.maxSpeed || speed);
    const clampedSpeed = calculateClampedSpeed(speed, this.minSpeed, maxSpeed);
    this.currentSpeed = clampedSpeed;
    this.dx = clampedSpeed * Math.sin(angle);
    this.dy = -clampedSpeed * Math.cos(angle);
  }

  private getCurrentAngle() {
    return Math.atan2(this.dx, -this.dy);
  }

  private reduceSpeedAfterBrickHit() {
    const speedBefore = this.getCurrentSpeedMagnitude();
    const nextSpeed = roundSpeedValue(Math.max(this.minSpeed, speedBefore - this.reductionPerBrick));
    const reductionApplied = roundSpeedValue(speedBefore - nextSpeed);

    this.setVelocityFromAngleAndSpeed(this.getCurrentAngle(), nextSpeed, false);
    this.lastSpeedReduction = {
      level: this.level,
      hitNumber: this.blockHitsThisRun,
      speedBefore,
      speedAfter: nextSpeed,
      reductionApplied,
      minSpeed: this.minSpeed,
      maxSpeed: this.maxSpeed,
      minReached: nextSpeed <= this.minSpeed,
      elapsedLevelMs: Math.max(0, Date.now() - this.levelStartedAt)
    };
  }
}
