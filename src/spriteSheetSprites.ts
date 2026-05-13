export type CharacterPose =
  | 'counter'
  | 'dodge'
  | 'heavy1'
  | 'heavy2'
  | 'heavy3'
  | 'idle'
  | 'tagParry'
  | 'ultimate'
  | 'weak1'
  | 'weak2'
  | 'weak3';

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
const z01Sheet = new Image();
z01Sheet.src = '/assets/sprites/characters/z01/sheets/z01-chibi-frame-safe-sheet-v1-transparent.png';

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

const z01Frames = {
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

function selectZ01Frame(pose: CharacterPose, beat: number, active: boolean) {
  if (!active) {
    return Math.floor(beat * 2) % 2 === 0 ? z01Frames.idleA : z01Frames.idleB;
  }

  const pulse = Math.floor(beat * 6) % 2;

  if (pose === 'weak1') {
    return pulse === 0 ? z01Frames.weak1Startup : z01Frames.weak1Impact;
  }

  if (pose === 'weak2') {
    return pulse === 0 ? z01Frames.weak2Startup : z01Frames.weak2Impact;
  }

  if (pose === 'weak3') {
    return pulse === 0 ? z01Frames.weak3Startup : z01Frames.weak3Impact;
  }

  if (pose === 'heavy1') {
    return pulse === 0 ? z01Frames.heavyStartup : z01Frames.heavyImpact;
  }

  if (pose === 'heavy2') {
    return pulse === 0 ? z01Frames.weak2Startup : z01Frames.heavyImpact;
  }

  if (pose === 'heavy3') {
    return pulse === 0 ? z01Frames.weak3Startup : z01Frames.heavyImpact;
  }

  if (pose === 'dodge') {
    return pulse === 0 ? z01Frames.dodgeActive : z01Frames.dodgeRecover;
  }

  if (pose === 'tagParry') {
    return pulse === 0 ? z01Frames.tagReady : z01Frames.tagImpact;
  }

  if (pose === 'counter') {
    return pulse === 0 ? z01Frames.weak3Startup : z01Frames.weak3Impact;
  }

  if (pose === 'ultimate') {
    return pulse === 0 ? z01Frames.tagReady : z01Frames.tagImpact;
  }

  return Math.floor(beat * 2) % 2 === 0 ? z01Frames.idleA : z01Frames.idleB;
}

export function drawZ01SpriteSheetCharacter(
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
  const selectedFrame = selectZ01Frame(options.pose, options.beat, options.active);
  const sheetScale = scale * 0.18;
  const width = selectedFrame.width * sheetScale;
  const height = selectedFrame.height * sheetScale;

  if (!z01Sheet.complete || z01Sheet.naturalWidth === 0) {
    ctx.fillStyle = '#72e9ff';
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
  const sourceCellWidth = z01Sheet.naturalWidth / 4;
  const sourceCellHeight = z01Sheet.naturalHeight / 4;
  const sourceInset = 4;
  ctx.drawImage(
    z01Sheet,
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
