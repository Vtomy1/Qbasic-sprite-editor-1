import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpriteProject, ToolType, SpriteFrame } from './types/sprite';
import { PRESETS } from './constants/presets';
import { getColorByIndex } from './constants/palettes';
import { MenuBar } from './components/MenuBar';
import { Toolbar } from './components/Toolbar';
import { PalettePicker } from './components/PalettePicker';
import { Canvas } from './components/Canvas';
import { AnimationTimeline } from './components/AnimationTimeline';
import { DosSimulatorModal } from './components/DosSimulatorModal';
import { QBasicExporterModal } from './components/QBasicExporterModal';
import { ExportImageModal } from './components/ExportImageModal';
import { ImportImageModal } from './components/ImportImageModal';
import { HelpModal } from './components/HelpModal';
import { pcSpeaker } from './utils/sound';

export default function App() {
  // Initial project is classic Gorilla preset
  const [project, setProject] = useState<SpriteProject>(() => PRESETS[0]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [currentTool, setCurrentTool] = useState<ToolType>('pencil');
  const [primaryColor, setPrimaryColor] = useState<number>(6); // Brown for Gorilla
  const [secondaryColor, setSecondaryColor] = useState<number>(0);
  const [brushSize, setBrushSize] = useState<number>(1);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [onionSkin, setOnionSkin] = useState<boolean>(false);
  const [crtEffect, setCrtEffect] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(24);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Undo/Redo stacks per session
  const [undoStack, setUndoStack] = useState<number[][]>([]);
  const [redoStack, setRedoStack] = useState<number[][]>([]);

  // Modals
  const [showDosSimulator, setShowDosSimulator] = useState<boolean>(false);
  const [showExportBas, setShowExportBas] = useState<boolean>(false);
  const [showExportPng, setShowExportPng] = useState<boolean>(false);
  const [showImportImage, setShowImportImage] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Cursor coordinates & color readout
  const [cursorInfo, setCursorInfo] = useState<{ x: number; y: number; colorIndex: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFrame = project.frames[currentFrameIndex] || project.frames[0];
  const previousFrame =
    currentFrameIndex > 0 ? project.frames[currentFrameIndex - 1] : project.frames[project.frames.length - 1];

  // Sound sync
  useEffect(() => {
    pcSpeaker.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Handle pixel changes with history
  const handleUpdatePixels = useCallback(
    (newPixels: number[]) => {
      setUndoStack((prev) => [...prev.slice(-30), [...currentFrame.pixels]]);
      setRedoStack([]);

      setProject((prev) => {
        const nextFrames = prev.frames.map((f, idx) => {
          if (idx === currentFrameIndex) {
            return { ...f, pixels: newPixels };
          }
          return f;
        });
        return { ...prev, frames: nextFrames };
      });
    },
    [currentFrame, currentFrameIndex]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prevPixels = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, [...currentFrame.pixels]]);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));

    setProject((prev) => {
      const nextFrames = prev.frames.map((f, idx) => {
        if (idx === currentFrameIndex) {
          return { ...f, pixels: prevPixels };
        }
        return f;
      });
      return { ...prev, frames: nextFrames };
    });
  }, [undoStack, currentFrame, currentFrameIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextPixels = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, [...currentFrame.pixels]]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));

    setProject((prev) => {
      const nextFrames = prev.frames.map((f, idx) => {
        if (idx === currentFrameIndex) {
          return { ...f, pixels: nextPixels };
        }
        return f;
      });
      return { ...prev, frames: nextFrames };
    });
  }, [redoStack, currentFrame, currentFrameIndex]);

  // Clear Frame
  const handleClearFrame = useCallback(() => {
    const emptyPixels = new Array(project.width * project.height).fill(project.transparentColorIndex);
    handleUpdatePixels(emptyPixels);
  }, [project.width, project.height, project.transparentColorIndex, handleUpdatePixels]);

  // Invert Colors
  const handleInvertColors = useCallback(() => {
    const maxIdx = project.paletteMode === '16' ? 15 : 255;
    const inverted = currentFrame.pixels.map((c) =>
      c === project.transparentColorIndex ? c : maxIdx - c
    );
    handleUpdatePixels(inverted);
  }, [currentFrame.pixels, project.paletteMode, project.transparentColorIndex, handleUpdatePixels]);

  // Flip Horizontal
  const handleFlipH = useCallback(() => {
    const { width, height } = project;
    const next = new Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        next[y * width + (width - 1 - x)] = currentFrame.pixels[y * width + x];
      }
    }
    handleUpdatePixels(next);
  }, [project, currentFrame.pixels, handleUpdatePixels]);

  // Flip Vertical
  const handleFlipV = useCallback(() => {
    const { width, height } = project;
    const next = new Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        next[(height - 1 - y) * width + x] = currentFrame.pixels[y * width + x];
      }
    }
    handleUpdatePixels(next);
  }, [project, currentFrame.pixels, handleUpdatePixels]);

  // Rotate 90 CW
  const handleRotateCW = useCallback(() => {
    const { width, height } = project;
    if (width !== height) {
      // For square sprites
      return;
    }
    const next = new Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const newX = height - 1 - y;
        const newY = x;
        next[newY * width + newX] = currentFrame.pixels[y * width + x];
      }
    }
    handleUpdatePixels(next);
  }, [project, currentFrame.pixels, handleUpdatePixels]);

  // Shift pixels (Up/Down/Left/Right with wrap)
  const handleShift = useCallback(
    (dx: number, dy: number) => {
      const { width, height } = project;
      const next = new Array(width * height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const targetX = (x + dx + width) % width;
          const targetY = (y + dy + height) % height;
          next[targetY * width + targetX] = currentFrame.pixels[y * width + x];
        }
      }
      handleUpdatePixels(next);
    },
    [project, currentFrame.pixels, handleUpdatePixels]
  );

  // New Sprite Canvas
  const handleNewSprite = (w: number, h: number) => {
    pcSpeaker.playCoin();
    setUndoStack([]);
    setRedoStack([]);
    setProject({
      id: `sprite-${Date.now()}`,
      name: 'NEW_SPRITE',
      width: w,
      height: h,
      paletteMode: '16',
      transparentColorIndex: 0,
      fps: 6,
      frames: [
        {
          id: `frame-1`,
          name: 'Frame 1',
          pixels: new Array(w * h).fill(0),
        },
      ],
    });
    setCurrentFrameIndex(0);
    setZoom(w <= 16 ? 24 : w <= 24 ? 18 : 12);
  };

  // Preset loader
  const handleLoadPreset = (preset: SpriteProject) => {
    pcSpeaker.playCoin();
    setUndoStack([]);
    setRedoStack([]);
    setProject({ ...preset });
    setCurrentFrameIndex(0);
    setZoom(preset.width <= 16 ? 24 : 16);
  };

  // Save Project JSON
  const handleSaveProject = () => {
    pcSpeaker.playCoin();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${project.name.toLowerCase()}_project.json`);
    dlAnchorElem.click();
  };

  // Open Project JSON
  const handleOpenProject = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.frames && parsed.width && parsed.height) {
          pcSpeaker.playCoin();
          setProject(parsed);
          setCurrentFrameIndex(0);
          setUndoStack([]);
          setRedoStack([]);
        }
      } catch {
        alert('Invalid Sprite Project JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Frame operations
  const handleAddFrame = () => {
    const newFrame: SpriteFrame = {
      id: `frame-${Date.now()}`,
      name: `Frame ${project.frames.length + 1}`,
      pixels: new Array(project.width * project.height).fill(project.transparentColorIndex),
    };
    setProject((prev) => ({
      ...prev,
      frames: [...prev.frames, newFrame],
    }));
    setCurrentFrameIndex(project.frames.length);
  };

  const handleDuplicateFrame = () => {
    const newFrame: SpriteFrame = {
      id: `frame-${Date.now()}`,
      name: `${currentFrame.name} (Copy)`,
      pixels: [...currentFrame.pixels],
    };
    const nextFrames = [...project.frames];
    nextFrames.splice(currentFrameIndex + 1, 0, newFrame);
    setProject((prev) => ({
      ...prev,
      frames: nextFrames,
    }));
    setCurrentFrameIndex(currentFrameIndex + 1);
  };

  const handleDeleteFrame = (index: number) => {
    if (project.frames.length <= 1) return;
    const nextFrames = project.frames.filter((_, i) => i !== index);
    setProject((prev) => ({ ...prev, frames: nextFrames }));
    setCurrentFrameIndex((prev) => Math.min(prev, nextFrames.length - 1));
  };

  const handleMoveFrame = (from: number, to: number) => {
    if (to < 0 || to >= project.frames.length) return;
    const nextFrames = [...project.frames];
    const item = nextFrames.splice(from, 1)[0];
    nextFrames.splice(to, 0, item);
    setProject((prev) => ({ ...prev, frames: nextFrames }));
    setCurrentFrameIndex(to);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'F5') {
        e.preventDefault();
        setShowDosSimulator(true);
      } else if (e.key === 'F1') {
        e.preventDefault();
        setShowHelp(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'g') {
        setGridVisible((v) => !v);
      } else if (e.key.toLowerCase() === 'p') {
        setCurrentTool('pencil');
      } else if (e.key.toLowerCase() === 'e') {
        setCurrentTool('eraser');
      } else if (e.key.toLowerCase() === 'f') {
        setCurrentTool('fill');
      } else if (e.key.toLowerCase() === 'l') {
        setCurrentTool('line');
      } else if (e.key.toLowerCase() === 'u') {
        setCurrentTool('rect');
      } else if (e.key.toLowerCase() === 'i') {
        setCurrentTool('rectFilled');
      } else if (e.key.toLowerCase() === 'c') {
        setCurrentTool('circle');
      } else if (e.key.toLowerCase() === 'o') {
        setCurrentTool('circleFilled');
      } else if (e.key.toLowerCase() === 'k') {
        setCurrentTool('picker');
      } else if (e.key.toLowerCase() === 's') {
        setCurrentTool('select');
      } else if (e.key.toLowerCase() === 'x') {
        setCurrentTool('replace');
      } else if (e.key.toLowerCase() === 'h') {
        handleFlipH();
      } else if (e.key.toLowerCase() === 'v') {
        handleFlipV();
      } else if (e.key.toLowerCase() === 'r') {
        handleRotateCW();
      } else if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(48, z + 4));
      } else if (e.key === '-' || e.key === '_') {
        setZoom((z) => Math.max(6, z - 4));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleFlipH, handleFlipV, handleRotateCW]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#000088] text-white font-mono select-none">
      {/* Hidden file input for opening project */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleProjectFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Top Menu Bar */}
      <MenuBar
        onNew={handleNewSprite}
        onOpenProject={handleOpenProject}
        onSaveProject={handleSaveProject}
        onImportImage={() => setShowImportImage(true)}
        onExportPng={() => setShowExportPng(true)}
        onExportBas={() => setShowExportBas(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onClearFrame={handleClearFrame}
        onInvertColors={handleInvertColors}
        gridVisible={gridVisible}
        onToggleGrid={() => setGridVisible(!gridVisible)}
        onionSkin={onionSkin}
        onToggleOnionSkin={() => setOnionSkin(!onionSkin)}
        crtEffect={crtEffect}
        onToggleCrt={() => setCrtEffect(!crtEffect)}
        onZoomIn={() => setZoom((z) => Math.min(48, z + 4))}
        onZoomOut={() => setZoom((z) => Math.max(6, z - 4))}
        onResetZoom={() => setZoom(project.width <= 16 ? 24 : 16)}
        onFlipH={handleFlipH}
        onFlipV={handleFlipV}
        onRotateCW={handleRotateCW}
        onShift={handleShift}
        onLoadPreset={handleLoadPreset}
        onRunSimulator={() => setShowDosSimulator(true)}
        onShowHelp={() => setShowHelp(true)}
        paletteMode={project.paletteMode}
        onTogglePaletteMode={() =>
          setProject((prev) => ({
            ...prev,
            paletteMode: prev.paletteMode === '16' ? '256' : '16',
          }))
        }
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <Toolbar
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          brushSize={brushSize}
          onSelectBrushSize={setBrushSize}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onFlipH={handleFlipH}
          onFlipV={handleFlipV}
          onRotateCW={handleRotateCW}
          onClearFrame={handleClearFrame}
          onShift={handleShift}
        />

        {/* Center Drawing Canvas */}
        <Canvas
          width={project.width}
          height={project.height}
          currentFrame={currentFrame}
          previousFrame={previousFrame}
          paletteMode={project.paletteMode}
          transparentColorIndex={project.transparentColorIndex}
          currentTool={currentTool}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          brushSize={brushSize}
          gridVisible={gridVisible}
          onionSkin={onionSkin}
          crtEffect={crtEffect}
          zoom={zoom}
          onUpdatePixels={handleUpdatePixels}
          onPickColor={(col) => setPrimaryColor(col)}
          onCursorChange={setCursorInfo}
        />

        {/* Right Palette Picker */}
        <PalettePicker
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          onSelectPrimaryColor={setPrimaryColor}
          onSelectSecondaryColor={setSecondaryColor}
          paletteMode={project.paletteMode}
          onTogglePaletteMode={() =>
            setProject((prev) => ({
              ...prev,
              paletteMode: prev.paletteMode === '16' ? '256' : '16',
            }))
          }
          transparentColorIndex={project.transparentColorIndex}
          onSetTransparentColorIndex={(idx) =>
            setProject((prev) => ({ ...prev, transparentColorIndex: idx }))
          }
        />
      </div>

      {/* Bottom Animation Timeline */}
      <AnimationTimeline
        frames={project.frames}
        currentFrameIndex={currentFrameIndex}
        onSelectFrame={(idx) => {
          setCurrentFrameIndex(idx);
          setUndoStack([]);
          setRedoStack([]);
        }}
        onAddFrame={handleAddFrame}
        onDuplicateFrame={handleDuplicateFrame}
        onDeleteFrame={handleDeleteFrame}
        onMoveFrame={handleMoveFrame}
        fps={project.fps}
        onChangeFps={(newFps) => setProject((prev) => ({ ...prev, fps: newFps }))}
        width={project.width}
        height={project.height}
        paletteMode={project.paletteMode}
        transparentColorIndex={project.transparentColorIndex}
        onionSkin={onionSkin}
        onToggleOnionSkin={() => setOnionSkin(!onionSkin)}
      />

      {/* Authentic QBasic Status Line */}
      <div className="bg-[#AAAAAA] text-black font-mono text-[11px] px-2 py-0.5 border-t border-black flex items-center justify-between font-bold select-none">
        <div className="flex items-center gap-3">
          <span className="text-[#0000AA]">&lt;Shift+F5=Restart&gt;</span>
          <button
            onClick={() => setShowDosSimulator(true)}
            className="hover:bg-[#0000AA] hover:text-white px-1"
          >
            &lt;F5=Run BASIC Simulator&gt;
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="hover:bg-[#0000AA] hover:text-white px-1"
          >
            &lt;F1=Help&gt;
          </button>
        </div>

        <div className="flex items-center gap-3">
          {cursorInfo ? (
            <span>
              Cursor: ({cursorInfo.x}, {cursorInfo.y}) · Col #{cursorInfo.colorIndex} (
              {getColorByIndex(cursorInfo.colorIndex, project.paletteMode).name.split(':')[1]?.trim() || ''})
            </span>
          ) : (
            <span>Cursor: (-- , --)</span>
          )}

          <span>|</span>
          <span>
            Sprite: {project.name} ({project.width}x{project.height})
          </span>
          <span>|</span>
          <span>Zoom: {zoom}x</span>
          <span>|</span>
          <span className="text-[#AA0000]">
            Frame: {currentFrameIndex + 1}/{project.frames.length}
          </span>
        </div>
      </div>

      {/* Modals */}
      {showDosSimulator && (
        <DosSimulatorModal
          project={project}
          onClose={() => setShowDosSimulator(false)}
        />
      )}

      {showExportBas && (
        <QBasicExporterModal
          project={project}
          onClose={() => setShowExportBas(false)}
        />
      )}

      {showExportPng && (
        <ExportImageModal
          project={project}
          currentFrameIndex={currentFrameIndex}
          onClose={() => setShowExportPng(false)}
        />
      )}

      {showImportImage && (
        <ImportImageModal
          project={project}
          onImport={(pixels, asNewFrame) => {
            if (asNewFrame) {
              const newFrame: SpriteFrame = {
                id: `frame-${Date.now()}`,
                name: `Imported Frame`,
                pixels,
              };
              setProject((prev) => ({
                ...prev,
                frames: [...prev.frames, newFrame],
              }));
              setCurrentFrameIndex(project.frames.length);
            } else {
              handleUpdatePixels(pixels);
            }
          }}
          onClose={() => setShowImportImage(false)}
        />
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
