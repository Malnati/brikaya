// src/objects/Components.ts
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
  calculateRadialComponentSegment,
  isCircleIntersectingRadialSegment,
  type RadialComponentSegment,
  type RadialPlayfieldGeometry,
  type RectBounds,
} from "../utils/radialGeometry";
import type { ElectricImpactHandler } from "../utils/electricImpact";
import { getComponentTerminalRatios } from "../constants/componentTerminals";

const COMPONENT_ACTIVE = 1;
const COMPONENT_DESTROYED = 0;
const FIRST_INDEX = 0;
const RANDOM_SELECTION_OFFSET = 1;
const COMPONENT_KIND_BASIC = "basic";
const COMPONENT_KIND_METAL = "metal";
const COMPONENT_KIND_EVASIVE = "evasive";
const BASIC_COMPONENT_HITS = 1;
const METAL_COMPONENT_HITS = 3;
const METAL_COMPONENT_DENTED_ONE_HITS = 2;
const METAL_COMPONENT_DENTED_TWO_HITS = 1;
const METAL_COMPONENT_MIN_COUNT = 0;
const METAL_COMPONENT_MAX_COUNT = 3;
const EVASIVE_COMPONENT_COUNT = 3;
const RADIAL_COMPONENT_FALLBACK_COLORS = [
  "#ff5d73",
  "#45d7ff",
  "#45f08f",
  "#ffd166",
  "#b873ff",
] as const;
const RADIAL_COMPONENT_METAL_COLOR = "#aeb7c2";
const RADIAL_COMPONENT_TANGENT_ROTATION = Math.PI / 2;
const RADIAL_COMPONENT_WIDTH_RATIO = 1.72;
const RADIAL_COMPONENT_HEIGHT_RATIO = 1.44;
const RADIAL_COMPONENT_TRACE_COLOR = "rgba(130, 242, 255, 0.42)";
const RADIAL_COMPONENT_TRACE_WIDTH_RATIO = 0.22;
const FULL_CIRCLE = Math.PI * 2;
const FULL_CIRCLE_EPSILON = 0.000001;
const COMPONENT_ASSET_ROLES = [
  GAME_VISUAL_ASSET_ROLES.componentRed,
  GAME_VISUAL_ASSET_ROLES.componentBlue,
  GAME_VISUAL_ASSET_ROLES.componentGreen,
  GAME_VISUAL_ASSET_ROLES.componentYellow,
  GAME_VISUAL_ASSET_ROLES.componentPurple,
] as const satisfies readonly GameVisualAssetRole[];

type ComponentKind =
  typeof COMPONENT_KIND_BASIC | typeof COMPONENT_KIND_METAL | typeof COMPONENT_KIND_EVASIVE;

interface RadialComponentMetrics {
  width: number;
  height: number;
  rotation: number;
}

interface RadialComponentTerminals {
  left: { x: number; y: number };
  right: { x: number; y: number };
}

interface Component {
  x: number;
  y: number;
  status: number;
  colorIndex: number;
  kind: ComponentKind;
  hitsRemaining: number;
  isTouching: boolean;
  hasEvaded: boolean;
}

export interface DestroyedComponentSnapshot {
  col: number;
  row: number;
  colorIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Components {
  private components: Component[][] = [];
  private dimensions: DynamicGameDimensions;
  private rows: number;
  private maxRows: number;

  constructor(
    dimensions: DynamicGameDimensions,
    private onComponentDestroyed?: (colorIndex: number) => void,
    maxRows?: number,
    private onMaxRowsReached?: () => void,
    private resolveAssetPath: VisualAssetPathResolver = DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
    private random: () => number = Math.random,
    private geometry?: RadialPlayfieldGeometry,
    private onElectricImpact?: ElectricImpactHandler,
  ) {
    this.dimensions = dimensions;
    this.rows = dimensions.componentRows;
    this.maxRows = maxRows ?? this.rows;

    LOG(
      `🏗️  Components: ${dimensions.componentCols}x${this.rows} = ${dimensions.componentCols * this.rows} componentes`,
    );

    for (let c = 0; c < dimensions.componentCols; c++) {
      this.components[c] = [];
      for (let r = 0; r < this.rows; r++) {
        this.components[c][r] = {
          x: 0,
          y: 0,
          status: COMPONENT_ACTIVE,
          colorIndex: this.getRandomColorIndex(),
          kind: COMPONENT_KIND_BASIC,
          hitsRemaining: BASIC_COMPONENT_HITS,
          isTouching: false,
          hasEvaded: false,
        };
      }
    }
    // Atualizar as posições dos blocos imediatamente após a criação
    for (let c = 0; c < dimensions.componentCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const bounds = this.getComponentBounds(c, r);
        this.components[c][r].x = bounds.x;
        this.components[c][r].y = bounds.y;
      }
    }
    this.assignRandomMetalComponents();
    this.assignRandomEvasiveComponents();
    LOG(`✅ Components criados com sucesso`);
  }

  // Método para verificar se todos os blocos foram destruídos
  isAllDestroyed(): boolean {
    let activeComponents = 0;
    for (let c = 0; c < this.dimensions.componentCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        if (this.components[c][r].status === COMPONENT_ACTIVE) {
          activeComponents++;
        }
      }
    }
    LOG(
      `🔍 isAllDestroyed: ${activeComponents} blocos ativos de ${this.dimensions.componentCols * this.rows} total`,
    );
    return activeComponents === 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawRadialCircuitTraces(ctx);

    for (let c = 0; c < this.dimensions.componentCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const b = this.components[c][r];
        if (b.status === COMPONENT_ACTIVE) {
          const componentX =
            c * (this.dimensions.componentWidth + this.dimensions.componentPadding) +
            this.dimensions.componentOffsetLeft;
          const componentY =
            r * (this.dimensions.componentHeight + this.dimensions.componentPadding) +
            this.dimensions.componentOffsetTop;
          const bounds = this.getComponentBounds(c, r);
          b.x = bounds.x;
          b.y = bounds.y;

          this.drawComponent(ctx, b, componentX, componentY, c, r);
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
    for (let c = 0; c < this.dimensions.componentCols; c++) {
      this.components[c].unshift({
        x: 0,
        y: 0,
        status: COMPONENT_ACTIVE,
        colorIndex: this.getRandomColorIndex(),
        kind: COMPONENT_KIND_BASIC,
        hitsRemaining: BASIC_COMPONENT_HITS,
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
      componentCols: this.components.length,
      componentRows: this.rows,
    };
    this.maxRows = Math.max(this.rows, maxRows ?? this.maxRows);
    this.geometry = geometry ?? this.geometry;
  }

  collide(
    ball: {
      position: { x: number; y: number; radius: number };
      bounceY: () => void;
      bounceFromRadialComponent?: (targetX: number, targetY: number) => void;
      registerComponentHit: () => void;
      getVelocity: () => { dx: number; dy: number };
      getSpeedStateSnapshot: () => LoggedGameState["speedState"];
      getLastSpeedReduction: () => SpeedReductionSnapshot | null;
    },
    gameState?: LoggedGameState,
  ): boolean {
    let collided = false;
    let destroyedCount = 0;
    for (let c = 0; c < this.dimensions.componentCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const b = this.components[c][r];
        if (b.status === COMPONENT_ACTIVE) {
          const segment = this.getRadialComponentSegment(c, r);
          const targetPosition = segment?.bounds ?? {
            x: b.x,
            y: b.y,
            width: this.dimensions.componentWidth,
            height: this.dimensions.componentHeight,
          };
          const isOverlapping = segment
            ? isCircleIntersectingRadialSegment(
                ball.position,
                segment,
                this.geometry!,
              )
            : this.isRectangularComponentOverlapping(ball.position, targetPosition);

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
            this.emitComponentElectricImpact(ball.position, targetPosition, b, segment);
            if (segment && typeof ball.bounceFromRadialComponent === "function") {
              ball.bounceFromRadialComponent(segment.centerX, segment.centerY);
            } else {
              ball.bounceY();
            }
            const isDestroyed = this.hitComponent(b);
            if (isDestroyed) {
              ball.registerComponentHit();
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
                    type: "component",
                    ballPosition: ball.position,
                    targetPosition,
                    componentIndex: { col: c, row: r },
                    componentColorIndex: b.colorIndex,
                    velocityBefore: ballVelocityBefore,
                    velocityAfter: ballVelocityAfter,
                  },
                )
                .catch((error) =>
                  ERROR("❌ Erro ao registrar colisão com bloco:", error),
                );

              collisionTracker
                .logComponentCollision(
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
                componentsRemaining: Math.max(0, gameState.componentsRemaining - 1),
                speedState,
              };
              LOG(
                `🧱 Colisão com bloco detectada - Pos: (${Math.round(ball.position.x)}, ${Math.round(ball.position.y)}), Bloco: [${c}, ${r}], Cor: ${b.colorIndex}`,
              );

              gameLogger
                .logComponentDestroyed(
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
                .logComponentCollision(
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
              if (this.onComponentDestroyed) {
                this.onComponentDestroyed(b.colorIndex);
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

  private emitComponentElectricImpact(
    origin: { x: number; y: number },
    bounds: RectBounds,
    component: Component,
    segment?: RadialComponentSegment,
  ) {
    if (!this.onElectricImpact) return;

    const endpoints = segment
      ? this.getRadialComponentTerminals(segment, component)
      : {
          left: {
            x: bounds.x,
            y: bounds.y + bounds.height / 2,
          },
          right: {
            x: bounds.x + bounds.width,
            y: bounds.y + bounds.height / 2,
          },
        };

    this.onElectricImpact({
      kind: "component",
      origin: { x: origin.x, y: origin.y },
      endpoints: [endpoints.left, endpoints.right],
      bounds,
    });
  }

  getRows(): number {
    return this.rows;
  }

  isComponentActive(col: number, row: number): boolean {
    if (
      col < 0 ||
      col >= this.dimensions.componentCols ||
      row < 0 ||
      row >= this.rows
    ) {
      return false;
    }
    return this.components[col][row].status === COMPONENT_ACTIVE;
  }

  selectRandomActive(limit: number): DestroyedComponentSnapshot[] {
    const activeComponents = this.getActiveComponentSnapshots();
    for (
      let index = activeComponents.length - RANDOM_SELECTION_OFFSET;
      index > FIRST_INDEX;
      index--
    ) {
      const swapIndex = Math.floor(
        this.random() * (index + RANDOM_SELECTION_OFFSET),
      );
      const current = activeComponents[index];
      activeComponents[index] = activeComponents[swapIndex];
      activeComponents[swapIndex] = current;
    }

    return activeComponents.slice(FIRST_INDEX, limit);
  }

  destroySelectedActive(
    selectedComponents: DestroyedComponentSnapshot[],
  ): DestroyedComponentSnapshot[] {
    const destroyed: DestroyedComponentSnapshot[] = [];
    for (const selectedComponent of selectedComponents) {
      if (!this.isComponentActive(selectedComponent.col, selectedComponent.row)) continue;

      const component = this.components[selectedComponent.col][selectedComponent.row];
      const snapshot = this.snapshotComponent(
        selectedComponent.col,
        selectedComponent.row,
        component,
      );
      component.status = COMPONENT_DESTROYED;
      component.hitsRemaining = COMPONENT_DESTROYED;
      component.isTouching = false;
      destroyed.push(snapshot);
    }

    return destroyed;
  }

  destroyAllActive(): DestroyedComponentSnapshot[] {
    const destroyed: DestroyedComponentSnapshot[] = [];
    for (let c = 0; c < this.dimensions.componentCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const component = this.components[c][r];
        if (component.status !== COMPONENT_ACTIVE) continue;

        const snapshot = this.snapshotComponent(c, r, component);
        component.status = COMPONENT_DESTROYED;
        component.hitsRemaining = COMPONENT_DESTROYED;
        component.isTouching = false;
        destroyed.push(snapshot);
      }
    }

    return destroyed;
  }

  isComponentMetal(col: number, row: number): boolean {
    if (
      col < 0 ||
      col >= this.dimensions.componentCols ||
      row < 0 ||
      row >= this.rows
    ) {
      return false;
    }
    return this.components[col][row].kind === COMPONENT_KIND_METAL;
  }

  isComponentEvasive(col: number, row: number): boolean {
    if (
      col < 0 ||
      col >= this.dimensions.componentCols ||
      row < 0 ||
      row >= this.rows
    ) {
      return false;
    }
    return this.components[col][row].kind === COMPONENT_KIND_EVASIVE;
  }

  hasComponentEvaded(col: number, row: number): boolean {
    if (
      col < 0 ||
      col >= this.dimensions.componentCols ||
      row < 0 ||
      row >= this.rows
    ) {
      return false;
    }
    return this.components[col][row].hasEvaded;
  }

  getEvasiveComponentSnapshots(): DestroyedComponentSnapshot[] {
    const evasiveComponents: DestroyedComponentSnapshot[] = [];
    for (let c = 0; c < this.dimensions.componentCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const component = this.components[c][r];
        if (component.status !== COMPONENT_ACTIVE || component.kind !== COMPONENT_KIND_EVASIVE)
          continue;

        evasiveComponents.push(this.snapshotComponent(c, r, component));
      }
    }

    return evasiveComponents;
  }

  getComponentHitsRemaining(col: number, row: number): number {
    if (
      col < 0 ||
      col >= this.dimensions.componentCols ||
      row < 0 ||
      row >= this.rows
    ) {
      return COMPONENT_DESTROYED;
    }
    return this.components[col][row].hitsRemaining;
  }

  private drawComponent(
    ctx: CanvasRenderingContext2D,
    component: Component,
    componentX: number,
    componentY: number,
    col: number,
    row: number,
  ) {
    const componentAssetRole = this.getComponentAssetRole(component);
    const componentImage = AssetLoader.getOrLoadImage(
      this.resolveAssetPath(componentAssetRole),
    );
    const segment = this.getRadialComponentSegment(col, row);

    this.drawComponentImage(ctx, component, componentImage, componentX, componentY, segment);
  }

  private drawComponentImage(
    ctx: CanvasRenderingContext2D,
    component: Component,
    componentImage: HTMLImageElement | null,
    componentX: number,
    componentY: number,
    segment?: RadialComponentSegment,
  ) {
    if (segment) {
      this.drawRadialComponentImage(ctx, component, componentImage, segment);
      return;
    }

    if (componentImage) {
      ctx.drawImage(
        componentImage,
        componentX,
        componentY,
        this.dimensions.componentWidth,
        this.dimensions.componentHeight,
      );
    } else {
      this.drawFallbackComponentShape(ctx, component, {
        x: componentX,
        y: componentY,
        width: this.dimensions.componentWidth,
        height: this.dimensions.componentHeight,
      });
    }
  }

  private drawRadialComponentImage(
    ctx: CanvasRenderingContext2D,
    component: Component,
    componentImage: HTMLImageElement | null,
    segment: RadialComponentSegment,
  ) {
    const metrics = this.getRadialComponentMetrics(segment);

    ctx.save();
    ctx.translate(segment.centerX, segment.centerY);
    ctx.rotate(metrics.rotation);

    if (componentImage) {
      ctx.drawImage(
        componentImage,
        -metrics.width / 2,
        -metrics.height / 2,
        metrics.width,
        metrics.height,
      );
    } else {
      this.drawFallbackComponentShape(ctx, component, {
        x: -metrics.width / 2,
        y: -metrics.height / 2,
        width: metrics.width,
        height: metrics.height,
      });
    }

    ctx.restore();
  }

  private drawRadialCircuitTraces(ctx: CanvasRenderingContext2D) {
    if (!this.geometry) return;

    ctx.save();
    ctx.strokeStyle = RADIAL_COMPONENT_TRACE_COLOR;
    ctx.lineWidth = Math.max(
      1,
      this.dimensions.componentPadding * RADIAL_COMPONENT_TRACE_WIDTH_RATIO,
    );
    ctx.lineCap = "round";

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.dimensions.componentCols - 1; col++) {
        this.drawRadialCircuitTrace(ctx, col, col + 1, row);
      }

      if (this.isComponentArcFullCircle()) {
        this.drawRadialCircuitTrace(
          ctx,
          this.dimensions.componentCols - 1,
          0,
          row,
        );
      }
    }

    ctx.restore();
  }

  private drawRadialCircuitTrace(
    ctx: CanvasRenderingContext2D,
    leftCol: number,
    rightCol: number,
    row: number,
  ) {
    if (
      !this.geometry ||
      this.components[leftCol]?.[row]?.status !== COMPONENT_ACTIVE ||
      this.components[rightCol]?.[row]?.status !== COMPONENT_ACTIVE
    ) {
      return;
    }

    const leftSegment = calculateRadialComponentSegment(
      this.geometry,
      this.dimensions,
      leftCol,
      row,
      this.rows,
    );
    const rightSegment = calculateRadialComponentSegment(
      this.geometry,
      this.dimensions,
      rightCol,
      row,
      this.rows,
    );
    const leftComponent = this.components[leftCol][row];
    const rightComponent = this.components[rightCol][row];
    const leftTerminals = this.getRadialComponentTerminals(leftSegment, leftComponent);
    const rightTerminals = this.getRadialComponentTerminals(rightSegment, rightComponent);

    ctx.beginPath();
    ctx.moveTo(leftTerminals.right.x, leftTerminals.right.y);
    ctx.lineTo(rightTerminals.left.x, rightTerminals.left.y);
    ctx.stroke();
  }

  private isComponentArcFullCircle(): boolean {
    if (!this.geometry) return false;

    return (
      Math.abs(this.geometry.componentArcEndAngle - this.geometry.componentArcStartAngle) >=
      FULL_CIRCLE - FULL_CIRCLE_EPSILON
    );
  }

  private getRadialComponentMetrics(
    segment: RadialComponentSegment,
  ): RadialComponentMetrics {
    const angularWidth = Math.abs(segment.endAngle - segment.startAngle);
    const tangentSpan = segment.centerRadius * angularWidth;
    const radialSpan = segment.outerRadius - segment.innerRadius;

    return {
      width:
        Math.max(1, Math.min(segment.bounds.width, tangentSpan)) *
        RADIAL_COMPONENT_WIDTH_RATIO,
      height: Math.max(1, radialSpan) * RADIAL_COMPONENT_HEIGHT_RATIO,
      rotation: segment.centerAngle + RADIAL_COMPONENT_TANGENT_ROTATION,
    };
  }

  private getRadialComponentTerminals(
    segment: RadialComponentSegment,
    component: Component,
  ): RadialComponentTerminals {
    const metrics = this.getRadialComponentMetrics(segment);
    const terminalRatios = getComponentTerminalRatios(this.getComponentAssetRole(component));
    const leftOffset = (terminalRatios.left - 0.5) * metrics.width;
    const rightOffset = (terminalRatios.right - 0.5) * metrics.width;
    const tangentX = Math.cos(metrics.rotation);
    const tangentY = Math.sin(metrics.rotation);

    return {
      left: {
        x: segment.centerX + tangentX * leftOffset,
        y: segment.centerY + tangentY * leftOffset,
      },
      right: {
        x: segment.centerX + tangentX * rightOffset,
        y: segment.centerY + tangentY * rightOffset,
      },
    };
  }

  private getRadialComponentColor(component: Component): string {
    if (component.kind === COMPONENT_KIND_METAL) return RADIAL_COMPONENT_METAL_COLOR;

    return RADIAL_COMPONENT_FALLBACK_COLORS[component.colorIndex] ?? RADIAL_COMPONENT_FALLBACK_COLORS[FIRST_INDEX];
  }

  private drawFallbackComponentShape(
    ctx: CanvasRenderingContext2D,
    component: Component,
    bounds: RectBounds,
  ) {
    const fillColor = this.getRadialComponentColor(component);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const radiusX = bounds.width * 0.34;
    const radiusY = bounds.height * 0.34;

    ctx.fillStyle = fillColor;
    if (
      typeof ctx.beginPath === "function" &&
      typeof ctx.ellipse === "function" &&
      typeof ctx.fill === "function"
    ) {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.fillRect(
      centerX - radiusX,
      centerY - radiusY,
      radiusX * 2,
      radiusY * 2,
    );
  }

  private assignRandomMetalComponents() {
    const activeComponents = this.getActiveComponentSnapshots();
    const reservedEvasiveSlots =
      activeComponents.length >= EVASIVE_COMPONENT_COUNT ? EVASIVE_COMPONENT_COUNT : 0;
    const availableMetalSlots = Math.max(
      COMPONENT_DESTROYED,
      activeComponents.length - reservedEvasiveSlots,
    );
    const metalCount = Math.min(
      availableMetalSlots,
      Math.floor(
        this.random() *
          (METAL_COMPONENT_MAX_COUNT -
            METAL_COMPONENT_MIN_COUNT +
            RANDOM_SELECTION_OFFSET),
      ) + METAL_COMPONENT_MIN_COUNT,
    );
    const metalComponents = this.selectRandomSnapshots(activeComponents, metalCount);

    for (const metalComponent of metalComponents) {
      const component = this.components[metalComponent.col][metalComponent.row];
      component.kind = COMPONENT_KIND_METAL;
      component.hitsRemaining = METAL_COMPONENT_HITS;
    }
  }

  private assignRandomEvasiveComponents() {
    const activeBasicComponents = this.getActiveBasicComponentSnapshots();
    if (activeBasicComponents.length < EVASIVE_COMPONENT_COUNT) return;

    const evasiveComponents = this.selectRandomSnapshots(
      activeBasicComponents,
      EVASIVE_COMPONENT_COUNT,
    );

    for (const evasiveComponent of evasiveComponents) {
      const component = this.components[evasiveComponent.col][evasiveComponent.row];
      component.kind = COMPONENT_KIND_EVASIVE;
      component.hitsRemaining = BASIC_COMPONENT_HITS;
      component.hasEvaded = false;
    }
  }

  private getRandomColorIndex(): number {
    return Math.floor(this.random() * COMPONENT_ASSET_ROLES.length);
  }

  private getComponentAssetRole(component: Component): GameVisualAssetRole {
    if (component.kind === COMPONENT_KIND_METAL) {
      return this.getMetalComponentAssetRole(component);
    }

    return (
      COMPONENT_ASSET_ROLES[component.colorIndex] ?? GAME_VISUAL_ASSET_ROLES.componentRed
    );
  }

  private getMetalComponentAssetRole(component: Component): GameVisualAssetRole {
    if (component.hitsRemaining >= METAL_COMPONENT_HITS) {
      return GAME_VISUAL_ASSET_ROLES.componentMetalIntact;
    }

    if (component.hitsRemaining === METAL_COMPONENT_DENTED_ONE_HITS) {
      return GAME_VISUAL_ASSET_ROLES.componentMetalDentedOne;
    }

    if (component.hitsRemaining <= METAL_COMPONENT_DENTED_TWO_HITS) {
      return GAME_VISUAL_ASSET_ROLES.componentMetalDentedTwo;
    }

    return GAME_VISUAL_ASSET_ROLES.componentMetalIntact;
  }

  private hitComponent(component: Component): boolean {
    if (component.kind === COMPONENT_KIND_EVASIVE && !component.hasEvaded) {
      component.hasEvaded = true;
      return false;
    }

    component.hitsRemaining = Math.max(COMPONENT_DESTROYED, component.hitsRemaining - 1);
    if (component.hitsRemaining > COMPONENT_DESTROYED) {
      return false;
    }

    component.status = COMPONENT_DESTROYED;
    component.isTouching = false;
    return true;
  }

  private selectRandomSnapshots(
    snapshots: DestroyedComponentSnapshot[],
    limit: number,
  ): DestroyedComponentSnapshot[] {
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

  private getActiveBasicComponentSnapshots(): DestroyedComponentSnapshot[] {
    const activeComponents: DestroyedComponentSnapshot[] = [];
    for (let c = 0; c < this.dimensions.componentCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const component = this.components[c][r];
        if (component.status !== COMPONENT_ACTIVE || component.kind !== COMPONENT_KIND_BASIC)
          continue;

        activeComponents.push(this.snapshotComponent(c, r, component));
      }
    }

    return activeComponents;
  }

  private getActiveComponentSnapshots(): DestroyedComponentSnapshot[] {
    const activeComponents: DestroyedComponentSnapshot[] = [];
    for (let c = 0; c < this.dimensions.componentCols; c++) {
      for (let r = 0; r < this.rows; r++) {
        const component = this.components[c][r];
        if (component.status !== COMPONENT_ACTIVE) continue;

        activeComponents.push(this.snapshotComponent(c, r, component));
      }
    }

    return activeComponents;
  }

  private getComponentBounds(col: number, row: number): RectBounds {
    const segment = this.getRadialComponentSegment(col, row);
    if (segment) return segment.bounds;

    return {
      x:
        col * (this.dimensions.componentWidth + this.dimensions.componentPadding) +
        this.dimensions.componentOffsetLeft,
      y:
        row * (this.dimensions.componentHeight + this.dimensions.componentPadding) +
        this.dimensions.componentOffsetTop,
      width: this.dimensions.componentWidth,
      height: this.dimensions.componentHeight,
    };
  }

  private getRadialComponentSegment(
    col: number,
    row: number,
  ): RadialComponentSegment | undefined {
    if (!this.geometry) return undefined;

    return calculateRadialComponentSegment(
      this.geometry,
      this.dimensions,
      col,
      row,
      this.rows,
    );
  }

  private isRectangularComponentOverlapping(
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

  private snapshotComponent(
    col: number,
    row: number,
    component: Component,
  ): DestroyedComponentSnapshot {
    const bounds = this.getComponentBounds(col, row);
    component.x = bounds.x;
    component.y = bounds.y;

    return {
      col,
      row,
      colorIndex: component.colorIndex,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
  }
}
