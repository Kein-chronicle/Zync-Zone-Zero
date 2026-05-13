interface CityStageOptions {
  beat: number;
  warningColor?: string;
}

function block(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
  ctx.globalAlpha = 1;
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  lightColor: string,
  beat: number,
) {
  block(ctx, x, y - height, width, height, color);

  const pulse = Math.sin(beat * Math.PI * 2) > 0.72;
  const windowSize = 6;
  const gap = 12;

  for (let wx = x + 10; wx < x + width - 8; wx += gap) {
    for (let wy = y - height + 16; wy < y - 12; wy += gap + 4) {
      const lit = (Math.floor(wx + wy) % 3 === 0) || pulse;
      block(ctx, wx, wy, windowSize, windowSize, lit ? lightColor : '#1b2028', lit ? 0.85 : 0.65);
    }
  }
}

export function drawPixelCityStage(ctx: CanvasRenderingContext2D, width: number, height: number, options: CityStageOptions) {
  const beatPulse = 0.35 + Math.max(0, Math.sin(options.beat * Math.PI * 2)) * 0.25;
  const warningColor = options.warningColor ?? '#0fb9b1';

  block(ctx, 0, 0, width, height, '#0d0f14');
  block(ctx, 0, 0, width, 260, '#10151f');
  block(ctx, 0, 260, width, 80, '#111820');

  drawBuilding(ctx, 30, 300, 110, 190, '#171d27', '#2e5364', options.beat);
  drawBuilding(ctx, 158, 300, 74, 150, '#151a23', '#3a4254', options.beat + 0.2);
  drawBuilding(ctx, 250, 300, 132, 220, '#1a202a', '#2a6a73', options.beat + 0.4);
  drawBuilding(ctx, 900, 300, 115, 205, '#181e27', '#563a72', options.beat + 0.1);
  drawBuilding(ctx, 1040, 300, 82, 160, '#151b24', '#3b596b', options.beat + 0.3);
  drawBuilding(ctx, 1145, 300, 105, 215, '#1b202b', '#6a4659', options.beat + 0.5);

  block(ctx, 0, 306, width, 16, '#202935');
  block(ctx, 0, 322, width, 398, '#12161d');

  for (let index = 0; index < 10; index += 1) {
    const y = 352 + index * 34;
    const lineWidth = 1 + index * 0.45;
    block(ctx, 0, y, width, lineWidth, '#242d39', 0.75);
  }

  for (let index = 0; index < 9; index += 1) {
    const offset = (index - 4) * 92;
    block(ctx, width / 2 + offset, 322, 2, 398, '#202934', 0.7);
  }

  block(ctx, 390, 286, 500, 6, warningColor, beatPulse);
  block(ctx, 420, 330, 440, 4, warningColor, 0.25 + beatPulse * 0.35);
  block(ctx, 0, 318, width, 3, '#0fb9b1', 0.25);

  block(ctx, 92, 250, 78, 18, '#0fb9b1', 0.35 + beatPulse);
  block(ctx, 1006, 248, 96, 18, '#ff5a6e', 0.28 + beatPulse * 0.7);
  block(ctx, 560, 82, 160, 5, '#f5c84c', 0.2 + beatPulse * 0.35);
}

