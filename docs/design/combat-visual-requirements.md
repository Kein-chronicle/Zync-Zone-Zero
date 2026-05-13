# Combat Visual Requirements

## Purpose

Define the character and enemy visual/animation needs for the core combat scene.

The current combat direction is a fixed-camera, three-character rhythm action boss fight:

- One active character stands center foreground.
- Two support characters stay visible and attack automatically.
- Tag input swaps the active character.
- Yellow enemy attacks can be tag-parried.
- Red enemy attacks must be dodged.
- Player offense is built from rhythm-timed weak/heavy chains, not one repeated attack.

## Shared Character Requirements

Each playable character needs a full visible combat kit, even if some moves are prototype-only at first.

### Base States

- Idle combat stance
- Beat bounce / rhythm idle
- Forward pressure step
- Return-to-formation step
- Support position idle
- Support auto-attack loop
- Hit reaction
- Knockback / stagger
- Groggy Break burst stance
- Victory / result pose

### Movement And Defense

- Dodge start
- Dodge active
- Dodge recovery
- Perfect dodge afterimage / counter-ready pose
- Tag-out movement
- Tag-in movement
- Tag parry entrance
- Tag parry impact
- Tag parry recovery into active stance

### Weak Attack Chain

Weak attack should not be one animation repeated. Each character needs at least a three-step chain:

- Weak 1: fast opener
- Weak 2: directional follow-up
- Weak 3: finisher or combo bridge
- Weak loop miss / whiff recovery
- Weak hit spark timing

### Heavy Attack Chain

Heavy attacks should feel more committed and more readable:

- Heavy 1: charged strike
- Heavy 2: heavier follow-up
- Heavy finisher
- Heavy low-energy weak version
- Heavy hit spark timing
- Heavy recovery

### Combo Branches

Prototype combat is moving to the command phrase rules in `docs/rulebooks/combat-command-rulebook.md`.

The visual set must support these first-version commands:

- `T W W H`: Rush
- `W T H H`: Break
- `D T W H`: Evasive Counter
- `T W T H`: Cross Tag Assault
- `W H T U`: Zync Ultimate

Each branch should eventually have a unique pose, timing accent, and hit effect.

## Character-Specific Direction

### Z-04: Precision Lead

Role:

- Precise sword lead.
- Strong Perfect timing reward.
- Best candidate for Break and Ultimate clarity.

Needed unique motions:

- Weak 1: straight slash / jab
- Weak 2: cross slash / angled follow-up
- Weak 3: short spinning finisher
- Heavy 1: two-handed downward strike
- Heavy 2: step-in breaker
- Dodge: compact side step
- Tag parry: clean guard break parry
- Support auto: short ranged slash or projectile pulse

### Z-05: Rush Fighter

Role:

- Fast combo pressure.
- Strong Rush and Cross Tag Assault identity.
- Should feel aggressive and rhythmic.

Needed unique motions:

- Weak 1: heavy shoulder-in strike
- Weak 2: low sweep
- Weak 3: rising hit
- Heavy 1: charged overhead
- Heavy 2: ground-crack slam
- Dodge: shorter but heavier step
- Tag parry: shield-like intercept or weapon block
- Support auto: heavy delayed hit on every other beat

### Z-06: Evasive Support

Role:

- Evasive support and counter specialist.
- Strong Evasive Counter identity.
- Good candidate for safer timing and utility effects.

Needed unique motions:

- Weak 1: fast double tap
- Weak 2: diagonal cut / quick shot
- Weak 3: dash-through strike
- Heavy 1: charged piercing hit
- Heavy 2: rapid multi-hit burst
- Dodge: long afterimage step
- Tag parry: quick intercept slash
- Support auto: rapid light shots or blade arcs

## Enemy Requirements

The boss must be readable from a fixed camera. Its attacks are not falling notes; the attack animation itself is the cue.

### Base States

- Neutral idle
- Beat-synced idle pulse
- Phase transition
- Stagger
- Groggy start
- Groggy loop
- Groggy recovery
- Death / clear state

### Yellow: Parryable Attacks

Yellow attacks should invite tag parry. They need clear windup and a strong impact moment.

Initial list:

- Horizontal slash
- Diagonal slash
- Straight thrust
- Double claw strike
- Delayed overhead
- Tail sweep
- Shoulder charge
- Ground punch with parryable shock front
- Weapon feint into parryable strike
- Jump-in strike

Required animation beats:

- Windup color shift to yellow
- Weapon/limb trail in yellow
- Impact frame
- Brief recovery after successful parry
- Strong recoil if tag parried

### Red: Unparryable Attacks

Red attacks force dodge or positional response. They should look heavier, more dangerous, and less blockable.

Initial list:

- Heavy slam
- Wide area sweep
- Grab attempt
- Laser line
- Explosive ground marker
- Delayed stomp
- Multi-hit red barrage
- Charging body crash
- Falling debris call
- Phase-specific ultimate hit

Required animation beats:

- Windup color shift to red
- Large body commitment
- Clear danger shape
- Impact frame
- Recovery window if dodged

### Mixed Pattern Ideas

For watching enjoyment, bosses should combine attack categories rather than alternate mechanically.

- Yellow -> Yellow -> Red finisher
- Red fakeout -> Yellow punishable strike
- Yellow delayed strike that tests early tag
- Red area attack followed by yellow single hit
- Yellow strike during player combo pressure
- Red slam after Groggy recovery
- Silence attack with reduced beat cue
- Off-beat boss hit that breaks simple metronome play

## Hit Effect Requirements

### Player Hits

- Weak hit spark
- Heavy hit spark
- Combo finisher burst
- Counter hit flash
- Tag counter flash
- Groggy Break damage effect

### Defensive Effects

- Dodge afterimage
- Perfect dodge flash
- Tag parry impact flash
- Unparryable warning flash
- Player hit flash

### Boss Effects

- Yellow attack trail
- Red attack trail
- Groggy crack effect
- Break burst
- Boss phase aura

## Camera And Presentation Requirements

Even with a fixed playable view, presentation can move:

- Small impact zoom on heavy hit
- Small shake on red boss impact
- Tag parry camera snap
- Groggy Break zoom-in
- Boss phase transition zoom
- Result screen pose lineup

Do not break player orientation. Camera motion should emphasize impact, not create navigation.

## Prototype Priority

### Priority 1

- Three visible character positions.
- Unique active/support colors.
- Yellow parryable boss attack.
- Red unparryable boss attack.
- Tag parry entrance.
- Basic weak/heavy/dodge/tag counter feedback.

### Priority 2

- Three-step weak chains per character.
- Two-step heavy chains per character.
- Support auto-attack identity per character.
- Additional yellow/red boss attacks.

### Priority 3

- Boss phase changes.
- Groggy Break special presentation.
- Per-character unique animation timings.
- Result pose lineup.
