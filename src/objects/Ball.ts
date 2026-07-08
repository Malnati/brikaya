// src/objects/Ball.ts
import {
  calculateClampedSpeed,
  calculateInitialBallSpeed,
  DynamicGameDimensions,
  PhaseSpeedConfig,
  roundSpeedValue,
  SpeedReductionSnapshot,
  SpeedStateSnapshot
} from '../constants/game';
import { AssetLoader } from '../utils/assetLoader';
import { sprBallPlayerDefault } from '../constants/visualAssets';
import { shouldUseReducedCanvasEffects } from '../utils/performanceMode';
import {
  DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
  GAME_VISUAL_ASSET_ROLES,
  type VisualAssetPathResolver,
} from '../utils/visualAssetResolver';
import { collisionTracker } from '../utils/collisionTracker';
import { ERROR, LOG } from '../utils/logger';
import { gameLogger, type LoggedGameState } from '../storage/gameLogger';
import { GAME_AUDIO_IDS, type GameAudioSink } from '../constants/audio';
import {
  calculateBallTurretBoundarySegments,
  calculateRadialPlayfieldGeometry,
  isBallTurretBoundarySegmentRebounding,
  isAngleBetween,
  isRadialPaddleBounds,
  toPolar,
  type RadialPaddleBounds,
  type RadialPlayfieldGeometry,
  type RectBounds,
} from '../utils/radialGeometry';
import type {
  ElectricImpactHandler,
  ElectricImpactPoint,
} from '../utils/electricImpact';

const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60 graus
const PADDLE_EDGE_ZONE_RATIO = 0.2;
const MOTION_STEP_RADIUS_RATIO = 0.75;
const MIN_MOTION_STEPS = 1;
const CANVAS_POSITION_FALLBACK_RATIO = 0.5;
const RADIAL_WALL_TYPE = 'radial';
const VECTOR_LENGTH_FALLBACK = 1;
const CENTER_RATIO = 0.5;
const ELECTRIC_BALL_FULL_ARC_COUNT = 5;
const ELECTRIC_BALL_REDUCED_ARC_COUNT = 2;
const ELECTRIC_BALL_ARC_SEGMENTS = 5;
const ELECTRIC_BALL_TIME_SCALE_MS = 1000;
const ELECTRIC_BALL_PULSE_RATE = 7.1;
const ELECTRIC_BALL_POSITION_PHASE_X = 0.013;
const ELECTRIC_BALL_POSITION_PHASE_Y = 0.017;
const ELECTRIC_BALL_ORBIT_PHASE = 2.399963229728653;
const ELECTRIC_BALL_TWO_PI = Math.PI * 2;
const ELECTRIC_BALL_VISUAL_PULSE_RATIO = 0.08;
const ELECTRIC_BALL_HALO_RADIUS_RATIO = 1.7;
const ELECTRIC_BALL_CORE_HIGHLIGHT_RATIO = 0.08;
const ELECTRIC_BALL_ARC_MIN_RADIUS_RATIO = 0.18;
const ELECTRIC_BALL_ARC_RADIUS_RANGE_RATIO = 0.68;
const ELECTRIC_BALL_ARC_ZIGZAG_RATIO = 0.1;
const ELECTRIC_BALL_ARC_SPAN_BASE = 1.15;
const ELECTRIC_BALL_ARC_SPAN_VARIANCE = 0.52;
const ELECTRIC_BALL_ARC_ALPHA_BASE = 0.62;
const ELECTRIC_BALL_ARC_ALPHA_VARIANCE = 0.22;
const ELECTRIC_BALL_NODE_RADIUS_RATIO = 0.085;
const ELECTRIC_BALL_MIN_LINE_WIDTH = 1;

type PaddlePosition = RectBounds | RadialPaddleBounds;

export class Ball {
  private x: number;
  private y: number;
  private dx: number;
  private dy: number;
  private radius: number;
  private blockHitsThisRun = 0;
  private paddleCollision = false;
  private level = 1;
  private maxSpeed = 0;
  private minSpeed = 0;
  private initialSpawnSpeed = 0;
  private currentSpeed = 0;
  private reductionPerBrick = 0;
  private initialBrickCount = 0;
  private previousLevelMaxSpeed = 0;
  private levelStartedAt = Date.now();
  private lastSpeedReduction: SpeedReductionSnapshot | null = null;

  constructor(
    private canvasWidth: number,
    private canvasHeight: number,
    private dimensions: DynamicGameDimensions,
    private speedMultiplier = 1,
    private resolveAssetPath: VisualAssetPathResolver = DEFAULT_GAME_VISUAL_ASSET_RESOLVER,
    private geometry: RadialPlayfieldGeometry = calculateRadialPlayfieldGeometry(canvasWidth, canvasHeight, dimensions),
    private onElectricImpact?: ElectricImpactHandler,
  ) {
    this.radius = this.dimensions.ballRadius;
    this.x = this.geometry.centerX;
    this.y = this.geometry.centerY;
    const initialSpeed = calculateInitialBallSpeed(this.canvasWidth) * this.speedMultiplier;
    this.dx = 0;
    this.dy = -initialSpeed;
    this.currentSpeed = initialSpeed;
    this.initialSpawnSpeed = initialSpeed;
    this.maxSpeed = initialSpeed;
    this.minSpeed = initialSpeed;
    this.previousLevelMaxSpeed = initialSpeed;
    LOG(`⚽ Ball inicializada: pos=(${this.x}, ${this.y}), raio=${this.radius}`);
  }

  resetForLevel(
    canvasWidth: number,
    canvasHeight: number,
    dimensions: DynamicGameDimensions,
    speedMultiplier: number,
    geometry?: RadialPlayfieldGeometry
  ): void {
    const initialSpeed = calculateInitialBallSpeed(canvasWidth) * speedMultiplier;

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.dimensions = dimensions;
    this.geometry = geometry ?? calculateRadialPlayfieldGeometry(canvasWidth, canvasHeight, dimensions);
    this.speedMultiplier = speedMultiplier;
    this.radius = dimensions.ballRadius;
    this.x = this.geometry.centerX;
    this.y = this.geometry.centerY;
    this.dx = 0;
    this.dy = -initialSpeed;
    this.currentSpeed = initialSpeed;
    this.initialSpawnSpeed = initialSpeed;
    this.maxSpeed = initialSpeed;
    this.minSpeed = initialSpeed;
    this.previousLevelMaxSpeed = initialSpeed;
    this.blockHitsThisRun = 0;
    this.paddleCollision = false;
    this.lastSpeedReduction = null;
  }

  resize(
    canvasWidth: number,
    canvasHeight: number,
    dimensions: DynamicGameDimensions,
    geometry?: RadialPlayfieldGeometry
  ): void {
    const widthRatio = this.canvasWidth > 0 ? canvasWidth / this.canvasWidth : 1;
    const heightRatio = this.canvasHeight > 0 ? canvasHeight / this.canvasHeight : 1;

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.dimensions = dimensions;
    this.geometry = geometry ?? calculateRadialPlayfieldGeometry(canvasWidth, canvasHeight, dimensions);
    this.radius = dimensions.ballRadius;
    this.x = Math.max(
      this.radius,
      Math.min(canvasWidth - this.radius, this.x * widthRatio || canvasWidth * CANVAS_POSITION_FALLBACK_RATIO),
    );
    this.y = Math.max(
      this.radius,
      Math.min(canvasHeight - this.radius, this.y * heightRatio || canvasHeight * CANVAS_POSITION_FALLBACK_RATIO),
    );
  }

  applyPhaseSpeedConfig(config: PhaseSpeedConfig): void {
    this.level = config.level;
    this.initialBrickCount = config.initialBrickCount;
    this.initialSpawnSpeed = config.initialSpawnSpeed;
    this.maxSpeed = config.maxSpeed;
    this.minSpeed = config.minSpeed;
    this.reductionPerBrick = config.reductionPerBrick;
    this.previousLevelMaxSpeed = config.previousLevelMaxSpeed;
    this.levelStartedAt = config.levelStartedAt;
    this.blockHitsThisRun = 0;
    this.lastSpeedReduction = null;

    this.setVelocityFromAngleAndSpeed(this.getCurrentAngle(), this.initialSpawnSpeed, false);
  }

  update(
    paddle: { position: PaddlePosition },
    bricks: { 
      collide: (
        ball: Ball, 
        gameState?: LoggedGameState
      ) => boolean
    },
    maxHeight: number,
    gameState: LoggedGameState,
    audioSink?: GameAudioSink,
    frameScale = 1,
    activePaddlePositions?: PaddlePosition[],
  ): boolean {
    const safeFrameScale = Math.max(0, Number.isFinite(frameScale) ? frameScale : 1);
    const motionSteps = this.getMotionStepCount(safeFrameScale);
    let brickCollisionHandled = false;
    const fallbackPaddlePosition = paddle.position;
    const activePaddles =
      activePaddlePositions && activePaddlePositions.length > 0
        ? activePaddlePositions
        : fallbackPaddlePosition;

    for (let step = 0; step < motionSteps; step += 1) {
      this.x += (this.dx * safeFrameScale) / motionSteps;
      this.y += (this.dy * safeFrameScale) / motionSteps;

      if (!brickCollisionHandled) {
        brickCollisionHandled = bricks.collide(this, gameState);
      }

      const inPlay = this.resolvePaddleCollisionOrLoss(
        activePaddles,
        fallbackPaddlePosition,
        maxHeight,
        gameState,
        audioSink,
      );

      if (!inPlay) {
        return false;
      }

      if (this.paddleCollision) {
        return true;
      }
    }

    return true;
  }

  private getMotionStepCount(frameScale = 1) {
    const maxStepDistance = Math.max(MIN_MOTION_STEPS, this.radius * MOTION_STEP_RADIUS_RATIO);
    const frameDistance = this.getCurrentSpeedMagnitude() * Math.max(0, frameScale);
    return Math.max(MIN_MOTION_STEPS, Math.ceil(frameDistance / maxStepDistance));
  }

  private resolveRectangularWallCollision(
    paddlePosition: RectBounds,
    gameState: LoggedGameState,
    audioSink?: GameAudioSink
  ) {
    const rightLimit = this.canvasWidth - this.radius;
    const leftLimit = this.radius;
    if (this.x <= rightLimit && this.x >= leftLimit) return;

    const wallType = this.x > rightLimit ? 'right' : 'left';
    LOG(`🧱 Colisão com parede ${wallType} detectada em (${Math.round(this.x)}, ${Math.round(this.y)})`);

    audioSink?.playAudio(GAME_AUDIO_IDS.WALL_HIT);
    const velocityBefore = { dx: this.dx, dy: this.dy };
    this.x = wallType === 'right' ? rightLimit : leftLimit;
    this.dx = wallType === 'right' ? -Math.abs(this.dx) : Math.abs(this.dx);
    const velocityAfter = { dx: this.dx, dy: this.dy };
    this.emitRectangularWallElectricImpact(wallType);

    gameLogger.logCollision(
      gameState,
      [{ x: this.x, y: this.y, velocity: velocityAfter, radius: this.radius }],
      paddlePosition,
      {
        type: 'wall',
        ballPosition: { x: this.x, y: this.y },
        wallType,
        velocityBefore,
        velocityAfter
      }
    ).catch((error) => ERROR('❌ Erro ao registrar colisão com parede:', error));

    collisionTracker.logWallCollision(
      { x: this.x, y: this.y },
      velocityAfter,
      gameState,
      wallType
    ).catch(error => ERROR('❌ Erro ao registrar colisão com parede:', error));
  }

  private resolveRectangularCeilingCollision(
    paddlePosition: RectBounds,
    gameState: LoggedGameState,
    audioSink?: GameAudioSink
  ) {
    if (this.y >= this.radius) return;

    LOG(`🏠 Colisão com teto detectada em (${Math.round(this.x)}, ${Math.round(this.y)})`);

    audioSink?.playAudio(GAME_AUDIO_IDS.CEILING_HIT);
    const velocityBefore = { dx: this.dx, dy: this.dy };
    this.y = this.radius;
    this.dy = Math.abs(this.dy);
    const velocityAfter = { dx: this.dx, dy: this.dy };
    this.emitCeilingElectricImpact();

    gameLogger.logCollision(
      gameState,
      [{ x: this.x, y: this.y, velocity: velocityAfter, radius: this.radius }],
      paddlePosition,
      {
        type: 'ceiling',
        ballPosition: { x: this.x, y: this.y },
        velocityBefore,
        velocityAfter
      }
    ).catch(error => ERROR('❌ Erro ao registrar colisão com teto:', error));

    collisionTracker.logCeilingCollision(
      { x: this.x, y: this.y },
      velocityAfter,
      gameState
    ).catch(error => ERROR('❌ Erro ao registrar colisão com teto:', error));
  }

  private resolvePaddleCollisionOrLoss(
    paddlePos: PaddlePosition | PaddlePosition[],
    fallbackPaddlePos: PaddlePosition,
    maxHeight: number,
    gameState: LoggedGameState,
    audioSink?: GameAudioSink
  ): boolean {
    if (Array.isArray(paddlePos)) {
      return this.resolveMultiplePaddleCollisionOrLoss(
        paddlePos,
        fallbackPaddlePos,
        maxHeight,
        gameState,
        audioSink,
      );
    }

    if (isRadialPaddleBounds(paddlePos)) {
      return this.resolveRadialBoundaryCollisionOrLoss(
        paddlePos,
        gameState,
        audioSink,
      );
    }

    this.resolveRectangularWallCollision(paddlePos, gameState, audioSink);
    this.resolveRectangularCeilingCollision(paddlePos, gameState, audioSink);

    if (this.y + this.radius <= maxHeight) return true;

    if (this.x > paddlePos.x && this.x < paddlePos.x + paddlePos.width) {
      LOG(`🏓 Bola bateu na raquete em x=${this.x}, raquete=${paddlePos.x}-${paddlePos.x + paddlePos.width}`);

      const hitPosition = (this.x - paddlePos.x) / paddlePos.width;
      const paddleAudioId = hitPosition <= PADDLE_EDGE_ZONE_RATIO || hitPosition >= 1 - PADDLE_EDGE_ZONE_RATIO
        ? GAME_AUDIO_IDS.PADDLE_HIT_EDGE
        : GAME_AUDIO_IDS.PADDLE_HIT_CENTER;
      audioSink?.playAudio(paddleAudioId);
      LOG(`🏓 Registrando colisão com raquete - Hit position: ${hitPosition.toFixed(2)}`);

      const velocityBefore = { dx: this.dx, dy: this.dy };
      this.handlePaddleCollision(paddlePos);
      const velocityAfter = { dx: this.dx, dy: this.dy };

      gameLogger.logCollision(
        gameState,
        [{ x: this.x, y: this.y, velocity: velocityAfter, radius: this.radius }],
        paddlePos,
        {
          type: 'paddle',
          ballPosition: { x: this.x, y: this.y },
          targetPosition: paddlePos,
          hitPosition,
          velocityBefore,
          velocityAfter
        }
      ).catch(error => ERROR('❌ Erro ao registrar colisão com raquete:', error));

      collisionTracker.logPaddleCollision(
        { x: this.x, y: this.y },
        velocityAfter,
        gameState,
        paddlePos,
        hitPosition
      ).catch(error => ERROR('❌ Erro ao registrar colisão com raquete:', error));

      this.paddleCollision = true;
      return true;
    }

    LOG(`💀 BOLA PERDIDA! x=${this.x}, y=${this.y}, raquete=${paddlePos.x}-${paddlePos.x + paddlePos.width}`);
    LOG(`💀 Registrando bola perdida - Posição: (${Math.round(this.x)}, ${Math.round(this.y)})`);

    audioSink?.playAudio(GAME_AUDIO_IDS.BALL_LOST);
    const lostBallVelocity = { dx: this.dx, dy: this.dy };

    gameLogger.logBallLost(
      gameState,
      [{ x: this.x, y: this.y, velocity: lostBallVelocity, radius: this.radius }],
      paddlePos,
      { x: this.x, y: this.y },
      lostBallVelocity
    ).catch(error => ERROR('❌ Erro ao registrar bola perdida:', error));

    collisionTracker.logBallLost(
      { x: this.x, y: this.y },
      lostBallVelocity,
      gameState,
      paddlePos
    ).catch(error => ERROR('❌ Erro ao registrar bola perdida:', error));

    return false;
  }

  private resolveMultiplePaddleCollisionOrLoss(
    paddlePositions: PaddlePosition[],
    fallbackPaddlePos: PaddlePosition,
    maxHeight: number,
    gameState: LoggedGameState,
    audioSink?: GameAudioSink,
  ): boolean {
    const radialPaddles = paddlePositions.filter(isRadialPaddleBounds);
    if (radialPaddles.length !== paddlePositions.length) {
      return this.resolvePaddleCollisionOrLoss(
        fallbackPaddlePos,
        fallbackPaddlePos,
        maxHeight,
        gameState,
        audioSink,
      );
    }

    const polar = toPolar(this.position, this.geometry);
    const boundaryRadius = this.geometry.radius - this.radius;

    for (const radialPaddle of radialPaddles) {
      if (
        this.isMovingOutward(polar.angle) &&
        this.hasReachedRadialPaddleBand(polar.radius, radialPaddle) &&
        isAngleBetween(
          polar.angle,
          radialPaddle.radial.startAngle,
          radialPaddle.radial.endAngle,
        )
      ) {
        return this.resolveRadialBoundaryCollisionOrLoss(
          radialPaddle,
          gameState,
          audioSink,
        );
      }
    }

    if (polar.radius < boundaryRadius) return true;

    const lossPaddle = radialPaddles[0];
    if (lossPaddle) {
      return this.logRadialBallLost(lossPaddle, gameState, audioSink);
    }

    return this.resolvePaddleCollisionOrLoss(
      fallbackPaddlePos,
      fallbackPaddlePos,
      maxHeight,
      gameState,
      audioSink,
    );
  }

  private resolveRadialBoundaryCollisionOrLoss(
    paddlePos: RadialPaddleBounds,
    gameState: LoggedGameState,
    audioSink?: GameAudioSink,
  ) {
    const polar = toPolar(this.position, this.geometry);
    const boundaryRadius = this.geometry.radius - this.radius;

    if (
      this.isMovingOutward(polar.angle) &&
      this.hasReachedRadialPaddleBand(polar.radius, paddlePos) &&
      isAngleBetween(polar.angle, paddlePos.radial.startAngle, paddlePos.radial.endAngle)
    ) {
      const hitPosition = this.calculateRadialPaddleHitPosition(
        polar.angle,
        paddlePos,
      );
      const paddleAudioId = hitPosition <= PADDLE_EDGE_ZONE_RATIO || hitPosition >= 1 - PADDLE_EDGE_ZONE_RATIO
        ? GAME_AUDIO_IDS.PADDLE_HIT_EDGE
        : GAME_AUDIO_IDS.PADDLE_HIT_CENTER;
      audioSink?.playAudio(paddleAudioId);

      const velocityBefore = { dx: this.dx, dy: this.dy };
      this.handleRadialPaddleCollision(paddlePos, hitPosition);
      const velocityAfter = { dx: this.dx, dy: this.dy };

      gameLogger.logCollision(
        gameState,
        [{ x: this.x, y: this.y, velocity: velocityAfter, radius: this.radius }],
        paddlePos,
        {
          type: 'paddle',
          ballPosition: { x: this.x, y: this.y },
          targetPosition: paddlePos,
          hitPosition,
          velocityBefore,
          velocityAfter
        }
      ).catch(error => ERROR('❌ Erro ao registrar colisão com raquete:', error));

      collisionTracker.logPaddleCollision(
        { x: this.x, y: this.y },
        velocityAfter,
        gameState,
        paddlePos,
        hitPosition
      ).catch(error => ERROR('❌ Erro ao registrar colisão com raquete:', error));

      this.paddleCollision = true;
      return true;
    }

    if (polar.radius < boundaryRadius) return true;

    if (
      this.isBallTurretBoundaryCollision(paddlePos) &&
      this.isMovingOutward(polar.angle)
    ) {
      if (isBallTurretBoundarySegmentRebounding(polar.angle, this.level)) {
        this.handleRadialWallCollision(
          paddlePos,
          polar.angle,
          gameState,
          audioSink,
        );
        return true;
      }

      return this.logRadialBallLost(paddlePos, gameState, audioSink);
    }

    if (
      this.isMovingOutward(polar.angle) &&
      (paddlePos.radial.lossIsFullCircle ||
        isAngleBetween(
          polar.angle,
          paddlePos.radial.lossStartAngle,
          paddlePos.radial.lossEndAngle,
        ))
    ) {
      return this.logRadialBallLost(paddlePos, gameState, audioSink);
    }

    this.handleRadialWallCollision(paddlePos, polar.angle, gameState, audioSink);
    return true;
  }

  private isBallTurretBoundaryCollision(paddlePos: RadialPaddleBounds): boolean {
    return (
      this.geometry.trampolineIsFullRing && paddlePos.radial.lossIsFullCircle
    );
  }

  private handleRadialWallCollision(
    paddlePosition: RectBounds,
    wallAngle: number,
    gameState: LoggedGameState,
    audioSink?: GameAudioSink,
  ) {
    audioSink?.playAudio(GAME_AUDIO_IDS.WALL_HIT);
    const velocityBefore = { dx: this.dx, dy: this.dy };
    const normalX = Math.cos(wallAngle);
    const normalY = Math.sin(wallAngle);
    const dot = this.dx * normalX + this.dy * normalY;

    this.dx -= 2 * dot * normalX;
    this.dy -= 2 * dot * normalY;
    this.currentSpeed = roundSpeedValue(Math.sqrt(this.dx * this.dx + this.dy * this.dy));
    this.clampInsideRadialBoundary();
    const velocityAfter = { dx: this.dx, dy: this.dy };
    this.emitRadialWallElectricImpact(wallAngle);

    gameLogger.logCollision(
      gameState,
      [{ x: this.x, y: this.y, velocity: velocityAfter, radius: this.radius }],
      paddlePosition,
      {
        type: 'wall',
        ballPosition: { x: this.x, y: this.y },
        wallType: RADIAL_WALL_TYPE,
        velocityBefore,
        velocityAfter
      }
    ).catch((error) => ERROR('❌ Erro ao registrar colisão com parede:', error));

    collisionTracker.logWallCollision(
      { x: this.x, y: this.y },
      velocityAfter,
      gameState,
      RADIAL_WALL_TYPE
    ).catch(error => ERROR('❌ Erro ao registrar colisão com parede:', error));
  }

  private emitRectangularWallElectricImpact(wallType: 'left' | 'right'): void {
    if (!this.onElectricImpact) return;

    const wallX = wallType === 'right' ? this.canvasWidth : 0;
    this.onElectricImpact({
      kind: 'wall',
      origin: { x: wallX, y: this.y },
      endpoints: [
        { x: wallX, y: 0 },
        { x: wallX, y: this.canvasHeight },
      ],
    });
  }

  private emitCeilingElectricImpact(): void {
    if (!this.onElectricImpact) return;

    this.onElectricImpact({
      kind: 'ceiling',
      origin: { x: this.x, y: 0 },
      endpoints: [
        { x: 0, y: 0 },
        { x: this.canvasWidth, y: 0 },
      ],
    });
  }

  private emitRadialWallElectricImpact(wallAngle: number): void {
    if (!this.onElectricImpact) return;

    this.onElectricImpact({
      kind: 'radial-wall',
      origin: this.pointOnRadialWall(wallAngle),
      endpoints: this.getRadialWallElectricEndpoints(wallAngle),
    });
  }

  private getRadialWallElectricEndpoints(
    wallAngle: number,
  ): [ElectricImpactPoint, ElectricImpactPoint] {
    if (this.geometry.trampolineIsFullRing) {
      const hitSegment = calculateBallTurretBoundarySegments(this.level).find(
        (segment) => isAngleBetween(wallAngle, segment.startAngle, segment.endAngle),
      );

      if (hitSegment) {
        return [
          this.pointOnRadialWall(hitSegment.startAngle),
          this.pointOnRadialWall(hitSegment.endAngle),
        ];
      }
    }

    const localArcSpan = Math.PI / 4;
    return [
      this.pointOnRadialWall(wallAngle - localArcSpan),
      this.pointOnRadialWall(wallAngle + localArcSpan),
    ];
  }

  private pointOnRadialWall(angle: number): ElectricImpactPoint {
    return {
      x: this.geometry.centerX + Math.cos(angle) * this.geometry.radius,
      y: this.geometry.centerY + Math.sin(angle) * this.geometry.radius,
    };
  }

  private logRadialBallLost(
    paddlePos: RadialPaddleBounds,
    gameState: LoggedGameState,
    audioSink?: GameAudioSink,
  ) {
    audioSink?.playAudio(GAME_AUDIO_IDS.BALL_LOST);
    const lostBallVelocity = { dx: this.dx, dy: this.dy };

    gameLogger.logBallLost(
      gameState,
      [{ x: this.x, y: this.y, velocity: lostBallVelocity, radius: this.radius }],
      paddlePos,
      { x: this.x, y: this.y },
      lostBallVelocity
    ).catch(error => ERROR('❌ Erro ao registrar bola perdida:', error));

    collisionTracker.logBallLost(
      { x: this.x, y: this.y },
      lostBallVelocity,
      gameState,
      paddlePos
    ).catch(error => ERROR('❌ Erro ao registrar bola perdida:', error));

    return false;
  }

  private calculateRadialPaddleHitPosition(
    angle: number,
    paddlePos: RadialPaddleBounds,
  ): number {
    const span = paddlePos.radial.endAngle - paddlePos.radial.startAngle;
    if (span <= 0) return PADDLE_EDGE_ZONE_RATIO;

    return Math.max(
      0,
      Math.min(1, (angle - paddlePos.radial.startAngle) / span),
    );
  }

  private hasReachedRadialPaddleBand(
    radius: number,
    paddlePos: RadialPaddleBounds,
  ): boolean {
    const halfThickness = paddlePos.radial.thickness * CENTER_RATIO;
    const innerRadius = paddlePos.radial.radius - halfThickness - this.radius;

    return radius >= innerRadius;
  }

  private handlePaddleCollision(paddlePos: RectBounds) {
    // Calcula onde na raquete a bolinha bateu (0 = borda esquerda, 1 = borda direita)
    const hitPosition = (this.x - paddlePos.x) / paddlePos.width;
    
    // Converte a posição de hit para um ângulo (-MAX_BOUNCE_ANGLE a +MAX_BOUNCE_ANGLE)
    // Isso cria uma física mais realista onde o ângulo depende da posição do hit
    const angle = (hitPosition - 0.5) * 2 * MAX_BOUNCE_ANGLE;

    // Mantém a função da raquete sobre o ângulo, mas não deixa a magnitude sair
    // da faixa [minSpeed, maxSpeed] da fase atual.
    const desiredSpeed = this.getCurrentSpeedMagnitude();
    const clampedSpeed = calculateClampedSpeed(desiredSpeed, this.minSpeed, this.maxSpeed);

    // Aplica o novo ângulo e velocidade clampada
    this.setVelocityFromAngleAndSpeed(angle, clampedSpeed);
    
    // Garante que a bolinha não fique presa na raquete
    this.y = paddlePos.y - this.radius;
  }

  private handleRadialPaddleCollision(
    paddlePos: RadialPaddleBounds,
    hitPosition: number,
  ) {
    const desiredSpeed = this.getCurrentSpeedMagnitude();
    const clampedSpeed = calculateClampedSpeed(desiredSpeed, this.minSpeed, this.maxSpeed);
    const inwardAngle =
      paddlePos.radial.centerAngle +
      Math.PI +
      (hitPosition - CENTER_RATIO) *
        2 *
        MAX_BOUNCE_ANGLE;

    this.setVelocityFromVector(Math.cos(inwardAngle), Math.sin(inwardAngle), clampedSpeed);
    this.clampInsideRadialBoundary();
  }

  private isMovingOutward(angle: number): boolean {
    return this.dx * Math.cos(angle) + this.dy * Math.sin(angle) > 0;
  }

  private clampInsideRadialBoundary() {
    const polar = toPolar(this.position, this.geometry);
    const maxRadius = this.geometry.radius - this.radius;
    if (polar.radius <= maxRadius) return;

    this.x = this.geometry.centerX + Math.cos(polar.angle) * maxRadius;
    this.y = this.geometry.centerY + Math.sin(polar.angle) * maxRadius;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const ballAssetPath = this.resolveAssetPath(GAME_VISUAL_ASSET_ROLES.ball);

    if (ballAssetPath === sprBallPlayerDefault) {
      this.drawElectricEnergyBall(ctx);
      return;
    }

    const ballImage = AssetLoader.getOrLoadImage(ballAssetPath);
    
    if (ballImage) {
      // Desenha a imagem da bolinha
      ctx.drawImage(
        ballImage,
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2
      );
    } else {
      // Fallback para círculo branco se a imagem não carregou
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.closePath();
    }
  }

  private drawElectricEnergyBall(ctx: CanvasRenderingContext2D): void {
    const reducedEffects = shouldUseReducedCanvasEffects(this.canvasWidth);

    try {
      this.drawProceduralElectricEnergyBall(ctx, reducedEffects);
    } catch {
      this.drawElectricEnergyFallback(ctx);
    }
  }

  private drawProceduralElectricEnergyBall(
    ctx: CanvasRenderingContext2D,
    reducedEffects: boolean,
  ): void {
    const rawTime = reducedEffects ? 0 : Date.now() / ELECTRIC_BALL_TIME_SCALE_MS;
    const movementPhase =
      this.x * ELECTRIC_BALL_POSITION_PHASE_X +
      this.y * ELECTRIC_BALL_POSITION_PHASE_Y;
    const pulse = reducedEffects
      ? 0
      : Math.sin(rawTime * ELECTRIC_BALL_PULSE_RATE + movementPhase) *
        ELECTRIC_BALL_VISUAL_PULSE_RATIO;
    const visualRadius = this.radius * (1 + pulse);

    ctx.save();
    try {
      ctx.translate(this.x, this.y);
      this.drawElectricOuterHalo(ctx, visualRadius, rawTime, reducedEffects);
      this.drawElectricCore(ctx, visualRadius, reducedEffects);
      this.drawElectricArcs(ctx, visualRadius, rawTime, reducedEffects);
      this.drawElectricShell(ctx, visualRadius, reducedEffects);
    } finally {
      ctx.restore();
    }
  }

  private drawElectricOuterHalo(
    ctx: CanvasRenderingContext2D,
    visualRadius: number,
    rawTime: number,
    reducedEffects: boolean,
  ): void {
    const haloRadius = visualRadius * ELECTRIC_BALL_HALO_RADIUS_RATIO;
    const haloPulse = reducedEffects ? 0 : Math.sin(rawTime * 4.3) * 0.08;
    const haloGradient = ctx.createRadialGradient(
      0,
      0,
      visualRadius * ELECTRIC_BALL_CORE_HIGHLIGHT_RATIO,
      0,
      0,
      haloRadius,
    );

    haloGradient.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    haloGradient.addColorStop(0.28, `rgba(125, 249, 255, ${0.52 + haloPulse})`);
    haloGradient.addColorStop(0.64, `rgba(0, 178, 255, ${0.2 + haloPulse * 0.5})`);
    haloGradient.addColorStop(1, 'rgba(0, 30, 80, 0)');

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = haloGradient;
    ctx.beginPath();
    ctx.arc(0, 0, haloRadius, 0, ELECTRIC_BALL_TWO_PI);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawElectricCore(
    ctx: CanvasRenderingContext2D,
    visualRadius: number,
    reducedEffects: boolean,
  ): void {
    const coreGradient = ctx.createRadialGradient(
      -visualRadius * 0.32,
      -visualRadius * 0.35,
      visualRadius * ELECTRIC_BALL_CORE_HIGHLIGHT_RATIO,
      0,
      0,
      visualRadius,
    );

    coreGradient.addColorStop(0, '#ffffff');
    coreGradient.addColorStop(0.22, '#dffcff');
    coreGradient.addColorStop(0.48, '#46e8ff');
    coreGradient.addColorStop(0.78, '#087cc6');
    coreGradient.addColorStop(1, '#02132f');

    ctx.shadowColor = '#7df9ff';
    ctx.shadowBlur = reducedEffects ? 0 : Math.max(2, visualRadius * 0.65);
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, visualRadius, 0, ELECTRIC_BALL_TWO_PI);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  private drawElectricArcs(
    ctx: CanvasRenderingContext2D,
    visualRadius: number,
    rawTime: number,
    reducedEffects: boolean,
  ): void {
    const arcCount = reducedEffects
      ? ELECTRIC_BALL_REDUCED_ARC_COUNT
      : ELECTRIC_BALL_FULL_ARC_COUNT;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#dffcff';
    ctx.shadowBlur = reducedEffects ? 0 : Math.max(2, visualRadius * 0.35);

    for (let index = 0; index < arcCount; index += 1) {
      this.drawElectricArc(ctx, visualRadius, rawTime, reducedEffects, index);
    }

    ctx.restore();
  }

  private drawElectricArc(
    ctx: CanvasRenderingContext2D,
    visualRadius: number,
    rawTime: number,
    reducedEffects: boolean,
    index: number,
  ): void {
    const motion = reducedEffects ? 0 : rawTime * (1.45 + index * 0.31);
    const startAngle =
      (index * ELECTRIC_BALL_ORBIT_PHASE + motion + this.x * 0.011 + this.y * 0.007) %
      ELECTRIC_BALL_TWO_PI;
    const arcSpan =
      ELECTRIC_BALL_ARC_SPAN_BASE +
      Math.sin(rawTime * 1.7 + index) * ELECTRIC_BALL_ARC_SPAN_VARIANCE;
    const strokeAlpha =
      ELECTRIC_BALL_ARC_ALPHA_BASE +
      (reducedEffects ? 0 : Math.sin(rawTime * 3.2 + index) * ELECTRIC_BALL_ARC_ALPHA_VARIANCE);

    ctx.strokeStyle = index % 2 === 0
      ? `rgba(255, 255, 255, ${strokeAlpha})`
      : `rgba(126, 249, 255, ${strokeAlpha})`;
    ctx.lineWidth = Math.max(
      ELECTRIC_BALL_MIN_LINE_WIDTH,
      visualRadius * (index % 2 === 0 ? 0.13 : 0.09),
    );
    ctx.beginPath();

    for (let step = 0; step <= ELECTRIC_BALL_ARC_SEGMENTS; step += 1) {
      const progress = step / ELECTRIC_BALL_ARC_SEGMENTS;
      const angle = startAngle + arcSpan * progress;
      const radialWave = Math.sin(
        rawTime * (2.1 + index * 0.37) +
        step * 1.9 +
        index * ELECTRIC_BALL_ORBIT_PHASE,
      );
      const radiusRatio =
        ELECTRIC_BALL_ARC_MIN_RADIUS_RATIO +
        ELECTRIC_BALL_ARC_RADIUS_RANGE_RATIO *
          (0.5 + radialWave * 0.5);
      const zigzag =
        (step % 2 === 0 ? -1 : 1) *
        visualRadius *
        ELECTRIC_BALL_ARC_ZIGZAG_RATIO *
        (reducedEffects ? 0.35 : 1);
      const radialDistance = Math.min(
        visualRadius * 0.86,
        Math.max(visualRadius * 0.16, visualRadius * radiusRatio + zigzag),
      );
      const pointX = Math.cos(angle) * radialDistance;
      const pointY = Math.sin(angle) * radialDistance;

      if (step === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }

    ctx.stroke();
    this.drawElectricArcNode(ctx, visualRadius, startAngle + arcSpan, index);
  }

  private drawElectricArcNode(
    ctx: CanvasRenderingContext2D,
    visualRadius: number,
    angle: number,
    index: number,
  ): void {
    const nodeRadius = Math.max(
      0.8,
      visualRadius * ELECTRIC_BALL_NODE_RADIUS_RATIO * (index % 2 === 0 ? 1 : 0.72),
    );
    const distance = visualRadius * (0.26 + (index % 3) * 0.16);

    ctx.fillStyle = index % 2 === 0
      ? 'rgba(255, 255, 255, 0.95)'
      : 'rgba(126, 249, 255, 0.88)';
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, nodeRadius, 0, ELECTRIC_BALL_TWO_PI);
    ctx.fill();
  }

  private drawElectricShell(
    ctx: CanvasRenderingContext2D,
    visualRadius: number,
    reducedEffects: boolean,
  ): void {
    ctx.strokeStyle = reducedEffects ? 'rgba(185, 244, 255, 0.72)' : 'rgba(185, 244, 255, 0.9)';
    ctx.lineWidth = Math.max(ELECTRIC_BALL_MIN_LINE_WIDTH, visualRadius * 0.12);
    ctx.shadowColor = '#b9f4ff';
    ctx.shadowBlur = reducedEffects ? 0 : Math.max(1, visualRadius * 0.32);
    ctx.beginPath();
    ctx.arc(0, 0, visualRadius * 0.96, 0, ELECTRIC_BALL_TWO_PI);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private drawElectricEnergyFallback(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = '#7df9ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(ELECTRIC_BALL_MIN_LINE_WIDTH, this.radius * 0.16);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, ELECTRIC_BALL_TWO_PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  get position() {
    return { x: this.x, y: this.y, radius: this.radius };
  }

  getVelocity() {
    return { dx: this.dx, dy: this.dy };
  }

  getCurrentSpeedMagnitude() {
    return calculateClampedSpeed(
      this.currentSpeed || Math.sqrt(this.dx * this.dx + this.dy * this.dy),
      this.minSpeed || 0,
      Number.MAX_SAFE_INTEGER
    );
  }

  bounceY() {
    this.dy = -this.dy;
  }

  bounceFromRadialBrick(targetX: number, targetY: number) {
    const normalX = this.x - targetX;
    const normalY = this.y - targetY;
    const normalLength = Math.max(
      VECTOR_LENGTH_FALLBACK,
      Math.sqrt(normalX * normalX + normalY * normalY),
    );
    const unitX = normalX / normalLength;
    const unitY = normalY / normalLength;
    const dot = this.dx * unitX + this.dy * unitY;

    this.dx -= 2 * dot * unitX;
    this.dy -= 2 * dot * unitY;
    this.currentSpeed = roundSpeedValue(Math.sqrt(this.dx * this.dx + this.dy * this.dy));
  }

  registerBrickHit() {
    this.blockHitsThisRun += 1;
    this.reduceSpeedAfterBrickHit();
  }

  getBrickHitsThisRun() {
    return this.blockHitsThisRun;
  }

  resetBrickHits() {
    this.blockHitsThisRun = 0;
  }

  getLastSpeedReduction() {
    return this.lastSpeedReduction;
  }

  getSpeedStateSnapshot(): SpeedStateSnapshot {
    const currentSpeed = this.getCurrentSpeedMagnitude();
    return {
      level: this.level,
      initialBrickCount: this.initialBrickCount,
      successfulBrickHits: this.blockHitsThisRun,
      initialSpawnSpeed: this.initialSpawnSpeed,
      maxSpeed: this.maxSpeed,
      minSpeed: this.minSpeed,
      currentSpeed,
      reductionPerBrick: this.reductionPerBrick,
      previousLevelMaxSpeed: this.previousLevelMaxSpeed,
      levelStartedAt: this.levelStartedAt,
      elapsedLevelMs: Math.max(0, Date.now() - this.levelStartedAt),
      minReached: currentSpeed <= this.minSpeed
    };
  }

  consumePaddleCollision() {
    const collided = this.paddleCollision;
    this.paddleCollision = false;
    return collided;
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setDirection(angle: number) {
    this.setVelocityFromAngleAndSpeed(angle, this.getCurrentSpeedMagnitude());
  }

  createClone(angleOffset: number): Ball {
    const clone = new Ball(
      this.canvasWidth,
      this.canvasHeight,
      this.dimensions,
      this.speedMultiplier,
      this.resolveAssetPath,
      this.geometry,
      this.onElectricImpact,
    );
    clone.x = this.x;
    clone.y = this.y;
    clone.level = this.level;
    clone.maxSpeed = this.maxSpeed;
    clone.minSpeed = this.minSpeed;
    clone.initialSpawnSpeed = this.initialSpawnSpeed;
    clone.currentSpeed = this.currentSpeed;
    clone.reductionPerBrick = this.reductionPerBrick;
    clone.initialBrickCount = this.initialBrickCount;
    clone.previousLevelMaxSpeed = this.previousLevelMaxSpeed;
    clone.levelStartedAt = this.levelStartedAt;
    clone.setVelocityFromAngleAndSpeed(this.getCurrentAngle() + angleOffset, this.getCurrentSpeedMagnitude(), false);
    return clone;
  }

  multiplyVelocity(multiplier: number) {
    const nextSpeed = roundSpeedValue(this.getCurrentSpeedMagnitude() * multiplier);
    const angle = this.getCurrentAngle();
    this.currentSpeed = nextSpeed;
    this.dx = nextSpeed * Math.sin(angle);
    this.dy = -nextSpeed * Math.cos(angle);
  }

  private setVelocityFromAngleAndSpeed(angle: number, speed: number, clampMax = true) {
    const maxSpeed = clampMax ? this.maxSpeed || speed : Math.max(speed, this.maxSpeed || speed);
    const clampedSpeed = calculateClampedSpeed(speed, this.minSpeed, maxSpeed);
    this.currentSpeed = clampedSpeed;
    this.dx = clampedSpeed * Math.sin(angle);
    this.dy = -clampedSpeed * Math.cos(angle);
  }

  private setVelocityFromVector(vectorX: number, vectorY: number, speed: number) {
    const vectorLength = Math.max(
      VECTOR_LENGTH_FALLBACK,
      Math.sqrt(vectorX * vectorX + vectorY * vectorY),
    );
    const clampedSpeed = calculateClampedSpeed(speed, this.minSpeed, this.maxSpeed);
    this.currentSpeed = clampedSpeed;
    this.dx = (vectorX / vectorLength) * clampedSpeed;
    this.dy = (vectorY / vectorLength) * clampedSpeed;
  }

  private getCurrentAngle() {
    return Math.atan2(this.dx, -this.dy);
  }

  private reduceSpeedAfterBrickHit() {
    const speedBefore = this.getCurrentSpeedMagnitude();
    const nextSpeed = roundSpeedValue(Math.max(this.minSpeed, speedBefore - this.reductionPerBrick));
    const reductionApplied = roundSpeedValue(speedBefore - nextSpeed);

    this.setVelocityFromAngleAndSpeed(this.getCurrentAngle(), nextSpeed, false);
    this.lastSpeedReduction = {
      level: this.level,
      hitNumber: this.blockHitsThisRun,
      speedBefore,
      speedAfter: nextSpeed,
      reductionApplied,
      minSpeed: this.minSpeed,
      maxSpeed: this.maxSpeed,
      minReached: nextSpeed <= this.minSpeed,
      elapsedLevelMs: Math.max(0, Date.now() - this.levelStartedAt)
    };
  }
}
