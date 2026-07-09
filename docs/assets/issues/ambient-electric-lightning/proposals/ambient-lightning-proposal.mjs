const FULL_CIRCLE = Math.PI * 2;
const PROGRESS_MAX = 1;
const SEED_SEQUENCE_MULTIPLIER = 2_654_435_761;
const SEED_MODULO = 9_973;
const SEED_NORMALIZER = 9_973;

export const ELECTRIC_LIGHTNING_CORE_COLOR = "rgba(238, 253, 255, 0.92)";
export const ELECTRIC_LIGHTNING_HALO_COLOR = "rgba(66, 224, 255, 0.34)";
export const ELECTRIC_LIGHTNING_SHADOW_COLOR = "rgba(77, 232, 255, 0.88)";

export const AMBIENT_ELECTRIC_PRESETS = {
  pulse: {
    id: "pulse",
    label: "Pulse",
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
    label: "Arcade",
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
    label: "Storm",
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

const FULL_BRANCH_SEGMENTS = 7;
const REDUCED_BRANCH_SEGMENTS = 3;
const ORIGIN_PULSE_RADIUS = 7.5;
const ENDPOINT_PULSE_RADIUS = 4.8;
const ENDPOINT_START_PROGRESS = 0.86;
const CORE_LINE_WIDTH = 1.85;
const HALO_LINE_WIDTH = 4.8;

export function clampProgress(value) {
  return Math.max(0, Math.min(PROGRESS_MAX, value));
}

export function easeCubicOut(progress) {
  const clamped = clampProgress(progress);
  return 1 - Math.pow(1 - clamped, 3);
}

export function lightningUnitValue(seed, salt) {
  return (
    ((seed + salt * SEED_SEQUENCE_MULTIPLIER) % SEED_MODULO) / SEED_NORMALIZER
  );
}

export function calculateLightningFadeAlpha(progress, fadeStartProgress = 0.68) {
  if (progress <= fadeStartProgress) return 1;
  const fadeProgress =
    (progress - fadeStartProgress) / (PROGRESS_MAX - fadeStartProgress);
  return clampProgress(1 - fadeProgress);
}

export function buildZigzagPoint(
  origin,
  endpoint,
  progress,
  step,
  seed,
  salt,
  zigzagAmplitude,
  scale,
) {
  const dx = endpoint.x - origin.x;
  const dy = endpoint.y - origin.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;
  const jitter =
    step === 0 || progress >= PROGRESS_MAX
      ? 0
      : (lightningUnitValue(seed, salt) - 0.5) *
        zigzagAmplitude *
        scale *
        Math.sin(Math.PI * progress);

  return {
    x: origin.x + dx * progress + normalX * jitter,
    y: origin.y + dy * progress + normalY * jitter,
  };
}

function strokePath(
  ctx,
  origin,
  endpoint,
  travelProgress,
  segments,
  seed,
  salt,
  zigzagAmplitude,
  scale,
) {
  ctx.beginPath();
  for (let step = 0; step <= segments; step += 1) {
    const pathProgress = (step / segments) * travelProgress;
    const point = buildZigzagPoint(
      origin,
      endpoint,
      pathProgress,
      step,
      seed,
      salt + step,
      zigzagAmplitude,
      scale,
    );
    if (step === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}

export function strokeLightningPath(
  ctx,
  origin,
  endpoint,
  travelProgress,
  segments,
  seed,
  salt,
  zigzagAmplitude,
  scale,
  style,
) {
  ctx.shadowColor = style.shadowColor;
  ctx.shadowBlur = style.shadowBlur;
  ctx.globalAlpha = style.alpha;
  ctx.strokeStyle = style.haloColor;
  ctx.lineWidth = style.haloLineWidth;
  strokePath(
    ctx,
    origin,
    endpoint,
    travelProgress,
    segments,
    seed,
    salt,
    zigzagAmplitude,
    scale,
  );

  ctx.shadowBlur = style.shadowBlur * 0.55;
  ctx.globalAlpha = style.alpha * 0.95;
  ctx.strokeStyle = style.coreColor;
  ctx.lineWidth = style.coreLineWidth;
  strokePath(
    ctx,
    origin,
    endpoint,
    travelProgress,
    segments,
    seed,
    salt,
    zigzagAmplitude,
    scale,
  );
}

export function drawLightningPulse(ctx, point, radius, alpha, colors = {}) {
  if (radius <= 0 || alpha <= 0) return;

  const coreColor = colors.coreColor ?? ELECTRIC_LIGHTNING_CORE_COLOR;
  const haloColor = colors.haloColor ?? ELECTRIC_LIGHTNING_HALO_COLOR;
  const shadowColor = colors.shadowColor ?? ELECTRIC_LIGHTNING_SHADOW_COLOR;

  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = radius * 1.8;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = haloColor;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, FULL_CIRCLE);
  ctx.fill();

  ctx.globalAlpha = alpha * 0.72;
  ctx.fillStyle = coreColor;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius * 0.36, 0, FULL_CIRCLE);
  ctx.fill();
}

export function drawLightningSideBranches(
  ctx,
  origin,
  endpoint,
  travelProgress,
  branchCount,
  seed,
  salt,
  fadeAlpha,
  scale,
  options = {},
) {
  if (branchCount === 0 || travelProgress < (options.branchStartProgress ?? 0.22)) {
    return;
  }

  const dx = endpoint.x - origin.x;
  const dy = endpoint.y - origin.y;
  const baseAngle = Math.atan2(dy, dx);
  const distance = Math.hypot(dx, dy);
  const branchLengthRatio = options.branchLengthRatio ?? 0.16;
  const branchAngle = options.branchAngle ?? Math.PI / 3.2;

  ctx.strokeStyle = options.coreColor ?? ELECTRIC_LIGHTNING_CORE_COLOR;
  ctx.lineWidth = options.coreLineWidth ?? Math.max(1, 1.15 * scale * 0.62);
  ctx.shadowBlur = options.shadowBlur ?? 4.8 * scale;
  ctx.globalAlpha = fadeAlpha * 0.56;

  for (let branchIndex = 0; branchIndex < branchCount; branchIndex += 1) {
    const branchSalt = salt + branchIndex * 29;
    const startProgress =
      (0.28 + lightningUnitValue(seed, branchSalt) * 0.46) * travelProgress;
    const branchLength =
      distance *
      branchLengthRatio *
      (0.62 + lightningUnitValue(seed, branchSalt + 1) * 0.54);
    const branchDirection =
      baseAngle +
      (branchIndex % 2 === 0 ? -1 : 1) *
        branchAngle *
        (0.72 + lightningUnitValue(seed, branchSalt + 2) * 0.5);
    const branchStart = {
      x: origin.x + dx * startProgress,
      y: origin.y + dy * startProgress,
    };

    ctx.beginPath();
    ctx.moveTo(branchStart.x, branchStart.y);
    ctx.lineTo(
      branchStart.x + Math.cos(branchDirection) * branchLength,
      branchStart.y + Math.sin(branchDirection) * branchLength,
    );
    ctx.stroke();
  }
}

export function randomPointInCircle(geometry, seed, salt, edgeBias = 0.42) {
  const unitA = lightningUnitValue(seed, salt);
  const unitB = lightningUnitValue(seed, salt + 1);
  const unitC = lightningUnitValue(seed, salt + 2);
  const angle = unitA * FULL_CIRCLE;
  const radiusRatio = edgeBias + (1 - edgeBias) * unitB;
  const distance = geometry.radius * radiusRatio * (0.35 + unitC * 0.65);

  return {
    x: geometry.centerX + Math.cos(angle) * distance,
    y: geometry.centerY + Math.sin(angle) * distance,
  };
}

export function randomEndpointAcrossCircle(geometry, origin, seed, salt) {
  const angle = lightningUnitValue(seed, salt + 3) * FULL_CIRCLE;
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  const oc = {
    x: origin.x - geometry.centerX,
    y: origin.y - geometry.centerY,
  };
  const b = 2 * (oc.x * direction.x + oc.y * direction.y);
  const c = oc.x * oc.x + oc.y * oc.y - geometry.radius * geometry.radius;
  const discriminant = b * b - 4 * c;

  if (discriminant < 0) {
    return {
      x: origin.x + direction.x * geometry.radius,
      y: origin.y + direction.y * geometry.radius,
    };
  }

  const sqrtDisc = Math.sqrt(discriminant);
  const t1 = (-b + sqrtDisc) / 2;
  const t2 = (-b - sqrtDisc) / 2;
  const positiveTs = [t1, t2].filter((value) => value > 1);
  const travelDistance =
    positiveTs.length > 0
      ? Math.min(...positiveTs)
      : Math.max(t1, t2, geometry.radius * 0.5);

  return {
    x: origin.x + direction.x * travelDistance,
    y: origin.y + direction.y * travelDistance,
  };
}

export class AmbientElectricProposal {
  constructor(variant = "arcade") {
    this.variant = variant;
    this.bolts = [];
    this.nextSpawnAt = 0;
    this.sequence = 0;
    this.paused = false;
    this.manualSeed = 0;
  }

  setVariant(variant) {
    this.variant = variant;
    this.bolts = [];
    this.nextSpawnAt = 0;
  }

  reset(now = Date.now()) {
    this.bolts = [];
    this.sequence = this.manualSeed;
    this.nextSpawnAt = now;
  }

  setManualSeed(seed) {
    this.manualSeed = seed;
    this.sequence = seed;
  }

  setPaused(paused) {
    this.paused = paused;
  }

  forceBolt(geometry, now = Date.now()) {
    this.spawnBolt(geometry, now, true);
  }

  tick(geometry, now) {
    if (this.paused) return;

    const preset = AMBIENT_ELECTRIC_PRESETS[this.variant];
    this.bolts = this.bolts.filter((bolt) => now - bolt.startedAt <= bolt.durationMs);

    while (this.bolts.length < preset.minActiveBolts) {
      this.spawnBolt(geometry, now, true);
    }

    if (this.bolts.length >= preset.maxActiveBolts) return;
    if (now < this.nextSpawnAt) return;

    this.spawnBolt(geometry, now, false);
    const interval =
      preset.minSpawnIntervalMs +
      lightningUnitValue(this.sequence, 41) *
        (preset.maxSpawnIntervalMs - preset.minSpawnIntervalMs);
    this.nextSpawnAt = now + interval;
  }

  draw(ctx, geometry, now) {
    if (this.bolts.length === 0) return;

    ctx.save();
    try {
      ctx.beginPath();
      ctx.arc(geometry.centerX, geometry.centerY, geometry.radius, 0, FULL_CIRCLE);
      ctx.clip();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "lighter";

      for (const bolt of this.bolts) {
        const progress = clampProgress((now - bolt.startedAt) / bolt.durationMs);
        this.drawBolt(ctx, bolt, progress, geometry);
      }
    } finally {
      ctx.restore();
    }
  }

  drawBolt(ctx, bolt, progress) {
    const preset = AMBIENT_ELECTRIC_PRESETS[this.variant];
    const travelProgress = easeCubicOut(
      clampProgress(progress / preset.travelCompleteProgress),
    );
    const fadeAlpha =
      calculateLightningFadeAlpha(progress) *
      (preset.minAlpha + (preset.maxAlpha - preset.minAlpha) * bolt.intensity);

    drawLightningPulse(ctx, bolt.origin, ORIGIN_PULSE_RADIUS, fadeAlpha * 0.72);

    const haloWidth = HALO_LINE_WIDTH * (0.75 + bolt.intensity * 0.35);
    const coreWidth = CORE_LINE_WIDTH * (0.8 + bolt.intensity * 0.4);

    strokeLightningPath(
      ctx,
      bolt.origin,
      bolt.endpoint,
      travelProgress,
      bolt.segments,
      bolt.seed,
      17,
      bolt.intensity * preset.zigzagAmplitude,
      1,
      {
        coreColor: ELECTRIC_LIGHTNING_CORE_COLOR,
        haloColor: ELECTRIC_LIGHTNING_HALO_COLOR,
        shadowColor: ELECTRIC_LIGHTNING_SHADOW_COLOR,
        coreLineWidth: coreWidth,
        haloLineWidth: haloWidth,
        alpha: fadeAlpha,
        shadowBlur: haloWidth * 1.7,
      },
    );

    if (bolt.branchCount > 0) {
      drawLightningSideBranches(
        ctx,
        bolt.origin,
        bolt.endpoint,
        travelProgress,
        bolt.branchCount,
        bolt.seed,
        101,
        fadeAlpha,
        1,
      );
    }

    if (progress >= ENDPOINT_START_PROGRESS) {
      const endpointProgress = clampProgress(
        (progress - ENDPOINT_START_PROGRESS) / (1 - ENDPOINT_START_PROGRESS),
      );
      drawLightningPulse(
        ctx,
        bolt.endpoint,
        ENDPOINT_PULSE_RADIUS * endpointProgress,
        fadeAlpha * endpointProgress,
      );
    }
  }

  spawnBolt(geometry, now, immediate = false) {
    const preset = AMBIENT_ELECTRIC_PRESETS[this.variant];
    if (this.bolts.length >= preset.maxActiveBolts) return;

    this.sequence += 1;
    const seed = this.sequence * 1_009 + (immediate ? 17 : 0);
    const origin = randomPointInCircle(geometry, seed, 3);
    const endpoint = randomEndpointAcrossCircle(geometry, origin, seed, 7);
    const intensity = lightningUnitValue(seed, 11);
    const branchCount = Math.round(
      preset.minBranchCount +
        lightningUnitValue(seed, 13) * (preset.maxBranchCount - preset.minBranchCount),
    );
    const durationMs = Math.round(
      preset.minDurationMs +
        lightningUnitValue(seed, 19) * (preset.maxDurationMs - preset.minDurationMs),
    );
    const segments = Math.round(
      5 + lightningUnitValue(seed, 23) * (FULL_BRANCH_SEGMENTS - 5),
    );

    this.bolts.push({
      origin,
      endpoint,
      seed,
      startedAt: now,
      durationMs,
      intensity,
      branchCount,
      segments,
    });
  }
}

export function drawClassicBackdrop(ctx, geometry) {
  ctx.save();
  ctx.fillStyle = "rgba(7, 14, 28, 0.92)";
  ctx.strokeStyle = "rgba(125, 249, 255, 0.72)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(geometry.centerX, geometry.centerY, geometry.radius, 0, FULL_CIRCLE);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.arc(
    geometry.centerX,
    geometry.centerY,
    geometry.radius * 0.74,
    0,
    FULL_CIRCLE,
  );
  ctx.stroke();
  ctx.restore();
}

export function drawTurretBackdrop(ctx, geometry, canvasSize) {
  const gradient = ctx.createRadialGradient(
    geometry.centerX,
    geometry.centerY,
    geometry.radius * 0.08,
    geometry.centerX,
    geometry.centerY,
    geometry.radius,
  );
  gradient.addColorStop(0, "rgba(22, 54, 88, 0.96)");
  gradient.addColorStop(1, "rgba(2, 8, 20, 0.98)");

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(geometry.centerX, geometry.centerY, geometry.radius, 0, FULL_CIRCLE);
  ctx.fill();

  ctx.strokeStyle = "rgba(125, 249, 255, 0.16)";
  ctx.lineWidth = Math.max(1, geometry.radius * 0.006);
  for (let ring = 1; ring <= 3; ring += 1) {
    ctx.beginPath();
    ctx.arc(
      geometry.centerX,
      geometry.centerY,
      geometry.radius * (0.24 + ring * 0.16),
      0,
      FULL_CIRCLE,
    );
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = Math.max(1, geometry.radius * 0.005);
  ctx.beginPath();
  if (typeof ctx.ellipse === "function") {
    ctx.ellipse(
      geometry.centerX,
      geometry.centerY + geometry.radius * 0.1,
      geometry.radius * 0.72,
      geometry.radius * 0.18,
      0,
      Math.PI,
      FULL_CIRCLE,
    );
  } else {
    ctx.arc(
      geometry.centerX,
      geometry.centerY + geometry.radius * 0.1,
      geometry.radius * 0.72,
      Math.PI,
      FULL_CIRCLE,
    );
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(1, 5, 12, 0.2)";
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
  ctx.restore();
}

export function createProposalGeometry(canvasWidth, canvasHeight) {
  const radius = Math.min(canvasWidth, canvasHeight) * 0.42;
  return {
    centerX: canvasWidth / 2,
    centerY: canvasHeight / 2,
    radius,
  };
}
