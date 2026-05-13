export type PixelEffectType =
  | 'hitSpark'
  | 'slashArc'
  | 'pixelBurst'
  | 'afterimage'
  | 'beatRing'
  | 'tagParryFlash'
  | 'groggyBreak'
  | 'warningPulse';

export interface PixelEffect {
  type: PixelEffectType;
  x: number;
  y: number;
  color: string;
  age: number;
  duration: number;
  intensity: number;
}

export function createPixelEffect(
  type: PixelEffectType,
  x: number,
  y: number,
  color: string,
  intensity = 1,
): PixelEffect {
  const durationByType: Record<PixelEffectType, number> = {
    afterimage: 0.32,
    beatRing: 0.42,
    groggyBreak: 0.9,
    hitSpark: 0.22,
    pixelBurst: 0.42,
    slashArc: 0.28,
    tagParryFlash: 0.5,
    warningPulse: 0.45,
  };

  return {
    age: 0,
    color,
    duration: durationByType[type],
    intensity,
    type,
    x,
    y,
  };
}

export function updatePixelEffects(effects: PixelEffect[], deltaSeconds: number) {
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

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  alpha: number,
) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  ctx.globalAlpha = 1;
}

function drawHitSpark(ctx: CanvasRenderingContext2D, effect: PixelEffect, progress: number, alpha: number) {
  const size = 10 + effect.intensity * 12;
  const spread = progress * (34 + effect.intensity * 20);

  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8;
    const x = effect.x + Math.cos(angle) * spread;
    const y = effect.y + Math.sin(angle) * spread;
    drawBlock(ctx, x - size * 0.2, y - size * 0.2, size * 0.4, size * 0.4, effect.color, alpha);
  }

  drawBlock(ctx, effect.x - size / 2, effect.y - size / 2, size, size, '#f0f3f7', alpha * 0.85);
}

function drawSlashArc(ctx: CanvasRenderingContext2D, effect: PixelEffect, progress: number, alpha: number) {
  const width = 100 + effect.intensity * 42;
  const steps = 9;

  for (let index = 0; index < steps; index += 1) {
    const t = index / (steps - 1);
    const x = effect.x - width / 2 + width * t;
    const y = effect.y + Math.sin(t * Math.PI) * -42 + progress * 18;
    const blockSize = 8 + t * 8;
    drawBlock(ctx, x, y, blockSize, blockSize, effect.color, alpha * (1 - t * 0.45));
  }
}

function drawPixelBurst(ctx: CanvasRenderingContext2D, effect: PixelEffect, progress: number, alpha: number) {
  const count = 14;
  const spread = 18 + progress * (54 + effect.intensity * 20);

  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count;
    const stagger = index % 2 === 0 ? 1 : 0.55;
    const x = effect.x + Math.cos(angle) * spread * stagger;
    const y = effect.y + Math.sin(angle) * spread * stagger;
    drawBlock(ctx, x, y, 5 + effect.intensity * 2, 5 + effect.intensity * 2, effect.color, alpha);
  }
}

function drawAfterimage(ctx: CanvasRenderingContext2D, effect: PixelEffect, progress: number, alpha: number) {
  for (let index = 0; index < 4; index += 1) {
    const offset = index * 14 + progress * 28;
    drawBlock(ctx, effect.x - 28 - offset, effect.y - 78, 26, 80, effect.color, alpha * (0.45 - index * 0.08));
  }
}

function drawBeatRing(ctx: CanvasRenderingContext2D, effect: PixelEffect, progress: number, alpha: number) {
  const size = 24 + progress * (92 + effect.intensity * 20);
  const thickness = 5;

  drawBlock(ctx, effect.x - size / 2, effect.y - size / 2, size, thickness, effect.color, alpha);
  drawBlock(ctx, effect.x - size / 2, effect.y + size / 2, size, thickness, effect.color, alpha);
  drawBlock(ctx, effect.x - size / 2, effect.y - size / 2, thickness, size, effect.color, alpha);
  drawBlock(ctx, effect.x + size / 2, effect.y - size / 2, thickness, size + thickness, effect.color, alpha);
}

function drawTagParryFlash(ctx: CanvasRenderingContext2D, effect: PixelEffect, progress: number, alpha: number) {
  const length = 160 + progress * 90;
  const thickness = 10 + effect.intensity * 4;

  drawBlock(ctx, effect.x - length / 2, effect.y - thickness / 2, length, thickness, effect.color, alpha);
  drawBlock(ctx, effect.x - thickness / 2, effect.y - length / 2, thickness, length, effect.color, alpha);
  drawBlock(ctx, effect.x - 36, effect.y - 36, 72, 72, '#f0f3f7', alpha * 0.55);
}

function drawGroggyBreak(ctx: CanvasRenderingContext2D, effect: PixelEffect, progress: number, alpha: number) {
  drawBeatRing(ctx, effect, progress, alpha);
  drawPixelBurst(ctx, effect, progress, alpha);
  drawBlock(ctx, 0, 0, 1280, 720, effect.color, alpha * 0.08);
}

function drawWarningPulse(ctx: CanvasRenderingContext2D, effect: PixelEffect, progress: number, alpha: number) {
  const width = 260 + progress * 100;
  const height = 110 + progress * 60;

  drawBlock(ctx, effect.x - width / 2, effect.y - height / 2, width, 8, effect.color, alpha * 0.8);
  drawBlock(ctx, effect.x - width / 2, effect.y + height / 2, width, 8, effect.color, alpha * 0.8);
  drawBlock(ctx, effect.x - width / 2, effect.y - height / 2, 8, height, effect.color, alpha * 0.8);
  drawBlock(ctx, effect.x + width / 2, effect.y - height / 2, 8, height, effect.color, alpha * 0.8);
}

export function drawPixelEffects(ctx: CanvasRenderingContext2D, effects: PixelEffect[]) {
  effects.forEach((effect) => {
    const progress = clamp(effect.age / effect.duration, 0, 1);
    const alpha = clamp(1 - progress, 0, 1);

    if (effect.type === 'hitSpark') {
      drawHitSpark(ctx, effect, progress, alpha);
    } else if (effect.type === 'slashArc') {
      drawSlashArc(ctx, effect, progress, alpha);
    } else if (effect.type === 'pixelBurst') {
      drawPixelBurst(ctx, effect, progress, alpha);
    } else if (effect.type === 'afterimage') {
      drawAfterimage(ctx, effect, progress, alpha);
    } else if (effect.type === 'beatRing') {
      drawBeatRing(ctx, effect, progress, alpha);
    } else if (effect.type === 'tagParryFlash') {
      drawTagParryFlash(ctx, effect, progress, alpha);
    } else if (effect.type === 'groggyBreak') {
      drawGroggyBreak(ctx, effect, progress, alpha);
    } else if (effect.type === 'warningPulse') {
      drawWarningPulse(ctx, effect, progress, alpha);
    }
  });
}

