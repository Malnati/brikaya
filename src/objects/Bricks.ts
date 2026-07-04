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

const BRICK_ACTIVE = 1;
const BRICK_DESTROYED = 0;
const FIRST_INDEX = 0;
const RANDOM_SELECTION_OFFSET = 1;
const BRICK_KIND_BASIC = "basic";
const BRICK_KIND_METAL = "metal";
const BASIC_BRICK_HITS = 1;
const METAL_BRICK_HITS = 3;
const METAL_BRICK_MIN_COUNT = 0;
const METAL_BRICK_MAX_COUNT = 3;
const BRICK_ASSET_ROLES = [
  GAME_VISUAL_ASSET_ROLES.brickRed,
  GAME_VISUAL_ASSET_ROLES.brickBlue,
  GAME_VISUAL_ASSET_ROLES.brickGreen,
  GAME_VISUAL_ASSET_ROLES.brickYellow,
  GAME_VISUAL_ASSET_ROLES.brickPurple,
] as const satisfies readonly GameVisualAssetRole[];

type BrickKind = typeof BRICK_KIND_BASIC | typeof BRICK_KIND_METAL;

interface Brick {
  x: number;
  y: number;
  status: number;
  colorIndex: number;
  kind: BrickKind;
  hitsRemaining: number;
  isTouching: boolean;
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
    private onBrickDestroyed?: (colorIndex: number) => void | Promise<void>,
    maxRows?: number,
    private onMaxRowsReached?: () => void,
    private resolveAssetPath: VisualAssetPathResolver = DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
    private random: () => number = Math.random,
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
        };
      }
    }
    // Atualizar as posições dos blocos imediatamente após a criação
    for (let c = 0; c < dimensions.brickCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const brickX =
          c * (dimensions.brickWidth + dimensions.brickPadding) +
          dimensions.brickOffsetLeft;
        const brickY =
          r * (dimensions.brickHeight + dimensions.brickPadding) +
          dimensions.brickOffsetTop;
        this.bricks[c][r].x = brickX;
        this.bricks[c][r].y = brickY;
      }
    }
    this.assignRandomMetalBricks();
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
          b.x = brickX;
          b.y = brickY;

          // Desenhar a imagem do brick
          const brickAssetRole = this.getBrickAssetRole(b);
          const brickImage = AssetLoader.getOrLoadImage(
            this.resolveAssetPath(brickAssetRole),
          );
          if (brickImage) {
            ctx.drawImage(
              brickImage,
              brickX,
              brickY,
              this.dimensions.brickWidth,
              this.dimensions.brickHeight,
            );
          } else {
            // Fallback para retângulo colorido se a imagem não carregou
            ctx.fillStyle = "#00d4ff";
            ctx.fillRect(
              brickX,
              brickY,
              this.dimensions.brickWidth,
              this.dimensions.brickHeight,
            );
          }
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
      });
    }
    this.rows += 1;
  }

  resize(dimensions: DynamicGameDimensions, maxRows?: number) {
    this.dimensions = {
      ...dimensions,
      brickCols: this.bricks.length,
      brickRows: this.rows,
    };
    this.maxRows = Math.max(this.rows, maxRows ?? this.maxRows);
  }

  async collide(
    ball: {
      position: { x: number; y: number; radius: number };
      bounceY: () => void;
      registerBrickHit: () => void;
      getVelocity: () => { dx: number; dy: number };
      getSpeedStateSnapshot: () => LoggedGameState["speedState"];
      getLastSpeedReduction: () => SpeedReductionSnapshot | null;
    },
    gameState?: LoggedGameState,
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

          const isOverlapping =
            ballRight > brickLeft &&
            ballLeft < brickRight &&
            ballBottom > brickTop &&
            ballTop < brickBottom;

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
            ball.bounceY();
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
                    targetPosition: {
                      x: b.x,
                      y: b.y,
                      width: this.dimensions.brickWidth,
                      height: this.dimensions.brickHeight,
                    },
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
                  {
                    x: b.x,
                    y: b.y,
                    width: this.dimensions.brickWidth,
                    height: this.dimensions.brickHeight,
                  },
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
                  {
                    x: b.x,
                    y: b.y,
                    width: this.dimensions.brickWidth,
                    height: this.dimensions.brickHeight,
                  },
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
                  {
                    x: b.x,
                    y: b.y,
                    width: this.dimensions.brickWidth,
                    height: this.dimensions.brickHeight,
                  },
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
                await this.onBrickDestroyed(b.colorIndex);
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
    return Promise.resolve(collided);
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

  private assignRandomMetalBricks() {
    const activeBricks = this.getActiveBrickSnapshots();
    const metalCount = Math.min(
      activeBricks.length,
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

  private getRandomColorIndex(): number {
    return Math.floor(this.random() * BRICK_ASSET_ROLES.length);
  }

  private getBrickAssetRole(brick: Brick): GameVisualAssetRole {
    if (brick.kind === BRICK_KIND_METAL) {
      return GAME_VISUAL_ASSET_ROLES.brickMetal;
    }

    return (
      BRICK_ASSET_ROLES[brick.colorIndex] ?? GAME_VISUAL_ASSET_ROLES.brickRed
    );
  }

  private hitBrick(brick: Brick): boolean {
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

  private snapshotBrick(
    col: number,
    row: number,
    brick: Brick,
  ): DestroyedBrickSnapshot {
    const x =
      col * (this.dimensions.brickWidth + this.dimensions.brickPadding) +
      this.dimensions.brickOffsetLeft;
    const y =
      row * (this.dimensions.brickHeight + this.dimensions.brickPadding) +
      this.dimensions.brickOffsetTop;
    brick.x = x;
    brick.y = y;

    return {
      col,
      row,
      colorIndex: brick.colorIndex,
      x,
      y,
      width: this.dimensions.brickWidth,
      height: this.dimensions.brickHeight,
    };
  }
}
