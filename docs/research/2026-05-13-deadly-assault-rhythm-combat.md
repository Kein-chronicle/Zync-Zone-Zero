# ZZZ Deadly Assault Reference and Rhythm Combat Direction

Date: 2026-05-13

## Scope

This note studies Zenless Zone Zero's Deadly Assault / 위험한 강습전 as a combat-mode reference, then evaluates how to reinterpret its structure for Zync Zone Zero as a fixed-camera rhythm action boss combat game.

This is a design reference, not a plan to copy names, assets, UI, characters, animations, or exact scoring tables.

## Source Notes

- ZZZ Wiki: Deadly Assault is a permanent high-risk combat mode introduced in Version 1.4, with rotating boss challenges, three high-risk enemies per session, visible weaknesses/resistances, lineup lock/reset, and selectable buffs.
  - https://zenless-zone-zero.fandom.com/wiki/Deadly_Assault
- Game8: Deadly Assault is an endgame mode with three bosses; scoring is driven by damage score plus mechanics score such as Perfect Assists and Chain Attacks; used Agents/Bangboo cannot be reused across battles.
  - https://game8.co/games/Zenless-Zone-Zero/archives/489103
- Prydwen combat guide: ZZZ combat centers on three-agent team swapping, Energy, Daze/Stun, Special/EX Special, Chain Attack, Ultimate, Decibel, and Assist follow-ups.
  - https://www.prydwen.gg/zenless/guides/combat-system/
- Game8 basic combat guide: Basic attacks build Energy, Daze, and Decibel; Daze leads to Stun; heavy hits on Stunned enemies trigger Chain Attacks; Perfect Dodge and Perfect Assist are timing-driven defensive mechanics.
  - https://game8.co/games/Zenless-Zone-Zero/archives/435713

## Deadly Assault System Breakdown

### Mode Structure

- Session contains multiple boss challenges, typically three.
- Each boss has its own weakness/resistance profile.
- Each fight is score-focused rather than only clear/fail.
- Bosses rotate by season/reset cycle.
- Squad resources are constrained across fights through lineup lock.
- Player chooses buffs or stage effects that favor specific strategies.

### Combat Pressure

- The mode is optimized for boss mastery, not exploration.
- The player must maximize output inside a short combat window.
- Boss behavior and stage effects push specific mechanical responses.
- Scoring rewards both raw damage and correct execution of mode mechanics.

### Core ZZZ Combat Ingredients Relevant to Us

- Daze/Stun: repeated offense creates a vulnerability window.
- Chain Attack: a stun window becomes a burst sequence.
- Energy/EX: regular actions build resource for enhanced attacks.
- Decibel/Ultimate: high-value meter converts clean play into a finisher.
- Perfect Dodge/Assist: defensive timing becomes offensive tempo.
- Team order: combat identity comes partly from switching routes.

## What Transfers Well To Zync Zone Zero

### Keep as Design DNA

- Boss-first encounter format.
- Time-limited score pressure.
- Boss-specific mechanics and weaknesses.
- Stun/break windows that open burst opportunities.
- Performance score for precise defensive/offensive execution.
- Selectable pre-fight modifiers that change optimal play.
- Seasonal/challenge style encounter variants later.

### Change Aggressively

- No free 3D camera.
- No arena roaming as the main skill test.
- No three-character gacha roster dependency.
- No direct clone of Chain Attack UI or Agent/Bangboo structure.
- No exact resource names, scoring labels, or boss mechanics from ZZZ.

## Proposed Zync Camera and Encounter Format

### Camera

- Fixed dramatic confrontation camera.
- Boss occupies the upper/center field, large and readable.
- Player character is shown from behind or three-quarter rear view in the lower foreground.
- Camera can shake, zoom, and cut for impact, but the playable orientation remains fixed.
- The fight reads like a playable album-cover duel: boss pressure in front, player rhythm response below.

### Arena Interpretation

- The player does not navigate a full 3D space.
- Position is compressed into lanes, stance zones, or timing states.
- Left/right movement can exist as rhythm-lane dodging, not free movement.
- Boss attacks are telegraphed through body motion, beat lanes, reticles, and sound cues.

## Rhythm Action Fusion

### Main Thesis

Deadly Assault's damage + mechanics score model maps cleanly onto rhythm action if every high-value combat action has a timing grade.

The combat should not be "action game with music." It should be "boss combat where musical timing is the input grammar."

### Beat-Timed Combat Loop

1. Boss phrase begins.
2. Player reads visual/audio telegraphs.
3. Player attacks, guards, dodges, or switches stance on beat windows.
4. Accurate timing builds Sync, Daze, and Energy.
5. Boss enters Break/Stun after enough clean pressure.
6. Player executes a short burst phrase.
7. Score converts damage, timing quality, and mechanic objectives into rating.

### Suggested Core Meters

- HP: player survival.
- Boss HP: fight progress.
- Sync: rhythm accuracy and combo quality.
- Daze/Break: boss vulnerability buildup.
- Energy: enhanced skill resource.
- Crescendo: ultimate/special finisher resource.
- Focus: defensive resource for perfect guard/dodge chains.

### Timing Grades

- Miss: action fails or becomes weak.
- Bad: action occurs but loses combo/Sync.
- Good: normal action.
- Perfect: increased Daze, Energy, and score.
- Critical Beat: rare stricter timing window that triggers special counter, parry, or burst extension.

### Defensive Rhythm

- Boss attacks should arrive as musical phrases.
- Perfect Dodge should be a beat-window action.
- Perfect Guard/Parry should be stricter than dodge but grants stronger Daze or counter damage.
- Failed defensive timing should not always mean instant damage; early prototypes should test stagger, Sync loss, and chip damage separately.

### Burst / Chain Replacement

Instead of copying Chain Attack, use a system tentatively called `Break Phrase`.

- Trigger: boss Break reaches 100%.
- Entry: land a heavy beat action or perfect counter.
- Gameplay: short call-and-response rhythm sequence.
- Reward: high damage, Crescendo gain, score multiplier.
- Risk: bad timing shortens the burst phrase or ends the multiplier.

## Scoring Model Draft

### Score Categories

- Damage Score: boss HP removed, weighted by phase difficulty.
- Rhythm Score: timing grades, combo continuity, beat streak.
- Mechanics Score: perfect dodge/parry, break triggers, boss-part disruption, phrase clears.
- Style Score: variety of moves, clean stance swaps, no-hit segments.

### Rating Direction

- C: survived, low execution.
- B: basic rhythm consistency.
- A: good damage and mechanics.
- S: strong timing, breaks, and resource usage.
- Z: near-perfect rhythm/combat synthesis.

Use internal numeric thresholds later. Do not tune before the prototype exposes actual input feel.

## Boss Design Direction

### Boss Phrase Types

- Strike phrase: visible melee sequence; player dodges/parries on beats.
- Barrage phrase: projectile/reticle pattern; player shifts lanes or guards.
- Vulnerability phrase: boss exposes weak point after a callout.
- Break race: short damage race before boss recovers.
- Silence phrase: music drops out; player must read animation rather than beat metronome.
- Sync trap: attack intentionally lands off the obvious beat to test overreliance on rhythm.

### Boss Weaknesses

Instead of elemental gacha weaknesses, use rhythm/combat weaknesses:

- Weak to parry chains.
- Weak to dodge counters.
- Weak to sustained combo.
- Weak to off-beat attacks.
- Weak to heavy downbeat hits.
- Weak to stance switching.

## Prototype Plan

### Phase 1: Timing Core

- Implement beat clock with BPM, offset, and judgment windows.
- Add keyboard/controller input capture.
- Show timing grade feedback.
- Track combo, Sync, and score.

### Phase 2: Fixed Camera Combat Mock

- Keep player silhouette/character in foreground.
- Add large boss placeholder in front.
- Add boss attack telegraphs synced to beat clock.
- Add dodge/parry/attack responses.

### Phase 3: Break System

- Add boss Daze/Break meter.
- Let perfect attacks and parries build Break faster.
- Trigger Break Phrase when meter fills.
- Add simple burst phrase sequence.

### Phase 4: Deadly Assault-Inspired Challenge Mode

- Add three boss trials.
- Add pre-fight selectable modifiers.
- Add damage/rhythm/mechanics score categories.
- Add rating screen.

### Phase 5: Electron Packaging Path

- Keep the game runtime browser-compatible during prototyping.
- Avoid Node-specific game logic in the renderer.
- Add Electron only after input, rendering, and audio timing architecture are stable.

## Immediate Technical Questions

- Use raw Canvas 2D first or move early to PixiJS/Phaser?
- How strict should rhythm windows be at 60 FPS and variable display latency?
- Do we need audio latency calibration from day one?
- Should player movement be lane-based, stance-based, or both?
- Should boss attacks be authored from JSON beat charts?

## Initial Recommendation

Start with a Vite + TypeScript rhythm-combat sandbox using Canvas 2D. Do not add Electron, Three.js, PixiJS, or Phaser yet unless the first prototype proves raw Canvas becomes a drag.

First target: one boss, one BPM, four actions.

- Attack
- Heavy / Skill
- Dodge
- Parry

The first useful milestone is not visual polish. It is proving that fixed-camera boss pressure plus beat-judged inputs feels sharp rather than restrictive.

