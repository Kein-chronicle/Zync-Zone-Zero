export interface PixelCharacter {
  name: string;
  accent: string;
  hair: string;
  outfit: string;
  skin: string;
  weapon: string;
}

export interface PixelBossPalette {
  body: string;
  core: string;
  armor: string;
  warning: string;
}

interface CharacterDrawOptions {
  active: boolean;
  evading: boolean;
  counter: boolean;
  beat: number;
}

interface BossDrawOptions {
  phase: 'idle' | 'windup' | 'impact' | 'recover';
  move: 'slash' | 'slam' | 'thrust' | undefined;
  warningColor: string;
  beat: number;
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, scale: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x * scale), Math.round(y * scale), Math.round(width * scale), Math.round(height * scale));
}

export const pixelCharacters: PixelCharacter[] = [
  {
    name: 'Z-01',
    accent: '#e9f7ff',
    hair: '#222a38',
    outfit: '#2e3542',
    skin: '#f0c7a7',
    weapon: '#83e7f0',
  },
  {
    name: 'Z-02',
    accent: '#f5c84c',
    hair: '#3a2b24',
    outfit: '#34302a',
    skin: '#e6b995',
    weapon: '#f0b13a',
  },
  {
    name: 'Z-03',
    accent: '#0fb9b1',
    hair: '#1d3a37',
    outfit: '#26343a',
    skin: '#efc6a5',
    weapon: '#41e4ca',
  },
];

export const coreBrutePalette: PixelBossPalette = {
  body: '#242932',
  core: '#ff5a6e',
  armor: '#3d4655',
  warning: '#f5c84c',
};

export function drawPixelCharacter(
  ctx: CanvasRenderingContext2D,
  character: PixelCharacter,
  x: number,
  y: number,
  scale: number,
  options: CharacterDrawOptions,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.imageSmoothingEnabled = false;

  const bounce = Math.round(Math.sin(options.beat * Math.PI * 2) * (options.active ? 2 : 1));
  const lean = options.evading ? -3 : 0;
  const glow = options.counter ? character.accent : character.weapon;

  px(ctx, -4 + lean, -22 + bounce, 8, 6, character.hair, scale);
  px(ctx, -3 + lean, -18 + bounce, 6, 5, character.skin, scale);
  px(ctx, -5 + lean, -13 + bounce, 10, 12, character.outfit, scale);
  px(ctx, -6 + lean, -11 + bounce, 2, 8, character.accent, scale);
  px(ctx, 4 + lean, -11 + bounce, 2, 8, character.accent, scale);
  px(ctx, -6 + lean, -1 + bounce, 4, 10, '#20252d', scale);
  px(ctx, 2 + lean, -1 + bounce, 4, 10, '#20252d', scale);
  px(ctx, -8 + lean, 9 + bounce, 6, 2, character.accent, scale);
  px(ctx, 2 + lean, 9 + bounce, 6, 2, character.accent, scale);

  if (character.name === 'Z-02') {
    px(ctx, -13 + lean, -10 + bounce, 4, 20, glow, scale);
    px(ctx, -15 + lean, -4 + bounce, 8, 8, glow, scale);
  } else if (character.name === 'Z-03') {
    px(ctx, -14 + lean, -6 + bounce, 14, 2, glow, scale);
    px(ctx, 7 + lean, -17 + bounce, 2, 23, character.accent, scale);
    px(ctx, 9 + lean, -13 + bounce, 2, 18, character.accent, scale);
  } else {
    px(ctx, -12 + lean, -7 + bounce, 18, 2, glow, scale);
    px(ctx, 5 + lean, -8 + bounce, 2, 12, glow, scale);
  }

  if (options.active) {
    px(ctx, -9 + lean, 13 + bounce, 18, 2, character.accent, scale);
  }

  ctx.restore();
}

export function drawPixelBoss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  palette: PixelBossPalette,
  options: BossDrawOptions,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.imageSmoothingEnabled = false;

  const pulse = Math.round(Math.sin(options.beat * Math.PI * 2) * 2);
  const impact = options.phase === 'impact' ? 3 : 0;
  const warning = options.phase === 'idle' ? palette.armor : options.warningColor;

  px(ctx, -28 - impact, -34 + pulse, 56 + impact * 2, 12, palette.armor, scale);
  px(ctx, -36 - impact, -22 + pulse, 72 + impact * 2, 36, palette.body, scale);
  px(ctx, -24, 14 + pulse, 48, 22 + impact, palette.body, scale);
  px(ctx, -10, -10 + pulse, 20, 20, palette.core, scale);
  px(ctx, -44 - impact, -12 + pulse, 12, 36, palette.armor, scale);
  px(ctx, 32 + impact, -12 + pulse, 12, 36, palette.armor, scale);

  if (options.move === 'slam') {
    px(ctx, -48, -34 + pulse - impact * 2, 12, 58 + impact * 4, warning, scale);
    px(ctx, 36, -34 + pulse - impact * 2, 12, 58 + impact * 4, warning, scale);
  } else if (options.move === 'thrust') {
    px(ctx, -48, 4 + pulse, 96 + impact * 5, 6, warning, scale);
  } else {
    px(ctx, -58 - impact, -24 + pulse, 116 + impact * 2, 6, warning, scale);
    px(ctx, -50 - impact, 24 + pulse, 100 + impact * 2, 6, warning, scale);
  }

  px(ctx, -18, -20 + pulse, 8, 8, palette.core, scale);
  px(ctx, 10, -20 + pulse, 8, 8, palette.core, scale);

  ctx.restore();
}

