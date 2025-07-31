// src/logic/GameEngine.ts
import { Paddle } from '../objects/Paddle';
import { Ball } from '../objects/Ball';
import { Bricks } from '../objects/Bricks';
import { BRICK_ROWS, BRICK_COLS, GAME_COLOR } from '../constants/game';
import { POINTS_PER_BRICK } from '../constants/gameState';
import { AssetLoader } from '../utils/assetLoader';

const ERROR_NO_2D_CONTEXT = 'No 2D context';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private animationFrame = 0;
  private paddle: Paddle;
  private ball: Ball;
  private bricks: Bricks;
  private score = 0;
  private assetsLoaded = false;
  private gameWon = false;

  constructor(
    private canvas: HTMLCanvasElement, 
    private onScoreUpdate: (score: number) => void,
    private onGameWon?: () => void
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error(ERROR_NO_2D_CONTEXT);
    this.ctx = ctx;
    this.paddle = new Paddle(canvas.width, canvas.height);
    this.ball = new Ball(canvas.width, canvas.height);
    this.bricks = new Bricks(BRICK_ROWS, BRICK_COLS, this.onBrickDestroyed.bind(this));
    this.setupListeners();
    this.preloadAssets();
  }

  private async preloadAssets() {
    try {
      await AssetLoader.preloadAllAssets();
      this.assetsLoaded = true;
    } catch (error) {
      console.warn('Some assets failed to load, using fallback rendering:', error);
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
    document.addEventListener('keydown', e => this.paddle.onKeyDown(e));
    document.addEventListener('keyup', e => this.paddle.onKeyUp(e));
  }

  public start() {
    this.loop();
  }

  public stop() {
    cancelAnimationFrame(this.animationFrame);
  }

  private loop = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (!this.assetsLoaded) {
      // Show loading indicator
      this.ctx.fillStyle = GAME_COLOR;
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);
    } else if (this.gameWon) {
      // Mostrar tela de vitória
      this.ctx.fillStyle = GAME_COLOR;
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('VITÓRIA!', this.canvas.width / 2, this.canvas.height / 2 - 20);
      this.ctx.font = '16px Arial';
      this.ctx.fillText(`Pontuação: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
      this.ctx.fillText('Pressione "Restart Game" para jogar novamente', this.canvas.width / 2, this.canvas.height / 2 + 40);
    } else {
      // Normal game rendering
      this.bricks.draw(this.ctx);
      this.paddle.update();
      this.paddle.draw(this.ctx);
      this.ball.update(this.paddle, this.bricks, this.canvas.height);
      this.ball.draw(this.ctx);
    }
    
    this.animationFrame = requestAnimationFrame(this.loop);
  };
}
