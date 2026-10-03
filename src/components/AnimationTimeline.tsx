import React, { useEffect, useState, useRef } from 'react';
import { SpriteFrame } from '../types/sprite';
import { getColorByIndex } from '../constants/palettes';
import { pcSpeaker } from '../utils/sound';

interface AnimationTimelineProps {
  frames: SpriteFrame[];
  currentFrameIndex: number;
  onSelectFrame: (index: number) => void;
  onAddFrame: () => void;
  onDuplicateFrame: () => void;
  onDeleteFrame: (index: number) => void;
  onMoveFrame: (fromIndex: number, toIndex: number) => void;
  fps: number;
  onChangeFps: (fps: number) => void;
  width: number;
  height: number;
  paletteMode: '16' | '256';
  transparentColorIndex: number;
  onionSkin: boolean;
  onToggleOnionSkin: () => void;
}

export const AnimationTimeline: React.FC<AnimationTimelineProps> = ({
  frames,
  currentFrameIndex,
  onSelectFrame,
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  onMoveFrame,
  fps,
  onChangeFps,
  width,
  height,
  paletteMode,
  transparentColorIndex,
  onionSkin,
  onToggleOnionSkin,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewFrameIndex, setPreviewFrameIndex] = useState(0);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Animation playback loop
  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewFrameIndex((prev) => (prev + 1) % frames.length);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [isPlaying, fps, frames.length]);

  // Render preview canvas
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Checkerboard
    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x += 4) {
        ctx.fillStyle = ((x / 4) + (y / 4)) % 2 === 0 ? '#111827' : '#1f2937';
        ctx.fillRect(x, y, 4, 4);
      }
    }

    const frameToShow = isPlaying ? frames[previewFrameIndex] : frames[currentFrameIndex];
    if (!frameToShow) return;

    const scale = Math.min(canvas.width / width, canvas.height / height);
    const offsetX = (canvas.width - width * scale) / 2;
    const offsetY = (canvas.height - height * scale) / 2;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const col = frameToShow.pixels[py * width + px];
        if (col !== transparentColorIndex) {
          ctx.fillStyle = getColorByIndex(col, paletteMode).hex;
          ctx.fillRect(offsetX + px * scale, offsetY + py * scale, scale, scale);
        }
      }
    }
  }, [isPlaying, previewFrameIndex, currentFrameIndex, frames, width, height, paletteMode, transparentColorIndex]);

  return (
    <div className="h-28 bg-[#AAAAAA] text-black font-mono text-xs border-t-2 border-black flex items-center px-3 py-1.5 gap-3 select-none shadow-[0px_-2px_0px_#000000]">
      {/* Live Preview Box */}
      <div className="flex items-center gap-2 pr-3 border-r border-[#555555]">
        <div className="flex flex-col items-center">
          <div className="border-2 border-black bg-black shadow-inner">
            <canvas ref={previewCanvasRef} width={64} height={64} className="block" />
          </div>
          <span className="text-[10px] text-[#222222] font-bold mt-0.5">
            {isPlaying ? `F: ${previewFrameIndex + 1}/${frames.length}` : `Frame ${currentFrameIndex + 1}`}
          </span>
        </div>

        {/* Play/Pause & FPS */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => {
              pcSpeaker.playStep();
              setIsPlaying(!isPlaying);
            }}
            className={`px-2 py-1 font-bold border-2 text-[11px] ${
              isPlaying
                ? 'bg-[#AA0000] text-white border-white border-r-black border-b-black'
                : 'bg-[#00AA00] text-black border-white border-r-black border-b-black hover:bg-[#55FF55]'
            }`}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <div className="flex items-center gap-1 text-[10px]">
            <span className="font-bold">FPS:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={fps}
              onChange={(e) => onChangeFps(parseInt(e.target.value) || 1)}
              className="w-14 accent-[#0000AA]"
            />
            <span className="w-5 text-right font-bold">{fps}</span>
          </div>

          <button
            onClick={() => {
              pcSpeaker.playStep();
              onToggleOnionSkin();
            }}
            className={`px-1.5 py-0.5 text-[10px] font-bold border ${
              onionSkin
                ? 'bg-[#0000AA] text-white border-black'
                : 'bg-[#C0C0C0] text-black border-white border-r-black border-b-black hover:bg-white'
            }`}
          >
            {onionSkin ? '✓ Onion Skin' : 'Onion Skin'}
          </button>
        </div>
      </div>

      {/* Frame Strip */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
        {frames.map((frame, index) => {
          const isSelected = currentFrameIndex === index;
          return (
            <div
              key={frame.id}
              onClick={() => {
                pcSpeaker.playStep();
                onSelectFrame(index);
              }}
              className={`relative flex flex-col items-center p-1 cursor-pointer transition-all border-2 shrink-0 ${
                isSelected
                  ? 'bg-[#0000AA] text-[#FFFF55] border-white shadow-[0_0_0_1px_#000000]'
                  : 'bg-[#C0C0C0] text-black border-white border-r-black border-b-black hover:bg-white'
              }`}
            >
              {/* Mini canvas preview */}
              <div className="w-12 h-12 bg-black border border-black overflow-hidden relative">
                <MiniThumbnail
                  pixels={frame.pixels}
                  width={width}
                  height={height}
                  paletteMode={paletteMode}
                  transparentColorIndex={transparentColorIndex}
                />
              </div>
              <div className="text-[10px] font-bold mt-1 max-w-[50px] truncate text-center">
                #{index + 1}
              </div>

              {/* Move / Delete hover buttons */}
              {isSelected && frames.length > 1 && (
                <div className="flex gap-0.5 mt-0.5">
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        pcSpeaker.playStep();
                        onMoveFrame(index, index - 1);
                      }}
                      title="Move Left"
                      className="px-1 text-[9px] bg-black text-white hover:bg-[#5555FF]"
                    >
                      ◀
                    </button>
                  )}
                  {index < frames.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        pcSpeaker.playStep();
                        onMoveFrame(index, index + 1);
                      }}
                      title="Move Right"
                      className="px-1 text-[9px] bg-black text-white hover:bg-[#5555FF]"
                    >
                      ▶
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      pcSpeaker.playBump();
                      onDeleteFrame(index);
                    }}
                    title="Delete Frame"
                    className="px-1 text-[9px] bg-[#AA0000] text-white hover:bg-[#FF5555]"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Frame & Duplicate buttons */}
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={() => {
              pcSpeaker.playStep();
              onAddFrame();
            }}
            className="px-2.5 py-1.5 bg-[#C0C0C0] text-black font-bold border-2 border-white border-r-black border-b-black hover:bg-white text-[11px] flex items-center gap-1 shadow-sm"
          >
            <span>+</span> New Frame
          </button>
          <button
            onClick={() => {
              pcSpeaker.playStep();
              onDuplicateFrame();
            }}
            className="px-2.5 py-1 bg-[#C0C0C0] text-black font-bold border-2 border-white border-r-black border-b-black hover:bg-white text-[10px] flex items-center gap-1"
          >
            <span>⎘</span> Duplicate
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for rendering mini thumbnail
const MiniThumbnail: React.FC<{
  pixels: number[];
  width: number;
  height: number;
  paletteMode: '16' | '256';
  transparentColorIndex: number;
}> = ({ pixels, width, height, paletteMode, transparentColorIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = canvas.width / width;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const col = pixels[py * width + px];
        if (col !== transparentColorIndex) {
          ctx.fillStyle = getColorByIndex(col, paletteMode).hex;
          ctx.fillRect(px * scale, py * scale, scale, scale);
        }
      }
    }
  }, [pixels, width, height, paletteMode, transparentColorIndex]);

  return <canvas ref={canvasRef} width={48} height={48} className="w-full h-full block" />;
};
