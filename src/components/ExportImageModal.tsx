import React, { useState, useRef, useEffect } from 'react';
import { SpriteProject } from '../types/sprite';
import { getColorByIndex } from '../constants/palettes';
import { pcSpeaker } from '../utils/sound';

interface ExportImageModalProps {
  project: SpriteProject;
  currentFrameIndex: number;
  onClose: () => void;
}

export const ExportImageModal: React.FC<ExportImageModalProps> = ({
  project,
  currentFrameIndex,
  onClose,
}) => {
  const [exportScope, setExportScope] = useState<'current' | 'sheet_h' | 'sheet_grid'>('current');
  const [scale, setScale] = useState<number>(8);
  const [includeBackground, setIncludeBackground] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>('#0000AA');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { width, height, frames, paletteMode, transparentColorIndex } = project;

  // Calculate dimensions based on export type and scale
  const sheetCols = exportScope === 'current' ? 1 : exportScope === 'sheet_h' ? frames.length : Math.ceil(Math.sqrt(frames.length));
  const sheetRows = exportScope === 'current' ? 1 : exportScope === 'sheet_h' ? 1 : Math.ceil(frames.length / sheetCols);

  const totalWidth = sheetCols * width * scale;
  const totalHeight = sheetRows * height * scale;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (includeBackground) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const framesToRender = exportScope === 'current' ? [frames[currentFrameIndex]] : frames;

    framesToRender.forEach((f, idx) => {
      const col = exportScope === 'sheet_grid' ? idx % sheetCols : idx;
      const row = exportScope === 'sheet_grid' ? Math.floor(idx / sheetCols) : 0;
      const startX = col * width * scale;
      const startY = row * height * scale;

      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const colIdx = f.pixels[py * width + px];
          if (colIdx !== transparentColorIndex || includeBackground) {
            ctx.fillStyle = getColorByIndex(colIdx, paletteMode).hex;
            ctx.fillRect(startX + px * scale, startY + py * scale, scale, scale);
          }
        }
      }
    });
  }, [exportScope, scale, includeBackground, bgColor, frames, currentFrameIndex, width, height, paletteMode, transparentColorIndex, sheetCols, sheetRows]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    pcSpeaker.playCoin();
    const link = document.createElement('a');
    link.download = `${project.name.toLowerCase()}_${exportScope}_${scale}x.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#AAAAAA] border-4 border-white border-r-black border-b-black shadow-[8px_8px_0px_#000000] p-4 max-w-xl w-full flex flex-col font-mono text-black text-xs">
        {/* Header */}
        <div className="bg-[#0000AA] text-white font-bold px-3 py-1 flex justify-between items-center mb-3">
          <span>EXPORT PNG SPRITE IMAGE</span>
          <button onClick={onClose} className="bg-[#AA0000] text-white px-2 py-0.5 hover:bg-[#FF5555]">
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mb-3 bg-[#C0C0C0] p-3 border-2 border-white border-r-black border-b-black">
          <div>
            <label className="block text-[10px] font-bold text-[#333333] mb-1">EXPORT MODE</label>
            <select
              value={exportScope}
              onChange={(e) => setExportScope(e.target.value as 'current' | 'sheet_h' | 'sheet_grid')}
              className="w-full bg-white border border-black font-bold p-1"
            >
              <option value="current">Current Frame #{currentFrameIndex + 1}</option>
              <option value="sheet_h">Sprite Sheet (Horizontal Strip)</option>
              <option value="sheet_grid">Sprite Sheet (Grid Box)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#333333] mb-1">PIXEL SCALE</label>
            <select
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value) || 1)}
              className="w-full bg-white border border-black font-bold p-1"
            >
              <option value="1">1x (Native {width}x{height})</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
              <option value="8">8x (Recommended)</option>
              <option value="16">16x (HD Pixel Art)</option>
            </select>
          </div>

          <div className="col-span-2 flex items-center justify-between border-t border-[#888888] pt-2">
            <label className="flex items-center gap-1.5 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={includeBackground}
                onChange={(e) => setIncludeBackground(e.target.checked)}
                className="accent-[#0000AA]"
              />
              <span>Include Solid Background</span>
            </label>

            {includeBackground && (
              <div className="flex items-center gap-1.5">
                <span>Color:</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-6 border border-black cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Container */}
        <div className="bg-black/90 p-3 border-2 border-white flex items-center justify-center max-h-60 overflow-auto">
          <canvas
            ref={canvasRef}
            width={totalWidth}
            height={totalHeight}
            className="border border-[#555555] max-h-52 object-contain"
          />
        </div>

        <div className="mt-3 flex justify-between items-center">
          <span className="text-[10px] text-[#333333]">
            Dimensions: {totalWidth} x {totalHeight} px
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#C0C0C0] border-2 border-white border-r-black border-b-black hover:bg-white font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 bg-[#0000AA] text-white border-2 border-[#5555FF] border-r-black border-b-black hover:bg-[#5555FF] font-bold"
            >
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
