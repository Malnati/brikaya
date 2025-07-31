// src/logic/GameEngine.ts
import { Paddle } from '../objects/Paddle';
import { Ball } from '../objects/Ball';
import { Bricks } from '../objects/Bricks';
import { BRICK_ROWS, BRICK_COLS } from '../constants/game';
import { POINTS_PER_BRICK } from '../constants/gameState';

const ERROR_NO_2D_CONTEXT = 'No 2D context';
import { AssetLoader } from '../utils/assetLoader';
import { AssetLoader } from '../utils/assetLoader';

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private animationFrame = 0;
  private paddle: Paddle;
  private ball: Ball;
  private bricks: Bricks;
  private score = 0;
  private assetsLoaded = false;
  private assetsLoaded = false;

  constructor(private canvas: HTMLCanvasElement, private onScoreUpdate: (score: number) => void) {
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
      this.ctx.fillStyle = '#0095DD';
      this.ctx.font = '16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);
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
