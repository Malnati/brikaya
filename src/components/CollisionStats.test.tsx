// src/components/CollisionStats.test.tsx
import { render, waitFor } from '@testing-library/react';

import { CollisionStats } from './CollisionStats';
import { collisionTracker } from '../utils/collisionTracker';

jest.mock('../utils/collisionTracker', () => ({
  collisionTracker: {
    getCollisionStats: jest.fn().mockResolvedValue({
      total: 0,
      byType: {},
      recentActivity: { lastMinute: 0, last5Minutes: 0, lastHour: 0 },
      latestSpeedState: null,
      brickSpeedSamples: [],
      minSpeedReachedCount: 0,
    }),
    clearAllCollisions: jest.fn().mockResolvedValue(undefined),
    getRecentCollisions: jest.fn().mockResolvedValue([]),
    getCollisionsByType: jest.fn().mockResolvedValue([]),
  },
}));

describe('CollisionStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não consulta IndexedDB quando está fechado', async () => {
    render(<CollisionStats isVisible={false} onClose={jest.fn()} />);

    await waitFor(() => {
      expect(collisionTracker.getCollisionStats).not.toHaveBeenCalled();
    });
  });
});
