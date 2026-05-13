export type PixelColorToken =
  | 'accent'
  | 'belt'
  | 'boot'
  | 'cloth'
  | 'hair'
  | 'highlight'
  | 'metal'
  | 'outline'
  | 'skin'
  | 'stocking'
  | 'weapon'
  | 'white';

export type PixelPart = [x: number, y: number, width: number, height: number, color: PixelColorToken];

export interface PixelFrame {
  parts: PixelPart[];
}

export type PixelPalette = Record<PixelColorToken, string>;

export const z01Palette: PixelPalette = {
  accent: '#72e9ff',
  belt: '#c89055',
  boot: '#111722',
  cloth: '#222a36',
  hair: '#1b1f2b',
  highlight: '#a8f6ff',
  metal: '#b7c2cf',
  outline: '#090d14',
  skin: '#f0c1a2',
  stocking: '#171923',
  weapon: '#d9f8ff',
  white: '#f3e8df',
};

export const z01Frames = {
  frontIdle: {
    parts: [
      [-11, -64, 22, 5, 'outline'],
      [-13, -60, 26, 19, 'hair'],
      [-16, -53, 5, 22, 'hair'],
      [11, -53, 5, 22, 'hair'],
      [-9, -55, 18, 22, 'skin'],
      [-10, -56, 20, 7, 'hair'],
      [-8, -48, 4, 1, 'outline'],
      [4, -48, 4, 1, 'outline'],
      [-7, -47, 3, 3, 'white'],
      [5, -47, 3, 3, 'white'],
      [-6, -46, 2, 2, 'accent'],
      [5, -46, 2, 2, 'accent'],
      [0, -43, 1, 2, 'belt'],
      [-2, -39, 5, 1, 'belt'],
      [-15, -34, 30, 6, 'outline'],
      [-13, -32, 26, 16, 'cloth'],
      [-8, -31, 16, 8, 'white'],
      [-15, -26, 4, 20, 'cloth'],
      [11, -26, 4, 20, 'cloth'],
      [-17, -12, 4, 10, 'skin'],
      [13, -12, 4, 10, 'skin'],
      [-18, -2, 5, 5, 'boot'],
      [13, -2, 5, 5, 'boot'],
      [-12, -19, 24, 4, 'belt'],
      [-10, -14, 20, 12, 'cloth'],
      [-12, -2, 8, 25, 'stocking'],
      [4, -2, 8, 25, 'skin'],
      [3, 8, 9, 4, 'stocking'],
      [-13, 22, 10, 5, 'boot'],
      [3, 22, 10, 5, 'boot'],
      [-12, 27, 9, 3, 'accent'],
      [4, 27, 9, 3, 'accent'],
      [-25, -15, 4, 50, 'weapon'],
      [-24, -16, 2, 50, 'accent'],
      [17, -22, 4, 28, 'metal'],
      [18, 5, 4, 18, 'weapon'],
      [7, -58, 4, 4, 'accent'],
      [9, -61, 3, 3, 'highlight'],
    ],
  },
  backIdle: {
    parts: [
      [-12, -63, 24, 6, 'outline'],
      [-14, -58, 28, 26, 'hair'],
      [-17, -50, 5, 22, 'hair'],
      [12, -50, 5, 22, 'hair'],
      [-9, -34, 18, 5, 'skin'],
      [-16, -33, 32, 7, 'outline'],
      [-14, -31, 28, 22, 'cloth'],
      [-4, -28, 8, 16, 'accent'],
      [-2, -27, 4, 14, 'highlight'],
      [-16, -24, 5, 20, 'cloth'],
      [11, -24, 5, 20, 'cloth'],
      [-18, -6, 5, 7, 'boot'],
      [13, -6, 5, 7, 'boot'],
      [-13, -10, 26, 7, 'belt'],
      [-12, -3, 24, 13, 'cloth'],
      [-13, 9, 9, 25, 'stocking'],
      [4, 9, 9, 25, 'skin'],
      [3, 19, 10, 5, 'stocking'],
      [-14, 34, 11, 5, 'boot'],
      [3, 34, 11, 5, 'boot'],
      [-13, 39, 10, 3, 'accent'],
      [4, 39, 10, 3, 'accent'],
      [18, -22, 4, 56, 'weapon'],
      [19, -23, 2, 56, 'accent'],
      [-23, -18, 4, 28, 'metal'],
      [7, -57, 4, 4, 'accent'],
    ],
  },
  supportIdle: {
    parts: [
      [-11, -62, 22, 6, 'outline'],
      [-13, -57, 26, 22, 'hair'],
      [-9, -53, 18, 18, 'skin'],
      [-8, -47, 3, 1, 'outline'],
      [5, -47, 3, 1, 'outline'],
      [-7, -46, 3, 3, 'white'],
      [5, -46, 3, 3, 'white'],
      [-6, -45, 2, 2, 'accent'],
      [5, -45, 2, 2, 'accent'],
      [-14, -32, 28, 19, 'cloth'],
      [-7, -30, 14, 7, 'white'],
      [-15, -18, 30, 4, 'belt'],
      [-10, -13, 20, 11, 'cloth'],
      [-12, -2, 8, 24, 'stocking'],
      [4, -2, 8, 24, 'skin'],
      [-13, 21, 10, 5, 'boot'],
      [3, 21, 10, 5, 'boot'],
      [16, -23, 4, 48, 'weapon'],
      [17, -24, 2, 48, 'accent'],
    ],
  },
} satisfies Record<string, PixelFrame>;

export function drawPixelFrame(
  ctx: CanvasRenderingContext2D,
  frame: PixelFrame,
  palette: PixelPalette,
  x: number,
  y: number,
  scale: number,
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.imageSmoothingEnabled = false;

  frame.parts.forEach(([partX, partY, width, height, token]) => {
    ctx.fillStyle = palette[token];
    ctx.fillRect(
      Math.round(partX * scale),
      Math.round(partY * scale),
      Math.round(width * scale),
      Math.round(height * scale),
    );
  });

  ctx.restore();
}

