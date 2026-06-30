// src/components/GameLogViewer.tsx
import React, { useState, useEffect } from 'react';
import { gameLogger } from '../storage/gameLogger';

interface GameEvent {
  id: string;
  timestamp: number;
  type: 'game_start' | 'game_end' | 'score_update' | 'ball_lost' | 'ball_added' | 'brick_destroyed' | 'brick_added' | 'paddle_move' | 'collision' | 'power_up' | 'level_complete' | 'game_state_change' | 'restart_game';
  gameState: {
    score: number;
    ballsCount: number;
    bricksRemaining: number;
    gameWon: boolean;
    gameOver: boolean;
    level: number;
    canvasSize: { width: number; height: number };
    gameDimensions: {
      brickWidth: number;
      brickHeight: number;
      brickCols: number;
      brickRows: number;
      paddleWidth: number;
      paddleHeight: number;
      ballRadius: number;
    };
  };
  ballPositions: Array<{
    x: number;
    y: number;
    velocity: { dx: number; dy: number };
    radius: number;
  }>;
  paddlePosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  collisionInfo?: {
    type: 'wall' | 'paddle' | 'brick' | 'ceiling';
    ballPosition: { x: number; y: number };
    targetPosition?: { x: number; y: number; width?: number; height?: number };
    brickIndex?: { col: number; row: number };
    brickColorIndex?: number;
    wallType?: 'left' | 'right';
    hitPosition?: number;
    collisionAngle?: number;
    velocityBefore?: { dx: number; dy: number };
    velocityAfter?: { dx: number; dy: number };
  };
  metadata?: Record<string, any>;
}

interface GameLogViewerProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const GameLogViewer: React.FC<GameLogViewerProps> = ({ isVisible = true, onClose }) => {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<any>(null);

  const eventTypeLabels: Record<string, string> = {
    'game_start': '🎮 Início do Jogo',
    'game_end': '🏁 Fim do Jogo',
    'score_update': '📊 Atualização de Pontuação',
    'ball_lost': '💀 Bola Perdida',
    'ball_added': '⚽ Bola Adicionada',
    'brick_destroyed': '🧱 Bloco Destruído',
    'brick_added': '🏗️ Bloco Adicionado',
    'paddle_move': '🏓 Movimento da Raquete',
    'collision': '💥 Colisão',
    'power_up': '⚡ Power-up',
    'level_complete': '🎯 Nível Completo',
    'game_state_change': '🔄 Mudança de Estado',
    'restart_game': '🔄 Reiniciar Jogo'
  };

  const eventTypeColors: Record<string, string> = {
    'game_start': '#4CAF50',
    'game_end': '#F44336',
    'score_update': '#2196F3',
    'ball_lost': '#FF9800',
    'ball_added': '#9C27B0',
    'brick_destroyed': '#FF5722',
    'brick_added': '#795548',
    'paddle_move': '#607D8B',
    'collision': '#E91E63',
    'power_up': '#00BCD4',
    'level_complete': '#8BC34A',
    'game_state_change': '#FFC107',
    'restart_game': '#9E9E9E'
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const allEvents = await gameLogger.getAllEvents();
      setEvents(allEvents);

      const gameStats = await gameLogger.getGameStats();
      setStats(gameStats);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearEvents = async () => {
    if (window.confirm('Tem certeza que deseja limpar todos os logs?')) {
      try {
        await gameLogger.clearAllEvents();
        setEvents([]);
        setStats(null);
      } catch (error) {
        console.error('Erro ao limpar eventos:', error);
      }
    }
  };

  const exportData = async () => {
    try {
      const jsonData = await gameLogger.exportGameData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brickbreaker-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
  };

  const toggleDetails = (eventId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const formatPosition = (pos: { x: number; y: number }) => {
    return `(${Math.round(pos.x)}, ${Math.round(pos.y)})`;
  };

  const formatVelocity = (vel: { dx: number; dy: number }) => {
    return `(${vel.dx.toFixed(2)}, ${vel.dy.toFixed(2)})`;
  };

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(event => event.type === filter);

  useEffect(() => {
    loadEvents();
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="game-log-viewer">
      {onClose && (
        <button onClick={onClose} className="close-button">
          ✕ Fechar
        </button>
      )}
      <div className="header">
        <h2>📊 Visualizador de Logs do Jogo</h2>
        <div className="controls">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos os Eventos</option>
            {Object.entries(eventTypeLabels).map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
          <button onClick={loadEvents} className="refresh-button">
            🔄 Atualizar
          </button>
          <button onClick={exportData} className="export-button">
            📤 Exportar
          </button>
          <button onClick={clearEvents} className="clear-button">
            🗑️ Limpar
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats-panel">
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
              <span className="stat-label">Pontuação Média:</span>
              <span className="stat-value">{stats.averageScore.toFixed(0)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Jogos Vencidos:</span>
              <span className="stat-value">{stats.gamesWon}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Jogos Perdidos:</span>
              <span className="stat-value">{stats.gamesLost}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Duração Média:</span>
              <span className="stat-value">{Math.round(stats.averageGameDuration / 1000)}s</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Blocos Destruídos:</span>
              <span className="stat-value">{stats.totalBricksDestroyed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total de Colisões:</span>
              <span className="stat-value">{stats.totalCollisions}</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="events-container">
          {filteredEvents.length === 0 ? (
            <div className="no-events">Nenhum evento encontrado</div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="event-item"
                style={{ borderLeftColor: eventTypeColors[event.type] }}
              >
                <div className="event-header" onClick={() => toggleDetails(event.id)}>
                  <div className="event-type">
                    <span className="event-icon">
                      {eventTypeLabels[event.type].split(' ')[0]}
                    </span>
                    <span className="event-label">
                      {eventTypeLabels[event.type]}
                    </span>
                  </div>
                  <div className="event-time">
                    {formatTimestamp(event.timestamp)}
                  </div>
                  <div className="event-score">
                    Pontuação: {event.gameState.score}
                  </div>
                  <div className="event-balls">
                    Bolas: {event.gameState.ballsCount}
                  </div>
                  <div className="event-bricks">
                    Blocos: {event.gameState.bricksRemaining}
                  </div>
                </div>

                {showDetails[event.id] && (
                  <div className="event-details">
                    <div className="detail-section">
                      <h4>🎮 Estado do Jogo</h4>
                      <div className="detail-grid">
                        <div>Pontuação: {event.gameState.score}</div>
                        <div>Bolas: {event.gameState.ballsCount}</div>
                        <div>Blocos Restantes: {event.gameState.bricksRemaining}</div>
                        <div>Nível: {event.gameState.level}</div>
                        <div>Vitória: {event.gameState.gameWon ? 'Sim' : 'Não'}</div>
                        <div>Game Over: {event.gameState.gameOver ? 'Sim' : 'Não'}</div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>📐 Dimensões</h4>
                      <div className="detail-grid">
                        <div>Canvas: {event.gameState.canvasSize.width}x{event.gameState.canvasSize.height}</div>
                        <div>Blocos: {event.gameState.gameDimensions.brickCols}x{event.gameState.gameDimensions.brickRows}</div>
                        <div>Tamanho Bloco: {event.gameState.gameDimensions.brickWidth}x{event.gameState.gameDimensions.brickHeight}</div>
                        <div>Raquete: {event.gameState.gameDimensions.paddleWidth}x{event.gameState.gameDimensions.paddleHeight}</div>
                        <div>Raio Bola: {event.gameState.gameDimensions.ballRadius}</div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>⚽ Posições das Bolas</h4>
                      {event.ballPositions.map((ball, index) => (
                        <div key={index} className="ball-info">
                          <div>Bola {index + 1}:</div>
                          <div>Posição: {formatPosition(ball)}</div>
                          <div>Velocidade: {formatVelocity(ball.velocity)}</div>
                          <div>Raio: {ball.radius}</div>
                        </div>
                      ))}
                    </div>

                    <div className="detail-section">
                      <h4>🏓 Posição da Raquete</h4>
                      <div className="detail-grid">
                        <div>Posição: {formatPosition(event.paddlePosition)}</div>
                        <div>Tamanho: {event.paddlePosition.width}x{event.paddlePosition.height}</div>
                      </div>
                    </div>

                    {event.collisionInfo && (
                      <div className="detail-section">
                        <h4>💥 Informações de Colisão</h4>
                        <div className="detail-grid">
                          <div>Tipo: {event.collisionInfo.type}</div>
                          {event.collisionInfo.wallType && (
                            <div>Parede: {event.collisionInfo.wallType}</div>
                          )}
                          {event.collisionInfo.hitPosition !== undefined && (
                            <div>Posição do Hit: {(event.collisionInfo.hitPosition * 100).toFixed(1)}%</div>
                          )}
                          {event.collisionInfo.brickIndex && (
                            <div>Bloco: [{event.collisionInfo.brickIndex.col}, {event.collisionInfo.brickIndex.row}]</div>
                          )}
                          {event.collisionInfo.brickColorIndex !== undefined && (
                            <div>Cor do Bloco: {event.collisionInfo.brickColorIndex}</div>
                          )}
                          {event.collisionInfo.velocityBefore && (
                            <div>Velocidade Antes: {formatVelocity(event.collisionInfo.velocityBefore)}</div>
                          )}
                          {event.collisionInfo.velocityAfter && (
                            <div>Velocidade Depois: {formatVelocity(event.collisionInfo.velocityAfter)}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="detail-section">
                        <h4>📋 Metadados</h4>
                        <pre className="metadata-json">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .game-log-viewer {
          width: 100%;
          max-width: 1200px;
          max-height: calc(100dvh - 24px);
          margin: 16px auto 0;
          padding: 16px;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
          color: #1a1a1a;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .close-button {
          min-width: 44px;
          min-height: 44px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          color: #1a1a1a;
          background: white;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .header h2 {
          color: #1a1a1a;
        }

        .controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-select, .refresh-button, .export-button, .clear-button {
          min-height: 44px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }

        .refresh-button:hover, .export-button:hover, .clear-button:hover {
          background: #f0f0f0;
        }

        .stats-panel {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: white;
          border-radius: 4px;
          border-left: 4px solid #007bff;
        }

        .stat-label {
          font-weight: bold;
          color: #666;
        }

        .stat-value {
          font-size: 1.1em;
          color: #333;
        }

        .events-container {
          max-height: min(600px, 55dvh);
          overflow-y: auto;
          overflow-x: hidden;
        }

        .event-item {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #ddd;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          cursor: pointer;
          flex-wrap: wrap;
          gap: 10px;
        }

        .event-header:hover {
          background: #f8f9fa;
        }

        .event-type {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 200px;
        }

        .event-icon {
          font-size: 1.2em;
        }

        .event-label {
          font-weight: bold;
        }

        .event-time, .event-score, .event-balls, .event-bricks {
          font-size: 0.9em;
          color: #666;
        }

        .event-details {
          padding: 20px;
          border-top: 1px solid #eee;
          background: #f8f9fa;
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-section h4 {
          margin: 0 0 10px 0;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .ball-info {
          background: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .metadata-json {
          background: #f1f1f1;
          padding: 10px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          overflow-x: auto;
          white-space: pre-wrap;
        }

        .loading, .no-events {
          text-align: center;
          padding: 40px;
          color: #666;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .close-button {
          min-width: 44px;
          min-height: 44px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }

        .header {
            flex-direction: column;
            align-items: stretch;
          }

          .controls {
            justify-content: center;
          }

          .filter-select, .refresh-button, .export-button, .clear-button {
            flex: 1 1 140px;
          }

          .event-header {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default GameLogViewer;
