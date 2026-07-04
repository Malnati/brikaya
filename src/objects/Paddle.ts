// src/objects/Paddle.ts
import {
  PADDLE_SPEED,
  DynamicGameDimensions,
  calculateLevelInitialSpawnSpeed,
  calculateLevelMaxSpeed,
  calculateLevelMinSpeed,
  calculateLevelPreviousMaxSpeed,
  calculateSpeedReductionPerBrick
} from '../constants/game';
import { AssetLoader } from '../utils/assetLoader';
import {
  DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
  GAME_VISUAL_ASSET_ROLES,
  type VisualAssetPathResolver,
} from '../utils/visualAssetResolver';
import { gameLogger } from '../storage/gameLogger';
import { ERROR } from '../utils/logger';
import {
  calculatePaddleAngleFromCanvasX,
  calculateRadialPaddleBounds,
  calculateRadialPlayfieldGeometry,
  type RadialPlayfieldGeometry,
} from '../utils/radialGeometry';

const KEY_LEFT = 'ArrowLeft';
const KEY_RIGHT = 'ArrowRight';
const PADDLE_MIN_SCALE = 1;
const PADDLE_MAX_SCALE = 1.8;
const PADDLE_DEFAULT_SCALE = 1;
const PADDLE_START_CENTER_ANGLE = Math.PI / 2;
const RADIAL_PADDLE_LINE_CAP: CanvasLineCap = 'round';
const RADIAL_PADDLE_STROKE_COLOR = '#f8fbff';
const RADIAL_PADDLE_SHADOW_COLOR = 'rgba(0, 212, 255, 0.58)';
const RADIAL_PADDLE_SHADOW_BLUR = 14;
const RADIAL_PADDLE_FILL_COLOR = '#00d4ff';
const RADIAL_PADDLE_EDGE_COLOR = '#7df9ff';
const RADIAL_PADDLE_DX_TO_ANGLE_RATIO = 1;

export class Paddle {
  private dx = 0;
  private width: number;
  private baseWidth: number;
  private height: number;
  private previousPosition: { x: number; y: number } | null = null;
  private centerAngle = PADDLE_START_CENTER_ANGLE;
  private controlCenterX: number;
  private widthScale = PADDLE_DEFAULT_SCALE;
  private geometry: RadialPlayfieldGeometry;
  private dimensions: DynamicGameDimensions;

  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
    dimensions: DynamicGameDimensions,
    private resolveAssetPath: VisualAssetPathResolver = DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
    geometry?: RadialPlayfieldGeometry
  ) {
    this.dimensions = dimensions;
    this.baseWidth = dimensions.paddleWidth;
    this.width = dimensions.paddleWidth;
    this.height = dimensions.paddleHeight;
    this.controlCenterX = canvasWidth / 2;
    this.geometry =
      geometry ?? calculateRadialPlayfieldGeometry(canvasWidth, canvasHeight, dimensions);
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
    this.previousPosition = this.position;
    this.controlCenterX = x;
    this.centerAngle = calculatePaddleAngleFromCanvasX(
      x,
      this.canvasWidth,
      this.position,
    );
    this.syncRectFromRadialPosition(false);
    
    // Log do movimento da raquete por touch
    this.logPaddleMove('touch');
  }

  reset() {
    this.dx = 0;
    this.widthScale = PADDLE_DEFAULT_SCALE;
    this.centerAngle = PADDLE_START_CENTER_ANGLE;
    this.controlCenterX = this.canvasWidth / 2;
    this.syncRectFromRadialPosition();
    this.previousPosition = this.position;
  }

  setWidthScale(scale: number) {
    const nextScale = Math.max(PADDLE_MIN_SCALE, Math.min(PADDLE_MAX_SCALE, scale));
    this.widthScale = nextScale;
    this.syncRectFromRadialPosition();
    this.previousPosition = this.position;
  }

  resize(canvasWidth: number, canvasHeight: number, dimensions: DynamicGameDimensions, geometry?: RadialPlayfieldGeometry) {
    const activeScale = this.baseWidth > 0 ? this.width / this.baseWidth : PADDLE_DEFAULT_SCALE;
    const previousCanvasWidth = this.canvasWidth;

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.baseWidth = dimensions.paddleWidth;
    this.height = dimensions.paddleHeight;
    this.dimensions = dimensions;
    this.widthScale = activeScale;
    this.geometry =
      geometry ?? calculateRadialPlayfieldGeometry(canvasWidth, canvasHeight, dimensions);
    this.controlCenterX =
      (this.controlCenterX / Math.max(1, previousCanvasWidth)) * canvasWidth;

    this.syncRectFromRadialPosition(false);
    this.previousPosition = this.position;
  }

  update() {
    this.previousPosition = this.position;
    if (this.dx !== 0) {
      this.centerAngle -=
        (this.dx / this.geometry.paddleRadius) * RADIAL_PADDLE_DX_TO_ANGLE_RATIO;
      this.syncRectFromRadialPosition();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    AssetLoader.getOrLoadImage(this.resolveAssetPath(GAME_VISUAL_ASSET_ROLES.paddle));
    const paddleBounds = this.position;

    ctx.save();
    ctx.lineCap = RADIAL_PADDLE_LINE_CAP;
    ctx.lineWidth = paddleBounds.radial.thickness;
    ctx.strokeStyle = RADIAL_PADDLE_FILL_COLOR;
    ctx.shadowColor = RADIAL_PADDLE_SHADOW_COLOR;
    ctx.shadowBlur = RADIAL_PADDLE_SHADOW_BLUR;
    ctx.beginPath();
    ctx.arc(
      paddleBounds.radial.centerX,
      paddleBounds.radial.centerY,
      paddleBounds.radial.radius,
      paddleBounds.radial.startAngle,
      paddleBounds.radial.endAngle,
    );
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(1, paddleBounds.radial.thickness * 0.18);
    ctx.strokeStyle = RADIAL_PADDLE_EDGE_COLOR;
    ctx.stroke();
    ctx.lineWidth = Math.max(1, paddleBounds.radial.thickness * 0.08);
    ctx.strokeStyle = RADIAL_PADDLE_STROKE_COLOR;
    ctx.stroke();
    ctx.restore();
  }

  get position() {
    const paddleBounds = calculateRadialPaddleBounds(
      this.geometry,
      this.dimensions,
      this.centerAngle,
      this.widthScale,
    );

    return {
      ...paddleBounds,
      x: this.controlCenterX - paddleBounds.width / 2,
    };
  }

  private syncRectFromRadialPosition(updateControlCenter = true) {
    const paddleBounds = calculateRadialPaddleBounds(
      this.geometry,
      this.dimensions,
      this.centerAngle,
      this.widthScale,
    );
    this.centerAngle = paddleBounds.radial.centerAngle;
    if (updateControlCenter) {
      this.controlCenterX = paddleBounds.x + paddleBounds.width / 2;
    }
    this.width = paddleBounds.width;
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
        reductionPerBrick: calculateSpeedReductionPerBrick(maxSpeed, initialBrickCount, minSpeed),
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
