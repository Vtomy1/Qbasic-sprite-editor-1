import React, { useState, useRef } from 'react';
import { SpriteProject } from '../types/sprite';
import { quantizeImageToPixels } from '../utils/quantize';
import { getColorByIndex } from '../constants/palettes';
import { pcSpeaker } from '../utils/sound';

interface ImportImageModalProps {
  project: SpriteProject;
  onImport: (pixels: number[], asNewFrame: boolean) => void;
  onClose: () => void;
}

export const ImportImageModal: React.FC<ImportImageModalProps> = ({
  project,
  onImport,
  onClose,
}) => {
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  const [quantizedPixels, setQuantizedPixels] = useState<number[] | null>(null);
  const [asNewFrame, setAsNewFrame] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const { width, height, paletteMode, transparentColorIndex } = project;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setFileSrc(src);

      const img = new Image();
      img.onload = () => {
        const pixels = quantizeImageToPixels(img, width, height, paletteMode, transparentColorIndex);
        setQuantizedPixels(pixels);
        pcSpeaker.playStep();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Render preview canvas
  React.useEffect(() => {
    if (!quantizedPixels) return;
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

    const scale = canvas.width / width;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const colIdx = quantizedPixels[py * width + px];
        if (colIdx !== transparentColorIndex) {
          ctx.fillStyle = getColorByIndex(colIdx, paletteMode).hex;
          ctx.fillRect(px * scale, py * scale, scale, scale);
        }
      }
    }
  }, [quantizedPixels, width, height, paletteMode, transparentColorIndex]);

  const handleApply = () => {
    if (!quantizedPixels) return;
    pcSpeaker.playCoin();
    onImport(quantizedPixels, asNewFrame);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#AAAAAA] border-4 border-white border-r-black border-b-black shadow-[8px_8px_0px_#000000] p-4 max-w-lg w-full flex flex-col font-mono text-black text-xs">
        {/* Header */}
        <div className="bg-[#0000AA] text-white font-bold px-3 py-1 flex justify-between items-center mb-3">
          <span>IMPORT & QUANTIZE IMAGE</span>
          <button onClick={onClose} className="bg-[#AA0000] text-white px-2 py-0.5 hover:bg-[#FF5555]">
            ✕
          </button>
        </div>

        {/* File input */}
        <div className="bg-[#C0C0C0] p-3 border-2 border-white border-r-black border-b-black mb-3">
          <label className="block text-[11px] font-bold text-[#222222] mb-1.5">
            SELECT IMAGE FILE (.PNG, .BMP, .GIF, .JPG)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full bg-white border border-black p-1 text-xs cursor-pointer"
          />
          <div className="text-[10px] text-[#555555] mt-1">
            Image will be automatically resampled to {width}x{height} pixels and mapped to the closest QBasic {paletteMode}-color palette!
          </div>
        </div>

        {/* Previews */}
        {fileSrc && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold mb-1">ORIGINAL IMAGE</span>
              <div className="w-32 h-32 bg-black border-2 border-white flex items-center justify-center overflow-hidden">
                <img src={fileSrc} alt="Original" className="max-w-full max-h-full object-contain" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold mb-1">QBASIC QUANTIZED</span>
              <div className="w-32 h-32 bg-black border-2 border-white flex items-center justify-center">
                <canvas ref={previewCanvasRef} width={128} height={128} className="block" />
              </div>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="bg-[#C0C0C0] p-2 border border-white border-r-black border-b-black mb-3 flex items-center justify-between">
          <label className="flex items-center gap-1.5 font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={asNewFrame}
              onChange={(e) => setAsNewFrame(e.target.checked)}
              className="accent-[#0000AA]"
            />
            <span>Add as New Frame (Keep current frame)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#C0C0C0] border-2 border-white border-r-black border-b-black hover:bg-white font-bold"
          >
            Cancel
          </button>
          <button
            disabled={!quantizedPixels}
            onClick={handleApply}
            className={`px-4 py-1.5 font-bold border-2 ${
              quantizedPixels
                ? 'bg-[#0000AA] text-white border-[#5555FF] border-r-black border-b-black hover:bg-[#5555FF]'
                : 'bg-[#888888] text-[#555555] border-black cursor-not-allowed'
            }`}
          >
            Import Into Sprite
          </button>
        </div>
      </div>
    </div>
  );
};
