import {
  drawBallTurretBackdrop,
  drawBallTurretGlassOverlay,
  drawBallTurretReticle,
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
    geometry: {
      centerX: 240,
      centerY: 160,
      radius: 160,
      brickArcStartAngle: -2.6,
      brickArcEndAngle: -0.52,
      brickRingStartRadius: 44,
      brickRingEndRadius: 118,
      paddleRadius: 144,
      lossArcStartAngle: 0.5,
      lossArcEndAngle: 2.64,
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
      },
    },
  };
}

describe("ballTurretRenderer", () => {
  it("desenha fundo, retícula e vidro sem depender de asset externo", () => {
    const ctx = createMockContext();
    const state = createState();

    drawBallTurretBackdrop(ctx, state);
    drawBallTurretReticle(ctx, state);
    drawBallTurretGlassOverlay(ctx, state);

    expect(ctx.createRadialGradient).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledWith(240, 160, 160, 0, Math.PI * 2);
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 480, 320);
  });
});
