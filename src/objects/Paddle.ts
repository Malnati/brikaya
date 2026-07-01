// src/objects/Paddle.ts
import {
  PADDLE_SPEED,
  GAME_COLOR,
  DynamicGameDimensions,
  calculateLevelInitialSpawnSpeed,
  calculateLevelMaxSpeed,
  calculateLevelMinSpeed,
  calculateLevelPreviousMaxSpeed,
  calculateSpeedReductionPerBrick
} from '../constants/game';
import { ASSET_PATHS } from '../constants/assets';
import { AssetLoader } from '../utils/assetLoader';
import { gameLogger } from '../storage/gameLogger';
import { ERROR } from '../utils/logger';

const KEY_LEFT = 'ArrowLeft';
const KEY_RIGHT = 'ArrowRight';
const PADDLE_MIN_SCALE = 1;
const PADDLE_MAX_SCALE = 1.8;

export class Paddle {
  private x: number;
  private dx = 0;
  private width: number;
  private readonly baseWidth: number;
  private readonly height: number;
  private previousPosition: { x: number; y: number } | null = null;

  constructor(private canvasWidth: number, private canvasHeight: number, dimensions: DynamicGameDimensions) {
    this.baseWidth = dimensions.paddleWidth;
    this.width = dimensions.paddleWidth;
    this.height = dimensions.paddleHeight;
    this.x = (canvasWidth - this.width) / 2;
    this.previousPosition = this.position;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === KEY_LEFT) {
      this.dx = -PADDLE_SPEED;
      this.logPaddleMove('left');
    }
    if (event.key === KEY_RIGHT) {
      this.dx = PADDLE_SPEED;
      this.logPaddleMove('right');
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === KEY_LEFT || event.key === KEY_RIGHT) this.dx = 0;
  }

  setPosition(x: number) {
    // Centralizar a raquete na posição do touch
    this.previousPosition = this.position;
    this.x = x - this.width / 2;
    
    // Manter dentro dos limites do canvas
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvasWidth) this.x = this.canvasWidth - this.width;
    
    // Log do movimento da raquete por touch
    this.logPaddleMove('touch');
  }

  reset() {
    this.dx = 0;
    this.width = this.baseWidth;
    this.x = (this.canvasWidth - this.width) / 2;
    this.previousPosition = this.position;
  }

  setWidthScale(scale: number) {
    const nextScale = Math.max(PADDLE_MIN_SCALE, Math.min(PADDLE_MAX_SCALE, scale));
    const centerX = this.x + this.width / 2;
    this.width = this.baseWidth * nextScale;
    this.x = centerX - this.width / 2;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this.canvasWidth) this.x = this.canvasWidth - this.width;
    this.previousPosition = this.position;
  }

  update() {
    this.previousPosition = this.position;
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

  private logPaddleMove(direction: 'left' | 'right' | 'touch') {
    const level = 1;
    const initialBrickCount = 1;
    const initialSpawnSpeed = calculateLevelInitialSpawnSpeed(this.canvasWidth, level);
    const maxSpeed = calculateLevelMaxSpeed(this.canvasWidth, level);
    const minSpeed = calculateLevelMinSpeed(this.canvasWidth, level);

    // Log do movimento da raquete - dados básicos, serão complementados pelo GameEngine
    const gameState = {
      score: 0,
      ballsCount: 1,
      bricksRemaining: 0,
      gameWon: false,
      gameOver: false,
      level: 1,
      canvasSize: { width: this.canvasWidth, height: this.canvasHeight },
      gameDimensions: {
        brickWidth: 75,
        brickHeight: 20,
        brickCols: 5,
        brickRows: 3,
        paddleWidth: this.width,
        paddleHeight: this.height,
        ballRadius: 10
      },
      speedState: {
        level,
        initialBrickCount,
        successfulBrickHits: 0,
        initialSpawnSpeed,
        maxSpeed,
        minSpeed,
        currentSpeed: initialSpawnSpeed,
        reductionPerBrick: calculateSpeedReductionPerBrick(maxSpeed, initialBrickCount),
        previousLevelMaxSpeed: calculateLevelPreviousMaxSpeed(this.canvasWidth, level),
        levelStartedAt: Date.now(),
        elapsedLevelMs: 0,
        minReached: false
      }
    };
    
    const ballPositions = [{ x: 0, y: 0, velocity: { dx: 0, dy: 0 }, radius: 10 }];
    const paddlePosition = this.position;
    
    // Log assíncrono para não bloquear o movimento
    setTimeout(() => {
      gameLogger.logPaddleMove(
        gameState,
        ballPositions,
        paddlePosition,
        direction as 'left' | 'right',
        this.previousPosition || undefined
      ).catch(error => ERROR('❌ Erro ao registrar movimento da raquete:', error));
    }, 0);
  }
}
