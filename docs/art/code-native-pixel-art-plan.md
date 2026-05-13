# Code-Native Pixel Art Plan

## Decision

Generated images are only for concept sheets and art direction.

Runtime characters and enemies should be built from code-native pixel sprite definitions so they stay consistent, editable, and easy to animate.

## Why

- Image generation is useful for exploring style, but hard to keep consistent across every attack frame.
- Sprite animation needs stable proportions, palette, anchor points, and frame timing.
- Code-defined sprites can be versioned, diffed, reviewed, and tuned with gameplay.
- The prototype can add poses faster than re-generating full sheets.

## Runtime Asset Rule

Use generated/reference sheets for:

- silhouette decisions
- palette direction
- costume/weapon motifs
- pose vocabulary

Do not use generated sheets directly as final runtime sprites.

Use code for:

- character body blocks
- role palettes
- weapons
- support/active scale
- boss body/core blocks
- yellow/red attack warning parts
- animation frame offsets

## Current Implementation

Runtime pixel definitions live in:

- `src/pixelSprites.ts`
- `src/pixelFrameData.ts`

Current exports:

- `pixelCharacters`
- `coreBrutePalette`
- `drawPixelCharacter`
- `drawPixelBoss`
- `z01Palette`
- `z01Frames`
- `drawPixelFrame`

Character data also includes:

- `groggyPower`: per-character Groggy build modifier

Current Groggy direction:

- Z-01: baseline
- Z-02: high Groggy build
- Z-03: lower Groggy build, stronger speed/counter identity later

Current prototype usage:

- `src/main.ts` imports those definitions.
- Party characters are drawn from code-defined pixel blocks.
- Boss is drawn from code-defined pixel blocks.
- Yellow/red warning attacks are still driven by combat logic.
- Z-01 now uses explicit `PixelFrame` data for `frontIdle`, `backIdle`, and `supportIdle`.
- Z-02 and Z-03 still use the procedural block renderer until their sheets are approved.

## Next Step

Expand frame data:

```ts
type PixelPart = [x: number, y: number, width: number, height: number, colorToken: string];

interface PixelFrame {
  parts: PixelPart[];
}
```

Then define:

- `z01.weak.1`
- `z01.weak.2`
- `z01.weak.3`
- `z01.heavy.1`
- `z01.heavy.2`
- `z01.dodge`
- `z01.tagParry`
- equivalent frames for Z-02 and Z-03
- boss yellow/red windup/impact/recovery frames
