import { useMemo, useState } from "react";
import Controls, { OutputSize } from "./components/Controls";
import Preview from "./components/Preview";
import { palettes, randomPalette } from "./lib/palettes";
import { RenderConfig, renderBackground } from "./lib/render";
import { pickOne, randomBetween, seededRandom } from "./lib/prng";

const outputSizes: OutputSize[] = [
  { label: "1920x1080", width: 1920, height: 1080 },
  { label: "2560x1440", width: 2560, height: 1440 },
  { label: "3840x2160", width: 3840, height: 2160 },
  { label: "1200x630", width: 1200, height: 630 },
  { label: "1600x900", width: 1600, height: 900 },
  { label: "Custom", width: 1400, height: 900 },
];

const baseConfig: RenderConfig = {
  seed: "aurora-2024",
  lockSeed: false,
  gradient: {
    type: "linear",
    angle: 120,
    palette: palettes.aurora,
    softness: 0.6,
  },
  noise: {
    enabled: true,
    strength: 0.06,
    scale: 1,
    monochrome: true,
  },
  pattern: {
    enabled: true,
    type: "waves",
    opacity: 0.15,
    scale: 1,
    rotation: 12,
  },
  decorative: {
    enabled: true,
    blobs: true,
    bokeh: true,
    clouds: false,
    streaks: true,
    density: 0.5,
    blur: 0.7,
    colorStrategy: "palette",
    opacityMin: 0.2,
    opacityMax: 0.6,
  },
  post: {
    vignette: true,
    vignetteStrength: 0.35,
    sharpen: false,
    film: true,
  },
};

const presets = [
  {
    name: "Prism",
    config: {
      ...baseConfig,
      seed: "prism",
      gradient: { type: "conic", angle: 200, palette: palettes.prism, softness: 0.55 },
      pattern: { enabled: true, type: "halftone", opacity: 0.2, scale: 1.2, rotation: 45 },
      decorative: { ...baseConfig.decorative, blobs: true, bokeh: true, streaks: true },
    },
  },
  {
    name: "Aurora",
    config: {
      ...baseConfig,
      seed: "aurora",
      gradient: { type: "mesh", angle: 120, palette: palettes.aurora, softness: 0.7 },
      pattern: { enabled: false, type: "waves", opacity: 0.12, scale: 1, rotation: 20 },
    },
  },
  {
    name: "Sunset",
    config: {
      ...baseConfig,
      seed: "sunset",
      gradient: { type: "linear", angle: 140, palette: palettes.sunset, softness: 0.55 },
      pattern: { enabled: true, type: "diagonal", opacity: 0.18, scale: 1.1, rotation: 35 },
      post: { vignette: true, vignetteStrength: 0.4, sharpen: false, film: true },
    },
  },
  {
    name: "Ocean",
    config: {
      ...baseConfig,
      seed: "ocean",
      gradient: { type: "radial", angle: 90, palette: palettes.ocean, softness: 0.6 },
      pattern: { enabled: true, type: "dots", opacity: 0.15, scale: 1.1, rotation: 0 },
      decorative: { ...baseConfig.decorative, clouds: true, streaks: false },
    },
  },
  {
    name: "Candy",
    config: {
      ...baseConfig,
      seed: "candy",
      gradient: { type: "mesh", angle: 120, palette: palettes.candy, softness: 0.75 },
      pattern: { enabled: true, type: "grid", opacity: 0.12, scale: 0.8, rotation: 0 },
      decorative: { ...baseConfig.decorative, bokeh: true, blobs: true },
    },
  },
  {
    name: "Noir Neon",
    config: {
      ...baseConfig,
      seed: "noir",
      gradient: { type: "linear", angle: 210, palette: palettes.noirNeon, softness: 0.5 },
      noise: { enabled: true, strength: 0.08, scale: 1.2, monochrome: false },
      pattern: { enabled: true, type: "topo", opacity: 0.2, scale: 1, rotation: 18 },
      post: { vignette: true, vignetteStrength: 0.55, sharpen: true, film: false },
    },
  },
];

const randomSeed = () => `seed-${Math.random().toString(36).slice(2, 8)}`;

function createRandomConfig(seed: string): RenderConfig {
  const rng = seededRandom(seed);
  const gradientType = pickOne(rng, ["linear", "radial", "conic", "mesh"] as const);
  const patternType = pickOne(rng, ["dots", "grid", "diagonal", "waves", "topo", "halftone"] as const);
  return {
    seed,
    lockSeed: false,
    gradient: {
      type: gradientType,
      angle: randomBetween(rng, 0, 360),
      palette: randomPalette(rng, 3, 5),
      softness: randomBetween(rng, 0.35, 0.8),
    },
    noise: {
      enabled: rng() > 0.2,
      strength: randomBetween(rng, 0.03, 0.12),
      scale: randomBetween(rng, 0.7, 1.4),
      monochrome: rng() > 0.4,
    },
    pattern: {
      enabled: rng() > 0.3,
      type: patternType,
      opacity: randomBetween(rng, 0.08, 0.22),
      scale: randomBetween(rng, 0.7, 1.5),
      rotation: randomBetween(rng, 0, 90),
    },
    decorative: {
      enabled: rng() > 0.15,
      blobs: rng() > 0.2,
      bokeh: rng() > 0.2,
      clouds: rng() > 0.6,
      streaks: rng() > 0.3,
      density: randomBetween(rng, 0.3, 0.8),
      blur: randomBetween(rng, 0.3, 0.9),
      colorStrategy: rng() > 0.5 ? "palette" : "neutral",
      opacityMin: randomBetween(rng, 0.12, 0.3),
      opacityMax: randomBetween(rng, 0.4, 0.7),
    },
    post: {
      vignette: rng() > 0.4,
      vignetteStrength: randomBetween(rng, 0.2, 0.55),
      sharpen: rng() > 0.7,
      film: rng() > 0.5,
    },
  };
}

export default function App() {
  const [config, setConfig] = useState<RenderConfig>(baseConfig);
  const [size, setSize] = useState<OutputSize>(outputSizes[0]);

  const previewSize = useMemo(() => {
    const maxWidth = 920;
    const ratio = size.height / size.width;
    return { width: maxWidth, height: Math.round(maxWidth * ratio) };
  }, [size]);

  const handleRandomize = () => {
    const nextSeed = config.lockSeed ? config.seed : randomSeed();
    const nextConfig = createRandomConfig(nextSeed);
    nextConfig.lockSeed = config.lockSeed;
    setConfig(nextConfig);
  };

  const handleRandomPalette = () => {
    const seed = config.lockSeed ? config.seed : randomSeed();
    const rng = seededRandom(`${seed}-palette`);
    setConfig({
      ...config,
      seed,
      gradient: { ...config.gradient, palette: randomPalette(rng, 3, 5) },
    });
  };

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderBackground(ctx, config, { width: size.width, height: size.height, devicePixelRatio: 1 });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `background-${config.seed}-${size.width}x${size.height}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/png");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    try {
      const parsed = JSON.parse(text) as RenderConfig;
      setConfig(parsed);
    } catch {
      alert("Invalid JSON config.");
    }
  };

  const handlePreset = (name: string) => {
    const preset = presets.find((entry) => entry.name === name);
    if (preset) {
      setConfig({ ...preset.config, lockSeed: config.lockSeed });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
        <div className="w-full max-w-xl">
          <Controls
            config={config}
            onChange={setConfig}
            onRandomize={handleRandomize}
            onRandomPalette={handleRandomPalette}
            onDownload={handleDownload}
            onCopy={handleCopy}
            onPaste={handlePaste}
            outputSizes={outputSizes}
            selectedSize={size}
            onSizeChange={setSize}
            onCustomSizeChange={(width, height) => setSize({ label: "Custom", width, height })}
            presets={presets.map((preset) => ({ name: preset.name }))}
            onPreset={handlePreset}
          />
        </div>
        <div className="flex w-full flex-1 flex-col gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>Preview</span>
              <span>
                {size.width} x {size.height}px
              </span>
            </div>
          </div>
          <Preview config={config} width={previewSize.width} height={previewSize.height} />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-400">
            <p>
              Tip: lock the seed to reproduce a background. Copy the JSON config to share exact
              settings.
            </p>
          </div>
        </div>
      </div>
      <footer className="mx-auto mt-10 max-w-6xl text-xs text-slate-500">
        <p>Run: npm install · npm run dev</p>
      </footer>
    </div>
  );
}
