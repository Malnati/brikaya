import {
  BALL_TURRET_LEFT_TRAMPOLINE_ACCENT,
  BALL_TURRET_RIGHT_TRAMPOLINE_ACCENT,
  drawBallTurretBackdrop,
  drawBallTurretGlassOverlay,
  drawBallTurretTrampoline,
  drawBallTurretTrampolines,
  type BallTurretRenderState,
} from "./ballTurretRenderer";

function createMockGradient() {
  return { addColorStop: jest.fn() } as unknown as CanvasGradient;
}

function createMockContext(): CanvasRenderingContext2D {
  const gradient = createMockGradient();
  return {
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    ellipse: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    fillRect: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    createRadialGradient: jest.fn(() => gradient),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    lineCap: "butt",
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

function createState(): BallTurretRenderState {
  return {
    canvasSize: { width: 480, height: 320 },
    level: 1,
    geometry: {
      centerX: 240,
      centerY: 160,
      radius: 160,
      brickArcStartAngle: -2.6,
      brickArcEndAngle: -0.52,
      brickRingStartRadius: 44,
      brickRingEndRadius: 118,
      paddleRadius: 144,
      paddleMovementStartAngle: -Math.PI,
      paddleMovementEndAngle: Math.PI,
      lossArcStartAngle: 0.5,
      lossArcEndAngle: 2.64,
      lossIsFullCircle: true,
      trampolineIsFullRing: true,
    },
    paddlePosition: {
      x: 198,
      y: 292,
      width: 84,
      height: 18,
      radial: {
        centerX: 240,
        centerY: 160,
        radius: 144,
        startAngle: 1.2,
        endAngle: 1.94,
        centerAngle: Math.PI / 2,
        thickness: 18,
        movementStartAngle: 0.2,
        movementEndAngle: 2.9,
        lossStartAngle: 0.5,
        lossEndAngle: 2.64,
        lossIsFullCircle: true,
      },
    },
  };
}

describe("ballTurretRenderer", () => {
  it("desenha fundo, cama elástica e vidro sem depender de asset externo", () => {
    const ctx = createMockContext();
    const state = createState();

    drawBallTurretBackdrop(ctx, state);
    drawBallTurretTrampoline(ctx, state);
    drawBallTurretGlassOverlay(ctx, state);

    expect(ctx.createRadialGradient).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledWith(240, 160, 160, 0, Math.PI * 2);
    expect(ctx.arc).toHaveBeenCalledWith(240, 160, 144, 0, Math.PI * 2);
    expect(ctx.arc).toHaveBeenCalledWith(240, 160, 144, 1.2, 1.94);
    expect(ctx.arc).toHaveBeenCalledWith(
      240,
      160,
      expect.closeTo(158),
      expect.closeTo(1.414),
      expect.closeTo(1.727),
    );
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 480, 320);
  });

  it("reduz molas e sombras quando efeitos leves estão ativos", () => {
    const ctx = createMockContext();

    drawBallTurretTrampoline(ctx, {
      ...createState(),
      reducedEffects: true,
    });

    expect(ctx.moveTo).toHaveBeenCalledTimes(7);
    expect((ctx as { shadowBlur?: number }).shadowBlur).toBe(0);
  });

  it("desenha duas camas elásticas ativas quando recebe dois lados", () => {
    const ctx = createMockContext();
    const state = createState();
    const leftPaddle = {
      ...state.paddlePosition,
      radial: {
        ...state.paddlePosition.radial,
        startAngle: 2.72,
        endAngle: 3.12,
        centerAngle: 2.92,
      },
    };
    const rightPaddle = {
      ...state.paddlePosition,
      radial: {
        ...state.paddlePosition.radial,
        startAngle: 0.02,
        endAngle: 0.42,
        centerAngle: 0.22,
      },
    };

    drawBallTurretTrampolines(
      ctx,
      { ...state, reducedEffects: true },
      [
        { paddlePosition: leftPaddle, accentColor: BALL_TURRET_LEFT_TRAMPOLINE_ACCENT },
        { paddlePosition: rightPaddle, accentColor: BALL_TURRET_RIGHT_TRAMPOLINE_ACCENT },
      ],
    );

    expect(ctx.arc).toHaveBeenCalledWith(
      240,
      160,
      144,
      2.72,
      3.12,
    );
    expect(ctx.arc).toHaveBeenCalledWith(240, 160, 144, 0.02, 0.42);
    expect(ctx.moveTo).toHaveBeenCalledTimes(14);
    expect(ctx.strokeStyle).toBe(BALL_TURRET_RIGHT_TRAMPOLINE_ACCENT);
  });

  it("mantém cor padrão para chamada legada com uma cama elástica", () => {
    const ctx = createMockContext();
    const state = createState();

    drawBallTurretTrampoline(ctx, { ...state, reducedEffects: true });

    expect(ctx.arc).toHaveBeenCalledWith(240, 160, 144, 1.2, 1.94);
    expect(ctx.strokeStyle).toBe("rgba(255, 245, 184, 0.82)");
  });
});
