import {
  ELECTRIC_LIGHTNING_CORE_COLOR,
  ELECTRIC_LIGHTNING_HALO_COLOR,
  ELECTRIC_LIGHTNING_SHADOW_COLOR,
  calculateLightningFadeAlpha,
  clampProgress,
  drawLightningPulse,
  drawLightningSideBranches,
  easeCubicOut,
  strokeLightningPath,
} from "./electric-lightning-renderer.mjs";

const TRAVEL_COMPLETE_PROGRESS = 0.82;
const DURATION_MS = 420;
const SPAWN_INTERVAL_MS = 1200;
const BRANCH_SEGMENTS = 7;
const ZIGZAG_AMPLITUDE = 5.2;
const HALO_LINE_WIDTH = 4.8;
const CORE_LINE_WIDTH = 1.85;
const ORIGIN_PULSE_RADIUS = 7.5;
const ENDPOINT_PULSE_RADIUS = 4.8;
const ENDPOINT_START_PROGRESS = 0.86;
const SIDE_BRANCH_COUNT = 2;

const IMPACT_LIGHTNING_STYLE = {
  coreColor: ELECTRIC_LIGHTNING_CORE_COLOR,
  haloColor: ELECTRIC_LIGHTNING_HALO_COLOR,
  shadowColor: ELECTRIC_LIGHTNING_SHADOW_COLOR,
};

const IMPACT_DEMOS = {
  component: {
    origin: { x: 140, y: 100 },
    endpoints: [
      { x: 90, y: 55 },
      { x: 190, y: 145 },
    ],
  },
  wall: {
    origin: { x: 140, y: 100 },
    endpoints: [
      { x: 40, y: 100 },
      { x: 240, y: 100 },
    ],
  },
  ceiling: {
    origin: { x: 140, y: 130 },
    endpoints: [
      { x: 95, y: 35 },
      { x: 185, y: 35 },
    ],
  },
  "radial-wall": {
    origin: { x: 140, y: 100 },
    endpoints: [
      { x: 140, y: 30 },
      { x: 240, y: 100 },
      { x: 140, y: 170 },
      { x: 40, y: 100 },
    ],
  },
};

export class ElectricImpactPreview {
  constructor(kind = "component") {
    this.kind = kind;
    this.activeEffect = null;
    this.lastSpawnAt = 0;
    this.seed = 0;
  }

  setKind(kind) {
    this.kind = kind;
    this.activeEffect = null;
    this.lastSpawnAt = 0;
  }

  tick(now) {
    if (
      !this.activeEffect ||
      now - this.activeEffect.startedAt >= this.activeEffect.durationMs
    ) {
      if (!this.activeEffect || now - this.lastSpawnAt >= SPAWN_INTERVAL_MS) {
        this.spawn(now);
      }
    }
  }

  spawn(now) {
    const demo = IMPACT_DEMOS[this.kind] ?? IMPACT_DEMOS.component;
    this.seed += 1;
    this.activeEffect = {
      origin: { ...demo.origin },
      endpoints: demo.endpoints.map((endpoint) => ({ ...endpoint })),
      startedAt: now,
      durationMs: DURATION_MS,
      seed: this.seed,
    };
    this.lastSpawnAt = now;
  }

  draw(ctx, now) {
    if (!this.activeEffect) return;
    const progress = clampProgress(
      (now - this.activeEffect.startedAt) / this.activeEffect.durationMs,
    );
    const travelProgress = easeCubicOut(
      clampProgress(progress / TRAVEL_COMPLETE_PROGRESS),
    );
    const fadeAlpha = calculateLightningFadeAlpha(progress);
    const scale = 1;

    ctx.save();
    try {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "lighter";
      drawLightningPulse(
        ctx,
        this.activeEffect.origin,
        ORIGIN_PULSE_RADIUS * scale,
        fadeAlpha * 0.72,
        IMPACT_LIGHTNING_STYLE,
      );

      this.activeEffect.endpoints.forEach((endpoint, endpointIndex) => {
        this.drawBranch(ctx, endpoint, endpointIndex, travelProgress, fadeAlpha, scale);
        if (progress >= ENDPOINT_START_PROGRESS) {
          drawLightningPulse(
            ctx,
            endpoint,
            ENDPOINT_PULSE_RADIUS * scale,
            fadeAlpha * 0.64,
            IMPACT_LIGHTNING_STYLE,
          );
        }
      });
    } finally {
      ctx.restore();
    }
  }

  drawBranch(ctx, endpoint, endpointIndex, travelProgress, fadeAlpha, scale) {
    const effect = this.activeEffect;
    ctx.shadowColor = ELECTRIC_LIGHTNING_SHADOW_COLOR;
    ctx.shadowBlur = HALO_LINE_WIDTH * scale * 1.7;
    ctx.globalAlpha = fadeAlpha;
    ctx.strokeStyle = ELECTRIC_LIGHTNING_HALO_COLOR;
    ctx.lineWidth = HALO_LINE_WIDTH * scale;
    strokeLightningPath(
      ctx,
      effect.origin,
      endpoint,
      travelProgress,
      BRANCH_SEGMENTS,
      effect.seed,
      endpointIndex,
      ZIGZAG_AMPLITUDE,
      scale,
    );

    ctx.shadowBlur = CORE_LINE_WIDTH * scale * 2.2;
    ctx.globalAlpha = fadeAlpha * 0.95;
    ctx.strokeStyle = ELECTRIC_LIGHTNING_CORE_COLOR;
    ctx.lineWidth = CORE_LINE_WIDTH * scale;
    strokeLightningPath(
      ctx,
      effect.origin,
      endpoint,
      travelProgress,
      BRANCH_SEGMENTS,
      effect.seed,
      endpointIndex,
      ZIGZAG_AMPLITUDE,
      scale,
    );

    drawLightningSideBranches(
      ctx,
      effect.origin,
      endpoint,
      travelProgress,
      fadeAlpha,
      effect.seed,
      endpointIndex,
      SIDE_BRANCH_COUNT,
      scale,
    );
  }
}
