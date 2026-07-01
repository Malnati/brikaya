// src/components/GameLogViewer.test.tsx
import { render, waitFor } from '@testing-library/react';

import GameLogViewer from './GameLogViewer';
import { gameLogger } from '../storage/gameLogger';

jest.mock('../storage/gameLogger', () => ({
  gameLogger: {
    getAllEvents: jest.fn().mockResolvedValue([]),
    getGameStats: jest.fn().mockResolvedValue(null),
    clearAllEvents: jest.fn().mockResolvedValue(undefined),
    exportGameData: jest.fn().mockResolvedValue('{}'),
  },
}));

describe('GameLogViewer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não consulta IndexedDB quando está fechado', async () => {
    render(<GameLogViewer isVisible={false} />);

    await waitFor(() => {
      expect(gameLogger.getAllEvents).not.toHaveBeenCalled();
      expect(gameLogger.getGameStats).not.toHaveBeenCalled();
    });
  });
});
