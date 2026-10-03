import React from 'react';
import { ToolType } from '../types/sprite';
import { pcSpeaker } from '../utils/sound';

interface ToolbarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  brushSize: number;
  onSelectBrushSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onFlipH: () => void;
  onFlipV: () => void;
  onRotateCW: () => void;
  onClearFrame: () => void;
  onShift: (dx: number, dy: number) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  brushSize,
  onSelectBrushSize,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onFlipH,
  onFlipV,
  onRotateCW,
  onClearFrame,
  onShift,
}) => {
  const tools: { id: ToolType; label: string; shortcut: string; icon: string; desc: string }[] = [
    { id: 'pencil', label: 'Pencil', shortcut: 'P', icon: '✏️', desc: 'Draw single pixels' },
    { id: 'eraser', label: 'Eraser', shortcut: 'E', icon: '🧹', desc: 'Erase to transparent (Color 0)' },
    { id: 'fill', label: 'Flood Fill', shortcut: 'F', icon: '🪣', desc: 'Paint bucket fill connected area' },
    { id: 'line', label: 'Line', shortcut: 'L', icon: '📏', desc: 'Bresenham straight line' },
    { id: 'rect', label: 'Rect', shortcut: 'U', icon: '▢', desc: 'Hollow rectangle' },
    { id: 'rectFilled', label: 'Box Fill', shortcut: 'I', icon: '■', desc: 'Solid filled rectangle' },
    { id: 'circle', label: 'Circle', shortcut: 'C', icon: '○', desc: 'Hollow ellipse / circle' },
    { id: 'circleFilled', label: 'Disc Fill', shortcut: 'O', icon: '●', desc: 'Filled ellipse / circle' },
    { id: 'picker', label: 'Picker', shortcut: 'K', icon: '💧', desc: 'Pick color from canvas' },
    { id: 'select', label: 'Select', shortcut: 'S', icon: '⬚', desc: 'Rectangular marquee select & move' },
    { id: 'replace', label: 'Repl Col', shortcut: 'X', icon: '🔄', desc: 'Replace all occurrences of color' },
  ];

  const handleToolClick = (tool: ToolType) => {
    pcSpeaker.playStep();
    onSelectTool(tool);
  };

  return (
    <div className="w-48 bg-[#AAAAAA] text-black font-mono text-xs border-r-2 border-black flex flex-col p-1.5 gap-2 select-none shadow-[2px_0px_0px_#000000]">
      {/* Title box */}
      <div className="bg-[#0000AA] text-[#FFFF55] font-bold px-1.5 py-0.5 text-center border-t border-l border-[#5555FF] border-b-2 border-r-2 border-[#000055] shadow-inner">
        TOOLBOX
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 gap-1">
        {tools.map((t) => {
          const isActive = currentTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleToolClick(t.id)}
              title={`${t.label} (${t.shortcut}) - ${t.desc}`}
              className={`flex items-center gap-1 px-1.5 py-1 text-left font-bold transition-all text-[11px] ${
                isActive
                  ? 'bg-[#0000AA] text-[#FFFF55] border-2 border-black border-t-black border-l-black shadow-inner'
                  : 'bg-[#C0C0C0] text-black border-2 border-white border-r-black border-b-black hover:bg-[#D5D5D5] active:border-black'
              }`}
            >
              <span className="text-sm shrink-0">{t.icon}</span>
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Brush Size */}
      <div className="border-t border-[#555555] pt-1.5">
        <div className="text-[10px] text-[#222222] font-bold mb-1 flex justify-between">
          <span>BRUSH SIZE</span>
          <span>{brushSize}px</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((size) => (
            <button
              key={size}
              onClick={() => {
                pcSpeaker.playStep();
                onSelectBrushSize(size);
              }}
              className={`py-1 font-bold text-center border-2 ${
                brushSize === size
                  ? 'bg-[#0000AA] text-white border-black'
                  : 'bg-[#C0C0C0] text-black border-white border-r-black border-b-black hover:bg-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Transforms */}
      <div className="border-t border-[#555555] pt-1.5">
        <div className="text-[10px] text-[#222222] font-bold mb-1">TRANSFORM</div>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => {
              pcSpeaker.playStep();
              onFlipH();
            }}
            title="Flip Horizontal (H)"
            className="py-1 bg-[#C0C0C0] border-2 border-white border-r-black border-b-black hover:bg-white active:border-black font-bold text-center"
          >
            ↔ H
          </button>
          <button
            onClick={() => {
              pcSpeaker.playStep();
              onFlipV();
            }}
            title="Flip Vertical (V)"
            className="py-1 bg-[#C0C0C0] border-2 border-white border-r-black border-b-black hover:bg-white active:border-black font-bold text-center"
          >
            ↕ V
          </button>
          <button
            onClick={() => {
              pcSpeaker.playStep();
              onRotateCW();
            }}
            title="Rotate 90° Clockwise (R)"
            className="py-1 bg-[#C0C0C0] border-2 border-white border-r-black border-b-black hover:bg-white active:border-black font-bold text-center"
          >
            ↻ 90°
          </button>
        </div>

        {/* Shift arrows */}
        <div className="mt-1 flex justify-center">
          <div className="grid grid-cols-3 gap-1 w-24">
            <div></div>
            <button
              onClick={() => {
                pcSpeaker.playStep();
                onShift(0, -1);
              }}
              title="Shift Up"
              className="py-0.5 bg-[#C0C0C0] border border-white border-r-black border-b-black font-bold text-center hover:bg-white"
            >
              ▲
            </button>
            <div></div>
            <button
              onClick={() => {
                pcSpeaker.playStep();
                onShift(-1, 0);
              }}
              title="Shift Left"
              className="py-0.5 bg-[#C0C0C0] border border-white border-r-black border-b-black font-bold text-center hover:bg-white"
            >
              ◀
            </button>
            <div className="text-[9px] text-center flex items-center justify-center font-bold text-[#555555]">
              PAN
            </div>
            <button
              onClick={() => {
                pcSpeaker.playStep();
                onShift(1, 0);
              }}
              title="Shift Right"
              className="py-0.5 bg-[#C0C0C0] border border-white border-r-black border-b-black font-bold text-center hover:bg-white"
            >
              ▶
            </button>
            <div></div>
            <button
              onClick={() => {
                pcSpeaker.playStep();
                onShift(0, 1);
              }}
              title="Shift Down"
              className="py-0.5 bg-[#C0C0C0] border border-white border-r-black border-b-black font-bold text-center hover:bg-white"
            >
              ▼
            </button>
            <div></div>
          </div>
        </div>
      </div>

      {/* Undo / Redo & Clear */}
      <div className="border-t border-[#555555] pt-1.5 mt-auto flex flex-col gap-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            disabled={!canUndo}
            onClick={() => {
              pcSpeaker.playStep();
              onUndo();
            }}
            title="Undo (Ctrl+Z)"
            className={`py-1 font-bold border-2 ${
              canUndo
                ? 'bg-[#C0C0C0] border-white border-r-black border-b-black hover:bg-white'
                : 'bg-[#888888] text-[#555555] border-black cursor-not-allowed'
            }`}
          >
            ↶ Undo
          </button>
          <button
            disabled={!canRedo}
            onClick={() => {
              pcSpeaker.playStep();
              onRedo();
            }}
            title="Redo (Ctrl+Y)"
            className={`py-1 font-bold border-2 ${
              canRedo
                ? 'bg-[#C0C0C0] border-white border-r-black border-b-black hover:bg-white'
                : 'bg-[#888888] text-[#555555] border-black cursor-not-allowed'
            }`}
          >
            ↷ Redo
          </button>
        </div>

        <button
          onClick={() => {
            pcSpeaker.playBump();
            onClearFrame();
          }}
          title="Clear Current Frame"
          className="py-1 bg-[#AA0000] text-white font-bold border-2 border-[#FF5555] border-r-black border-b-black hover:bg-[#FF5555] active:border-black"
        >
          Clear Frame
        </button>
      </div>
    </div>
  );
};
