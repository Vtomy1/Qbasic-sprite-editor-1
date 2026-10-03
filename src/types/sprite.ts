export type ToolType = 
  | 'pencil'
  | 'eraser'
  | 'fill'
  | 'line'
  | 'rect'
  | 'rectFilled'
  | 'circle'
  | 'circleFilled'
  | 'picker'
  | 'select'
  | 'replace';

export type PutMode = 'PSET' | 'PRESET' | 'AND' | 'OR' | 'XOR';

export interface ColorDef {
  index: number;
  hex: string;
  name: string;
  r: number;
  g: number;
  b: number;
}

export interface SpriteFrame {
  id: string;
  name: string;
  pixels: number[]; // 1D array of palette indices [y * width + x]
}

export interface SelectionRect {
  x: number;
  y: number;
  w: number;
  h: number;
  pixels: number[];
  isDragging?: boolean;
}

export interface SpriteProject {
  id: string;
  name: string;
  width: number;
  height: number;
  frames: SpriteFrame[];
  fps: number;
  paletteMode: '16' | '256';
  transparentColorIndex: number;
}
