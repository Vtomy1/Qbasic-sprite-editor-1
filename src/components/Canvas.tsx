import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SpriteFrame, ToolType, SelectionRect } from '../types/sprite';
import { getColorByIndex } from '../constants/palettes';
import { pcSpeaker } from '../utils/sound';

interface CanvasProps {
  width: number;
  height: number;
  currentFrame: SpriteFrame;
  previousFrame?: SpriteFrame;
  paletteMode: '16' | '256';
  transparentColorIndex: number;
  currentTool: ToolType;
  primaryColor: number;
  secondaryColor: number;
  brushSize: number;
  gridVisible: boolean;
  onionSkin: boolean;
  crtEffect: boolean;
  zoom: number;
  onUpdatePixels: (newPixels: number[]) => void;
  onPickColor: (colorIndex: number) => void;
  onCursorChange: (coords: { x: number; y: number; colorIndex: number } | null) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  currentFrame,
  previousFrame,
  paletteMode,
  transparentColorIndex,
  currentTool,
  primaryColor,
  secondaryColor,
  brushSize,
  gridVisible,
  onionSkin,
  crtEffect,
  zoom,
  onUpdatePixels,
  onPickColor,
  onCursorChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [activeMouseButton, setActiveMouseButton] = useState<number>(0); // 0 = Left, 2 = Right
  const [selection, setSelection] = useState<SelectionRect | null>(null);

  // Bresenham's line algorithm
  const getLinePixels = (x0: number, y0: number, x1: number, y1: number) => {
    const points: { x: number; y: number }[] = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;

    while (true) {
      points.push({ x: cx, y: cy });
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
    return points;
  };

  // Rectangle points
  const getRectPixels = (x0: number, y0: number, x1: number, y1: number, filled: boolean) => {
    const points: { x: number; y: number }[] = [];
    const minX = Math.max(0, Math.min(x0, x1));
    const maxX = Math.min(width - 1, Math.max(x0, x1));
    const minY = Math.max(0, Math.min(y0, y1));
    const maxY = Math.min(height - 1, Math.max(y0, y1));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (filled || x === minX || x === maxX || y === minY || y === maxY) {
          points.push({ x, y });
        }
      }
    }
    return points;
  };

  // Midpoint ellipse/circle points
  const getCirclePixels = (x0: number, y0: number, x1: number, y1: number, filled: boolean) => {
    const points: { x: number; y: number }[] = [];
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    const rx = (maxX - minX) / 2;
    const ry = (maxY - minY) / 2;
    const cx = minX + rx;
    const cy = minY + ry;

    if (rx < 0.5 || ry < 0.5) {
      return getRectPixels(x0, y0, x1, y1, filled);
    }

    const boundMinX = Math.max(0, minX);
    const boundMaxX = Math.min(width - 1, maxX);
    const boundMinY = Math.max(0, minY);
    const boundMaxY = Math.min(height - 1, maxY);

    for (let y = boundMinY; y <= boundMaxY; y++) {
      for (let x = boundMinX; x <= boundMaxX; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        const distSq = dx * dx + dy * dy;

        if (filled) {
          if (distSq <= 1.05) {
            points.push({ x, y });
          }
        } else {
          // Hollow ring
          if (distSq <= 1.25 && distSq >= 0.6) {
            points.push({ x, y });
          }
        }
      }
    }
    return points;
  };

  // Flood fill algorithm
  const floodFill = (startX: number, startY: number, targetCol: number, fillCol: number) => {
    if (targetCol === fillCol) return;
    const pixels = [...currentFrame.pixels];
    const visited = new Uint8Array(width * height);
    const queue: [number, number][] = [[startX, startY]];

    while (queue.length > 0) {
      const [x, y] = queue.pop()!;
      const idx = y * width + x;

      if (visited[idx]) continue;
      visited[idx] = 1;

      if (pixels[idx] === targetCol) {
        pixels[idx] = fillCol;

        if (x > 0 && !visited[idx - 1] && pixels[idx - 1] === targetCol) queue.push([x - 1, y]);
        if (x < width - 1 && !visited[idx + 1] && pixels[idx + 1] === targetCol) queue.push([x + 1, y]);
        if (y > 0 && !visited[idx - width] && pixels[idx - width] === targetCol) queue.push([x, y - 1]);
        if (y < height - 1 && !visited[idx + width] && pixels[idx + width] === targetCol) queue.push([x, y + 1]);
      }
    }

    pcSpeaker.playCoin();
    onUpdatePixels(pixels);
  };

  // Color replacement across the entire frame
  const replaceAllColor = (targetCol: number, newCol: number) => {
    if (targetCol === newCol) return;
    const pixels = currentFrame.pixels.map((c) => (c === targetCol ? newCol : c));
    pcSpeaker.playCoin();
    onUpdatePixels(pixels);
  };

  // Stamp brush pixels
  const stampBrush = (
    basePixels: number[],
    cx: number,
    cy: number,
    color: number,
    size: number
  ): number[] => {
    const next = [...basePixels];
    const half = Math.floor(size / 2);
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const px = cx - half + dx;
        const py = cy - half + dy;
        if (px >= 0 && px < width && py >= 0 && py < height) {
          next[py * width + px] = color;
        }
      }
    }
    return next;
  };

  // Convert mouse event to pixel coords
  const getPixelCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const px = Math.floor(clientX / zoom);
      const py = Math.floor(clientY / zoom);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        return { x: px, y: py };
      }
      return null;
    },
    [zoom, width, height]
  );

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard for transparent pixels
    const checkSize = Math.max(4, Math.floor(zoom / 2));
    for (let y = 0; y < canvas.height; y += checkSize) {
      for (let x = 0; x < canvas.width; x += checkSize) {
        const isDark = ((x / checkSize) + (y / checkSize)) % 2 === 0;
        ctx.fillStyle = isDark ? '#1a1a2e' : '#16213e';
        ctx.fillRect(x, y, checkSize, checkSize);
      }
    }

    // Draw onion skin from previous frame if enabled
    if (onionSkin && previousFrame) {
      ctx.globalAlpha = 0.25;
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const colIdx = previousFrame.pixels[py * width + px];
          if (colIdx !== transparentColorIndex) {
            ctx.fillStyle = getColorByIndex(colIdx, paletteMode).hex;
            ctx.fillRect(px * zoom, py * zoom, zoom, zoom);
          }
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // Determine preview pixels for drag tools (Line, Rect, Circle)
    let previewOverlay: { [key: number]: number } = {};
    if (isMouseDown && dragStart && dragCurrent) {
      const activeColor = activeMouseButton === 2 ? secondaryColor : primaryColor;
      const drawCol = currentTool === 'eraser' ? transparentColorIndex : activeColor;

      if (currentTool === 'line') {
        const pts = getLinePixels(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y);
        pts.forEach((p) => {
          previewOverlay[p.y * width + p.x] = drawCol;
        });
      } else if (currentTool === 'rect') {
        const pts = getRectPixels(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, false);
        pts.forEach((p) => {
          previewOverlay[p.y * width + p.x] = drawCol;
        });
      } else if (currentTool === 'rectFilled') {
        const pts = getRectPixels(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, true);
        pts.forEach((p) => {
          previewOverlay[p.y * width + p.x] = drawCol;
        });
      } else if (currentTool === 'circle') {
        const pts = getCirclePixels(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, false);
        pts.forEach((p) => {
          previewOverlay[p.y * width + p.x] = drawCol;
        });
      } else if (currentTool === 'circleFilled') {
        const pts = getCirclePixels(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, true);
        pts.forEach((p) => {
          previewOverlay[p.y * width + p.x] = drawCol;
        });
      }
    }

    // Render current frame pixels
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const idx = py * width + px;
        const colIdx = previewOverlay[idx] !== undefined ? previewOverlay[idx] : currentFrame.pixels[idx];

        if (colIdx !== transparentColorIndex) {
          ctx.fillStyle = getColorByIndex(colIdx, paletteMode).hex;
          ctx.fillRect(px * zoom, py * zoom, zoom, zoom);
        }
      }
    }

    // Render Selection marquee if active
    if (selection) {
      ctx.strokeStyle = '#FFFF55';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        selection.x * zoom,
        selection.y * zoom,
        selection.w * zoom,
        selection.h * zoom
      );
      ctx.setLineDash([]);
    } else if (currentTool === 'select' && isMouseDown && dragStart && dragCurrent) {
      const minX = Math.min(dragStart.x, dragCurrent.x);
      const maxX = Math.max(dragStart.x, dragCurrent.x);
      const minY = Math.min(dragStart.y, dragCurrent.y);
      const maxY = Math.max(dragStart.y, dragCurrent.y);

      ctx.strokeStyle = '#55FFFF';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(
        minX * zoom,
        minY * zoom,
        (maxX - minX + 1) * zoom,
        (maxY - minY + 1) * zoom
      );
      ctx.setLineDash([]);
    }

    // Render pixel grid lines if enabled
    if (gridVisible && zoom >= 8) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * zoom + 0.5, 0);
        ctx.lineTo(x * zoom + 0.5, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * zoom + 0.5);
        ctx.lineTo(canvas.width, y * zoom + 0.5);
        ctx.stroke();
      }
    }

    // Outer border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, [
    width,
    height,
    currentFrame,
    previousFrame,
    paletteMode,
    transparentColorIndex,
    currentTool,
    primaryColor,
    secondaryColor,
    brushSize,
    gridVisible,
    onionSkin,
    zoom,
    isMouseDown,
    dragStart,
    dragCurrent,
    activeMouseButton,
    selection,
  ]);

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getPixelCoords(e);
    if (!coords) return;

    const btn = e.button; // 0 = Left, 2 = Right
    setActiveMouseButton(btn);
    setIsMouseDown(true);
    setDragStart(coords);
    setDragCurrent(coords);

    const activeColor = btn === 2 ? secondaryColor : primaryColor;

    if (currentTool === 'pencil') {
      const next = stampBrush(currentFrame.pixels, coords.x, coords.y, activeColor, brushSize);
      pcSpeaker.playDraw();
      onUpdatePixels(next);
    } else if (currentTool === 'eraser') {
      const next = stampBrush(currentFrame.pixels, coords.x, coords.y, transparentColorIndex, brushSize);
      pcSpeaker.playDraw();
      onUpdatePixels(next);
    } else if (currentTool === 'picker') {
      const idx = coords.y * width + coords.x;
      const col = currentFrame.pixels[idx];
      pcSpeaker.playCoin();
      onPickColor(col);
    } else if (currentTool === 'fill') {
      const idx = coords.y * width + coords.x;
      const targetCol = currentFrame.pixels[idx];
      floodFill(coords.x, coords.y, targetCol, activeColor);
    } else if (currentTool === 'replace') {
      const idx = coords.y * width + coords.x;
      const targetCol = currentFrame.pixels[idx];
      replaceAllColor(targetCol, activeColor);
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getPixelCoords(e);
    if (coords) {
      const idx = coords.y * width + coords.x;
      const col = currentFrame.pixels[idx];
      onCursorChange({ x: coords.x, y: coords.y, colorIndex: col });
    } else {
      onCursorChange(null);
    }

    if (!isMouseDown || !coords) return;

    setDragCurrent(coords);

    const activeColor = activeMouseButton === 2 ? secondaryColor : primaryColor;

    if (currentTool === 'pencil') {
      const next = stampBrush(currentFrame.pixels, coords.x, coords.y, activeColor, brushSize);
      onUpdatePixels(next);
    } else if (currentTool === 'eraser') {
      const next = stampBrush(currentFrame.pixels, coords.x, coords.y, transparentColorIndex, brushSize);
      onUpdatePixels(next);
    }
  };

  // Handle Mouse Up
  const handleMouseUp = () => {
    if (!isMouseDown) return;

    if (dragStart && dragCurrent) {
      const activeColor = activeMouseButton === 2 ? secondaryColor : primaryColor;
      const drawCol = currentTool === 'eraser' ? transparentColorIndex : activeColor;

      let pointsToCommit: { x: number; y: number }[] = [];

      if (currentTool === 'line') {
        pointsToCommit = getLinePixels(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y);
      } else if (currentTool === 'rect') {
        pointsToCommit = getRectPixels(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, false);
      } else if (currentTool === 'rectFilled') {
        pointsToCommit = getRectPixels(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, true);
      } else if (currentTool === 'circle') {
        pointsToCommit = getCirclePixels(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, false);
      } else if (currentTool === 'circleFilled') {
        pointsToCommit = getCirclePixels(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, true);
      } else if (currentTool === 'select') {
        const minX = Math.min(dragStart.x, dragCurrent.x);
        const maxX = Math.max(dragStart.x, dragCurrent.x);
        const minY = Math.min(dragStart.y, dragCurrent.y);
        const maxY = Math.max(dragStart.y, dragCurrent.y);
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;

        const selPixels: number[] = [];
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            selPixels.push(currentFrame.pixels[y * width + x]);
          }
        }
        setSelection({ x: minX, y: minY, w, h, pixels: selPixels });
        pcSpeaker.playStep();
      }

      if (pointsToCommit.length > 0) {
        let next = [...currentFrame.pixels];
        pointsToCommit.forEach((p) => {
          next = stampBrush(next, p.x, p.y, drawCol, brushSize);
        });
        pcSpeaker.playDraw();
        onUpdatePixels(next);
      }
    }

    setIsMouseDown(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  return (
    <div className="relative flex-1 bg-[#000088] flex items-center justify-center overflow-auto p-4 select-none">
      {/* Canvas container with retro shadow & optional CRT scanlines */}
      <div className="relative shadow-[0px_0px_20px_rgba(0,0,0,0.8)] border-4 border-[#AAAAAA]">
        <canvas
          ref={canvasRef}
          width={width * zoom}
          height={height * zoom}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            onCursorChange(null);
          }}
          onContextMenu={(e) => e.preventDefault()}
          className="cursor-crosshair block"
        />

        {/* Authentic CRT Scanline overlay if enabled */}
        {crtEffect && (
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 2px, transparent 2px, transparent 4px)',
            }}
          />
        )}
      </div>
    </div>
  );
};
