import React, { useState, useMemo } from 'react';
import { SpriteProject, PutMode } from '../types/sprite';
import { generateQBasicCode, QBasicExportOptions } from '../utils/qbasicGenerator';
import { pcSpeaker } from '../utils/sound';

interface QBasicExporterModalProps {
  project: SpriteProject;
  onClose: () => void;
}

export const QBasicExporterModal: React.FC<QBasicExporterModalProps> = ({ project, onClose }) => {
  const [exportType, setExportType] = useState<'game_put' | 'sub_data' | 'array_data'>('game_put');
  const [screenMode, setScreenMode] = useState<'13' | '7' | '12'>('13');
  const [putMode, setPutMode] = useState<PutMode>('PSET');
  const [varName, setVarName] = useState(project.name || 'SPRITE');
  const [generateStarsBg, setGenerateStarsBg] = useState(true);
  const [copied, setCopied] = useState(false);

  const exportOptions: QBasicExportOptions = useMemo(
    () => ({
      exportType,
      screenMode,
      putMode,
      varName,
      generateStarsBg,
    }),
    [exportType, screenMode, putMode, varName, generateStarsBg]
  );

  const generatedCode = useMemo(() => {
    return generateQBasicCode(project, exportOptions);
  }, [project, exportOptions]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    pcSpeaker.playCoin();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    pcSpeaker.playCoin();
    const cleanFileName = (varName.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'sprite') + '.bas';
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#AAAAAA] border-4 border-white border-r-black border-b-black shadow-[8px_8px_0px_#000000] p-4 max-w-4xl w-full flex flex-col font-mono text-black text-xs max-h-[92vh]">
        {/* Title bar */}
        <div className="bg-[#0000AA] text-white font-bold px-3 py-1 flex justify-between items-center mb-3 border-t border-l border-[#5555FF] border-b border-r border-[#000055]">
          <div className="flex items-center gap-2">
            <span className="text-[#FFFF55]">QUICKBASIC 4.5 / QBASIC 1.1</span>
            <span>- Code Generator (.BAS)</span>
          </div>
          <button
            onClick={onClose}
            className="bg-[#AA0000] text-white px-2 py-0.5 hover:bg-[#FF5555] border border-white"
          >
            ✕
          </button>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 bg-[#C0C0C0] p-2.5 border-2 border-white border-r-black border-b-black">
          {/* Format */}
          <div>
            <label className="block text-[10px] font-bold text-[#333333] mb-1">EXPORT FORMAT</label>
            <select
              value={exportType}
              onChange={(e) => {
                pcSpeaker.playStep();
                setExportType(e.target.value as 'game_put' | 'sub_data' | 'array_data');
              }}
              className="w-full bg-white border border-black font-bold p-1"
            >
              <option value="game_put">Playable Game (PUT/GET)</option>
              <option value="sub_data">SUB Routine (Draw DATA)</option>
              <option value="array_data">Raw DATA Statements</option>
            </select>
          </div>

          {/* Screen Mode */}
          <div>
            <label className="block text-[10px] font-bold text-[#333333] mb-1">SCREEN MODE</label>
            <select
              value={screenMode}
              onChange={(e) => {
                pcSpeaker.playStep();
                setScreenMode(e.target.value as '13' | '7' | '12');
              }}
              className="w-full bg-white border border-black font-bold p-1"
            >
              <option value="13">SCREEN 13 (320x200 256c)</option>
              <option value="7">SCREEN 7 (320x200 16c)</option>
              <option value="12">SCREEN 12 (640x480 16c)</option>
            </select>
          </div>

          {/* PUT Mode */}
          <div>
            <label className="block text-[10px] font-bold text-[#333333] mb-1">PUT ACTION</label>
            <select
              value={putMode}
              onChange={(e) => {
                pcSpeaker.playStep();
                setPutMode(e.target.value as PutMode);
              }}
              className="w-full bg-white border border-black font-bold p-1"
            >
              <option value="PSET">PSET (Overwrite)</option>
              <option value="XOR">XOR (Rubberband)</option>
              <option value="AND">AND (Mask)</option>
              <option value="OR">OR (Merge)</option>
              <option value="PRESET">PRESET (Invert)</option>
            </select>
          </div>

          {/* Variable Name */}
          <div>
            <label className="block text-[10px] font-bold text-[#333333] mb-1">SPRITE ARRAY NAME</label>
            <input
              type="text"
              maxLength={12}
              value={varName}
              onChange={(e) => setVarName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              className="w-full bg-white border border-black font-bold p-1"
              placeholder="SPRITE"
            />
          </div>
        </div>

        {/* Code Preview Viewport */}
        <div className="relative flex-1 bg-black border-2 border-white p-2 overflow-auto font-mono text-[11px] leading-relaxed text-[#55FF55] select-text">
          <pre className="whitespace-pre font-mono select-text">{generatedCode}</pre>
        </div>

        {/* Actions Bottom Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[11px] text-[#222222]">
            Ready to run directly in <span className="font-bold">DOSBox</span>, <span className="font-bold">QB64</span>, or vintage MS-DOS.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-4 py-1.5 font-bold border-2 border-white border-r-black border-b-black transition-colors ${
                copied
                  ? 'bg-[#00AA00] text-black'
                  : 'bg-[#C0C0C0] text-black hover:bg-white active:border-black'
              }`}
            >
              {copied ? '✓ COPIED!' : '📋 COPY CODE'}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-1.5 font-bold bg-[#0000AA] text-[#FFFF55] border-2 border-[#5555FF] border-r-black border-b-black hover:bg-[#5555FF] hover:text-white active:border-black shadow-md"
            >
              💾 DOWNLOAD .BAS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
