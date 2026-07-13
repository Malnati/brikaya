import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifest = fs.readFileSync(path.join(__dirname, "palette-manifest.json"), "utf8");
const renderer = fs
  .readFileSync(path.join(__dirname, "electric-lightning-renderer.mjs"), "utf8")
  .replace(/^export /gm, "");
const ambient = fs
  .readFileSync(path.join(__dirname, "electric-palette-ambient.mjs"), "utf8")
  .replace(/^import[\s\S]*?;\n\n/m, "")
  .replace(/^export /gm, "");
const energyBall = fs
  .readFileSync(path.join(__dirname, "electric-palette-energy-ball.mjs"), "utf8")
  .replace(/^import[\s\S]*?;\n\n/m, "")
  .replace(/^export /gm, "");
const impact = fs
  .readFileSync(path.join(__dirname, "electric-palette-impact.mjs"), "utf8")
  .replace(/^import[\s\S]*?;\n\n/m, "")
  .replace(/^export /gm, "");
const electricEdge = fs
  .readFileSync(path.join(__dirname, "electric-palette-electric-edge.mjs"), "utf8")
  .replace(/^import[\s\S]*?;\n\n/m, "")
  .replace(/^export /gm, "");
const componentEnergy = fs
  .readFileSync(path.join(__dirname, "electric-palette-component-energy.mjs"), "utf8")
  .replace(/^import[\s\S]*?;\n\n/m, "")
  .replace(/^export /gm, "");

const htmlPrefix = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Paleta de componentes elétricos — Brikaya</title>
  <style>
    :root { color-scheme: dark; font-family: system-ui, sans-serif; }
    body { margin: 0; background: #080816; color: #f8f7ff; }
    .iframe-warning {
      background: #f5c542;
      color: #1a1200;
      padding: 10px 20px;
      font-size: 0.9rem;
      border-bottom: 1px solid #c9a020;
    }
    header { padding: 16px 20px; border-bottom: 1px solid #244c7a; }
    nav { display: flex; gap: 8px; flex-wrap: wrap; padding: 12px 20px; }
    nav button { background: #12122a; color: #00e5ff; border: 1px solid #244c7a; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
    nav button.active { background: #00e5ff; color: #080816; }
    main { padding: 16px 20px 40px; }
    .panel { display: none; }
    .panel.active { display: block; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
    .card { background: #12122a; border: 1px solid #244c7a; border-radius: 8px; padding: 8px; text-align: center; }
    .card img, .card canvas { width: 100%; height: auto; display: block; border-radius: 4px; background: #080816; }
    .card code { display: block; margin-top: 8px; font-size: 10px; word-break: break-all; color: #9cb7d8; }
    .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
    .swatch { background: #12122a; color: #f8f7ff; border-radius: 8px; padding: 12px; border: 1px solid #244c7a; }
    .swatch-chip {
      height: 56px;
      border-radius: 6px;
      border: 1px solid #244c7a;
      margin-bottom: 10px;
      background-color: #1a1a2e;
      overflow: hidden;
    }
    .swatch-chip-fill { width: 100%; height: 100%; border-radius: 5px; }
    .swatch-meta small { color: #9cb7d8; }
    .controls { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .controls select, .controls button { background: #12122a; color: #f8f7ff; border: 1px solid #244c7a; border-radius: 8px; padding: 8px 12px; }
    #ambientCanvas, #animationsAmbientCanvas {
      width: min(100%, 420px);
      aspect-ratio: 1;
      border: 1px solid #244c7a;
      border-radius: 12px;
      background: #080816;
      display: block;
    }
    #impactCanvas {
      width: min(100%, 280px);
      aspect-ratio: 1.4;
      border: 1px solid #244c7a;
      border-radius: 12px;
      background: #080816;
      display: block;
    }
    .anim-section { margin-bottom: 28px; }
    .anim-section h3 { margin: 0 0 12px; color: #9cb7d8; font-size: 1rem; font-weight: 600; }
    .anim-spark-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
      background: #080816;
      border-radius: 4px;
      margin-bottom: 4px;
    }
    .anim-spark { width: 72px; height: 72px; opacity: 0.72; }
    @keyframes cinematic-media-pulse-loop {
      0% { opacity: 0.55; transform: scale(0.82); }
      42% { opacity: 0.82; transform: scale(1.08); }
      100% { opacity: 0.72; transform: scale(1); }
    }
    .anim-spark { animation: cinematic-media-pulse-loop 1200ms ease-in-out infinite; }
    #energyBallCanvas { width: 120px; height: 120px; margin: 0 auto; }
  </style>
</head>
<body>
  <div id="iframeWarning" class="iframe-warning" hidden>
    Abra com duplo clique no Chrome (fora do IDE) ou use Abrir-Preview.command para evitar restrições de segurança do file://.
  </div>
  <header>
    <h1>Paleta de componentes elétricos</h1>
    <p>Inventário visual para aceite — circuitos, VFX, animações e tokens cromáticos.</p>
  </header>
  <nav>
    <button type="button" class="tab active" data-tab="circuits">Circuitos</button>
    <button type="button" class="tab" data-tab="vfx">VFX elétricos</button>
    <button type="button" class="tab" data-tab="animations">Animações</button>
    <button type="button" class="tab" data-tab="ambient">Raios ambiente</button>
    <button type="button" class="tab" data-tab="tokens">Tokens</button>
  </nav>
  <main>
    <section id="circuits" class="panel active">
      <h2>Blocos de circuito (retro-default)</h2>
      <div class="grid" id="circuitGrid"></div>
    </section>
    <section id="vfx" class="panel">
      <h2>VFX e sprites elétricos</h2>
      <div class="grid" id="vfxGrid"></div>
    </section>
    <section id="animations" class="panel">
      <h2>Animações em movimento</h2>
      <div class="anim-section">
        <h3>Faíscas countdown (8 variantes)</h3>
        <div class="grid" id="sparkAnimGrid"></div>
      </div>
      <div class="anim-section">
        <h3>Bola de energia</h3>
        <article class="card" style="max-width:160px">
          <canvas id="energyBallCanvas" width="120" height="120"></canvas>
          <code>spr-ball-player-default</code>
        </article>
      </div>
      <div class="anim-section">
        <h3>Impactos elétricos</h3>
        <div class="controls">
          <select id="impactKindSelect">
            <option value="component">Componente</option>
            <option value="wall">Parede lateral</option>
            <option value="ceiling">Teto</option>
            <option value="radial-wall">Parede radial</option>
          </select>
        </div>
        <canvas id="impactCanvas" width="280" height="200"></canvas>
      </div>
      <div class="anim-section">
        <h3>Raios ambiente</h3>
        <div class="controls">
          <select id="animationsVariantSelect">
            <option value="pulse">Pulse</option>
            <option value="arcade" selected>Arcade</option>
            <option value="storm">Storm</option>
          </select>
          <button type="button" id="animationsForceBolt">Forçar raio</button>
          <button type="button" id="animationsResetAmbient">Reiniciar</button>
        </div>
        <canvas id="animationsAmbientCanvas" width="420" height="420"></canvas>
      </div>
    </section>
    <section id="ambient" class="panel">
      <h2>Raios de fundo ambiente</h2>
      <div class="controls">
        <select id="variantSelect">
          <option value="pulse">Pulse</option>
          <option value="arcade" selected>Arcade</option>
          <option value="storm">Storm</option>
        </select>
        <button type="button" id="forceBolt">Forçar raio</button>
        <button type="button" id="resetAmbient">Reiniciar</button>
      </div>
      <canvas id="ambientCanvas" width="420" height="420"></canvas>
    </section>
    <section id="tokens" class="panel">
      <h2>Paleta cromática elétrica</h2>
      <div class="swatches" id="tokenGrid"></div>
    </section>
  </main>
  <script id="palette-manifest-data" type="application/json">
`;

const htmlSuffix = `
  </script>
  <script>
${renderer}

${ambient}

${energyBall}

${impact}

${electricEdge}

${componentEnergy}

document.addEventListener("DOMContentLoaded", () => {
  if (window.self !== window.top) {
    document.getElementById("iframeWarning").hidden = false;
  }

  const manifest = JSON.parse(document.getElementById("palette-manifest-data").textContent);
  let activeTab = "circuits";

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      button.classList.add("active");
      activeTab = button.dataset.tab;
      document.getElementById(activeTab).classList.add("active");
    });
  });

  const circuitSamples = [
    "spr-component-basic-red-normal",
    "spr-component-basic-blue-normal",
    "spr-component-basic-green-normal",
    "spr-component-basic-yellow-normal",
    "spr-component-basic-purple-normal",
    "spr-component-metal-steel-normal",
    "spr-component-metal-steel-dented-one",
    "spr-component-metal-steel-dented-two",
  ];

  function resolveLocalAssetPath(entryPath) {
    const fileName = entryPath.split("/").pop();
    if (entryPath.includes("/components/")) return "./assets/components/" + fileName;
    if (entryPath.includes("/sprites/")) return "./assets/sprites/" + fileName;
    if (entryPath.includes("/vfx/")) return "./assets/vfx/" + fileName;
    return "./authoring/codex-" + fileName.replace(/\\.svg$/, "") + ".svg";
  }

  const circuitGrid = document.getElementById("circuitGrid");
  const circuitEnergyPreviews = [];
  for (const id of circuitSamples) {
    const entry = manifest.families.circuitComponents.find((item) => item.id === id);
    if (!entry) continue;
    const card = document.createElement("article");
    card.className = "card";
    if (isAnimatedCircuitComponent(id)) {
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 48;
      canvas.setAttribute("aria-label", id);
      card.appendChild(canvas);
      const code = document.createElement("code");
      code.textContent = id;
      card.appendChild(code);
      circuitEnergyPreviews.push({
        canvas,
        ctx: canvas.getContext("2d"),
        preview: new ElectricComponentEnergyPreview(id),
      });
    } else {
      card.innerHTML = '<img src="' + resolveLocalAssetPath(entry.path) + '" alt="' + id + '" loading="lazy" /><code>' + id + '</code>';
    }
    circuitGrid.appendChild(card);
  }

  const vfxItems = [
    ...manifest.families.sprites,
    ...manifest.families.vfxExisting,
    ...manifest.families.vfxNew,
  ];
  const vfxGrid = document.getElementById("vfxGrid");
  for (const entry of vfxItems) {
    const card = document.createElement("article");
    card.className = "card";
    const src = entry.path && entry.path.startsWith("/assets/visual/")
      ? resolveLocalAssetPath(entry.path)
      : "./authoring/codex-" + entry.id + ".svg";
    card.innerHTML = '<img src="' + src + '" alt="' + entry.id + '" loading="lazy" /><code>' + entry.id + '</code>';
    vfxGrid.appendChild(card);
  }

  const sparkAnimGrid = document.getElementById("sparkAnimGrid");
  const sparkItems = manifest.families.vfxExisting.filter((entry) => entry.id.startsWith("vfx-countdown-spark"));
  for (const entry of sparkItems) {
    const card = document.createElement("article");
    card.className = "card";
    const src = resolveLocalAssetPath(entry.path);
    card.innerHTML =
      '<div class="anim-spark-wrap"><img class="anim-spark" src="' + src + '" alt="' + entry.id + '" /></div><code>' + entry.id + '</code>';
    sparkAnimGrid.appendChild(card);
  }

  const tokenGrid = document.getElementById("tokenGrid");
  for (const token of manifest.families.colorTokens) {
    const swatch = document.createElement("article");
    swatch.className = "swatch";
    swatch.innerHTML =
      '<div class="swatch-chip"><div class="swatch-chip-fill" style="background:' + token.value + '"></div></div>' +
      '<div class="swatch-meta"><strong>' + token.id + '</strong><br>' + token.value + '<br><small>' + token.usage + '</small></div>';
    tokenGrid.appendChild(swatch);
  }

  const ambientCanvas = document.getElementById("ambientCanvas");
  const ambientCtx = ambientCanvas.getContext("2d");
  const ambientGeometry = { centerX: 210, centerY: 210, radius: 180 };
  let ambientBackground = new AmbientElectricBackground("arcade");

  const animationsAmbientCanvas = document.getElementById("animationsAmbientCanvas");
  const animationsAmbientCtx = animationsAmbientCanvas.getContext("2d");
  const animationsAmbientGeometry = { centerX: 210, centerY: 210, radius: 180 };
  let animationsAmbientBackground = new AmbientElectricBackground("arcade");

  const energyBallCanvas = document.getElementById("energyBallCanvas");
  const energyBallCtx = energyBallCanvas.getContext("2d");
  const energyBallPreview = new ElectricEnergyBallPreview(60, 60, 18);

  const impactCanvas = document.getElementById("impactCanvas");
  const impactCtx = impactCanvas.getContext("2d");
  let impactPreview = new ElectricImpactPreview("component");

  function drawAmbientBackdrop(ctx, geometry) {
    ctx.fillStyle = "#080816";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "#244c7a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(geometry.centerX, geometry.centerY, geometry.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawImpactBackdrop(ctx) {
    ctx.fillStyle = "#080816";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "#244c7a";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, ctx.canvas.width - 16, ctx.canvas.height - 16);
  }

  function frame(now) {
    if (activeTab === "circuits") {
      for (const item of circuitEnergyPreviews) {
        item.preview.draw(item.ctx, now);
      }
    }

    if (activeTab === "ambient") {
      ambientBackground.tick(now, ambientGeometry, false);
      drawAmbientBackdrop(ambientCtx, ambientGeometry);
      ambientBackground.draw(ambientCtx, ambientGeometry, false);
    }

    if (activeTab === "animations") {
      energyBallCtx.fillStyle = "#080816";
      energyBallCtx.fillRect(0, 0, energyBallCanvas.width, energyBallCanvas.height);
      energyBallPreview.draw(energyBallCtx, now);

      impactPreview.tick(now);
      drawImpactBackdrop(impactCtx);
      impactPreview.draw(impactCtx, now);

      animationsAmbientBackground.tick(now, animationsAmbientGeometry, false);
      drawAmbientBackdrop(animationsAmbientCtx, animationsAmbientGeometry);
      animationsAmbientBackground.draw(animationsAmbientCtx, animationsAmbientGeometry, false);
    }

    requestAnimationFrame(frame);
  }

  document.getElementById("variantSelect").addEventListener("change", (event) => {
    ambientBackground.setVariant(event.target.value);
  });
  document.getElementById("forceBolt").addEventListener("click", () => ambientBackground.forceBolt(ambientGeometry, false));
  document.getElementById("resetAmbient").addEventListener("click", () => ambientBackground.reset());

  document.getElementById("animationsVariantSelect").addEventListener("change", (event) => {
    animationsAmbientBackground.setVariant(event.target.value);
  });
  document.getElementById("animationsForceBolt").addEventListener("click", () => animationsAmbientBackground.forceBolt(animationsAmbientGeometry, false));
  document.getElementById("animationsResetAmbient").addEventListener("click", () => animationsAmbientBackground.reset());

  document.getElementById("impactKindSelect").addEventListener("change", (event) => {
    impactPreview.setKind(event.target.value);
  });

  requestAnimationFrame(frame);
});
  </script>
</body>
</html>`;

fs.writeFileSync(
  path.join(__dirname, "preview.html"),
  htmlPrefix + manifest.replace(/<\//g, "<\\/") + htmlSuffix,
);
console.log("preview.html ok");
