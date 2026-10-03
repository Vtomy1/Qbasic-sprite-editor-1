import { ColorDef } from '../types/sprite';
import { QBASIC_16_PALETTE, VGA_256_PALETTE } from '../constants/palettes';

// Color distance squared in RGB
function colorDistSq(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

// Find closest color index in palette
export function findClosestPaletteIndex(
  r: number,
  g: number,
  b: number,
  a: number,
  palette: ColorDef[],
  transparentIndex: number = 0
): number {
  if (a < 64) {
    return transparentIndex;
  }

  let bestIdx = 0;
  let bestDist = Infinity;

  for (let i = 0; i < palette.length; i++) {
    const pal = palette[i];
    const dist = colorDistSq(r, g, b, pal.r, pal.g, pal.b);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = pal.index;
    }
  }

  return bestIdx;
}

// Process imported HTMLImageElement into sprite frame pixels
export function quantizeImageToPixels(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  paletteMode: '16' | '256',
  transparentIndex: number = 0
): number[] {
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Array(targetW * targetH).fill(0);

  // Disable smoothing for crisp pixel mapping
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;
  const palette = paletteMode === '16' ? QBASIC_16_PALETTE : VGA_256_PALETTE;

  const pixels: number[] = new Array(targetW * targetH);

  for (let i = 0; i < pixels.length; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const a = data[offset + 3];

    pixels[i] = findClosestPaletteIndex(r, g, b, a, palette, transparentIndex);
  }

  return pixels;
}
