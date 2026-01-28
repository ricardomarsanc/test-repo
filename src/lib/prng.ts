export type PRNG = () => number;

export function hashStringToSeed(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): PRNG {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRandom(seedValue: string | number): PRNG {
  const seed = typeof seedValue === "number" ? seedValue : hashStringToSeed(seedValue);
  return mulberry32(seed);
}

export function randomBetween(rng: PRNG, min: number, max: number): number {
  return min + (max - min) * rng();
}

export function pickOne<T>(rng: PRNG, list: T[]): T {
  return list[Math.floor(rng() * list.length) % list.length];
}
