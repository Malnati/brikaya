const TWO_PI = Math.PI * 2;
const FULL_ARC_COUNT = 5;
const ARC_SEGMENTS = 5;
const PULSE_RATE = 7.1;
const ORBIT_PHASE = 2.399963229728653;
const VISUAL_PULSE_RATIO = 0.08;
const HALO_RADIUS_RATIO = 1.7;
const CORE_HIGHLIGHT_RATIO = 0.08;
const ARC_MIN_RADIUS_RATIO = 0.18;
const ARC_RADIUS_RANGE_RATIO = 0.68;
const ARC_ZIGZAG_RATIO = 0.1;
const ARC_SPAN_BASE = 1.15;
const ARC_SPAN_VARIANCE = 0.52;
const ARC_ALPHA_BASE = 0.62;
const ARC_ALPHA_VARIANCE = 0.22;
const NODE_RADIUS_RATIO = 0.085;
const MIN_LINE_WIDTH = 1;

const ENERGY_BALL_THEMES = {
  cyan: {
    haloMid: [125, 249, 255],
    haloOuter: [0, 178, 255],
    coreLight: "#dffcff",
    coreMid: "#46e8ff",
    coreDark: "#087cc6",
    coreDeep: "#02132f",
    shadow: "#7df9ff",
    arcAlt: [126, 249, 255],
    shell: "rgba(185, 244, 255, 0.9)",
    shellShadow: "#b9f4ff",
  },
  red: {
    haloMid: [255, 120, 140],
    haloOuter: [200, 40, 70],
    coreLight: "#ffe8ec",
    coreMid: "#ff5d73",
    coreDark: "#c41e3a",
    coreDeep: "#2a0610",
    shadow: "#ff8a9a",
    arcAlt: [255, 130, 150],
    shell: "rgba(255, 180, 190, 0.9)",
    shellShadow: "#ffb4be",
  },
  green: {
    haloMid: [100, 245, 170],
    haloOuter: [30, 180, 100],
    coreLight: "#e8fff2",
    coreMid: "#45f08f",
    coreDark: "#1a9e55",
    coreDeep: "#031a10",
    shadow: "#64f5d6",
    arcAlt: [110, 255, 180],
    shell: "rgba(160, 255, 200, 0.9)",
    shellShadow: "#8ef5c8",
  },
};

export class ElectricEnergyBallPreview {
  constructor(centerX = 60, centerY = 60, radius = 18, colorTheme = "cyan") {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.colorTheme = ENERGY_BALL_THEMES[colorTheme] ? colorTheme : "cyan";
  }

  get theme() {
    return ENERGY_BALL_THEMES[this.colorTheme];
  }

  draw(ctx, now = Date.now()) {
    const rawTime = now / 1000;
    const pulse = Math.sin(rawTime * PULSE_RATE) * VISUAL_PULSE_RATIO;
    const visualRadius = this.radius * (1 + pulse);

    ctx.save();
    try {
      ctx.translate(this.centerX, this.centerY);
      this.drawOuterHalo(ctx, visualRadius, rawTime);
      this.drawCore(ctx, visualRadius);
      this.drawArcs(ctx, visualRadius, rawTime);
      this.drawShell(ctx, visualRadius);
    } finally {
      ctx.restore();
    }
  }

  drawOuterHalo(ctx, visualRadius, rawTime) {
    const theme = this.theme;
    const haloRadius = visualRadius * HALO_RADIUS_RATIO;
    const haloPulse = Math.sin(rawTime * 4.3) * 0.08;
    const haloGradient = ctx.createRadialGradient(0, 0, visualRadius * CORE_HIGHLIGHT_RATIO, 0, 0, haloRadius);
    haloGradient.addColorStop(0, "rgba(255, 255, 255, 0.92)");
    haloGradient.addColorStop(
      0.28,
      `rgba(${theme.haloMid[0]}, ${theme.haloMid[1]}, ${theme.haloMid[2]}, ${0.52 + haloPulse})`,
    );
    haloGradient.addColorStop(
      0.64,
      `rgba(${theme.haloOuter[0]}, ${theme.haloOuter[1]}, ${theme.haloOuter[2]}, ${0.2 + haloPulse * 0.5})`,
    );
    haloGradient.addColorStop(1, "rgba(0, 30, 80, 0)");
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = haloGradient;
    ctx.beginPath();
    ctx.arc(0, 0, haloRadius, 0, TWO_PI);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  drawCore(ctx, visualRadius) {
    const theme = this.theme;
    const coreGradient = ctx.createRadialGradient(
      -visualRadius * 0.32,
      -visualRadius * 0.35,
      visualRadius * CORE_HIGHLIGHT_RATIO,
      0,
      0,
      visualRadius,
    );
    coreGradient.addColorStop(0, "#ffffff");
    coreGradient.addColorStop(0.22, theme.coreLight);
    coreGradient.addColorStop(0.48, theme.coreMid);
    coreGradient.addColorStop(0.78, theme.coreDark);
    coreGradient.addColorStop(1, theme.coreDeep);
    ctx.shadowColor = theme.shadow;
    ctx.shadowBlur = Math.max(2, visualRadius * 0.65);
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, visualRadius, 0, TWO_PI);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawArcs(ctx, visualRadius, rawTime) {
    const theme = this.theme;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = theme.coreLight;
    ctx.shadowBlur = Math.max(2, visualRadius * 0.35);
    for (let index = 0; index < FULL_ARC_COUNT; index += 1) {
      this.drawArc(ctx, visualRadius, rawTime, index);
    }
    ctx.restore();
  }

  drawArc(ctx, visualRadius, rawTime, index) {
    const theme = this.theme;
    const motion = rawTime * (1.45 + index * 0.31);
    const startAngle = (index * ORBIT_PHASE + motion) % TWO_PI;
    const arcSpan = ARC_SPAN_BASE + Math.sin(rawTime * 1.7 + index) * ARC_SPAN_VARIANCE;
    const strokeAlpha = ARC_ALPHA_BASE + Math.sin(rawTime * 3.2 + index) * ARC_ALPHA_VARIANCE;
    ctx.strokeStyle =
      index % 2 === 0
        ? `rgba(255, 255, 255, ${strokeAlpha})`
        : `rgba(${theme.arcAlt[0]}, ${theme.arcAlt[1]}, ${theme.arcAlt[2]}, ${strokeAlpha})`;
    ctx.lineWidth = Math.max(MIN_LINE_WIDTH, visualRadius * (index % 2 === 0 ? 0.13 : 0.09));
    ctx.beginPath();
    for (let step = 0; step <= ARC_SEGMENTS; step += 1) {
      const progress = step / ARC_SEGMENTS;
      const angle = startAngle + arcSpan * progress;
      const radialWave = Math.sin(rawTime * (2.1 + index * 0.37) + step * 1.9 + index * ORBIT_PHASE);
      const radiusRatio = ARC_MIN_RADIUS_RATIO + ARC_RADIUS_RANGE_RATIO * (0.5 + radialWave * 0.5);
      const zigzag = (step % 2 === 0 ? -1 : 1) * visualRadius * ARC_ZIGZAG_RATIO;
      const radialDistance = Math.min(
        visualRadius * 0.86,
        Math.max(visualRadius * 0.16, visualRadius * radiusRatio + zigzag),
      );
      const pointX = Math.cos(angle) * radialDistance;
      const pointY = Math.sin(angle) * radialDistance;
      if (step === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    }
    ctx.stroke();
    const nodeRadius = Math.max(0.8, visualRadius * NODE_RADIUS_RATIO * (index % 2 === 0 ? 1 : 0.72));
    const distance = visualRadius * (0.26 + (index % 3) * 0.16);
    const endAngle = startAngle + arcSpan;
    ctx.fillStyle =
      index % 2 === 0
        ? "rgba(255, 255, 255, 0.95)"
        : `rgba(${theme.arcAlt[0]}, ${theme.arcAlt[1]}, ${theme.arcAlt[2]}, 0.88)`;
    ctx.beginPath();
    ctx.arc(Math.cos(endAngle) * distance, Math.sin(endAngle) * distance, nodeRadius, 0, TWO_PI);
    ctx.fill();
  }

  drawShell(ctx, visualRadius) {
    const theme = this.theme;
    ctx.strokeStyle = theme.shell;
    ctx.lineWidth = Math.max(MIN_LINE_WIDTH, visualRadius * 0.12);
    ctx.shadowColor = theme.shellShadow;
    ctx.shadowBlur = Math.max(1.5, visualRadius * 0.28);
    ctx.beginPath();
    ctx.arc(0, 0, visualRadius * 0.94, 0, TWO_PI);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}
