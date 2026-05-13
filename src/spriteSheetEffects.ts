export type SpriteSheetEffectType = 'impactGold' | 'projectile' | 'slash';

export interface SpriteSheetEffect {
  type: SpriteSheetEffectType;
  x: number;
  y: number;
  age: number;
  duration: number;
  scale: number;
  alpha: number;
}

const slashSheet = new Image();
slashSheet.src = '/assets/sprites/effects/slash/z01-slash-effect-v1.png';

const projectileSheet = new Image();
projectileSheet.src = '/assets/sprites/effects/projectile/energy-projectile-effect-v1.png';

const impactGoldSheet = new Image();
impactGoldSheet.src = '/assets/sprites/effects/impact/z02-impact-effect-v1.png';

function getSheet(type: SpriteSheetEffectType) {
  if (type === 'slash') {
    return slashSheet;
  }

  if (type === 'impactGold') {
    return impactGoldSheet;
  }

  return projectileSheet;
}

export function createSpriteSheetEffect(
  type: SpriteSheetEffectType,
  x: number,
  y: number,
  scale: number,
  duration: number,
  alpha = 1,
): SpriteSheetEffect {
  return {
    age: 0,
    alpha,
    duration,
    scale,
    type,
    x,
    y,
  };
}

export function updateSpriteSheetEffects(effects: SpriteSheetEffect[], deltaSeconds: number) {
  for (let index = effects.length - 1; index >= 0; index -= 1) {
    effects[index].age += deltaSeconds;

    if (effects[index].age >= effects[index].duration) {
      effects.splice(index, 1);
    }
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function drawSpriteSheetEffects(ctx: CanvasRenderingContext2D, effects: SpriteSheetEffect[]) {
  effects.forEach((effect) => {
    const sheet = getSheet(effect.type);

    if (!sheet.complete || sheet.naturalWidth === 0) {
      return;
    }

    const progress = clamp(effect.age / effect.duration, 0, 0.999);
    const frameIndex = Math.min(Math.floor(progress * 4), 3);
    const column = frameIndex % 2;
    const row = Math.floor(frameIndex / 2);
    const sourceCellWidth = sheet.naturalWidth / 2;
    const sourceCellHeight = sheet.naturalHeight / 2;
    const sourceInset = 18;
    const drawWidth = 512 * effect.scale;
    const drawHeight = 512 * effect.scale;
    const fade = clamp(1 - progress * 0.35, 0, 1);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = effect.alpha * fade;
    ctx.drawImage(
      sheet,
      column * sourceCellWidth + sourceInset,
      row * sourceCellHeight + sourceInset,
      sourceCellWidth - sourceInset * 2,
      sourceCellHeight - sourceInset * 2,
      Math.round(effect.x - drawWidth / 2),
      Math.round(effect.y - drawHeight / 2),
      Math.round(drawWidth),
      Math.round(drawHeight),
    );
    ctx.restore();
  });
}
