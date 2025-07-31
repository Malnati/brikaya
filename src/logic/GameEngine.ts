// src/logic/GameEngine.ts
import { Paddle } from '../objects/Paddle';
import { Ball } from '../objects/Ball';
import { Bricks } from '../objects/Bricks';
import { GAME_COLOR, calculateDynamicDimensions, DynamicGameDimensions } from '../constants/game';
import { POINTS_PER_BRICK } from '../constants/gameState';
import { AssetLoader } from '../utils/assetLoader';

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
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error(ERROR_NO_2D_CONTEXT);
    this.ctx = ctx;
    
    // Usar tamanho do canvas atual se não fornecido
    this.canvasSize = canvasSize || { width: canvas.width, height: canvas.height };
    
    // Calcular dimensões dinâmicas baseadas no tamanho do canvas
    this.dimensions = calculateDynamicDimensions(this.canvasSize.width, this.canvasSize.height);
    
    // Calcular escala para manter proporções
    this.scaleX = this.canvasSize.width / 480; // CANVAS_WIDTH original
    this.scaleY = this.canvasSize.height / 320; // CANVAS_HEIGHT original
    
    this.paddle = new Paddle(this.canvasSize.width, this.canvasSize.height, this.dimensions);
    this.balls.push(new Ball(this.canvasSize.width, this.canvasSize.height, this.dimensions));
    
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
    this.setupListeners();
  }

  private async preloadAssets() {
    try {
      console.log('🎮 Iniciando carregamento de assets...');
      await AssetLoader.preloadAllAssets();
      this.assetsLoaded = true;
      console.log('✅ Assets carregados com sucesso!');
    } catch (error) {
      console.warn('⚠️  Alguns assets falharam ao carregar, usando fallback:', error);
      this.assetsLoaded = true; // Continue with fallback rendering
    }
  }

  private onBrickDestroyed() {
    this.score += POINTS_PER_BRICK;
    this.onScoreUpdate(this.score);
    
    // Verificar se todos os blocos foram destruídos
    if (this.bricks.isAllDestroyed() && !this.gameWon) {
      this.gameWon = true;
      if (this.onGameWon) {
        this.onGameWon();
      }
    }
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
    await this.preloadAssets();
    this.loop();
  }

  public stop() {
    cancelAnimationFrame(this.animationFrame);
  }

  private loop = () => {
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
        this.paddle.update();
        this.paddle.draw(this.ctx);
        for (let i = this.balls.length - 1; i >= 0; i--) {
          const ball = this.balls[i];
          const inPlay = ball.update(this.paddle, this.bricks, this.canvasSize.height);
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
          console.error('Erro durante o rendering:', error);
          throw error;
        }
      }
    }
    
    this.animationFrame = requestAnimationFrame(this.loop);
  };
}
