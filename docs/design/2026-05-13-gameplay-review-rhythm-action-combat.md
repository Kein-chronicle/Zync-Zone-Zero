# Gameplay Review: Rhythm Action Combat

## Verdict

The current combat prototype is useful, but it is not enough yet as the main combat content.

It proves the visual direction:

- fixed-camera boss confrontation
- three-character party presence
- rhythm lane and beat feedback
- tag parry direction
- groggy, Zero Field, ultimate cutscenes
- boss plus side enemies

But the core fun is still thin. The player can press on beat, but the combat does not yet create enough interesting choices per beat.

## Current Strengths

- The fixed camera composition is readable and distinct from a normal 3D action game.
- The rhythm lane gives a clear timing anchor without turning the whole game into falling-note gameplay.
- Tag parry is a strong identity hook because it links rhythm timing, character switching, and defense.
- Zync/Zero Field gives the game a larger performance loop beyond simple HP damage.
- Character cutscenes and party layout make the game feel closer to a character action game than a pure rhythm toy.
- BGM is now present, so rhythm judgment can be judged against real music instead of a silent metronome.

## Main Weaknesses

### 1. Beat Choices Are Too Flat

Weak, heavy, dodge, tag, and ultimate exist, but most normal beats still feel like "press an attack on time."

The game needs a reason to choose weak or heavy beyond damage number and animation difference.

Needed:

- weak strings that are safe and build stable rhythm
- heavy strings that hit harder but create commitment risk
- dodge attack routes after successful evasion
- character-specific combo finishers
- beat-position bonuses, such as downbeat heavy bonus or offbeat weak-chain bonus

### 2. Enemy Phrases Are Too Simple

The boss currently has limited attack types and the side enemies are mostly presence and pressure.

For this genre, enemy movement is the note chart. If enemy phrases are shallow, the rhythm-action premise becomes shallow.

Needed:

- authored boss phrase timelines over 4, 8, and 16 beats
- fakeouts and delayed impacts
- multi-hit parryable strings
- red unblockable reposition attacks
- side enemy support attacks that visually sync to the music
- phase changes when boss HP or groggy state changes

### 3. Rhythm And Action Are Not Fully Coupled

The rhythm lane exists, and enemy reads exist, but the player is not forced to reconcile them often enough.

The target experience should be:

1. player is executing an attack rhythm
2. boss begins a visible attack phrase
3. player decides whether to finish the current string, dodge, tag parry, or delay
4. next beat confirms that decision

Needed:

- input queue for the next beat
- attack commitment windows
- cancellable and non-cancellable moves
- warning beat before enemy impact
- reward for choosing the correct response without dropping rhythm

### 4. Character Roles Need Mechanical Identity

The characters look different, but the combat role differences are still mostly numeric.

Needed examples:

- Z-04: precise iaido/samurai role, high perfect-timing reward, strong single-hit groggy burst
- Z-05: fast combo/punch rhythm role, better offbeat chains and hit count scaling
- Z-06: support/control role, wider timing safety, charm or debuff effects

Each character should make the player change how they read the beat.

### 5. Feedback Is Good Visually, But Hit Feel Still Needs Rules

Effects and cutscenes help presentation, but the core hit feedback needs mechanical consequence.

Needed:

- hitstop on perfect heavy, parry, and ultimate trigger
- camera punch or canvas shake tied to grade
- sound effects for perfect, miss, parry, dodge, groggy, Zero Field
- stronger enemy recoil and stagger states
- visible timing result near the action, not only in the HUD

### 6. Side Enemies Need Purpose

Side enemies currently add motion, but their gameplay role is not sharp enough.

Possible roles:

- pressure the support characters
- create optional kill targets for score or Zync gain
- buff the boss if ignored
- become rhythm hazards that change the lane spacing
- trigger team assist moments when defeated

Without a defined role, they become background decoration.

### 7. Scoring And Rank Need To Become The Real Objective

Deadly Assault-style content is not only "survive and reduce HP." It needs score pressure.

Needed:

- final rank: C / B / A / S / Z
- score breakdown: rhythm accuracy, damage, parry count, groggy uptime, side enemy clear, HP remaining
- combo decay rules
- bonus for clean Zero Field conversion
- optional objectives per fight

## What To Add Next

Priority order:

1. Input queue and beat-commit system
2. Character-specific combo routes for Z-04, Z-05, Z-06
3. Authored boss phrase chart with 8-beat and 16-beat patterns
4. Stronger parry/dodge/attack cancel rules
5. Hitstop, shake, and SFX feedback
6. Side enemy purpose rules
7. End-of-fight rank screen
8. Audio latency calibration

## Recommended Next Prototype Slice

Build a "one-minute fun test."

Requirements:

- 125 BPM BGM stays active.
- Boss runs a 16-beat loop with three phrase types:
  - pressure opening
  - parryable multi-hit
  - red unblockable finisher
- Player can queue one command for the next beat.
- Weak/heavy strings have 3-step unique routes per character.
- Tag parry cancels the active character's current route only during a yellow attack warning.
- Perfect parry causes hitstop, big SFX, high groggy gain, and a visible boss stagger.
- Fight ends with a rank screen after 60 seconds or boss defeat.

## Final Assessment

The current prototype is not "done enough" for main combat.

It is enough to prove the direction, but not enough to prove replayable fun.

The next meaningful test is not more art. It is a stricter rhythm-action decision loop: queued beat input, authored enemy phrases, character-specific routes, and rank pressure.
