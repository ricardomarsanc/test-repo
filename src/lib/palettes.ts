import { PRNG, pickOne, randomBetween } from "./prng";

export const palettes = {
  prism: ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316"],
  aurora: ["#0ea5e9", "#22d3ee", "#a3e635", "#facc15"],
  sunset: ["#f97316", "#f43f5e", "#8b5cf6", "#0ea5e9"],
  ocean: ["#0f172a", "#0ea5e9", "#22d3ee", "#38bdf8"],
  candy: ["#f472b6", "#fb7185", "#facc15", "#34d399"],
  noirNeon: ["#0b1020", "#22c55e", "#f97316", "#38bdf8"],
  vertex: ["#0ea5e9", "#6366f1", "#a78bfa", "#f472b6"],
  painterly: ["#f7b59a", "#e590a5", "#c1a1f1", "#8ab4f8", "#9be7c4"],
};

const basePool = [
  "#0ea5e9",
  "#38bdf8",
  "#818cf8",
  "#a855f7",
  "#f472b6",
  "#fb7185",
  "#f97316",
  "#facc15",
  "#4ade80",
  "#22d3ee",
  "#0f172a",
  "#111827",
  "#1e293b",
];

export function randomPalette(rng: PRNG, min = 2, max = 5): string[] {
  const count = Math.floor(randomBetween(rng, min, max + 1));
  const copy = [...basePool];
  const colors: string[] = [];
  for (let i = 0; i < count; i += 1) {
    colors.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return colors;
}

export function paletteFromPreset(name: keyof typeof palettes): string[] {
  return palettes[name];
}

export function randomPreset(rng: PRNG): string[] {
  return paletteFromPreset(pickOne(rng, Object.keys(palettes) as (keyof typeof palettes)[]));
}
