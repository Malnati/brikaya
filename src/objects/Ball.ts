// src/objects/Ball.ts
import { BALL_RADIUS, BALL_SPEED, GAME_COLOR } from '../constants/game';
import { ASSET_PATHS, BALL_IMAGE_SIZE } from '../constants/assets';
import { AssetLoader } from '../utils/assetLoader';

const BALL_INITIAL_Y_OFFSET = 30;
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60 graus

export class Ball {
  private x: number;
  private y: number;
  private dx = BALL_SPEED;
  private dy = -BALL_SPEED;
  private readonly radius = BALL_RADIUS;

  constructor(private canvasWidth: number, canvasHeight: number) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - BALL_INITIAL_Y_OFFSET;
  }

  update(paddle: { position: { x: number; y: number; width: number; height: number } }, bricks: { collide: (ball: Ball) => void }, maxHeight: number) {
    this.x += this.dx;
    this.y += this.dy;

    // Colisão com as paredes laterais
    if (this.x + this.dx > this.canvasWidth - this.radius || this.x + this.dx < this.radius) {
      this.dx = -this.dx;
    }
    
    // Colisão com o teto
    if (this.y + this.dy < this.radius) {
      this.dy = -this.dy;
    } 
    // Colisão com a raquete
    else if (this.y + this.radius > maxHeight) {
      const paddlePos = paddle.position;
      if (this.x > paddlePos.x && this.x < paddlePos.x + paddlePos.width) {
        this.handlePaddleCollision(paddlePos);
      }
    }

    bricks.collide(this);
  }

  private handlePaddleCollision(paddlePos: { x: number; y: number; width: number; height: number }) {
    // Calcula onde na raquete a bolinha bateu (0 = borda esquerda, 1 = borda direita)
    const hitPosition = (this.x - paddlePos.x) / paddlePos.width;
    
    // Converte a posição de hit para um ângulo (-MAX_BOUNCE_ANGLE a +MAX_BOUNCE_ANGLE)
    // Isso cria uma física mais realista onde o ângulo depende da posição do hit
    const angle = (hitPosition - 0.5) * 2 * MAX_BOUNCE_ANGLE;
    
    // Calcula a velocidade total com uma pequena variação baseada na posição do hit
    // Isso torna o jogo mais dinâmico e imprevisível
    const baseSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    const speedVariation = 0.8 + (hitPosition * 0.4); // Varia entre 0.8x e 1.2x da velocidade base
    const speed = baseSpeed * speedVariation;
    
    // Aplica o novo ângulo e velocidade
    this.dx = speed * Math.sin(angle);
    this.dy = -speed * Math.cos(angle); // Sempre para cima após bater na raquete
    
    // Garante que a bolinha não fique presa na raquete
    this.y = paddlePos.y - this.radius;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const ballImage = AssetLoader.getImage(ASSET_PATHS.BALL);
    
    if (ballImage) {
      // Draw image centered on ball position
      const imageWidth = BALL_IMAGE_SIZE.WIDTH;
      const imageHeight = BALL_IMAGE_SIZE.HEIGHT;
      ctx.drawImage(
        ballImage, 
        this.x - imageWidth / 2, 
        this.y - imageHeight / 2, 
        imageWidth, 
        imageHeight
      );
    } else {
      // Fallback to original circle rendering
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = GAME_COLOR;
      ctx.fill();
      ctx.closePath();
    }
  }

  get position() {
    return { x: this.x, y: this.y, radius: this.radius };
  }

  bounceY() {
    this.dy = -this.dy;
  }
}
