// src/components/GameLogViewer.tsx
import React, { useState, useEffect } from 'react';
import {
  gameLogger,
  type GameEvent,
  type GameStatsSummary
} from '../storage/gameLogger';
import { useI18n } from '../i18n';

interface GameLogViewerProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const GameLogViewer: React.FC<GameLogViewerProps> = ({ isVisible = true, onClose }) => {
  const { locale, t } = useI18n();
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<GameStatsSummary | null>(null);

  const eventTypeLabels: Record<string, string> = {
    'game_start': t("logs.event.game_start"),
    'game_end': t("logs.event.game_end"),
    'score_update': t("logs.event.score_update"),
    'ball_lost': t("logs.event.ball_lost"),
    'ball_added': t("logs.event.ball_added"),
    'brick_destroyed': t("logs.event.brick_destroyed"),
    'brick_added': t("logs.event.brick_added"),
    'paddle_move': t("logs.event.paddle_move"),
    'collision': t("logs.event.collision"),
    'power_up': t("logs.event.power_up"),
    'level_complete': t("logs.event.level_complete"),
    'level_start': t("logs.event.level_start"),
    'game_state_change': t("logs.event.game_state_change"),
    'restart_game': t("logs.event.restart_game")
  };

  const eventTypeColors: Record<string, string> = {
    'game_start': 'var(--bb-color-primary)',
    'game_end': 'var(--bb-color-danger)',
    'score_update': 'var(--bb-color-primary-strong)',
    'ball_lost': 'var(--bb-color-secondary)',
    'ball_added': 'var(--bb-color-tertiary)',
    'brick_destroyed': 'var(--bb-color-secondary)',
    'brick_added': 'var(--bb-color-outline)',
    'paddle_move': 'var(--bb-color-outline)',
    'collision': 'var(--bb-color-secondary)',
    'power_up': 'var(--bb-color-primary)',
    'level_complete': 'var(--bb-color-primary-strong)',
    'level_start': 'var(--bb-color-primary)',
    'game_state_change': 'var(--bb-color-tertiary)',
    'restart_game': 'var(--bb-color-muted)'
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const allEvents = await gameLogger.getAllEvents();
      setEvents(allEvents);

      const gameStats = await gameLogger.getGameStats();
      setStats(gameStats);
    } catch (error) {
      console.error(t("logs.loadError"), error);
    } finally {
      setLoading(false);
    }
  };

  const clearEvents = async () => {
    if (window.confirm(t("logs.clearConfirm"))) {
      try {
        await gameLogger.clearAllEvents();
        setEvents([]);
        setStats(null);
      } catch (error) {
        console.error(t("logs.clearError"), error);
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
      a.download = `brikaya-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(t("logs.exportError"), error);
    }
  };

  const toggleDetails = (eventId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(locale);
  };

  const formatPosition = (pos: { x: number; y: number }) => {
    return `(${Math.round(pos.x)}, ${Math.round(pos.y)})`;
  };

  const formatVelocity = (vel: { dx: number; dy: number }) => {
    return `(${vel.dx.toFixed(2)}, ${vel.dy.toFixed(2)})`;
  };

  const formatSpeed = (speed: number) => {
    return speed.toFixed(3);
  };

  const formatElapsedLevelMs = (elapsedLevelMs: number) => {
    return `${(elapsedLevelMs / 1000).toFixed(2)}s`;
  };

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(event => event.type === filter);

  useEffect(() => {
    if (!isVisible) return;

    loadEvents();
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="game-log-viewer">
      {onClose && (
        <button onClick={onClose} className="close-button">
          ✕ {t("logs.close")}
        </button>
      )}
      <div className="header">
        <h2>📊 {t("logs.title")}</h2>
        <div className="controls">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t("logs.allEvents")}</option>
            {Object.entries(eventTypeLabels).map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
          <button onClick={loadEvents} className="refresh-button">
            🔄 {t("logs.refresh")}
          </button>
          <button onClick={exportData} className="export-button">
            📤 {t("logs.export")}
          </button>
          <button onClick={clearEvents} className="clear-button">
            🗑️ {t("logs.clear")}
          </button>
        </div>
      </div>

      {stats && (
        <div className="stats-panel">
          <h3>📈 {t("logs.statsTitle")}</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">{t("logs.totalGames")}</span>
              <span className="stat-value">{stats.totalGames}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t("logs.totalEvents")}</span>
              <span className="stat-value">{stats.totalEvents}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t("logs.averageScore")}</span>
              <span className="stat-value">{stats.averageScore.toFixed(0)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t("logs.gamesWon")}</span>
              <span className="stat-value">{stats.gamesWon}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t("logs.gamesLost")}</span>
              <span className="stat-value">{stats.gamesLost}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t("logs.averageDuration")}</span>
              <span className="stat-value">{Math.round(stats.averageGameDuration / 1000)}s</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t("logs.totalBricks")}</span>
              <span className="stat-value">{stats.totalBricksDestroyed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t("logs.totalCollisions")}</span>
              <span className="stat-value">{stats.totalCollisions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t("logs.latestSpeed")}</span>
              <span className="stat-value">
                {stats.latestSpeedState ? formatSpeed(stats.latestSpeedState.currentSpeed) : '—'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Reduções Aplicadas:</span>
              <span className="stat-value">{stats.totalSpeedReductions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mínimo Atingido:</span>
              <span className="stat-value">{stats.minSpeedReachedCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tempo Médio da Fase:</span>
              <span className="stat-value">{formatElapsedLevelMs(stats.averageLevelDurationMs)}</span>
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
            filteredEvents.map((event) => {
              const speedReduction = event.metadata?.speedReduction as
                | {
                    speedBefore: number;
                    speedAfter: number;
                    reductionApplied: number;
                    hitNumber: number;
                    minReached: boolean;
                  }
                | undefined;

              return (
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
                        <div>{t("logs.speed.current")}: {formatSpeed(event.gameState.speedState.currentSpeed)}</div>
                        <div>{t("logs.speed.max")}: {formatSpeed(event.gameState.speedState.maxSpeed)}</div>
                        <div>{t("logs.speed.min")}: {formatSpeed(event.gameState.speedState.minSpeed)}</div>
                        <div>{t("logs.speed.reduction")}: {formatSpeed(event.gameState.speedState.reductionPerBrick)}</div>
                        <div>{t("logs.speed.hits")}: {event.gameState.speedState.successfulBrickHits}</div>
                        <div>{t("logs.speed.time")}: {formatElapsedLevelMs(event.gameState.speedState.elapsedLevelMs)}</div>
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
                        {speedReduction && (
                          <div className="detail-grid">
                            <div>Velocidade Antes: {formatSpeed(speedReduction.speedBefore)}</div>
                            <div>Velocidade Depois: {formatSpeed(speedReduction.speedAfter)}</div>
                            <div>Redução Aplicada: {formatSpeed(speedReduction.reductionApplied)}</div>
                            <div>Hit nº: {speedReduction.hitNumber}</div>
                            <div>Mínimo Atingido: {speedReduction.minReached ? 'Sim' : 'Não'}</div>
                          </div>
                        )}
                        <pre className="metadata-json">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
            })
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
          font-family: var(--bb-font-body);
          color: var(--bb-color-text);
          background: var(--bb-color-panel);
          border-radius: 8px;
        }

        .close-button {
          min-width: 44px;
          min-height: 44px;
          padding: 8px 12px;
          border: 1px solid var(--bb-color-outline-soft);
          border-radius: 4px;
          cursor: pointer;
          color: var(--bb-color-text);
          background: var(--bb-color-surface);
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
          color: var(--bb-color-text);
        }

        .controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-select, .refresh-button, .export-button, .clear-button {
          min-height: 44px;
          padding: 8px 12px;
          border: 1px solid var(--bb-color-outline-soft);
          border-radius: 4px;
          background: var(--bb-color-surface);
          cursor: pointer;
        }

        .refresh-button:hover, .export-button:hover, .clear-button:hover {
          background: var(--bb-color-panel-soft);
        }

        .stats-panel {
          background: var(--bb-color-panel);
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
          background: var(--bb-color-surface);
          border-radius: 4px;
          border-left: 4px solid var(--bb-color-primary);
        }

        .stat-label {
          font-weight: bold;
          color: var(--bb-color-muted);
        }

        .stat-value {
          font-size: 1.1em;
          color: var(--bb-color-text);
        }

        .events-container {
          max-height: min(600px, 55dvh);
          overflow-y: auto;
          overflow-x: hidden;
        }

        .event-item {
          background: var(--bb-color-surface);
          border: 1px solid var(--bb-color-outline-soft);
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid var(--bb-color-outline-soft);
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
          background: var(--bb-color-panel);
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
          color: var(--bb-color-muted);
        }

        .event-details {
          padding: 20px;
          border-top: 1px solid var(--bb-color-outline-soft);
          background: var(--bb-color-panel);
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-section h4 {
          margin: 0 0 10px 0;
          color: var(--bb-color-text);
          border-bottom: 1px solid var(--bb-color-outline-soft);
          padding-bottom: 5px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .ball-info {
          background: var(--bb-color-surface);
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .metadata-json {
          background: var(--bb-color-surface);
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
          color: var(--bb-color-muted);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .close-button {
          min-width: 44px;
          min-height: 44px;
          padding: 8px 12px;
          border: 1px solid var(--bb-color-outline-soft);
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
