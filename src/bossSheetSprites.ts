import type { PixelBossPalette } from './pixelSprites';

export type BossSheetPhase = 'groggy' | 'idle' | 'impact' | 'recover' | 'windup';
export type BossSheetMove = 'slash' | 'slam' | 'thrust' | undefined;

interface BossFrameMeta {
  column: number;
  row: number;
  id: string;
  anchorX: number;
  anchorY: number;
}

const eb01Sheet = new Image();
eb01Sheet.src = '/assets/sprites/enemies/eb01-core-brute/sheets/eb01-core-brute-combat-core-v1.png';
const eg01Sheet = new Image();
eg01Sheet.src = '/assets/sprites/enemies/eg01-signal-tick/sheets/eg01-signal-tick-core-v1.png';
const eg02Sheet = new Image();
eg02Sheet.src = '/assets/sprites/enemies/eg02-static-maw/sheets/eg02-static-maw-core-v1.png';

function frame(id: string, column: number, row: number): BossFrameMeta {
  return {
    anchorX: 0.5,
    anchorY: 0.82,
    column,
    id,
    row,
  };
}

const eb01Frames = {
  alertHold: frame('eb01_alert_hold', 3, 0),
  alertStart: frame('eb01_alert_start', 2, 0),
  groggyCollapse: frame('eb01_groggy_collapse', 1, 3),
  groggyIdle: frame('eb01_groggy_idle_exposed_core', 2, 3),
  groggyRecover: frame('eb01_groggy_recovery_warning', 3, 3),
  hitLight: frame('eb01_hit_light', 3, 1),
  idleA: frame('eb01_idle_a', 0, 0),
  idleB: frame('eb01_idle_b', 1, 0),
  parryImpact: frame('eb01_parryable_pillar_impact', 1, 1),
  parryRecover: frame('eb01_parryable_recovery', 2, 1),
  parryWindup: frame('eb01_parryable_pillar_windup', 0, 1),
  slamImpact: frame('eb01_unparryable_slam_impact', 1, 2),
  slamWindup: frame('eb01_unparryable_slam_windup', 0, 2),
  thrustImpact: frame('eb01_thrust_impact', 3, 2),
  thrustWindup: frame('eb01_thrust_windup', 2, 2),
};

function selectBossFrame(phase: BossSheetPhase, move: BossSheetMove, beat: number) {
  const pulse = Math.floor(beat * 5) % 2;

  if (phase === 'groggy') {
    return pulse === 0 ? eb01Frames.groggyCollapse : eb01Frames.groggyIdle;
  }

  if (phase === 'windup') {
    if (move === 'slam') {
      return eb01Frames.slamWindup;
    }

    if (move === 'thrust') {
      return eb01Frames.thrustWindup;
    }

    return eb01Frames.parryWindup;
  }

  if (phase === 'impact') {
    if (move === 'slam') {
      return eb01Frames.slamImpact;
    }

    if (move === 'thrust') {
      return eb01Frames.thrustImpact;
    }

    return eb01Frames.parryImpact;
  }

  if (phase === 'recover') {
    return pulse === 0 ? eb01Frames.parryRecover : eb01Frames.alertHold;
  }

  return Math.floor(beat * 2) % 2 === 0 ? eb01Frames.idleA : eb01Frames.idleB;
}

function drawFallbackBoss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  palette: PixelBossPalette,
) {
  ctx.fillStyle = palette.body;
  ctx.fillRect(Math.round(x - 144 * scale), Math.round(y - 112 * scale), Math.round(288 * scale), Math.round(96 * scale));
  ctx.fillStyle = palette.armor;
  ctx.fillRect(Math.round(x - 196 * scale), Math.round(y - 84 * scale), Math.round(52 * scale), Math.round(134 * scale));
  ctx.fillRect(Math.round(x + 144 * scale), Math.round(y - 84 * scale), Math.round(52 * scale), Math.round(134 * scale));
  ctx.fillStyle = palette.core;
  ctx.fillRect(Math.round(x - 28 * scale), Math.round(y - 74 * scale), Math.round(56 * scale), Math.round(56 * scale));
}

export function drawSpriteSheetBoss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  palette: PixelBossPalette,
  options: {
    beat: number;
    move: BossSheetMove;
    phase: BossSheetPhase;
  },
) {
  if (!eb01Sheet.complete || eb01Sheet.naturalWidth === 0) {
    drawFallbackBoss(ctx, x, y, scale, palette);
    return;
  }

  const selectedFrame = selectBossFrame(options.phase, options.move, options.beat);
  const sourceCellWidth = eb01Sheet.naturalWidth / 4;
  const sourceCellHeight = eb01Sheet.naturalHeight / 4;
  const sourceInset = 10;
  const drawWidth = (sourceCellWidth - sourceInset * 2) * scale;
  const drawHeight = (sourceCellHeight - sourceInset * 2) * scale;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    eb01Sheet,
    selectedFrame.column * sourceCellWidth + sourceInset,
    selectedFrame.row * sourceCellHeight + sourceInset,
    sourceCellWidth - sourceInset * 2,
    sourceCellHeight - sourceInset * 2,
    Math.round(x - drawWidth * selectedFrame.anchorX),
    Math.round(y - drawHeight * selectedFrame.anchorY),
    Math.round(drawWidth),
    Math.round(drawHeight),
  );
  ctx.restore();
}

export function drawSpriteSheetGrunt(
  ctx: CanvasRenderingContext2D,
  gruntId: 'EG-01' | 'EG-02',
  x: number,
  y: number,
  scale: number,
  options: {
    beat: number;
    phase: BossSheetPhase;
  },
) {
  const sheet = gruntId === 'EG-01' ? eg01Sheet : eg02Sheet;

  if (!sheet.complete || sheet.naturalWidth === 0) {
    ctx.fillStyle = gruntId === 'EG-01' ? '#f5c84c' : '#ff5a6e';
    ctx.fillRect(Math.round(x - 32 * scale), Math.round(y - 24 * scale), Math.round(64 * scale), Math.round(48 * scale));
    return;
  }

  const pulse = Math.floor(options.beat * 2) % 2;
  const column = options.phase === 'groggy' ? 1 : options.phase === 'windup' || options.phase === 'impact' ? 0 : pulse;
  const row = options.phase === 'groggy' || options.phase === 'windup' || options.phase === 'impact' ? 1 : 0;
  const sourceCellWidth = sheet.naturalWidth / 2;
  const sourceCellHeight = sheet.naturalHeight / 2;
  const sourceInset = 12;
  const drawWidth = (sourceCellWidth - sourceInset * 2) * scale;
  const drawHeight = (sourceCellHeight - sourceInset * 2) * scale;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sheet,
    column * sourceCellWidth + sourceInset,
    row * sourceCellHeight + sourceInset,
    sourceCellWidth - sourceInset * 2,
    sourceCellHeight - sourceInset * 2,
    Math.round(x - drawWidth / 2),
    Math.round(y - drawHeight * 0.78),
    Math.round(drawWidth),
    Math.round(drawHeight),
  );
  ctx.restore();
}
