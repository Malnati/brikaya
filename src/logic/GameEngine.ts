// src/logic/GameEngine.ts
import { Paddle } from "../objects/Paddle";
import { Ball } from "../objects/Ball";
import { Bricks, type DestroyedBrickSnapshot } from "../objects/Bricks";
import { PowerUp } from "../objects/PowerUp";
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
  calculateLevelBrickRows,
  calculateLevelInitialSpawnSpeed,
  calculateLevelMaxSpeed,
  calculateLevelMinSpeed,
  calculateLevelPreviousMaxSpeed,
  calculateLevelSpeedMultiplier,
  calculateSpeedReductionPerBrick,
  DynamicGameDimensions,
} from "../constants/game";
import { POINTS_PER_BRICK } from "../constants/gameState";
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
  calculateRadialPlayfieldGeometry,
  type RadialPlayfieldGeometry,
} from "../utils/radialGeometry";
import { LOG, ERROR, WARN } from "../utils/logger";

LOG("📦 GameEngine.ts carregado, gameLogger:", gameLogger);

const ERROR_NO_2D_CONTEXT = "No 2D context";
const SINGLE_BRICK_QA_SCENARIO = "single-brick-phase-clear";
const LATE_PHASE_STABILITY_QA_SCENARIO = "late-phase-stability";
const CINEMATIC_RIP_QA_SCENARIO = "cinematic-rip";
const PADDLE_COLLISION_QA_SCENARIO = "paddle-collision";
const LASER_FAN_QA_SCENARIO = "laser-fan";
const METAL_BLOCK_QA_SCENARIO = "metal-block";
const EVASIVE_BLOCKS_QA_SCENARIO = "evasive-blocks";
const LATE_PHASE_STABILITY_LEVEL = 11;
const LATE_PHASE_STABILITY_Y_RATIO = 0.35;
const CINEMATIC_RIP_X_RATIO = 0.12;
const CINEMATIC_RIP_Y_OFFSET = 2;
const PADDLE_COLLISION_QA_BALL_INSET = 1;
const LASER_FAN_QA_POWER_UP_Y_OFFSET = 64;
const METAL_BLOCK_QA_RANDOM_VALUES = [0, 0.99] as const;
const METAL_BLOCK_QA_RANDOM_FALLBACK = 0.99;
const EVASIVE_BLOCKS_QA_RANDOM_VALUES = [
  0, 0, 0, 0, 0.99, 0.99, 0.99, 0.99,
] as const;
const EVASIVE_BLOCKS_QA_RANDOM_FALLBACK = 0.99;
const EVASIVE_BLOCKS_QA_BRICK_COLS = 1;
const EVASIVE_BLOCKS_QA_BRICK_ROWS = 3;
const EVASIVE_BLOCKS_QA_BRICK_WIDTH_RATIO = 0.18;
const EVASIVE_BLOCKS_QA_BRICK_WIDTH_MIN = 48;
const EVASIVE_BLOCKS_QA_BRICK_WIDTH_MAX = 88;
const EVASIVE_BLOCKS_QA_BRICK_HEIGHT_RATIO = 0.05;
const EVASIVE_BLOCKS_QA_BRICK_HEIGHT_MIN = 18;
const EVASIVE_BLOCKS_QA_BRICK_HEIGHT_MAX = 28;
const EVASIVE_BLOCKS_QA_BRICK_PADDING = 8;
const EVASIVE_BLOCKS_QA_TARGET_ROW =
  EVASIVE_BLOCKS_QA_BRICK_ROWS - 1;
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
const WIDE_PADDLE_SCALE = 1.45;
const SLOW_BALL_MULTIPLIER = 0.75;
const MULTIBALL_ANGLE_OFFSET = 0.42;
const HIGH_INTENSITY_SPEED_MULTIPLIER = 1.6;
const LASER_FAN_MIN_PROGRESS = 0;
const LASER_FAN_MAX_PROGRESS = 1;
const LASER_FAN_TARGET_COUNT = 5;
const LASER_FAN_TARGET_STAGGER_PROGRESS = 0.12;
const LASER_FAN_TARGET_PROGRESS_WINDOW = 0.72;
const LASER_FAN_CRACK_START_PROGRESS = 0.12;
const LASER_FAN_GLOW_START_PROGRESS = 0.24;
const LASER_FAN_EXPLOSION_START_PROGRESS = 0.72;
const LASER_FAN_CRACK_MIN_LINES = 2;
const LASER_FAN_CRACK_LINE_VARIANTS = 3;
const LASER_FAN_CRACK_LINE_WIDTH = 2.1;
const LASER_FAN_CRACK_LINE_WIDTH_PROGRESS_RATIO = 0.6;
const LASER_FAN_CRACK_LINE_WIDTH_SEED_RATIO = 0.35;
const LASER_FAN_CRACK_LINE_ALPHA = 0.92;
const LASER_FAN_CRACK_LINE_COLOR = "rgba(255, 248, 199, 0.92)";
const LASER_FAN_CRACK_SHADOW_COLOR = "rgba(97, 232, 255, 0.78)";
const LASER_FAN_GLOW_COLOR = "rgba(245, 247, 255, 0.34)";
const LASER_FAN_GLOW_MAX_ALPHA = 0.76;
const LASER_FAN_GLOW_RADIUS_RATIO = 0.72;
const LASER_FAN_EXPLOSION_PARTICLE_COUNT = 6;
const LASER_FAN_EXPLOSION_RADIUS_RATIO = 0.82;
const LASER_FAN_EXPLOSION_PARTICLE_RADIUS_RATIO = 0.08;
const LASER_FAN_EXPLOSION_MIN_PARTICLE_RADIUS = 1.5;
const LASER_FAN_EXPLOSION_ALPHA = 0.88;
const LASER_FAN_SEED_COL_MULTIPLIER = 73_856_093;
const LASER_FAN_SEED_ROW_MULTIPLIER = 19_349_663;
const LASER_FAN_SEED_COLOR_MULTIPLIER = 83_492_791;
const LASER_FAN_SEED_INDEX_MULTIPLIER = 2_654_435_761;
const LASER_FAN_SEED_MODULO = 997;
const LASER_FAN_SEED_NORMALIZER = 997;
const LASER_FAN_CRACK_EDGE_PADDING_RATIO = 0.16;
const LASER_FAN_CRACK_BRANCH_LENGTH_RATIO = 0.36;
const LASER_FAN_LINE_CAP: CanvasLineCap = "round";
const FULL_CIRCLE_RADIANS = Math.PI * 2;
const BRICK_COLOR_AUDIO_IDS: AudioId[] = [
  GAME_AUDIO_IDS.BRICK_BREAK_RED,
  GAME_AUDIO_IDS.BRICK_BREAK_BLUE,
  GAME_AUDIO_IDS.BRICK_BREAK_GREEN,
  GAME_AUDIO_IDS.BRICK_BREAK_YELLOW,
  GAME_AUDIO_IDS.BRICK_BREAK_PURPLE,
];
const CANVAS_FONT_FAMILY = "Arial";
const LOADING_TEXT = "Carregando";
const GAME_OVER_TEXT = "FIM DE JOGO!";
const SCORE_TEXT_PREFIX = "Pontuação";
const RESTART_HINT_TEXT = "Use ↻ para jogar novamente";
const CENTER_DIVISOR = 2;
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

interface LaserFanResolution {
  targets: DestroyedBrickSnapshot[];
}

export type GameQaScenario =
  | typeof SINGLE_BRICK_QA_SCENARIO
  | typeof LATE_PHASE_STABILITY_QA_SCENARIO
  | typeof CINEMATIC_RIP_QA_SCENARIO
  | typeof PADDLE_COLLISION_QA_SCENARIO
  | typeof LASER_FAN_QA_SCENARIO
  | typeof METAL_BLOCK_QA_SCENARIO
  | typeof EVASIVE_BLOCKS_QA_SCENARIO
  | typeof AUDIO_QA_SCENARIO;

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private animationFrame = 0;
  private paddle: Paddle;
  private balls: Ball[] = [];
  private bricks: Bricks;
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
  private isLevelTransitioning = false;
  private levelTransitionTimer: ReturnType<typeof setTimeout> | null = null;
  private level = 1;
  private levelStartedAt = Date.now();
  private initialBrickCount = 0;
  private successfulBrickHitsThisLevel = 0;
  private latestSpeedReduction: SpeedReductionSnapshot | null = null;
  private phaseSpeedConfig: PhaseSpeedConfig | null = null;
  private qaScenarioConsumed = false;
  private comboCount = 0;
  private lastBrickDestroyedAt = 0;
  private lastComboAudioAt = 0;
  private destroyedBricksSincePowerUp = 0;
  private activePowerUp: PowerUp | null = null;
  private nextPowerUpIndex = 0;
  private powerUpEffectTimers: ReturnType<typeof setTimeout>[] = [];
  private laserFanSpawnsThisLevel = 0;
  private laserFanEffectStartedAt = 0;
  private laserFanEffectUntil = 0;
  private laserFanEffectTargets: LaserFanEffectTarget[] = [];
  private laserFanEffectTimer: ReturnType<typeof setTimeout> | null = null;
  private laserFanResolution: LaserFanResolution | null = null;
  private readonly handleKeyDown = (event: KeyboardEvent) =>
    this.paddle.onKeyDown(event);
  private readonly handleKeyUp = (event: KeyboardEvent) =>
    this.paddle.onKeyUp(event);
  private readonly resolveAssetPath = (role: GameVisualAssetRole) =>
    resolveGameVisualAssetPath(this.imageSetId, role);

  private maxBrickRows = 0;
  private baseBrickRows = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private onScoreUpdate: (score: number) => void,
    _onGameWon?: () => void,
    private onGameOver?: () => void,
    canvasSize?: CanvasSize,
    private onLevelTransition?: (payload: LevelTransitionPayload) => void,
    private qaScenario?: GameQaScenario | null,
    private audioSink: GameAudioSink = NOOP_AUDIO_SINK,
    private onLevelChange?: (level: number) => void,
    private imageSetId: ImageSetId = IMAGE_SET_RETRO_DEFAULT,
  ) {
    LOG(`🚀 GameEngine constructor iniciado`);

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
    this.radialGeometry = calculateRadialPlayfieldGeometry(
      this.canvasSize.width,
      this.canvasSize.height,
      this.dimensions,
    );
    this.baseBrickRows = this.dimensions.brickRows;

    LOG(
      `📐 Dimensões calculadas: ${this.dimensions.brickCols} colunas x ${this.dimensions.brickRows} linhas`,
    );
    LOG(
      `📐 Tamanho dos blocos: ${this.dimensions.brickWidth}x${this.dimensions.brickHeight}`,
    );

    // Calcular escala para manter proporções
    this.scaleX = this.canvasSize.width / CANVAS_WIDTH;
    this.scaleY = this.canvasSize.height / CANVAS_HEIGHT;

    if (this.qaScenario === LATE_PHASE_STABILITY_QA_SCENARIO) {
      this.level = LATE_PHASE_STABILITY_LEVEL;
    }

    LOG(`⚽ Criando Ball...`);
    this.paddle = new Paddle(
      this.canvasSize.width,
      this.canvasSize.height,
      this.dimensions,
      this.resolveAssetPath,
      this.radialGeometry,
    );
    this.balls.push(
      new Ball(
        this.canvasSize.width,
        this.canvasSize.height,
        this.dimensions,
        calculateLevelSpeedMultiplier(this.level),
        this.resolveAssetPath,
        this.radialGeometry,
      ),
    );
    this.prepareQaBall();
    this.prepareEvasiveBlocksQaBall();
    this.prepareCinematicRipBall();
    this.preparePaddleCollisionQaBall();
    this.prepareLatePhaseStabilityBall();

    LOG(`🏗️  Criando Bricks...`);
    this.configureBrickRows();
    this.applyLevelBrickRows(this.level);
    this.bricks = this.createBricks();
    this.prepareLaserFanQaPowerUp();
    this.startLevelSpeedTracking(this.level);

    LOG(`🎮 GameEngine constructor finalizado`);
    this.setupListeners();
  }

  private createDimensions(
    canvasWidth: number,
    canvasHeight: number,
  ): DynamicGameDimensions {
    const dimensions = calculateDynamicDimensions(canvasWidth, canvasHeight);
    if (this.isSingleBrickQaScenario() && !this.qaScenarioConsumed) {
      return {
        ...dimensions,
        brickCols: 1,
        brickRows: 1,
        brickWidth: Math.min(96, Math.max(56, canvasWidth * 0.24)),
        brickHeight: Math.min(28, Math.max(18, canvasHeight * 0.05)),
        brickPadding: 8,
        brickOffsetTop: Math.max(24, canvasHeight * 0.12),
        brickOffsetLeft:
          (canvasWidth - Math.min(96, Math.max(56, canvasWidth * 0.24))) / 2,
      };
    }

    if (this.isEvasiveBlocksQaScenario() && !this.qaScenarioConsumed) {
      const brickWidth = Math.min(
        EVASIVE_BLOCKS_QA_BRICK_WIDTH_MAX,
        Math.max(
          EVASIVE_BLOCKS_QA_BRICK_WIDTH_MIN,
          canvasWidth * EVASIVE_BLOCKS_QA_BRICK_WIDTH_RATIO,
        ),
      );
      const brickHeight = Math.min(
        EVASIVE_BLOCKS_QA_BRICK_HEIGHT_MAX,
        Math.max(
          EVASIVE_BLOCKS_QA_BRICK_HEIGHT_MIN,
          canvasHeight * EVASIVE_BLOCKS_QA_BRICK_HEIGHT_RATIO,
        ),
      );
      const totalBricksWidth =
        EVASIVE_BLOCKS_QA_BRICK_COLS * brickWidth +
        (EVASIVE_BLOCKS_QA_BRICK_COLS - 1) *
          EVASIVE_BLOCKS_QA_BRICK_PADDING;

      return {
        ...dimensions,
        brickCols: EVASIVE_BLOCKS_QA_BRICK_COLS,
        brickRows: EVASIVE_BLOCKS_QA_BRICK_ROWS,
        brickWidth,
        brickHeight,
        brickPadding: EVASIVE_BLOCKS_QA_BRICK_PADDING,
        brickOffsetTop: Math.max(24, canvasHeight * 0.12),
        brickOffsetLeft:
          (canvasWidth - totalBricksWidth) / CENTER_DIVISOR,
      };
    }

    return dimensions;
  }

  private createResizedDimensions(
    canvasWidth: number,
    canvasHeight: number,
  ): DynamicGameDimensions {
    const dimensions = this.createDimensions(canvasWidth, canvasHeight);
    this.baseBrickRows = dimensions.brickRows;
    const brickCols = this.dimensions.brickCols;
    const brickRows = this.dimensions.brickRows;
    const totalBricksWidth =
      brickCols * dimensions.brickWidth +
      (brickCols - 1) * dimensions.brickPadding;

    return {
      ...dimensions,
      brickCols,
      brickRows,
      brickOffsetLeft: (canvasWidth - totalBricksWidth) / CENTER_DIVISOR,
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
    this.radialGeometry = calculateRadialPlayfieldGeometry(
      this.canvasSize.width,
      this.canvasSize.height,
      this.dimensions,
    );
    this.configureBrickRows();
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
      ),
    );
    this.bricks.resize(this.dimensions, this.maxBrickRows, this.radialGeometry);
    this.activePowerUp?.setSize(this.getPowerUpSize());
  }

  public setImageSet(imageSetId: ImageSetId) {
    if (this.imageSetId === imageSetId) return;

    this.imageSetId = imageSetId;
  }

  private configureBrickRows() {
    this.maxBrickRows = this.calculateMaxBrickRows(this.dimensions);
  }

  private calculateMaxBrickRows(dimensions: DynamicGameDimensions): number {
    const availableHeight =
      this.canvasSize.height -
      dimensions.paddleHeight -
      dimensions.brickOffsetTop;
    const computedRows = Math.floor(
      availableHeight / (dimensions.brickHeight + dimensions.brickPadding),
    );

    return Math.max(dimensions.brickRows, computedRows);
  }

  private applyLevelBrickRows(level: number) {
    this.dimensions = {
      ...this.dimensions,
      brickRows: calculateLevelBrickRows(
        this.baseBrickRows,
        this.maxBrickRows,
        level,
      ),
    };
  }

  private createBricks(): Bricks {
    const brickQaRandom = this.createBrickQaRandom();
    if (brickQaRandom) {
      return new Bricks(
        this.dimensions,
        this.onBrickDestroyed.bind(this),
        this.maxBrickRows,
        undefined,
        this.resolveAssetPath,
        brickQaRandom,
        this.radialGeometry,
      );
    }

    return new Bricks(
      this.dimensions,
      this.onBrickDestroyed.bind(this),
      this.maxBrickRows,
      undefined,
      this.resolveAssetPath,
      undefined,
      this.radialGeometry,
    );
  }

  private isSingleBrickQaScenario(): boolean {
    return (
      this.qaScenario === SINGLE_BRICK_QA_SCENARIO ||
      this.qaScenario === METAL_BLOCK_QA_SCENARIO
    );
  }

  private isEvasiveBlocksQaScenario(): boolean {
    return this.qaScenario === EVASIVE_BLOCKS_QA_SCENARIO;
  }

  private createBrickQaRandom(): (() => number) | null {
    return this.createMetalBlockQaRandom() ?? this.createEvasiveBlocksQaRandom();
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
      !this.isSingleBrickQaScenario() ||
      this.qaScenarioConsumed ||
      this.balls.length === 0
    )
      return;

    const ball = this.balls[0];
    const targetX =
      this.dimensions.brickOffsetLeft + this.dimensions.brickWidth / 2;
    const targetY =
      this.dimensions.brickOffsetTop +
      this.dimensions.brickHeight +
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
      this.dimensions.brickOffsetLeft + this.dimensions.brickWidth / 2;
    const targetY =
      this.dimensions.brickOffsetTop +
      EVASIVE_BLOCKS_QA_TARGET_ROW *
        (this.dimensions.brickHeight + this.dimensions.brickPadding) +
      this.dimensions.brickHeight +
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
    ball.setDirection(Math.PI);
  }

  private preparePaddleCollisionQaBall() {
    if (
      this.qaScenario !== PADDLE_COLLISION_QA_SCENARIO ||
      this.balls.length === 0
    )
      return;

    const ball = this.balls[0];
    const paddlePosition = this.paddle.position;
    const radialPaddle = paddlePosition.radial;
    const targetRadius =
      radialPaddle.radius -
      radialPaddle.thickness / CENTER_DIVISOR -
      ball.position.radius -
      PADDLE_COLLISION_QA_BALL_INSET;
    const targetAngle = radialPaddle.centerAngle;

    ball.setPosition(
      radialPaddle.centerX + Math.cos(targetAngle) * targetRadius,
      radialPaddle.centerY + Math.sin(targetAngle) * targetRadius,
    );
    ball.setDirection(Math.PI);
  }

  private prepareLaserFanQaPowerUp() {
    if (this.qaScenario !== LASER_FAN_QA_SCENARIO || this.qaScenarioConsumed)
      return;

    this.activePowerUp = new PowerUp(
      this.paddle.position.x + this.paddle.position.width / CENTER_DIVISOR,
      this.paddle.position.y - LASER_FAN_QA_POWER_UP_Y_OFFSET,
      "laser_fan",
      this.getPowerUpSize(),
      this.resolveAssetPath,
    );
    this.laserFanSpawnsThisLevel = 1;
  }

  private async preloadAssets() {
    LOG("🎮 Assets serão carregados sob demanda.");
    this.assetsLoaded = true;
  }

  private async onBrickDestroyed(colorIndex: number) {
    this.playBrickAudio(colorIndex);
    this.updateComboAudio();
    this.maybeSpawnPowerUp();
    this.score += POINTS_PER_BRICK;
    this.successfulBrickHitsThisLevel += 1;
    this.onScoreUpdate(this.score);
    this.latestSpeedReduction = this.getLatestSpeedReductionFromBalls();
    if (this.latestSpeedReduction) {
      this.latestSpeedReduction = {
        ...this.latestSpeedReduction,
        hitNumber: this.successfulBrickHitsThisLevel,
      };
    }

    LOG(
      `🎯 onBrickDestroyed: Score = ${this.score}, Verificando se todos os blocos foram destruídos...`,
    );

    // Log do evento de pontuação
    const gameState = this.getCurrentGameState();
    const ballPositions = this.getBallPositions();
    const paddlePosition = this.paddle.position;

    await gameLogger
      .logScoreUpdate(
        gameState,
        ballPositions,
        paddlePosition,
        POINTS_PER_BRICK,
        "brick_destroyed",
        this.latestSpeedReduction,
      )
      .catch((error) => ERROR("❌ Erro ao registrar pontuação:", error));

    // Verificar se todos os blocos foram destruídos
    if (this.bricks.isAllDestroyed() && !this.isLevelTransitioning) {
      await this.startLevelTransition(gameState, ballPositions, paddlePosition);
    }
  }

  private async startLevelTransition(
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
    const nextInitialBrickCount =
      this.getExpectedInitialBrickCountForLevel(nextLevel);
    const nextMaxSpeed = calculateLevelMaxSpeed(
      this.canvasSize.width,
      nextLevel,
    );
    const nextMinSpeed = calculateLevelMinSpeed(
      this.canvasSize.width,
      nextLevel,
    );
    const nextReductionPerBrick = calculateSpeedReductionPerBrick(
      nextMaxSpeed,
      nextInitialBrickCount,
      nextMinSpeed,
    );
    const payload: LevelTransitionPayload = {
      currentLevel,
      nextLevel,
      nextSpeedMultiplier,
      pauseMs: LEVEL_CLEAR_PAUSE_MS,
      nextMaxSpeed,
      nextMinSpeed,
      nextReductionPerBrick,
      nextInitialBrickCount,
    };

    await gameLogger
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
          nextReductionPerBrick,
          nextInitialBrickCount,
        },
      )
      .catch((error) => ERROR("❌ Erro ao registrar fase concluída:", error));

    this.audioSink.setHighIntensity(
      nextSpeedMultiplier >= HIGH_INTENSITY_SPEED_MULTIPLIER,
    );
    this.onLevelTransition?.(payload);

    this.levelTransitionTimer = setTimeout(() => {
      void this.finishLevelTransition(nextLevel, nextSpeedMultiplier);
    }, LEVEL_CLEAR_PAUSE_MS);
  }

  private async finishLevelTransition(
    nextLevel: number,
    nextSpeedMultiplier: number,
  ) {
    this.level = nextLevel;
    if (this.isSingleBrickQaScenario() && !this.qaScenarioConsumed) {
      this.qaScenarioConsumed = true;
      this.dimensions = this.createDimensions(
        this.canvasSize.width,
        this.canvasSize.height,
      );
      this.baseBrickRows = this.dimensions.brickRows;
      this.configureBrickRows();
    }
    this.applyLevelBrickRows(nextLevel);
    this.radialGeometry = calculateRadialPlayfieldGeometry(
      this.canvasSize.width,
      this.canvasSize.height,
      this.dimensions,
    );
    this.paddle.reset();
    this.activePowerUp = null;
    this.resetLaserFanSpawnCounterForLevel();
    this.destroyedBricksSincePowerUp = 0;
    this.balls = [
      new Ball(
        this.canvasSize.width,
        this.canvasSize.height,
        this.dimensions,
        nextSpeedMultiplier,
        this.resolveAssetPath,
        this.radialGeometry,
      ),
    ];
    this.prepareQaBall();
    this.bricks = this.createBricks();
    this.startLevelSpeedTracking(nextLevel);
    this.onLevelChange?.(this.level);
    this.isLevelTransitioning = false;
    this.audioSink.playAudio(GAME_AUDIO_IDS.LEVEL_START);
    this.audioSink.startGameplayMusic();
    this.audioSink.setHighIntensity(
      nextSpeedMultiplier >= HIGH_INTENSITY_SPEED_MULTIPLIER,
    );

    const gameState = this.getCurrentGameState();
    await gameLogger
      .logLevelStart(
        gameState,
        this.getBallPositions(),
        this.paddle.position,
        nextLevel,
        nextSpeedMultiplier,
      )
      .catch((error) => ERROR("❌ Erro ao registrar início de fase:", error));
  }

  private getRemainingBricksCount(): number {
    let count = 0;
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.bricks.getRows(); r++) {
        if (this.bricks.isBrickActive(c, r)) {
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
      bricksRemaining: this.getRemainingBricksCount(),
      gameWon: this.gameWon,
      gameOver: this.gameOver,
      level: this.level,
      canvasSize: this.canvasSize,
      gameDimensions: {
        brickWidth: this.dimensions.brickWidth,
        brickHeight: this.dimensions.brickHeight,
        brickCols: this.dimensions.brickCols,
        brickRows: this.dimensions.brickRows,
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

  private getInitialBrickCount(): number {
    return Math.max(1, this.getRemainingBricksCount());
  }

  private getElapsedLevelMs(): number {
    return Math.max(0, Date.now() - this.levelStartedAt);
  }

  private buildPhaseSpeedConfig(
    level: number,
    initialBrickCount: number,
    levelStartedAt: number,
  ): PhaseSpeedConfig {
    const maxSpeed = calculateLevelMaxSpeed(this.canvasSize.width, level);
    const minSpeed = calculateLevelMinSpeed(this.canvasSize.width, level);
    return {
      level,
      initialBrickCount,
      initialSpawnSpeed: calculateLevelInitialSpawnSpeed(
        this.canvasSize.width,
        level,
      ),
      maxSpeed,
      minSpeed,
      reductionPerBrick: calculateSpeedReductionPerBrick(
        maxSpeed,
        initialBrickCount,
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
    this.initialBrickCount = this.getInitialBrickCount();
    this.successfulBrickHitsThisLevel = 0;
    this.latestSpeedReduction = null;
    this.phaseSpeedConfig = this.buildPhaseSpeedConfig(
      level,
      this.initialBrickCount,
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
        successfulBrickHits: this.successfulBrickHitsThisLevel,
      };
    }

    const fallbackConfig =
      this.phaseSpeedConfig ??
      this.buildPhaseSpeedConfig(
        this.level,
        Math.max(
          1,
          this.initialBrickCount ||
            this.dimensions.brickCols * this.dimensions.brickRows,
        ),
        this.levelStartedAt,
      );
    const currentSpeed =
      this.latestSpeedReduction?.speedAfter ?? fallbackConfig.initialSpawnSpeed;

    return {
      level: fallbackConfig.level,
      initialBrickCount: fallbackConfig.initialBrickCount,
      successfulBrickHits: this.successfulBrickHitsThisLevel,
      initialSpawnSpeed: fallbackConfig.initialSpawnSpeed,
      maxSpeed: fallbackConfig.maxSpeed,
      minSpeed: fallbackConfig.minSpeed,
      currentSpeed,
      reductionPerBrick: fallbackConfig.reductionPerBrick,
      previousLevelMaxSpeed: fallbackConfig.previousLevelMaxSpeed,
      levelStartedAt: fallbackConfig.levelStartedAt,
      elapsedLevelMs: this.getElapsedLevelMs(),
      minReached: currentSpeed <= fallbackConfig.minSpeed,
    };
  }

  private playBrickAudio(colorIndex: number) {
    const colorAudioId =
      BRICK_COLOR_AUDIO_IDS[colorIndex] || GAME_AUDIO_IDS.BRICK_BREAK_RED;
    this.audioSink.playAudio(GAME_AUDIO_IDS.BRICK_HIT);
    this.audioSink.playAudio(colorAudioId);
    this.audioSink.playAudio(GAME_AUDIO_IDS.SCORE_TICK);
  }

  private updateComboAudio() {
    const now = Date.now();
    this.comboCount =
      now - this.lastBrickDestroyedAt <= COMBO_WINDOW_MS
        ? this.comboCount + 1
        : 1;
    this.lastBrickDestroyedAt = now;

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
    this.destroyedBricksSincePowerUp += 1;
    if (
      this.activePowerUp ||
      this.destroyedBricksSincePowerUp < POWER_UP_SPAWN_INTERVAL
    )
      return;

    this.destroyedBricksSincePowerUp = 0;
    const powerUpType = this.selectNextPowerUpType();
    if (!powerUpType) return;
    const ballPosition = this.balls[0]?.position;
    const spawnX = Math.max(
      POWER_UP_EDGE_PADDING,
      Math.min(
        this.canvasSize.width - POWER_UP_EDGE_PADDING,
        ballPosition?.x ?? this.canvasSize.width / 2,
      ),
    );
    const spawnY = this.dimensions.brickOffsetTop + POWER_UP_START_Y_OFFSET;
    this.activePowerUp = new PowerUp(
      spawnX,
      spawnY,
      powerUpType,
      this.getPowerUpSize(),
      this.resolveAssetPath,
    );
    this.audioSink.playAudio(GAME_AUDIO_IDS.POWERUP_SPAWN);
    void this.logPowerUpEvent(powerUpType, POWER_UP_ACTION_SPAWN);
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

  private updatePowerUp() {
    if (!this.activePowerUp || this.isLevelTransitioning || this.gameOver)
      return;

    this.activePowerUp.update();
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

  private async activatePowerUp(powerUpType: PowerUpType) {
    this.audioSink.playAudio(GAME_AUDIO_IDS.POWERUP_COLLECT);
    await this.logPowerUpEvent(powerUpType, POWER_UP_ACTION_ACTIVATE);
    const activationAudioId = getPowerUpActivationAudioId(powerUpType);

    if (powerUpType === "laser_fan") {
      await this.activateLaserFanPowerUp(activationAudioId);
      return;
    }

    if (powerUpType === "multiball") {
      const baseBall = this.balls[0];
      if (baseBall) {
        const clones = [
          baseBall.createClone(MULTIBALL_ANGLE_OFFSET),
          baseBall.createClone(-MULTIBALL_ANGLE_OFFSET),
        ];
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
      this.paddle.setWidthScale(WIDE_PADDLE_SCALE);
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

  private async activateLaserFanPowerUp(activationAudioId: AudioId) {
    this.audioSink.playAudio(activationAudioId);
    const selectedBricks = this.bricks.selectRandomActive(
      LASER_FAN_TARGET_COUNT,
    );
    this.showLaserFanEffect(selectedBricks);
    this.laserFanResolution = { targets: selectedBricks };
    if (selectedBricks.length === 0) return;
  }

  private async finishLaserFanPowerUp() {
    const resolution = this.laserFanResolution;
    this.resetLaserFanEffectState();
    if (!resolution) return;

    const destroyedBricks = this.bricks.destroySelectedActive(
      resolution.targets,
    );
    this.laserFanResolution = null;
    if (destroyedBricks.length === 0) return;

    const scoreDelta = POINTS_PER_BRICK * destroyedBricks.length;
    this.score += scoreDelta;
    this.successfulBrickHitsThisLevel += destroyedBricks.length;
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

    await Promise.all(
      destroyedBricks.map((brick) =>
        this.logLaserFanBrickDestroyed(
          brick,
          gameState,
          ballPositions,
          paddlePosition,
          ballPosition,
          ballVelocity,
        ),
      ),
    );

    await gameLogger
      .logScoreUpdate(
        gameState,
        ballPositions,
        paddlePosition,
        scoreDelta,
        "laser_fan",
        this.latestSpeedReduction,
      )
      .catch((error) => ERROR("❌ Erro ao registrar pontuação:", error));

    if (this.bricks.isAllDestroyed() && !this.isLevelTransitioning) {
      await this.startLevelTransition(gameState, ballPositions, paddlePosition);
    }
  }

  private async logLaserFanBrickDestroyed(
    brick: DestroyedBrickSnapshot,
    gameState: ReturnType<GameEngine["getCurrentGameState"]>,
    ballPositions: ReturnType<GameEngine["getBallPositions"]>,
    paddlePosition: { x: number; y: number; width: number; height: number },
    ballPosition: { x: number; y: number; radius: number },
    ballVelocity: { dx: number; dy: number },
  ) {
    await gameLogger
      .logBrickDestroyed(
        gameState,
        ballPositions,
        paddlePosition,
        {
          x: brick.x,
          y: brick.y,
          width: brick.width,
          height: brick.height,
        },
        { col: brick.col, row: brick.row },
        brick.colorIndex,
        ballPosition,
        ballVelocity,
        ballVelocity,
        this.latestSpeedReduction,
      )
      .catch((error) =>
        ERROR("❌ Erro ao registrar destruição por laser:", error),
      );
  }

  private showLaserFanEffect(destroyedBricks: DestroyedBrickSnapshot[] = []) {
    const now = Date.now();
    this.laserFanEffectStartedAt = now;
    this.laserFanEffectUntil = now + LASER_FAN_EFFECT_VISIBLE_MS;
    this.laserFanEffectTargets =
      this.buildLaserFanEffectTargets(destroyedBricks);
    if (this.laserFanEffectTimer) clearTimeout(this.laserFanEffectTimer);
    this.laserFanEffectTimer = setTimeout(() => {
      void this.finishLaserFanPowerUp();
    }, LASER_FAN_EFFECT_VISIBLE_MS);
  }

  private clearLaserFanEffect() {
    if (this.laserFanEffectTimer) clearTimeout(this.laserFanEffectTimer);
    this.resetLaserFanEffectState();
    this.laserFanResolution = null;
  }

  private resetLaserFanEffectState() {
    this.laserFanEffectTimer = null;
    this.laserFanEffectStartedAt = 0;
    this.laserFanEffectUntil = 0;
    this.laserFanEffectTargets = [];
  }

  private isLaserFanEffectActive() {
    return (
      this.laserFanEffectStartedAt !== 0 &&
      Date.now() <= this.laserFanEffectUntil
    );
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
    destroyedBricks: DestroyedBrickSnapshot[],
  ): LaserFanEffectTarget[] {
    return destroyedBricks.map((brick, index) => ({
      col: brick.col,
      row: brick.row,
      colorIndex: brick.colorIndex,
      x: brick.x + brick.width / CENTER_DIVISOR,
      y: brick.y + brick.height / CENTER_DIVISOR,
      width: brick.width,
      height: brick.height,
      index,
      seed: this.buildLaserFanTargetSeed(brick, index),
    }));
  }

  private buildLaserFanTargetSeed(
    brick: DestroyedBrickSnapshot,
    index: number,
  ) {
    return Math.abs(
      brick.col * LASER_FAN_SEED_COL_MULTIPLIER +
        brick.row * LASER_FAN_SEED_ROW_MULTIPLIER +
        brick.colorIndex * LASER_FAN_SEED_COLOR_MULTIPLIER +
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

  private async logPowerUpEvent(
    powerUpType: PowerUpType,
    action: LoggedPowerUpAction,
  ) {
    await gameLogger
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

  private getExpectedInitialBrickCountForLevel(level: number): number {
    if (
      this.isSingleBrickQaScenario() &&
      !this.qaScenarioConsumed &&
      level > this.level
    ) {
      const previewDimensions = calculateDynamicDimensions(
        this.canvasSize.width,
        this.canvasSize.height,
      );
      const previewMaxBrickRows = this.calculateMaxBrickRows(previewDimensions);
      const previewBrickRows = calculateLevelBrickRows(
        previewDimensions.brickRows,
        previewMaxBrickRows,
        level,
      );

      return previewDimensions.brickCols * previewBrickRows;
    }

    return (
      this.dimensions.brickCols *
      calculateLevelBrickRows(this.baseBrickRows, this.maxBrickRows, level)
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

  public startPaddleDrag(clientX: number) {
    this.isTouching = true;
    this.movePaddleFromClientX(clientX);
  }

  public movePaddleDrag(clientX: number) {
    if (!this.isTouching) return;

    this.movePaddleFromClientX(clientX);
  }

  public endPaddleDrag() {
    this.isTouching = false;
  }

  private movePaddleFromClientX(clientX: number) {
    const rect = this.canvas.getBoundingClientRect();
    const touchX = clientX - rect.left;
    const canvasX = (touchX / rect.width) * this.canvasSize.width;
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

    // Aguardar GameLogger estar pronto
    LOG("⏳ Aguardando GameLogger estar pronto...");
    let attempts = 0;
    while (!gameLogger["db"] && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!gameLogger["db"]) {
      ERROR("❌ GameLogger não inicializou após 5 segundos");
    } else {
      LOG("✅ GameLogger está pronto");
    }

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
      await gameLogger
        .logRestartGame(gameState, ballPositions, paddlePosition)
        .catch((error) =>
          ERROR("❌ Erro ao registrar restart do jogo:", error),
        );
    }

    LOG("🎮 Registrando início do jogo...");

    // Verificar se o GameLogger está pronto
    if (!gameLogger["db"]) {
      WARN("⚠️ GameLogger ainda não inicializado, aguardando...");
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    await gameLogger
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
      this.loop();
    }
  }

  public stop() {
    this.isStopped = true;
    this.isPaused = false;
    this.isTouching = false;
    this.clearPowerUpEffects();
    this.clearLaserFanEffect();
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
      this.animationFrame = requestAnimationFrame(this.loop);
    }
  }

  private loop = async () => {
    if (this.isStopped || this.isPaused) return;
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
        this.drawRadialPlayfield();
        this.bricks.draw(this.ctx);
        const isLaserFanAnimating = this.isLaserFanEffectActive();
        this.paddle.update();
        if (!isLaserFanAnimating) {
          this.updatePowerUp();
        }
        this.paddle.draw(this.ctx);
        this.activePowerUp?.draw(this.ctx);
        this.drawLaserFanEffect();
        if (this.isLevelTransitioning || isLaserFanAnimating) {
          this.balls.forEach((ball) => ball.draw(this.ctx));
        } else {
          for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];

            const inPlay = await ball.update(
              this.paddle,
              this.bricks,
              this.canvasSize.height,
              this.getCurrentGameState(),
              this.audioSink,
            );
            if (!inPlay) {
              this.balls.splice(i, 1);
              if (this.balls.length > 0) {
                await gameLogger
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
        if (this.balls.length === 0) {
          // Game over - no balls left
          this.gameOver = true;
          this.clearLaserFanEffect();
          this.audioSink.playAudio(GAME_AUDIO_IDS.GAME_OVER);
          this.audioSink.startMenuMusic();

          // Log da mudança de estado do jogo
          const gameState = this.getCurrentGameState();
          const ballPositions = this.getBallPositions();
          const paddlePosition = this.paddle.position;

          await gameLogger
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
          await gameLogger
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
