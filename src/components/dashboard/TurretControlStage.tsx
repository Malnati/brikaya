import { useEffect, useRef } from "react";

import { calculateDynamicDimensions } from "../../constants/game";
import {
  drawBallTurretBackdrop,
  drawBallTurretGlassOverlay,
  drawBallTurretTrampoline,
} from "../../logic/rendering/ballTurretRenderer";
import {
  calculateBallTurretPlayfieldGeometry,
  calculateRadialPaddleBounds,
} from "../../utils/radialGeometry";

const STAGE_SIZE = 240;
const PREVIEW_LEVEL = 1;
const PADDLE_CENTER_ANGLE = -Math.PI / 2;
const PADDLE_WIDTH_SCALE = 1;

export function TurretControlStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const canvasSize = { width: STAGE_SIZE, height: STAGE_SIZE };
    const dimensions = calculateDynamicDimensions(
      canvasSize.width,
      canvasSize.height,
    );
    const geometry = calculateBallTurretPlayfieldGeometry(
      canvasSize.width,
      canvasSize.height,
      dimensions,
    );
    const paddlePosition = calculateRadialPaddleBounds(
      geometry,
      dimensions,
      PADDLE_CENTER_ANGLE,
      PADDLE_WIDTH_SCALE,
    );
    const renderState = {
      canvasSize,
      geometry,
      level: PREVIEW_LEVEL,
      paddlePosition,
    };

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    drawBallTurretBackdrop(ctx, renderState);
    drawBallTurretTrampoline(ctx, renderState);
    drawBallTurretGlassOverlay(ctx, renderState);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="dashboard-element-stage__canvas"
      width={STAGE_SIZE}
      height={STAGE_SIZE}
      role="img"
      aria-label="Prévia do controle da Torreta renderizado pelo motor do jogo"
    />
  );
}
