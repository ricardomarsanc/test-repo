import { RenderConfig } from "../lib/render";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";

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

const sliderClassName =
  "mt-2 w-full cursor-pointer accent-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500";

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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Background Studio</CardTitle>
              <p className="mt-1 text-xs text-slate-400">
                Craft cinematic gradients with deterministic seeds and layered texture controls.
              </p>
            </div>
            <Badge>Beta</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="accent" className="justify-center" onClick={onRandomize}>
              Randomize
            </Button>
            <Button variant="secondary" className="justify-center" onClick={onDownload}>
              Download PNG
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={onCopy}>
              Copy JSON
            </Button>
            <Button variant="outline" onClick={onPaste}>
              Paste JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              value={config.seed}
              onChange={(event) => update({ seed: event.target.value })}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={config.lockSeed}
                onChange={(event) => update({ lockSeed: event.target.checked })}
              />
              <Label>Lock</Label>
            </div>
          </div>
          <p className="text-xs text-slate-400">Current seed: {config.seed}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Presets</CardTitle>
            <Badge>Curated</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="ghost"
              size="sm"
              className="rounded-full border border-slate-800"
              onClick={() => onPreset(preset.name)}
            >
              {preset.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export size</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {outputSizes.map((size) => (
              <Button
                key={size.label}
                variant={selectedSize.label === size.label ? "default" : "outline"}
                size="sm"
                onClick={() => onSizeChange(size)}
              >
                {size.label}
              </Button>
            ))}
          </div>
          {selectedSize.label === "Custom" && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                type="number"
                min={320}
                value={selectedSize.width}
                onChange={(event) =>
                  onCustomSizeChange(Number(event.target.value), selectedSize.height)
                }
              />
              <Input
                type="number"
                min={320}
                value={selectedSize.height}
                onChange={(event) =>
                  onCustomSizeChange(selectedSize.width, Number(event.target.value))
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gradient</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Label>Type</Label>
            <select
              className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={config.gradient.type}
              onChange={(event) =>
                update({
                  gradient: {
                    ...config.gradient,
                    type: event.target.value as RenderConfig["gradient"]["type"],
                  },
                })
              }
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
              <option value="conic">Conic</option>
              <option value="mesh">Mesh-like</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Angle</span>
              <span>{Math.round(config.gradient.angle)}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={config.gradient.angle}
              onChange={(event) =>
                update({ gradient: { ...config.gradient, angle: Number(event.target.value) } })
              }
              className={sliderClassName}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Softness</span>
              <span>{config.gradient.softness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={config.gradient.softness}
              onChange={(event) =>
                update({ gradient: { ...config.gradient, softness: Number(event.target.value) } })
              }
              className={sliderClassName}
            />
          </div>
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
                className="h-10 w-10 cursor-pointer rounded-lg border border-slate-800"
              />
            ))}
            <Button
              size="sm"
              variant="outline"
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
            </Button>
            <Button size="sm" variant="outline" onClick={onRandomPalette}>
              Random palette
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                update({
                  gradient: {
                    ...config.gradient,
                    palette: config.gradient.palette.slice(0, -1),
                  },
                })
              }
              disabled={config.gradient.palette.length <= 2}
            >
              Remove
            </Button>
            <Separator className="flex-1" />
          </div>
          <div className="flex h-3 overflow-hidden rounded-full border border-slate-800">
            {config.gradient.palette.map((color, index) => (
              <div key={`${color}-${index}`} className="h-full flex-1" style={{ background: color }} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Noise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enabled</Label>
            <Switch
              checked={config.noise.enabled}
              onChange={(event) => update({ noise: { ...config.noise, enabled: event.target.checked } })}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Strength</span>
              <span>{config.noise.strength.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.25}
              step={0.01}
              value={config.noise.strength}
              onChange={(event) =>
                update({ noise: { ...config.noise, strength: Number(event.target.value) } })
              }
              className={sliderClassName}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Scale</span>
              <span>{config.noise.scale.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={config.noise.scale}
              onChange={(event) => update({ noise: { ...config.noise, scale: Number(event.target.value) } })}
              className={sliderClassName}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Monochrome</Label>
            <Switch
              checked={config.noise.monochrome}
              onChange={(event) =>
                update({ noise: { ...config.noise, monochrome: event.target.checked } })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pattern</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enabled</Label>
            <Switch
              checked={config.pattern.enabled}
              onChange={(event) => update({ pattern: { ...config.pattern, enabled: event.target.checked } })}
            />
          </div>
          <div className="grid gap-3">
            <Label>Type</Label>
            <select
              className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={config.pattern.type}
              onChange={(event) =>
                update({
                  pattern: {
                    ...config.pattern,
                    type: event.target.value as RenderConfig["pattern"]["type"],
                  },
                })
              }
            >
              <option value="dots">Dots</option>
              <option value="grid">Grid</option>
              <option value="diagonal">Diagonal</option>
              <option value="waves">Waves</option>
              <option value="topo">Topographic</option>
              <option value="halftone">Halftone</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Opacity</span>
              <span>{config.pattern.opacity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={config.pattern.opacity}
              onChange={(event) =>
                update({ pattern: { ...config.pattern, opacity: Number(event.target.value) } })
              }
              className={sliderClassName}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Scale</span>
              <span>{config.pattern.scale.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={config.pattern.scale}
              onChange={(event) => update({ pattern: { ...config.pattern, scale: Number(event.target.value) } })}
              className={sliderClassName}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Rotation</span>
              <span>{Math.round(config.pattern.rotation)}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={config.pattern.rotation}
              onChange={(event) =>
                update({ pattern: { ...config.pattern, rotation: Number(event.target.value) } })
              }
              className={sliderClassName}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decorative elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enabled</Label>
            <Switch
              checked={config.decorative.enabled}
              onChange={(event) =>
                update({ decorative: { ...config.decorative, enabled: event.target.checked } })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              ["blobs", "Blobs"],
              ["bokeh", "Bokeh"],
              ["clouds", "Clouds"],
              ["streaks", "Light streaks"],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <Label>{label}</Label>
                <Switch
                  checked={config.decorative[key]}
                  onChange={(event) =>
                    update({
                      decorative: { ...config.decorative, [key]: event.target.checked },
                    })
                  }
                />
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Density</span>
              <span>{config.decorative.density.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.decorative.density}
              onChange={(event) =>
                update({ decorative: { ...config.decorative, density: Number(event.target.value) } })
              }
              className={sliderClassName}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Blur</span>
              <span>{config.decorative.blur.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.decorative.blur}
              onChange={(event) =>
                update({ decorative: { ...config.decorative, blur: Number(event.target.value) } })
              }
              className={sliderClassName}
            />
          </div>
          <div className="grid gap-3">
            <Label>Color strategy</Label>
            <select
              className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Opacity min</span>
              <span>{config.decorative.opacityMin.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.8}
              step={0.05}
              value={config.decorative.opacityMin}
              onChange={(event) =>
                update({ decorative: { ...config.decorative, opacityMin: Number(event.target.value) } })
              }
              className={sliderClassName}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Opacity max</span>
              <span>{config.decorative.opacityMax.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={config.decorative.opacityMax}
              onChange={(event) =>
                update({ decorative: { ...config.decorative, opacityMax: Number(event.target.value) } })
              }
              className={sliderClassName}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Post-processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Vignette</Label>
            <Switch
              checked={config.post.vignette}
              onChange={(event) => update({ post: { ...config.post, vignette: event.target.checked } })}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Vignette strength</span>
              <span>{config.post.vignetteStrength.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.8}
              step={0.05}
              value={config.post.vignetteStrength}
              onChange={(event) =>
                update({ post: { ...config.post, vignetteStrength: Number(event.target.value) } })
              }
              className={sliderClassName}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Subtle sharpen</Label>
            <Switch
              checked={config.post.sharpen}
              onChange={(event) => update({ post: { ...config.post, sharpen: event.target.checked } })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Film tint</Label>
            <Switch
              checked={config.post.film}
              onChange={(event) => update({ post: { ...config.post, film: event.target.checked } })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
