// src/logic/GameEngine.ts
import { Paddle } from '../objects/Paddle';
import { Ball } from '../objects/Ball';
import { Bricks } from '../objects/Bricks';
import { GAME_COLOR, calculateDynamicDimensions, DynamicGameDimensions } from '../constants/game';
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

  private maxBrickRows = 0;

  constructor(
    private canvas: HTMLCanvasElement, 
    private onScoreUpdate: (score: number) => void,
    private onGameWon?: () => void,
    private onGameOver?: () => void,
    canvasSize?: CanvasSize
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
    this.dimensions = calculateDynamicDimensions(this.canvasSize.width, this.canvasSize.height);
    
    LOG(`📐 Dimensões calculadas: ${this.dimensions.brickCols} colunas x ${this.dimensions.brickRows} linhas`);
    LOG(`📐 Tamanho dos blocos: ${this.dimensions.brickWidth}x${this.dimensions.brickHeight}`);
    
    // Calcular escala para manter proporções
    this.scaleX = this.canvasSize.width / 480; // CANVAS_WIDTH original
    this.scaleY = this.canvasSize.height / 320; // CANVAS_HEIGHT original
    
    LOG(`⚽ Criando Ball...`);
    this.paddle = new Paddle(this.canvasSize.width, this.canvasSize.height, this.dimensions);
    this.balls.push(new Ball(this.canvasSize.width, this.canvasSize.height, this.dimensions));
    
    LOG(`🏗️  Criando Bricks...`);
    const availableHeight =
      this.canvasSize.height -
      this.dimensions.paddleHeight -
      this.dimensions.brickOffsetTop;
    const computedRows = Math.floor(
      availableHeight / (this.dimensions.brickHeight + this.dimensions.brickPadding)
    );
    this.maxBrickRows = Math.max(this.dimensions.brickRows, computedRows);
    this.bricks = new Bricks(
      this.dimensions,
      this.onBrickDestroyed.bind(this),
      this.maxBrickRows
    );
    
    LOG(`🎮 GameEngine constructor finalizado`);
    this.setupListeners();
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
    
    LOG(`🎯 onBrickDestroyed: Score = ${this.score}, Verificando se todos os blocos foram destruídos...`);
    
    // Log do evento de pontuação
    const gameState = this.getCurrentGameState();
    const ballPositions = this.getBallPositions();
    const paddlePosition = this.paddle.position;
    
    // await gameLogger.logScoreUpdate(
    //   gameState,
    //   ballPositions,
    //   paddlePosition,
    //   POINTS_PER_BRICK,
    //   'brick_destroyed'
    // ).catch(error => ERROR('❌ Erro ao registrar pontuação:', error));
    
    // Verificar se todos os blocos foram destruídos
    if (this.bricks.isAllDestroyed() && !this.gameWon) {
      LOG(`🏆 GAME WON! Todos os blocos destruídos!`);
      this.gameWon = true;
      
      // Log da mudança de estado do jogo
      // // await gameLogger.logGameStateChange(
      //   gameState,
      //   ballPositions,
      //   paddlePosition,
      //   'game_won'
      // ).catch(error => ERROR('❌ Erro ao registrar mudança de estado:', error));
      
      // Log do fim do jogo (vitória)
      // // await gameLogger.logGameEnd(
      //   gameState,
      //   ballPositions,
      //   paddlePosition,
      //   'win'
      // ).catch(error => ERROR('❌ Erro ao registrar vitória:', error));
      
      if (this.onGameWon) {
        this.onGameWon();
      }
    }
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
      level: 1, // Por enquanto sempre nível 1, pode ser expandido no futuro
      canvasSize: this.canvasSize,
      gameDimensions: {
        brickWidth: this.dimensions.brickWidth,
        brickHeight: this.dimensions.brickHeight,
        brickCols: this.dimensions.brickCols,
        brickRows: this.dimensions.brickRows,
        paddleWidth: this.dimensions.paddleWidth,
        paddleHeight: this.dimensions.paddleHeight,
        ballRadius: this.dimensions.ballRadius
      }
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

  private setupListeners() {
    // Controles de teclado
    document.addEventListener('keydown', e => this.paddle.onKeyDown(e));
    document.addEventListener('keyup', e => this.paddle.onKeyUp(e));
    
    // Controles touch
    this.setupTouchControls();
  }

  private setupTouchControls() {
    let isTouching = false;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isTouching = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isTouching) return;
      
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      
      // Converter coordenadas da tela para coordenadas do canvas
      const canvasX = (touchX / rect.width) * this.canvasSize.width;
      
      // Mover paddle para a posição do touch
      this.paddle.setPosition(canvasX);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      isTouching = false;
    };

    this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  public async start() {
    LOG('🎮 GameEngine.start() chamado - INÍCIO');
    LOG('🎮 this:', this);
    LOG('🎮 gameLogger:', gameLogger);
    
    await this.preloadAssets();
    
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
    // if (this.currentGameId) {
    //   LOG('🔄 Detectado restart do jogo');
    //   await gameLogger.logRestartGame(
    //     gameState,
    //     ballPositions,
    //     paddlePosition
    //   ).catch(error => ERROR('❌ Erro ao registrar restart do jogo:', error));
    // }
    
    LOG('🎮 Registrando início do jogo...');
    
    // Verificar se o GameLogger está pronto
    if (!gameLogger['db']) {
      WARN('⚠️ GameLogger ainda não inicializado, aguardando...');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // await gameLogger.logGameStart(
    //   gameState,
    //   ballPositions,
    //   paddlePosition
    // ).then(() => {
    //   LOG('✅ Início do jogo registrado com sucesso!');
    // }).catch(error => {
    //   ERROR('❌ Erro ao registrar início do jogo:', error);
    // });
    
    this.loop();
  }

  public stop() {
    cancelAnimationFrame(this.animationFrame);
  }

  private loop = async () => {
    this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    
    if (!this.assetsLoaded) {
      // Show loading indicator
      this.ctx.fillStyle = GAME_COLOR;
      this.ctx.font = `${16 * Math.min(this.scaleX, this.scaleY)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Loading...', this.canvasSize.width / 2, this.canvasSize.height / 2);
    } else if (this.gameWon) {
      // Mostrar tela de vitória
      this.ctx.fillStyle = GAME_COLOR;
      this.ctx.font = `${24 * Math.min(this.scaleX, this.scaleY)}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('VITÓRIA!', this.canvasSize.width / 2, this.canvasSize.height / 2 - 20);
      this.ctx.font = `${16 * Math.min(this.scaleX, this.scaleY)}px Arial`;
      this.ctx.fillText(`Pontuação: ${this.score}`, this.canvasSize.width / 2, this.canvasSize.height / 2 + 10);
      this.ctx.fillText('Toque em "Restart Game" para jogar novamente', this.canvasSize.width / 2, this.canvasSize.height / 2 + 40);
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
        for (let i = this.balls.length - 1; i >= 0; i--) {
          const ball = this.balls[i];
          
          // Preparar estado do jogo para rastreamento de colisões
          const gameState = this.getCurrentGameState();
          
          // Atualizar posição da raquete antes de chamar ball.update
          this.paddle.update();
          
          const inPlay = await ball.update(this.paddle, this.bricks, this.canvasSize.height, this.getCurrentGameState());
          if (!inPlay) {
            this.balls.splice(i, 1);
            continue;
          }
          if (ball.consumePaddleCollision()) {
            // Apenas resetar o contador de hits, sem criar novas bolinhas
            ball.resetBrickHits();
          }
          ball.draw(this.ctx);
        }
        if (this.balls.length === 0) {
          // Game over - no balls left
          this.gameOver = true;
          
          // Log da mudança de estado do jogo
          const gameState = this.getCurrentGameState();
          const ballPositions = this.getBallPositions();
          const paddlePosition = this.paddle.position;
          
          // await gameLogger.logGameStateChange(
          //   gameState,
          //   ballPositions,
          //   paddlePosition,
          //   'game_over'
          // ).catch(error => ERROR('❌ Erro ao registrar mudança de estado:', error));
          
          // Log do fim do jogo (derrota)
          // await gameLogger.logGameEnd(
          //   gameState,
          //   ballPositions,
          //   paddlePosition,
          //   'lose'
          // ).catch(error => ERROR('❌ Erro ao registrar derrota:', error));
          
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
    
    this.animationFrame = requestAnimationFrame(this.loop);
  };
}