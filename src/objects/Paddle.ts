// src/objects/Paddle.ts
import {
  PADDLE_SPEED,
  DynamicGameDimensions,
} from '../constants/game';
import { AssetLoader } from '../utils/assetLoader';
import {
  DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
  GAME_VISUAL_ASSET_ROLES,
  type VisualAssetPathResolver,
} from '../utils/visualAssetResolver';
import {
  calculatePaddleAngleFromCanvasPoint,
  calculatePaddleAngleFromCanvasX,
  calculateRadialPaddleBounds,
  calculateRadialPlayfieldGeometry,
  type RadialPlayfieldGeometry,
} from '../utils/radialGeometry';
import { shouldUseReducedCanvasEffects } from '../utils/performanceMode';

const KEY_LEFT = 'ArrowLeft';
const KEY_RIGHT = 'ArrowRight';
const PADDLE_MIN_SCALE = 1;
const PADDLE_MAX_SCALE = 2;
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
  private centerAngle = PADDLE_START_CENTER_ANGLE;
  private controlCenterX: number;
  private widthScale = PADDLE_DEFAULT_SCALE;
  private geometry: RadialPlayfieldGeometry;
  private dimensions: DynamicGameDimensions;

  constructor(
    private canvasWidth: number,
    canvasHeight: number,
    dimensions: DynamicGameDimensions,
    private resolveAssetPath: VisualAssetPathResolver = DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
    geometry?: RadialPlayfieldGeometry
  ) {
    this.dimensions = dimensions;
    this.baseWidth = dimensions.paddleWidth;
    this.width = dimensions.paddleWidth;
    this.controlCenterX = canvasWidth / 2;
    this.geometry =
      geometry ?? calculateRadialPlayfieldGeometry(canvasWidth, canvasHeight, dimensions);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === KEY_LEFT) {
      this.dx = -PADDLE_SPEED;
    }
    if (event.key === KEY_RIGHT) {
      this.dx = PADDLE_SPEED;
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === KEY_LEFT || event.key === KEY_RIGHT) this.dx = 0;
  }

  setPosition(x: number) {
    this.controlCenterX = x;
    this.centerAngle = calculatePaddleAngleFromCanvasX(
      x,
      this.canvasWidth,
      this.position,
    );
    this.syncRectFromRadialPosition(false);
  }

  setPositionFromPoint(x: number, y: number) {
    this.centerAngle = calculatePaddleAngleFromCanvasPoint(
      x,
      y,
      this.position,
    );
    this.syncRectFromRadialPosition();
  }

  reset() {
    this.dx = 0;
    this.widthScale = PADDLE_DEFAULT_SCALE;
    this.centerAngle = PADDLE_START_CENTER_ANGLE;
    this.controlCenterX = this.canvasWidth / 2;
    this.syncRectFromRadialPosition();
  }

  setWidthScale(scale: number) {
    const nextScale = Math.max(PADDLE_MIN_SCALE, Math.min(PADDLE_MAX_SCALE, scale));
    this.widthScale = nextScale;
    this.syncRectFromRadialPosition();
  }

  resize(canvasWidth: number, canvasHeight: number, dimensions: DynamicGameDimensions, geometry?: RadialPlayfieldGeometry) {
    const activeScale = this.baseWidth > 0 ? this.width / this.baseWidth : PADDLE_DEFAULT_SCALE;
    const previousCanvasWidth = this.canvasWidth;

    this.canvasWidth = canvasWidth;
    this.baseWidth = dimensions.paddleWidth;
    this.dimensions = dimensions;
    this.widthScale = activeScale;
    this.geometry =
      geometry ?? calculateRadialPlayfieldGeometry(canvasWidth, canvasHeight, dimensions);
    this.controlCenterX =
      (this.controlCenterX / Math.max(1, previousCanvasWidth)) * canvasWidth;

    this.syncRectFromRadialPosition(false);
  }

  update(frameScale = 1) {
    if (this.dx !== 0) {
      const safeFrameScale = Math.max(0, Number.isFinite(frameScale) ? frameScale : 1);
      this.centerAngle -=
        ((this.dx * safeFrameScale) / this.geometry.paddleRadius) * RADIAL_PADDLE_DX_TO_ANGLE_RATIO;
      this.syncRectFromRadialPosition();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    AssetLoader.getOrLoadImage(this.resolveAssetPath(GAME_VISUAL_ASSET_ROLES.paddle));
    const paddleBounds = this.position;
    const reducedEffects = shouldUseReducedCanvasEffects(this.canvasWidth);

    ctx.save();
    ctx.lineCap = RADIAL_PADDLE_LINE_CAP;
    ctx.lineWidth = paddleBounds.radial.thickness;
    ctx.strokeStyle = RADIAL_PADDLE_FILL_COLOR;
    ctx.shadowColor = RADIAL_PADDLE_SHADOW_COLOR;
    ctx.shadowBlur = reducedEffects ? 0 : RADIAL_PADDLE_SHADOW_BLUR;
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
}
