import { RenderConfig } from "../lib/render";

export interface OutputSize {
  label: string;
  width: number;
  height: number;
}

interface ControlsProps {
  config: RenderConfig;
  onChange: (next: RenderConfig) => void;
  onRandomize: () => void;
  onRandomPalette: () => void;
  onDownload: () => void;
  onCopy: () => void;
  onPaste: () => void;
  outputSizes: OutputSize[];
  selectedSize: OutputSize;
  onSizeChange: (size: OutputSize) => void;
  onCustomSizeChange: (width: number, height: number) => void;
  presets: { name: string }[];
  onPreset: (name: string) => void;
}

const sectionClass = "rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-panel";

export default function Controls({
  config,
  onChange,
  onRandomize,
  onRandomPalette,
  onDownload,
  onCopy,
  onPaste,
  outputSizes,
  selectedSize,
  onSizeChange,
  onCustomSizeChange,
  presets,
  onPreset,
}: ControlsProps) {
  const update = (partial: Partial<RenderConfig>) => onChange({ ...config, ...partial });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Background Generator</h1>
        <p className="text-sm text-slate-400">
          Generate deterministic modern backgrounds with gradients, patterns, and layered textures.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-400"
          onClick={onRandomize}
          type="button"
        >
          Randomize
        </button>
        <button
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-400"
          onClick={onDownload}
          type="button"
        >
          Download PNG
        </button>
        <button
          className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
          onClick={onCopy}
          type="button"
        >
          Copy config JSON
        </button>
        <button
          className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
          onClick={onPaste}
          type="button"
        >
          Paste config JSON
        </button>
      </div>

      <div className={sectionClass}>
        <h2 className="mb-3 text-lg font-semibold text-white">Seed</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              value={config.seed}
              onChange={(event) => update({ seed: event.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={config.lockSeed}
                onChange={(event) => update({ lockSeed: event.target.checked })}
              />
              Lock
            </label>
          </div>
          <p className="text-xs text-slate-400">Current seed: {config.seed}</p>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="mb-3 text-lg font-semibold text-white">Presets</h2>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-500"
              onClick={() => onPreset(preset.name)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="mb-3 text-lg font-semibold text-white">Export size</h2>
        <div className="flex flex-wrap gap-2">
          {outputSizes.map((size) => (
            <button
              key={size.label}
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedSize.label === size.label
                  ? "bg-slate-100 text-slate-900"
                  : "border border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
              onClick={() => onSizeChange(size)}
            >
              {size.label}
            </button>
          ))}
        </div>
        {selectedSize.label === "Custom" && (
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              min={320}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              value={selectedSize.width}
              onChange={(event) => onCustomSizeChange(Number(event.target.value), selectedSize.height)}
            />
            <input
              type="number"
              min={320}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              value={selectedSize.height}
              onChange={(event) => onCustomSizeChange(selectedSize.width, Number(event.target.value))}
            />
          </div>
        )}
      </div>

      <div className={sectionClass}>
        <h2 className="mb-3 text-lg font-semibold text-white">Gradient</h2>
        <div className="grid gap-3">
          <label className="text-sm text-slate-300">
            Type
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              value={config.gradient.type}
              onChange={(event) =>
                update({ gradient: { ...config.gradient, type: event.target.value as RenderConfig["gradient"]["type"] } })
              }
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
              <option value="conic">Conic</option>
              <option value="mesh">Mesh-like</option>
            </select>
          </label>
          <label className="text-sm text-slate-300">
            Angle: {Math.round(config.gradient.angle)}°
            <input
              type="range"
              min={0}
              max={360}
              value={config.gradient.angle}
              onChange={(event) =>
                update({ gradient: { ...config.gradient, angle: Number(event.target.value) } })
              }
              className="mt-1 w-full"
            />
          </label>
          <label className="text-sm text-slate-300">
            Softness
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={config.gradient.softness}
              onChange={(event) =>
                update({ gradient: { ...config.gradient, softness: Number(event.target.value) } })
              }
              className="mt-1 w-full"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {config.gradient.palette.map((color, index) => (
              <input
                key={`${color}-${index}`}
                type="color"
                value={color}
                onChange={(event) => {
                  const nextPalette = [...config.gradient.palette];
                  nextPalette[index] = event.target.value;
                  update({ gradient: { ...config.gradient, palette: nextPalette } });
                }}
                className="h-10 w-10 cursor-pointer rounded-lg border border-slate-700"
              />
            ))}
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300"
              onClick={() =>
                update({
                  gradient: {
                    ...config.gradient,
                    palette:
                      config.gradient.palette.length >= 5
                        ? config.gradient.palette
                        : [
                            ...config.gradient.palette,
                            config.gradient.palette[config.gradient.palette.length - 1] ?? "#ffffff",
                          ],
                  },
                })
              }
            >
              + Color
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300"
              onClick={onRandomPalette}
            >
              Random palette
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
              onClick={() =>
                update({ gradient: { ...config.gradient, palette: config.gradient.palette.slice(0, -1) } })
              }
              disabled={config.gradient.palette.length <= 2}
            >
              Remove
            </button>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full border border-slate-700">
            {config.gradient.palette.map((color, index) => (
              <div key={`${color}-${index}`} className="h-full flex-1" style={{ background: color }} />
            ))}
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="mb-3 text-lg font-semibold text-white">Noise</h2>
        <div className="grid gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={config.noise.enabled}
              onChange={(event) => update({ noise: { ...config.noise, enabled: event.target.checked } })}
            />
            Enabled
          </label>
          <label className="text-sm text-slate-300">
            Strength: {config.noise.strength.toFixed(2)}
            <input
              type="range"
              min={0}
              max={0.25}
              step={0.01}
              value={config.noise.strength}
              onChange={(event) =>
                update({ noise: { ...config.noise, strength: Number(event.target.value) } })
              }
              className="mt-1 w-full"
            />
          </label>
          <label className="text-sm text-slate-300">
            Scale
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={config.noise.scale}
              onChange={(event) => update({ noise: { ...config.noise, scale: Number(event.target.value) } })}
              className="mt-1 w-full"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={config.noise.monochrome}
              onChange={(event) =>
                update({ noise: { ...config.noise, monochrome: event.target.checked } })
              }
            />
            Monochrome
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="mb-3 text-lg font-semibold text-white">Pattern</h2>
        <div className="grid gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={config.pattern.enabled}
              onChange={(event) => update({ pattern: { ...config.pattern, enabled: event.target.checked } })}
            />
            Enabled
          </label>
          <label className="text-sm text-slate-300">
            Type
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              value={config.pattern.type}
              onChange={(event) =>
                update({ pattern: { ...config.pattern, type: event.target.value as RenderConfig["pattern"]["type"] } })
              }
            >
              <option value="dots">Dots</option>
              <option value="grid">Grid</option>
              <option value="diagonal">Diagonal</option>
              <option value="waves">Waves</option>
              <option value="topo">Topographic</option>
              <option value="halftone">Halftone</option>
            </select>
          </label>
          <label className="text-sm text-slate-300">
            Opacity: {config.pattern.opacity.toFixed(2)}
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={config.pattern.opacity}
              onChange={(event) =>
                update({ pattern: { ...config.pattern, opacity: Number(event.target.value) } })
              }
              className="mt-1 w-full"
            />
          </label>
          <label className="text-sm text-slate-300">
            Scale
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={config.pattern.scale}
              onChange={(event) => update({ pattern: { ...config.pattern, scale: Number(event.target.value) } })}
              className="mt-1 w-full"
            />
          </label>
          <label className="text-sm text-slate-300">
            Rotation: {Math.round(config.pattern.rotation)}°
            <input
              type="range"
              min={0}
              max={360}
              value={config.pattern.rotation}
              onChange={(event) =>
                update({ pattern: { ...config.pattern, rotation: Number(event.target.value) } })
              }
              className="mt-1 w-full"
            />
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="mb-3 text-lg font-semibold text-white">Decorative elements</h2>
        <div className="grid gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={config.decorative.enabled}
              onChange={(event) =>
                update({ decorative: { ...config.decorative, enabled: event.target.checked } })
              }
            />
            Enabled
          </label>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
            {([
              ["blobs", "Blobs"],
              ["bokeh", "Bokeh"],
              ["clouds", "Clouds"],
              ["streaks", "Light streaks"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.decorative[key]}
                  onChange={(event) =>
                    update({
                      decorative: { ...config.decorative, [key]: event.target.checked },
                    })
                  }
                />
                {label}
              </label>
            ))}
          </div>
          <label className="text-sm text-slate-300">
            Density
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.decorative.density}
              onChange={(event) =>
                update({ decorative: { ...config.decorative, density: Number(event.target.value) } })
              }
              className="mt-1 w-full"
            />
          </label>
          <label className="text-sm text-slate-300">
            Blur
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.decorative.blur}
              onChange={(event) =>
                update({ decorative: { ...config.decorative, blur: Number(event.target.value) } })
              }
              className="mt-1 w-full"
            />
          </label>
          <label className="text-sm text-slate-300">
            Color strategy
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              value={config.decorative.colorStrategy}
              onChange={(event) =>
                update({
                  decorative: {
                    ...config.decorative,
                    colorStrategy: event.target.value as RenderConfig["decorative"]["colorStrategy"],
                  },
                })
              }
            >
              <option value="palette">From palette</option>
              <option value="neutral">Neutral white</option>
            </select>
          </label>
          <label className="text-sm text-slate-300">
            Opacity min
            <input
              type="range"
              min={0.05}
              max={0.8}
              step={0.05}
              value={config.decorative.opacityMin}
              onChange={(event) =>
                update({
                  decorative: { ...config.decorative, opacityMin: Number(event.target.value) },
                })
              }
              className="mt-1 w-full"
            />
          </label>
          <label className="text-sm text-slate-300">
            Opacity max
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={config.decorative.opacityMax}
              onChange={(event) =>
                update({
                  decorative: { ...config.decorative, opacityMax: Number(event.target.value) },
                })
              }
              className="mt-1 w-full"
            />
          </label>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="mb-3 text-lg font-semibold text-white">Post-processing</h2>
        <div className="grid gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={config.post.vignette}
              onChange={(event) => update({ post: { ...config.post, vignette: event.target.checked } })}
            />
            Vignette
          </label>
          <label className="text-sm text-slate-300">
            Vignette strength
            <input
              type="range"
              min={0}
              max={0.8}
              step={0.05}
              value={config.post.vignetteStrength}
              onChange={(event) =>
                update({ post: { ...config.post, vignetteStrength: Number(event.target.value) } })
              }
              className="mt-1 w-full"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={config.post.sharpen}
              onChange={(event) => update({ post: { ...config.post, sharpen: event.target.checked } })}
            />
            Subtle sharpen
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={config.post.film}
              onChange={(event) => update({ post: { ...config.post, film: event.target.checked } })}
            />
            Film tint
          </label>
        </div>
      </div>
    </div>
  );
}
