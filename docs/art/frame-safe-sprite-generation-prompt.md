# Frame-Safe Sprite Generation Prompt

## Decision

Use pose-by-pose sprite frames instead of hand-converting a concept sheet into code blocks.

The generated sheet must be treated as production input for slicing, not as a pretty illustration sheet.

Use this document together with the full sprite pipeline rules:

- `docs/art/sprite-production-rules.md`

## Problem To Prevent

Generated attack poses often extend across the X axis into neighboring cells.

When the sheet is sliced later, weapons, hair, limbs, trails, or effects can be cut off.

The prompt must force:

- fixed cell size
- visible or transparent cell gutters
- one complete pose per cell
- no body part, weapon, effect, shadow, hair, or cloth crossing a cell boundary
- consistent anchor point
- consistent character scale
- safe internal padding

## Recommended Sheet Spec

- Canvas: `2048x2048`
- Grid: `4 columns x 4 rows`
- Cell size: `512x512`
- Safe drawing area per cell: `416x416`
- Internal padding: at least `48px` on every side
- Background: transparent or flat neutral checker-safe color
- Character anchor: feet centered on the same baseline in every cell
- Character direction: three-quarter back view for combat-facing frames
- Motion trails: allowed only if fully contained inside the same cell
- Oversized attacks: scale down or compress pose to stay inside cell, never cross gutters

## Master Prompt Template

```text
Create a production-ready pixel-art sprite frame sheet for a playable anime-style heroine in a rhythm action combat game.

STRICT TECHNICAL FORMAT:
- Canvas size: 2048x2048.
- Layout: exactly 4 columns and 4 rows, 16 cells total.
- Each cell is exactly 512x512 pixels.
- Each pose must stay completely inside its own 512x512 cell.
- Keep at least 48 pixels of empty padding inside every cell on all sides.
- Do not let any body part, hair, weapon, cloth, shadow, motion trail, energy effect, or silhouette cross into another cell.
- Do not crop any pose.
- Do not overlap poses.
- Do not place decorative labels, text, frame numbers, arrows, UI, watermarks, or background scenery.
- Use a transparent background if possible. If transparency is not possible, use a flat solid dark neutral background.
- Keep the character scale consistent across all cells.
- Keep the feet anchored to the same baseline in every cell.
- Center the character inside each cell, but preserve the action silhouette.
- If a weapon swing or attack motion is too wide, shrink or curve the pose so it remains fully inside the safe area.

CHARACTER DESIGN:
- High-detail pixel-art anime heroine.
- Cute but combat-ready design.
- Large readable eyes, visible eyelids, small nose, clear mouth pixels.
- Clean silhouette, readable hair shape, outfit layers, gloves, boots, and weapon details.
- Use crisp pixel edges, limited palette, no painterly blur.
- Pixel density should be high enough for facial features to read.
- Style target: premium modern anime pixel sprite, not retro 8-bit.

CAMERA AND VIEW:
- Combat game sprite sheet.
- Main orientation is three-quarter back view, facing upward toward a large enemy.
- Character should feel like she is standing in front of the camera with her back mostly visible.
- For attack frames, preserve the same facing direction.

FRAME LIST, LEFT TO RIGHT, TOP TO BOTTOM:
1. idle back stance
2. idle breathing variant
3. weak attack 1 startup
4. weak attack 1 impact
5. weak attack 2 startup
6. weak attack 2 impact
7. weak attack 3 startup
8. weak attack 3 impact
9. heavy attack startup
10. heavy attack impact
11. dodge start
12. dodge recovery
13. tag parry entrance
14. tag parry impact
15. groggy punish ready
16. victory or reset stance

IMPORTANT:
This is not a composition illustration. This is a slicing-safe game sprite sheet.
Every frame must be isolated, fully visible, centered, consistently scaled, and safely contained inside its own cell.
```

## Negative Prompt Add-on

```text
no overlapping frames, no cropped limbs, no cropped weapon, no cut off hair, no cut off effects, no pose crossing cell boundary, no merged silhouettes, no labels, no text, no UI, no background scene, no perspective grid, no motion trail outside the cell, no painterly rendering, no blurry edges, no low-detail chibi, no 8-bit style
```

## Safer Variant

When a full 16-frame sheet fails, generate smaller sheets:

- `2x2` sheet for one action at a time
- same `512x512` cells
- same `48px` padding rule
- one action family per sheet

Example:

```text
Create a 2x2 production pixel-art sprite sheet for only weak attack combo 1.
Canvas 1024x1024, 4 cells, each cell 512x512.
Frames: idle back stance, weak attack 1 startup, weak attack 1 impact, weak attack 1 recovery.
All slicing-safe rules still apply.
```

## Pipeline Rule

Prefer this order:

1. Generate character concept sheet.
2. Approve the character design.
3. Generate small frame-safe pose sheets from the approved design.
4. Slice by fixed grid.
5. Store frame metadata in code.
6. Use runtime animation states to play sliced frames.

Do not manually convert every pixel block into source code unless the asset is extremely small or symbolic.
