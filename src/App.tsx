import { useMemo, useState } from "react";
import Controls, { OutputSize } from "./components/Controls";
import Preview from "./components/Preview";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
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
    texture: "grain",
  },
  pattern: {
    enabled: true,
    type: "waves",
    opacity: 0.15,
    scale: 1,
    rotation: 12,
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
    },
  },
  {
    name: "Ocean",
    config: {
      ...baseConfig,
      seed: "ocean",
      gradient: { type: "radial", angle: 90, palette: palettes.ocean, softness: 0.6 },
      pattern: { enabled: true, type: "dots", opacity: 0.15, scale: 1.1, rotation: 0 },
    },
  },
  {
    name: "Candy",
    config: {
      ...baseConfig,
      seed: "candy",
      gradient: { type: "mesh", angle: 120, palette: palettes.candy, softness: 0.75 },
      pattern: { enabled: true, type: "grid", opacity: 0.12, scale: 0.8, rotation: 0 },
    },
  },
  {
    name: "Vertex Flow",
    config: {
      ...baseConfig,
      seed: "vertex-flow",
      gradient: { type: "shader", angle: 210, palette: palettes.vertex, softness: 0.68 },
      pattern: { enabled: true, type: "vertex", opacity: 0.18, scale: 1, rotation: 10 },
      noise: { enabled: true, strength: 0.08, scale: 1.2, monochrome: false, texture: "grain" },
    },
  },
  {
    name: "Noir Neon",
    config: {
      ...baseConfig,
      seed: "noir",
      gradient: { type: "linear", angle: 210, palette: palettes.noirNeon, softness: 0.5 },
      noise: { enabled: true, strength: 0.08, scale: 1.2, monochrome: false, texture: "classic" },
      pattern: { enabled: true, type: "topo", opacity: 0.2, scale: 1, rotation: 18 },
    },
  },
  {
    name: "Painterly Mist",
    config: {
      ...baseConfig,
      seed: "painterly",
      gradient: { type: "shader", angle: 140, palette: palettes.painterly, softness: 0.8 },
      noise: { enabled: true, strength: 0.12, scale: 0.8, monochrome: false, texture: "grain" },
      pattern: { enabled: false, type: "waves", opacity: 0.12, scale: 1, rotation: 0 },
    },
  },
];

const randomSeed = () => `seed-${Math.random().toString(36).slice(2, 8)}`;

function createRandomConfig(seed: string): RenderConfig {
  const rng = seededRandom(seed);
  const gradientType = pickOne(rng, ["linear", "radial", "conic", "mesh", "shader"] as const);
  const patternType = pickOne(rng, [
    "dots",
    "grid",
    "diagonal",
    "waves",
    "topo",
    "halftone",
    "vertex",
  ] as const);
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
      texture: rng() > 0.5 ? "grain" : "classic",
    },
    pattern: {
      enabled: rng() > 0.3,
      type: patternType,
      opacity: randomBetween(rng, 0.08, 0.22),
      scale: randomBetween(rng, 0.7, 1.5),
      rotation: randomBetween(rng, 0, 90),
    },
  };
}

export default function App() {
  const [config, setConfig] = useState<RenderConfig>(baseConfig);
  const [size, setSize] = useState<OutputSize>(outputSizes[0]);

  const previewSize = useMemo(() => {
    const maxWidth = 960;
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
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-900/80 bg-slate-950/60 px-6 py-4 backdrop-blur">
        <div className="flex w-full items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Aurora UI</p>
            <h1 className="text-2xl font-semibold text-white">Gradient Background Builder</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge>Canvas {size.width} × {size.height}</Badge>
            <Button variant="outline" size="sm" onClick={handleRandomize}>
              Surprise me
            </Button>
          </div>
        </div>
      </header>

      <main className="grid flex-1 gap-6 overflow-hidden px-6 py-6 lg:grid-cols-[260px_minmax(0,1fr)_360px] min-h-0">
        <aside className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
          <Card>
            <CardHeader>
              <CardTitle>Scenes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-slate-600 hover:text-white"
                  onClick={() => handlePreset(preset.name)}
                >
                  <span>{preset.name}</span>
                  <span className="text-xs text-slate-500">Preset</span>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-400">
              <p>Lock the seed to reproduce a background exactly.</p>
              <p>Use mesh gradients for cinematic lighting.</p>
              <p>Try shader wash + film grain for painterly blends.</p>
              <p>Export at 4K for full-resolution wallpapers.</p>
            </CardContent>
          </Card>
        </aside>

        <section className="flex h-full min-h-0 flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Preview</CardTitle>
              <span className="text-xs text-slate-400">{size.width} × {size.height}px</span>
            </CardHeader>
            <CardContent>
              <Preview config={config} width={previewSize.width} height={previewSize.height} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-xs text-slate-400">
              Export as PNG to save the current configuration. Copy/paste the JSON to share exact
              settings with teammates.
            </CardContent>
          </Card>
        </section>

        <aside className="h-full min-h-0 overflow-y-auto pr-1">
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
        </aside>
      </main>

      <footer className="px-6 pb-6 text-xs text-slate-500" />
    </div>
  );
}
