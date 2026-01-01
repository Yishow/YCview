import React, { useState, useRef } from 'react';

interface ImagePreviewProps {
  src: string;
  alt?: string;
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    const img = e.currentTarget;
    setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.5, 10));
  const handleZoomOut = () => setScale((s) => Math.max(s / 1.5, 0.1));
  const handleFit = () => setScale(1);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#1a1a1a] text-[#a0a0a0] font-mono">
      <div className="flex items-center justify-between border-b border-[#333] bg-[#222] px-4 py-2 text-xs uppercase tracking-wider backdrop-blur-md bg-opacity-80 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-accent)] opacity-70">IMG_PREVIEW</span>
          <span className="text-[#555]">::</span>
          <span className="truncate max-w-[200px] text-[#ccc]">{alt || 'Untitled'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="h-6 w-6 rounded-sm border border-[#444] bg-[#2a2a2a] text-center hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] active:translate-y-[1px] transition-colors"
            title="Zoom Out"
          >
            -
          </button>
          <span className="min-w-[3ch] text-center text-[#777]">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="h-6 w-6 rounded-sm border border-[#444] bg-[#2a2a2a] text-center hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] active:translate-y-[1px] transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleFit}
            className="ml-2 h-6 px-2 rounded-sm border border-[#444] bg-[#2a2a2a] text-[10px] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] active:translate-y-[1px] transition-colors"
          >
            RST
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto p-8"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #222 25%, transparent 25%),
            linear-gradient(-45deg, #222 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #222 75%),
            linear-gradient(-45deg, transparent 75%, #222 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin border-2 border-[var(--color-accent)] border-t-transparent rounded-full" />
          </div>
        )}

        <div className="flex min-h-full min-w-full items-center justify-center">
          <img
            src={src}
            alt={alt}
            onLoad={handleImageLoad}
            className="shadow-2xl transition-transform duration-200 ease-out origin-center block max-w-none"
            style={{
              transform: `scale(${scale})`,
              imageRendering: scale > 1 ? 'pixelated' : 'auto',
              opacity: isLoading ? 0 : 1,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#333] bg-[#222] px-4 py-1.5 text-[10px] text-[#666]">
        <div className="flex gap-4">
          <span>DIM: {dimensions ? `${dimensions.width}x${dimensions.height}` : '---'}</span>
          <span>FMT: {src.split('.').pop()?.toUpperCase() || 'UNKNOWN'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}
          />
          <span>{isLoading ? 'LOADING' : 'READY'}</span>
        </div>
      </div>
    </div>
  );
}
