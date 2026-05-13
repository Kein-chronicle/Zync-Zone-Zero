# Code-Native Pixel Art Plan

## Decision

Generated images are used for concept sheets and fixed-grid animation frame sheets.

Runtime characters and enemies should not be hand-authored as thousands of pixel rectangles unless the asset is tiny.

The preferred production path is fixed-grid sprite sheets plus code metadata.

## Why

- Image generation is useful for exploring style and pose sheets, but only if the sheet is slicing-safe.
- Sprite animation needs stable proportions, cell bounds, anchor points, and frame timing.
- Hand-written rectangle sprites are useful for prototypes, but too slow for detailed anime characters.
- Code should manage metadata, animation state, frame timing, anchors, hit windows, and gameplay mapping.

## Runtime Asset Rule

Use generated/reference sheets for:

- silhouette decisions
- palette direction
- costume/weapon motifs
- pose vocabulary

Do not use freeform generated sheets directly as final runtime sprites.

Use generated sheets only when they follow the frame-safe slicing rules in:

- `docs/art/frame-safe-sprite-generation-prompt.md`
- `docs/art/sprite-production-rules.md`

Use code for:

- sprite sheet paths
- frame rectangles
- frame anchors
- action state mapping
- attack/parry/dodge timing windows
- role palettes for UI and effects
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

Replace manual `PixelFrame` character construction with sliced sprite-sheet metadata:

```ts
interface SpriteFrame {
  sheet: string;
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  durationMs: number;
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
