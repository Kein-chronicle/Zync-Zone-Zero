# Combat System Plan

## Direction

Zync Zone Zero will use a fixed-camera boss confrontation format:

- Boss is large and centered in front of the player.
- Player character is shown from behind in the foreground.
- Combat is rhythm-governed, not free-camera action.
- The player wins by reading boss phrases and executing timed attacks, dodges, parries, and burst sequences.

Canonical command implementation rules are in `docs/rulebooks/combat-command-rulebook.md`.

## Reference Pillars

- Deadly Assault-style boss challenge pressure.
- Damage plus mechanics scoring.
- Daze/Break vulnerability loop.
- Perfect defensive timing as offensive opportunity.
- Pre-fight modifiers for replayability.

## Original Core Loop

1. Read boss phrase.
2. Execute beat-timed action.
3. Build Sync, Energy, and Break.
4. Open boss Break window.
5. Clear Break Phrase for burst damage.
6. Convert performance into rating.

## MVP Actions

- `Attack`: safe beat action, builds Sync and Break.
- `Heavy`: stronger downbeat action, consumes Energy or has commitment risk.
- `Dodge`: avoids incoming phrase, grants counter window on Perfect.
- `Parry`: strict timing, high Break reward.

## MVP Meters

- Player HP
- Boss HP
- Sync
- Energy
- Boss Break
- Score

## First Prototype Goal

Build a single fight sandbox:

- 125 BPM prototype BGM or metronome.
- Boss idle plus two attack phrases.
- Beat judgment windows.
- Score and grade feedback.
- Break window and short burst phrase.

## Risk Register

- Audio/input latency can make the whole system feel unfair.
- Fixed camera can reduce depth if boss telegraphs are not expressive.
- Too many meters will bury the rhythm read.
- Perfect-only play can become exhausting; Good timing must still be viable.
