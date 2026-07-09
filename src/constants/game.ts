// src/constants/game.ts
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 320;

// Responsividade
export const MIN_CANVAS_WIDTH = 320;
export const MIN_CANVAS_HEIGHT = 240;
export const MAX_CANVAS_HEIGHT = 600;
export const RESPONSIVE_CANVAS_UI_RESERVED_BLOCK = 180;

// Controles touch
export const TOUCH_SENSITIVITY = 2;
export const TOUCH_DEAD_ZONE = 10;

export const BALL_RADIUS = 10;
export const BALL_SPEED = 2.5;
export const MOBILE_CANVAS_WIDTH_THRESHOLD = 480;
export const MOBILE_BALL_SPEED_MULTIPLIER = 0.75;
export const LEVEL_CLEAR_PAUSE_MS = 1800;
export const LEVEL_UP_OVERLAY_VISIBLE_MS = 1200;
export const CINEMATIC_COUNTDOWN_STEPS = ["3", "2", "1"] as const;
export const CINEMATIC_COUNTDOWN_STEP_MS = 600;
export const CINEMATIC_COUNTDOWN_TOTAL_MS =
  CINEMATIC_COUNTDOWN_STEPS.length * CINEMATIC_COUNTDOWN_STEP_MS;
export const CINEMATIC_RIP_VISIBLE_MS = 1800;
export const LASER_FAN_MAX_SPAWNS_PER_LEVEL = 2;
export const LASER_FAN_EFFECT_VISIBLE_MS = 2000;
export const MULTIBALL_MAX_BALL_COUNT = 10;
export const MULTIBALL_MIN_BALL_COUNT = 2;
export const LASER_FAN_MAX_TARGET_COUNT = 10;
export const LASER_FAN_MIN_TARGET_COUNT = 2;
export const WIDE_PADDLE_MAX_SCALE = 1.9;
export const WIDE_PADDLE_MIN_SCALE = 1.45;
export const POWER_UP_PHASE_DECAY_PHASES = 9;
export const MULTIBALL_MAX_FAN_SPREAD = 0.84;
export const LEVEL_SPEED_STEP = 0.12;
export const MAX_LEVEL_SPEED_MULTIPLIER = 2.2;
export const LEVEL_BRICK_ROW_STEP = 1;
export const LEVEL_BRICK_ROW_INTERVAL = 1;
export const FIRST_LEVEL_MIN_SPEED_DIVISOR = 3;
export const FIRST_LEVEL_BASE_SPEED_MULTIPLIER = 2;
export const SPEED_PRECISION_FACTOR = 1000;

export const PADDLE_WIDTH = 75;
export const PADDLE_HEIGHT = 10;
export const PADDLE_SPEED = 7;
export const PADDLE_WIDTH_MIN = 51;
export const PADDLE_WIDTH_MAX = 102;
export const PADDLE_WIDTH_CANVAS_RATIO = 0.17;
export const PADDLE_HEIGHT_WIDTH_RATIO = 0.15;

// Dimensões base dos blocos (serão ajustadas dinamicamente)
export const BRICK_WIDTH = 75;
export const BRICK_HEIGHT = 20;
export const BRICK_PADDING = 10;
export const BRICK_OFFSET_TOP = 30;
export const BRICK_OFFSET_LEFT = 30;

export const BRICK_ROWS = 3;
export const BRICK_COLS = 5;

export const GAME_COLOR = "#00d4ff";
export const ROOT_ELEMENT_ID = "root";

export function calculateInitialBallSpeed(canvasWidth: number): number {
  if (canvasWidth <= MOBILE_CANVAS_WIDTH_THRESHOLD) {
    return BALL_SPEED * MOBILE_BALL_SPEED_MULTIPLIER;
  }

  return BALL_SPEED;
}

export interface LevelTransitionPayload {
  currentLevel: number;
  nextLevel: number;
  nextSpeedMultiplier: number;
  pauseMs: number;
  nextMaxSpeed: number;
  nextMinSpeed: number;
  nextReductionPerBrick: number;
  nextInitialBrickCount: number;
}

export interface SpeedStateSnapshot {
  level: number;
  initialBrickCount: number;
  successfulBrickHits: number;
  initialSpawnSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  currentSpeed: number;
  reductionPerBrick: number;
  previousLevelMaxSpeed: number;
  levelStartedAt: number;
  elapsedLevelMs: number;
  minReached: boolean;
}

export interface SpeedReductionSnapshot {
  level: number;
  hitNumber: number;
  speedBefore: number;
  speedAfter: number;
  reductionApplied: number;
  minSpeed: number;
  maxSpeed: number;
  minReached: boolean;
  elapsedLevelMs: number;
}

export interface PhaseSpeedConfig {
  level: number;
  initialBrickCount: number;
  initialSpawnSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  reductionPerBrick: number;
  previousLevelMaxSpeed: number;
  levelStartedAt: number;
}

export function calculateLevelSpeedMultiplier(level: number): number {
  return Math.min(
    1 + (level - 1) * LEVEL_SPEED_STEP,
    MAX_LEVEL_SPEED_MULTIPLIER,
  );
}

export function calculatePhaseScaledCount(
  level: number,
  maxCount: number,
  minCount: number,
  decayPhases = POWER_UP_PHASE_DECAY_PHASES,
): number {
  const safeLevel = Math.max(1, Math.floor(level));
  if (safeLevel <= 1) {
    return maxCount;
  }

  const safeDecayPhases = Math.max(2, Math.floor(decayPhases));
  const step = (maxCount - minCount) / (safeDecayPhases - 1);
  return Math.max(minCount, Math.round(maxCount - (safeLevel - 1) * step));
}

export function calculatePhaseScaledScale(
  level: number,
  maxScale: number,
  minScale: number,
  decayPhases = POWER_UP_PHASE_DECAY_PHASES,
): number {
  const safeLevel = Math.max(1, Math.floor(level));
  if (safeLevel <= 1) {
    return maxScale;
  }

  const safeDecayPhases = Math.max(2, Math.floor(decayPhases));
  const step = (maxScale - minScale) / (safeDecayPhases - 1);
  return Math.max(minScale, maxScale - (safeLevel - 1) * step);
}

export function calculateMultiballBallCount(level: number): number {
  return calculatePhaseScaledCount(
    level,
    MULTIBALL_MAX_BALL_COUNT,
    MULTIBALL_MIN_BALL_COUNT,
  );
}

export function calculateLaserFanTargetCount(level: number): number {
  return calculatePhaseScaledCount(
    level,
    LASER_FAN_MAX_TARGET_COUNT,
    LASER_FAN_MIN_TARGET_COUNT,
  );
}

export function calculateWidePaddleScale(level: number): number {
  return calculatePhaseScaledScale(
    level,
    WIDE_PADDLE_MAX_SCALE,
    WIDE_PADDLE_MIN_SCALE,
  );
}

export function buildMultiballAngleOffsets(cloneCount: number): number[] {
  if (cloneCount <= 0) {
    return [];
  }

  if (cloneCount === 1) {
    return [0];
  }

  const spread = MULTIBALL_MAX_FAN_SPREAD;
  const step = (2 * spread) / (cloneCount + 1);

  return Array.from({ length: cloneCount }, (_, index) => {
    return -spread + step * (index + 1);
  });
}

export function calculateLevelBrickRows(
  baseRows: number,
  maxRows: number,
  level: number,
): number {
  const safeBaseRows = Math.max(1, Math.floor(baseRows));
  const safeMaxRows = Math.max(safeBaseRows, Math.floor(maxRows));
  const safeLevel = Math.max(1, Math.floor(level));
  const addedRows =
    Math.floor((safeLevel - 1) / LEVEL_BRICK_ROW_INTERVAL) *
    LEVEL_BRICK_ROW_STEP;

  return Math.min(safeMaxRows, safeBaseRows + addedRows);
}

export function roundSpeedValue(speed: number): number {
  return Math.round(speed * SPEED_PRECISION_FACTOR) / SPEED_PRECISION_FACTOR;
}

export function calculateLevelMaxSpeed(
  canvasWidth: number,
  level: number,
): number {
  return roundSpeedValue(
    calculateInitialBallSpeed(canvasWidth) *
      FIRST_LEVEL_BASE_SPEED_MULTIPLIER *
      calculateLevelSpeedMultiplier(level),
  );
}

export function calculateLevelInitialSpawnSpeed(
  canvasWidth: number,
  level: number,
): number {
  return calculateLevelMaxSpeed(canvasWidth, level);
}

export function calculateLevelPreviousMaxSpeed(
  canvasWidth: number,
  level: number,
): number {
  if (level <= 1) {
    return calculateLevelMaxSpeed(canvasWidth, level);
  }

  return calculateLevelMaxSpeed(canvasWidth, level - 1);
}

export function calculateLevelMinSpeed(
  canvasWidth: number,
  level: number,
): number {
  return roundSpeedValue(
    calculateLevelMaxSpeed(canvasWidth, level) / FIRST_LEVEL_MIN_SPEED_DIVISOR,
  );
}

export function calculateSpeedReductionPerBrick(
  maxSpeed: number,
  initialBrickCount: number,
  minSpeed: number,
): number {
  const safeBrickCount = Math.max(1, initialBrickCount);
  return roundSpeedValue(Math.max(0, maxSpeed - minSpeed) / safeBrickCount);
}

export function calculateClampedSpeed(
  speed: number,
  minSpeed: number,
  maxSpeed: number,
): number {
  return roundSpeedValue(Math.min(maxSpeed, Math.max(minSpeed, speed)));
}

// Funções para calcular dimensões dinâmicas
export interface DynamicGameDimensions {
  brickWidth: number;
  brickHeight: number;
  brickPadding: number;
  brickOffsetTop: number;
  brickOffsetLeft: number;
  brickCols: number;
  brickRows: number;
  paddleWidth: number;
  paddleHeight: number;
  ballRadius: number;
}

export function calculateDynamicDimensions(
  canvasWidth: number,
  canvasHeight: number,
): DynamicGameDimensions {
  // Calcular largura disponível para os blocos (deixando margem)
  const availableWidth = canvasWidth - 60; // 30px de margem em cada lado
  const availableHeight = canvasHeight * 0.4; // 40% da altura para os blocos

  // Calcular número de colunas baseado na largura disponível
  // Queremos pelo menos 3 colunas e no máximo 8
  const minBrickWidth = 40; // Largura mínima para um bloco
  const maxBrickWidth = 120; // Largura máxima para um bloco

  let brickCols = Math.floor(availableWidth / (minBrickWidth + 10));
  brickCols = Math.max(3, Math.min(8, brickCols)); // Entre 3 e 8 colunas

  // Calcular largura do bloco baseada no número de colunas
  const brickWidth = Math.max(
    minBrickWidth,
    Math.min(
      maxBrickWidth,
      (availableWidth - (brickCols - 1) * 10) / brickCols,
    ),
  );

  // Calcular altura do bloco proporcional à largura
  const brickHeight = brickWidth * 0.3; // Proporção 3:1

  // Calcular padding entre blocos
  const brickPadding = Math.max(5, brickWidth * 0.1);

  // Calcular offset para centralizar os blocos
  const totalBricksWidth =
    brickCols * brickWidth + (brickCols - 1) * brickPadding;
  const brickOffsetLeft = (canvasWidth - totalBricksWidth) / 2;

  // Calcular offset top baseado na altura disponível
  const brickOffsetTop = Math.max(20, canvasHeight * 0.1);

  // Calcular número de linhas baseado na altura disponível
  const maxRows = Math.floor(
    (availableHeight - brickOffsetTop) / (brickHeight + brickPadding),
  );
  const brickRows = Math.max(2, Math.min(5, maxRows)); // Entre 2 e 5 linhas

  // Calcular dimensões do paddle proporcionalmente
  const paddleWidth = Math.max(
    PADDLE_WIDTH_MIN,
    Math.min(PADDLE_WIDTH_MAX, canvasWidth * PADDLE_WIDTH_CANVAS_RATIO),
  );
  const paddleHeight = paddleWidth * PADDLE_HEIGHT_WIDTH_RATIO;

  // Calcular raio da bola proporcionalmente
  const ballRadius = Math.max(8, Math.min(15, canvasWidth * 0.02));

  return {
    brickWidth,
    brickHeight,
    brickPadding,
    brickOffsetTop,
    brickOffsetLeft,
    brickCols,
    brickRows,
    paddleWidth,
    paddleHeight,
    ballRadius,
  };
}
