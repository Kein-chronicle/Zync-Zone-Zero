import { drawSpriteSheetBoss, drawSpriteSheetGrunt } from './bossSheetSprites';
import { drawSpriteSheetCharacter, type CharacterPose } from './spriteSheetSprites';

export interface PixelCharacter {
  name: string;
  accent: string;
  hair: string;
  outfit: string;
  skin: string;
  weapon: string;
  groggyPower: number;
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
  pose: CharacterPose;
}

interface BossDrawOptions {
  phase: 'idle' | 'windup' | 'impact' | 'recover' | 'groggy';
  move: 'slash' | 'slam' | 'thrust' | undefined;
  warningColor: string;
  beat: number;
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, scale: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x * scale), Math.round(y * scale), Math.round(width * scale), Math.round(height * scale));
}

function faceDetails(ctx: CanvasRenderingContext2D, scale: number, x: number, y: number, eyeColor: string) {
  px(ctx, x - 7, y - 1, 4, 1, '#2b1f23', scale);
  px(ctx, x + 3, y - 1, 4, 1, '#2b1f23', scale);
  px(ctx, x - 6, y, 3, 3, '#ffffff', scale);
  px(ctx, x + 4, y, 3, 3, '#ffffff', scale);
  px(ctx, x - 5, y + 1, 2, 2, eyeColor, scale);
  px(ctx, x + 4, y + 1, 2, 2, eyeColor, scale);
  px(ctx, x, y + 4, 1, 2, '#b87863', scale);
  px(ctx, x - 2, y + 8, 5, 1, '#8f4f56', scale);
}

export const pixelCharacters: PixelCharacter[] = [
  {
    name: 'Z-05',
    accent: '#dff6ff',
    hair: '#161b24',
    outfit: '#20242c',
    skin: '#f0c7a7',
    weapon: '#bff8ff',
    groggyPower: 1.18,
  },
  {
    name: 'Z-02',
    accent: '#f5c84c',
    hair: '#3a2b24',
    outfit: '#34302a',
    skin: '#e6b995',
    weapon: '#f0b13a',
    groggyPower: 1.35,
  },
  {
    name: 'Z-03',
    accent: '#0fb9b1',
    hair: '#1d3a37',
    outfit: '#26343a',
    skin: '#efc6a5',
    weapon: '#41e4ca',
    groggyPower: 0.85,
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

  if (character.name === 'Z-02' || character.name === 'Z-03' || character.name === 'Z-05') {
    ctx.restore();
    drawSpriteSheetCharacter(character.name, ctx, x, y, scale, {
      active: options.active,
      beat: options.beat,
      pose: options.pose,
    });
    return;
  }

  const bounce = Math.round(Math.sin(options.beat * Math.PI * 2) * (options.active ? 2 : 1));
  const lean = options.evading ? -4 : 0;
  const glow = options.counter ? character.accent : character.weapon;
  const outline = '#121720';
  const boot = '#151923';
  const skirt = character.name === 'Z-02' ? '#26211f' : '#1e2530';
  const eyeColor = character.name === 'Z-03' ? '#28f0d2' : character.name === 'Z-02' ? '#ffd469' : '#9eefff';

  px(ctx, -12 + lean, -50 + bounce, 24, 8, outline, scale);
  px(ctx, -14 + lean, -46 + bounce, 28, 18, character.hair, scale);
  px(ctx, -16 + lean, -40 + bounce, 5, 24, character.hair, scale);
  px(ctx, 11 + lean, -40 + bounce, 5, 24, character.hair, scale);
  px(ctx, -9 + lean, -42 + bounce, 18, 22, character.skin, scale);
  px(ctx, -11 + lean, -38 + bounce, 3, 9, character.hair, scale);
  px(ctx, 8 + lean, -38 + bounce, 3, 9, character.hair, scale);
  faceDetails(ctx, scale, lean, -34 + bounce, eyeColor);

  px(ctx, -3 + lean, -20 + bounce, 6, 5, character.skin, scale);
  px(ctx, -14 + lean, -16 + bounce, 28, 7, outline, scale);
  px(ctx, -12 + lean, -14 + bounce, 24, 18, character.outfit, scale);
  px(ctx, -15 + lean, -13 + bounce, 4, 20, character.accent, scale);
  px(ctx, 11 + lean, -13 + bounce, 4, 20, character.accent, scale);
  px(ctx, -8 + lean, -9 + bounce, 16, 4, character.accent, scale);
  px(ctx, -10 + lean, 3 + bounce, 20, 8, skirt, scale);
  px(ctx, -12 + lean, 11 + bounce, 8, 22, '#20252d', scale);
  px(ctx, 4 + lean, 11 + bounce, 8, 22, '#20252d', scale);
  px(ctx, -13 + lean, 31 + bounce, 10, 4, boot, scale);
  px(ctx, 3 + lean, 31 + bounce, 10, 4, boot, scale);
  px(ctx, -12 + lean, 35 + bounce, 10, 3, character.accent, scale);
  px(ctx, 2 + lean, 35 + bounce, 10, 3, character.accent, scale);

  if (character.name === 'Z-02') {
    px(ctx, -23 + lean, -13 + bounce, 7, 34, glow, scale);
    px(ctx, -26 + lean, -2 + bounce, 13, 13, glow, scale);
    px(ctx, -16 + lean, -18 + bounce, 5, 12, '#4f4230', scale);
  } else if (character.name === 'Z-03') {
    px(ctx, -25 + lean, -6 + bounce, 24, 3, glow, scale);
    px(ctx, 15 + lean, -47 + bounce, 3, 42, character.accent, scale);
    px(ctx, 19 + lean, -41 + bounce, 3, 34, character.accent, scale);
    px(ctx, 22 + lean, -33 + bounce, 3, 24, character.accent, scale);
  } else {
    px(ctx, -24 + lean, -7 + bounce, 34, 3, glow, scale);
    px(ctx, 7 + lean, -10 + bounce, 4, 20, glow, scale);
    px(ctx, -10 + lean, -46 + bounce, 5, 8, character.accent, scale);
  }

  if (options.active) {
    px(ctx, -18 + lean, 42 + bounce, 36, 3, character.accent, scale);
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
  drawSpriteSheetBoss(ctx, x, y, scale, palette, options);
}

export function drawPixelGrunt(
  ctx: CanvasRenderingContext2D,
  gruntId: 'EG-01' | 'EG-02',
  x: number,
  y: number,
  scale: number,
  options: BossDrawOptions,
) {
  drawSpriteSheetGrunt(ctx, gruntId, x, y, scale, {
    beat: options.beat,
    phase: options.phase,
  });
}
