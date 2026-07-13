import {
  ELECTRIC_LIGHTNING_CORE_COLOR,
  ELECTRIC_LIGHTNING_HALO_COLOR,
  ELECTRIC_LIGHTNING_SHADOW_COLOR,
  calculateLightningFadeAlpha,
  clampProgress,
  drawLightningPulse,
  drawLightningSideBranches,
  easeCubicOut,
  lightningUnitValue,
  randomEndpointAcrossCircle,
  randomPointInCircle,
  strokeLightningPath,
} from "./electric-lightning-renderer.mjs";

export const AMBIENT_ELECTRIC_PRESETS = {
  pulse: {
    id: "pulse",
    minActiveBolts: 1,
    maxActiveBolts: 2,
    minSpawnIntervalMs: 2500,
    maxSpawnIntervalMs: 4000,
    minAlpha: 0.12,
    maxAlpha: 0.3,
    minDurationMs: 320,
    maxDurationMs: 520,
    minBranchCount: 0,
    maxBranchCount: 1,
    zigzagAmplitude: 4.2,
    travelCompleteProgress: 0.84,
  },
  arcade: {
    id: "arcade",
    minActiveBolts: 2,
    maxActiveBolts: 4,
    minSpawnIntervalMs: 1200,
    maxSpawnIntervalMs: 2500,
    minAlpha: 0.22,
    maxAlpha: 0.5,
    minDurationMs: 360,
    maxDurationMs: 580,
    minBranchCount: 0,
    maxBranchCount: 2,
    zigzagAmplitude: 5.2,
    travelCompleteProgress: 0.82,
  },
  storm: {
    id: "storm",
    minActiveBolts: 4,
    maxActiveBolts: 6,
    minSpawnIntervalMs: 600,
    maxSpawnIntervalMs: 1500,
    minAlpha: 0.35,
    maxAlpha: 0.72,
    minDurationMs: 280,
    maxDurationMs: 680,
    minBranchCount: 1,
    maxBranchCount: 2,
    zigzagAmplitude: 6.4,
    travelCompleteProgress: 0.8,
  },
};

const LIGHTNING_STYLE = {
  coreColor: ELECTRIC_LIGHTNING_CORE_COLOR,
  haloColor: ELECTRIC_LIGHTNING_HALO_COLOR,
  shadowColor: ELECTRIC_LIGHTNING_SHADOW_COLOR,
};

export class AmbientElectricBackground {
  constructor(variant = "arcade") {
    this.bolts = [];
    this.nextSpawnAt = 0;
    this.sequence = 0;
    this.variant = variant;
  }

  setVariant(variant) {
    this.variant = variant;
    this.bolts = [];
    this.nextSpawnAt = 0;
  }

  tick(now, geometry, reducedEffects) {
    const preset = AMBIENT_ELECTRIC_PRESETS[this.variant];
    this.bolts = this.bolts.filter((bolt) => now - bolt.startedAt <= bolt.durationMs);
    const maxActive = reducedEffects ? 1 : preset.maxActiveBolts;
    while (this.bolts.length < maxActive && now >= this.nextSpawnAt) {
      this.spawnBolt(now, geometry, preset, reducedEffects);
      this.nextSpawnAt =
        now +
        (reducedEffects
          ? 4000
          : this.randomBetween(
              preset.minSpawnIntervalMs,
              preset.maxSpawnIntervalMs,
              this.sequence,
              11,
            ));
    }
  }

  draw(ctx, geometry, reducedEffects) {
    if (this.bolts.length === 0) return;
    const now = Date.now();
    ctx.save();
    try {
      ctx.beginPath();
      ctx.arc(geometry.centerX, geometry.centerY, geometry.radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "lighter";
      for (const bolt of this.bolts) {
        const progress = clampProgress((now - bolt.startedAt) / bolt.durationMs);
        this.drawBolt(ctx, bolt, progress, reducedEffects, 1);
      }
    } finally {
      ctx.restore();
    }
  }

  forceBolt(geometry, reducedEffects) {
    this.spawnBolt(
      Date.now(),
      geometry,
      AMBIENT_ELECTRIC_PRESETS[this.variant],
      reducedEffects,
    );
  }

  reset() {
    this.bolts = [];
    this.nextSpawnAt = 0;
    this.sequence = 0;
  }

  spawnBolt(now, circle, preset, reducedEffects) {
    const seed = this.sequence;
    this.sequence += 1;
    const origin = randomPointInCircle(circle, seed, 3);
    const endpoint = randomEndpointAcrossCircle(circle, origin, seed, 7);
    this.bolts.push({
      origin,
      endpoint,
      seed,
      startedAt: now,
      durationMs: this.randomBetween(
        preset.minDurationMs,
        preset.maxDurationMs,
        seed,
        17,
      ),
      intensity: this.randomBetween(preset.minAlpha, preset.maxAlpha, seed, 19),
      branchCount: reducedEffects
        ? 0
        : Math.round(
            this.randomBetween(
              preset.minBranchCount,
              preset.maxBranchCount,
              seed,
              13,
            ),
          ),
      segments: reducedEffects ? 3 : 7,
    });
  }

  drawBolt(ctx, bolt, progress, reducedEffects, scale) {
    const preset = AMBIENT_ELECTRIC_PRESETS[this.variant];
    const travelProgress = easeCubicOut(
      clampProgress(progress / preset.travelCompleteProgress),
    );
    const fadeAlpha = calculateLightningFadeAlpha(progress) * bolt.intensity;
    drawLightningPulse(ctx, bolt.origin, 7.5 * scale, fadeAlpha * 0.72, LIGHTNING_STYLE);
    ctx.shadowColor = ELECTRIC_LIGHTNING_SHADOW_COLOR;
    ctx.shadowBlur = reducedEffects ? 4.8 : 8.16;
    ctx.globalAlpha = fadeAlpha;
    ctx.strokeStyle = ELECTRIC_LIGHTNING_HALO_COLOR;
    ctx.lineWidth = 4.8 * scale;
    strokeLightningPath(
      ctx,
      bolt.origin,
      bolt.endpoint,
      travelProgress,
      bolt.segments,
      bolt.seed,
      0,
      preset.zigzagAmplitude,
      scale,
    );
    ctx.shadowBlur = reducedEffects ? 1.85 : 4.07;
    ctx.globalAlpha = fadeAlpha * 0.95;
    ctx.strokeStyle = ELECTRIC_LIGHTNING_CORE_COLOR;
    ctx.lineWidth = 1.85 * scale;
    strokeLightningPath(
      ctx,
      bolt.origin,
      bolt.endpoint,
      travelProgress,
      bolt.segments,
      bolt.seed,
      0,
      preset.zigzagAmplitude,
      scale,
    );
    drawLightningSideBranches(
      ctx,
      bolt.origin,
      bolt.endpoint,
      travelProgress,
      fadeAlpha,
      bolt.seed,
      0,
      bolt.branchCount,
      scale,
    );
  }

  randomBetween(min, max, seed, salt) {
    return min + lightningUnitValue(seed, salt) * (max - min);
  }
}
