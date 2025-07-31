// src/components/GameLogViewer.tsx
import { useState, useEffect } from 'react';
import { gameLogger } from '../storage/gameLogger';

interface GameLogViewerProps {
  isVisible: boolean;
  onClose: () => void;
}

export function GameLogViewer({ isVisible, onClose }: GameLogViewerProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [limit, setLimit] = useState<number>(50);

  useEffect(() => {
    if (isVisible) {
      loadData();
    }
  }, [isVisible, filter, limit]);

  const loadData = async () => {
    setLoading(true);
    try {
      let eventsData;
      if (filter === 'all') {
        eventsData = await gameLogger.getRecentEvents(limit);
      } else {
        eventsData = await gameLogger.getEventsByType(filter as any);
      }
      setEvents(eventsData);

      const statsData = await gameLogger.getGameStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (confirm('Tem certeza que deseja limpar todos os logs?')) {
      try {
        await gameLogger.clearAllEvents();
        setEvents([]);
        setStats(null);
      } catch (error) {
        console.error('Erro ao limpar logs:', error);
      }
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const formatEventType = (type: string) => {
    const typeMap: Record<string, string> = {
      'game_start': '🎮 Início do Jogo',
      'game_end': '🏁 Fim do Jogo',
      'score_update': '📈 Atualização de Pontuação',
      'ball_lost': '💀 Bola Perdida',
      'ball_added': '⚽ Bola Adicionada',
      'brick_destroyed': '🧱 Bloco Destruído',
      'brick_added': '🏗️ Bloco Adicionado',
      'paddle_move': '🏓 Movimento da Raquete',
      'collision': '💥 Colisão',
      'power_up': '⚡ Power-up',
      'level_complete': '🎯 Nível Completo'
    };
    return typeMap[type] || type;
  };

  const getEventColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'game_start': '#4CAF50',
      'game_end': '#FF5722',
      'score_update': '#2196F3',
      'ball_lost': '#F44336',
      'ball_added': '#9C27B0',
      'brick_destroyed': '#FF9800',
      'brick_added': '#607D8B',
      'paddle_move': '#795548',
      'collision': '#E91E63',
      'power_up': '#00BCD4',
      'level_complete': '#8BC34A'
    };
    return colorMap[type] || '#666';
  };

  if (!isVisible) return null;

  return (
    <div className="game-log-viewer-overlay">
      <div className="game-log-viewer">
        <div className="game-log-header">
          <h2>📊 Logs do Jogo</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="game-log-controls">
          <div className="filter-controls">
            <label>
              Filtro:
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">Todos os Eventos</option>
                <option value="game_start">Início do Jogo</option>
                <option value="game_end">Fim do Jogo</option>
                <option value="score_update">Pontuação</option>
                <option value="ball_lost">Bola Perdida</option>
                <option value="brick_destroyed">Bloco Destruído</option>
                <option value="collision">Colisões</option>
                <option value="paddle_move">Movimento da Raquete</option>
              </select>
            </label>
            <label>
              Limite:
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                <option value={25}>25 eventos</option>
                <option value={50}>50 eventos</option>
                <option value={100}>100 eventos</option>
                <option value={200}>200 eventos</option>
              </select>
            </label>
          </div>
          <button onClick={loadData} className="refresh-button">🔄 Atualizar</button>
          <button onClick={clearLogs} className="clear-button">🗑️ Limpar Logs</button>
        </div>

        {stats && (
          <div className="game-stats">
            <h3>📈 Estatísticas Gerais</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total de Jogos:</span>
                <span className="stat-value">{stats.totalGames}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total de Eventos:</span>
                <span className="stat-value">{stats.totalEvents}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Vitórias:</span>
                <span className="stat-value">{stats.gamesWon}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Derrotas:</span>
                <span className="stat-value">{stats.gamesLost}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pontuação Média:</span>
                <span className="stat-value">{Math.round(stats.averageScore)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="events-container">
          <h3>📋 Eventos Recentes</h3>
          {loading ? (
            <div className="loading">Carregando...</div>
          ) : events.length === 0 ? (
            <div className="no-events">Nenhum evento encontrado</div>
          ) : (
            <div className="events-list">
              {events.map((event) => (
                <div key={event.id} className="event-item" style={{ borderLeftColor: getEventColor(event.type) }}>
                  <div className="event-header">
                    <span className="event-type">{formatEventType(event.type)}</span>
                    <span className="event-time">{formatTimestamp(event.timestamp)}</span>
                  </div>
                  <div className="event-details">
                    <div className="event-state">
                      <strong>Estado do Jogo:</strong>
                      <span>Pontuação: {event.gameState.score}</span>
                      <span>Bolas: {event.gameState.ballsCount}</span>
                      <span>Blocos Restantes: {event.gameState.bricksRemaining}</span>
                    </div>
                    {event.ballPositions && event.ballPositions.length > 0 && (
                      <div className="ball-positions">
                        <strong>Posições das Bolas:</strong>
                        {event.ballPositions.map((ball: any, index: number) => (
                          <span key={index}>
                            Bola {index + 1}: ({Math.round(ball.x)}, {Math.round(ball.y)})
                          </span>
                        ))}
                      </div>
                    )}
                    {event.paddlePosition && (
                      <div className="paddle-position">
                        <strong>Posição da Raquete:</strong>
                        <span>X: {Math.round(event.paddlePosition.x)}</span>
                      </div>
                    )}
                    {event.collisionInfo && (
                      <div className="collision-info">
                        <strong>Informações da Colisão:</strong>
                        <span>Tipo: {event.collisionInfo.type}</span>
                        {event.collisionInfo.brickIndex && (
                          <span>Bloco: [{event.collisionInfo.brickIndex.col}, {event.collisionInfo.brickIndex.row}]</span>
                        )}
                        {event.collisionInfo.hitPosition && (
                          <span>Posição do Hit: {(event.collisionInfo.hitPosition * 100).toFixed(1)}%</span>
                        )}
                      </div>
                    )}
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="event-metadata">
                        <strong>Metadados:</strong>
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <span key={key}>{key}: {String(value)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
          .game-log-viewer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .game-log-viewer {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 10px;
            width: 90%;
            max-width: 1200px;
            height: 90%;
            max-height: 800px;
            display: flex;
            flex-direction: column;
            color: white;
            font-family: 'Courier New', monospace;
            font-size: 12px;
          }

          .game-log-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #333;
            background: #2a2a2a;
            border-radius: 10px 10px 0 0;
          }

          .game-log-header h2 {
            margin: 0;
            color: #fff;
          }

          .close-button {
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 16px;
          }

          .close-button:hover {
            background: #cc3333;
          }

          .game-log-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            border-bottom: 1px solid #333;
            background: #2a2a2a;
          }

          .filter-controls {
            display: flex;
            gap: 15px;
            align-items: center;
          }

          .filter-controls label {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .filter-controls select {
            background: #333;
            color: white;
            border: 1px solid #555;
            border-radius: 3px;
            padding: 5px;
            font-size: 12px;
          }

          .refresh-button, .clear-button {
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 5px 10px;
            cursor: pointer;
            font-size: 12px;
            margin-left: 10px;
          }

          .clear-button {
            background: #f44336;
          }

          .refresh-button:hover {
            background: #1976D2;
          }

          .clear-button:hover {
            background: #D32F2F;
          }

          .game-stats {
            padding: 15px;
            border-bottom: 1px solid #333;
            background: #2a2a2a;
          }

          .game-stats h3 {
            margin: 0 0 10px 0;
            color: #fff;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
          }

          .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 5px;
            background: #333;
            border-radius: 3px;
          }

          .stat-label {
            color: #ccc;
          }

          .stat-value {
            color: #fff;
            font-weight: bold;
          }

          .events-container {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          .events-container h3 {
            margin: 0;
            padding: 15px;
            background: #2a2a2a;
            border-bottom: 1px solid #333;
            color: #fff;
          }

          .loading, .no-events {
            padding: 20px;
            text-align: center;
            color: #ccc;
          }

          .events-list {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
          }

          .event-item {
            background: #2a2a2a;
            border: 1px solid #333;
            border-left: 4px solid;
            border-radius: 5px;
            margin-bottom: 10px;
            padding: 10px;
          }

          .event-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding-bottom: 5px;
            border-bottom: 1px solid #444;
          }

          .event-type {
            font-weight: bold;
            color: #fff;
          }

          .event-time {
            color: #888;
            font-size: 11px;
          }

          .event-details {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          .event-details > div {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
          }

          .event-details strong {
            color: #fff;
            min-width: 120px;
          }

          .event-details span {
            color: #ccc;
            background: #333;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
          }

          .ball-positions, .paddle-position, .collision-info, .event-metadata {
            flex-direction: column;
            align-items: flex-start;
          }

          .ball-positions > span, .paddle-position > span, .collision-info > span, .event-metadata > span {
            margin-left: 120px;
          }
        `}</style>
      </div>
    </div>
  );
} 