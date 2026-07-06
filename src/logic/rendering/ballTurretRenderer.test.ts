import {
  drawBallTurretBackdrop,
  drawBallTurretGlassOverlay,
  drawBallTurretTrampoline,
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
});
