// src/storage/score.test.ts
import { openDB } from 'idb';

import { getHighScores } from './score';

jest.mock('idb', () => ({
  openDB: jest.fn(),
}));

const SCORE_LIMIT = 5;

function mockScoreRows(rows: unknown[]) {
  const store = {
    getAll: jest.fn().mockResolvedValue(rows),
  };
  const transaction = jest.fn(() => ({ store }));
  (openDB as jest.Mock).mockResolvedValue({ transaction });
  return { store, transaction };
}

describe('score storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna recordes positivos em ordem decrescente respeitando limite', async () => {
    mockScoreRows([0, 30, 90, 60, 'inválido', 90, -10, 10]);

    await expect(getHighScores(SCORE_LIMIT)).resolves.toEqual([90, 90, 60, 30, 10]);
  });
});
