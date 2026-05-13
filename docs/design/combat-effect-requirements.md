# Combat Effect Requirements

## Purpose

Define visual and feedback effects for Zync Zone Zero's rhythm action combat.

Goal:

- Make every input feel clear.
- Make correct rhythm timing feel rewarding.
- Make attacks, tag parries, dodges, and Groggy Break visually exciting.
- Keep effects readable in a fixed-camera boss fight.

## Core Rule

Effects are not decoration. Effects communicate:

- timing quality
- hit strength
- enemy attack type
- successful defense
- combo state
- character identity
- boss vulnerability

If an effect looks good but hides the next input, it fails.

## Impact Size Rule

Major combat confirmations must be large enough to read without staring at the HUD.

- Perfect heavy, tag parry, command phrase resolution, and phrase execution pulses should produce effects at least character-sized.
- Cross Tag Assault, Break, Zync Ultimate, and tag parry effects may exceed character size.
- Small sparks are allowed only for weak normal hits, support hits, or background side fights.
- Command phrase feedback must feel like a team action, not a small hit marker.

## Timing Feedback Effects

### Miss

Purpose:

- Tell the player the timing failed without over-punishing visually.

Effect direction:

- Small grey static burst.
- Short dull impact sound later.
- Combo line snaps.
- No screen shake.

Visual elements:

- Grey pixel fragments.
- Small broken ring.
- `MISS` text pulse.

### Bad

Purpose:

- Show that input was accepted but weak.

Effect direction:

- Small dim hit spark.
- Weak trail.
- Low score pop.

Visual elements:

- Desaturated blue/grey spark.
- Short 3-frame trail.
- Small hit pause, nearly invisible.

### Good

Purpose:

- Baseline satisfying input.

Effect direction:

- Clean hit spark.
- Beat ring pulse.
- Normal score pop.

Visual elements:

- Character accent-colored slash.
- Small radial burst.
- 1-frame white core flash.

### Perfect

Purpose:

- Make precise rhythm feel addictive.

Effect direction:

- Bright accent burst.
- Beat ring lock-in flash.
- Stronger hit spark.
- Brief time snap / micro hit-stop.

Visual elements:

- Diamond-shaped pixel burst.
- Concentric rhythm ring.
- Character accent slash trail.
- `PERFECT` text with color-coded outline.

### Critical Beat

Future higher-grade input for special moments.

Effect direction:

- Larger screen-center sync flash.
- Audio-visual beat drop.
- Bigger score spike.

Visual elements:

- Full beat ring expansion.
- Short chromatic split.
- Character-specific symbol flash.

## Player Attack Effects

### Weak 1

- Small forward slash.
- Short accent trail.
- Low screen shake: none.
- Purpose: fast rhythm confirmation.

### Weak 2

- Cross-angle slash.
- Slightly wider trail.
- Add secondary sparkle if Good or better.

### Weak 3

- Finisher-like slash burst.
- Larger arc.
- Small hit-stop on Good/Perfect.
- Combo continuation glow.

### Heavy 1

- Charged impact spark.
- Larger weapon trail.
- 2-frame hit-stop.
- Stronger bass hit later.

### Heavy 2

- Thick impact block.
- Ground crack or shock pixel line.
- Small camera bump.
- Extra Groggy particles.

### Heavy Finisher

- Large character-color burst.
- Boss core flicker.
- Combo name flash.
- Short screen shake.

## Combo Effects

### Launch Cut

Trigger:

- Weak -> Heavy

Effect:

- Upward slash arc.
- Boss lift/flicker hint.
- Yellow-white impact pixels.

### Rush Finish

Trigger:

- Weak -> Weak -> Heavy

Effect:

- Three stacked slash trails.
- Final burst on third hit.
- Combo text snaps in from side.

### Evade Counter

Trigger:

- Dodge -> Weak

Effect:

- Afterimage dodge trail.
- Counter slash from off-center.
- Teal-white spark.

### Tag Counter

Trigger:

- Tag -> Weak

Effect:

- New active character color flash.
- Cross-in slash.
- Support characters briefly pulse.

### Breaker

Trigger:

- Heavy -> Heavy

Effect:

- Chunky square impact.
- Boss armor crack pixels.
- Large Groggy gain pop.

## Tag Parry Effects

Tag parry must be one of the flashiest common actions.

### Startup

- Current active character slides out.
- Incoming character streaks in from side.
- Character accent trail.
- Short anticipation ring.

### Parry Impact

- Yellow enemy attack collides with incoming character.
- Big yellow-white impact cross.
- Boss recoils.
- Groggy meter jumps with a burst.
- 3 to 5 frame hit-stop.
- Strong `TAG PARRY` text pop.

### Recovery

- Incoming character lands center.
- Previous active character moves to support slot.
- Support characters resume auto attack.
- Beat ring re-locks.

### Failed Tag On Red Attack

- Red warning shatter.
- `TAG BLOCKED` feedback.
- No Groggy reward.
- Player must learn red means dodge only.

## Dodge Effects

### Normal Dodge

- Small side afterimage.
- Low opacity silhouette trail.
- No large flash.

### Perfect Dodge

- Teal afterimage line.
- Enemy attack whiffs through ghost silhouette.
- Counter window glow appears on active character.
- Beat ring pulses.

### Dodge Against Red Attack

- Red attack passes behind player.
- Stronger whiff streak.
- Counter window opens.
- Small screen lateral shake.

## Groggy Effects

### Groggy Build

- Boss core accumulates cracks.
- Small yellow fragments near core.
- Meter pulses at 70%+.

### Groggy Break Trigger

- Boss core bursts open.
- Large yellow/white crack flash.
- Short camera zoom.
- Beat ring expands from boss to player.
- All three characters pulse together.

### Groggy Break Loop

- Boss flickers vulnerable.
- Player hit sparks become larger.
- Background contrast slightly drops so damage effects read.
- Combo text gains brighter outline.

### Groggy Recovery

- Boss core seals.
- Warning flash before enemy can attack again.
- Combat returns to normal.

## Boss Warning Effects

### Yellow Attack: Parryable

- Yellow windup trail on attacking limb.
- Yellow core blink.
- Thin timing ring near boss.
- Impact frame has yellow-white flash.

### Red Attack: Unparryable

- Red windup glow.
- Larger body commitment.
- Red danger silhouette.
- Impact frame has red shock or area burst.

### Mixed Pattern Warning

- Red fakeout should show red first, then snap yellow if it becomes parryable.
- Delayed yellow attack should pulse slower.
- Off-beat hit should distort beat ring slightly.

## Character Identity Effects

### Z-01

Effect identity:

- Clean cyan-white slashes.
- Balanced diamond sparks.
- Crisp straight lines.

### Z-02

Effect identity:

- Yellow/gold heavy blocks.
- Square impact chunks.
- Ground-crack pixels.

### Z-03

Effect identity:

- Teal afterimages.
- Thin speed lines.
- Multi-hit streaks.

## Screen And Camera Effects

Use carefully.

Allowed:

- Micro hit-stop on heavy/perfect/tag parry.
- Small camera bump on heavy impact.
- Short zoom on Groggy Break.
- Lateral shake on red boss impact.
- Beat-synced ring pulse.

Avoid:

- Long screen shake.
- Full-screen flashes every hit.
- Effects that hide yellow/red warning state.
- Effects that obscure active character location.

## Code-Native Effect System Direction

Effects should be code-native first, matching the sprite direction.

Suggested primitives:

- pixel burst
- slash arc made of stepped rectangles
- expanding ring
- afterimage silhouette
- screen flash overlay
- camera shake impulse
- hit-stop timer
- floating text
- boss core crack overlay

Current implementation file:

- `src/pixelEffects.ts`

Current runtime hooks:

- weak/heavy attacks spawn slash and hit-spark effects
- dodge spawns afterimage effects
- successful tag parry spawns tag-parry flash and burst effects
- failed tag on red attack spawns warning pulse
- Groggy Break spawns a large break effect
- timing feedback spawns beat-ring or miss burst feedback

Suggested data shape:

```ts
type EffectType =
  | 'hitSpark'
  | 'slashArc'
  | 'pixelBurst'
  | 'afterimage'
  | 'beatRing'
  | 'tagParryFlash'
  | 'groggyBreak'
  | 'warningPulse';
```

## Priority

### Priority 1

- Timing grade feedback: Miss / Bad / Good / Perfect.
- Weak hit spark.
- Heavy hit spark.
- Dodge afterimage.
- Tag parry impact.
- Yellow/red boss warning glow.

### Priority 2

- Combo-specific effects.
- Groggy Break trigger.
- Boss core crack overlay.
- Character-specific effect colors.

### Priority 3

- Critical Beat.
- Advanced camera snap.
- Multi-stage boss warning distortion.
- Result screen effect burst.
