import React, { useState } from 'react';
import { ColorDef } from '../types/sprite';
import { QBASIC_16_PALETTE, VGA_256_PALETTE, getColorByIndex } from '../constants/palettes';
import { pcSpeaker } from '../utils/sound';

interface PalettePickerProps {
  primaryColor: number;
  secondaryColor: number;
  onSelectPrimaryColor: (colorIndex: number) => void;
  onSelectSecondaryColor: (colorIndex: number) => void;
  paletteMode: '16' | '256';
  onTogglePaletteMode: () => void;
  transparentColorIndex: number;
  onSetTransparentColorIndex: (index: number) => void;
}

export const PalettePicker: React.FC<PalettePickerProps> = ({
  primaryColor,
  secondaryColor,
  onSelectPrimaryColor,
  onSelectSecondaryColor,
  paletteMode,
  onTogglePaletteMode,
  transparentColorIndex,
  onSetTransparentColorIndex,
}) => {
  const [showFullVgaModal, setShowFullVgaModal] = useState(false);
  const [hoveredColor, setHoveredColor] = useState<ColorDef | null>(null);

  const primaryDef = getColorByIndex(primaryColor, paletteMode);
  const secondaryDef = getColorByIndex(secondaryColor, paletteMode);

  const handleColorClick = (colorIdx: number, isRightClick: boolean = false) => {
    pcSpeaker.playStep();
    if (isRightClick) {
      onSelectSecondaryColor(colorIdx);
    } else {
      onSelectPrimaryColor(colorIdx);
    }
  };

  const handleSwap = () => {
    pcSpeaker.playStep();
    const temp = primaryColor;
    onSelectPrimaryColor(secondaryColor);
    onSelectSecondaryColor(temp);
  };

  return (
    <div className="w-64 bg-[#AAAAAA] text-black font-mono text-xs border-l-2 border-black flex flex-col p-1.5 gap-2 select-none shadow-[-2px_0px_0px_#000000]">
      {/* Title box */}
      <div className="bg-[#0000AA] text-[#FFFF55] font-bold px-1.5 py-0.5 text-center border-t border-l border-[#5555FF] border-b-2 border-r-2 border-[#000055] flex justify-between items-center shadow-inner">
        <span>PALETTE</span>
        <button
          onClick={onTogglePaletteMode}
          className="text-[10px] bg-white text-black px-1 border border-black hover:bg-[#FFFF55]"
          title="Toggle 16-color or 256-color palette"
        >
          {paletteMode === '16' ? '16c (EGA)' : '256c (VGA)'}
        </button>
      </div>

      {/* Primary & Secondary Active Colors */}
      <div className="bg-[#C0C0C0] p-2 border-2 border-white border-r-black border-b-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Overlapping FG / BG swatches */}
          <div className="relative w-12 h-12">
            {/* Secondary Color (Back) */}
            <div
              className="absolute bottom-0 right-0 w-8 h-8 border-2 border-black shadow-sm"
              style={{ backgroundColor: secondaryDef.hex }}
              title={`Secondary (Right Click): #${secondaryColor} ${secondaryDef.name}`}
            />
            {/* Primary Color (Front) */}
            <div
              className="absolute top-0 left-0 w-8 h-8 border-2 border-white border-r-black border-b-black shadow-md z-10"
              style={{ backgroundColor: primaryDef.hex }}
              title={`Primary (Left Click): #${primaryColor} ${primaryDef.name}`}
            />
          </div>

          {/* Details */}
          <div className="text-[11px] leading-tight">
            <div className="font-bold flex items-center gap-1">
              <span className="text-[#0000AA]">FG:</span>
              <span className="bg-black text-white px-1 font-mono">#{primaryColor}</span>
            </div>
            <div className="font-bold flex items-center gap-1 mt-0.5">
              <span className="text-[#555555]">BG:</span>
              <span className="bg-black text-white px-1 font-mono">#{secondaryColor}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSwap}
          title="Swap FG and BG Colors (X)"
          className="p-1 bg-[#AAAAAA] border border-white border-r-black border-b-black hover:bg-white text-xs font-bold"
        >
          ⇄
        </button>
      </div>

      {/* Transparent Color Indicator */}
      <div className="bg-[#C0C0C0] px-2 py-1 border border-white border-r-black border-b-black flex items-center justify-between text-[11px]">
        <span>Key Transparency:</span>
        <button
          onClick={() => {
            pcSpeaker.playStep();
            onSetTransparentColorIndex(primaryColor);
          }}
          title="Set current FG color as transparent key"
          className="flex items-center gap-1 font-bold bg-white px-1.5 py-0.5 border border-black hover:bg-[#FFFF55]"
        >
          <span
            className="w-3 h-3 inline-block border border-black"
            style={{ backgroundColor: getColorByIndex(transparentColorIndex, paletteMode).hex }}
          />
          <span>Col #{transparentColorIndex}</span>
        </button>
      </div>

      {/* 16 Standard QBasic Colors Swatch Grid */}
      <div className="border-t border-[#555555] pt-1">
        <div className="text-[10px] text-[#222222] font-bold mb-1 flex justify-between">
          <span>STANDARD 16 COLORS</span>
          <span className="text-[9px] text-[#555555]">L-Click / R-Click</span>
        </div>
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#888888] border border-black">
          {QBASIC_16_PALETTE.map((c) => {
            const isPrimary = primaryColor === c.index;
            const isSecondary = secondaryColor === c.index;
            return (
              <button
                key={c.index}
                onClick={() => handleColorClick(c.index, false)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleColorClick(c.index, true);
                }}
                onMouseEnter={() => setHoveredColor(c)}
                onMouseLeave={() => setHoveredColor(null)}
                style={{ backgroundColor: c.hex }}
                className={`h-7 relative border transition-transform ${
                  isPrimary
                    ? 'border-2 border-white shadow-[0_0_0_1px_#000000] scale-105 z-10'
                    : isSecondary
                    ? 'border-2 border-yellow-300 shadow-[0_0_0_1px_#000000] scale-100 z-10'
                    : 'border-black hover:border-white'
                }`}
                title={`#${c.index} ${c.name} (${c.hex})\nLeft: Set FG, Right: Set BG`}
              >
                <span
                  className={`absolute top-0 left-0.5 text-[8px] font-bold ${
                    c.index === 0 || c.index === 1 || c.index === 2 || c.index === 4 || c.index === 5 || c.index === 8
                      ? 'text-white'
                      : 'text-black'
                  }`}
                >
                  {c.index}
                </span>
                {isPrimary && (
                  <span className="absolute bottom-0 right-0.5 text-[8px] text-white font-extrabold drop-shadow">
                    P
                  </span>
                )}
                {isSecondary && !isPrimary && (
                  <span className="absolute bottom-0 right-0.5 text-[8px] text-yellow-300 font-extrabold drop-shadow">
                    S
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* VGA 256 Palette View / Expand Button */}
      {paletteMode === '256' ? (
        <div className="border-t border-[#555555] pt-1 flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span>FULL 256 VGA PALETTE</span>
            <button
              onClick={() => setShowFullVgaModal(true)}
              className="px-1.5 py-0.5 bg-[#0000AA] text-white border border-black hover:bg-[#5555FF]"
            >
              Zoom Grid 🔍
            </button>
          </div>
          {/* Scrollable / Compact 256 grid */}
          <div className="grid grid-cols-16 gap-[1px] p-1 bg-black border border-white max-h-48 overflow-y-auto">
            {VGA_256_PALETTE.map((c) => (
              <button
                key={c.index}
                onClick={() => handleColorClick(c.index, false)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleColorClick(c.index, true);
                }}
                onMouseEnter={() => setHoveredColor(c)}
                onMouseLeave={() => setHoveredColor(null)}
                style={{ backgroundColor: c.hex }}
                className={`w-full h-3 border ${
                  primaryColor === c.index ? 'border-white z-10' : 'border-transparent hover:border-white'
                }`}
                title={`#${c.index} (${c.r}, ${c.g}, ${c.b})`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-auto border-t border-[#555555] pt-2">
          <button
            onClick={() => {
              pcSpeaker.playStep();
              onTogglePaletteMode();
            }}
            className="w-full py-1.5 bg-[#C0C0C0] border-2 border-white border-r-black border-b-black font-bold text-center hover:bg-white text-[11px]"
          >
            Switch to SCREEN 13 (256c)
          </button>
        </div>
      )}

      {/* Hovered Color readout */}
      <div className="mt-auto bg-black text-[#55FF55] p-1.5 font-mono text-[10px] border border-white">
        {hoveredColor ? (
          <div>
            <div className="font-bold text-[#FFFF55]">Index: #{hoveredColor.index}</div>
            <div>RGB: {hoveredColor.r}, {hoveredColor.g}, {hoveredColor.b}</div>
            <div>HEX: {hoveredColor.hex}</div>
          </div>
        ) : (
          <div className="text-[#AAAAAA]">
            Hover over a color or click to select
          </div>
        )}
      </div>

      {/* Full VGA Modal */}
      {showFullVgaModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#AAAAAA] border-4 border-white border-r-black border-b-black shadow-[8px_8px_0px_#000000] p-4 max-w-2xl w-full">
            <div className="bg-[#0000AA] text-white font-bold px-3 py-1 flex justify-between items-center mb-3">
              <span>VGA SCREEN 13 PALETTE (256 COLORS)</span>
              <button
                onClick={() => setShowFullVgaModal(false)}
                className="bg-[#AA0000] text-white px-2 py-0.5 hover:bg-[#FF5555] border border-white"
              >
                ✕
              </button>
            </div>
            <div className="text-xs mb-2 text-[#222222]">
              Left-click to set Foreground (Primary). Right-click to set Background (Secondary).
            </div>
            <div className="grid grid-cols-16 gap-1 p-2 bg-black border-2 border-white max-h-96 overflow-y-auto">
              {VGA_256_PALETTE.map((c) => (
                <button
                  key={c.index}
                  onClick={() => {
                    handleColorClick(c.index, false);
                    setShowFullVgaModal(false);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleColorClick(c.index, true);
                    setShowFullVgaModal(false);
                  }}
                  style={{ backgroundColor: c.hex }}
                  className="w-full aspect-square border border-black hover:border-white relative group"
                  title={`#${c.index}: ${c.hex}`}
                >
                  <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-[#FFFF55] text-[9px] px-1 pointer-events-none z-20 whitespace-nowrap">
                    #{c.index}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setShowFullVgaModal(false)}
                className="px-4 py-1.5 bg-[#0000AA] text-white font-bold border-2 border-white border-r-black border-b-black hover:bg-[#5555FF]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
