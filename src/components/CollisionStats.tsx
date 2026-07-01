// src/components/CollisionStats.tsx
import { useState } from 'react';
import { useCollisionStats } from '../hooks/useCollisionStats';

interface CollisionStatsProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CollisionStats({ isVisible, onClose }: CollisionStatsProps) {
  const { stats, loading, error, clearAllCollisions, getRecentCollisions } = useCollisionStats(2000, isVisible);
  const [showRecentCollisions, setShowRecentCollisions] = useState(false);
  const [recentCollisions, setRecentCollisions] = useState<any[]>([]);

  const handleShowRecentCollisions = async () => {
    const collisions = await getRecentCollisions(20);
    setRecentCollisions(collisions);
    setShowRecentCollisions(!showRecentCollisions);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  };

  const formatSpeed = (speed: number | null | undefined) => {
    return typeof speed === 'number' ? speed.toFixed(3) : '—';
  };

  const getCollisionTypeIcon = (type: string) => {
    switch (type) {
      case 'wall': return '🧱';
      case 'paddle': return '🏓';
      case 'brick': return '🧱';
      case 'ceiling': return '🏠';
      case 'ball_lost': return '💀';
      default: return '❓';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="collision-stats-overlay">
      <div className="collision-stats-modal">
        <div className="collision-stats-header">
          <h2>📊 Estatísticas de Colisões</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        {loading && <div className="loading">Carregando...</div>}
        
        {error && (
          <div className="error">
            ❌ Erro: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="collision-stats-content">
            <div className="stats-summary">
              <div className="stat-item">
                <span className="stat-label">Total de Colisões:</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Último Minuto:</span>
                <span className="stat-value">{stats.recentActivity.lastMinute}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Últimos 5 Minutos:</span>
                <span className="stat-value">{stats.recentActivity.last5Minutes}</span>
              </div>
              
              <div className="stat-item">
                <span className="stat-label">Última Hora:</span>
                <span className="stat-value">{stats.recentActivity.lastHour}</span>
              </div>

              <div className="stat-item">
                <span className="stat-label">Velocidade atual:</span>
                <span className="stat-value">{formatSpeed(stats.latestSpeedState?.currentSpeed)}</span>
              </div>

              <div className="stat-item">
                <span className="stat-label">Reduções aplicadas:</span>
                <span className="stat-value">{stats.brickSpeedSamples.length}</span>
              </div>

              <div className="stat-item">
                <span className="stat-label">Mínimo atingido:</span>
                <span className="stat-value">{stats.minSpeedReachedCount}</span>
              </div>
            </div>

            <div className="stats-by-type">
              <h3>Por Tipo:</h3>
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="type-stat">
                  <span className="type-icon">{getCollisionTypeIcon(type)}</span>
                  <span className="type-name">{type}</span>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>

            <div className="stats-actions">
              <button 
                onClick={handleShowRecentCollisions}
                className="action-button"
              >
                {showRecentCollisions ? 'Ocultar' : 'Mostrar'} Colisões Recentes
              </button>
              
              <button 
                onClick={clearAllCollisions}
                className="action-button danger"
              >
                Limpar Todas as Colisões
              </button>
            </div>

            {showRecentCollisions && (
              <div className="recent-collisions">
                <h3>Colisões Recentes:</h3>
                <div className="collisions-list">
                  {recentCollisions.map((collision) => (
                    <div key={collision.id} className="collision-item">
                      <span className="collision-icon">
                        {getCollisionTypeIcon(collision.type)}
                      </span>
                      <span className="collision-time">
                        {formatTimestamp(collision.timestamp)}
                      </span>
                      <span className="collision-type">
                        {collision.type}
                      </span>
                      <span className="collision-position">
                        ({Math.round(collision.ballPosition.x)}, {Math.round(collision.ballPosition.y)})
                      </span>
                      <span className="collision-position">
                        {' '}• Velocidade: {formatSpeed(collision.gameState?.speedState?.currentSpeed)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .collision-stats-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: color-mix(in srgb, var(--bb-color-background) 72%, transparent);
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          z-index: 1000;
        }

        .collision-stats-modal {
          background: var(--bb-color-surface);
          border: 2px solid var(--bb-color-outline-soft);
          border-radius: 12px;
          padding: 16px;
          width: min(600px, calc(100vw - 32px));
          max-width: calc(100vw - 32px);
          max-height: calc(100dvh - 32px);
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          color: var(--bb-color-text);
          font-family: var(--bb-font-mono);
        }

        .collision-stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--bb-color-outline-soft);
          padding-bottom: 10px;
        }

        .collision-stats-header h2 {
          margin: 0;
          color: var(--bb-color-primary);
        }

        .close-button {
          background: var(--bb-color-danger-strong);
          color: var(--bb-color-text);
          border: none;
          border-radius: 50%;
          min-width: 44px;
          min-height: 44px;
          cursor: pointer;
          font-size: 16px;
        }

        .loading {
          text-align: center;
          color: var(--bb-color-primary);
          font-style: italic;
        }

        .error {
          color: var(--bb-color-danger);
          text-align: center;
          padding: 10px;
          background: color-mix(in srgb, var(--bb-color-danger) 12%, transparent);
          border-radius: 5px;
        }

        .stats-summary {
          margin-bottom: 20px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 5px 0;
        }

        .stat-label {
          color: var(--bb-color-muted);
        }

        .stat-value {
          color: var(--bb-color-primary);
          font-weight: bold;
        }

        .stats-by-type {
          margin-bottom: 20px;
        }

        .stats-by-type h3 {
          color: var(--bb-color-primary);
          margin-bottom: 10px;
        }

        .type-stat {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 5px;
          padding: 3px 0;
        }

        .type-icon {
          margin-right: 10px;
          font-size: 18px;
        }

        .type-name {
          flex: 1;
          color: var(--bb-color-muted);
          text-transform: capitalize;
        }

        .type-count {
          color: var(--bb-color-primary);
          font-weight: bold;
        }

        .stats-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }

        .action-button {
          background: var(--bb-color-panel-soft);
          color: var(--bb-color-text);
          border: 1px solid var(--bb-color-outline);
          min-height: 44px;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-family: inherit;
        }

        .action-button:hover {
          background: color-mix(in srgb, var(--bb-color-primary) 14%, var(--bb-color-panel-soft));
        }

        .action-button.danger {
          background: var(--bb-color-danger-strong);
          border-color: var(--bb-color-danger);
        }

        .action-button.danger:hover {
          background: var(--bb-color-danger);
        }

        .recent-collisions h3 {
          color: var(--bb-color-primary);
          margin-bottom: 10px;
        }

        .collisions-list {
          max-height: min(200px, 40dvh);
          overflow-y: auto;
          overflow-x: hidden;
          border: 1px solid var(--bb-color-outline-soft);
          border-radius: 5px;
          padding: 10px;
        }

        .collision-item {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 5px;
          padding: 3px 0;
          font-size: 12px;
        }

        .collision-icon {
          margin-right: 8px;
          font-size: 14px;
        }

        .collision-time {
          color: var(--bb-color-muted);
          margin-right: 10px;
          min-width: 80px;
        }

        .collision-type {
          color: var(--bb-color-muted);
          margin-right: 10px;
          min-width: 60px;
          text-transform: capitalize;
        }

        .collision-position {
          color: var(--bb-color-primary);
          font-family: monospace;
        }
      `}</style>
    </div>
  );
}
