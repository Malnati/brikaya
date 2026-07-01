// src/constants/game.test.ts
import { describe, expect, it } from '@jest/globals';

import {
  FIRST_LEVEL_MIN_SPEED_DIVISOR,
  FIRST_LEVEL_BASE_SPEED_MULTIPLIER,
  calculateClampedSpeed,
  calculateInitialBallSpeed,
  calculateLevelInitialSpawnSpeed,
  calculateLevelMaxSpeed,
  calculateLevelMinSpeed,
  calculateLevelPreviousMaxSpeed,
  calculateLevelSpeedMultiplier,
  calculateSpeedReductionPerBrick,
} from './game';

const CANVAS_WIDTH = 393;
const PHASE_ONE = 1;
const PHASE_TWO = 2;
const INITIAL_BRICK_COUNT = 10;

describe('game speed helpers', () => {
  it('calcula velocidade máxima da fase 1 a partir da nova base 6x', () => {
    const expected = calculateInitialBallSpeed(CANVAS_WIDTH)
      * FIRST_LEVEL_BASE_SPEED_MULTIPLIER
      * calculateLevelSpeedMultiplier(PHASE_ONE);

    expect(calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE)).toBeCloseTo(expected, 5);
  });

  it('usa base 6x para a velocidade máxima e spawn inicial da fase 1', () => {
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

  it('usa um quarto da própria máxima como mínimo da fase 1', () => {
    expect(calculateLevelMinSpeed(CANVAS_WIDTH, PHASE_ONE)).toBeCloseTo(
      calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE) / FIRST_LEVEL_MIN_SPEED_DIVISOR,
      5
    );
  });

  it('usa um quarto da máxima da fase anterior como mínimo da fase 2', () => {
    expect(calculateLevelMinSpeed(CANVAS_WIDTH, PHASE_TWO)).toBeCloseTo(
      calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE) / FIRST_LEVEL_MIN_SPEED_DIVISOR,
      5
    );
  });

  it('calcula redução por bloco a partir da máxima e da quantidade inicial', () => {
    const maxSpeed = calculateLevelMaxSpeed(CANVAS_WIDTH, PHASE_ONE);

    expect(calculateSpeedReductionPerBrick(maxSpeed, INITIAL_BRICK_COUNT)).toBeCloseTo(
      maxSpeed / INITIAL_BRICK_COUNT,
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
});
