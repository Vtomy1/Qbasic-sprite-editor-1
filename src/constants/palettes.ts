import { ColorDef } from '../types/sprite';

// Standard 16-color QBasic/EGA/VGA Palette
export const QBASIC_16_PALETTE: ColorDef[] = [
  { index: 0, hex: '#000000', name: '0: Black', r: 0, g: 0, b: 0 },
  { index: 1, hex: '#0000AA', name: '1: Blue', r: 0, g: 0, b: 170 },
  { index: 2, hex: '#00AA00', name: '2: Green', r: 0, g: 170, b: 0 },
  { index: 3, hex: '#00AAAA', name: '3: Cyan', r: 0, g: 170, b: 170 },
  { index: 4, hex: '#AA0000', name: '4: Red', r: 170, g: 0, b: 0 },
  { index: 5, hex: '#AA00AA', name: '5: Magenta', r: 170, g: 0, b: 170 },
  { index: 6, hex: '#AA5500', name: '6: Brown', r: 170, g: 85, b: 0 },
  { index: 7, hex: '#AAAAAA', name: '7: White / Light Gray', r: 170, g: 170, b: 170 },
  { index: 8, hex: '#555555', name: '8: Dark Gray', r: 85, g: 85, b: 85 },
  { index: 9, hex: '#5555FF', name: '9: Bright Blue', r: 85, g: 85, b: 255 },
  { index: 10, hex: '#55FF55', name: '10: Bright Green', r: 85, g: 255, b: 85 },
  { index: 11, hex: '#55FFFF', name: '11: Bright Cyan', r: 85, g: 255, b: 255 },
  { index: 12, hex: '#FF5555', name: '12: Bright Red', r: 255, g: 85, b: 85 },
  { index: 13, hex: '#FF55FF', name: '13: Bright Magenta', r: 255, g: 85, b: 255 },
  { index: 14, hex: '#FFFF55', name: '14: Yellow', r: 255, g: 255, b: 85 },
  { index: 15, hex: '#FFFFFF', name: '15: High White', r: 255, g: 255, b: 255 },
];

function toHex(n: number): string {
  const hex = Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
  return hex;
}

// Generate the standard 256 VGA SCREEN 13 default palette
export function generateVga256Palette(): ColorDef[] {
  const palette: ColorDef[] = [];

  // 0-15: Standard 16 colors
  for (let i = 0; i < 16; i++) {
    palette.push(QBASIC_16_PALETTE[i]);
  }

  // 16-31: 16 shades of gray (from almost black to almost white)
  for (let i = 0; i < 16; i++) {
    const val = Math.round((i / 15) * 255);
    const hex = `#${toHex(val)}${toHex(val)}${toHex(val)}`;
    palette.push({
      index: 16 + i,
      hex,
      name: `${16 + i}: Gray ${i + 1}`,
      r: val,
      g: val,
      b: val,
    });
  }

  // 32-247: 216 colors arranged as hue ramps in VGA standard DAC
  // VGA default palette has 3 groups of 72 colors with varying saturations/intensities
  const hues = [
    [1, 0, 0],       // Red
    [1, 0.5, 0],     // Orange
    [1, 1, 0],       // Yellow
    [0.5, 1, 0],     // Yellow-Green
    [0, 1, 0],       // Green
    [0, 1, 0.5],     // Spring Green
    [0, 1, 1],       // Cyan
    [0, 0.5, 1],     // Sky Blue
    [0, 0, 1],       // Blue
    [0.5, 0, 1],     // Violet
    [1, 0, 1],       // Magenta
    [1, 0, 0.5],     // Rose
  ];

  let idx = 32;
  // Level 1: Full saturation, high brightness (72 colors: 12 hues x 6 shades)
  // Level 2: Medium saturation (72 colors)
  // Level 3: Pastel/low saturation (72 colors)
  const saturationLevels = [
    { baseMul: 1.0, grayMix: 0.0 },
    { baseMul: 0.7, grayMix: 0.2 },
    { baseMul: 0.45, grayMix: 0.45 },
  ];

  for (const level of saturationLevels) {
    for (const hue of hues) {
      for (let shade = 0; shade < 6; shade++) {
        if (idx >= 248) break;
        const brightness = 0.35 + (shade / 5) * 0.65;
        const rVal = Math.round(
          255 * (hue[0] * brightness * (1 - level.grayMix) + level.grayMix * brightness) * level.baseMul
        );
        const gVal = Math.round(
          255 * (hue[1] * brightness * (1 - level.grayMix) + level.grayMix * brightness) * level.baseMul
        );
        const bVal = Math.round(
          255 * (hue[2] * brightness * (1 - level.grayMix) + level.grayMix * brightness) * level.baseMul
        );

        palette.push({
          index: idx,
          hex: `#${toHex(rVal)}${toHex(gVal)}${toHex(bVal)}`,
          name: `${idx}: Color ${idx}`,
          r: rVal,
          g: gVal,
          b: bVal,
        });
        idx++;
      }
    }
  }

  // 248-255: Extra dark tones & pure black
  while (palette.length < 256) {
    const i = palette.length;
    const v = Math.round(((i - 248) / 8) * 40);
    palette.push({
      index: i,
      hex: `#${toHex(v)}${toHex(v)}${toHex(v)}`,
      name: `${i}: Dark Tone`,
      r: v,
      g: v,
      b: v,
    });
  }

  return palette;
}

export const VGA_256_PALETTE: ColorDef[] = generateVga256Palette();

export function getColorByIndex(index: number, mode: '16' | '256' = '16'): ColorDef {
  if (mode === '16') {
    return QBASIC_16_PALETTE[index % 16] || QBASIC_16_PALETTE[0];
  }
  return VGA_256_PALETTE[index % 256] || VGA_256_PALETTE[0];
}
