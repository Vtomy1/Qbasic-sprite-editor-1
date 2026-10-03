import React, { useState, useEffect, useRef } from 'react';
import { PRESETS } from '../constants/presets';
import { SpriteProject } from '../types/sprite';
import { pcSpeaker } from '../utils/sound';

interface MenuBarProps {
  onNew: (width: number, height: number) => void;
  onOpenProject: () => void;
  onSaveProject: () => void;
  onImportImage: () => void;
  onExportPng: () => void;
  onExportBas: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearFrame: () => void;
  onInvertColors: () => void;
  gridVisible: boolean;
  onToggleGrid: () => void;
  onionSkin: boolean;
  onToggleOnionSkin: () => void;
  crtEffect: boolean;
  onToggleCrt: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onRotateCW: () => void;
  onShift: (dx: number, dy: number) => void;
  onLoadPreset: (preset: SpriteProject) => void;
  onRunSimulator: () => void;
  onShowHelp: () => void;
  paletteMode: '16' | '256';
  onTogglePaletteMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onNew,
  onOpenProject,
  onSaveProject,
  onImportImage,
  onExportPng,
  onExportBas,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearFrame,
  onInvertColors,
  gridVisible,
  onToggleGrid,
  onionSkin,
  onToggleOnionSkin,
  crtEffect,
  onToggleCrt,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFlipH,
  onFlipV,
  onRotateCW,
  onShift,
  onLoadPreset,
  onRunSimulator,
  onShowHelp,
  paletteMode,
  onTogglePaletteMode,
  soundEnabled,
  onToggleSound,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menu: string) => {
    pcSpeaker.playStep();
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleAction = (fn: () => void) => {
    pcSpeaker.playStep();
    setOpenMenu(null);
    fn();
  };

  return (
    <div ref={menuRef} className="relative z-50 bg-[#AAAAAA] text-black font-mono text-sm border-b-2 border-black flex items-center select-none px-2 shadow-md">
      {/* Brand tag / title */}
      <div className="font-bold px-2 py-0.5 mr-2 bg-[#0000AA] text-white tracking-wider flex items-center gap-1.5 shadow-inner">
        <span className="text-[#FFFF55] font-extrabold">QB</span> SPRITE.BAS
      </div>

      {/* Menus */}
      <div className="flex items-center gap-0.5">
        {/* FILE */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('file')}
            className={`px-3 py-1 font-bold tracking-wide transition-colors ${
              openMenu === 'file' ? 'bg-[#000000] text-[#FFFFFF]' : 'hover:bg-[#0000AA] hover:text-[#FFFFFF]'
            }`}
          >
            <span className="underline">F</span>ile
          </button>
          {openMenu === 'file' && (
            <div className="absolute top-full left-0 w-64 bg-[#AAAAAA] border-2 border-white border-r-black border-b-black shadow-[4px_4px_0px_#000000] py-1 text-black z-50">
              <div className="px-2 py-0.5 text-xs text-[#555555] font-bold">NEW CANVAS SIZE</div>
              <button onClick={() => handleAction(() => onNew(8, 8))} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>New 8 x 8</span>
                <span className="text-xs opacity-75">Micro</span>
              </button>
              <button onClick={() => handleAction(() => onNew(16, 16))} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>New 16 x 16 (Standard)</span>
                <span className="text-xs opacity-75">Default</span>
              </button>
              <button onClick={() => handleAction(() => onNew(24, 24))} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>New 24 x 24</span>
              </button>
              <button onClick={() => handleAction(() => onNew(32, 32))} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>New 32 x 32 (Large)</span>
              </button>
              <button onClick={() => handleAction(() => onNew(48, 48))} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>New 48 x 48 (Boss)</span>
              </button>
              <div className="border-t border-[#555555] my-1"></div>
              <button onClick={() => handleAction(onOpenProject)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Open Project JSON...</span>
                <span className="text-xs">.JSON</span>
              </button>
              <button onClick={() => handleAction(onSaveProject)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Save Project JSON</span>
                <span className="text-xs">.JSON</span>
              </button>
              <button onClick={() => handleAction(onImportImage)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Import Image...</span>
                <span className="text-xs">PNG/BMP</span>
              </button>
              <div className="border-t border-[#555555] my-1"></div>
              <button onClick={() => handleAction(onExportPng)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Export PNG Sprite Sheet...</span>
                <span className="text-xs">.PNG</span>
              </button>
              <button onClick={() => handleAction(onExportBas)} className="w-full text-left px-3 py-1 font-bold text-[#0000AA] hover:bg-[#0000AA] hover:text-[#FFFF55] flex justify-between">
                <span>Export QBasic .BAS Code</span>
                <span className="text-xs text-[#AA0000] hover:text-white font-bold">.BAS</span>
              </button>
            </div>
          )}
        </div>

        {/* EDIT */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('edit')}
            className={`px-3 py-1 font-bold tracking-wide transition-colors ${
              openMenu === 'edit' ? 'bg-[#000000] text-[#FFFFFF]' : 'hover:bg-[#0000AA] hover:text-[#FFFFFF]'
            }`}
          >
            <span className="underline">E</span>dit
          </button>
          {openMenu === 'edit' && (
            <div className="absolute top-full left-0 w-60 bg-[#AAAAAA] border-2 border-white border-r-black border-b-black shadow-[4px_4px_0px_#000000] py-1 text-black z-50">
              <button
                disabled={!canUndo}
                onClick={() => handleAction(onUndo)}
                className={`w-full text-left px-3 py-1 flex justify-between ${
                  canUndo ? 'hover:bg-[#0000AA] hover:text-white' : 'text-[#555555] cursor-not-allowed'
                }`}
              >
                <span>Undo</span>
                <span className="text-xs">Ctrl+Z</span>
              </button>
              <button
                disabled={!canRedo}
                onClick={() => handleAction(onRedo)}
                className={`w-full text-left px-3 py-1 flex justify-between ${
                  canRedo ? 'hover:bg-[#0000AA] hover:text-white' : 'text-[#555555] cursor-not-allowed'
                }`}
              >
                <span>Redo</span>
                <span className="text-xs">Ctrl+Y</span>
              </button>
              <div className="border-t border-[#555555] my-1"></div>
              <button onClick={() => handleAction(onClearFrame)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Clear Current Frame</span>
                <span className="text-xs">Del</span>
              </button>
              <button onClick={() => handleAction(onInvertColors)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Invert Frame Colors</span>
                <span className="text-xs">Inv</span>
              </button>
            </div>
          )}
        </div>

        {/* VIEW */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('view')}
            className={`px-3 py-1 font-bold tracking-wide transition-colors ${
              openMenu === 'view' ? 'bg-[#000000] text-[#FFFFFF]' : 'hover:bg-[#0000AA] hover:text-[#FFFFFF]'
            }`}
          >
            <span className="underline">V</span>iew
          </button>
          {openMenu === 'view' && (
            <div className="absolute top-full left-0 w-64 bg-[#AAAAAA] border-2 border-white border-r-black border-b-black shadow-[4px_4px_0px_#000000] py-1 text-black z-50">
              <button onClick={() => handleAction(onToggleGrid)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>{gridVisible ? '✓' : ' '} Pixel Grid</span>
                <span className="text-xs">G</span>
              </button>
              <button onClick={() => handleAction(onToggleOnionSkin)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>{onionSkin ? '✓' : ' '} Onion Skinning</span>
                <span className="text-xs">O</span>
              </button>
              <button onClick={() => handleAction(onToggleCrt)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>{crtEffect ? '✓' : ' '} CRT Scanlines Glow</span>
                <span className="text-xs">CRT</span>
              </button>
              <div className="border-t border-[#555555] my-1"></div>
              <button onClick={() => handleAction(onZoomIn)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Zoom In</span>
                <span className="text-xs">+</span>
              </button>
              <button onClick={() => handleAction(onZoomOut)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Zoom Out</span>
                <span className="text-xs">-</span>
              </button>
              <button onClick={() => handleAction(onResetZoom)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Reset View</span>
                <span className="text-xs">1:1</span>
              </button>
            </div>
          )}
        </div>

        {/* TRANSFORM */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('transform')}
            className={`px-3 py-1 font-bold tracking-wide transition-colors ${
              openMenu === 'transform' ? 'bg-[#000000] text-[#FFFFFF]' : 'hover:bg-[#0000AA] hover:text-[#FFFFFF]'
            }`}
          >
            <span className="underline">T</span>ransform
          </button>
          {openMenu === 'transform' && (
            <div className="absolute top-full left-0 w-60 bg-[#AAAAAA] border-2 border-white border-r-black border-b-black shadow-[4px_4px_0px_#000000] py-1 text-black z-50">
              <button onClick={() => handleAction(onFlipH)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Flip Horizontal</span>
                <span className="text-xs">H</span>
              </button>
              <button onClick={() => handleAction(onFlipV)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Flip Vertical</span>
                <span className="text-xs">V</span>
              </button>
              <button onClick={() => handleAction(onRotateCW)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Rotate 90° Clockwise</span>
                <span className="text-xs">R</span>
              </button>
              <div className="border-t border-[#555555] my-1"></div>
              <button onClick={() => handleAction(() => onShift(0, -1))} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Shift Up</span>
                <span className="text-xs">↑</span>
              </button>
              <button onClick={() => handleAction(() => onShift(0, 1))} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Shift Down</span>
                <span className="text-xs">↓</span>
              </button>
              <button onClick={() => handleAction(() => onShift(-1, 0))} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Shift Left</span>
                <span className="text-xs">←</span>
              </button>
              <button onClick={() => handleAction(() => onShift(1, 0))} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Shift Right</span>
                <span className="text-xs">→</span>
              </button>
            </div>
          )}
        </div>

        {/* PRESETS */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('presets')}
            className={`px-3 py-1 font-bold tracking-wide transition-colors ${
              openMenu === 'presets' ? 'bg-[#000000] text-[#FFFFFF]' : 'hover:bg-[#0000AA] hover:text-[#FFFFFF]'
            }`}
          >
            <span className="underline">P</span>resets
          </button>
          {openMenu === 'presets' && (
            <div className="absolute top-full left-0 w-64 bg-[#AAAAAA] border-2 border-white border-r-black border-b-black shadow-[4px_4px_0px_#000000] py-1 text-black z-50">
              <div className="px-3 py-0.5 text-xs text-[#555555] font-bold">CLASSIC MS-DOS EXAMPLES</div>
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleAction(() => onLoadPreset(preset))}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#0000AA] hover:text-white flex justify-between items-center"
                >
                  <span className="font-bold">{preset.name}</span>
                  <span className="text-xs bg-white text-black px-1 border border-black">
                    {preset.frames.length} frames
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RUN (DOS SIMULATOR) */}
        <div className="relative">
          <button
            onClick={() => handleAction(onRunSimulator)}
            className="px-3 py-1 font-bold tracking-wide bg-[#00AA00] text-black hover:bg-[#55FF55] hover:text-black border border-black transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>▶</span> <span className="underline">R</span>un (F5)
          </button>
        </div>

        {/* OPTIONS */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('options')}
            className={`px-3 py-1 font-bold tracking-wide transition-colors ${
              openMenu === 'options' ? 'bg-[#000000] text-[#FFFFFF]' : 'hover:bg-[#0000AA] hover:text-[#FFFFFF]'
            }`}
          >
            <span className="underline">O</span>ptions
          </button>
          {openMenu === 'options' && (
            <div className="absolute top-full left-0 w-64 bg-[#AAAAAA] border-2 border-white border-r-black border-b-black shadow-[4px_4px_0px_#000000] py-1 text-black z-50">
              <button onClick={() => handleAction(onTogglePaletteMode)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>Palette: {paletteMode === '16' ? '16-Color (EGA/VGA)' : '256-Color (SCREEN 13)'}</span>
                <span className="text-xs">Switch</span>
              </button>
              <button onClick={() => handleAction(onToggleSound)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>PC Speaker Sound: {soundEnabled ? 'ON [8253 Synth]' : 'OFF'}</span>
                <span className="text-xs">Mute</span>
              </button>
            </div>
          )}
        </div>

        {/* HELP */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('help')}
            className={`px-3 py-1 font-bold tracking-wide transition-colors ${
              openMenu === 'help' ? 'bg-[#000000] text-[#FFFFFF]' : 'hover:bg-[#0000AA] hover:text-[#FFFFFF]'
            }`}
          >
            <span className="underline">H</span>elp
          </button>
          {openMenu === 'help' && (
            <div className="absolute top-full left-0 w-64 bg-[#AAAAAA] border-2 border-white border-r-black border-b-black shadow-[4px_4px_0px_#000000] py-1 text-black z-50">
              <button onClick={() => handleAction(onShowHelp)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>QBasic Sprite Guide</span>
                <span className="text-xs">F1</span>
              </button>
              <button onClick={() => handleAction(onShowHelp)} className="w-full text-left px-3 py-1 hover:bg-[#0000AA] hover:text-white flex justify-between">
                <span>PUT/GET Sizing Formulas</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side quick indicators */}
      <div className="ml-auto flex items-center gap-3 text-xs pr-2">
        <span className="text-[#0000AA] font-bold">
          SCREEN {paletteMode === '16' ? '7/12 (16c)' : '13 (256c)'}
        </span>
        <button
          onClick={onToggleSound}
          title="Toggle PC Speaker Sound"
          className="px-1.5 py-0.5 bg-[#FFFFFF] border border-black hover:bg-[#FFFF55] text-black font-bold"
        >
          {soundEnabled ? '🔊 BEEP' : '🔇 MUTE'}
        </button>
      </div>
    </div>
  );
};
