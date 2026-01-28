import { PRNG, pickOne, randomBetween, seededRandom } from "./prng";

export type GradientType = "linear" | "radial" | "conic" | "mesh";
export type PatternType = "dots" | "grid" | "diagonal" | "waves" | "topo" | "halftone";

export interface GradientConfig {
  type: GradientType;
  angle: number;
  palette: string[];
  softness: number;
}

export interface NoiseConfig {
  enabled: boolean;
  strength: number;
  scale: number;
  monochrome: boolean;
}

export interface PatternConfig {
  enabled: boolean;
  type: PatternType;
  opacity: number;
  scale: number;
  rotation: number;
}

export interface DecorativeConfig {
  enabled: boolean;
  blobs: boolean;
  bokeh: boolean;
  clouds: boolean;
  streaks: boolean;
  density: number;
  blur: number;
  colorStrategy: "palette" | "neutral";
  opacityMin: number;
  opacityMax: number;
}

export interface PostConfig {
  vignette: boolean;
  vignetteStrength: number;
  sharpen: boolean;
  film: boolean;
}

export interface RenderConfig {
  seed: string;
  lockSeed: boolean;
  gradient: GradientConfig;
  noise: NoiseConfig;
  pattern: PatternConfig;
  decorative: DecorativeConfig;
  post: PostConfig;
}

export interface RenderOptions {
  width: number;
  height: number;
  devicePixelRatio?: number;
}

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  config: RenderConfig,
  options: RenderOptions
) {
  const dpr = options.devicePixelRatio ?? 1;
  const width = Math.floor(options.width * dpr);
  const height = Math.floor(options.height * dpr);
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  const rng = seededRandom(config.seed);

  drawGradient(ctx, config.gradient, rng, options.width, options.height);
  if (config.decorative.enabled) {
    drawDecorative(ctx, config, rng, options.width, options.height);
  }
  if (config.pattern.enabled) {
    drawPattern(ctx, config.pattern, rng, options.width, options.height);
  }
  if (config.noise.enabled) {
    drawNoise(ctx, config.noise, rng, options.width, options.height);
  }
  if (config.post.vignette) {
    drawVignette(ctx, config.post.vignetteStrength, options.width, options.height);
  }
  if (config.post.film) {
    ctx.fillStyle = "rgba(255, 228, 196, 0.08)";
    ctx.fillRect(0, 0, options.width, options.height);
  }
  if (config.post.sharpen) {
    applySharpen(ctx, options.width, options.height);
  }
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  gradient: GradientConfig,
  rng: PRNG,
  width: number,
  height: number
) {
  ctx.save();
  if (gradient.type === "linear") {
    const angle = (gradient.angle * Math.PI) / 180;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    const x0 = width / 2 - x * width;
    const y0 = height / 2 - y * height;
    const x1 = width / 2 + x * width;
    const y1 = height / 2 + y * height;
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    applyPaletteStops(grad, gradient.palette, gradient.softness);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (gradient.type === "radial") {
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.4,
      Math.min(width, height) * 0.1,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.8
    );
    applyPaletteStops(grad, gradient.palette, gradient.softness);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (gradient.type === "conic") {
    const conic = (ctx as CanvasRenderingContext2D & { createConicGradient?: Function })
      .createConicGradient?.((gradient.angle * Math.PI) / 180, width / 2, height / 2);
    if (conic) {
      applyPaletteStops(conic, gradient.palette, gradient.softness);
      ctx.fillStyle = conic as CanvasGradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      fakeConic(ctx, gradient.palette, width, height, gradient.angle);
    }
  } else {
    ctx.fillStyle = gradient.palette[0] ?? "#0f172a";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";
    const count = 6 + Math.floor(rng() * 5);
    for (let i = 0; i < count; i += 1) {
      const color = pickOne(rng, gradient.palette);
      const x = randomBetween(rng, -0.2, 1.2) * width;
      const y = randomBetween(rng, -0.2, 1.2) * height;
      const radius = randomBetween(rng, 0.2, 0.6) * Math.max(width, height);
      const grad = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
      grad.addColorStop(0, `${color}cc`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
}

function applyPaletteStops(gradient: CanvasGradient, palette: string[], softness: number) {
  const smooth = Math.max(0.05, 1 - softness);
  const count = palette.length;
  palette.forEach((color, index) => {
    const stop = count === 1 ? 0.5 : index / (count - 1);
    gradient.addColorStop(Math.max(0, stop - smooth * 0.15), color);
    gradient.addColorStop(Math.min(1, stop + smooth * 0.15), color);
  });
}

function fakeConic(
  ctx: CanvasRenderingContext2D,
  palette: string[],
  width: number,
  height: number,
  angle: number
) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.hypot(width, height);
  const slices = 160;
  const step = (Math.PI * 2) / slices;
  const offset = (angle * Math.PI) / 180;
  for (let i = 0; i < slices; i += 1) {
    const t = i / (slices - 1);
    const colorIndex = Math.floor(t * (palette.length - 1));
    const nextIndex = Math.min(colorIndex + 1, palette.length - 1);
    const localT = (t * (palette.length - 1)) % 1;
    const color = mixColors(palette[colorIndex], palette[nextIndex], localT);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, offset + i * step, offset + (i + 1) * step);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function mixColors(a: string, b: string, t: number): string {
  const toRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };
  const ca = toRgb(a);
  const cb = toRgb(b);
  const r = Math.round(ca.r + (cb.r - ca.r) * t);
  const g = Math.round(ca.g + (cb.g - ca.g) * t);
  const bVal = Math.round(ca.b + (cb.b - ca.b) * t);
  return `rgb(${r}, ${g}, ${bVal})`;
}

function drawDecorative(
  ctx: CanvasRenderingContext2D,
  config: RenderConfig,
  rng: PRNG,
  width: number,
  height: number
) {
  const { decorative, gradient } = config;
  const count = Math.floor(6 + decorative.density * 20);
  const colors = decorative.colorStrategy === "palette" ? gradient.palette : ["rgba(255,255,255,0.7)"];

  if (decorative.blobs) {
    for (let i = 0; i < count; i += 1) {
      const radius = randomBetween(rng, 0.2, 0.5) * Math.min(width, height);
      const x = randomBetween(rng, -0.1, 1.1) * width;
      const y = randomBetween(rng, -0.1, 1.1) * height;
      ctx.save();
      ctx.globalAlpha = randomBetween(rng, decorative.opacityMin, decorative.opacityMax);
      ctx.fillStyle = pickOne(rng, colors);
      ctx.shadowColor = ctx.fillStyle as string;
      ctx.shadowBlur = decorative.blur * 50;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  if (decorative.bokeh) {
    for (let i = 0; i < count; i += 1) {
      const radius = randomBetween(rng, 20, 120);
      const x = randomBetween(rng, -0.1, 1.1) * width;
      const y = randomBetween(rng, -0.1, 1.1) * height;
      const color = pickOne(rng, colors);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `${color}cc`);
      grad.addColorStop(1, "transparent");
      ctx.globalAlpha = randomBetween(rng, decorative.opacityMin, decorative.opacityMax);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (decorative.clouds) {
    for (let i = 0; i < count; i += 1) {
      const baseX = randomBetween(rng, -0.2, 1.2) * width;
      const baseY = randomBetween(rng, 0.0, 1.1) * height;
      const cluster = 4 + Math.floor(rng() * 5);
      for (let j = 0; j < cluster; j += 1) {
        const radius = randomBetween(rng, 40, 160);
        const x = baseX + randomBetween(rng, -100, 100);
        const y = baseY + randomBetween(rng, -60, 60);
        ctx.save();
        ctx.globalAlpha = randomBetween(rng, decorative.opacityMin, decorative.opacityMax) * 0.8;
        ctx.fillStyle = pickOne(rng, colors);
        ctx.shadowColor = ctx.fillStyle as string;
        ctx.shadowBlur = decorative.blur * 40;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  if (decorative.streaks) {
    const streaks = Math.floor(3 + decorative.density * 8);
    for (let i = 0; i < streaks; i += 1) {
      const length = randomBetween(rng, 0.6, 1.4) * width;
      const thickness = randomBetween(rng, 20, 60);
      const x = randomBetween(rng, -0.2, 1.2) * width;
      const y = randomBetween(rng, -0.2, 1.2) * height;
      const angle = randomBetween(rng, -30, 30) * (Math.PI / 180);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = randomBetween(rng, decorative.opacityMin, decorative.opacityMax);
      const color = pickOne(rng, colors);
      const grad = ctx.createLinearGradient(0, 0, length, 0);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.5, `${color}cc`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.shadowColor = color;
      ctx.shadowBlur = decorative.blur * 30;
      ctx.fillRect(-length / 2, -thickness / 2, length, thickness);
      ctx.restore();
    }
  }
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  pattern: PatternConfig,
  rng: PRNG,
  width: number,
  height: number
) {
  const scale = Math.max(6, pattern.scale * 80);
  const offscreen = document.createElement("canvas");
  offscreen.width = scale;
  offscreen.height = scale;
  const octx = offscreen.getContext("2d");
  if (!octx) return;
  octx.clearRect(0, 0, scale, scale);
  octx.strokeStyle = "rgba(255,255,255,1)";
  octx.fillStyle = "rgba(255,255,255,1)";

  switch (pattern.type) {
    case "dots": {
      const radius = scale * 0.1;
      octx.beginPath();
      octx.arc(scale / 2, scale / 2, radius, 0, Math.PI * 2);
      octx.fill();
      break;
    }
    case "grid": {
      octx.lineWidth = Math.max(1, scale * 0.04);
      octx.beginPath();
      octx.moveTo(0, 0);
      octx.lineTo(scale, 0);
      octx.moveTo(0, 0);
      octx.lineTo(0, scale);
      octx.stroke();
      break;
    }
    case "diagonal": {
      octx.lineWidth = Math.max(1, scale * 0.04);
      octx.beginPath();
      octx.moveTo(-scale * 0.2, scale);
      octx.lineTo(scale, -scale * 0.2);
      octx.stroke();
      break;
    }
    case "waves": {
      octx.lineWidth = Math.max(1, scale * 0.05);
      octx.beginPath();
      for (let x = 0; x <= scale; x += 1) {
        const y = scale / 2 + Math.sin((x / scale) * Math.PI * 2) * scale * 0.2;
        if (x === 0) {
          octx.moveTo(x, y);
        } else {
          octx.lineTo(x, y);
        }
      }
      octx.stroke();
      break;
    }
    case "topo": {
      octx.lineWidth = Math.max(1, scale * 0.03);
      for (let i = 0; i < 3; i += 1) {
        octx.beginPath();
        const offset = randomBetween(rng, 0, scale);
        for (let x = 0; x <= scale; x += 1) {
          const y = offset + Math.sin((x / scale) * Math.PI * 2 + i) * scale * 0.15;
          if (x === 0) {
            octx.moveTo(x, y);
          } else {
            octx.lineTo(x, y);
          }
        }
        octx.stroke();
      }
      break;
    }
    case "halftone": {
      const radius = scale * 0.18 * (0.5 + rng());
      octx.beginPath();
      octx.arc(scale / 2, scale / 2, radius, 0, Math.PI * 2);
      octx.fill();
      break;
    }
  }

  const patternFill = ctx.createPattern(offscreen, "repeat");
  if (!patternFill) return;
  ctx.save();
  ctx.globalAlpha = pattern.opacity;
  ctx.translate(width / 2, height / 2);
  ctx.rotate((pattern.rotation * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2);
  ctx.fillStyle = patternFill;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  noise: NoiseConfig,
  rng: PRNG,
  width: number,
  height: number
) {
  const scale = Math.max(1, Math.floor(noise.scale * 60));
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = Math.ceil(width / scale);
  noiseCanvas.height = Math.ceil(height / scale);
  const nctx = noiseCanvas.getContext("2d");
  if (!nctx) return;
  const imageData = nctx.createImageData(noiseCanvas.width, noiseCanvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const value = Math.floor(rng() * 255);
    imageData.data[i] = value;
    imageData.data[i + 1] = noise.monochrome ? value : Math.floor(rng() * 255);
    imageData.data[i + 2] = noise.monochrome ? value : Math.floor(rng() * 255);
    imageData.data[i + 3] = 255;
  }
  nctx.putImageData(imageData, 0, 0);
  ctx.save();
  ctx.globalAlpha = noise.strength;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(noiseCanvas, 0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.restore();
}

function drawVignette(ctx: CanvasRenderingContext2D, strength: number, width: number, height: number) {
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.2,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.8
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

function applySharpen(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const temp = document.createElement("canvas");
  temp.width = width;
  temp.height = height;
  const tctx = temp.getContext("2d");
  if (!tctx) return;
  tctx.drawImage(ctx.canvas, 0, 0, width, height);
  ctx.save();
  ctx.filter = "contrast(1.05) saturate(1.04)";
  ctx.drawImage(temp, 0, 0, width, height);
  ctx.filter = "none";
  ctx.restore();
}
