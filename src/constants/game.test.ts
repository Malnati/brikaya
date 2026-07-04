// src/constants/game.test.ts
import { describe, expect, it } from '@jest/globals';

import {
  FIRST_LEVEL_MIN_SPEED_DIVISOR,
  FIRST_LEVEL_BASE_SPEED_MULTIPLIER,
  PADDLE_HEIGHT_WIDTH_RATIO,
  PADDLE_WIDTH_CANVAS_RATIO,
  PADDLE_WIDTH_MAX,
  PADDLE_WIDTH_MIN,
  calculateClampedSpeed,
  calculateDynamicDimensions,
  calculateInitialBallSpeed,
  calculateLevelInitialSpawnSpeed,
  calculateLevelBrickRows,
  calculateLevelMaxSpeed,
  calculateLevelMinSpeed,
  calculateLevelPreviousMaxSpeed,
  calculateLevelSpeedMultiplier,
  calculateSpeedReductionPerBrick,
  roundSpeedValue,
} from './game';

const CANVAS_WIDTH = 393;
const PHASE_ONE = 1;
const PHASE_TWO = 2;
const PHASE_FIVE = 5;
const INITIAL_BRICK_COUNT = 10;
const BASE_BRICK_ROWS = 2;
const MAX_BRICK_ROWS = 5;
const SMALL_CANVAS_WIDTH = 240;
const MOBILE_CANVAS_WIDTH = 390;
const DEFAULT_CANVAS_WIDTH = 480;
const WIDE_CANVAS_WIDTH = 900;
const DIMENSION_TEST_CANVAS_HEIGHT = 320;

describe('game speed helpers', () => {
  it('calcula velocidade máxima da fase 1 a partir da nova base 3x', () => {
    const expected = calculateInitialBallSpeed(CANVAS_WIDTH)
      * FIRST_LEVEL_BASE_SPEED_MULTIPLIER
      * calculateLevelSpeedMultiplier(PHASE_ONE);

    expect(FIRST_LEVEL_BASE_SPEED_MULTIPLIER).toBe(3);
    expect(calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE)).toBeCloseTo(expected, 5);
  });

  it('usa base 3x para a velocidade máxima e spawn inicial da fase 1', () => {
    const expectedPhaseOneSpeed = calculateInitialBallSpeed(CANVAS_WIDTH) * FIRST_LEVEL_BASE_SPEED_MULTIPLIER;

    expect(calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE)).toBeCloseTo(expectedPhaseOneSpeed, 5);
    expect(calculateLevelInitialSpawnSpeed(CANVAS_WIDTH, PHASE_ONE)).toBeCloseTo(
      calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE),
      5
    );
  });

  it('faz a fase 2 evoluir a partir da nova base da fase 1', () => {
    const expectedPhaseTwoSpeed = calculateInitialBallSpeed(CANVAS_WIDTH)
      * FIRST_LEVEL_BASE_SPEED_MULTIPLIER
      * calculateLevelSpeedMultiplier(PHASE_TWO);

    expect(calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_TWO)).toBeCloseTo(expectedPhaseTwoSpeed, 5);
    expect(calculateLevelInitialSpawnSpeed(CANVAS_WIDTH, PHASE_TWO)).toBeCloseTo(
      calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_TWO),
      5
    );
  });

  it('calcula velocidade máxima anterior da fase 2 a partir da fase 1', () => {
    expect(calculateLevelPreviousMaxSpeed(CANVAS_WIDTH, PHASE_TWO)).toBeCloseTo(
      calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE),
      5
    );
  });

  it('usa um terço da própria máxima como mínimo da fase 1', () => {
    expect(calculateLevelMinSpeed(CANVAS_WIDTH, PHASE_ONE)).toBeCloseTo(
      calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE) / FIRST_LEVEL_MIN_SPEED_DIVISOR,
      5
    );
  });

  it('usa um terço da própria máxima como mínimo da fase 2', () => {
    expect(calculateLevelMinSpeed(CANVAS_WIDTH, PHASE_TWO)).toBeCloseTo(
      calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_TWO) / FIRST_LEVEL_MIN_SPEED_DIVISOR,
      5
    );
    expect(calculateLevelMinSpeed(CANVAS_WIDTH, PHASE_TWO)).toBeGreaterThan(
      calculateLevelMinSpeed(CANVAS_WIDTH, PHASE_ONE)
    );
  });

  it('mantém a fase 1 mobile com velocidade visível mínima e inicial', () => {
    expect(calculateLevelInitialSpawnSpeed(CANVAS_WIDTH, PHASE_ONE)).toBeCloseTo(
      5.625,
      5,
    );
    expect(calculateLevelMinSpeed(CANVAS_WIDTH, PHASE_ONE)).toBeCloseTo(
      1.875,
      5,
    );
  });

  it('mantém a fase 1 desktop com velocidade visível mínima e inicial', () => {
    expect(calculateLevelInitialSpawnSpeed(WIDE_CANVAS_WIDTH, PHASE_ONE)).toBeCloseTo(
      7.5,
      5,
    );
    expect(calculateLevelMinSpeed(WIDE_CANVAS_WIDTH, PHASE_ONE)).toBeCloseTo(
      2.5,
      5,
    );
  });

  it('calcula redução por bloco a partir da faixa entre máxima e mínima', () => {
    const maxSpeed = calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE);
    const minSpeed = calculateLevelMinSpeed(CANVAS_WIDTH, PHASE_ONE);

    expect(calculateSpeedReductionPerBrick(maxSpeed, INITIAL_BRICK_COUNT, minSpeed)).toBeCloseTo(
      roundSpeedValue((maxSpeed - minSpeed) / INITIAL_BRICK_COUNT),
      5
    );
  });

  it('usa divisor seguro quando a quantidade inicial de blocos é inválida', () => {
    const maxSpeed = calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE);
    const minSpeed = calculateLevelMinSpeed(CANVAS_WIDTH, PHASE_ONE);

    expect(calculateSpeedReductionPerBrick(maxSpeed, 0, minSpeed)).toBeCloseTo(
      maxSpeed - minSpeed,
      5
    );
  });

  it('faz clamp abaixo do mínimo, dentro da faixa e acima do máximo', () => {
    const minSpeed = 0.5;
    const maxSpeed = 1.5;

    expect(calculateClampedSpeed(0.25, minSpeed, maxSpeed)).toBe(minSpeed);
    expect(calculateClampedSpeed(1.0, minSpeed, maxSpeed)).toBe(1.0);
    expect(calculateClampedSpeed(2.0, minSpeed, maxSpeed)).toBe(maxSpeed);
  });

  it('aumenta linhas de tijolos por fase sem ultrapassar o limite do tabuleiro', () => {
    expect(calculateLevelBrickRows(BASE_BRICK_ROWS, MAX_BRICK_ROWS, PHASE_ONE)).toBe(BASE_BRICK_ROWS);
    expect(calculateLevelBrickRows(BASE_BRICK_ROWS, MAX_BRICK_ROWS, PHASE_TWO)).toBe(BASE_BRICK_ROWS + 1);
    expect(calculateLevelBrickRows(BASE_BRICK_ROWS, MAX_BRICK_ROWS, PHASE_FIVE)).toBe(MAX_BRICK_ROWS);
  });

  it('reduz a raquete em quinze por cento mantendo altura proporcional', () => {
    const mobileDimensions = calculateDynamicDimensions(
      MOBILE_CANVAS_WIDTH,
      DIMENSION_TEST_CANVAS_HEIGHT,
    );
    const defaultDimensions = calculateDynamicDimensions(
      DEFAULT_CANVAS_WIDTH,
      DIMENSION_TEST_CANVAS_HEIGHT,
    );

    expect(mobileDimensions.paddleWidth).toBeCloseTo(
      MOBILE_CANVAS_WIDTH * PADDLE_WIDTH_CANVAS_RATIO,
      5,
    );
    expect(defaultDimensions.paddleWidth).toBeCloseTo(
      DEFAULT_CANVAS_WIDTH * PADDLE_WIDTH_CANVAS_RATIO,
      5,
    );
    expect(mobileDimensions.paddleHeight).toBeCloseTo(
      mobileDimensions.paddleWidth * PADDLE_HEIGHT_WIDTH_RATIO,
      5,
    );
  });

  it('preserva clamps reduzidos da raquete', () => {
    expect(
      calculateDynamicDimensions(
        SMALL_CANVAS_WIDTH,
        DIMENSION_TEST_CANVAS_HEIGHT,
      ).paddleWidth,
    ).toBe(PADDLE_WIDTH_MIN);
    expect(
      calculateDynamicDimensions(
        WIDE_CANVAS_WIDTH,
        DIMENSION_TEST_CANVAS_HEIGHT,
      ).paddleWidth,
    ).toBe(PADDLE_WIDTH_MAX);
  });
});
