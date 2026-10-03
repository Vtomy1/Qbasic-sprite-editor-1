import { SpriteProject } from '../types/sprite';

// Helper to create empty or pattern grid
function makeGrid(w: number, h: number, defaultVal = 0): number[] {
  return new Array(w * h).fill(defaultVal);
}

// 1. Classic Gorilla (Inspired by MS-DOS GORILLA.BAS)
function createGorillaPreset(): SpriteProject {
  const w = 16;
  const h = 16;
  // Frame 1: Gorilla idle/standing
  const f1 = makeGrid(w, h, 0);
  // Frame 2: Gorilla throwing arm up!
  const f2 = makeGrid(w, h, 0);

  // Palette: 0=trans/black, 6=Brown, 14=Yellow, 7=Light Gray, 15=White, 4=Red, 8=Dark Gray
  const gorillaLines1 = [
    "....666666......",
    "...66777766.....",
    "..6670770766....",
    "..6677777766....",
    "...66444466.....",
    "..6666666666....",
    ".66.666666.66...",
    "66..666666..66..",
    "66..666666..66..",
    "66..666666..66..",
    ".66.666666.66...",
    "....66..66......",
    "...66....66.....",
    "...66....66.....",
    "..666....666....",
    "................",
  ];

  const gorillaLines2 = [
    "66..666666...1414",
    ".6666777766..1414",
    "..6670770766.14..",
    "..667777776666...",
    "...6644446666...",
    "..6666666666....",
    ".66.666666......",
    "66..666666......",
    "66..666666......",
    "66..666666......",
    ".66.666666.66...",
    "....66..66..66..",
    "...66....66..66.",
    "...66....66..66.",
    "..666....666.66.",
    "................",
  ];

  const parseAscii = (lines: string[]) => {
    const arr = new Array(w * h).fill(0);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const char = lines[y]?.[x] || '.';
        if (char === '.') arr[y * w + x] = 0;
        else if (char === '0') arr[y * w + x] = 0;
        else if (char === '6') arr[y * w + x] = 6;
        else if (char === '7') arr[y * w + x] = 7;
        else if (char === '4') arr[y * w + x] = 4;
        else if (char === '1') arr[y * w + x] = 14;
        else arr[y * w + x] = parseInt(char, 16) || 6;
      }
    }
    return arr;
  };

  return {
    id: 'preset-gorilla',
    name: 'GORILLA',
    width: 16,
    height: 16,
    paletteMode: '16',
    transparentColorIndex: 0,
    fps: 4,
    frames: [
      { id: 'g-f1', name: 'Stand', pixels: parseAscii(gorillaLines1) },
      { id: 'g-f2', name: 'Throw', pixels: parseAscii(gorillaLines2) },
    ],
  };
}

// 2. Nibbles Snake (From NIBBLES.BAS)
function createNibblesPreset(): SpriteProject {
  const w = 16;
  const h = 16;
  const parseAscii = (lines: string[]) => {
    const arr = new Array(w * h).fill(0);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const char = lines[y]?.[x] || '.';
        if (char === '.') arr[y * w + x] = 0;
        else if (char === 'A') arr[y * w + x] = 10; // Light Green
        else if (char === '2') arr[y * w + x] = 2;  // Green
        else if (char === '4') arr[y * w + x] = 4;  // Red (tongue/apple)
        else if (char === 'C') arr[y * w + x] = 12; // Bright Red
        else if (char === 'F') arr[y * w + x] = 15; // White eye
        else if (char === '0') arr[y * w + x] = 0;  // Black pupil
        else if (char === '6') arr[y * w + x] = 6;  // Stem
      }
    }
    return arr;
  };

  const f1Lines = [
    ".....2AAAA2.....",
    "...2AAAAAAAA2...",
    "..2AAFAAAFAAA2..",
    ".2AA0FAAA0FAAA2.",
    ".2AAAAAAAAAAAA2.",
    ".2AAAAAAAAAAAA2.",
    "..2AAAA4AAAAA2..",
    "...2AAA44AAA2...",
    "....2AA44AA2....",
    ".....224422.....",
    ".......44.......",
    "......4..4......",
    "................",
    "................",
    "................",
    "................",
  ];

  const f2Lines = [
    ".....2AAAA2.....",
    "...2AAAAAAAA2...",
    "..2AAFAAAFAAA2..",
    ".2AA0FAAA0FAAA2.",
    ".2AAAAAAAAAAAA2.",
    ".2AAAAAAAAAAAA2.",
    "..2AAAAAAAAAA2..",
    "...2AAAAAAAA2...",
    "....2AAAAAA2....",
    ".....22AA22.....",
    ".......22.......",
    "................",
    "................",
    "................",
    "................",
    "................",
  ];

  return {
    id: 'preset-nibbles',
    name: 'NIBBLES',
    width: 16,
    height: 16,
    paletteMode: '16',
    transparentColorIndex: 0,
    fps: 4,
    frames: [
      { id: 'n-f1', name: 'Tongue Out', pixels: parseAscii(f1Lines) },
      { id: 'n-f2', name: 'Tongue In', pixels: parseAscii(f2Lines) },
    ],
  };
}

// 3. Retro Space Fighter (Animated Thruster)
function createSpaceShipPreset(): SpriteProject {
  const w = 16;
  const h = 16;
  const parseAscii = (lines: string[]) => {
    const arr = new Array(w * h).fill(0);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const char = lines[y]?.[x] || '.';
        if (char === '.') arr[y * w + x] = 0;
        else if (char === 'B') arr[y * w + x] = 9;  // Bright Blue
        else if (char === '1') arr[y * w + x] = 1;  // Blue
        else if (char === 'W') arr[y * w + x] = 15; // White
        else if (char === 'C') arr[y * w + x] = 11; // Cyan cockpit
        else if (char === 'R') arr[y * w + x] = 12; // Red wingtip
        else if (char === 'Y') arr[y * w + x] = 14; // Yellow flame
        else if (char === 'O') arr[y * w + x] = 6;  // Orange/brown
        else if (char === 'G') arr[y * w + x] = 7;  // Light gray
      }
    }
    return arr;
  };

  const f1Lines = [
    ".......WW.......",
    ".......WW.......",
    "......WCCW......",
    "......WCCW......",
    ".....WGGGGW.....",
    ".....WGGGGW.....",
    "....WGGBBGGW....",
    "....WGGBBGGW....",
    "...WGGGBBGGGW...",
    "..RWGGGBBGGGER..",
    "..RWGGGBBGGGER..",
    ".RRWGGWWWWGGRR..",
    "....WW.YY.WW....",
    ".......YY.......",
    ".......YY.......",
    "................",
  ];

  const f2Lines = [
    ".......WW.......",
    ".......WW.......",
    "......WCCW......",
    "......WCCW......",
    ".....WGGGGW.....",
    ".....WGGGGW.....",
    "....WGGBBGGW....",
    "....WGGBBGGW....",
    "...WGGGBBGGGW...",
    "..RWGGGBBGGGER..",
    "..RWGGGBBGGGER..",
    ".RRWGGWWWWGGRR..",
    "....WW.YY.WW....",
    "......YYYY......",
    ".......YY.......",
    ".......RR.......",
  ];

  return {
    id: 'preset-spaceship',
    name: 'STAR_FIGHTER',
    width: 16,
    height: 16,
    paletteMode: '16',
    transparentColorIndex: 0,
    fps: 8,
    frames: [
      { id: 's-f1', name: 'Thrust 1', pixels: parseAscii(f1Lines) },
      { id: 's-f2', name: 'Thrust 2', pixels: parseAscii(f2Lines) },
    ],
  };
}

// 4. Gold Coin (4 frames rotating)
function createCoinPreset(): SpriteProject {
  const w = 16;
  const h = 16;
  const parseAscii = (lines: string[]) => {
    const arr = new Array(w * h).fill(0);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const char = lines[y]?.[x] || '.';
        if (char === '.') arr[y * w + x] = 0;
        else if (char === 'Y') arr[y * w + x] = 14; // Yellow
        else if (char === 'O') arr[y * w + x] = 6;  // Brown/Dark Gold
        else if (char === 'W') arr[y * w + x] = 15; // White glint
      }
    }
    return arr;
  };

  const f1 = [
    ".....OOOOOO.....",
    "...OOYYYYYYOO...",
    "..OYYYYYYYYYYO..",
    ".OYYYYYYYYYYYYO.",
    ".OYYWWYYYYYYYYO.",
    "OYYWWYYOYYYYYYYO",
    "OYYYYYYOYYYYYYYO",
    "OYYYYYYOYYYYYYYO",
    "OYYYYYYOYYYYYYYO",
    "OYYYYYYOYYYYYYYO",
    "OYYYYYYYYYYYYYYO",
    ".OYYYYYYYYYYYYO.",
    ".OYYYYYYYYYYYYO.",
    "..OYYYYYYYYYYO..",
    "...OOYYYYYYOO...",
    ".....OOOOOO.....",
  ];

  const f2 = [
    ".......OOOO.....",
    ".....OOYYYYOO...",
    "....OYYYYYYYYO..",
    "...OYYYYYYYYYYO.",
    "...OYYWWYYYYYYO.",
    "..OYYWWYYOYYYYYO",
    "..OYYYYYYOYYYYYO",
    "..OYYYYYYOYYYYYO",
    "..OYYYYYYOYYYYYO",
    "..OYYYYYYOYYYYYO",
    "..OYYYYYYYYYYYYO",
    "...OYYYYYYYYYYO.",
    "...OYYYYYYYYYYO.",
    "....OYYYYYYYYO..",
    ".....OOYYYYOO...",
    ".......OOOO.....",
  ];

  const f3 = [
    ".......OOOO.....",
    "......OYYYYO....",
    ".....OYYYYYYO...",
    ".....OYYYYYYO...",
    ".....OYYWYYYO...",
    ".....OYYOYYYO...",
    ".....OYYOYYYO...",
    ".....OYYOYYYO...",
    ".....OYYOYYYO...",
    ".....OYYOYYYO...",
    ".....OYYYYYYO...",
    ".....OYYYYYYO...",
    ".....OYYYYYYO...",
    "......OYYYYO....",
    ".......OOOO.....",
    "................",
  ];

  const f4 = [
    ".......OOOO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OYYO.....",
    ".......OOOO.....",
    "................",
  ];

  return {
    id: 'preset-coin',
    name: 'GOLD_COIN',
    width: 16,
    height: 16,
    paletteMode: '16',
    transparentColorIndex: 0,
    fps: 6,
    frames: [
      { id: 'c-f1', name: 'Face', pixels: parseAscii(f1) },
      { id: 'c-f2', name: 'Angle', pixels: parseAscii(f2) },
      { id: 'c-f3', name: 'Edge Angle', pixels: parseAscii(f3) },
      { id: 'c-f4', name: 'Edge', pixels: parseAscii(f4) },
    ],
  };
}

// 5. Classic Dungeon Chest
function createChestPreset(): SpriteProject {
  const w = 16;
  const h = 16;
  const parseAscii = (lines: string[]) => {
    const arr = new Array(w * h).fill(0);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const char = lines[y]?.[x] || '.';
        if (char === '.') arr[y * w + x] = 0;
        else if (char === '8') arr[y * w + x] = 8;  // Dark Gray
        else if (char === '7') arr[y * w + x] = 7;  // Light Gray
        else if (char === '6') arr[y * w + x] = 6;  // Brown
        else if (char === 'E') arr[y * w + x] = 14; // Gold latch / Yellow
        else if (char === 'F') arr[y * w + x] = 15; // White shine
        else if (char === '0') arr[y * w + x] = 0;  // Black inside
      }
    }
    return arr;
  };

  const f1 = [
    "................",
    "................",
    "................",
    "...78888888887..",
    "..786666666687..",
    ".78666666666687.",
    ".788888EE888887.",
    ".786666EE666687.",
    ".78666666666687.",
    ".78666666666687.",
    ".78666666666687.",
    ".78888888888887.",
    "..788888888887..",
    "................",
    "................",
    "................",
  ];

  const f2 = [
    "....788888887...",
    "...7866666687...",
    "..786666666687..",
    "..78888EE88887..",
    "................",
    ".78000000000087.",
    ".780EE0000EE087.",
    ".780EEEEEEEE087.",
    ".786666EE666687.",
    ".78666666666687.",
    ".78666666666687.",
    ".78888888888887.",
    "..788888888887..",
    "................",
    "................",
    "................",
  ];

  return {
    id: 'preset-chest',
    name: 'CHEST',
    width: 16,
    height: 16,
    paletteMode: '16',
    transparentColorIndex: 0,
    fps: 2,
    frames: [
      { id: 'ch-f1', name: 'Closed', pixels: parseAscii(f1) },
      { id: 'ch-f2', name: 'Open Treasure', pixels: parseAscii(f2) },
    ],
  };
}

// 6. Retro Knight / Hero
function createKnightPreset(): SpriteProject {
  const w = 16;
  const h = 16;
  const parseAscii = (lines: string[]) => {
    const arr = new Array(w * h).fill(0);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const char = lines[y]?.[x] || '.';
        if (char === '.') arr[y * w + x] = 0;
        else if (char === 'R') arr[y * w + x] = 12; // Plume Red
        else if (char === 'W') arr[y * w + x] = 15; // Silver / White
        else if (char === '7') arr[y * w + x] = 7;  // Light gray
        else if (char === '8') arr[y * w + x] = 8;  // Dark gray
        else if (char === 'B') arr[y * w + x] = 9;  // Blue tunic
        else if (char === '1') arr[y * w + x] = 1;  // Dark Blue
        else if (char === 'Y') arr[y * w + x] = 14; // Yellow belt
        else if (char === 'S') arr[y * w + x] = 11; // Cyan sword
      }
    }
    return arr;
  };

  const f1 = [
    "......RRRR......",
    ".....RRRRRR.....",
    ".....77WW77.....",
    ".....788887.....",
    ".....777777.....",
    "....71BBBB17.S..",
    "....11BBBB11.S..",
    "....11YYYY11.S..",
    "....71BBBB17SSSS",
    ".....88..88..S..",
    ".....88..88..S..",
    ".....77..77.....",
    ".....88..88.....",
    "....888..888....",
    "................",
    "................",
  ];

  const f2 = [
    "......RRRR......",
    ".....RRRRRR.....",
    ".....77WW77.....",
    ".....788887.....",
    ".....777777.....",
    "....71BBBB17..S.",
    "....11BBBB11.SS.",
    "....11YYYY11..S.",
    "....71BBBB17SSSS",
    "....888..888.S..",
    "....88....88.S..",
    "....77....77....",
    "...888....888...",
    "................",
    "................",
    "................",
  ];

  return {
    id: 'preset-knight',
    name: 'KNIGHT',
    width: 16,
    height: 16,
    paletteMode: '16',
    transparentColorIndex: 0,
    fps: 4,
    frames: [
      { id: 'k-f1', name: 'Stand', pixels: parseAscii(f1) },
      { id: 'k-f2', name: 'Walk', pixels: parseAscii(f2) },
    ],
  };
}

export const PRESETS: SpriteProject[] = [
  createGorillaPreset(),
  createNibblesPreset(),
  createSpaceShipPreset(),
  createCoinPreset(),
  createChestPreset(),
  createKnightPreset(),
];
