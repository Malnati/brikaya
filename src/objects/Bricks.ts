// src/objects/Bricks.ts
import {
  DynamicGameDimensions,
  SpeedReductionSnapshot,
} from "../constants/game";
import { gameLogger, type LoggedGameState } from "../storage/gameLogger";
import { AssetLoader } from "../utils/assetLoader";
import { collisionTracker } from "../utils/collisionTracker";
import { ERROR, LOG, WARN } from "../utils/logger";
import {
  DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
  GAME_VISUAL_ASSET_ROLES,
  type GameVisualAssetRole,
  type VisualAssetPathResolver,
} from "../utils/visualAssetResolver";
import {
  calculateRadialBrickSegment,
  isCircleIntersectingRadialSegment,
  type RadialBrickSegment,
  type RadialPlayfieldGeometry,
  type RectBounds,
} from "../utils/radialGeometry";
import { shouldUseReducedCanvasEffects } from "../utils/performanceMode";

const BRICK_ACTIVE = 1;
const BRICK_DESTROYED = 0;
const FIRST_INDEX = 0;
const RANDOM_SELECTION_OFFSET = 1;
const BRICK_KIND_BASIC = "basic";
const BRICK_KIND_METAL = "metal";
const BRICK_KIND_EVASIVE = "evasive";
const BASIC_BRICK_HITS = 1;
const METAL_BRICK_HITS = 3;
const METAL_BRICK_DENTED_ONE_HITS = 2;
const METAL_BRICK_DENTED_TWO_HITS = 1;
const METAL_BRICK_MIN_COUNT = 0;
const METAL_BRICK_MAX_COUNT = 3;
const EVASIVE_BRICK_COUNT = 3;
const RADIAL_BRICK_FALLBACK_COLORS = [
  "#ff5d73",
  "#45d7ff",
  "#45f08f",
  "#ffd166",
  "#b873ff",
] as const;
const RADIAL_BRICK_METAL_COLOR = "#aeb7c2";
const RADIAL_BRICK_STROKE_COLOR = "rgba(255, 255, 255, 0.42)";
const RADIAL_BRICK_SHADOW_COLOR = "rgba(0, 212, 255, 0.22)";
const RADIAL_BRICK_SHADOW_BLUR = 8;
const RADIAL_BRICK_LINE_WIDTH = 1.4;
const BRICK_ASSET_ROLES = [
  GAME_VISUAL_ASSET_ROLES.brickRed,
  GAME_VISUAL_ASSET_ROLES.brickBlue,
  GAME_VISUAL_ASSET_ROLES.brickGreen,
  GAME_VISUAL_ASSET_ROLES.brickYellow,
  GAME_VISUAL_ASSET_ROLES.brickPurple,
] as const satisfies readonly GameVisualAssetRole[];

type BrickKind =
  typeof BRICK_KIND_BASIC | typeof BRICK_KIND_METAL | typeof BRICK_KIND_EVASIVE;

interface Brick {
  x: number;
  y: number;
  status: number;
  colorIndex: number;
  kind: BrickKind;
  hitsRemaining: number;
  isTouching: boolean;
  hasEvaded: boolean;
}

export interface DestroyedBrickSnapshot {
  col: number;
  row: number;
  colorIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Bricks {
  private bricks: Brick[][] = [];
  private dimensions: DynamicGameDimensions;
  private rows: number;
  private maxRows: number;

  constructor(
    dimensions: DynamicGameDimensions,
    private onBrickDestroyed?: (colorIndex: number) => void,
    maxRows?: number,
    private onMaxRowsReached?: () => void,
    private resolveAssetPath: VisualAssetPathResolver = DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
    private random: () => number = Math.random,
    private geometry?: RadialPlayfieldGeometry,
  ) {
    this.dimensions = dimensions;
    this.rows = dimensions.brickRows;
    this.maxRows = maxRows ?? this.rows;

    LOG(
      `🏗️  Bricks: ${dimensions.brickCols}x${this.rows} = ${dimensions.brickCols * this.rows} blocos`,
    );

    for (let c = 0; c < dimensions.brickCols; c++) {
      this.bricks[c] = [];
      for (let r = 0; r < this.rows; r++) {
        this.bricks[c][r] = {
          x: 0,
          y: 0,
          status: BRICK_ACTIVE,
          colorIndex: this.getRandomColorIndex(),
          kind: BRICK_KIND_BASIC,
          hitsRemaining: BASIC_BRICK_HITS,
          isTouching: false,
          hasEvaded: false,
        };
      }
    }
    // Atualizar as posições dos blocos imediatamente após a criação
    for (let c = 0; c < dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const bounds = this.getBrickBounds(c, r);
        this.bricks[c][r].x = bounds.x;
        this.bricks[c][r].y = bounds.y;
      }
    }
    this.assignRandomMetalBricks();
    this.assignRandomEvasiveBricks();
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
    LOG(
      `🔍 isAllDestroyed: ${activeBricks} blocos ativos de ${this.dimensions.brickCols * this.rows} total`,
    );
    return activeBricks === 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const b = this.bricks[c][r];
        if (b.status === BRICK_ACTIVE) {
          const brickX =
            c * (this.dimensions.brickWidth + this.dimensions.brickPadding) +
            this.dimensions.brickOffsetLeft;
          const brickY =
            r * (this.dimensions.brickHeight + this.dimensions.brickPadding) +
            this.dimensions.brickOffsetTop;
          const bounds = this.getBrickBounds(c, r);
          b.x = bounds.x;
          b.y = bounds.y;

          this.drawBrick(ctx, b, brickX, brickY, c, r);
        }
      }
    }
  }

  addRow() {
    if (this.rows >= this.maxRows) {
      WARN(
        `Maximum rows limit (${this.maxRows}) reached. Cannot add more rows.`,
      );
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
        colorIndex: this.getRandomColorIndex(),
        kind: BRICK_KIND_BASIC,
        hitsRemaining: BASIC_BRICK_HITS,
        isTouching: false,
        hasEvaded: false,
      });
    }
    this.rows += 1;
  }

  resize(
    dimensions: DynamicGameDimensions,
    maxRows?: number,
    geometry?: RadialPlayfieldGeometry,
  ) {
    this.dimensions = {
      ...dimensions,
      brickCols: this.bricks.length,
      brickRows: this.rows,
    };
    this.maxRows = Math.max(this.rows, maxRows ?? this.maxRows);
    this.geometry = geometry ?? this.geometry;
  }

  collide(
    ball: {
      position: { x: number; y: number; radius: number };
      bounceY: () => void;
      bounceFromRadialBrick?: (targetX: number, targetY: number) => void;
      registerBrickHit: () => void;
      getVelocity: () => { dx: number; dy: number };
      getSpeedStateSnapshot: () => LoggedGameState["speedState"];
      getLastSpeedReduction: () => SpeedReductionSnapshot | null;
    },
    gameState?: LoggedGameState,
  ): boolean {
    let collided = false;
    let destroyedCount = 0;
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const b = this.bricks[c][r];
        if (b.status === BRICK_ACTIVE) {
          const segment = this.getRadialBrickSegment(c, r);
          const targetPosition = segment?.bounds ?? {
            x: b.x,
            y: b.y,
            width: this.dimensions.brickWidth,
            height: this.dimensions.brickHeight,
          };
          const isOverlapping = segment
            ? isCircleIntersectingRadialSegment(
                ball.position,
                segment,
                this.geometry!,
              )
            : this.isRectangularBrickOverlapping(ball.position, targetPosition);

          if (!isOverlapping) {
            b.isTouching = false;
            continue;
          }

          if (b.isTouching) {
            collided = true;
            break;
          }

          b.isTouching = true;

          {
            const ballVelocityBefore = ball.getVelocity();
            if (segment && typeof ball.bounceFromRadialBrick === "function") {
              ball.bounceFromRadialBrick(segment.centerX, segment.centerY);
            } else {
              ball.bounceY();
            }
            const isDestroyed = this.hitBrick(b);
            if (isDestroyed) {
              ball.registerBrickHit();
            }
            const ballVelocityAfter = ball.getVelocity();
            const speedState = ball.getSpeedStateSnapshot();
            const speedReduction = ball.getLastSpeedReduction();

            // Registrar colisão com bloco
            if (!isDestroyed && gameState) {
              const hitGameState: LoggedGameState = {
                ...gameState,
                speedState,
              };
              gameLogger
                .logCollision(
                  hitGameState,
                  [
                    {
                      x: ball.position.x,
                      y: ball.position.y,
                      velocity: ballVelocityAfter,
                      radius: ball.position.radius,
                    },
                  ],
                  { x: 0, y: 0, width: 0, height: 0 },
                  {
                    type: "brick",
                    ballPosition: ball.position,
                    targetPosition,
                    brickIndex: { col: c, row: r },
                    brickColorIndex: b.colorIndex,
                    velocityBefore: ballVelocityBefore,
                    velocityAfter: ballVelocityAfter,
                  },
                )
                .catch((error) =>
                  ERROR("❌ Erro ao registrar colisão com bloco:", error),
                );

              collisionTracker
                .logBrickCollision(
                  ball.position,
                  ballVelocityAfter,
                  hitGameState,
                  targetPosition,
                  { col: c, row: r },
                  b.colorIndex,
                  null,
                )
                .catch((error) =>
                  ERROR("❌ Erro ao registrar colisão com bloco:", error),
                );
            }
            if (isDestroyed && gameState) {
              const updatedGameState: LoggedGameState = {
                ...gameState,
                bricksRemaining: Math.max(0, gameState.bricksRemaining - 1),
                speedState,
              };
              LOG(
                `🧱 Colisão com bloco detectada - Pos: (${Math.round(ball.position.x)}, ${Math.round(ball.position.y)}), Bloco: [${c}, ${r}], Cor: ${b.colorIndex}`,
              );

              gameLogger
                .logBrickDestroyed(
                  updatedGameState,
                  [
                    {
                      x: ball.position.x,
                      y: ball.position.y,
                      velocity: ballVelocityAfter,
                      radius: ball.position.radius,
                    },
                  ],
                  { x: 0, y: 0, width: 0, height: 0 }, // Paddle position será atualizada pelo GameEngine
                  targetPosition,
                  { col: c, row: r },
                  b.colorIndex,
                  ball.position,
                  ballVelocityBefore,
                  ballVelocityAfter,
                  speedReduction,
                )
                .catch((error) =>
                  ERROR("❌ Erro ao registrar destruição de bloco:", error),
                );

              collisionTracker
                .logBrickCollision(
                  ball.position,
                  ballVelocityAfter,
                  updatedGameState,
                  targetPosition,
                  { col: c, row: r },
                  b.colorIndex,
                  speedReduction,
                )
                .catch((error) =>
                  ERROR("❌ Erro ao registrar colisão com bloco:", error),
                );
            }
            if (isDestroyed) {
              destroyedCount++;
              if (this.onBrickDestroyed) {
                this.onBrickDestroyed(b.colorIndex);
              }
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
    return collided;
  }

  getRows(): number {
    return this.rows;
  }

  isBrickActive(col: number, row: number): boolean {
    if (
      col < 0 ||
      col >= this.dimensions.brickCols ||
      row < 0 ||
      row >= this.rows
    ) {
      return false;
    }
    return this.bricks[col][row].status === BRICK_ACTIVE;
  }

  selectRandomActive(limit: number): DestroyedBrickSnapshot[] {
    const activeBricks = this.getActiveBrickSnapshots();
    for (
      let index = activeBricks.length - RANDOM_SELECTION_OFFSET;
      index > FIRST_INDEX;
      index--
    ) {
      const swapIndex = Math.floor(
        this.random() * (index + RANDOM_SELECTION_OFFSET),
      );
      const current = activeBricks[index];
      activeBricks[index] = activeBricks[swapIndex];
      activeBricks[swapIndex] = current;
    }

    return activeBricks.slice(FIRST_INDEX, limit);
  }

  destroySelectedActive(
    selectedBricks: DestroyedBrickSnapshot[],
  ): DestroyedBrickSnapshot[] {
    const destroyed: DestroyedBrickSnapshot[] = [];
    for (const selectedBrick of selectedBricks) {
      if (!this.isBrickActive(selectedBrick.col, selectedBrick.row)) continue;

      const brick = this.bricks[selectedBrick.col][selectedBrick.row];
      const snapshot = this.snapshotBrick(
        selectedBrick.col,
        selectedBrick.row,
        brick,
      );
      brick.status = BRICK_DESTROYED;
      brick.hitsRemaining = BRICK_DESTROYED;
      brick.isTouching = false;
      destroyed.push(snapshot);
    }

    return destroyed;
  }

  destroyAllActive(): DestroyedBrickSnapshot[] {
    const destroyed: DestroyedBrickSnapshot[] = [];
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const brick = this.bricks[c][r];
        if (brick.status !== BRICK_ACTIVE) continue;

        const snapshot = this.snapshotBrick(c, r, brick);
        brick.status = BRICK_DESTROYED;
        brick.hitsRemaining = BRICK_DESTROYED;
        brick.isTouching = false;
        destroyed.push(snapshot);
      }
    }

    return destroyed;
  }

  isBrickMetal(col: number, row: number): boolean {
    if (
      col < 0 ||
      col >= this.dimensions.brickCols ||
      row < 0 ||
      row >= this.rows
    ) {
      return false;
    }
    return this.bricks[col][row].kind === BRICK_KIND_METAL;
  }

  isBrickEvasive(col: number, row: number): boolean {
    if (
      col < 0 ||
      col >= this.dimensions.brickCols ||
      row < 0 ||
      row >= this.rows
    ) {
      return false;
    }
    return this.bricks[col][row].kind === BRICK_KIND_EVASIVE;
  }

  hasBrickEvaded(col: number, row: number): boolean {
    if (
      col < 0 ||
      col >= this.dimensions.brickCols ||
      row < 0 ||
      row >= this.rows
    ) {
      return false;
    }
    return this.bricks[col][row].hasEvaded;
  }

  getEvasiveBrickSnapshots(): DestroyedBrickSnapshot[] {
    const evasiveBricks: DestroyedBrickSnapshot[] = [];
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const brick = this.bricks[c][r];
        if (brick.status !== BRICK_ACTIVE || brick.kind !== BRICK_KIND_EVASIVE)
          continue;

        evasiveBricks.push(this.snapshotBrick(c, r, brick));
      }
    }

    return evasiveBricks;
  }

  getBrickHitsRemaining(col: number, row: number): number {
    if (
      col < 0 ||
      col >= this.dimensions.brickCols ||
      row < 0 ||
      row >= this.rows
    ) {
      return BRICK_DESTROYED;
    }
    return this.bricks[col][row].hitsRemaining;
  }

  private drawBrick(
    ctx: CanvasRenderingContext2D,
    brick: Brick,
    brickX: number,
    brickY: number,
    col: number,
    row: number,
  ) {
    const brickAssetRole = this.getBrickAssetRole(brick);
    const brickImage = AssetLoader.getOrLoadImage(
      this.resolveAssetPath(brickAssetRole),
    );
    const segment = this.getRadialBrickSegment(col, row);

    this.drawBrickImage(ctx, brick, brickImage, brickX, brickY, segment);
  }

  private drawBrickImage(
    ctx: CanvasRenderingContext2D,
    brick: Brick,
    brickImage: HTMLImageElement | null,
    brickX: number,
    brickY: number,
    segment?: RadialBrickSegment,
  ) {
    if (segment) {
      this.drawRadialBrickImage(ctx, brick, brickImage, segment);
      return;
    }

    if (brickImage) {
      ctx.drawImage(
        brickImage,
        brickX,
        brickY,
        this.dimensions.brickWidth,
        this.dimensions.brickHeight,
      );
    } else {
      ctx.fillStyle = "#00d4ff";
      ctx.fillRect(
        brickX,
        brickY,
        this.dimensions.brickWidth,
        this.dimensions.brickHeight,
      );
    }
  }

  private drawRadialBrickImage(
    ctx: CanvasRenderingContext2D,
    brick: Brick,
    brickImage: HTMLImageElement | null,
    segment: RadialBrickSegment,
  ) {
    if (!this.geometry) return;
    const reducedEffects = shouldUseReducedCanvasEffects(
      this.geometry.radius * 2,
    );

    ctx.save();
    this.traceRadialBrickPath(ctx, segment);
    ctx.shadowColor = RADIAL_BRICK_SHADOW_COLOR;
    ctx.shadowBlur = reducedEffects ? 0 : RADIAL_BRICK_SHADOW_BLUR;
    ctx.clip();
    if (brickImage) {
      ctx.drawImage(
        brickImage,
        segment.bounds.x,
        segment.bounds.y,
        segment.bounds.width,
        segment.bounds.height,
      );
    } else {
      ctx.fillStyle = this.getRadialBrickColor(brick);
      ctx.fillRect(
        segment.bounds.x,
        segment.bounds.y,
        segment.bounds.width,
        segment.bounds.height,
      );
    }
    ctx.restore();

    ctx.save();
    this.traceRadialBrickPath(ctx, segment);
    ctx.lineWidth = RADIAL_BRICK_LINE_WIDTH;
    ctx.strokeStyle = RADIAL_BRICK_STROKE_COLOR;
    ctx.stroke();
    ctx.restore();
  }

  private traceRadialBrickPath(
    ctx: CanvasRenderingContext2D,
    segment: RadialBrickSegment,
  ) {
    if (!this.geometry) return;

    ctx.beginPath();
    ctx.arc(
      this.geometry.centerX,
      this.geometry.centerY,
      segment.outerRadius,
      segment.startAngle,
      segment.endAngle,
    );
    ctx.arc(
      this.geometry.centerX,
      this.geometry.centerY,
      segment.innerRadius,
      segment.endAngle,
      segment.startAngle,
      true,
    );
    ctx.closePath();
  }

  private getRadialBrickColor(brick: Brick): string {
    if (brick.kind === BRICK_KIND_METAL) return RADIAL_BRICK_METAL_COLOR;

    return RADIAL_BRICK_FALLBACK_COLORS[brick.colorIndex] ?? RADIAL_BRICK_FALLBACK_COLORS[FIRST_INDEX];
  }

  private assignRandomMetalBricks() {
    const activeBricks = this.getActiveBrickSnapshots();
    const reservedEvasiveSlots =
      activeBricks.length >= EVASIVE_BRICK_COUNT ? EVASIVE_BRICK_COUNT : 0;
    const availableMetalSlots = Math.max(
      BRICK_DESTROYED,
      activeBricks.length - reservedEvasiveSlots,
    );
    const metalCount = Math.min(
      availableMetalSlots,
      Math.floor(
        this.random() *
          (METAL_BRICK_MAX_COUNT -
            METAL_BRICK_MIN_COUNT +
            RANDOM_SELECTION_OFFSET),
      ) + METAL_BRICK_MIN_COUNT,
    );
    const metalBricks = this.selectRandomSnapshots(activeBricks, metalCount);

    for (const metalBrick of metalBricks) {
      const brick = this.bricks[metalBrick.col][metalBrick.row];
      brick.kind = BRICK_KIND_METAL;
      brick.hitsRemaining = METAL_BRICK_HITS;
    }
  }

  private assignRandomEvasiveBricks() {
    const activeBasicBricks = this.getActiveBasicBrickSnapshots();
    if (activeBasicBricks.length < EVASIVE_BRICK_COUNT) return;

    const evasiveBricks = this.selectRandomSnapshots(
      activeBasicBricks,
      EVASIVE_BRICK_COUNT,
    );

    for (const evasiveBrick of evasiveBricks) {
      const brick = this.bricks[evasiveBrick.col][evasiveBrick.row];
      brick.kind = BRICK_KIND_EVASIVE;
      brick.hitsRemaining = BASIC_BRICK_HITS;
      brick.hasEvaded = false;
    }
  }

  private getRandomColorIndex(): number {
    return Math.floor(this.random() * BRICK_ASSET_ROLES.length);
  }

  private getBrickAssetRole(brick: Brick): GameVisualAssetRole {
    if (brick.kind === BRICK_KIND_METAL) {
      return this.getMetalBrickAssetRole(brick);
    }

    return (
      BRICK_ASSET_ROLES[brick.colorIndex] ?? GAME_VISUAL_ASSET_ROLES.brickRed
    );
  }

  private getMetalBrickAssetRole(brick: Brick): GameVisualAssetRole {
    if (brick.hitsRemaining >= METAL_BRICK_HITS) {
      return GAME_VISUAL_ASSET_ROLES.brickMetalIntact;
    }

    if (brick.hitsRemaining === METAL_BRICK_DENTED_ONE_HITS) {
      return GAME_VISUAL_ASSET_ROLES.brickMetalDentedOne;
    }

    if (brick.hitsRemaining <= METAL_BRICK_DENTED_TWO_HITS) {
      return GAME_VISUAL_ASSET_ROLES.brickMetalDentedTwo;
    }

    return GAME_VISUAL_ASSET_ROLES.brickMetalIntact;
  }

  private hitBrick(brick: Brick): boolean {
    if (brick.kind === BRICK_KIND_EVASIVE && !brick.hasEvaded) {
      brick.hasEvaded = true;
      return false;
    }

    brick.hitsRemaining = Math.max(BRICK_DESTROYED, brick.hitsRemaining - 1);
    if (brick.hitsRemaining > BRICK_DESTROYED) {
      return false;
    }

    brick.status = BRICK_DESTROYED;
    brick.isTouching = false;
    return true;
  }

  private selectRandomSnapshots(
    snapshots: DestroyedBrickSnapshot[],
    limit: number,
  ): DestroyedBrickSnapshot[] {
    for (
      let index = snapshots.length - RANDOM_SELECTION_OFFSET;
      index > FIRST_INDEX;
      index--
    ) {
      const swapIndex = Math.floor(
        this.random() * (index + RANDOM_SELECTION_OFFSET),
      );
      const current = snapshots[index];
      snapshots[index] = snapshots[swapIndex];
      snapshots[swapIndex] = current;
    }

    return snapshots.slice(FIRST_INDEX, limit);
  }

  private getActiveBasicBrickSnapshots(): DestroyedBrickSnapshot[] {
    const activeBricks: DestroyedBrickSnapshot[] = [];
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const brick = this.bricks[c][r];
        if (brick.status !== BRICK_ACTIVE || brick.kind !== BRICK_KIND_BASIC)
          continue;

        activeBricks.push(this.snapshotBrick(c, r, brick));
      }
    }

    return activeBricks;
  }

  private getActiveBrickSnapshots(): DestroyedBrickSnapshot[] {
    const activeBricks: DestroyedBrickSnapshot[] = [];
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const brick = this.bricks[c][r];
        if (brick.status !== BRICK_ACTIVE) continue;

        activeBricks.push(this.snapshotBrick(c, r, brick));
      }
    }

    return activeBricks;
  }

  private getBrickBounds(col: number, row: number): RectBounds {
    const segment = this.getRadialBrickSegment(col, row);
    if (segment) return segment.bounds;

    return {
      x:
        col * (this.dimensions.brickWidth + this.dimensions.brickPadding) +
        this.dimensions.brickOffsetLeft,
      y:
        row * (this.dimensions.brickHeight + this.dimensions.brickPadding) +
        this.dimensions.brickOffsetTop,
      width: this.dimensions.brickWidth,
      height: this.dimensions.brickHeight,
    };
  }

  private getRadialBrickSegment(
    col: number,
    row: number,
  ): RadialBrickSegment | undefined {
    if (!this.geometry) return undefined;

    return calculateRadialBrickSegment(
      this.geometry,
      this.dimensions,
      col,
      row,
      this.rows,
    );
  }

  private isRectangularBrickOverlapping(
    ballPosition: { x: number; y: number; radius: number },
    bounds: RectBounds,
  ): boolean {
    const ballLeft = ballPosition.x - ballPosition.radius;
    const ballRight = ballPosition.x + ballPosition.radius;
    const ballTop = ballPosition.y - ballPosition.radius;
    const ballBottom = ballPosition.y + ballPosition.radius;

    return (
      ballRight > bounds.x &&
      ballLeft < bounds.x + bounds.width &&
      ballBottom > bounds.y &&
      ballTop < bounds.y + bounds.height
    );
  }

  private snapshotBrick(
    col: number,
    row: number,
    brick: Brick,
  ): DestroyedBrickSnapshot {
    const bounds = this.getBrickBounds(col, row);
    brick.x = bounds.x;
    brick.y = bounds.y;

    return {
      col,
      row,
      colorIndex: brick.colorIndex,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
  }
}
