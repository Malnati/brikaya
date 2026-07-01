// src/logic/GameEngine.ts
import { Paddle } from '../objects/Paddle';
import { Ball } from '../objects/Ball';
import { Bricks } from '../objects/Bricks';
import {
  GAME_COLOR,
  LEVEL_CLEAR_PAUSE_MS,
  LevelTransitionPayload,
  PhaseSpeedConfig,
  SpeedReductionSnapshot,
  SpeedStateSnapshot,
  calculateDynamicDimensions,
  calculateLevelMaxSpeed,
  calculateLevelMinSpeed,
  calculateLevelPreviousMaxSpeed,
  calculateLevelSpeedMultiplier,
  calculateSpeedReductionPerBrick,
  DynamicGameDimensions
} from '../constants/game';
import { POINTS_PER_BRICK } from '../constants/gameState';
import { AssetLoader } from '../utils/assetLoader';
import { gameLogger } from '../storage/gameLogger';
import { LOG, ERROR, WARN } from '../utils/logger';

LOG('📦 GameEngine.ts carregado, gameLogger:', gameLogger);

const ERROR_NO_2D_CONTEXT = 'No 2D context';

interface CanvasSize {
  width: number;
  height: number;
}

export type GameQaScenario = 'single-brick-phase-clear';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private animationFrame = 0;
  private paddle: Paddle;
  private balls: Ball[] = [];
  private bricks: Bricks;
  private score = 0;
  private assetsLoaded = false;
  private gameWon = false;
  private gameOver = false;
  private canvasSize: CanvasSize;
  private dimensions: DynamicGameDimensions;
  private scaleX = 1;
  private scaleY = 1;
  private isStopped = true;
  private isTouching = false;
  private isLevelTransitioning = false;
  private levelTransitionTimer: ReturnType<typeof setTimeout> | null = null;
  private level = 1;
  private levelStartedAt = Date.now();
  private initialBrickCount = 0;
  private latestSpeedReduction: SpeedReductionSnapshot | null = null;
  private phaseSpeedConfig: PhaseSpeedConfig | null = null;
  private qaScenarioConsumed = false;
  private readonly handleKeyDown = (event: KeyboardEvent) => this.paddle.onKeyDown(event);
  private readonly handleKeyUp = (event: KeyboardEvent) => this.paddle.onKeyUp(event);
  private readonly handleTouchStart = (event: TouchEvent) => this.onTouchStart(event);
  private readonly handleTouchMove = (event: TouchEvent) => this.onTouchMove(event);
  private readonly handleTouchEnd = (event: TouchEvent) => this.onTouchEnd(event);

  private maxBrickRows = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private onScoreUpdate: (score: number) => void,
    _onGameWon?: () => void,
    private onGameOver?: () => void,
    canvasSize?: CanvasSize,
    private onLevelTransition?: (payload: LevelTransitionPayload) => void,
    private qaScenario?: GameQaScenario | null
  ) {
    LOG(`🚀 GameEngine constructor iniciado`);

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error(ERROR_NO_2D_CONTEXT);
    this.ctx = ctx;

    LOG(`🎯 Canvas context obtido`);

    // Usar tamanho do canvas atual se não fornecido
    this.canvasSize = canvasSize || { width: canvas.width, height: canvas.height };

    LOG(`📏 Canvas size: ${this.canvasSize.width}x${this.canvasSize.height}`);

    // Calcular dimensões dinâmicas baseadas no tamanho do canvas
    this.dimensions = this.createDimensions(this.canvasSize.width, this.canvasSize.height);

    LOG(`📐 Dimensões calculadas: ${this.dimensions.brickCols} colunas x ${this.dimensions.brickRows} linhas`);
    LOG(`📐 Tamanho dos blocos: ${this.dimensions.brickWidth}x${this.dimensions.brickHeight}`);

    // Calcular escala para manter proporções
    this.scaleX = this.canvasSize.width / 480; // CANVAS_WIDTH original
    this.scaleY = this.canvasSize.height / 320; // CANVAS_HEIGHT original

    LOG(`⚽ Criando Ball...`);
    this.paddle = new Paddle(this.canvasSize.width, this.canvasSize.height, this.dimensions);
    this.balls.push(new Ball(
      this.canvasSize.width,
      this.canvasSize.height,
      this.dimensions,
      calculateLevelSpeedMultiplier(this.level)
    ));
    this.prepareQaBall();

    LOG(`🏗️  Criando Bricks...`);
    this.configureBrickRows();
    this.bricks = this.createBricks();
    this.startLevelSpeedTracking(this.level);

    LOG(`🎮 GameEngine constructor finalizado`);
    this.setupListeners();
  }

  private createDimensions(canvasWidth: number, canvasHeight: number): DynamicGameDimensions {
    const dimensions = calculateDynamicDimensions(canvasWidth, canvasHeight);
    if (this.qaScenario === 'single-brick-phase-clear' && !this.qaScenarioConsumed) {
      return {
        ...dimensions,
        brickCols: 1,
        brickRows: 1,
        brickWidth: Math.min(96, Math.max(56, canvasWidth * 0.24)),
        brickHeight: Math.min(28, Math.max(18, canvasHeight * 0.05)),
        brickPadding: 8,
        brickOffsetTop: Math.max(24, canvasHeight * 0.12),
        brickOffsetLeft: (canvasWidth - Math.min(96, Math.max(56, canvasWidth * 0.24))) / 2
      };
    }

    return dimensions;
  }

  private configureBrickRows() {
    const availableHeight =
      this.canvasSize.height -
      this.dimensions.paddleHeight -
      this.dimensions.brickOffsetTop;
    const computedRows = Math.floor(
      availableHeight / (this.dimensions.brickHeight + this.dimensions.brickPadding)
    );
    this.maxBrickRows = Math.max(this.dimensions.brickRows, computedRows);
  }

  private createBricks(): Bricks {
    return new Bricks(
      this.dimensions,
      this.onBrickDestroyed.bind(this),
      this.maxBrickRows
    );
  }

  private prepareQaBall() {
    if (this.qaScenario !== 'single-brick-phase-clear' || this.qaScenarioConsumed || this.balls.length === 0) return;

    const ball = this.balls[0];
    const targetX = this.dimensions.brickOffsetLeft + this.dimensions.brickWidth / 2;
    const targetY = this.dimensions.brickOffsetTop + this.dimensions.brickHeight + ball.position.radius - 1;
    ball.setPosition(targetX, targetY);
    ball.setDirection(0);
  }

  private async preloadAssets() {
    try {
      LOG('🎮 Iniciando carregamento de assets...');
      await AssetLoader.preloadAllAssets();
      this.assetsLoaded = true;
      LOG('✅ Assets carregados com sucesso!');
    } catch (error) {
      WARN('⚠️  Alguns assets falharam ao carregar, usando fallback:', error);
      this.assetsLoaded = true; // Continue with fallback rendering
    }
  }

  private async onBrickDestroyed() {
    this.score += POINTS_PER_BRICK;
    this.onScoreUpdate(this.score);
    this.latestSpeedReduction = this.getLatestSpeedReductionFromBalls();

    LOG(`🎯 onBrickDestroyed: Score = ${this.score}, Verificando se todos os blocos foram destruídos...`);

    // Log do evento de pontuação
    const gameState = this.getCurrentGameState();
    const ballPositions = this.getBallPositions();
    const paddlePosition = this.paddle.position;

    await gameLogger.logScoreUpdate(
      gameState,
      ballPositions,
      paddlePosition,
      POINTS_PER_BRICK,
      'brick_destroyed',
      this.latestSpeedReduction
    ).catch(error => ERROR('❌ Erro ao registrar pontuação:', error));

    // Verificar se todos os blocos foram destruídos
    if (this.bricks.isAllDestroyed() && !this.isLevelTransitioning) {
      await this.startLevelTransition(gameState, ballPositions, paddlePosition);
    }
  }

  private async startLevelTransition(
    gameState: ReturnType<GameEngine['getCurrentGameState']>,
    ballPositions: ReturnType<GameEngine['getBallPositions']>,
    paddlePosition: { x: number; y: number; width: number; height: number }
  ) {
    this.isLevelTransitioning = true;
    const currentLevel = this.level;
    const nextLevel = currentLevel + 1;
    const nextSpeedMultiplier = calculateLevelSpeedMultiplier(nextLevel);
    const nextInitialBrickCount = this.getExpectedInitialBrickCountForLevel(nextLevel);
    const nextMaxSpeed = calculateLevelMaxSpeed(this.canvasSize.width, nextLevel);
    const nextMinSpeed = calculateLevelMinSpeed(this.canvasSize.width, nextLevel);
    const nextReductionPerBrick = calculateSpeedReductionPerBrick(nextMaxSpeed, nextInitialBrickCount);
    const payload: LevelTransitionPayload = {
      currentLevel,
      nextLevel,
      nextSpeedMultiplier,
      pauseMs: LEVEL_CLEAR_PAUSE_MS,
      nextMaxSpeed,
      nextMinSpeed,
      nextReductionPerBrick,
      nextInitialBrickCount
    };

    await gameLogger.logLevelComplete(
      gameState,
      ballPositions,
      paddlePosition,
      currentLevel,
      nextLevel,
      nextSpeedMultiplier,
      LEVEL_CLEAR_PAUSE_MS,
      {
        nextMaxSpeed,
        nextMinSpeed,
        nextReductionPerBrick,
        nextInitialBrickCount
      }
    ).catch(error => ERROR('❌ Erro ao registrar fase concluída:', error));

    this.onLevelTransition?.(payload);

    this.levelTransitionTimer = setTimeout(() => {
      void this.finishLevelTransition(nextLevel, nextSpeedMultiplier);
    }, LEVEL_CLEAR_PAUSE_MS);
  }

  private async finishLevelTransition(nextLevel: number, nextSpeedMultiplier: number) {
    this.level = nextLevel;
    if (this.qaScenario === 'single-brick-phase-clear' && !this.qaScenarioConsumed) {
      this.qaScenarioConsumed = true;
      this.dimensions = this.createDimensions(this.canvasSize.width, this.canvasSize.height);
      this.configureBrickRows();
    }
    this.paddle.reset();
    this.balls = [new Ball(
      this.canvasSize.width,
      this.canvasSize.height,
      this.dimensions,
      nextSpeedMultiplier
    )];
    this.prepareQaBall();
    this.bricks = this.createBricks();
    this.startLevelSpeedTracking(nextLevel);
    this.isLevelTransitioning = false;

    const gameState = this.getCurrentGameState();
    await gameLogger.logLevelStart(
      gameState,
      this.getBallPositions(),
      this.paddle.position,
      nextLevel,
      nextSpeedMultiplier
    ).catch(error => ERROR('❌ Erro ao registrar início de fase:', error));
  }

  private getRemainingBricksCount(): number {
    let count = 0;
    for (let c = 0; c < this.dimensions.brickCols; c++) {
      for (let r = 0; r < this.bricks.getRows(); r++) {
        if (this.bricks.isBrickActive(c, r)) {
          count++;
        }
      }
    }
    return count;
  }

  private getCurrentGameState() {
    return {
      score: this.score,
      ballsCount: this.balls.length,
      bricksRemaining: this.getRemainingBricksCount(),
      gameWon: this.gameWon,
      gameOver: this.gameOver,
      level: this.level,
      canvasSize: this.canvasSize,
      gameDimensions: {
        brickWidth: this.dimensions.brickWidth,
        brickHeight: this.dimensions.brickHeight,
        brickCols: this.dimensions.brickCols,
        brickRows: this.dimensions.brickRows,
        paddleWidth: this.dimensions.paddleWidth,
        paddleHeight: this.dimensions.paddleHeight,
        ballRadius: this.dimensions.ballRadius
      },
      speedState: this.buildSpeedStateSnapshot()
    };
  }

  private getBallPositions() {
    return this.balls.map(ball => ({
      x: ball.position.x,
      y: ball.position.y,
      velocity: ball.getVelocity(),
      radius: ball.position.radius
    }));
  }

  private getInitialBrickCount(): number {
    return Math.max(1, this.getRemainingBricksCount());
  }

  private getElapsedLevelMs(): number {
    return Math.max(0, Date.now() - this.levelStartedAt);
  }

  private buildPhaseSpeedConfig(level: number, initialBrickCount: number, levelStartedAt: number): PhaseSpeedConfig {
    const maxSpeed = calculateLevelMaxSpeed(this.canvasSize.width, level);
    return {
      level,
      initialBrickCount,
      maxSpeed,
      minSpeed: calculateLevelMinSpeed(this.canvasSize.width, level),
      reductionPerBrick: calculateSpeedReductionPerBrick(maxSpeed, initialBrickCount),
      previousLevelMaxSpeed: calculateLevelPreviousMaxSpeed(this.canvasSize.width, level),
      levelStartedAt
    };
  }

  private startLevelSpeedTracking(level: number) {
    this.levelStartedAt = Date.now();
    this.initialBrickCount = this.getInitialBrickCount();
    this.latestSpeedReduction = null;
    this.phaseSpeedConfig = this.buildPhaseSpeedConfig(level, this.initialBrickCount, this.levelStartedAt);
    this.balls.forEach(ball => ball.applyPhaseSpeedConfig(this.phaseSpeedConfig!));
  }

  private getLatestSpeedReductionFromBalls(): SpeedReductionSnapshot | null {
    for (const ball of this.balls) {
      const speedReduction = ball.getLastSpeedReduction();
      if (speedReduction) {
        return speedReduction;
      }
    }

    return null;
  }

  private buildSpeedStateSnapshot(): SpeedStateSnapshot {
    const activeBall = this.balls[0];
    if (activeBall) {
      return activeBall.getSpeedStateSnapshot();
    }

    const fallbackConfig = this.phaseSpeedConfig ?? this.buildPhaseSpeedConfig(
      this.level,
      Math.max(1, this.initialBrickCount || this.dimensions.brickCols * this.dimensions.brickRows),
      this.levelStartedAt
    );
    const currentSpeed = this.latestSpeedReduction?.speedAfter ?? fallbackConfig.maxSpeed;

    return {
      level: fallbackConfig.level,
      initialBrickCount: fallbackConfig.initialBrickCount,
      successfulBrickHits: this.latestSpeedReduction?.hitNumber ?? 0,
      maxSpeed: fallbackConfig.maxSpeed,
      minSpeed: fallbackConfig.minSpeed,
      currentSpeed,
      reductionPerBrick: fallbackConfig.reductionPerBrick,
      previousLevelMaxSpeed: fallbackConfig.previousLevelMaxSpeed,
      levelStartedAt: fallbackConfig.levelStartedAt,
      elapsedLevelMs: this.getElapsedLevelMs(),
      minReached: currentSpeed <= fallbackConfig.minSpeed
    };
  }

  private getExpectedInitialBrickCountForLevel(level: number): number {
    if (this.qaScenario === 'single-brick-phase-clear' && !this.qaScenarioConsumed && level > this.level) {
      const previewDimensions = calculateDynamicDimensions(this.canvasSize.width, this.canvasSize.height);
      return previewDimensions.brickCols * previewDimensions.brickRows;
    }

    return this.dimensions.brickCols * this.dimensions.brickRows;
  }

  private setupListeners() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
  }

  private removeListeners() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }

  private onTouchStart(event: TouchEvent) {
    event.preventDefault();
    this.isTouching = true;
  }

  private onTouchMove(event: TouchEvent) {
    event.preventDefault();
    if (!this.isTouching) return;

    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const canvasX = (touchX / rect.width) * this.canvasSize.width;
    this.paddle.setPosition(canvasX);
  }

  private onTouchEnd(event: TouchEvent) {
    event.preventDefault();
    this.isTouching = false;
  }

  public async start() {
    this.isStopped = false;
    LOG('🎮 GameEngine.start() chamado - INÍCIO');
    LOG('🎮 this:', this);
    LOG('🎮 gameLogger:', gameLogger);

    await this.preloadAssets();
    if (this.isStopped) return;

    // Aguardar GameLogger estar pronto
    LOG('⏳ Aguardando GameLogger estar pronto...');
    let attempts = 0;
    while (!gameLogger['db'] && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!gameLogger['db']) {
      ERROR('❌ GameLogger não inicializou após 5 segundos');
    } else {
      LOG('✅ GameLogger está pronto');
    }

    // Log do início do jogo
    const gameState = this.getCurrentGameState();
    const ballPositions = this.getBallPositions();
    const paddlePosition = this.paddle.position;

    LOG('📊 Preparando para registrar início do jogo...');
    LOG('📊 GameState:', gameState);
    LOG('📊 BallPositions:', ballPositions);
    LOG('📊 PaddlePosition:', paddlePosition);

    // Se já existe um gameId, é um restart
    if (gameLogger.getCurrentGameId()) {
      LOG('🔄 Detectado restart do jogo');
      await gameLogger.logRestartGame(
        gameState,
        ballPositions,
        paddlePosition
      ).catch(error => ERROR('❌ Erro ao registrar restart do jogo:', error));
    }

    LOG('🎮 Registrando início do jogo...');

    // Verificar se o GameLogger está pronto
    if (!gameLogger['db']) {
      WARN('⚠️ GameLogger ainda não inicializado, aguardando...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await gameLogger.logGameStart(
      gameState,
      ballPositions,
      paddlePosition
    ).then(() => {
      LOG('✅ Início do jogo registrado com sucesso!');
    }).catch(error => {
      ERROR('❌ Erro ao registrar início do jogo:', error);
    });

    if (!this.isStopped) {
      this.loop();
    }
  }

  public stop() {
    this.isStopped = true;
    this.isTouching = false;
    if (this.levelTransitionTimer) {
      clearTimeout(this.levelTransitionTimer);
      this.levelTransitionTimer = null;
    }
    cancelAnimationFrame(this.animationFrame);
    this.removeListeners();
  }

  private loop = async () => {
    if (this.isStopped) return;
    this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);

    if (!this.assetsLoaded) {
      // Show loading indicator
      this.ctx.fillStyle = GAME_COLOR;
      this.ctx.font = `${16 * Math.min(this.scaleX, this.scaleY)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Loading...', this.canvasSize.width / 2, this.canvasSize.height / 2);
    } else if (this.gameOver) {
      // Mostrar tela de fim de jogo
      this.ctx.fillStyle = '#ff4444';
      this.ctx.font = `${24 * Math.min(this.scaleX, this.scaleY)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('FIM DE JOGO!', this.canvasSize.width / 2, this.canvasSize.height / 2 - 20);
      this.ctx.font = `${16 * Math.min(this.scaleX, this.scaleY)}px Arial`;
      this.ctx.fillText(`Pontuação: ${this.score}`, this.canvasSize.width / 2, this.canvasSize.height / 2 + 10);
      this.ctx.fillText('Toque em "Restart Game" para jogar novamente', this.canvasSize.width / 2, this.canvasSize.height / 2 + 40);
    } else {
              // Normal game rendering
        try {
          this.bricks.draw(this.ctx);
          this.paddle.draw(this.ctx);
        if (this.isLevelTransitioning) {
          this.balls.forEach(ball => ball.draw(this.ctx));
        } else {
        for (let i = this.balls.length - 1; i >= 0; i--) {
          const ball = this.balls[i];

          // Atualizar posição da raquete antes de chamar ball.update
          this.paddle.update();

          const inPlay = await ball.update(this.paddle, this.bricks, this.canvasSize.height, this.getCurrentGameState());
          if (!inPlay) {
            this.balls.splice(i, 1);
            continue;
          }
          if (ball.consumePaddleCollision()) {
            // Colisão com raquete já foi consumida; não resetar hits da fase
            // porque a velocidade agora depende do total de blocos acertados.
          }
          ball.draw(this.ctx);
        }
        }
        if (this.balls.length === 0) {
          // Game over - no balls left
          this.gameOver = true;

          // Log da mudança de estado do jogo
          const gameState = this.getCurrentGameState();
          const ballPositions = this.getBallPositions();
          const paddlePosition = this.paddle.position;

          await gameLogger.logGameStateChange(
            gameState,
            ballPositions,
            paddlePosition,
            'game_over'
          ).catch(error => ERROR('❌ Erro ao registrar mudança de estado:', error));

          // Log do fim do jogo (derrota)
          await gameLogger.logGameEnd(
            gameState,
            ballPositions,
            paddlePosition,
            'lose'
          ).catch(error => ERROR('❌ Erro ao registrar derrota:', error));

          if (this.onGameOver) {
            this.onGameOver();
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'GAME_OVER') {
          this.gameOver = true;
          if (this.onGameOver) {
            this.onGameOver();
          }
        } else {
          ERROR('Erro durante o rendering:', error);
          throw error;
        }
      }
    }

    if (!this.isStopped) {
      this.animationFrame = requestAnimationFrame(this.loop);
    }
  };
}
