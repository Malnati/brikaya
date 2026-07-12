// src/logic/GameEngine.ts
import { Paddle } from "../objects/Paddle";
import { Ball } from "../objects/Ball";
import { Components, type DestroyedComponentSnapshot } from "../objects/Components";
import { PowerUp, type RadialPowerUpMotion } from "../objects/PowerUp";
import {
  GAME_COLOR,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  LASER_FAN_EFFECT_VISIBLE_MS,
  LASER_FAN_MAX_SPAWNS_PER_LEVEL,
  LEVEL_CLEAR_PAUSE_MS,
  LevelTransitionPayload,
  PhaseSpeedConfig,
  SpeedReductionSnapshot,
  SpeedStateSnapshot,
  calculateDynamicDimensions,
  calculateLevelComponentRows,
  calculateLevelInitialSpawnSpeed,
  calculateLevelMaxSpeed,
  calculateLevelMinSpeed,
  calculateLevelPreviousMaxSpeed,
  calculateLevelSpeedMultiplier,
  calculateLaserFanTargetCount,
  calculateMultiballBallCount,
  calculateSpeedReductionPerComponent,
  calculateWidePaddleScale,
  buildMultiballAngleOffsets,
  DynamicGameDimensions,
} from "../constants/game";
import { POINTS_PER_COMPONENT } from "../constants/gameState";
import {
  GAME_MODE_BALL_TURRET,
  GAME_MODE_CLASSIC,
  type GameMode,
} from "../constants/gameMode";
import { gameLogger, type LoggedPowerUpAction } from "../storage/gameLogger";
import {
  AUDIO_QA_SCENARIO,
  GAME_AUDIO_IDS,
  type AudioId,
  type GameAudioSink,
} from "../constants/audio";
import {
  ACTIVE_POWER_UP_TYPES,
  calculatePowerUpSize,
  getPowerUpActivationAudioId,
  type PowerUpType,
} from "../constants/powerUps";
import {
  IMAGE_SET_RETRO_DEFAULT,
  type ImageSetId,
} from "../constants/appearance";
import {
  resolveGameVisualAssetPath,
  type GameVisualAssetRole,
} from "../utils/visualAssetResolver";
import {
  calculateBallTurretBoundarySegments,
  calculateBallTurretPlayfieldGeometry,
  calculateRadialPaddleBounds,
  calculateRadialPlayfieldGeometry,
  type RadialPaddleBounds,
  type RadialPlayfieldGeometry,
} from "../utils/radialGeometry";
import { LOG, ERROR } from "../utils/logger";
import {
  BALL_TURRET_LEFT_TRAMPOLINE_ACCENT,
  BALL_TURRET_RIGHT_TRAMPOLINE_ACCENT,
  drawBallTurretBackdrop,
  drawBallTurretGlassOverlay,
  drawBallTurretTrampoline,
  drawBallTurretTrampolines,
  type BallTurretTrampolineRenderItem,
} from "./rendering/ballTurretRenderer";
import {
  AmbientElectricBackground,
  drawFullScreenElectricBackdrop,
  readLightningVariantSearchParam,
  resolveAmbientElectricVariant,
} from "./rendering/ambientElectricBackground";
import { shouldUseReducedCanvasEffects } from "../utils/performanceMode";
import type { ElectricImpactEvent } from "../utils/electricImpact";
import {
  drawElectricImpactEffects,
  nextElectricImpactSeed,
  type ElectricImpactEffect,
} from "./rendering/electricImpactRenderer";
import {
  DEFAULT_TURRET_CONTROL_MODE,
  TURRET_CONTROL_MODE_DUAL_SWITCH,
  TURRET_SWITCH_DEAD_ZONE,
  type TurretControlMode,
  type TurretSwitchDirection,
  type TurretSwitchSide,
} from "../constants/turretControlMode";

LOG("📦 GameEngine.ts carregado, gameLogger:", gameLogger);

const ERROR_NO_2D_CONTEXT = "No 2D context";
const SINGLE_COMPONENT_QA_SCENARIO = "single-component-phase-clear";
const SINGLE_COMPONENT_PHASE_3_QA_SCENARIO = "single-component-phase3-clear";
const LATE_PHASE_STABILITY_QA_SCENARIO = "late-phase-stability";
const CINEMATIC_RIP_QA_SCENARIO = "cinematic-rip";
const PADDLE_COLLISION_QA_SCENARIO = "paddle-collision";
const LASER_FAN_QA_SCENARIO = "laser-fan";
const MULTIBALL_QA_SCENARIO = "multiball-power-up";
const WIDE_PADDLE_QA_SCENARIO = "wide-paddle-power-up";
const SLOW_BALL_QA_SCENARIO = "slow-ball-power-up";
const METAL_BLOCK_QA_SCENARIO = "metal-component";
const EVASIVE_BLOCKS_QA_SCENARIO = "evasive-components";
const BALL_TURRET_QA_SCENARIO = "ball-turret";
const BALL_TURRET_LOSE_QA_SCENARIO = "ball-turret-lose";
const LATE_PHASE_STABILITY_LEVEL = 11;
const LATE_PHASE_STABILITY_Y_RATIO = 0.65;
const CINEMATIC_RIP_X_RATIO = 0.12;
const CINEMATIC_RIP_Y_OFFSET = 2;
const PADDLE_COLLISION_QA_BALL_INSET = 1;
const PADDLE_COLLISION_QA_INWARD_OFFSET = 10;
const LASER_FAN_QA_POWER_UP_BOUNDARY_INSET = 12;
const METAL_BLOCK_QA_RANDOM_VALUES = [0, 0.99] as const;
const METAL_BLOCK_QA_RANDOM_FALLBACK = 0.99;
const EVASIVE_BLOCKS_QA_RANDOM_VALUES = [
  0, 0, 0, 0, 0.99, 0.99, 0.99, 0.99,
] as const;
const EVASIVE_BLOCKS_QA_RANDOM_FALLBACK = 0.99;
const EVASIVE_BLOCKS_QA_COMPONENT_COLS = 1;
const EVASIVE_BLOCKS_QA_COMPONENT_ROWS = 3;
const EVASIVE_BLOCKS_QA_COMPONENT_WIDTH_RATIO = 0.18;
const EVASIVE_BLOCKS_QA_COMPONENT_WIDTH_MIN = 48;
const EVASIVE_BLOCKS_QA_COMPONENT_WIDTH_MAX = 88;
const EVASIVE_BLOCKS_QA_COMPONENT_HEIGHT_RATIO = 0.05;
const EVASIVE_BLOCKS_QA_COMPONENT_HEIGHT_MIN = 18;
const EVASIVE_BLOCKS_QA_COMPONENT_HEIGHT_MAX = 28;
const EVASIVE_BLOCKS_QA_COMPONENT_PADDING = 8;
const EVASIVE_BLOCKS_QA_TARGET_ROW = EVASIVE_BLOCKS_QA_COMPONENT_ROWS - 1;
const COMBO_WINDOW_MS = 1200;
const COMBO_COOLDOWN_MS = 500;
const COMBO_SMALL_THRESHOLD = 3;
const COMBO_LARGE_THRESHOLD = 6;
const POWER_UP_SPAWN_INTERVAL = 5;
const POWER_UP_DURATION_MS = 8000;
const POWER_UP_START_Y_OFFSET = 16;
const POWER_UP_EDGE_PADDING = 24;
const POWER_UP_ACTION_SPAWN: LoggedPowerUpAction = "spawn";
const POWER_UP_ACTION_COLLECT: LoggedPowerUpAction = "collect";
const POWER_UP_ACTION_ACTIVATE: LoggedPowerUpAction = "activate";
const POWER_UP_ACTION_EXPIRE: LoggedPowerUpAction = "expire";
const POWER_UP_ACTION_MISS: LoggedPowerUpAction = "miss";
const BALL_TURRET_COMPONENT_COLUMN_MULTIPLIER = 2;
const BALL_TURRET_BOTTOM_SPAWN_ANGLE = Math.PI / 2;
const BALL_TURRET_POWER_UP_FALLBACK_ANGLE = -Math.PI / 2;
const MAX_FRAME_DELTA_MS = 80;
const FRAME_BASELINE_MS = 1000 / 60;
const SLOW_BALL_MULTIPLIER = 0.75;
const HIGH_INTENSITY_SPEED_MULTIPLIER = 1.6;
const LASER_FAN_MIN_PROGRESS = 0;
const LASER_FAN_MAX_PROGRESS = 1;
const LASER_FAN_TARGET_STAGGER_PROGRESS = 0.12;
const LASER_FAN_TARGET_PROGRESS_WINDOW = 0.72;
const LASER_FAN_CRACK_START_PROGRESS = 0.12;
const LASER_FAN_GLOW_START_PROGRESS = 0.24;
const LASER_FAN_EXPLOSION_START_PROGRESS = 0.72;
const LASER_FAN_CRACK_MIN_LINES = 2;
const LASER_FAN_CRACK_LINE_VARIANTS = 3;
const COMPONENT_IMPACT_LIGHT_INTENSITY_RATIO = 0.3;
const SOFTENED_COMPONENT_IMPACT_CRACK_ALPHA =
  0.92 * COMPONENT_IMPACT_LIGHT_INTENSITY_RATIO;
const SOFTENED_COMPONENT_IMPACT_SHADOW_ALPHA =
  0.78 * COMPONENT_IMPACT_LIGHT_INTENSITY_RATIO;
const SOFTENED_COMPONENT_IMPACT_GLOW_COLOR_ALPHA =
  0.34 * COMPONENT_IMPACT_LIGHT_INTENSITY_RATIO;
const SOFTENED_COMPONENT_IMPACT_GLOW_ALPHA =
  0.76 * COMPONENT_IMPACT_LIGHT_INTENSITY_RATIO;
const SOFTENED_COMPONENT_IMPACT_EXPLOSION_ALPHA =
  0.88 * COMPONENT_IMPACT_LIGHT_INTENSITY_RATIO;
const LASER_FAN_CRACK_LINE_WIDTH = 1.55;
const LASER_FAN_CRACK_LINE_WIDTH_PROGRESS_RATIO = 0.42;
const LASER_FAN_CRACK_LINE_WIDTH_SEED_RATIO = 0.24;
const LASER_FAN_CRACK_LINE_ALPHA = SOFTENED_COMPONENT_IMPACT_CRACK_ALPHA;
const LASER_FAN_CRACK_LINE_COLOR = `rgba(255, 248, 199, ${SOFTENED_COMPONENT_IMPACT_CRACK_ALPHA})`;
const LASER_FAN_CRACK_SHADOW_COLOR = `rgba(97, 232, 255, ${SOFTENED_COMPONENT_IMPACT_SHADOW_ALPHA})`;
const LASER_FAN_GLOW_COLOR = `rgba(245, 247, 255, ${SOFTENED_COMPONENT_IMPACT_GLOW_COLOR_ALPHA})`;
const LASER_FAN_GLOW_MAX_ALPHA = SOFTENED_COMPONENT_IMPACT_GLOW_ALPHA;
const LASER_FAN_GLOW_RADIUS_RATIO = 0.46;
const LASER_FAN_EXPLOSION_PARTICLE_COUNT = 6;
const LASER_FAN_EXPLOSION_RADIUS_RATIO = 0.56;
const LASER_FAN_EXPLOSION_PARTICLE_RADIUS_RATIO = 0.06;
const LASER_FAN_EXPLOSION_MIN_PARTICLE_RADIUS = 1.5;
const LASER_FAN_EXPLOSION_ALPHA = SOFTENED_COMPONENT_IMPACT_EXPLOSION_ALPHA;
const LASER_FAN_SEED_COL_MULTIPLIER = 73_856_093;
const LASER_FAN_SEED_ROW_MULTIPLIER = 19_349_663;
const LASER_FAN_SEED_COLOR_MULTIPLIER = 83_492_791;
const LASER_FAN_SEED_INDEX_MULTIPLIER = 2_654_435_761;
const LASER_FAN_SEED_MODULO = 997;
const LASER_FAN_SEED_NORMALIZER = 997;
const LASER_FAN_CRACK_EDGE_PADDING_RATIO = 0.16;
const LASER_FAN_CRACK_BRANCH_LENGTH_RATIO = 0.36;
const LASER_FAN_LINE_CAP: CanvasLineCap = "round";
const ELECTRIC_IMPACT_VISIBLE_MS = 420;
const ELECTRIC_IMPACT_MAX_ACTIVE = 18;
const FULL_CIRCLE_RADIANS = Math.PI * 2;
const COMPONENT_COLOR_AUDIO_IDS: AudioId[] = [
  GAME_AUDIO_IDS.COMPONENT_BREAK_RED,
  GAME_AUDIO_IDS.COMPONENT_BREAK_BLUE,
  GAME_AUDIO_IDS.COMPONENT_BREAK_GREEN,
  GAME_AUDIO_IDS.COMPONENT_BREAK_YELLOW,
  GAME_AUDIO_IDS.COMPONENT_BREAK_PURPLE,
];
const CANVAS_FONT_FAMILY = "Arial";
const LOADING_TEXT = "Carregando";
const GAME_OVER_TEXT = "FIM DE JOGO!";
const SCORE_TEXT_PREFIX = "Pontuação";
const RESTART_HINT_TEXT = "Use ↻ para jogar novamente";
const CENTER_DIVISOR = 2;
const DUAL_TRAMPOLINE_LEFT_START_ANGLE = Math.PI;
const DUAL_TRAMPOLINE_RIGHT_START_ANGLE = 0;
const DUAL_TRAMPOLINE_WIDTH_SCALE = 0.82;
const DUAL_TRAMPOLINE_SPEED_PER_FRAME = 0.045;
const DUAL_TRAMPOLINE_MIN_SPEED_SCALE = 0.25;
const DUAL_TRAMPOLINE_MAX_SPEED_SCALE = 1.33;
const RADIAL_PLAYFIELD_FILL = "rgba(7, 14, 28, 0.92)";
const RADIAL_PLAYFIELD_STROKE = "rgba(125, 249, 255, 0.72)";
const RADIAL_PLAYFIELD_INNER_STROKE = "rgba(255, 255, 255, 0.18)";
const RADIAL_PLAYFIELD_STROKE_WIDTH = 2;
const RADIAL_PLAYFIELD_INNER_RADIUS_RATIO = 0.74;
const NOOP_AUDIO_SINK: GameAudioSink = {
  playAudio: () => {},
  startGameplayMusic: () => {},
  startMenuMusic: () => {},
  setHighIntensity: () => {},
};

function readFrameTimestamp() {
  return globalThis.performance?.now?.() ?? Date.now();
}

interface CanvasSize {
  width: number;
  height: number;
}

interface LaserFanEffectTarget {
  col: number;
  row: number;
  colorIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  seed: number;
}

export type GameQaScenario =
  | typeof SINGLE_COMPONENT_QA_SCENARIO
  | typeof SINGLE_COMPONENT_PHASE_3_QA_SCENARIO
  | typeof LATE_PHASE_STABILITY_QA_SCENARIO
  | typeof CINEMATIC_RIP_QA_SCENARIO
  | typeof PADDLE_COLLISION_QA_SCENARIO
  | typeof LASER_FAN_QA_SCENARIO
  | typeof MULTIBALL_QA_SCENARIO
  | typeof WIDE_PADDLE_QA_SCENARIO
  | typeof SLOW_BALL_QA_SCENARIO
  | typeof METAL_BLOCK_QA_SCENARIO
  | typeof EVASIVE_BLOCKS_QA_SCENARIO
  | typeof BALL_TURRET_QA_SCENARIO
  | typeof BALL_TURRET_LOSE_QA_SCENARIO
  | typeof AUDIO_QA_SCENARIO;

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private animationFrame = 0;
  private paddle: Paddle;
  private balls: Ball[] = [];
  private components: Components;
  private score = 0;
  private assetsLoaded = false;
  private gameWon = false;
  private gameOver = false;
  private canvasSize: CanvasSize;
  private dimensions: DynamicGameDimensions;
  private radialGeometry: RadialPlayfieldGeometry;
  private scaleX = 1;
  private scaleY = 1;
  private isStopped = true;
  private isPaused = false;
  private isTouching = false;
  private isServeLocked = false;
  private turretControlMode: TurretControlMode = DEFAULT_TURRET_CONTROL_MODE;
  private dualSwitchDirections: Record<TurretSwitchSide, TurretSwitchDirection> = {
    left: 0,
    right: 0,
  };
  private dualTrampolineAngles: Record<TurretSwitchSide, number> = {
    left: DUAL_TRAMPOLINE_LEFT_START_ANGLE,
    right: DUAL_TRAMPOLINE_RIGHT_START_ANGLE,
  };
  private isLevelTransitioning = false;
  private levelTransitionTimer: ReturnType<typeof setTimeout> | null = null;
  private level = 1;
  private levelStartedAt = Date.now();
  private initialComponentCount = 0;
  private successfulComponentHitsThisLevel = 0;
  private latestSpeedReduction: SpeedReductionSnapshot | null = null;
  private phaseSpeedConfig: PhaseSpeedConfig | null = null;
  private qaScenarioConsumed = false;
  private comboCount = 0;
  private lastComponentDestroyedAt = 0;
  private lastComboAudioAt = 0;
  private destroyedComponentsSincePowerUp = 0;
  private activePowerUp: PowerUp | null = null;
  private nextPowerUpIndex = 0;
  private lastFrameTimestamp = 0;
  private powerUpEffectTimers: ReturnType<typeof setTimeout>[] = [];
  private laserFanSpawnsThisLevel = 0;
  private laserFanEffectStartedAt = 0;
  private laserFanEffectUntil = 0;
  private laserFanEffectTargets: LaserFanEffectTarget[] = [];
  private laserFanEffectTimer: ReturnType<typeof setTimeout> | null = null;
  private electricImpactEffects: ElectricImpactEffect[] = [];
  private electricImpactSequence = 0;
  private readonly ambientElectricBackground: AmbientElectricBackground;
  private readonly handleKeyDown = (event: KeyboardEvent) => {
    this.releaseServeLock();
    this.paddle.onKeyDown(event);
  };
  private readonly handleKeyUp = (event: KeyboardEvent) =>
    this.paddle.onKeyUp(event);
  private readonly resolveAssetPath = (role: GameVisualAssetRole) =>
    resolveGameVisualAssetPath(this.imageSetId, role);
  private readonly handleElectricImpact = (impact: ElectricImpactEvent) => {
    const seed = nextElectricImpactSeed(impact, this.electricImpactSequence);
    this.electricImpactSequence += 1;
    this.electricImpactEffects.push({
      ...impact,
      origin: { ...impact.origin },
      endpoints: [
        { ...impact.endpoints[0] },
        { ...impact.endpoints[1] },
      ],
      startedAt: Date.now(),
      durationMs: ELECTRIC_IMPACT_VISIBLE_MS,
      seed: Math.abs(seed),
    });

    if (this.electricImpactEffects.length > ELECTRIC_IMPACT_MAX_ACTIVE) {
      this.electricImpactEffects.splice(
        0,
        this.electricImpactEffects.length - ELECTRIC_IMPACT_MAX_ACTIVE,
      );
    }
  };

  private maxComponentRows = 0;
  private baseComponentRows = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private onScoreUpdate: (score: number) => void,
    _onGameWon?: () => void,
    private onGameOver?: () => void,
    canvasSize?: CanvasSize,
    private onLevelTransition?: (
      payload: LevelTransitionPayload,
    ) => void | Promise<void>,
    private qaScenario?: GameQaScenario | null,
    private audioSink: GameAudioSink = NOOP_AUDIO_SINK,
    private onLevelChange?: (level: number) => void,
    private imageSetId: ImageSetId = IMAGE_SET_RETRO_DEFAULT,
    private gameMode: GameMode = GAME_MODE_CLASSIC,
    initialTurretControlMode: TurretControlMode = DEFAULT_TURRET_CONTROL_MODE,
    private onServeLockChange?: (locked: boolean) => void,
  ) {
    LOG(`🚀 GameEngine constructor iniciado`);
    this.turretControlMode = initialTurretControlMode;
    this.ambientElectricBackground = new AmbientElectricBackground(
      resolveAmbientElectricVariant(readLightningVariantSearchParam()),
    );

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(ERROR_NO_2D_CONTEXT);
    this.ctx = ctx;

    LOG(`🎯 Canvas context obtido`);

    // Usar tamanho do canvas atual se não fornecido
    this.canvasSize = canvasSize || {
      width: canvas.width,
      height: canvas.height,
    };

    LOG(`📏 Canvas size: ${this.canvasSize.width}x${this.canvasSize.height}`);

    // Calcular dimensões dinâmicas baseadas no tamanho do canvas
    this.dimensions = this.createDimensions(
      this.canvasSize.width,
      this.canvasSize.height,
    );
    this.radialGeometry = this.createRadialGeometry(this.dimensions);
    this.baseComponentRows = this.dimensions.componentRows;

    LOG(
      `📐 Dimensões calculadas: ${this.dimensions.componentCols} colunas x ${this.dimensions.componentRows} linhas`,
    );
    LOG(
      `📐 Tamanho dos blocos: ${this.dimensions.componentWidth}x${this.dimensions.componentHeight}`,
    );

    // Calcular escala para manter proporções
    this.scaleX = this.canvasSize.width / CANVAS_WIDTH;
    this.scaleY = this.canvasSize.height / CANVAS_HEIGHT;

    if (this.qaScenario === LATE_PHASE_STABILITY_QA_SCENARIO) {
      this.level = LATE_PHASE_STABILITY_LEVEL;
    }
    if (this.qaScenario === SINGLE_COMPONENT_PHASE_3_QA_SCENARIO) {
      this.level = 3;
    }

    LOG(`⚽ Criando Ball...`);
    this.paddle = new Paddle(
      this.canvasSize.width,
      this.canvasSize.height,
      this.dimensions,
      this.resolveAssetPath,
      this.radialGeometry,
    );
    this.balls.push(this.createBall(calculateLevelSpeedMultiplier(this.level)));
    this.prepareQaBall();
    this.prepareEvasiveBlocksQaBall();
    this.prepareCinematicRipBall();
    this.preparePaddleCollisionQaBall();
    this.prepareBallTurretLoseQaBall();
    this.prepareLatePhaseStabilityBall();

    LOG(`🏗️  Criando Components...`);
    this.configureComponentRows();
    this.applyLevelComponentRows(this.level);
    this.components = this.createComponents();
    this.preparePowerUpQaScenarios();
    this.startLevelSpeedTracking(this.level);
    this.armServeLock();

    LOG(`🎮 GameEngine constructor finalizado`);
    this.setupListeners();
  }

  private createRadialGeometry(
    dimensions: DynamicGameDimensions,
  ): RadialPlayfieldGeometry {
    if (this.isBallTurretMode()) {
      return calculateBallTurretPlayfieldGeometry(
        this.canvasSize.width,
        this.canvasSize.height,
        dimensions,
      );
    }

    return calculateRadialPlayfieldGeometry(
      this.canvasSize.width,
      this.canvasSize.height,
      dimensions,
    );
  }

  private createDimensions(
    canvasWidth: number,
    canvasHeight: number,
  ): DynamicGameDimensions {
    const dimensions = calculateDynamicDimensions(canvasWidth, canvasHeight);
    if (this.isSingleComponentQaScenario() && !this.qaScenarioConsumed) {
      return {
        ...dimensions,
        componentCols: 1,
        componentRows: 1,
        componentWidth: Math.min(96, Math.max(56, canvasWidth * 0.24)),
        componentHeight: Math.min(28, Math.max(18, canvasHeight * 0.05)),
        componentPadding: 8,
        componentOffsetTop: Math.max(24, canvasHeight * 0.12),
        componentOffsetLeft:
          (canvasWidth - Math.min(96, Math.max(56, canvasWidth * 0.24))) / 2,
      };
    }

    if (this.qaScenario === PADDLE_COLLISION_QA_SCENARIO) {
      return {
        ...dimensions,
        componentCols: 0,
        componentRows: 0,
      };
    }

    if (this.isEvasiveBlocksQaScenario() && !this.qaScenarioConsumed) {
      const componentWidth = Math.min(
        EVASIVE_BLOCKS_QA_COMPONENT_WIDTH_MAX,
        Math.max(
          EVASIVE_BLOCKS_QA_COMPONENT_WIDTH_MIN,
          canvasWidth * EVASIVE_BLOCKS_QA_COMPONENT_WIDTH_RATIO,
        ),
      );
      const componentHeight = Math.min(
        EVASIVE_BLOCKS_QA_COMPONENT_HEIGHT_MAX,
        Math.max(
          EVASIVE_BLOCKS_QA_COMPONENT_HEIGHT_MIN,
          canvasHeight * EVASIVE_BLOCKS_QA_COMPONENT_HEIGHT_RATIO,
        ),
      );
      const totalComponentsWidth =
        EVASIVE_BLOCKS_QA_COMPONENT_COLS * componentWidth +
        (EVASIVE_BLOCKS_QA_COMPONENT_COLS - 1) * EVASIVE_BLOCKS_QA_COMPONENT_PADDING;

      return {
        ...dimensions,
        componentCols: EVASIVE_BLOCKS_QA_COMPONENT_COLS,
        componentRows: EVASIVE_BLOCKS_QA_COMPONENT_ROWS,
        componentWidth,
        componentHeight,
        componentPadding: EVASIVE_BLOCKS_QA_COMPONENT_PADDING,
        componentOffsetTop: Math.max(24, canvasHeight * 0.12),
        componentOffsetLeft: (canvasWidth - totalComponentsWidth) / CENTER_DIVISOR,
      };
    }

    if (this.isBallTurretMode()) {
      const componentCols =
        dimensions.componentCols * BALL_TURRET_COMPONENT_COLUMN_MULTIPLIER;
      const totalComponentsWidth =
        componentCols * dimensions.componentWidth +
        (componentCols - 1) * dimensions.componentPadding;

      return {
        ...dimensions,
        componentCols,
        componentOffsetLeft: (canvasWidth - totalComponentsWidth) / CENTER_DIVISOR,
      };
    }

    return dimensions;
  }

  private createResizedDimensions(
    canvasWidth: number,
    canvasHeight: number,
  ): DynamicGameDimensions {
    const dimensions = this.createDimensions(canvasWidth, canvasHeight);
    this.baseComponentRows = dimensions.componentRows;
    const componentCols = this.dimensions.componentCols;
    const componentRows = this.dimensions.componentRows;
    const totalComponentsWidth =
      componentCols * dimensions.componentWidth +
      (componentCols - 1) * dimensions.componentPadding;

    return {
      ...dimensions,
      componentCols,
      componentRows,
      componentOffsetLeft: (canvasWidth - totalComponentsWidth) / CENTER_DIVISOR,
    };
  }

  public resize(nextCanvasSize: CanvasSize) {
    if (
      nextCanvasSize.width === this.canvasSize.width &&
      nextCanvasSize.height === this.canvasSize.height
    ) {
      return;
    }

    LOG(
      `📐 Redimensionando canvas sem reiniciar: ${this.canvasSize.width}x${this.canvasSize.height} -> ${nextCanvasSize.width}x${nextCanvasSize.height}`,
    );

    this.canvasSize = nextCanvasSize;
    this.canvas.width = nextCanvasSize.width;
    this.canvas.height = nextCanvasSize.height;
    this.dimensions = this.createResizedDimensions(
      this.canvasSize.width,
      this.canvasSize.height,
    );
    this.radialGeometry = this.createRadialGeometry(this.dimensions);
    this.configureComponentRows();
    this.scaleX = this.canvasSize.width / CANVAS_WIDTH;
    this.scaleY = this.canvasSize.height / CANVAS_HEIGHT;
    this.paddle.resize(
      this.canvasSize.width,
      this.canvasSize.height,
      this.dimensions,
      this.radialGeometry,
    );
    this.balls.forEach((ball) =>
      ball.resize(
        this.canvasSize.width,
        this.canvasSize.height,
        this.dimensions,
        this.radialGeometry,
      ),
    );
    if (this.isServeLocked) {
      this.balls.forEach((ball) => this.positionBallForCurrentMode(ball));
    }
    this.components.resize(this.dimensions, this.maxComponentRows, this.radialGeometry);
    this.activePowerUp?.setSize(this.getPowerUpSize());
  }

  public setImageSet(imageSetId: ImageSetId) {
    if (this.imageSetId === imageSetId) return;

    this.imageSetId = imageSetId;
  }

  private configureComponentRows() {
    this.maxComponentRows = this.calculateMaxComponentRows(this.dimensions);
  }

  private calculateMaxComponentRows(dimensions: DynamicGameDimensions): number {
    const availableHeight =
      this.canvasSize.height -
      dimensions.paddleHeight -
      dimensions.componentOffsetTop;
    const computedRows = Math.floor(
      availableHeight / (dimensions.componentHeight + dimensions.componentPadding),
    );

    return Math.max(dimensions.componentRows, computedRows);
  }

  private applyLevelComponentRows(level: number) {
    this.dimensions = {
      ...this.dimensions,
      componentRows: calculateLevelComponentRows(
        this.baseComponentRows,
        this.maxComponentRows,
        level,
      ),
    };
  }

  private createComponents(): Components {
    const componentQaRandom = this.createComponentQaRandom();
    if (componentQaRandom) {
      return new Components(
        this.dimensions,
        this.onComponentDestroyed.bind(this),
        this.maxComponentRows,
        undefined,
        this.resolveAssetPath,
        componentQaRandom,
        this.radialGeometry,
        this.handleElectricImpact,
      );
    }

    return new Components(
      this.dimensions,
      this.onComponentDestroyed.bind(this),
      this.maxComponentRows,
      undefined,
      this.resolveAssetPath,
      undefined,
      this.radialGeometry,
      this.handleElectricImpact,
    );
  }

  private createBall(speedMultiplier: number): Ball {
    const ball = new Ball(
      this.canvasSize.width,
      this.canvasSize.height,
      this.dimensions,
      speedMultiplier,
      this.resolveAssetPath,
      this.radialGeometry,
      this.handleElectricImpact,
    );

    this.positionBallForCurrentMode(ball);

    return ball;
  }

  private isSingleComponentQaScenario(): boolean {
    return (
      this.qaScenario === SINGLE_COMPONENT_QA_SCENARIO ||
      this.qaScenario === SINGLE_COMPONENT_PHASE_3_QA_SCENARIO ||
      this.qaScenario === METAL_BLOCK_QA_SCENARIO
    );
  }

  private isEvasiveBlocksQaScenario(): boolean {
    return this.qaScenario === EVASIVE_BLOCKS_QA_SCENARIO;
  }

  private createComponentQaRandom(): (() => number) | null {
    return (
      this.createMetalBlockQaRandom() ?? this.createEvasiveBlocksQaRandom()
    );
  }

  private createMetalBlockQaRandom(): (() => number) | null {
    if (
      this.qaScenario !== METAL_BLOCK_QA_SCENARIO ||
      this.qaScenarioConsumed
    ) {
      return null;
    }

    let index = 0;
    return () =>
      METAL_BLOCK_QA_RANDOM_VALUES[index++] ?? METAL_BLOCK_QA_RANDOM_FALLBACK;
  }

  private createEvasiveBlocksQaRandom(): (() => number) | null {
    if (
      this.qaScenario !== EVASIVE_BLOCKS_QA_SCENARIO ||
      this.qaScenarioConsumed
    ) {
      return null;
    }

    let index = 0;
    return () =>
      EVASIVE_BLOCKS_QA_RANDOM_VALUES[index++] ??
      EVASIVE_BLOCKS_QA_RANDOM_FALLBACK;
  }

  private prepareQaBall() {
    if (
      !this.isSingleComponentQaScenario() ||
      this.qaScenarioConsumed ||
      this.balls.length === 0
    )
      return;

    const ball = this.balls[0];
    const targetX =
      this.dimensions.componentOffsetLeft + this.dimensions.componentWidth / 2;
    const targetY =
      this.dimensions.componentOffsetTop +
      this.dimensions.componentHeight +
      ball.position.radius -
      1;
    ball.setPosition(targetX, targetY);
    ball.setDirection(0);
  }

  private prepareEvasiveBlocksQaBall() {
    if (
      !this.isEvasiveBlocksQaScenario() ||
      this.qaScenarioConsumed ||
      this.balls.length === 0
    )
      return;

    const ball = this.balls[0];
    const targetX =
      this.dimensions.componentOffsetLeft + this.dimensions.componentWidth / 2;
    const targetY =
      this.dimensions.componentOffsetTop +
      EVASIVE_BLOCKS_QA_TARGET_ROW *
        (this.dimensions.componentHeight + this.dimensions.componentPadding) +
      this.dimensions.componentHeight +
      ball.position.radius -
      1;
    ball.setPosition(targetX, targetY);
    ball.setDirection(0);
  }

  private prepareLatePhaseStabilityBall() {
    if (
      this.qaScenario !== LATE_PHASE_STABILITY_QA_SCENARIO ||
      this.balls.length === 0
    )
      return;

    const ball = this.balls[0];
    ball.setPosition(
      this.canvasSize.width - ball.position.radius - 1,
      this.canvasSize.height * LATE_PHASE_STABILITY_Y_RATIO,
    );
    ball.setDirection(Math.PI / 2);
  }

  private prepareCinematicRipBall() {
    if (
      this.qaScenario !== CINEMATIC_RIP_QA_SCENARIO ||
      this.balls.length === 0
    )
      return;

    const ball = this.balls[0];
    ball.setPosition(
      this.canvasSize.width * CINEMATIC_RIP_X_RATIO,
      this.canvasSize.height + ball.position.radius + CINEMATIC_RIP_Y_OFFSET,
    );
    ball.setDirection(
      Math.atan2(
        ball.position.y - this.radialGeometry.centerY,
        ball.position.x - this.radialGeometry.centerX,
      ),
    );
  }

  private preparePaddleCollisionQaBall() {
    if (
      this.qaScenario !== PADDLE_COLLISION_QA_SCENARIO ||
      this.balls.length === 0
    )
      return;

    const ball = this.balls[0];
    const paddlePosition = this.paddle.position;

    if (!this.isBallTurretMode()) {
      const targetX = paddlePosition.x + paddlePosition.width / 2;
      const targetY =
        paddlePosition.y - ball.position.radius - PADDLE_COLLISION_QA_BALL_INSET;
      ball.setPosition(targetX, targetY);
      ball.setDirection(Math.PI / CENTER_DIVISOR);
      return;
    }

    const radialPaddle = paddlePosition.radial;
    const targetRadius = Math.max(
      ball.position.radius + 4,
      radialPaddle.radius -
        radialPaddle.thickness / CENTER_DIVISOR -
        ball.position.radius -
        PADDLE_COLLISION_QA_BALL_INSET -
        PADDLE_COLLISION_QA_INWARD_OFFSET,
    );
    const targetAngle = radialPaddle.centerAngle;

    ball.setPosition(
      radialPaddle.centerX + Math.cos(targetAngle) * targetRadius,
      radialPaddle.centerY + Math.sin(targetAngle) * targetRadius,
    );
    ball.setDirection(targetAngle);
  }

  private prepareBallTurretLoseQaBall() {
    if (
      this.qaScenario !== BALL_TURRET_LOSE_QA_SCENARIO ||
      this.balls.length === 0
    )
      return;

    const ball = this.balls[0];
    const segments = calculateBallTurretBoundarySegments(this.level);
    const lossSegment = segments.find((segment) => !segment.rebounds);

    if (!lossSegment) return;

    const lossAngle =
      (lossSegment.startAngle + lossSegment.endAngle) / CENTER_DIVISOR;

    ball.setPosition(this.radialGeometry.centerX, this.radialGeometry.centerY);
    ball.setDirection(lossAngle);
  }

  private preparePowerUpQaScenarios() {
    if (this.qaScenario === LASER_FAN_QA_SCENARIO) {
      this.spawnRadialQaPowerUp("laser_fan");
      this.laserFanSpawnsThisLevel = 1;
      return;
    }

    if (this.qaScenario === MULTIBALL_QA_SCENARIO) {
      this.spawnRadialQaPowerUp("multiball");
      return;
    }

    if (this.qaScenario === WIDE_PADDLE_QA_SCENARIO) {
      this.spawnRadialQaPowerUp("wide_paddle");
      return;
    }

    if (this.qaScenario === SLOW_BALL_QA_SCENARIO) {
      this.spawnRadialQaPowerUp("slow_ball");
    }
  }

  private spawnRadialQaPowerUp(powerUpType: PowerUpType) {
    if (this.qaScenarioConsumed) return;

    const powerUpSize = this.getPowerUpSize();
    const directionX = Math.cos(BALL_TURRET_BOTTOM_SPAWN_ANGLE);
    const directionY = Math.sin(BALL_TURRET_BOTTOM_SPAWN_ANGLE);
    const startRadius = Math.max(
      0,
      this.radialGeometry.radius -
        powerUpSize / CENTER_DIVISOR -
        LASER_FAN_QA_POWER_UP_BOUNDARY_INSET,
    );

    this.activePowerUp = new PowerUp(
      this.radialGeometry.centerX + directionX * startRadius,
      this.radialGeometry.centerY + directionY * startRadius,
      powerUpType,
      powerUpSize,
      this.resolveAssetPath,
      {
        kind: "radial",
        centerX: this.radialGeometry.centerX,
        centerY: this.radialGeometry.centerY,
        directionX,
        directionY,
        boundaryRadius: this.radialGeometry.radius,
      },
    );
  }

  private positionBallForCurrentMode(ball: Ball) {
    const spawnX = this.radialGeometry.centerX;
    const spawnY = this.radialGeometry.centerY;

    ball.setPosition(spawnX, spawnY);
    if (!this.isBallTurretMode()) return;

    ball.setDirection(
      this.calculateBallTurretInitialLaunchAngle(spawnX, spawnY),
    );
  }

  private calculateBallTurretInitialLaunchAngle(
    spawnX: number,
    spawnY: number,
  ) {
    const targetX =
      this.radialGeometry.centerX +
      Math.cos(DUAL_TRAMPOLINE_RIGHT_START_ANGLE) *
        this.radialGeometry.paddleRadius;
    const targetY =
      this.radialGeometry.centerY +
      Math.sin(DUAL_TRAMPOLINE_RIGHT_START_ANGLE) *
        this.radialGeometry.paddleRadius;

    return Math.atan2(targetX - spawnX, spawnY - targetY);
  }

  private shouldUseServeLock() {
    return (
      this.isBallTurretMode() &&
      (!this.qaScenario || this.qaScenario === BALL_TURRET_QA_SCENARIO)
    );
  }

  private armServeLock() {
    this.setServeLock(this.shouldUseServeLock());
  }

  private releaseServeLock() {
    this.setServeLock(false);
  }

  private setServeLock(locked: boolean) {
    if (this.isServeLocked === locked) return;

    this.isServeLocked = locked;
    this.onServeLockChange?.(locked);
  }

  private async preloadAssets() {
    LOG("🎮 Assets serão carregados sob demanda.");
    this.assetsLoaded = true;
  }

  private onComponentDestroyed(colorIndex: number) {
    this.playComponentAudio(colorIndex);
    this.updateComboAudio();
    this.maybeSpawnPowerUp();
    this.score += POINTS_PER_COMPONENT;
    this.successfulComponentHitsThisLevel += 1;
    this.onScoreUpdate(this.score);
    this.latestSpeedReduction = this.getLatestSpeedReductionFromBalls();
    if (this.latestSpeedReduction) {
      this.latestSpeedReduction = {
        ...this.latestSpeedReduction,
        hitNumber: this.successfulComponentHitsThisLevel,
      };
    }

    LOG(
      `🎯 onComponentDestroyed: Score = ${this.score}, Verificando se todos os blocos foram destruídos...`,
    );

    // Log do evento de pontuação
    const gameState = this.getCurrentGameState();
    const ballPositions = this.getBallPositions();
    const paddlePosition = this.paddle.position;

    void gameLogger
      .logScoreUpdate(
        gameState,
        ballPositions,
        paddlePosition,
        POINTS_PER_COMPONENT,
        "component_destroyed",
        this.latestSpeedReduction,
      )
      .catch((error) => ERROR("❌ Erro ao registrar pontuação:", error));

    // Verificar se todos os blocos foram destruídos
    if (this.components.isAllDestroyed() && !this.isLevelTransitioning) {
      this.startLevelTransition(gameState, ballPositions, paddlePosition);
    }
  }

  private startLevelTransition(
    gameState: ReturnType<GameEngine["getCurrentGameState"]>,
    ballPositions: ReturnType<GameEngine["getBallPositions"]>,
    paddlePosition: { x: number; y: number; width: number; height: number },
  ) {
    this.isLevelTransitioning = true;
    this.clearPowerUpEffects();
    this.activePowerUp = null;
    this.audioSink.playAudio(GAME_AUDIO_IDS.LEVEL_COMPLETE);
    const currentLevel = this.level;
    const nextLevel = currentLevel + 1;
    const nextSpeedMultiplier = calculateLevelSpeedMultiplier(nextLevel);
    const nextInitialComponentCount =
      this.getExpectedInitialComponentCountForLevel(nextLevel);
    const nextMaxSpeed = calculateLevelMaxSpeed(
      this.canvasSize.width,
      nextLevel,
    );
    const nextMinSpeed = calculateLevelMinSpeed(
      this.canvasSize.width,
      nextLevel,
    );
    const nextReductionPerComponent = calculateSpeedReductionPerComponent(
      nextMaxSpeed,
      nextInitialComponentCount,
      nextMinSpeed,
    );
    const payload: LevelTransitionPayload = {
      currentLevel,
      nextLevel,
      nextSpeedMultiplier,
      pauseMs: LEVEL_CLEAR_PAUSE_MS,
      nextMaxSpeed,
      nextMinSpeed,
      nextReductionPerComponent,
      nextInitialComponentCount,
    };

    void gameLogger
      .logLevelComplete(
        gameState,
        ballPositions,
        paddlePosition,
        currentLevel,
        nextLevel,
        nextSpeedMultiplier,
        LEVEL_CLEAR_PAUSE_MS,
        {
          nextMaxSpeed,
          nextMinSpeed,
          nextReductionPerComponent,
          nextInitialComponentCount,
        },
      )
      .catch((error) => ERROR("❌ Erro ao registrar fase concluída:", error));

    this.audioSink.setHighIntensity(
      nextSpeedMultiplier >= HIGH_INTENSITY_SPEED_MULTIPLIER,
    );
    const levelTransitionResult = this.onLevelTransition?.(payload);

    if (
      levelTransitionResult &&
      typeof levelTransitionResult.then === "function"
    ) {
      levelTransitionResult
        .catch((error) =>
          ERROR("❌ Erro recuperável na transição de fase:", error),
        )
        .finally(() => {
          if (this.isStopped || !this.isLevelTransitioning) return;
          this.finishLevelTransition(nextLevel, nextSpeedMultiplier);
        });
      return;
    }

    this.levelTransitionTimer = setTimeout(() => {
      this.finishLevelTransition(nextLevel, nextSpeedMultiplier);
    }, LEVEL_CLEAR_PAUSE_MS);
  }

  private finishLevelTransition(
    nextLevel: number,
    nextSpeedMultiplier: number,
  ) {
    this.level = nextLevel;
    if (this.isSingleComponentQaScenario() && !this.qaScenarioConsumed) {
      this.qaScenarioConsumed = true;
      this.dimensions = this.createDimensions(
        this.canvasSize.width,
        this.canvasSize.height,
      );
      this.baseComponentRows = this.dimensions.componentRows;
      this.configureComponentRows();
    }
    this.applyLevelComponentRows(nextLevel);
    this.radialGeometry = this.createRadialGeometry(this.dimensions);
    this.paddle.reset();
    this.activePowerUp = null;
    this.resetLaserFanSpawnCounterForLevel();
    this.destroyedComponentsSincePowerUp = 0;
    this.balls = [this.createBall(nextSpeedMultiplier)];
    this.armServeLock();
    this.prepareQaBall();
    this.components = this.createComponents();
    this.startLevelSpeedTracking(nextLevel);
    this.onLevelChange?.(this.level);
    this.isLevelTransitioning = false;
    this.audioSink.playAudio(GAME_AUDIO_IDS.LEVEL_START);
    this.audioSink.startGameplayMusic();
    this.audioSink.setHighIntensity(
      nextSpeedMultiplier >= HIGH_INTENSITY_SPEED_MULTIPLIER,
    );

    const gameState = this.getCurrentGameState();
    void gameLogger
      .logLevelStart(
        gameState,
        this.getBallPositions(),
        this.paddle.position,
        nextLevel,
        nextSpeedMultiplier,
      )
      .catch((error) => ERROR("❌ Erro ao registrar início de fase:", error));
  }

  private getRemainingComponentsCount(): number {
    let count = 0;
    for (let c = 0; c < this.dimensions.componentCols; c++) {
      for (let r = 0; r < this.components.getRows(); r++) {
        if (this.components.isComponentActive(c, r)) {
          count++;
        }
      }
    }
    return count;
  }

  private getCurrentGameState() {
    return {
      score: this.score,
      ballsCount: this.balls.length,
      componentsRemaining: this.getRemainingComponentsCount(),
      gameWon: this.gameWon,
      gameOver: this.gameOver,
      level: this.level,
      canvasSize: this.canvasSize,
      gameDimensions: {
        componentWidth: this.dimensions.componentWidth,
        componentHeight: this.dimensions.componentHeight,
        componentCols: this.dimensions.componentCols,
        componentRows: this.dimensions.componentRows,
        paddleWidth: this.dimensions.paddleWidth,
        paddleHeight: this.dimensions.paddleHeight,
        ballRadius: this.dimensions.ballRadius,
      },
      speedState: this.buildSpeedStateSnapshot(),
    };
  }

  private getBallPositions() {
    return this.balls.map((ball) => ({
      x: ball.position.x,
      y: ball.position.y,
      velocity: ball.getVelocity(),
      radius: ball.position.radius,
    }));
  }

  private getInitialComponentCount(): number {
    return Math.max(1, this.getRemainingComponentsCount());
  }

  private getElapsedLevelMs(): number {
    return Math.max(0, Date.now() - this.levelStartedAt);
  }

  private buildPhaseSpeedConfig(
    level: number,
    initialComponentCount: number,
    levelStartedAt: number,
  ): PhaseSpeedConfig {
    const maxSpeed = calculateLevelMaxSpeed(this.canvasSize.width, level);
    const minSpeed = calculateLevelMinSpeed(this.canvasSize.width, level);
    return {
      level,
      initialComponentCount,
      initialSpawnSpeed: calculateLevelInitialSpawnSpeed(
        this.canvasSize.width,
        level,
      ),
      maxSpeed,
      minSpeed,
      reductionPerComponent: calculateSpeedReductionPerComponent(
        maxSpeed,
        initialComponentCount,
        minSpeed,
      ),
      previousLevelMaxSpeed: calculateLevelPreviousMaxSpeed(
        this.canvasSize.width,
        level,
      ),
      levelStartedAt,
    };
  }

  private startLevelSpeedTracking(level: number) {
    this.levelStartedAt = Date.now();
    this.initialComponentCount = this.getInitialComponentCount();
    this.successfulComponentHitsThisLevel = 0;
    this.latestSpeedReduction = null;
    this.phaseSpeedConfig = this.buildPhaseSpeedConfig(
      level,
      this.initialComponentCount,
      this.levelStartedAt,
    );
    this.balls.forEach((ball) =>
      ball.applyPhaseSpeedConfig(this.phaseSpeedConfig!),
    );
  }

  private getLatestSpeedReductionFromBalls(): SpeedReductionSnapshot | null {
    for (const ball of this.balls) {
      const speedReduction = ball.getLastSpeedReduction();
      if (speedReduction) {
        return speedReduction;
      }
    }

    return null;
  }

  private buildSpeedStateSnapshot(): SpeedStateSnapshot {
    const activeBall = this.balls[0];
    if (activeBall) {
      const snapshot = activeBall.getSpeedStateSnapshot();
      return {
        ...snapshot,
        successfulComponentHits: this.successfulComponentHitsThisLevel,
      };
    }

    const fallbackConfig =
      this.phaseSpeedConfig ??
      this.buildPhaseSpeedConfig(
        this.level,
        Math.max(
          1,
          this.initialComponentCount ||
            this.dimensions.componentCols * this.dimensions.componentRows,
        ),
        this.levelStartedAt,
      );
    const currentSpeed =
      this.latestSpeedReduction?.speedAfter ?? fallbackConfig.initialSpawnSpeed;

    return {
      level: fallbackConfig.level,
      initialComponentCount: fallbackConfig.initialComponentCount,
      successfulComponentHits: this.successfulComponentHitsThisLevel,
      initialSpawnSpeed: fallbackConfig.initialSpawnSpeed,
      maxSpeed: fallbackConfig.maxSpeed,
      minSpeed: fallbackConfig.minSpeed,
      currentSpeed,
      reductionPerComponent: fallbackConfig.reductionPerComponent,
      previousLevelMaxSpeed: fallbackConfig.previousLevelMaxSpeed,
      levelStartedAt: fallbackConfig.levelStartedAt,
      elapsedLevelMs: this.getElapsedLevelMs(),
      minReached: currentSpeed <= fallbackConfig.minSpeed,
    };
  }

  private playComponentAudio(colorIndex: number) {
    const colorAudioId =
      COMPONENT_COLOR_AUDIO_IDS[colorIndex] || GAME_AUDIO_IDS.COMPONENT_BREAK_RED;
    this.audioSink.playAudio(GAME_AUDIO_IDS.COMPONENT_HIT);
    this.audioSink.playAudio(colorAudioId);
    this.audioSink.playAudio(GAME_AUDIO_IDS.SCORE_TICK);
  }

  private updateComboAudio() {
    const now = Date.now();
    this.comboCount =
      now - this.lastComponentDestroyedAt <= COMBO_WINDOW_MS
        ? this.comboCount + 1
        : 1;
    this.lastComponentDestroyedAt = now;

    if (now - this.lastComboAudioAt < COMBO_COOLDOWN_MS) return;
    if (this.comboCount >= COMBO_LARGE_THRESHOLD) {
      this.audioSink.playAudio(GAME_AUDIO_IDS.COMBO_LARGE);
      this.lastComboAudioAt = now;
      return;
    }
    if (this.comboCount >= COMBO_SMALL_THRESHOLD) {
      this.audioSink.playAudio(GAME_AUDIO_IDS.COMBO_SMALL);
      this.lastComboAudioAt = now;
    }
  }

  private maybeSpawnPowerUp() {
    this.destroyedComponentsSincePowerUp += 1;
    if (
      this.activePowerUp ||
      this.destroyedComponentsSincePowerUp < POWER_UP_SPAWN_INTERVAL
    )
      return;

    this.destroyedComponentsSincePowerUp = 0;
    const powerUpType = this.selectNextPowerUpType();
    if (!powerUpType) return;
    this.activePowerUp = this.createPowerUp(powerUpType);
    this.audioSink.playAudio(GAME_AUDIO_IDS.POWERUP_SPAWN);
    void this.logPowerUpEvent(powerUpType, POWER_UP_ACTION_SPAWN);
  }

  private createPowerUp(powerUpType: PowerUpType): PowerUp {
    if (this.isBallTurretMode()) {
      return this.createBallTurretPowerUp(powerUpType);
    }

    const ballPosition = this.balls[0]?.position;
    const spawnX = Math.max(
      POWER_UP_EDGE_PADDING,
      Math.min(
        this.canvasSize.width - POWER_UP_EDGE_PADDING,
        ballPosition?.x ?? this.canvasSize.width / 2,
      ),
    );
    const spawnY = this.dimensions.componentOffsetTop + POWER_UP_START_Y_OFFSET;
    return new PowerUp(
      spawnX,
      spawnY,
      powerUpType,
      this.getPowerUpSize(),
      this.resolveAssetPath,
    );
  }

  private createBallTurretPowerUp(powerUpType: PowerUpType): PowerUp {
    const angle = this.getBallTurretPowerUpDirectionAngle();
    const motion: RadialPowerUpMotion = {
      kind: "radial",
      centerX: this.radialGeometry.centerX,
      centerY: this.radialGeometry.centerY,
      directionX: Math.cos(angle),
      directionY: Math.sin(angle),
      boundaryRadius: this.radialGeometry.radius,
    };

    return new PowerUp(
      this.radialGeometry.centerX,
      this.radialGeometry.centerY,
      powerUpType,
      this.getPowerUpSize(),
      this.resolveAssetPath,
      motion,
    );
  }

  private getBallTurretPowerUpDirectionAngle(): number {
    const ballPosition = this.balls[0]?.position;
    if (!ballPosition) return BALL_TURRET_POWER_UP_FALLBACK_ANGLE;

    const dx = ballPosition.x - this.radialGeometry.centerX;
    const dy = ballPosition.y - this.radialGeometry.centerY;
    if (Math.hypot(dx, dy) <= ballPosition.radius) {
      return BALL_TURRET_POWER_UP_FALLBACK_ANGLE;
    }

    return Math.atan2(dy, dx);
  }

  private selectNextPowerUpType(): PowerUpType | null {
    for (let attempt = 0; attempt < ACTIVE_POWER_UP_TYPES.length; attempt++) {
      const powerUpType =
        ACTIVE_POWER_UP_TYPES[
          this.nextPowerUpIndex % ACTIVE_POWER_UP_TYPES.length
        ];
      this.nextPowerUpIndex += 1;

      if (
        powerUpType === "laser_fan" &&
        this.laserFanSpawnsThisLevel >= LASER_FAN_MAX_SPAWNS_PER_LEVEL
      ) {
        continue;
      }

      if (powerUpType === "laser_fan") {
        this.laserFanSpawnsThisLevel += 1;
      }

      return powerUpType;
    }

    return null;
  }

  private resetLaserFanSpawnCounterForLevel() {
    this.laserFanSpawnsThisLevel = 0;
  }

  private getPowerUpSize(): number {
    return calculatePowerUpSize(this.dimensions);
  }

  private updatePowerUp(frameScale = 1) {
    if (!this.activePowerUp || this.isLevelTransitioning || this.gameOver)
      return;

    this.activePowerUp.update(frameScale);
    if (this.isBallTurretMode()) {
      if (this.activePowerUp.hasReachedRadialBoundary()) {
        const powerUpType = this.activePowerUp.getType();
        this.activePowerUp = null;
        void this.logPowerUpEvent(powerUpType, POWER_UP_ACTION_COLLECT);
        void this.activatePowerUp(powerUpType);
        return;
      }

      if (this.activePowerUp.isOutOfBounds(this.canvasSize.height)) {
        void this.logPowerUpEvent(
          this.activePowerUp.getType(),
          POWER_UP_ACTION_MISS,
        );
        this.activePowerUp = null;
      }
      return;
    }

    if (this.activePowerUp.intersects(this.paddle.position)) {
      const powerUpType = this.activePowerUp.getType();
      this.activePowerUp = null;
      void this.logPowerUpEvent(powerUpType, POWER_UP_ACTION_COLLECT);
      void this.activatePowerUp(powerUpType);
      return;
    }

    if (this.activePowerUp.isOutOfBounds(this.canvasSize.height)) {
      void this.logPowerUpEvent(
        this.activePowerUp.getType(),
        POWER_UP_ACTION_MISS,
      );
      this.activePowerUp = null;
    }
  }

  private activatePowerUp(powerUpType: PowerUpType) {
    this.audioSink.playAudio(GAME_AUDIO_IDS.POWERUP_COLLECT);
    this.logPowerUpEvent(powerUpType, POWER_UP_ACTION_ACTIVATE);
    const activationAudioId = getPowerUpActivationAudioId(powerUpType);

    if (powerUpType === "laser_fan") {
      this.activateLaserFanPowerUp(activationAudioId);
      return;
    }

    if (powerUpType === "multiball") {
      const baseBall = this.balls[0];
      if (baseBall) {
        const ballCount = calculateMultiballBallCount(this.level);
        const angleOffsets = buildMultiballAngleOffsets(ballCount - 1);
        const clones = angleOffsets.map((angleOffset) =>
          baseBall.createClone(angleOffset),
        );
        clones.forEach((clone) => {
          this.balls.push(clone);
          gameLogger
            .logBallAdded(
              this.getCurrentGameState(),
              this.getBallPositions(),
              this.paddle.position,
              clone.position,
            )
            .catch((error) =>
              ERROR("❌ Erro ao registrar bola adicionada:", error),
            );
        });
      }
      this.audioSink.playAudio(activationAudioId);
      return;
    }

    if (powerUpType === "wide_paddle") {
      this.paddle.setWidthScale(calculateWidePaddleScale(this.level));
      this.audioSink.playAudio(activationAudioId);
      this.schedulePowerUpExpiration(powerUpType, () => {
        this.paddle.setWidthScale(1);
      });
      return;
    }

    if (powerUpType === "slow_ball") {
      this.balls.forEach((ball) => ball.multiplyVelocity(SLOW_BALL_MULTIPLIER));
      this.audioSink.playAudio(activationAudioId);
      this.schedulePowerUpExpiration(powerUpType, () => {
        this.balls.forEach((ball) =>
          ball.multiplyVelocity(1 / SLOW_BALL_MULTIPLIER),
        );
      });
      return;
    }

    this.audioSink.playAudio(activationAudioId);
  }

  private activateLaserFanPowerUp(activationAudioId: AudioId) {
    this.audioSink.playAudio(activationAudioId);
    const selectedComponents = this.components.selectRandomActive(
      calculateLaserFanTargetCount(this.level),
    );
    this.showLaserFanEffect(selectedComponents);
    this.resolveLaserFanPowerUp(selectedComponents);
  }

  private resolveLaserFanPowerUp(targets: DestroyedComponentSnapshot[]) {
    if (targets.length === 0) return;

    const destroyedComponents = this.components.destroySelectedActive(targets);
    if (destroyedComponents.length === 0) return;

    const scoreDelta = POINTS_PER_COMPONENT * destroyedComponents.length;
    this.score += scoreDelta;
    this.successfulComponentHitsThisLevel += destroyedComponents.length;
    this.latestSpeedReduction = this.getLatestSpeedReductionFromBalls();
    this.onScoreUpdate(this.score);

    const gameState = this.getCurrentGameState();
    const ballPositions = this.getBallPositions();
    const paddlePosition = this.paddle.position;
    const primaryBall = this.balls[0];
    const ballVelocity = primaryBall?.getVelocity() ?? { dx: 0, dy: 0 };
    const ballPosition = primaryBall?.position ?? {
      x: this.canvasSize.width / CENTER_DIVISOR,
      y: this.canvasSize.height / CENTER_DIVISOR,
      radius: 0,
    };

    destroyedComponents.forEach((component) =>
      this.logLaserFanComponentDestroyed(
        component,
        gameState,
        ballPositions,
        paddlePosition,
        ballPosition,
        ballVelocity,
      ),
    );

    void gameLogger
      .logScoreUpdate(
        gameState,
        ballPositions,
        paddlePosition,
        scoreDelta,
        "laser_fan",
        this.latestSpeedReduction,
      )
      .catch((error) => ERROR("❌ Erro ao registrar pontuação:", error));

    if (this.components.isAllDestroyed() && !this.isLevelTransitioning) {
      this.startLevelTransition(gameState, ballPositions, paddlePosition);
    }
  }

  private logLaserFanComponentDestroyed(
    component: DestroyedComponentSnapshot,
    gameState: ReturnType<GameEngine["getCurrentGameState"]>,
    ballPositions: ReturnType<GameEngine["getBallPositions"]>,
    paddlePosition: { x: number; y: number; width: number; height: number },
    ballPosition: { x: number; y: number; radius: number },
    ballVelocity: { dx: number; dy: number },
  ) {
    void gameLogger
      .logComponentDestroyed(
        gameState,
        ballPositions,
        paddlePosition,
        {
          x: component.x,
          y: component.y,
          width: component.width,
          height: component.height,
        },
        { col: component.col, row: component.row },
        component.colorIndex,
        ballPosition,
        ballVelocity,
        ballVelocity,
        this.latestSpeedReduction,
      )
      .catch((error) =>
        ERROR("❌ Erro ao registrar destruição por laser:", error),
      );
  }

  private showLaserFanEffect(destroyedComponents: DestroyedComponentSnapshot[] = []) {
    const now = Date.now();
    this.laserFanEffectStartedAt = now;
    this.laserFanEffectUntil = now + LASER_FAN_EFFECT_VISIBLE_MS;
    this.laserFanEffectTargets =
      this.buildLaserFanEffectTargets(destroyedComponents);
    if (this.laserFanEffectTimer) clearTimeout(this.laserFanEffectTimer);
    this.laserFanEffectTimer = setTimeout(() => {
      this.resetLaserFanEffectState();
    }, LASER_FAN_EFFECT_VISIBLE_MS);
  }

  private clearLaserFanEffect() {
    if (this.laserFanEffectTimer) clearTimeout(this.laserFanEffectTimer);
    this.resetLaserFanEffectState();
  }

  private resetLaserFanEffectState() {
    this.laserFanEffectTimer = null;
    this.laserFanEffectStartedAt = 0;
    this.laserFanEffectUntil = 0;
    this.laserFanEffectTargets = [];
  }

  private drawLaserFanEffect() {
    const now = Date.now();
    if (now > this.laserFanEffectUntil || this.laserFanEffectStartedAt === 0)
      return;

    const elapsedMs = Math.max(0, now - this.laserFanEffectStartedAt);
    const progress = this.clampLaserFanProgress(
      elapsedMs / LASER_FAN_EFFECT_VISIBLE_MS,
    );
    if (this.laserFanEffectTargets.length === 0) return;

    this.ctx.save();
    this.ctx.lineCap = LASER_FAN_LINE_CAP;
    this.ctx.strokeStyle = LASER_FAN_CRACK_LINE_COLOR;
    this.ctx.fillStyle = LASER_FAN_GLOW_COLOR;

    for (const target of this.laserFanEffectTargets) {
      const stagger =
        (target.index * LASER_FAN_TARGET_STAGGER_PROGRESS) /
        Math.max(1, this.laserFanEffectTargets.length);
      const targetProgress = this.clampLaserFanProgress(
        (progress - stagger) / LASER_FAN_TARGET_PROGRESS_WINDOW,
      );

      this.drawLaserFanTargetEffect(target, targetProgress);
    }
    this.ctx.restore();
  }

  private buildLaserFanEffectTargets(
    destroyedComponents: DestroyedComponentSnapshot[],
  ): LaserFanEffectTarget[] {
    return destroyedComponents.map((component, index) => ({
      col: component.col,
      row: component.row,
      colorIndex: component.colorIndex,
      x: component.x + component.width / CENTER_DIVISOR,
      y: component.y + component.height / CENTER_DIVISOR,
      width: component.width,
      height: component.height,
      index,
      seed: this.buildLaserFanTargetSeed(component, index),
    }));
  }

  private buildLaserFanTargetSeed(
    component: DestroyedComponentSnapshot,
    index: number,
  ) {
    return Math.abs(
      component.col * LASER_FAN_SEED_COL_MULTIPLIER +
        component.row * LASER_FAN_SEED_ROW_MULTIPLIER +
        component.colorIndex * LASER_FAN_SEED_COLOR_MULTIPLIER +
        index * LASER_FAN_SEED_INDEX_MULTIPLIER,
    );
  }

  private drawLaserFanTargetEffect(
    target: LaserFanEffectTarget,
    targetProgress: number,
  ) {
    if (targetProgress < LASER_FAN_CRACK_START_PROGRESS) return;

    const crackProgress = this.clampLaserFanProgress(
      (targetProgress - LASER_FAN_CRACK_START_PROGRESS) /
        (LASER_FAN_MAX_PROGRESS - LASER_FAN_CRACK_START_PROGRESS),
    );
    this.drawLaserFanGlow(target, targetProgress);
    this.drawLaserFanCracks(target, crackProgress);
    this.drawLaserFanExplosion(target, targetProgress);
  }

  private drawLaserFanGlow(
    target: LaserFanEffectTarget,
    targetProgress: number,
  ) {
    if (targetProgress < LASER_FAN_GLOW_START_PROGRESS) return;

    const glowProgress = this.clampLaserFanProgress(
      (targetProgress - LASER_FAN_GLOW_START_PROGRESS) /
        (LASER_FAN_MAX_PROGRESS - LASER_FAN_GLOW_START_PROGRESS),
    );
    const glowRadius =
      Math.max(target.width, target.height) *
      LASER_FAN_GLOW_RADIUS_RATIO *
      glowProgress;

    this.ctx.globalAlpha = LASER_FAN_GLOW_MAX_ALPHA * glowProgress;
    this.ctx.fillStyle = LASER_FAN_GLOW_COLOR;
    this.ctx.beginPath();
    this.ctx.arc(
      target.x,
      target.y,
      glowRadius,
      LASER_FAN_MIN_PROGRESS,
      FULL_CIRCLE_RADIANS,
    );
    this.ctx.fill();
  }

  private drawLaserFanCracks(
    target: LaserFanEffectTarget,
    crackProgress: number,
  ) {
    const lineCount =
      LASER_FAN_CRACK_MIN_LINES + (target.seed % LASER_FAN_CRACK_LINE_VARIANTS);
    const edgePadding =
      Math.min(target.width, target.height) *
      LASER_FAN_CRACK_EDGE_PADDING_RATIO;
    const baseLineWidth =
      LASER_FAN_CRACK_LINE_WIDTH * Math.min(this.scaleX, this.scaleY);

    this.ctx.strokeStyle = LASER_FAN_CRACK_LINE_COLOR;
    this.ctx.shadowColor = LASER_FAN_CRACK_SHADOW_COLOR;
    this.ctx.globalAlpha = LASER_FAN_CRACK_LINE_ALPHA * crackProgress;

    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      const startRatio = this.laserFanUnitValue(target.seed, lineIndex);
      const endRatio = this.laserFanUnitValue(
        target.seed,
        lineIndex + lineCount,
      );
      const branchRatio = this.laserFanUnitValue(
        target.seed,
        lineIndex + lineCount * CENTER_DIVISOR,
      );
      const lineWidth =
        baseLineWidth *
        (LASER_FAN_MAX_PROGRESS +
          LASER_FAN_CRACK_LINE_WIDTH_PROGRESS_RATIO * crackProgress +
          LASER_FAN_CRACK_LINE_WIDTH_SEED_RATIO * branchRatio);
      const startX =
        target.x -
        target.width / CENTER_DIVISOR +
        edgePadding +
        (target.width - edgePadding * CENTER_DIVISOR) * startRatio;
      const startY =
        target.y -
        target.height / CENTER_DIVISOR +
        edgePadding +
        (target.height - edgePadding * CENTER_DIVISOR) * branchRatio;
      const endX =
        target.x -
        target.width / CENTER_DIVISOR +
        edgePadding +
        (target.width - edgePadding * CENTER_DIVISOR) * endRatio;
      const endY =
        target.y +
        target.height *
          LASER_FAN_CRACK_BRANCH_LENGTH_RATIO *
          (branchRatio - LASER_FAN_MAX_PROGRESS / CENTER_DIVISOR);

      this.ctx.lineWidth = lineWidth;
      this.ctx.shadowBlur = lineWidth * CENTER_DIVISOR;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(
        startX + (endX - startX) * crackProgress,
        startY + (endY - startY) * crackProgress,
      );
      this.ctx.stroke();
    }
  }

  private drawLaserFanExplosion(
    target: LaserFanEffectTarget,
    targetProgress: number,
  ) {
    if (targetProgress < LASER_FAN_EXPLOSION_START_PROGRESS) return;

    const explosionProgress = this.clampLaserFanProgress(
      (targetProgress - LASER_FAN_EXPLOSION_START_PROGRESS) /
        (LASER_FAN_MAX_PROGRESS - LASER_FAN_EXPLOSION_START_PROGRESS),
    );
    const explosionRadius =
      Math.max(target.width, target.height) *
      LASER_FAN_EXPLOSION_RADIUS_RATIO *
      explosionProgress;
    const particleRadius = Math.max(
      LASER_FAN_EXPLOSION_MIN_PARTICLE_RADIUS,
      Math.min(target.width, target.height) *
        LASER_FAN_EXPLOSION_PARTICLE_RADIUS_RATIO *
        (LASER_FAN_MAX_PROGRESS - explosionProgress),
    );

    this.ctx.globalAlpha =
      LASER_FAN_EXPLOSION_ALPHA * (LASER_FAN_MAX_PROGRESS - explosionProgress);
    this.ctx.fillStyle = LASER_FAN_CRACK_LINE_COLOR;

    for (
      let particleIndex = 0;
      particleIndex < LASER_FAN_EXPLOSION_PARTICLE_COUNT;
      particleIndex++
    ) {
      const angle =
        (FULL_CIRCLE_RADIANS / LASER_FAN_EXPLOSION_PARTICLE_COUNT) *
        particleIndex;

      this.ctx.beginPath();
      this.ctx.arc(
        target.x + Math.cos(angle) * explosionRadius,
        target.y + Math.sin(angle) * explosionRadius,
        particleRadius,
        LASER_FAN_MIN_PROGRESS,
        FULL_CIRCLE_RADIANS,
      );
      this.ctx.fill();
    }
  }

  private laserFanUnitValue(seed: number, salt: number) {
    return (
      ((seed + salt * LASER_FAN_SEED_INDEX_MULTIPLIER) %
        LASER_FAN_SEED_MODULO) /
      LASER_FAN_SEED_NORMALIZER
    );
  }

  private clampLaserFanProgress(value: number) {
    return Math.max(
      LASER_FAN_MIN_PROGRESS,
      Math.min(LASER_FAN_MAX_PROGRESS, value),
    );
  }

  private clearElectricImpactEffects() {
    this.electricImpactEffects = [];
  }

  private drawElectricImpactEffects() {
    if (this.electricImpactEffects.length === 0) return;

    const now = Date.now();
    const reducedEffects = this.usesReducedCanvasEffects();
    const scale = Math.max(0.7, Math.min(this.scaleX, this.scaleY));
    this.electricImpactEffects = drawElectricImpactEffects(
      this.ctx,
      this.electricImpactEffects,
      now,
      reducedEffects,
      scale,
    );
  }

  private logPowerUpEvent(
    powerUpType: PowerUpType,
    action: LoggedPowerUpAction,
  ) {
    void gameLogger
      .logPowerUp(
        this.getCurrentGameState(),
        this.getBallPositions(),
        this.paddle.position,
        powerUpType,
        action,
      )
      .catch((error) => ERROR("❌ Erro ao registrar power-up:", error));
  }

  private schedulePowerUpExpiration(
    powerUpType: PowerUpType,
    onExpire: () => void,
  ) {
    const timer = setTimeout(() => {
      onExpire();
      this.audioSink.playAudio(GAME_AUDIO_IDS.POWERUP_EXPIRE);
      void this.logPowerUpEvent(powerUpType, POWER_UP_ACTION_EXPIRE);
      this.powerUpEffectTimers = this.powerUpEffectTimers.filter(
        (activeTimer) => activeTimer !== timer,
      );
    }, POWER_UP_DURATION_MS);
    this.powerUpEffectTimers.push(timer);
  }

  private clearPowerUpEffects() {
    for (const timer of this.powerUpEffectTimers) {
      clearTimeout(timer);
    }
    this.powerUpEffectTimers = [];
    if (typeof this.paddle?.setWidthScale === "function") {
      this.paddle.setWidthScale(1);
    }
  }

  private getExpectedInitialComponentCountForLevel(level: number): number {
    if (
      this.isSingleComponentQaScenario() &&
      !this.qaScenarioConsumed &&
      level > this.level
    ) {
      const previewDimensions = calculateDynamicDimensions(
        this.canvasSize.width,
        this.canvasSize.height,
      );
      const previewMaxComponentRows = this.calculateMaxComponentRows(previewDimensions);
      const previewComponentRows = calculateLevelComponentRows(
        previewDimensions.componentRows,
        previewMaxComponentRows,
        level,
      );

      return previewDimensions.componentCols * previewComponentRows;
    }

    return (
      this.dimensions.componentCols *
      calculateLevelComponentRows(this.baseComponentRows, this.maxComponentRows, level)
    );
  }

  private setupListeners() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  private removeListeners() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }

  public startPaddleDrag(clientX: number, clientY?: number) {
    this.isTouching = true;
    this.releaseServeLock();
    this.movePaddleFromClientPoint(clientX, clientY);
  }

  public movePaddleDrag(clientX: number, clientY?: number) {
    if (!this.isTouching) return;

    this.movePaddleFromClientPoint(clientX, clientY);
  }

  public endPaddleDrag() {
    this.isTouching = false;
  }

  public getPaddleDiagnosticSnapshot() {
    const paddlePosition = this.paddle.position;

    return {
      x: paddlePosition.x,
      y: paddlePosition.y,
      width: paddlePosition.width,
      height: paddlePosition.height,
      radial: paddlePosition.radial
        ? {
            centerX: paddlePosition.radial.centerX,
            centerY: paddlePosition.radial.centerY,
            radius: paddlePosition.radial.radius,
            thickness: paddlePosition.radial.thickness,
            startAngle: paddlePosition.radial.startAngle,
            centerAngle: paddlePosition.radial.centerAngle,
            endAngle: paddlePosition.radial.endAngle,
          }
        : undefined,
    };
  }

  private movePaddleFromClientPoint(clientX: number, clientY?: number) {
    const rect = this.canvas.getBoundingClientRect();
    const touchX = clientX - rect.left;
    const canvasX = (touchX / rect.width) * this.canvasSize.width;
    if (this.isBallTurretMode() && typeof clientY === "number") {
      const rectHeight = rect.height || this.canvasSize.height;
      const touchY = clientY - rect.top;
      const canvasY = (touchY / rectHeight) * this.canvasSize.height;
      this.paddle.setPositionFromPoint(canvasX, canvasY);
      return;
    }

    this.paddle.setPosition(canvasX);
  }

  public async start() {
    this.isStopped = false;
    this.onLevelChange?.(this.level);
    LOG("🎮 GameEngine.start() chamado - INÍCIO");
    LOG("🎮 this:", this);
    LOG("🎮 gameLogger:", gameLogger);

    await this.preloadAssets();
    if (this.isStopped) return;

    // Log do início do jogo
    const gameState = this.getCurrentGameState();
    const ballPositions = this.getBallPositions();
    const paddlePosition = this.paddle.position;

    LOG("📊 Preparando para registrar início do jogo...");
    LOG("📊 GameState:", gameState);
    LOG("📊 BallPositions:", ballPositions);
    LOG("📊 PaddlePosition:", paddlePosition);

    // Se já existe um gameId, é um restart
    if (gameLogger.getCurrentGameId()) {
      LOG("🔄 Detectado restart do jogo");
      void gameLogger
        .logRestartGame(gameState, ballPositions, paddlePosition)
        .catch((error) =>
          ERROR("❌ Erro ao registrar restart do jogo:", error),
        );
    }

    LOG("🎮 Registrando início do jogo...");

    void gameLogger
      .logGameStart(gameState, ballPositions, paddlePosition)
      .then(() => {
        LOG("✅ Início do jogo registrado com sucesso!");
      })
      .catch((error) => {
        ERROR("❌ Erro ao registrar início do jogo:", error);
      });

    this.audioSink.playAudio(GAME_AUDIO_IDS.GAME_START);
    this.audioSink.startGameplayMusic();
    this.audioSink.setHighIntensity(
      calculateLevelSpeedMultiplier(this.level) >=
        HIGH_INTENSITY_SPEED_MULTIPLIER,
    );

    if (!this.isStopped) {
      this.lastFrameTimestamp = readFrameTimestamp();
      this.loop(this.lastFrameTimestamp);
    }
  }

  public stop() {
    this.isStopped = true;
    this.isPaused = false;
    this.isTouching = false;
    this.releaseServeLock();
    this.lastFrameTimestamp = 0;
    this.clearPowerUpEffects();
    this.clearLaserFanEffect();
    this.clearElectricImpactEffects();
    if (this.levelTransitionTimer) {
      clearTimeout(this.levelTransitionTimer);
      this.levelTransitionTimer = null;
    }
    cancelAnimationFrame(this.animationFrame);
    this.removeListeners();
  }

  public setPaused(paused: boolean) {
    const wasPaused = this.isPaused;
    this.isPaused = paused;

    if (paused) {
      this.isTouching = false;
      cancelAnimationFrame(this.animationFrame);
      return;
    }

    if (wasPaused && !this.isStopped) {
      this.lastFrameTimestamp = readFrameTimestamp();
      this.animationFrame = requestAnimationFrame(this.loop);
    }
  }

  public setTurretControlMode(mode: TurretControlMode) {
    this.turretControlMode = mode;
    this.isTouching = false;
    this.dualSwitchDirections.left = 0;
    this.dualSwitchDirections.right = 0;
  }

  public setDualSwitchDirection(
    side: TurretSwitchSide,
    direction: TurretSwitchDirection,
  ) {
    const normalizedDirection = this.normalizeDualSwitchDirectionInput(direction);
    this.dualSwitchDirections[side] = normalizedDirection;
    if (normalizedDirection !== 0) {
      this.releaseServeLock();
    }
  }

  private isDualSwitchControlMode(): boolean {
    return (
      this.isBallTurretMode() &&
      this.turretControlMode === TURRET_CONTROL_MODE_DUAL_SWITCH
    );
  }

  private normalizeDualTrampolineAngle(angle: number): number {
    return ((angle % FULL_CIRCLE_RADIANS) + FULL_CIRCLE_RADIANS) %
      FULL_CIRCLE_RADIANS;
  }

  private normalizeDualSwitchDirectionInput(
    direction: TurretSwitchDirection,
  ): TurretSwitchDirection {
    if (!Number.isFinite(direction)) return 0;

    const clampedDirection = Math.max(-1, Math.min(1, direction));
    return Math.abs(clampedDirection) < TURRET_SWITCH_DEAD_ZONE
      ? 0
      : clampedDirection;
  }

  private readDualTrampolineAngularDirection(
    side: TurretSwitchSide,
    direction: TurretSwitchDirection,
  ): number {
    const signedDirection = Math.sign(direction);
    return side === "left" ? -signedDirection : signedDirection;
  }

  private calculateDualTrampolineSpeedScale(
    direction: TurretSwitchDirection,
  ): number {
    const intensity = Math.abs(direction);
    if (intensity === 0) return 0;

    return DUAL_TRAMPOLINE_MIN_SPEED_SCALE +
      (DUAL_TRAMPOLINE_MAX_SPEED_SCALE - DUAL_TRAMPOLINE_MIN_SPEED_SCALE) *
        intensity;
  }

  private updateDualSwitchTrampolines(frameScale = 1) {
    if (!this.isDualSwitchControlMode()) return;

    const safeFrameScale = Math.max(0, Number.isFinite(frameScale) ? frameScale : 1);
    (["left", "right"] as const).forEach((side) => {
      const direction = this.dualSwitchDirections[side];
      if (direction === 0) return;

      this.dualTrampolineAngles[side] = this.normalizeDualTrampolineAngle(
        this.dualTrampolineAngles[side] +
          this.readDualTrampolineAngularDirection(side, direction) *
            DUAL_TRAMPOLINE_SPEED_PER_FRAME *
            this.calculateDualTrampolineSpeedScale(direction) *
            safeFrameScale,
      );
    });
  }

  private getDualTrampolineAngle(side: TurretSwitchSide): number {
    return this.dualTrampolineAngles[side];
  }

  private getDualTrampolineAccentColor(side: TurretSwitchSide): string {
    return side === "left"
      ? BALL_TURRET_LEFT_TRAMPOLINE_ACCENT
      : BALL_TURRET_RIGHT_TRAMPOLINE_ACCENT;
  }

  private getDualTrampolinePaddles(): RadialPaddleBounds[] {
    return (["left", "right"] as const).map((side) =>
      calculateRadialPaddleBounds(
        this.radialGeometry,
        this.dimensions,
        this.getDualTrampolineAngle(side),
        DUAL_TRAMPOLINE_WIDTH_SCALE,
      ),
    );
  }

  private getDualTrampolineRenderItems(): BallTurretTrampolineRenderItem[] {
    return (["left", "right"] as const).map((side) => ({
      paddlePosition: calculateRadialPaddleBounds(
        this.radialGeometry,
        this.dimensions,
        this.getDualTrampolineAngle(side),
        DUAL_TRAMPOLINE_WIDTH_SCALE,
      ),
      accentColor: this.getDualTrampolineAccentColor(side),
    }));
  }

  private getActivePaddlePositions(): RadialPaddleBounds[] | undefined {
    if (!this.isDualSwitchControlMode()) return undefined;

    return this.getDualTrampolinePaddles();
  }

  private calculateFrameDeltaMs(timestamp: number) {
    const safeTimestamp = Number.isFinite(timestamp)
      ? timestamp
      : readFrameTimestamp();
    if (this.lastFrameTimestamp <= 0) {
      this.lastFrameTimestamp = safeTimestamp;
      return 0;
    }

    const deltaMs = Math.max(0, safeTimestamp - this.lastFrameTimestamp);
    this.lastFrameTimestamp = safeTimestamp;
    return Math.min(deltaMs, MAX_FRAME_DELTA_MS);
  }

  private loop = (timestamp = readFrameTimestamp()) => {
    if (this.isStopped || this.isPaused) return;
    const deltaMs = this.calculateFrameDeltaMs(timestamp);
    const frameScale = deltaMs / FRAME_BASELINE_MS;
    this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    if (!this.assetsLoaded) {
      // Show loading indicator
      this.ctx.fillStyle = GAME_COLOR;
      this.ctx.font = `${16 * Math.min(this.scaleX, this.scaleY)}px ${CANVAS_FONT_FAMILY}`;
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        LOADING_TEXT,
        this.canvasSize.width / 2,
        this.canvasSize.height / 2,
      );
    } else if (this.gameOver) {
      // Mostrar tela de fim de jogo
      this.ctx.fillStyle = "#ff4444";
      this.ctx.font = `${24 * Math.min(this.scaleX, this.scaleY)}px ${CANVAS_FONT_FAMILY}`;
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        GAME_OVER_TEXT,
        this.canvasSize.width / 2,
        this.canvasSize.height / 2 - 20,
      );
      this.ctx.font = `${16 * Math.min(this.scaleX, this.scaleY)}px ${CANVAS_FONT_FAMILY}`;
      this.ctx.fillText(
        `${SCORE_TEXT_PREFIX}: ${this.score}`,
        this.canvasSize.width / 2,
        this.canvasSize.height / 2 + 10,
      );
      this.ctx.fillText(
        RESTART_HINT_TEXT,
        this.canvasSize.width / 2,
        this.canvasSize.height / 2 + 40,
      );
    } else {
      // Normal game rendering
      try {
        this.tickAmbientElectricBackground();
        this.drawGameBackdrop();
        this.components.draw(this.ctx);
        this.paddle.update(frameScale);
        this.updateDualSwitchTrampolines(frameScale);
        this.updatePowerUp(frameScale);
        this.drawPlayerControl();
        this.activePowerUp?.draw(this.ctx);
        this.drawLaserFanEffect();
        if (this.isLevelTransitioning || this.isServeLocked) {
          this.balls.forEach((ball) => ball.draw(this.ctx));
        } else {
          for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];

            const inPlay = ball.update(
              this.paddle,
              this.components,
              this.canvasSize.height,
              this.getCurrentGameState(),
              this.audioSink,
              frameScale,
              this.getActivePaddlePositions(),
            );
            if (!inPlay) {
              if (this.qaScenario === BALL_TURRET_QA_SCENARIO) {
                this.positionBallForCurrentMode(ball);
                ball.draw(this.ctx);
                continue;
              }

              this.balls.splice(i, 1);
              if (this.balls.length > 0) {
                void gameLogger
                  .logGameStateChange(
                    this.getCurrentGameState(),
                    this.getBallPositions(),
                    this.paddle.position,
                    "ball_count_change",
                  )
                  .catch((error) =>
                    ERROR(
                      "❌ Erro ao registrar mudança de quantidade de bolas:",
                      error,
                    ),
                  );
              }
              continue;
            }
            if (ball.consumePaddleCollision()) {
              // Colisão com raquete já foi consumida; não resetar hits da fase
              // porque a velocidade agora depende do total de blocos acertados.
            }
            ball.draw(this.ctx);
          }
        }
        this.drawElectricImpactEffects();
        this.drawGameForeground();
        if (this.balls.length === 0) {
          // Game over - no balls left
          this.gameOver = true;
          this.clearLaserFanEffect();
          this.clearElectricImpactEffects();
          this.audioSink.playAudio(GAME_AUDIO_IDS.GAME_OVER);
          this.audioSink.startMenuMusic();

          // Log da mudança de estado do jogo
          const gameState = this.getCurrentGameState();
          const ballPositions = this.getBallPositions();
          const paddlePosition = this.paddle.position;

          void gameLogger
            .logGameStateChange(
              gameState,
              ballPositions,
              paddlePosition,
              "game_over",
            )
            .catch((error) =>
              ERROR("❌ Erro ao registrar mudança de estado:", error),
            );

          // Log do fim do jogo (derrota)
          void gameLogger
            .logGameEnd(gameState, ballPositions, paddlePosition, "lose")
            .catch((error) => ERROR("❌ Erro ao registrar derrota:", error));

          if (this.onGameOver) {
            this.onGameOver();
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message === "GAME_OVER") {
          this.gameOver = true;
          this.clearLaserFanEffect();
          this.clearElectricImpactEffects();
          if (this.onGameOver) {
            this.onGameOver();
          }
        } else {
          ERROR("Erro durante o rendering:", error);
          throw error;
        }
      }
    }

    if (!this.isStopped && !this.isPaused) {
      this.animationFrame = requestAnimationFrame(this.loop);
    }
  };

  private isBallTurretMode(): boolean {
    return (
      this.gameMode === GAME_MODE_BALL_TURRET ||
      this.qaScenario === BALL_TURRET_QA_SCENARIO
    );
  }

  private drawGameBackdrop() {
    drawFullScreenElectricBackdrop(this.ctx, this.canvasSize);
    this.drawAmbientElectricBackground();

    if (this.isBallTurretMode()) {
      drawBallTurretBackdrop(this.ctx, {
        canvasSize: this.canvasSize,
        geometry: this.radialGeometry,
        level: this.level,
        reducedEffects: this.usesReducedCanvasEffects(),
        paddlePosition: this.paddle.position,
      });
      return;
    }

    this.drawRadialPlayfield();
  }

  private tickAmbientElectricBackground(): void {
    this.ambientElectricBackground.tick(
      this.canvasSize,
      Date.now(),
      this.usesReducedCanvasEffects(),
    );
  }

  private drawAmbientElectricBackground(): void {
    this.ambientElectricBackground.draw(
      this.ctx,
      this.canvasSize,
      Date.now(),
    );
  }

  private drawPlayerControl() {
    if (this.isBallTurretMode()) {
      const renderState = {
        canvasSize: this.canvasSize,
        geometry: this.radialGeometry,
        level: this.level,
        reducedEffects: this.usesReducedCanvasEffects(),
        paddlePosition: this.paddle.position,
      };

      if (this.isDualSwitchControlMode()) {
        drawBallTurretTrampolines(
          this.ctx,
          renderState,
          this.getDualTrampolineRenderItems(),
        );
        return;
      }

      drawBallTurretTrampoline(this.ctx, renderState);
      return;
    }

    this.paddle.draw(this.ctx);
  }

  private drawGameForeground() {
    if (!this.isBallTurretMode()) return;

    drawBallTurretGlassOverlay(this.ctx, {
      canvasSize: this.canvasSize,
      geometry: this.radialGeometry,
      level: this.level,
      reducedEffects: this.usesReducedCanvasEffects(),
      paddlePosition: this.paddle.position,
    });
  }

  private usesReducedCanvasEffects(): boolean {
    return shouldUseReducedCanvasEffects(this.canvasSize.width);
  }

  private drawRadialPlayfield() {
    this.ctx.save();
    this.ctx.fillStyle = RADIAL_PLAYFIELD_FILL;
    this.ctx.strokeStyle = RADIAL_PLAYFIELD_STROKE;
    this.ctx.lineWidth = RADIAL_PLAYFIELD_STROKE_WIDTH;
    this.ctx.beginPath();
    this.ctx.arc(
      this.radialGeometry.centerX,
      this.radialGeometry.centerY,
      this.radialGeometry.radius,
      0,
      FULL_CIRCLE_RADIANS,
    );
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.strokeStyle = RADIAL_PLAYFIELD_INNER_STROKE;
    this.ctx.beginPath();
    this.ctx.arc(
      this.radialGeometry.centerX,
      this.radialGeometry.centerY,
      this.radialGeometry.radius * RADIAL_PLAYFIELD_INNER_RADIUS_RATIO,
      0,
      FULL_CIRCLE_RADIANS,
    );
    this.ctx.stroke();
    this.ctx.restore();
  }
}
