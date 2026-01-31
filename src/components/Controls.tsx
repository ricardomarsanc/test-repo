import { useEffect, useState } from "react";
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

const colorPresets = [
  "#0f172a",
  "#1e293b",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#f43f5e",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#14b8a6",
  "#38bdf8",
  "#e2e8f0",
];

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
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const palette = config.gradient.palette;
  const activeColor = palette[activeColorIndex] ?? palette[0] ?? "#ffffff";

  useEffect(() => {
    if (activeColorIndex >= palette.length) {
      setActiveColorIndex(Math.max(0, palette.length - 1));
    }
  }, [activeColorIndex, palette.length]);

  const updateColorAt = (index: number, color: string) => {
    const nextPalette = [...palette];
    nextPalette[index] = color;
    update({ gradient: { ...config.gradient, palette: nextPalette } });
  };

  const handleRemoveColor = (index: number) => {
    if (palette.length <= 2) return;
    const nextPalette = palette.filter((_, paletteIndex) => paletteIndex !== index);
    update({ gradient: { ...config.gradient, palette: nextPalette } });
    setActiveColorIndex(Math.max(0, index - 1));
  };

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
          <p className="text-xs text-slate-400">
            Locking the seed lets you regenerate the exact same scene later.
          </p>
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
          <p className="text-xs text-slate-400">
            Jump-start your design with pre-tuned lighting and texture stacks.
          </p>
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
          <p className="text-xs text-slate-400">Pick a canvas size before exporting or sharing.</p>
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
          <p className="text-xs text-slate-400">
            Blend multiple colors together to define the base lighting.
          </p>
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
              <option value="shader">Shader wash</option>
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
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {palette.map((color, index) => (
                <div key={`${color}-${index}`} className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveColorIndex(index)}
                    className={`h-10 w-10 rounded-lg border ${
                      index === activeColorIndex
                        ? "border-sky-400 ring-2 ring-sky-400/60"
                        : "border-slate-800"
                    }`}
                    style={{ background: color }}
                    aria-label={`Select color ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    disabled={palette.length <= 2}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-[10px] text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Remove color ${index + 1}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (palette.length >= 6) return;
                  update({
                    gradient: {
                      ...config.gradient,
                      palette: [...palette, activeColor],
                    },
                  });
                  setActiveColorIndex(palette.length);
                }}
                disabled={palette.length >= 6}
              >
                + Color
              </Button>
              <Button size="sm" variant="outline" onClick={onRandomPalette}>
                Random palette
              </Button>
            </div>
            <div className="grid gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={activeColor}
                  onChange={(event) => updateColorAt(activeColorIndex, event.target.value)}
                  className="h-12 w-12 cursor-pointer rounded-lg border border-slate-700 bg-transparent"
                />
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-slate-400">Selected color</Label>
                  <Input
                    value={activeColor}
                    onChange={(event) => updateColorAt(activeColorIndex, event.target.value)}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => updateColorAt(activeColorIndex, preset)}
                    className="h-6 w-6 rounded-md border border-slate-800"
                    style={{ background: preset }}
                    aria-label={`Set color to ${preset}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex h-3 overflow-hidden rounded-full border border-slate-800">
            {palette.map((color, index) => (
              <div key={`${color}-${index}`} className="h-full flex-1" style={{ background: color }} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Noise</CardTitle>
          <p className="text-xs text-slate-400">
            Layer in grain to make gradients feel tactile and less flat.
          </p>
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
          <div className="grid gap-3">
            <Label>Texture</Label>
            <select
              className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              value={config.noise.texture}
              onChange={(event) =>
                update({
                  noise: {
                    ...config.noise,
                    texture: event.target.value as RenderConfig["noise"]["texture"],
                  },
                })
              }
            >
              <option value="classic">Classic noise</option>
              <option value="grain">Film grain</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pattern</CardTitle>
          <p className="text-xs text-slate-400">
            Add structured overlays for depth and subtle movement.
          </p>
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
              <option value="vertex">Vertex mesh</option>
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

    </div>
  );
}
