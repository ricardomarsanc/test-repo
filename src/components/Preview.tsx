import { useEffect, useRef } from "react";
import { RenderConfig, renderBackground } from "../lib/render";

interface PreviewProps {
  config: RenderConfig;
  width: number;
  height: number;
}

export default function Preview({ config, width, height }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const handle = window.setTimeout(() => {
      renderBackground(ctx, config, {
        width,
        height,
        devicePixelRatio: window.devicePixelRatio || 1,
      });
    }, 150);

    return () => window.clearTimeout(handle);
  }, [config, width, height]);

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-panel"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </div>
  );
}
