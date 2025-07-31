// src/components/CollisionStats.tsx
import { useState } from 'react';
import { useCollisionStats } from '../hooks/useCollisionStats';

interface CollisionStatsProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CollisionStats({ isVisible, onClose }: CollisionStatsProps) {
  const { stats, loading, error, clearAllCollisions, getRecentCollisions } = useCollisionStats(2000);
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
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .collision-stats-modal {
          background: #1a1a1a;
          border: 2px solid #333;
          border-radius: 12px;
          padding: 20px;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          color: white;
          font-family: 'Courier New', monospace;
        }

        .collision-stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #333;
          padding-bottom: 10px;
        }

        .collision-stats-header h2 {
          margin: 0;
          color: #00d4ff;
        }

        .close-button {
          background: #ff4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 16px;
        }

        .loading {
          text-align: center;
          color: #00d4ff;
          font-style: italic;
        }

        .error {
          color: #ff4444;
          text-align: center;
          padding: 10px;
          background: rgba(255, 68, 68, 0.1);
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
          color: #ccc;
        }

        .stat-value {
          color: #00d4ff;
          font-weight: bold;
        }

        .stats-by-type {
          margin-bottom: 20px;
        }

        .stats-by-type h3 {
          color: #00d4ff;
          margin-bottom: 10px;
        }

        .type-stat {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          padding: 3px 0;
        }

        .type-icon {
          margin-right: 10px;
          font-size: 18px;
        }

        .type-name {
          flex: 1;
          color: #ccc;
          text-transform: capitalize;
        }

        .type-count {
          color: #00d4ff;
          font-weight: bold;
        }

        .stats-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .action-button {
          background: #333;
          color: white;
          border: 1px solid #555;
          padding: 8px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-family: inherit;
        }

        .action-button:hover {
          background: #444;
        }

        .action-button.danger {
          background: #ff4444;
          border-color: #ff6666;
        }

        .action-button.danger:hover {
          background: #ff6666;
        }

        .recent-collisions h3 {
          color: #00d4ff;
          margin-bottom: 10px;
        }

        .collisions-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #333;
          border-radius: 5px;
          padding: 10px;
        }

        .collision-item {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          padding: 3px 0;
          font-size: 12px;
        }

        .collision-icon {
          margin-right: 8px;
          font-size: 14px;
        }

        .collision-time {
          color: #888;
          margin-right: 10px;
          min-width: 80px;
        }

        .collision-type {
          color: #ccc;
          margin-right: 10px;
          min-width: 60px;
          text-transform: capitalize;
        }

        .collision-position {
          color: #00d4ff;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
} 