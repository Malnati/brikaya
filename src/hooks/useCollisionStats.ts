// src/hooks/useCollisionStats.ts
import { useState, useEffect, useCallback } from 'react';
import { collisionTracker } from '../utils/collisionTracker';
import { ERROR } from '../utils/logger';

interface CollisionStats {
  total: number;
  byType: Record<string, number>;
  recentActivity: {
    lastMinute: number;
    last5Minutes: number;
    lastHour: number;
  };
}

export function useCollisionStats(refreshInterval: number = 1000) {
  const [stats, setStats] = useState<CollisionStats>({
    total: 0,
    byType: {},
    recentActivity: { lastMinute: 0, last5Minutes: 0, lastHour: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      const collisionStats = await collisionTracker.getCollisionStats();
      setStats(collisionStats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      ERROR('❌ Erro ao carregar estatísticas de colisões:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAllCollisions = useCallback(async () => {
    try {
      await collisionTracker.clearAllCollisions();
      await refreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao limpar colisões');
      ERROR('❌ Erro ao limpar colisões:', err);
    }
  }, [refreshStats]);

  const getRecentCollisions = useCallback(async (limit: number = 10) => {
    try {
      return await collisionTracker.getRecentCollisions(limit);
    } catch (err) {
      ERROR('❌ Erro ao obter colisões recentes:', err);
      return [];
    }
  }, []);

  const getCollisionsByType = useCallback(async (type: string) => {
    try {
      return await collisionTracker.getCollisionsByType(type as any);
    } catch (err) {
      ERROR('❌ Erro ao obter colisões por tipo:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    refreshStats();

    const interval = setInterval(refreshStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshStats, refreshInterval]);

  return {
    stats,
    loading,
    error,
    refreshStats,
    clearAllCollisions,
    getRecentCollisions,
    getCollisionsByType
  };
} 