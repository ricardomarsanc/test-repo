import { PRNG, pickOne, randomBetween, seededRandom } from "./prng";

export type GradientType = "linear" | "radial" | "conic" | "mesh" | "shader";
export type PatternType =
  | "dots"
  | "grid"
  | "diagonal"
  | "waves"
  | "topo"
  | "halftone"
  | "vertex";
export type NoiseTexture = "classic" | "grain";

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
  texture: NoiseTexture;
}

export interface PatternConfig {
  enabled: boolean;
  type: PatternType;
  opacity: number;
  scale: number;
  rotation: number;
}

export interface RenderConfig {
  seed: string;
  lockSeed: boolean;
  gradient: GradientConfig;
  noise: NoiseConfig;
  pattern: PatternConfig;
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
  if (config.pattern.enabled) {
    drawPattern(ctx, config, rng, options.width, options.height);
  }
  if (config.noise.enabled) {
    drawNoise(ctx, config.noise, rng, options.width, options.height);
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
    if (gradient.type === "shader") {
      drawShaderGradient(ctx, gradient, rng, width, height);
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
  }
  ctx.restore();
}

function drawShaderGradient(
  ctx: CanvasRenderingContext2D,
  gradient: GradientConfig,
  rng: PRNG,
  width: number,
  height: number
) {
  const scale = 4;
  const w = Math.ceil(width / scale);
  const h = Math.ceil(height / scale);
  const imageData = ctx.createImageData(w, h);
  const seed = rng() * 1000;
  const angle = (gradient.angle * Math.PI) / 180;
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const nx = x / w;
      const ny = y / h;
      const warp = noise2d(nx * 3.2 + seed, ny * 3.2 + seed * 1.7);
      const ripples = noise2d(nx * 7.1 + seed * 0.3, ny * 6.4 + seed * 0.5);
      const directional = nx * dirX + ny * dirY;
      const t =
        0.5 +
        (directional - 0.5) * 0.8 +
        (warp - 0.5) * gradient.softness +
        (ripples - 0.5) * (0.35 + gradient.softness * 0.2);
      const color = samplePalette(gradient.palette, clamp01(t), gradient.softness);
      const index = (y * w + x) * 4;
      imageData.data[index] = color.r;
      imageData.data[index + 1] = color.g;
      imageData.data[index + 2] = color.b;
      imageData.data[index + 3] = 255;
    }
  }

  const temp = document.createElement("canvas");
  temp.width = w;
  temp.height = h;
  const tctx = temp.getContext("2d");
  if (!tctx) return;
  tctx.putImageData(imageData, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(temp, 0, 0, width, height);
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

function samplePalette(palette: string[], t: number, softness: number) {
  if (palette.length === 0) {
    return { r: 15, g: 23, b: 42 };
  }
  if (palette.length === 1) {
    return hexToRgb(palette[0]);
  }
  const ramp = clamp01(t + (noise2d(t * 5, t * 8) - 0.5) * (1 - softness) * 0.15);
  const scaled = ramp * (palette.length - 1);
  const index = Math.floor(scaled);
  const next = Math.min(index + 1, palette.length - 1);
  const local = scaled - index;
  return mixRgb(hexToRgb(palette[index]), hexToRgb(palette[next]), local);
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function mixRgb(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function noise2d(x: number, y: number) {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
}

function fract(value: number) {
  return value - Math.floor(value);
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}


function drawPattern(
  ctx: CanvasRenderingContext2D,
  config: RenderConfig,
  rng: PRNG,
  width: number,
  height: number
) {
  const { pattern } = config;
  if (pattern.type === "vertex") {
    drawVertexMesh(ctx, config, rng, width, height);
    return;
  }

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

function drawVertexMesh(
  ctx: CanvasRenderingContext2D,
  config: RenderConfig,
  rng: PRNG,
  width: number,
  height: number
) {
  const { pattern, gradient } = config;
  const cell = Math.max(140, 280 / pattern.scale);
  const cols = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;
  const points: { x: number; y: number }[][] = [];
  for (let y = 0; y <= rows; y += 1) {
    const row: { x: number; y: number }[] = [];
    for (let x = 0; x <= cols; x += 1) {
      row.push({
        x: x * cell + randomBetween(rng, -cell * 0.35, cell * 0.35),
        y: y * cell + randomBetween(rng, -cell * 0.35, cell * 0.35),
      });
    }
    points.push(row);
  }

  ctx.save();
  ctx.globalAlpha = pattern.opacity;
  ctx.globalCompositeOperation = "soft-light";
  ctx.translate(width / 2, height / 2);
  ctx.rotate((pattern.rotation * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const p00 = points[y][x];
      const p10 = points[y][x + 1];
      const p01 = points[y + 1][x];
      const p11 = points[y + 1][x + 1];
      const colorA = pickOne(rng, gradient.palette);
      const colorB = pickOne(rng, gradient.palette);

      if (rng() > 0.5) {
        drawTriangle(ctx, p00, p10, p11, colorA);
        drawTriangle(ctx, p00, p11, p01, colorB);
      } else {
        drawTriangle(ctx, p00, p10, p01, colorA);
        drawTriangle(ctx, p10, p11, p01, colorB);
      }
    }
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
  color: string
) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  noise: NoiseConfig,
  rng: PRNG,
  width: number,
  height: number
) {
  if (noise.texture === "grain") {
    drawGrain(ctx, noise, rng, width, height);
    return;
  }

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

function drawGrain(
  ctx: CanvasRenderingContext2D,
  noise: NoiseConfig,
  rng: PRNG,
  width: number,
  height: number
) {
  const scale = Math.max(1, Math.floor(noise.scale * 8));
  const grainCanvas = document.createElement("canvas");
  grainCanvas.width = Math.ceil(width / scale);
  grainCanvas.height = Math.ceil(height / scale);
  const gctx = grainCanvas.getContext("2d");
  if (!gctx) return;
  const imageData = gctx.createImageData(grainCanvas.width, grainCanvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const grain = Math.floor(rng() * 255);
    const tint = noise.monochrome ? grain : Math.floor(rng() * 255);
    imageData.data[i] = tint;
    imageData.data[i + 1] = noise.monochrome ? tint : Math.floor(rng() * 255);
    imageData.data[i + 2] = noise.monochrome ? tint : Math.floor(rng() * 255);
    imageData.data[i + 3] = 255;
  }
  gctx.putImageData(imageData, 0, 0);
  ctx.save();
  ctx.globalAlpha = noise.strength;
  ctx.globalCompositeOperation = "soft-light";
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(grainCanvas, 0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}
