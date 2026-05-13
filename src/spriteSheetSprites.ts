export type CharacterPose =
  | 'counter'
  | 'dodge'
  | 'heavy1'
  | 'heavy2'
  | 'heavy3'
  | 'idle'
  | 'tagParry'
  | 'ultimate'
  | 'walk'
  | 'weak1'
  | 'weak2'
  | 'weak3';

export type SpriteSheetCharacterId = 'Z-02' | 'Z-03' | 'Z-04' | 'Z-05' | 'Z-06';

interface SpriteFrameMeta {
  column: number;
  id: string;
  row: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
}

const cellSize = 512;
const z02Sheet = new Image();
z02Sheet.src = '/assets/sprites/characters/z02/sheets/z02-combat-core-v1.png';
const z03Sheet = new Image();
z03Sheet.src = '/assets/sprites/characters/z03/sheets/z03-combat-core-v1.png';
const z04Sheet = new Image();
z04Sheet.src = '/assets/sprites/characters/z04/sheets/z04-combat-core-v1.png';
const z05Sheet = new Image();
z05Sheet.src = '/assets/sprites/characters/z05/sheets/z05-combat-core-v2.png';
const z06Sheet = new Image();
z06Sheet.src = '/assets/sprites/characters/z06/sheets/z06-combat-core-v1.png';
const z02WalkSheet = new Image();
z02WalkSheet.src = '/assets/sprites/characters/z02/sheets/z02-walk-north-v1.png';
const z03WalkSheet = new Image();
z03WalkSheet.src = '/assets/sprites/characters/z03/sheets/z03-walk-north-v1.png';
const z04WalkSheet = new Image();
z04WalkSheet.src = '/assets/sprites/characters/z04/sheets/z04-walk-north-v1.png';
const z05WalkSheet = new Image();
z05WalkSheet.src = '/assets/sprites/characters/z05/sheets/z05-walk-north-v2.png';
const z06WalkSheet = new Image();
z06WalkSheet.src = '/assets/sprites/characters/z06/sheets/z06-walk-north-v1.png';

const characterSheets: Record<SpriteSheetCharacterId, HTMLImageElement> = {
  'Z-02': z02Sheet,
  'Z-03': z03Sheet,
  'Z-04': z04Sheet,
  'Z-05': z05Sheet,
  'Z-06': z06Sheet,
};

const walkSheets: Record<SpriteSheetCharacterId, HTMLImageElement> = {
  'Z-02': z02WalkSheet,
  'Z-03': z03WalkSheet,
  'Z-04': z04WalkSheet,
  'Z-05': z05WalkSheet,
  'Z-06': z06WalkSheet,
};

const fallbackColors: Record<SpriteSheetCharacterId, string> = {
  'Z-02': '#f5c84c',
  'Z-03': '#0fb9b1',
  'Z-04': '#dff6ff',
  'Z-05': '#ff5fd7',
  'Z-06': '#ff9f43',
};

const sourceInsets: Record<SpriteSheetCharacterId, number> = {
  'Z-02': 4,
  'Z-03': 16,
  'Z-04': 4,
  'Z-05': 4,
  'Z-06': 4,
};

function frame(id: string, column: number, row: number): SpriteFrameMeta {
  return {
    anchorX: cellSize / 2,
    anchorY: 394,
    column,
    height: cellSize,
    id,
    row,
    width: cellSize,
  };
}

const combatFrames = {
  dodgeActive: frame('z01_dodge_active', 2, 2),
  dodgeRecover: frame('z01_dodge_recover', 3, 2),
  heavyImpact: frame('z01_heavy_impact', 1, 2),
  heavyStartup: frame('z01_heavy_startup', 0, 2),
  idleA: frame('z01_idle_back_a', 0, 0),
  idleB: frame('z01_idle_back_b', 1, 0),
  tagImpact: frame('z01_tag_parry_impact', 1, 3),
  tagReady: frame('z01_tag_parry_ready', 0, 3),
  weak1Impact: frame('z01_weak1_impact', 3, 0),
  weak1Startup: frame('z01_weak1_startup', 2, 0),
  weak2Impact: frame('z01_weak2_impact', 1, 1),
  weak2Startup: frame('z01_weak2_startup', 0, 1),
  weak3Impact: frame('z01_weak3_impact', 3, 1),
  weak3Startup: frame('z01_weak3_startup', 2, 1),
};

const walkFrames = [
  frame('walk_north_1', 0, 0),
  frame('walk_north_2', 1, 0),
  frame('walk_north_3', 2, 0),
  frame('walk_north_4', 3, 0),
];

function selectCombatFrame(pose: CharacterPose, beat: number, active: boolean) {
  if (!active) {
    return Math.floor(beat * 2) % 2 === 0 ? combatFrames.idleA : combatFrames.idleB;
  }

  const pulse = Math.floor(beat * 6) % 2;

  if (pose === 'weak1') {
    return pulse === 0 ? combatFrames.weak1Startup : combatFrames.weak1Impact;
  }

  if (pose === 'weak2') {
    return pulse === 0 ? combatFrames.weak2Startup : combatFrames.weak2Impact;
  }

  if (pose === 'weak3') {
    return pulse === 0 ? combatFrames.weak3Startup : combatFrames.weak3Impact;
  }

  if (pose === 'heavy1') {
    return pulse === 0 ? combatFrames.heavyStartup : combatFrames.heavyImpact;
  }

  if (pose === 'heavy2') {
    return pulse === 0 ? combatFrames.weak2Startup : combatFrames.heavyImpact;
  }

  if (pose === 'heavy3') {
    return pulse === 0 ? combatFrames.weak3Startup : combatFrames.heavyImpact;
  }

  if (pose === 'dodge') {
    return pulse === 0 ? combatFrames.dodgeActive : combatFrames.dodgeRecover;
  }

  if (pose === 'tagParry') {
    return pulse === 0 ? combatFrames.tagReady : combatFrames.tagImpact;
  }

  if (pose === 'counter') {
    return pulse === 0 ? combatFrames.weak3Startup : combatFrames.weak3Impact;
  }

  if (pose === 'ultimate') {
    return pulse === 0 ? combatFrames.tagReady : combatFrames.tagImpact;
  }

  return Math.floor(beat * 2) % 2 === 0 ? combatFrames.idleA : combatFrames.idleB;
}

export function drawSpriteSheetCharacter(
  characterId: SpriteSheetCharacterId,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  options: {
    active: boolean;
    beat: number;
    pose: CharacterPose;
  },
) {
  const walking = options.pose === 'walk';
  const walkFrameIndex = ((Math.floor(options.beat * 6) % walkFrames.length) + walkFrames.length) % walkFrames.length;
  const selectedFrame = walking ? walkFrames[walkFrameIndex] : selectCombatFrame(options.pose, options.beat, options.active);
  const sheet = walking ? walkSheets[characterId] : characterSheets[characterId];
  const sheetScale = scale * 0.18;
  const width = selectedFrame.width * sheetScale;
  const height = selectedFrame.height * sheetScale;

  if (!sheet.complete || sheet.naturalWidth === 0) {
    ctx.fillStyle = fallbackColors[characterId];
    ctx.fillRect(
      Math.round(x - 18 * sheetScale),
      Math.round(y - 62 * sheetScale),
      Math.round(36 * sheetScale),
      Math.round(62 * sheetScale),
    );
    return;
  }

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const sourceCellWidth = sheet.naturalWidth / 4;
  const sourceCellHeight = walking ? sheet.naturalHeight : sheet.naturalHeight / 4;
  const sourceInset = walking ? 0 : sourceInsets[characterId];
  ctx.drawImage(
    sheet,
    selectedFrame.column * sourceCellWidth + sourceInset,
    selectedFrame.row * sourceCellHeight + sourceInset,
    sourceCellWidth - sourceInset * 2,
    sourceCellHeight - sourceInset * 2,
    Math.round(x - selectedFrame.anchorX * sheetScale),
    Math.round(y - selectedFrame.anchorY * sheetScale),
    Math.round(width),
    Math.round(height),
  );
  ctx.restore();
}
