// src/objects/PowerUp.ts
import { GAME_COLOR } from '../constants/game';
import { type PowerUpType } from '../constants/powerUps';
import { AssetLoader } from '../utils/assetLoader';
import {
  DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
  GAME_VISUAL_ASSET_ROLES,
  type GameVisualAssetRole,
  type VisualAssetPathResolver,
} from '../utils/visualAssetResolver';

const POWER_UP_SIZE = 18;
const POWER_UP_FALL_SPEED = 1.2;
const POWER_UP_CORNER_RADIUS = 5;
const POWER_UP_LABEL_FONT = 'bold 11px Arial';
const POWER_UP_TEXT_COLOR = '#001014';
const POWER_UP_WIDE_PADDLE_COLOR = '#00d4ff';
const POWER_UP_SLOW_BALL_COLOR = '#ffdf4d';
const POWER_UP_MULTIBALL_COLOR = '#ff4b89';
const POWER_UP_LASER_FAN_COLOR = '#f5f7ff';
const POWER_UP_DEFAULT_COLOR = GAME_COLOR;
const POWER_UP_LABELS: Record<PowerUpType, string> = {
  multiball: 'M',
  wide_paddle: 'W',
  slow_ball: 'S',
  laser_fan: 'L',
};
const POWER_UP_COLORS: Record<PowerUpType, string> = {
  multiball: POWER_UP_MULTIBALL_COLOR,
  wide_paddle: POWER_UP_WIDE_PADDLE_COLOR,
  slow_ball: POWER_UP_SLOW_BALL_COLOR,
  laser_fan: POWER_UP_LASER_FAN_COLOR,
};
const POWER_UP_ASSET_ROLES = {
  multiball: GAME_VISUAL_ASSET_ROLES.powerupMultiball,
  wide_paddle: GAME_VISUAL_ASSET_ROLES.powerupWidePaddle,
  slow_ball: GAME_VISUAL_ASSET_ROLES.powerupSlowBall,
  laser_fan: GAME_VISUAL_ASSET_ROLES.powerupLaserFan,
} as const satisfies Record<PowerUpType, GameVisualAssetRole>;

interface PaddleBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + size - radius, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
  ctx.lineTo(x + size, y + size - radius);
  ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
  ctx.lineTo(x + radius, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export class PowerUp {
  private y: number;

  constructor(
    private x: number,
    startY: number,
    private type: PowerUpType,
    private resolveAssetPath: VisualAssetPathResolver = DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
  ) {
    this.y = startY;
  }

  update(): void {
    this.y += POWER_UP_FALL_SPEED;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const left = this.x - POWER_UP_SIZE / 2;
    const top = this.y - POWER_UP_SIZE / 2;
    const icon = AssetLoader.getImage(
      this.resolveAssetPath(POWER_UP_ASSET_ROLES[this.type]),
    );

    if (icon) {
      ctx.drawImage(icon, left, top, POWER_UP_SIZE, POWER_UP_SIZE);
      return;
    }

    drawRoundedRect(ctx, left, top, POWER_UP_SIZE, POWER_UP_CORNER_RADIUS);
    ctx.fillStyle = POWER_UP_COLORS[this.type] || POWER_UP_DEFAULT_COLOR;
    ctx.fill();
    ctx.fillStyle = POWER_UP_TEXT_COLOR;
    ctx.font = POWER_UP_LABEL_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(POWER_UP_LABELS[this.type], this.x, this.y + 1);
  }

  intersects(paddle: PaddleBounds): boolean {
    const left = this.x - POWER_UP_SIZE / 2;
    const right = this.x + POWER_UP_SIZE / 2;
    const top = this.y - POWER_UP_SIZE / 2;
    const bottom = this.y + POWER_UP_SIZE / 2;
    return right >= paddle.x && left <= paddle.x + paddle.width && bottom >= paddle.y && top <= paddle.y + paddle.height;
  }

  isOutOfBounds(canvasHeight: number): boolean {
    return this.y - POWER_UP_SIZE / 2 > canvasHeight;
  }

  getType(): PowerUpType {
    return this.type;
  }
}
