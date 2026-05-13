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
- weapon idle state
- weapon visibility rule
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
- consistent weapon visibility across idle/breathing/recovery frames
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
Weapon idle state:
Weapon visibility rule:
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
Weapon idle state: weapon is always held in the right hand, blade/baton lowered diagonally beside the body
Weapon visibility rule: the weapon must remain visible in combat idle, idle breathing, recovery, guard, and ready poses unless the pose explicitly says weapon hidden
Palette: dark navy, charcoal, white, warm skin, cyan highlights
Accent color: cyan
Silhouette: large rounded hair mass, compact jacket, glowing short weapon
Do not change: hair shape, cyan clip, jacket silhouette, weapon type, weapon hand, weapon idle state, palette
```

## Weapon Continuity Contract

The weapon is part of the locked character identity.

- Idle A and Idle B must show the same weapon in the same hand.
- Breathing variants may move the body slightly, but the weapon must not appear, disappear, swap hands, or change type.
- Recovery frames return to the same weapon idle state.
- Guard and parry frames can raise the weapon, but the weapon remains the same object.
- If a character has a sheath, holster, or floating weapon, define that in the identity lock before generating pose sheets.
- Do not allow the generator to invent empty-handed idle frames for a weapon user.
- Do not allow the generator to change a blade into a gun, staff, shield, or magic wand between frames.

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
- evade attack startup
- evade attack impact
- evade attack recovery
- guard ready
- guard impact
- tag parry entrance
- tag parry guard
- tag parry impact
- tag parry attack startup
- tag parry attack impact
- tag parry attack recovery
- tag attack entrance
- tag attack startup
- tag attack impact
- tag attack recovery
- counter attack startup
- counter attack impact
- counter attack recovery
- ultimate cut-in ready
- ultimate startup
- ultimate charge
- ultimate impact
- ultimate recovery
- groggy punish ready
- groggy punish impact
- light hit front
- light hit back
- heavy hit stagger
- launch hit
- knockback start
- knockback airborne
- wall-bounce or hard knockback impact
- downed face-down
- downed face-up
- downed exhausted
- ground recovery start
- ground recovery stand
- recover to combat idle
- victory

### Party And Tag

- support idle
- support attack loop 1
- support attack loop 2
- tag out
- tag in
- tag attack ready
- tag attack follow-through
- tag parry attack ready
- tag parry attack follow-through
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
Keep weapon visibility consistent. Idle, idle breathing, recovery, guard, and ready poses must all show the same weapon in the same hand unless the frame list explicitly says otherwise.
The boss/enemy target is fixed at the top-center of the screen.
All combat actions must aim upward toward that top-center enemy target.
Use back view or three-quarter-back view, not front-facing hero poses.
Weapon arcs and body momentum should travel toward the top-center, never sideways out of the cell.
```

Then list only one pose group.

Example:

```text
Frame list:
1. combat idle, three-quarter back view, weapon visible in locked idle hand
2. weak attack 1 startup, three-quarter back view, attack aimed upward toward top-center enemy
3. weak attack 1 impact, three-quarter back view, weapon arc travels upward toward top-center enemy
4. weak attack 1 recovery, three-quarter back view, returning from an upward attack, weapon still visible
```

### Idle And Ready Prompt Group

Use this group to verify weapon continuity before producing attack sheets.

```text
Frame list:
1. combat idle, back view, weapon visible in the locked idle hand, lowered diagonally beside body
2. combat idle breathing variant, same back view, same weapon, same hand, same weapon type
3. rhythm ready, three-quarter-back view, same weapon raised slightly but still clearly the same object
4. recovery to combat idle, back view, returning to the exact same weapon idle state
```

Reject the sheet if any idle or breathing frame has no weapon, a different weapon, or the weapon in the wrong hand.

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

### Reactive Attack Prompt Group

Use this group for actions that happen after reading or avoiding an enemy attack.

```text
Frame list:
1. evade attack startup, character has just dodged and immediately turns momentum upward toward top-center enemy
2. evade attack impact, fast punish strike aimed upward toward top-center enemy
3. counter attack startup, grounded counter stance, weapon pulled back, back or three-quarter-back view
4. counter attack impact, sharp counter hit aimed upward toward top-center enemy
```

### Hit And Downed Prompt Group

Use this group for damage reactions. Hit frames are not attacks.

Rules:

- Keep the same character identity, outfit, hair, and weapon.
- The weapon may be knocked off-line, but it should not disappear unless the frame explicitly says dropped weapon.
- If the weapon is dropped, keep it inside the same cell and near the character.
- The character should still read as the same person after being hit.
- Do not add the attacking enemy, projectiles, blood, gore, UI, labels, or background scenery.
- Damage direction should imply impact from the top-center boss toward the player.
- Keep every pose fully inside its own cell.

```text
Frame list:
1. light hit front, small recoil from a weak enemy attack, weapon still in locked hand
2. light hit back, shoulder twist recoil, weapon still visible
3. heavy hit stagger, stronger body bend, feet sliding, weapon pulled off-line but not gone
4. launch hit, character lifted or knocked backward, weapon still visible inside cell
```

### Knockdown And Recovery Prompt Group

Use this group for failure, stun, and recovery states.

```text
Frame list:
1. knockback start, character sliding backward from top-center impact, weapon still visible
2. downed face-down or side-down, compact readable silhouette, weapon near hand inside cell
3. downed exhausted, character unable to act, weapon still identifiable near body
4. ground recovery stand, character pushing up and returning toward combat idle weapon state
```

### Tag Attack Prompt Group

Tag attack and tag parry attack are different.

- tag attack: a character switches in and attacks without necessarily blocking an enemy strike
- tag parry attack: a character switches in, parries a yellow enemy attack, then performs a stronger punish

```text
Frame list:
1. tag attack entrance, new character entering from off-screen support position, facing top-center enemy
2. tag attack impact, clean assist strike aimed upward toward top-center enemy
3. tag parry attack guard, new character blocks/parries incoming yellow attack while facing top-center enemy
4. tag parry attack impact, stronger punish strike after the parry, aimed upward toward top-center enemy
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
assets/sprites/effects/slash/z01-slash-weak-01-v001.png
assets/sprites/effects/projectile/magic-orb-blue-v001.png
assets/sprites/effects/impact/boss-hit-cyan-v001.png
assets/sprites/effects/meta/z01-slash-weak-01-v001.ts
```

## Attack Effect Sprite Rules

Character sprites and attack effects are separate assets.

Reason:

- the boss is far from the player
- the character weapon pose does not need to physically reach the boss
- long slashes, beams, projectiles, and impact bursts need independent timing
- effects can be reused across characters and attacks
- effect sheets prevent character frames from overflowing cell boundaries

Effect sheets must not include the character unless the sheet is explicitly a full-screen cut-in.

### Effect Categories

Use these categories first:

- `slash`: sword trails, blade arcs, cross cuts, finisher cuts
- `projectile`: magic orb, bullet, energy blade wave, thrown weapon
- `beam`: laser, magic ray, long thrust trail
- `impact`: boss hit burst, sparks, explosion, crack, hit stop flash
- `parry`: guard ring, parry spark, deflection flash
- `dodge`: afterimage, dust streak, speed line
- `buff`: aura, charge ring, rhythm pulse
- `ultimate`: large contained finisher effect, screen-safe burst

### Effect Direction Contract

Main combat direction is bottom-center to top-center.

Generated effects must travel or point upward toward the boss.

- Slash arcs should open toward the top-center.
- Projectiles should move from bottom-center to top-center.
- Beams should align vertically or diagonally upward.
- Impact effects should be centered near the boss hit point.
- Parry effects should be centered around the player/tag-in character.
- Dodge effects should stay near the player position and suggest lateral or backward movement only when the gameplay action requires it.

Do not generate effects that read as attacking downward toward the player unless the effect is for the boss.

### Effect Sheet Prompt

```text
Create a production-ready pixel-art attack effect sprite sheet.
No character, no enemy, no weapon handle, no body parts, no text, no labels, no UI, no scenery.
Only the visual effect.

Canvas: 1024x1024.
Layout: exactly 2 columns x 2 rows.
Each cell: exactly 512x512 pixels.
Keep the entire effect inside each cell with at least 48 pixels of padding.
Use a flat solid #00ff00 chroma-key background.
Do not use #00ff00 inside the effect.
Keep the effect crisp, high-detail, modern pixel art, not blurry.

Combat direction:
The player is at bottom-center and the boss is at top-center.
The effect must travel or point upward toward the top-center boss.

Frame list:
1. startup glow
2. travel or expansion
3. impact peak
4. fade or recovery
```

### Sword Slash Effect Prompt

```text
Create a 2x2 frame-safe pixel-art sword slash effect sheet.
No character and no enemy.
Only cyan-white blade trail effects and small sparks.
The slash direction travels upward from bottom-center toward top-center.
The arc should imply a fast sword attack reaching a distant boss.
All arcs, sparks, particles, and glow must stay inside each cell.
Use #00ff00 chroma-key background.

Frame list:
1. thin startup trail
2. wide upward slash arc
3. bright impact slash burst
4. fading particles
```

### Magic Projectile Effect Prompt

```text
Create a 2x2 frame-safe pixel-art magic projectile effect sheet.
No character and no enemy.
Only a glowing magic orb and its trail.
The projectile travels upward from bottom-center toward top-center.
Use a readable orb core, outer glow, trailing particles, and impact flash.
All glow and particles must stay inside each cell.
Use #00ff00 chroma-key background.

Frame list:
1. orb forming
2. orb travelling upward
3. orb impact burst
4. fading magic particles
```

### Effect Metadata Contract

```ts
interface EffectFrameMeta {
  id: string;
  sheet: string;
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  durationMs: number;
  blendMode: 'normal' | 'screen' | 'lighter';
  target: 'player' | 'midline' | 'boss';
  tags: string[];
}
```

Default anchors:

- player-centered parry/dodge effects: bottom-center
- midline travel effects: center
- boss impact effects: center

### Effect Integration Rule

Character animation and effect animation are triggered together, but stored separately.

Example:

```ts
const z01Weak1 = {
  characterAnimation: 'z01_weak1',
  effectAnimation: 'z01_slash_weak1',
  effectTarget: 'midline',
  hitFrame: 2,
};
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
  evadeAttack: ['z01_evade_attack_startup', 'z01_evade_attack_impact', 'z01_evade_attack_recovery'],
  counterAttack: ['z01_counter_startup', 'z01_counter_impact', 'z01_counter_recovery'],
  tagAttack: ['z01_tag_attack_entrance', 'z01_tag_attack_impact', 'z01_tag_attack_recovery'],
  tagParryAttack: ['z01_tag_parry_guard', 'z01_tag_parry_attack_impact', 'z01_tag_parry_attack_recovery'],
  lightHit: ['z01_light_hit_front', 'z01_light_hit_back'],
  heavyHit: ['z01_heavy_hit_stagger', 'z01_launch_hit', 'z01_knockback_start'],
  downed: ['z01_downed_side', 'z01_downed_exhausted'],
  recover: ['z01_ground_recovery_start', 'z01_recover_to_combat_idle'],
};
```

Gameplay code triggers animation names, not sheet coordinates.
