// src/objects/Ball.test.ts
import { describe, expect, it, jest } from '@jest/globals';

import { Ball } from './Ball';
import { sprBallPlayerDefault } from '../constants/visualAssets';
import {
  calculateInitialBallSpeed,
  calculateLevelInitialSpawnSpeed,
  calculateLevelMaxSpeed,
  calculateLevelMinSpeed,
  calculateLevelPreviousMaxSpeed,
  calculateLevelSpeedMultiplier,
  calculateSpeedReductionPerBrick,
  DynamicGameDimensions,
  MAX_LEVEL_SPEED_MULTIPLIER,
  PhaseSpeedConfig
} from '../constants/game';
import {
  calculateBallTurretBoundarySegments,
  calculateBallTurretPlayfieldGeometry,
  calculateRadialPaddleBounds,
  calculateRadialPlayfieldGeometry,
} from '../utils/radialGeometry';
import { AssetLoader } from '../utils/assetLoader';

jest.mock('../utils/assetLoader', () => ({
  AssetLoader: {
    getOrLoadImage: jest.fn(() => null),
  },
}));

jest.mock('../utils/collisionTracker', () => ({
  collisionTracker: {
    logWallCollision: jest.fn().mockResolvedValue(undefined),
    logCeilingCollision: jest.fn().mockResolvedValue(undefined),
    logPaddleCollision: jest.fn().mockResolvedValue(undefined),
    logBallLost: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../storage/gameLogger', () => ({
  gameLogger: {
    logCollision: jest.fn().mockResolvedValue(undefined),
    logBallLost: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../utils/logger', () => ({
  LOG: jest.fn(),
  ERROR: jest.fn(),
}));

const DIMENSIONS: DynamicGameDimensions = {
  brickWidth: 60,
  brickHeight: 20,
  brickPadding: 8,
  brickOffsetTop: 24,
  brickOffsetLeft: 16,
  brickCols: 5,
  brickRows: 3,
  paddleWidth: 80,
  paddleHeight: 12,
  ballRadius: 9,
};

const CANVAS_WIDTH = 393;
const CANVAS_HEIGHT = 852;
const PHASE_ONE = 1;
const PHASE_TWO = 2;
const LATE_PHASE = 11;
const INITIAL_BRICK_COUNT = DIMENSIONS.brickCols * DIMENSIONS.brickRows;
const CENTER_DIVISOR = 2;
const RADIAL_PADDLE_TEST_INSET = 1;
const CARTESIAN_TO_BALL_DIRECTION_OFFSET = Math.PI / 2;
const DESKTOP_CANVAS_WIDTH = 640;
const CANVAS_IMAGE_SOURCE = {} as HTMLImageElement;

type MockCanvasContext = CanvasRenderingContext2D & {
  arc: jest.Mock;
  createRadialGradient: jest.Mock;
  drawImage: jest.Mock;
  lineTo: jest.Mock;
  moveTo: jest.Mock;
  stroke: jest.Mock;
};

function createBallCanvasContext(): MockCanvasContext {
  const gradient = {
    addColorStop: jest.fn(),
  } as unknown as CanvasGradient;

  return {
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    createRadialGradient: jest.fn(() => gradient),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    drawImage: jest.fn(),
    set fillStyle(_value: string | CanvasGradient | CanvasPattern) {},
    set strokeStyle(_value: string | CanvasGradient | CanvasPattern) {},
    set shadowColor(_value: string) {},
    set shadowBlur(_value: number) {},
    set lineCap(_value: CanvasLineCap) {},
    set lineJoin(_value: CanvasLineJoin) {},
    set lineWidth(_value: number) {},
    set globalCompositeOperation(_value: GlobalCompositeOperation) {},
  } as unknown as MockCanvasContext;
}

function buildPhaseSpeedConfig(level: number): PhaseSpeedConfig {
  const maxSpeed = calculateLevelMaxSpeed(CANVAS_WIDTH, level);
  const minSpeed = calculateLevelMinSpeed(CANVAS_WIDTH, level);
  return {
    level,
    initialBrickCount: INITIAL_BRICK_COUNT,
    initialSpawnSpeed: calculateLevelInitialSpawnSpeed(CANVAS_WIDTH, level),
    maxSpeed,
    minSpeed,
    reductionPerBrick: calculateSpeedReductionPerBrick(maxSpeed, INITIAL_BRICK_COUNT, minSpeed),
    previousLevelMaxSpeed: calculateLevelPreviousMaxSpeed(CANVAS_WIDTH, level),
    levelStartedAt: Date.now() - 1000,
  };
}

function createGameState(ball: Ball, level: number = PHASE_ONE) {
  return {
    score: 0,
    ballsCount: 1,
    bricksRemaining: INITIAL_BRICK_COUNT,
    gameWon: false,
    gameOver: false,
    level,
    canvasSize: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
    gameDimensions: DIMENSIONS,
    speedState: ball.getSpeedStateSnapshot(),
  };
}

function placeBallAtTurretBoundary(
  ball: Ball,
  geometry: ReturnType<typeof calculateBallTurretPlayfieldGeometry>,
  angle: number,
) {
  const boundaryRadius = geometry.radius - DIMENSIONS.ballRadius - 1;

  ball.setPosition(
    geometry.centerX + Math.cos(angle) * boundaryRadius,
    geometry.centerY + Math.sin(angle) * boundaryRadius,
  );
  ball.setDirection(angle + CARTESIAN_TO_BALL_DIRECTION_OFFSET);
}

describe('Ball', () => {
  it('desenha energia elétrica procedural para a bolinha padrão sem depender de imagem', () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(12_345);
    jest.mocked(AssetLoader.getOrLoadImage).mockClear();
    jest.mocked(AssetLoader.getOrLoadImage).mockReturnValue(null);
    const context = createBallCanvasContext();
    const ball = new Ball(
      DESKTOP_CANVAS_WIDTH,
      CANVAS_HEIGHT,
      DIMENSIONS,
      1,
      () => sprBallPlayerDefault,
    );
    const positionBefore = ball.position;
    const velocityBefore = ball.getVelocity();

    try {
      ball.draw(context);
    } finally {
      nowSpy.mockRestore();
    }

    expect(AssetLoader.getOrLoadImage).not.toHaveBeenCalled();
    expect(context.drawImage).not.toHaveBeenCalled();
    expect(context.createRadialGradient).toHaveBeenCalledTimes(2);
    expect(context.moveTo).toHaveBeenCalledTimes(5);
    expect(context.lineTo).toHaveBeenCalled();
    expect(context.stroke).toHaveBeenCalled();
    expect(ball.position).toEqual(positionBefore);
    expect(ball.getVelocity()).toEqual(velocityBefore);
  });

  it('reduz movimento elétrico procedural quando efeitos de canvas são reduzidos', () => {
    jest.mocked(AssetLoader.getOrLoadImage).mockReturnValue(null);
    const context = createBallCanvasContext();
    const ball = new Ball(
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      DIMENSIONS,
      1,
      () => sprBallPlayerDefault,
    );
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(12_345);

    try {
      ball.draw(context);

      expect(nowSpy).not.toHaveBeenCalled();
      expect(context.moveTo).toHaveBeenCalledTimes(2);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it('usa fallback elétrico legível quando o gradiente procedural falha', () => {
    jest.mocked(AssetLoader.getOrLoadImage).mockReturnValue(null);
    const context = createBallCanvasContext();
    context.createRadialGradient.mockImplementation(() => {
      throw new Error('gradient unavailable');
    });
    const ball = new Ball(
      DESKTOP_CANVAS_WIDTH,
      CANVAS_HEIGHT,
      DIMENSIONS,
      1,
      () => sprBallPlayerDefault,
    );

    ball.draw(context);

    expect(AssetLoader.getOrLoadImage).not.toHaveBeenCalled();
    expect(context.arc).toHaveBeenLastCalledWith(
      DESKTOP_CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      DIMENSIONS.ballRadius,
      0,
      Math.PI * 2,
    );
    expect(context.stroke).toHaveBeenCalled();
  });

  it('mantém desenho por imagem para conjuntos que não usam a bolinha padrão', () => {
    jest.mocked(AssetLoader.getOrLoadImage).mockReturnValueOnce(CANVAS_IMAGE_SOURCE);
    const context = createBallCanvasContext();
    const ball = new Ball(
      DESKTOP_CANVAS_WIDTH,
      CANVAS_HEIGHT,
      DIMENSIONS,
      1,
      () => '/assets/visual/sprites/spr-ball-player-high-contrast-default.svg',
    );

    ball.draw(context);

    expect(AssetLoader.getOrLoadImage).toHaveBeenCalledWith(
      '/assets/visual/sprites/spr-ball-player-high-contrast-default.svg',
    );
    expect(context.drawImage).toHaveBeenCalledWith(
      CANVAS_IMAGE_SOURCE,
      DESKTOP_CANVAS_WIDTH / 2 - DIMENSIONS.ballRadius,
      CANVAS_HEIGHT / 2 - DIMENSIONS.ballRadius,
      DIMENSIONS.ballRadius * 2,
      DIMENSIONS.ballRadius * 2,
    );
    expect(context.moveTo).not.toHaveBeenCalled();
  });

  it('aplica multiplicador ao resetar para uma nova fase', () => {
    const multiplier = calculateLevelSpeedMultiplier(2);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);

    ball.resetForLevel(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS, multiplier);

    const expectedSpeed = calculateInitialBallSpeed(CANVAS_WIDTH) * multiplier;
    expect(ball.position).toEqual({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      radius: DIMENSIONS.ballRadius,
    });
    expect(ball.getVelocity().dx).toBeCloseTo(0, 5);
    expect(ball.getVelocity().dy).toBeCloseTo(-expectedSpeed, 5);
  });

  it('inicia no centro geométrico do globo radial', () => {
    const geometry = calculateRadialPlayfieldGeometry(
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      DIMENSIONS,
    );
    const ball = new Ball(
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      DIMENSIONS,
      1,
      undefined,
      geometry,
    );

    expect(ball.position.x).toBeCloseTo(geometry.centerX, 5);
    expect(ball.position.y).toBeCloseTo(geometry.centerY, 5);
  });

  it('respeita teto de velocidade da progressão de fases', () => {
    expect(calculateLevelSpeedMultiplier(99)).toBe(MAX_LEVEL_SPEED_MULTIPLIER);
  });

  it('inicia fase 1 com a nova base como máxima e spawn inicial', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);

    expect(ball.getCurrentSpeedMagnitude()).toBe(config.maxSpeed);
    expect(config.initialSpawnSpeed).toBe(config.maxSpeed);
    expect(config.maxSpeed).toBe(calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE));
    expect(ball.getSpeedStateSnapshot()).toMatchObject({
      level: PHASE_ONE,
      maxSpeed: config.maxSpeed,
      minSpeed: config.minSpeed,
      currentSpeed: config.maxSpeed,
      initialBrickCount: INITIAL_BRICK_COUNT,
      successfulBrickHits: 0,
    });
  });

  it('inicia fase 2 na máxima derivada da nova base da fase 1', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_TWO);

    ball.applyPhaseSpeedConfig(config);

    expect(ball.getCurrentSpeedMagnitude()).toBe(config.maxSpeed);
    expect(config.initialSpawnSpeed).toBe(config.maxSpeed);
  });

  it('reduz velocidade por constante fixa ao acertar bloco', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);
    ball.registerBrickHit();

    expect(ball.getCurrentSpeedMagnitude()).toBeCloseTo(
      config.initialSpawnSpeed - config.reductionPerBrick,
      5
    );
    expect(ball.getLastSpeedReduction()?.level).toBe(PHASE_ONE);
    expect(ball.getLastSpeedReduction()?.hitNumber).toBe(1);
    expect(ball.getLastSpeedReduction()?.speedBefore).toBeCloseTo(config.initialSpawnSpeed, 5);
    expect(ball.getLastSpeedReduction()?.speedAfter).toBeCloseTo(
      config.initialSpawnSpeed - config.reductionPerBrick,
      5
    );
    expect(ball.getLastSpeedReduction()?.reductionApplied).toBeCloseTo(
      config.reductionPerBrick,
      5
    );
    expect(ball.getCurrentSpeedMagnitude()).toBeGreaterThan(config.minSpeed);
  });

  it('reduz gradualmente e só alcança o mínimo ao consumir todos os blocos iniciais', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);

    for (let hit = 0; hit < INITIAL_BRICK_COUNT - 1; hit += 1) {
      ball.registerBrickHit();
    }

    expect(ball.getCurrentSpeedMagnitude()).toBeGreaterThan(config.minSpeed);
    expect(ball.getLastSpeedReduction()?.minReached).toBe(false);

    ball.registerBrickHit();

    expect(ball.getCurrentSpeedMagnitude()).toBe(config.minSpeed);
    expect(ball.getLastSpeedReduction()?.minReached).toBe(true);
  });

  it('não deixa múltiplos hits passarem da velocidade mínima', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);

    for (let hit = 0; hit < INITIAL_BRICK_COUNT * 4; hit += 1) {
      ball.registerBrickHit();
    }

    expect(ball.getCurrentSpeedMagnitude()).toBe(config.minSpeed);
    expect(ball.getLastSpeedReduction()?.minReached).toBe(true);
  });

  it('mantém magnitude clampada na faixa da fase ao bater na raquete', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);

    expect(ball.getCurrentSpeedMagnitude()).toBe(config.maxSpeed);
    (ball as any).setPosition(150, 400);
    (ball as any).handlePaddleCollision({ x: 100, y: 430, width: 100, height: 12 });

    expect(ball.getCurrentSpeedMagnitude()).toBeGreaterThanOrEqual(config.minSpeed);
    expect(ball.getCurrentSpeedMagnitude()).toBeLessThanOrEqual(config.maxSpeed);
    expect(ball.getCurrentSpeedMagnitude()).toBe(config.maxSpeed);
  });

  it('mantém módulo válido ao inverter direção no teto', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);

    ball.applyPhaseSpeedConfig(config);
    ball.registerBrickHit();
    const speedBeforeBounce = ball.getCurrentSpeedMagnitude();

    ball.bounceY();

    expect(ball.getCurrentSpeedMagnitude()).toBeCloseTo(speedBeforeBounce, 5);
    expect(ball.getCurrentSpeedMagnitude()).toBeGreaterThanOrEqual(config.minSpeed);
  });


  it('mantém deslocamento equivalente entre 60Hz e 120Hz', () => {
    const oneFrame60Hz = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const twoFrames120Hz = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);
    const bricks = { collide: jest.fn(() => false) };
    const paddle = {
      position: {
        x: 0,
        y: CANVAS_HEIGHT + 100,
        width: DIMENSIONS.paddleWidth,
        height: DIMENSIONS.paddleHeight,
      },
    };

    oneFrame60Hz.applyPhaseSpeedConfig(config);
    twoFrames120Hz.applyPhaseSpeedConfig(config);

    oneFrame60Hz.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(oneFrame60Hz),
      undefined,
      1,
    );
    twoFrames120Hz.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(twoFrames120Hz),
      undefined,
      0.5,
    );
    twoFrames120Hz.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(twoFrames120Hz),
      undefined,
      0.5,
    );

    expect(twoFrames120Hz.position.y).toBeCloseTo(oneFrame60Hz.position.y, 5);
  });

  it('não move a bola quando frameScale é zero', () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(PHASE_ONE);
    const bricks = { collide: jest.fn(() => false) };
    const paddle = {
      position: {
        x: 0,
        y: CANVAS_HEIGHT + 100,
        width: DIMENSIONS.paddleWidth,
        height: DIMENSIONS.paddleHeight,
      },
    };

    ball.applyPhaseSpeedConfig(config);
    const before = ball.position;

    ball.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
      undefined,
      0,
    );

    expect(ball.position).toEqual(before);
  });

  it('mantém a bolinha dentro do canvas ao bater na parede em alta velocidade', async () => {
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const config = buildPhaseSpeedConfig(LATE_PHASE);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };
    const paddle = {
      position: {
        x: 0,
        y: CANVAS_HEIGHT + 100,
        width: DIMENSIONS.paddleWidth,
        height: DIMENSIONS.paddleHeight,
      },
    };

    ball.applyPhaseSpeedConfig(config);
    ball.setPosition(CANVAS_WIDTH - DIMENSIONS.ballRadius - 1, 120);
    ball.setDirection(Math.PI / 2);

    await ball.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      {
        score: 0,
        ballsCount: 1,
        bricksRemaining: INITIAL_BRICK_COUNT,
        gameWon: false,
        gameOver: false,
        level: LATE_PHASE,
        canvasSize: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
        gameDimensions: DIMENSIONS,
        speedState: ball.getSpeedStateSnapshot(),
      }
    );

    expect(ball.position.x).toBeLessThanOrEqual(CANVAS_WIDTH - DIMENSIONS.ballRadius);
    expect(ball.position.x).toBeGreaterThanOrEqual(DIMENSIONS.ballRadius);
    expect(ball.getVelocity().dx).toBeLessThan(0);
  });

  it('emite corrente elétrica transferida da bolinha para as extremidades da parede lateral', async () => {
    const onElectricImpact = jest.fn();
    const ball = new Ball(
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      DIMENSIONS,
      1,
      undefined,
      undefined,
      onElectricImpact,
    );
    const bricks = { collide: jest.fn(() => false) };
    const paddle = {
      position: {
        x: 0,
        y: CANVAS_HEIGHT + 100,
        width: DIMENSIONS.paddleWidth,
        height: DIMENSIONS.paddleHeight,
      },
    };

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    ball.setPosition(CANVAS_WIDTH - DIMENSIONS.ballRadius - 1, 120);
    ball.setDirection(Math.PI / 2);

    await ball.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(onElectricImpact).toHaveBeenCalledWith({
      kind: 'wall',
      origin: { x: CANVAS_WIDTH, y: expect.any(Number) },
      endpoints: [
        { x: CANVAS_WIDTH, y: 0 },
        { x: CANVAS_WIDTH, y: CANVAS_HEIGHT },
      ],
    });
  });

  it('emite corrente elétrica transferida da bolinha para as duas pontas do teto', async () => {
    const onElectricImpact = jest.fn();
    const ball = new Ball(
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      DIMENSIONS,
      1,
      undefined,
      undefined,
      onElectricImpact,
    );
    const bricks = { collide: jest.fn(() => false) };
    const paddle = {
      position: {
        x: 0,
        y: CANVAS_HEIGHT + 100,
        width: DIMENSIONS.paddleWidth,
        height: DIMENSIONS.paddleHeight,
      },
    };

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    ball.setPosition(CANVAS_WIDTH / CENTER_DIVISOR, DIMENSIONS.ballRadius - 1);
    ball.setDirection(0);

    await ball.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(onElectricImpact).toHaveBeenCalledWith({
      kind: 'ceiling',
      origin: { x: CANVAS_WIDTH / CENTER_DIVISOR, y: 0 },
      endpoints: [
        { x: 0, y: 0 },
        { x: CANVAS_WIDTH, y: 0 },
      ],
    });
  });

  it('rebate na raquete em arco na borda radial inferior', async () => {
    const geometry = calculateRadialPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const paddle = {
      position: calculateRadialPaddleBounds(geometry, DIMENSIONS, Math.PI / 2, 1),
    };
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    ball.setPosition(
      geometry.centerX,
      geometry.centerY + geometry.radius - DIMENSIONS.ballRadius - 1,
    );
    ball.setDirection(Math.PI);

    const inPlay = await ball.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(true);
    expect(ball.getVelocity().dy).toBeLessThan(0);
  });

  it('rebate na banda visual da raquete radial antes da borda externa', async () => {
    const geometry = calculateRadialPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const paddlePosition = calculateRadialPaddleBounds(geometry, DIMENSIONS, Math.PI / 2, 1);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };
    const targetRadius =
      paddlePosition.radial.radius -
      paddlePosition.radial.thickness / CENTER_DIVISOR -
      DIMENSIONS.ballRadius -
      RADIAL_PADDLE_TEST_INSET;

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    ball.setPosition(
      geometry.centerX,
      geometry.centerY + targetRadius,
    );
    ball.setDirection(Math.PI);

    const inPlay = await ball.update(
      { position: paddlePosition },
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(true);
    expect(ball.getVelocity().dy).toBeLessThan(0);
  });

  it('perde a bolinha no arco inferior quando a raquete radial não cobre a saída', async () => {
    const geometry = calculateRadialPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const sidePaddle = calculateRadialPaddleBounds(geometry, DIMENSIONS, Math.PI * 0.22, 1);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    ball.setPosition(
      geometry.centerX,
      geometry.centerY + geometry.radius - DIMENSIONS.ballRadius - 1,
    );
    ball.setDirection(Math.PI);

    const inPlay = await ball.update(
      { position: sidePaddle },
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(false);
  });

  it('reflete na parede circular fora do arco de perda', async () => {
    const geometry = calculateRadialPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const paddle = {
      position: calculateRadialPaddleBounds(geometry, DIMENSIONS, Math.PI / 2, 1),
    };
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    ball.setPosition(
      geometry.centerX + geometry.radius - DIMENSIONS.ballRadius - 1,
      geometry.centerY,
    );
    ball.setDirection(Math.PI / 2);

    const inPlay = await ball.update(
      paddle,
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(true);
    expect(ball.getVelocity().dx).toBeLessThan(0);
  });

  it('na torreta rebate a bolinha nas partes ativas da borda', async () => {
    const geometry = calculateBallTurretPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const topPaddle = calculateRadialPaddleBounds(geometry, DIMENSIONS, -Math.PI / 2, 1);
    const onElectricImpact = jest.fn();
    const ball = new Ball(
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
      DIMENSIONS,
      1,
      undefined,
      geometry,
      onElectricImpact,
    );
    const bricks = { collide: jest.fn().mockResolvedValue(false) };
    const bottomReboundSegment = calculateBallTurretBoundarySegments(PHASE_ONE)[0];
    const bottomReboundAngle =
      (bottomReboundSegment.startAngle + bottomReboundSegment.endAngle) / 2;

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    placeBallAtTurretBoundary(ball, geometry, bottomReboundAngle);

    const inPlay = await ball.update(
      { position: topPaddle },
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(true);
    expect(ball.getVelocity().dy).toBeLessThan(0);
    expect(onElectricImpact).toHaveBeenCalledWith({
      kind: 'radial-wall',
      origin: {
        x: geometry.centerX + Math.cos(bottomReboundAngle) * geometry.radius,
        y: geometry.centerY + Math.sin(bottomReboundAngle) * geometry.radius,
      },
      endpoints: [
        {
          x: geometry.centerX + Math.cos(bottomReboundSegment.startAngle) * geometry.radius,
          y: geometry.centerY + Math.sin(bottomReboundSegment.startAngle) * geometry.radius,
        },
        {
          x: geometry.centerX + Math.cos(bottomReboundSegment.endAngle) * geometry.radius,
          y: geometry.centerY + Math.sin(bottomReboundSegment.endAngle) * geometry.radius,
        },
      ],
    });
  });

  it('na torreta perde a bolinha nas partes inativas da borda', async () => {
    const geometry = calculateBallTurretPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const topPaddle = calculateRadialPaddleBounds(geometry, DIMENSIONS, -Math.PI / 2, 1);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS, 1, undefined, geometry);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };
    const inactiveSegment = calculateBallTurretBoundarySegments(PHASE_ONE)[1];
    const inactiveAngle =
      (inactiveSegment.startAngle + inactiveSegment.endAngle) / 2;

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(PHASE_ONE));
    placeBallAtTurretBoundary(ball, geometry, inactiveAngle);

    const inPlay = await ball.update(
      { position: topPaddle },
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball),
    );

    expect(inPlay).toBe(false);
  });

  it('na fase 10 da torreta não mantém partes da borda rebatendo', async () => {
    const geometry = calculateBallTurretPlayfieldGeometry(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS);
    const topPaddle = calculateRadialPaddleBounds(geometry, DIMENSIONS, -Math.PI / 2, 1);
    const ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, DIMENSIONS, 1, undefined, geometry);
    const bricks = { collide: jest.fn().mockResolvedValue(false) };
    const bottomSegment = calculateBallTurretBoundarySegments(PHASE_ONE)[0];
    const bottomAngle = (bottomSegment.startAngle + bottomSegment.endAngle) / 2;

    ball.applyPhaseSpeedConfig(buildPhaseSpeedConfig(10));
    placeBallAtTurretBoundary(ball, geometry, bottomAngle);

    const inPlay = await ball.update(
      { position: topPaddle },
      bricks,
      CANVAS_HEIGHT,
      createGameState(ball, 10),
    );

    expect(inPlay).toBe(false);
  });
});
