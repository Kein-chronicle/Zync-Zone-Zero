# Sprite Production Rules

## Status

This is the single canonical rule document for character sprite concepting, frame generation, slicing, metadata, and game integration.

Do not create separate character design rule documents unless this document is split deliberately.

## Goal

Build character sprites as reusable game assets, not one-off pretty images.

The production flow is:

1. Character concept definition
2. Pose group planning
3. Frame-safe image generation
4. Grid slicing
5. Background removal
6. Frame placement validation
7. Metadata registration
8. Game integration

## Required Additions To The Proposed Flow

The base process is correct, but it needs four extra control points.

## Combat Direction Contract

The main combat camera is fixed.

- The boss is at the top-center of the screen.
- The player party stands at the bottom-center.
- Player characters face upward toward the boss.
- Combat sprites must use a back or three-quarter-back view by default.
- Weak attacks, heavy attacks, dodges, guards, parries, counters, and ultimates must be aimed toward the top-center enemy position.
- Do not generate side-facing attacks unless the pose group explicitly says left/right RPG movement.
- Do not generate attacks that read as swinging toward the camera, toward the bottom of the screen, or sideways away from the boss.
- Facial visibility is allowed only through a three-quarter angle. The action direction still points upward toward the enemy.

### 1. Identity Lock

Before generating pose frames, define a locked character identity:

- character id
- role
- height/proportion
- hair shape
- face features
- outfit layers
- weapon
- palette
- accent color
- silhouette rules

Do not generate action frames from a vague character prompt.

Every pose prompt must reference the same locked identity block.

### 2. Pose Group Split

Do not generate every pose in one huge sheet.

Generate by action group:

- smaller sheets are easier to keep consistent
- pose overflow is easier to catch
- failed groups can be regenerated without losing approved frames
- prompts can focus on one motion family

Default group size:

- `2x2`: safest for complex attack/effect poses
- `4x2`: acceptable for simple loops
- `4x4`: only for concept review or low-risk pose families

### 3. Validation Gate

Before importing into the game, each generated sheet must pass:

- no pose crosses a cell boundary
- no cropped weapon, hair, limb, effect, shadow, or cloth
- no external props unless explicitly required
- no labels, text, frame numbers, UI, watermark, or scenery
- consistent scale
- consistent facing direction
- consistent feet baseline
- clean silhouette at gameplay size
- background removable without damaging the sprite

Failed sheets are not manually patched unless the fix is tiny.

Regenerate the failed pose group with stricter constraints.

### 4. Metadata Contract

Every approved sprite sheet needs metadata:

```ts
interface SpriteFrameMeta {
  id: string;
  sheet: string;
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  durationMs: number;
  tags: string[];
}
```

Do not hardcode frame rectangles inside rendering logic.

Rendering code should consume metadata.

## Character Concept Definition Template

```text
Character ID:
Role:
Combat identity:
Body proportion:
Face:
Hair:
Outfit:
Weapon:
Palette:
Accent color:
Silhouette:
Do not change:
```

Example:

```text
Character ID: Z-01
Role: baseline rhythm attacker
Combat identity: fast energy-blade heroine with clean timing feedback
Body proportion: 2-head-tall chibi anime heroine, young adult, not a child
Face: large blue eyes, visible eyelids, small nose, small confident mouth
Hair: short dark navy bob, side bangs, cyan hair clip
Outfit: cropped black tactical jacket, white inner top, compact shorts, thigh-high stockings, boots, gloves
Weapon: compact cyan-white energy blade or baton
Palette: dark navy, charcoal, white, warm skin, cyan highlights
Accent color: cyan
Silhouette: large rounded hair mass, compact jacket, glowing short weapon
Do not change: hair shape, cyan clip, jacket silhouette, weapon type, palette
```

## Required Pose List

### Core Combat

- combat idle
- combat idle breathing variant
- rhythm ready
- weak attack 1 startup
- weak attack 1 impact
- weak attack 1 recovery
- weak attack 2 startup
- weak attack 2 impact
- weak attack 2 recovery
- weak attack 3 startup
- weak attack 3 impact
- weak attack 3 recovery
- heavy attack startup
- heavy attack charge
- heavy attack impact
- heavy attack recovery
- heavy attack 2 startup
- heavy attack 2 charge
- heavy attack 2 impact
- heavy attack 2 recovery
- heavy attack 3 startup
- heavy attack 3 charge
- heavy attack 3 impact
- heavy attack 3 recovery
- dodge start
- dodge active
- dodge recovery
- guard ready
- guard impact
- tag parry entrance
- tag parry guard
- tag parry impact
- counter attack startup
- counter attack impact
- ultimate cut-in ready
- ultimate startup
- ultimate charge
- ultimate impact
- ultimate recovery
- groggy punish ready
- groggy punish impact
- hit light
- hit heavy
- knockback
- downed
- recover
- victory

### Party And Tag

- support idle
- support attack loop 1
- support attack loop 2
- tag out
- tag in
- assist attack startup
- assist attack impact
- assist return

### RPG Movement

- stand front
- stand back
- stand left
- stand right
- walk front 4 frames
- walk back 4 frames
- walk left 4 frames
- walk right 4 frames
- run front 6 frames
- run back 6 frames
- run left 6 frames
- run right 6 frames
- turn front to side
- turn side to back
- stop skid

### Lobby And Interaction

- relaxed idle
- phone check
- sit down
- seated idle
- stand up
- talk neutral
- talk happy
- talk annoyed
- nod
- shake head
- point
- wave
- item pickup
- inspect object
- door interaction
- terminal interaction

### Menu And Presentation

- character select idle
- character select confirm
- result screen idle
- result screen win
- result screen tired
- upgrade screen pose
- profile portrait loop

## Prompt Strategy

### Concept Sheet Prompt

Use for exploring or approving character identity.

```text
Create a high-detail 2-head-tall chibi anime heroine pixel-art character concept sheet.
Show front, back, side, three-quarter back, weapon held, and facial close-up references.
Use a clean flat background, no labels, no text, no UI.
Focus on stable identity: hair shape, outfit silhouette, weapon, palette, and facial features.
Do not create action frames yet.
```

### Frame-Safe Pose Sheet Prompt

Use the locked identity block, then add:

```text
Create a production-ready pixel-art sprite frame sheet.
Canvas: 1024x1024.
Layout: exactly 2 columns x 2 rows.
Each cell: exactly 512x512 pixels.
Keep at least 64 pixels of empty padding inside every cell.
Each pose must stay completely inside its own cell.
No body part, weapon, hair, cloth, shadow, effect, or motion trail may cross a cell boundary.
No cropped pose.
No overlapping frames.
No labels, text, numbers, UI, watermark, background scenery, or extra objects.
Flat solid chroma-key background: #00ff00.
Do not use #00ff00 anywhere in the character.
Keep scale, feet baseline, facing direction, and weapon design consistent.
The boss/enemy target is fixed at the top-center of the screen.
All combat actions must aim upward toward that top-center enemy target.
Use back view or three-quarter-back view, not front-facing hero poses.
Weapon arcs and body momentum should travel toward the top-center, never sideways out of the cell.
```

Then list only one pose group.

Example:

```text
Frame list:
1. combat idle, three-quarter back view
2. weak attack 1 startup, three-quarter back view, attack aimed upward toward top-center enemy
3. weak attack 1 impact, three-quarter back view, weapon arc travels upward toward top-center enemy
4. weak attack 1 recovery, three-quarter back view, returning from an upward attack
```

### Weak Combo Prompt Group

```text
Frame list:
1. weak attack 1 startup, upward slash toward top-center enemy
2. weak attack 1 impact, upward slash toward top-center enemy
3. weak attack 1 recovery, back-facing stance
4. weak attack 2 startup, different pose, upward cross-slash toward top-center enemy
5. weak attack 2 impact, different silhouette from weak attack 1
6. weak attack 2 recovery
7. weak attack 3 startup, finisher windup, upward direction
8. weak attack 3 impact, largest weak combo hit, upward toward top-center enemy
```

### Heavy Combo Prompt Group

```text
Frame list:
1. heavy attack 1 startup, grounded upward strike toward top-center enemy
2. heavy attack 1 charge
3. heavy attack 1 impact
4. heavy attack 1 recovery
5. heavy attack 2 startup, different silhouette, upward launcher
6. heavy attack 2 charge
7. heavy attack 2 impact
8. heavy attack 2 recovery
```

### Ultimate Prompt Group

```text
Create a production-ready 2x2 ultimate attack sprite sheet.
The character faces upward toward the top-center boss.
The ultimate is a dramatic rhythm-finisher pose with cyan-white energy, but all energy effects stay inside each cell.
No extra enemies, no defeated bodies, no background scenery, no UI, no labels.

Frame list:
1. ultimate cut-in ready, three-quarter-back view, weapon charging upward
2. ultimate startup, body leaning toward top-center enemy
3. ultimate impact, large contained energy burst aimed upward
4. ultimate recovery, back-facing stance
```

### Background Removal Rule

Preferred background for generated production sheets:

- `#00ff00` chroma key

Do not use green in the character if chroma key is used.

If the character needs green accents, use `#ff00ff` as chroma key instead.

After removal, validate:

- transparent corners
- no green/magenta fringe
- no missing hair pixels
- no damaged weapon glow
- no broken effect edges

## File Naming

Use stable lowercase ids.

```text
assets/sprites/characters/z01/concept/z01-concept-v001.png
assets/sprites/characters/z01/sheets/z01-combat-weak-01-v001.png
assets/sprites/characters/z01/sheets/z01-combat-heavy-01-v001.png
assets/sprites/characters/z01/sheets/z01-rpg-walk-v001.png
assets/sprites/characters/z01/meta/z01-combat-weak-01-v001.ts
```

## Slice Rule

The slicer should never guess.

It receives:

- source sheet path
- columns
- rows
- cell width
- cell height
- trim mode
- output frame prefix

Default:

```text
columns: 2
rows: 2
cellWidth: 512
cellHeight: 512
trimMode: keep-cell
anchor: bottom-center
```

Use `keep-cell` first.

Only use trimmed sprites after anchor metadata is verified.

## Game Integration Rule

Each animation state maps to a list of metadata frame ids.

Example:

```ts
const z01Animations = {
  combatIdle: ['z01_combat_idle_001', 'z01_combat_idle_002'],
  weak1: ['z01_weak1_startup', 'z01_weak1_impact', 'z01_weak1_recovery'],
  dodge: ['z01_dodge_start', 'z01_dodge_active', 'z01_dodge_recovery'],
  tagParry: ['z01_tag_in', 'z01_tag_guard', 'z01_tag_impact'],
};
```

Gameplay code triggers animation names, not sheet coordinates.
