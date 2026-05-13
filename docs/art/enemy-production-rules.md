# Enemy Production Rules

## Status

This is the canonical rule document for enemy concepting, sprite generation, attack readable motion, hit reactions, groggy states, tiering, slicing, metadata, and game integration.

Use this document for enemies only.

Player character production remains in `docs/art/sprite-production-rules.md`.

## Enemy Direction

The combat camera is fixed.

- The enemy stands at the top-center of the screen.
- The player party stands at the bottom-center.
- Enemy sprites usually face downward toward the player.
- Bosses can use a front or three-quarter-front view because the player sees the enemy from the front.
- Enemy attacks must travel downward toward the player position.
- Do not generate enemy attacks that aim sideways, upward, or away from the player unless the move explicitly defines a sweeping arc.
- Enemy telegraph frames must be readable before impact.
- The player must be able to decide between attack continuation, dodge, and tag parry by reading enemy motion, not by reading falling note lanes.

## Visual Direction

The phrase "weird alien" is not enough.

Zync Zone Zero enemies should read as urban anomaly creatures: alien organisms contaminated by rhythm, signal noise, city infrastructure, and combat data.

Use this style direction:

- alien, but not generic tentacle sludge
- strange, but still readable in gameplay
- biological-machine hybrid
- asymmetrical silhouette
- neon organs, exposed signal cores, or rhythm-reactive plates
- city debris or device-like fragments only when part of the body identity
- sharp Zync-style motion language: pulses, glitches, impact rings, hard angular shapes
- no gore, no realistic viscera, no horror-only darkness
- no direct copying of Zenless Zone Zero enemy designs

The enemy must look hostile and memorable from the first frame.

## Tier System

### Grunt

Purpose:

- pressure filler
- teaches one response pattern
- dies quickly
- appears in groups outside boss-only prototype modes

Scale:

- 0.8x to 1.4x player height in RPG scenes
- in combat view, small or medium enemy silhouette

Rules:

- one core silhouette gimmick
- one parryable attack
- one optional unparryable attack
- simple hit reaction
- short groggy state
- no phase change
- no large screen-covering effects

Required sheets:

- concept sheet
- idle/move sheet
- attack sheet
- hit/groggy sheet

### Elite

Purpose:

- mini threat inside stages
- tests action reading and rhythm adaptation
- bridges grunt and boss complexity

Scale:

- 1.5x to 2.5x player height
- can occupy top-center combat focus without covering UI

Rules:

- two or three attack families
- at least one parryable yellow attack
- at least one unparryable red attack
- one delayed rhythm attack
- visible weak point or core
- groggy state must visibly expose that core
- can have armor break or stagger variant

Required sheets:

- concept sheet
- combat idle sheet
- movement or reposition sheet
- parryable attack sheet
- unparryable attack sheet
- heavy/special attack sheet
- hit/armor break sheet
- groggy/exhausted sheet

### Midboss

Purpose:

- stage climax before a major boss
- teaches one mechanical theme
- introduces multi-beat enemy action

Scale:

- 2.5x to 4x player height
- large top-center enemy, but not full-screen

Rules:

- three to five attacks
- one signature parryable attack
- one signature unparryable attack
- one multi-hit rhythm sequence
- one punish window after a whiff or perfect response
- one phase shift at low HP or high groggy
- more dramatic groggy collapse than elites

Required sheets:

- concept sheet
- combat idle and phase idle sheet
- attack family sheets
- phase transition sheet
- hit reaction sheet
- groggy collapse and groggy idle sheet
- recovery from groggy sheet

### Boss

Purpose:

- main combat centerpiece
- large readable enemy performance
- primary source of spectacle and action judgment

Scale:

- 4x to 8x player height depending on camera
- top-center dominant silhouette
- must leave room for player party, beat UI, HP/groggy UI, and telegraph text

Rules:

- has named attack families
- has parryable, unparryable, delayed, feint, area, and phase attacks
- every dangerous attack must have a windup, warning color, impact, and recovery
- groggy state must look like a full system collapse, not just idle with lower head
- phase changes must alter posture, core exposure, armor plates, or limb behavior
- boss must never become unreadable because of excessive effects
- boss attacks may use separate effect sheets for projectiles, shockwaves, claws, signal beams, and ground hazards

Required sheets:

- concept sheet
- boss idle sheet
- phase idle sheet
- parryable attack sheets
- unparryable attack sheets
- special/phase attack sheets
- hit and armor damage sheets
- groggy collapse sheet
- groggy idle sheet
- groggy recovery sheet
- defeat or retreat sheet

## Enemy Identity Lock

Before generating any enemy pose frames, define:

- enemy id
- tier
- combat role
- body type
- silhouette gimmick
- head/face/core
- limbs
- armor or shell
- weak point
- rhythm-reactive element
- palette
- warning colors
- attack families
- groggy behavior
- scale class
- camera framing
- do not change list

Example:

```text
Enemy ID: EB-01 Core Brute
Tier: boss prototype
Combat role: slow heavy pressure boss with readable parry and dodge tests
Body type: bulky alien-machine torso, no normal human anatomy
Silhouette gimmick: rectangular upper body, two heavy pillar arms, floating signal core face
Head/face/core: hot red square eye cluster embedded in a dark metal-organic mask
Limbs: two massive arm pillars, short hidden lower body, no normal hands
Armor or shell: dark graphite plates with teal city-signal seams
Weak point: red central face core and exposed yellow groggy core
Rhythm-reactive element: chest core pulses on beat, armor seams blink before attacks
Palette: charcoal, dark graphite, muted steel, hot red, warning yellow, teal signal accents
Warning colors: yellow for parryable attacks, red for unparryable attacks
Attack families: pillar slam, sweeping arm slash, core thrust, signal roar
Groggy behavior: arms sag, core opens, body hunches, signal seams flicker irregularly
Scale class: boss, 4x player height in combat view
Camera framing: front view, top-center, feet or base hidden behind arena depth line
Do not change: rectangular brute silhouette, red face core, two pillar arms, dark graphite shell, teal seams
```

## Warning Color Contract

Enemy readability is gameplay.

- Parryable attacks use yellow warning language.
- Unparryable attacks use red warning language.
- Neutral idle, recovery, and hit reactions do not use strong yellow/red warning fills unless the state is dangerous.
- Yellow/red warning should appear on the attacking limb, core, or telegraph effect.
- Do not tint the entire enemy yellow or red if it destroys identity readability.
- Parryable attacks should feel like "meet this impact with tag parry."
- Unparryable attacks should feel like "move or get crushed."

## Attack Family Requirements

Every enemy attack has:

- `attackId`
- `guardType`: `parryable` or `unparryable`
- `rangeType`: `melee`, `line`, `arc`, `area`, `projectile`, or `summon`
- `rhythmShape`: `single`, `double`, `delayed`, `syncopated`, or `multiBeat`
- `windupFrames`
- `impactFrames`
- `recoveryFrames`
- `telegraphEffect`
- `impactEffect`
- `playerResponse`
- `groggyReward`

### Parryable Attack

Use when the correct answer can be tag parry or dodge.

Pose requirements:

- clear windup
- yellow charge on the attacking limb/core
- impact frame that visibly collides toward the player
- recovery frame with exposed limb or core

Common examples:

- claw drop
- blade arm chop
- core lance thrust
- shoulder ram
- tail hook
- signal hammer

### Unparryable Attack

Use when the correct answer is dodge or reposition.

Pose requirements:

- clear red charge
- broader body commitment
- impact must look heavier or more dangerous than a parryable hit
- recovery should leave a punish window if the player dodges correctly

Common examples:

- ground eruption
- crushing body slam
- red laser sweep
- area shockwave
- multi-limb grab
- core detonation

### Heavy Or Special Attack

Use for boss and midboss signature moves.

Pose requirements:

- longer windup
- unique silhouette
- separate charge effect
- one or more impact frames
- clear recovery

Special attacks can mix red and yellow sub-beats only if each beat is readable.

## Required Enemy Pose Lists

### Core Enemy Combat

- combat idle A
- combat idle B
- rhythm pulse idle
- alert start
- alert hold
- neutral recovery
- turn or re-aim toward player

### Parryable Attack Group

- parryable windup start
- parryable windup hold
- parryable impact
- parryable recovery

### Unparryable Attack Group

- unparryable windup start
- unparryable windup hold
- unparryable impact
- unparryable recovery

### Heavy/Special Attack Group

- special charge start
- special charge hold
- special release
- special impact
- special recovery

### Hit Reaction Group

- light hit
- heavy hit
- core hit
- armor crack
- knockback or stagger
- recover to idle

### Groggy Group

- groggy threshold flinch
- groggy collapse start
- groggy collapse impact
- groggy idle exhausted
- groggy punish loop
- groggy recovery warning
- groggy recovery stand

### Phase Group

- phase warning
- phase transition start
- armor/core change
- phase roar or pulse
- phase idle A
- phase idle B

### Defeat Group

- defeat stagger
- defeat collapse
- defeat idle/downed
- dissolve, retreat, or core shutdown

## Tier-Based Minimum Pose Counts

| Tier | Minimum combat poses | Minimum attack families | Hit states | Groggy states | Phase states |
| --- | ---: | ---: | ---: | ---: | ---: |
| Grunt | 8 | 1-2 | 2 | 2 | 0 |
| Elite | 16 | 2-3 | 4 | 3 | 0-1 |
| Midboss | 28 | 3-5 | 5 | 5 | 3 |
| Boss | 40+ | 5-8 | 6+ | 7+ | 4+ |

## Sheet Split Rules

Do not generate every enemy state in one huge sheet.

Recommended splits:

- `concept`: one concept image, no frame slicing
- `idle-core`: 2x2 or 4x2
- `attack-parryable`: 2x2 per attack
- `attack-unparryable`: 2x2 per attack
- `attack-special`: 2x2 or 4x2 per special
- `hit`: 2x2 or 4x2
- `groggy`: 4x2
- `phase`: 2x2 or 4x2
- `defeat`: 2x2 or 4x2
- `effect`: separate effect sheets, no enemy body

Use `4x4` only for concept review, quick prototypes, or very simple grunt families.

## Enemy Effect Separation

Enemy body sprites and attack effects are separate assets.

Body sheets may include:

- small core glow
- tiny limb-local warning glow
- minor motion smear attached to the body

Body sheets must not include:

- large shockwaves
- long projectiles
- screen-wide beams
- ground hazard fields
- huge hit sparks
- player impact effects
- UI warning shapes

Separate effect sheets should cover:

- yellow parry flash
- red danger flare
- claw arc
- ground crack
- projectile
- laser beam segment
- shockwave ring
- core burst
- groggy break particles

## Groggy Design Contract

Groggy is a major reward state.

A groggy enemy must visibly lose control.

Required visual changes:

- posture drops or collapses
- core/weak point becomes exposed
- armor plates open, crack, or sag
- limbs hang or twitch
- warning colors stop behaving cleanly
- rhythm pulse becomes irregular
- silhouette becomes lower and less threatening

Do not represent groggy as simply "idle with closed eyes."

Groggy must also create a clear gameplay read:

- player can attack freely
- boss does not start new attacks
- support characters can keep attacking
- groggy bar drains or timer runs
- recovery warning appears before the enemy resumes action

## Hit And Damage Rules

Hit reactions should communicate damage type.

- light hit: small twitch, core flash, tiny armor chip
- heavy hit: torso recoil, limb displacement, armor crack
- core hit: weak point flashes or opens
- armor break: plate detaches or exposes inner signal tissue
- stagger: enemy loses attack posture
- knockback: only for grunts and some elites; bosses usually do not move far

No blood, gore, or realistic organ damage.

Use signal sparks, cracked plates, pixel fragments, and unstable glow.

## Boss Readability Rules

Bosses are large, so they need stronger composition discipline.

- keep the readable face/core in the upper-middle
- keep attacking limbs distinguishable from body mass
- never cover the whole boss in effects during windup
- telegraph before impact, not only during impact
- phase changes must alter silhouette or core state
- attacks should have unique preparation silhouettes
- boss idle must be calmer than attack windups
- groggy must be visually lower and less threatening than idle

## Metadata Contract

Every enemy sprite sheet needs metadata:

```ts
interface EnemyFrameMeta {
  id: string;
  enemyId: string;
  tier: 'grunt' | 'elite' | 'midboss' | 'boss';
  sheet: string;
  columns: number;
  rows: number;
  sourceInset: number;
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  durationMs: number;
  state:
    | 'idle'
    | 'windup'
    | 'impact'
    | 'recovery'
    | 'hit'
    | 'groggy'
    | 'phase'
    | 'defeat';
  guardType?: 'parryable' | 'unparryable' | 'none';
  warningColor?: 'yellow' | 'red' | 'none';
  rangeType?: 'melee' | 'line' | 'arc' | 'area' | 'projectile' | 'summon';
  event?: 'telegraph' | 'active' | 'hit' | 'exposed' | 'recover' | 'none';
  tags: string[];
}
```

Do not hardcode enemy frame rectangles in rendering logic.

## Enemy Concept Prompt Template

```text
Create a production-ready pixel-art enemy concept sheet for Zync Zone Zero.

Enemy ID:
Tier:
Combat role:
Body type:
Silhouette gimmick:
Head/face/core:
Limbs:
Armor or shell:
Weak point:
Rhythm-reactive element:
Palette:
Warning colors:
Attack families:
Groggy behavior:
Scale class:
Camera framing:
Do not change:

Style:
- urban anomaly alien
- biological-machine hybrid
- asymmetrical but readable silhouette
- neon signal core and rhythm-reactive plates
- no gore, no realistic viscera, no copied designs
- pixel art, crisp hard-edged pixels

Show:
- neutral combat idle
- parryable attack windup
- unparryable attack windup
- groggy/exhausted state

No labels, no text, no UI, no watermark, no scenery.
Keep each view separated with generous padding.
```

## Enemy Frame-Safe Pose Prompt Template

```text
Create a production-ready pixel-art enemy sprite frame sheet.

Enemy identity is locked:
<paste enemy identity lock>

Combat camera:
- enemy is at the top-center of the screen
- player party is at the bottom-center
- enemy faces downward toward the player
- attacks travel downward toward the player

Canvas: 1024x1024.
Layout: exactly 2 columns x 2 rows.
Each cell: exactly 512x512 pixels.
Flat solid #00ff00 chroma-key background.
Do not use #00ff00 anywhere in the enemy.

Frame safety:
- keep at least 64 pixels of empty padding inside every cell
- no limb, horn, armor plate, tail, projectile, shockwave, or glow may cross a cell boundary
- no cropped pose
- no overlapping frames
- no labels, text, numbers, arrows, UI, watermark, background scenery, grid lines, or cell borders
- keep scale, anchor, core placement, facing direction, and silhouette consistent

Warning readability:
- yellow warning only for parryable attack frames
- red warning only for unparryable attack frames
- keep warning color localized to attacking limb, core, or telegraph effect

Frame list:
1. <state>
2. <state>
3. <state>
4. <state>
```

## First Prototype Enemy Direction

The current prototype enemy should evolve from `Core Brute` into a boss-grade test target.

Recommended identity:

- `EB-01 Core Brute`
- boss prototype
- bulky alien-machine pressure boss
- two pillar arms
- red face/core
- yellow exposed groggy core
- teal signal seams
- parryable pillar chop
- unparryable red body slam
- core thrust
- signal shockwave
- groggy collapse with arms sagging and core exposed

This enemy is simple enough to validate the combat system, but specific enough to avoid generic alien noise.
