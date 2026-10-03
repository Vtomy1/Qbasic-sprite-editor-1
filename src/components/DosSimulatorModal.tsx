import React, { useEffect, useRef, useState } from 'react';
import { SpriteProject, PutMode } from '../types/sprite';
import { getColorByIndex } from '../constants/palettes';
import { pcSpeaker } from '../utils/sound';

interface DosSimulatorModalProps {
  project: SpriteProject;
  onClose: () => void;
}

type BgType = 'starfield' | 'dungeon' | 'platformer' | 'qbasic_blue' | 'black';

export const DosSimulatorModal: React.FC<DosSimulatorModalProps> = ({ project, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [posX, setPosX] = useState(160 - Math.floor(project.width / 2));
  const [posY, setPosY] = useState(100 - Math.floor(project.height / 2));
  const [putMode, setPutMode] = useState<PutMode>('PSET');
  const [bgType, setBgType] = useState<BgType>('starfield');
  const [curFrameIndex, setCurFrameIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [crtEffect, setCrtEffect] = useState(true);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const starsRef = useRef<{ x: number; y: number; speed: number; col: number }[]>([]);

  // Initialize stars for starfield
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.floor(Math.random() * 320),
        y: Math.floor(Math.random() * 200),
        speed: 0.5 + Math.random() * 1.5,
        col: Math.random() > 0.5 ? 15 : 7,
      });
    }
    starsRef.current = stars;
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'm' || e.key === 'M') {
        // Cycle put mode
        const modes: PutMode[] = ['PSET', 'XOR', 'OR', 'AND', 'PRESET'];
        setPutMode((prev) => {
          const next = modes[(modes.indexOf(prev) + 1) % modes.length];
          pcSpeaker.playStep();
          return next;
        });
      } else if (e.key === 'b' || e.key === 'B') {
        // Cycle bg
        const bgs: BgType[] = ['starfield', 'dungeon', 'platformer', 'qbasic_blue', 'black'];
        setBgType((prev) => {
          const next = bgs[(bgs.indexOf(prev) + 1) % bgs.length];
          pcSpeaker.playStep();
          return next;
        });
      } else if (e.key === ' ') {
        pcSpeaker.playLaser();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onClose]);

  // Main game update & render loop (60 FPS)
  useEffect(() => {
    let animTimer = 0;
    let animFrame = 0;
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // Offscreen buffer for background so XOR works properly
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 320;
    bgCanvas.height = 200;
    const bgCtx = bgCanvas.getContext('2d')!;
    bgCtx.imageSmoothingEnabled = false;

    const render = () => {
      // 1. Process movement
      let dx = 0;
      let dy = 0;
      const speed = 2;

      if (keysPressed.current['ArrowUp'] || keysPressed.current['w'] || keysPressed.current['W']) dy -= speed;
      if (keysPressed.current['ArrowDown'] || keysPressed.current['s'] || keysPressed.current['S']) dy += speed;
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['A']) dx -= speed;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['D']) dx += speed;

      const moving = dx !== 0 || dy !== 0;
      setIsMoving(moving);

      if (moving) {
        setPosX((x) => Math.max(0, Math.min(320 - project.width, x + dx)));
        setPosY((y) => Math.max(0, Math.min(200 - project.height, y + dy)));
      }

      // Update frame animation
      animTimer++;
      const frameInterval = Math.max(2, Math.floor(60 / (project.fps || 6)));
      if (animTimer >= frameInterval) {
        animTimer = 0;
        animFrame = (animFrame + 1) % project.frames.length;
        setCurFrameIndex(animFrame);
      }

      // 2. Draw Background on bgCanvas
      if (bgType === 'black') {
        bgCtx.fillStyle = '#000000';
        bgCtx.fillRect(0, 0, 320, 200);
      } else if (bgType === 'qbasic_blue') {
        bgCtx.fillStyle = '#0000AA';
        bgCtx.fillRect(0, 0, 320, 200);
      } else if (bgType === 'starfield') {
        bgCtx.fillStyle = '#000000';
        bgCtx.fillRect(0, 0, 320, 200);

        starsRef.current.forEach((star) => {
          star.x -= star.speed;
          if (star.x < 0) {
            star.x = 320;
            star.y = Math.random() * 200;
          }
          bgCtx.fillStyle = getColorByIndex(star.col, '16').hex;
          bgCtx.fillRect(Math.floor(star.x), Math.floor(star.y), 1, 1);
        });
      } else if (bgType === 'dungeon') {
        // Brick wall
        bgCtx.fillStyle = '#555555';
        bgCtx.fillRect(0, 0, 320, 200);
        // Mortar lines
        bgCtx.fillStyle = '#000000';
        for (let y = 0; y < 150; y += 16) {
          bgCtx.fillRect(0, y, 320, 1);
          const offset = (y / 16) % 2 === 0 ? 0 : 16;
          for (let x = offset; x < 320; x += 32) {
            bgCtx.fillRect(x, y, 1, 16);
          }
        }
        // Floor
        bgCtx.fillStyle = '#AA5500';
        bgCtx.fillRect(0, 150, 320, 50);
        bgCtx.fillStyle = '#000000';
        bgCtx.fillRect(0, 150, 320, 2);
      } else if (bgType === 'platformer') {
        // Sky
        bgCtx.fillStyle = '#55FFFF';
        bgCtx.fillRect(0, 0, 320, 140);
        // Clouds
        bgCtx.fillStyle = '#FFFFFF';
        bgCtx.fillRect(40, 25, 45, 12);
        bgCtx.fillRect(180, 45, 55, 14);
        // Grass & dirt
        bgCtx.fillStyle = '#55FF55';
        bgCtx.fillRect(0, 140, 320, 12);
        bgCtx.fillStyle = '#AA5500';
        bgCtx.fillRect(0, 152, 320, 48);
      }

      // Copy bg to main canvas
      ctx.drawImage(bgCanvas, 0, 0);

      // 3. Draw Sprite according to PUT mode
      const activeFrame = project.frames[animFrame];
      if (activeFrame) {
        // Create sprite image data or render pixel by pixel
        const imgData = ctx.getImageData(posX, posY, project.width, project.height);
        const data = imgData.data;

        for (let py = 0; py < project.height; py++) {
          for (let px = 0; px < project.width; px++) {
            const sprColIdx = activeFrame.pixels[py * project.width + px];
            const isTransparent = sprColIdx === project.transparentColorIndex;

            if (isTransparent && putMode !== 'PRESET') {
              continue;
            }

            const sprCol = getColorByIndex(sprColIdx, project.paletteMode);
            const offset = (py * project.width + px) * 4;

            if (putMode === 'PSET') {
              data[offset] = sprCol.r;
              data[offset + 1] = sprCol.g;
              data[offset + 2] = sprCol.b;
              data[offset + 3] = 255;
            } else if (putMode === 'PRESET') {
              // Inverse of pixel
              data[offset] = 255 - sprCol.r;
              data[offset + 1] = 255 - sprCol.g;
              data[offset + 2] = 255 - sprCol.b;
              data[offset + 3] = 255;
            } else if (putMode === 'XOR') {
              data[offset] ^= sprCol.r;
              data[offset + 1] ^= sprCol.g;
              data[offset + 2] ^= sprCol.b;
              data[offset + 3] = 255;
            } else if (putMode === 'OR') {
              data[offset] |= sprCol.r;
              data[offset + 1] |= sprCol.g;
              data[offset + 2] |= sprCol.b;
              data[offset + 3] = 255;
            } else if (putMode === 'AND') {
              data[offset] &= sprCol.r;
              data[offset + 1] &= sprCol.g;
              data[offset + 2] &= sprCol.b;
              data[offset + 3] = 255;
            }
          }
        }

        ctx.putImageData(imgData, posX, posY);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [posX, posY, putMode, bgType, project]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-3 select-none">
      <div className="bg-[#000088] border-4 border-[#AAAAAA] shadow-[0px_0px_30px_#000000] p-3 max-w-4xl w-full flex flex-col font-mono text-white text-xs">
        {/* Top Header */}
        <div className="bg-[#AAAAAA] text-black font-bold px-3 py-1 flex justify-between items-center mb-2 border border-black">
          <div className="flex items-center gap-2">
            <span className="bg-[#0000AA] text-[#FFFF55] px-1.5 py-0.5">MS-DOS</span>
            <span>QBasic Runtime Simulator (SCREEN 13 - 320x200)</span>
          </div>
          <button
            onClick={onClose}
            className="bg-[#AA0000] text-white px-2 py-0.5 font-bold hover:bg-[#FF5555] border border-black"
          >
            [ESC] Exit
          </button>
        </div>

        {/* 320x200 CRT Screen Viewport */}
        <div className="relative mx-auto my-2 border-4 border-black bg-black rounded shadow-[0_0_20px_rgba(0,170,255,0.25)] flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={320}
            height={200}
            style={{ width: '640px', height: '400px' }}
            className="block aspect-[4/3] max-w-full"
          />

          {/* CRT Scanline & Phosphor Overlay */}
          {crtEffect && (
            <div
              className="absolute inset-0 pointer-events-none opacity-45 mix-blend-overlay"
              style={{
                background:
                  'radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.6) 100%), repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 2px, transparent 2px, transparent 4px)',
              }}
            />
          )}

          {/* On-screen QBasic coordinates readout */}
          <div className="absolute top-2 left-2 bg-black/80 text-[#55FF55] px-2 py-0.5 text-[11px] font-mono border border-[#00AA00] pointer-events-none">
            PUT ({posX}, {posY}), {project.name}%, {putMode} | Frame {curFrameIndex + 1}/{project.frames.length}
          </div>
        </div>

        {/* Simulator Control Dashboard */}
        <div className="bg-[#AAAAAA] text-black p-2 border-2 border-white border-r-black border-b-black mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          {/* Controls info */}
          <div className="flex items-center gap-4">
            <div>
              <span className="font-bold text-[#0000AA]">MOVE:</span> Arrow Keys / WASD
            </div>
            <div>
              <span className="font-bold text-[#0000AA]">SOUND:</span> Space Bar
            </div>
            <div>
              <span className="font-bold text-[#0000AA]">STATUS:</span> {isMoving ? 'Running' : 'Idle'}
            </div>
          </div>

          {/* Mode selectors */}
          <div className="flex items-center gap-2">
            {/* PUT Mode */}
            <div className="flex items-center gap-1">
              <span className="font-bold">PUT Mode:</span>
              {(['PSET', 'XOR', 'OR', 'AND', 'PRESET'] as PutMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    pcSpeaker.playStep();
                    setPutMode(mode);
                  }}
                  className={`px-1.5 py-0.5 border font-bold ${
                    putMode === mode
                      ? 'bg-[#0000AA] text-white border-black'
                      : 'bg-[#C0C0C0] text-black border-white hover:bg-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Background */}
            <div className="flex items-center gap-1 ml-2">
              <span className="font-bold">BG:</span>
              <select
                value={bgType}
                onChange={(e) => {
                  pcSpeaker.playStep();
                  setBgType(e.target.value as BgType);
                }}
                className="bg-white border border-black font-bold px-1 py-0.5 text-[11px]"
              >
                <option value="starfield">Starfield (Shmup)</option>
                <option value="dungeon">Dungeon Bricks</option>
                <option value="platformer">Sky & Grass</option>
                <option value="qbasic_blue">QBasic Blue</option>
                <option value="black">Pure Black</option>
              </select>
            </div>

            {/* CRT Toggle */}
            <button
              onClick={() => setCrtEffect(!crtEffect)}
              className={`px-2 py-0.5 border font-bold ${
                crtEffect ? 'bg-[#00AA00] text-black border-black' : 'bg-[#C0C0C0] text-black border-white'
              }`}
            >
              CRT: {crtEffect ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Footer command prompt reminder */}
        <div className="mt-2 text-center text-[#FFFF55] text-[11px]">
          Press <span className="bg-[#AAAAAA] text-black px-1 font-bold">ESC</span> to return to editor | <span className="bg-[#AAAAAA] text-black px-1 font-bold">M</span> to cycle Put Mode | <span className="bg-[#AAAAAA] text-black px-1 font-bold">B</span> to cycle Background
        </div>
      </div>
    </div>
  );
};
