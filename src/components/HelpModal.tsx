import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#AAAAAA] border-4 border-white border-r-black border-b-black shadow-[8px_8px_0px_#000000] p-4 max-w-3xl w-full flex flex-col font-mono text-black text-xs max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0000AA] text-white font-bold px-3 py-1 flex justify-between items-center mb-3">
          <span className="text-[#FFFF55]">MS-DOS QUICKBASIC / QBASIC SPRITE MANUAL</span>
          <button onClick={onClose} className="bg-[#AA0000] text-white px-2 py-0.5 hover:bg-[#FF5555]">
            ✕
          </button>
        </div>

        {/* Content Tabs / Scrollable Guide */}
        <div className="flex-1 overflow-y-auto bg-black text-[#55FF55] p-3 border-2 border-white select-text space-y-4">
          {/* Section 1 */}
          <div>
            <h3 className="text-[#FFFF55] font-bold text-sm border-b border-[#00AA00] pb-1 mb-1">
              1. QBasic Graphics: SCREEN 13 vs SCREEN 7
            </h3>
            <p className="text-gray-300 leading-relaxed text-[11px]">
              <span className="text-white font-bold">SCREEN 13</span> is the legendary 320x200 256-color VGA mode used in DOS classics like DOOM, Wolfenstein 3D, and QuickBASIC arcade games. Each pixel occupies 1 byte (8 bits), with colors 0-255 mapped to the VGA DAC palette.
            </p>
            <p className="text-gray-300 leading-relaxed text-[11px] mt-1">
              <span className="text-white font-bold">SCREEN 7</span> is 320x200 with 16 EGA colors (4 bits per pixel planar).
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-[#FFFF55] font-bold text-sm border-b border-[#00AA00] pb-1 mb-1">
              2. Sizing Arrays for GET and PUT
            </h3>
            <p className="text-gray-300 leading-relaxed text-[11px]">
              In QBasic, sprite graphics are stored in integer arrays (<span className="text-[#55FFFF]">DIM Sprite%(size)</span>).
              Before using <span className="text-white font-bold">GET</span> and <span className="text-white font-bold">PUT</span>, you must dimension the array properly:
            </p>
            <div className="bg-[#111111] p-2 border border-[#555555] my-1 text-white font-mono text-[10px]">
              Bytes Needed = 4 + INT(((x2 - x1 + 1) * 8 + 7) / 8) * (y2 - y1 + 1)<br />
              Integer Array Elements = (Bytes Needed + 1) \ 2<br />
              Example (16x16 sprite): 4 + (16 * 16) = 260 bytes = 130 integers -&gt; <span className="text-[#FFFF55]">DIM Sprite%(130)</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-[11px]">
              The first 4 bytes (2 integers) hold the sprite header: <span className="text-white">Sprite%(0) = Width * 8</span> (width in bits) and <span className="text-white">Sprite%(1) = Height</span> in scanlines.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-[#FFFF55] font-bold text-sm border-b border-[#00AA00] pb-1 mb-1">
              3. PUT Action Modes
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 text-[11px]">
              <li><span className="text-[#55FFFF] font-bold">PSET</span>: Directly overwrites existing pixels with the sprite pixels. Transparent color 0 draws black box unless masked.</li>
              <li><span className="text-[#55FFFF] font-bold">PRESET</span>: Overwrites existing pixels with the inverted (color 255 - pixel) sprite pixels.</li>
              <li><span className="text-[#55FFFF] font-bold">XOR</span>: Bitwise XOR operation. Drawing the sprite once displays it; drawing it at the exact same location a second time erases it and completely restores the original background without redrawing!</li>
              <li><span className="text-[#55FFFF] font-bold">AND</span>: Used for transparency masks (creates a "hole" in background before ORing sprite).</li>
              <li><span className="text-[#55FFFF] font-bold">OR</span>: Merges sprite pixels with background.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h3 className="text-[#FFFF55] font-bold text-sm border-b border-[#00AA00] pb-1 mb-1">
              4. Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-200">
              <div><span className="text-[#FFFF55] font-bold">F5</span>: Run in MS-DOS Simulator</div>
              <div><span className="text-[#FFFF55] font-bold">Ctrl+Z / Ctrl+Y</span>: Undo / Redo</div>
              <div><span className="text-[#FFFF55] font-bold">P</span>: Pencil Tool</div>
              <div><span className="text-[#FFFF55] font-bold">E</span>: Eraser (Color 0)</div>
              <div><span className="text-[#FFFF55] font-bold">F</span>: Flood Fill Bucket</div>
              <div><span className="text-[#FFFF55] font-bold">L</span>: Straight Line Tool</div>
              <div><span className="text-[#FFFF55] font-bold">U / I</span>: Hollow / Filled Rect</div>
              <div><span className="text-[#FFFF55] font-bold">C / O</span>: Hollow / Filled Circle</div>
              <div><span className="text-[#FFFF55] font-bold">K</span>: Color Eyedropper</div>
              <div><span className="text-[#FFFF55] font-bold">S</span>: Selection Marquee</div>
              <div><span className="text-[#FFFF55] font-bold">X</span>: Color Replace Tool</div>
              <div><span className="text-[#FFFF55] font-bold">G</span>: Toggle Pixel Grid Overlay</div>
              <div><span className="text-[#FFFF55] font-bold">H / V</span>: Flip Horizontal / Vertical</div>
              <div><span className="text-[#FFFF55] font-bold">R</span>: Rotate 90° Clockwise</div>
              <div><span className="text-[#FFFF55] font-bold">Arrow Keys</span>: Shift Pixels (Pan)</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex justify-between items-center">
          <span className="text-[10px] text-[#222222]">
            Compatible with QuickBASIC 4.5, QBasic 1.1, DOSBox-X, and QB64-PE.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0000AA] text-white font-bold border-2 border-white border-r-black border-b-black hover:bg-[#5555FF]"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
