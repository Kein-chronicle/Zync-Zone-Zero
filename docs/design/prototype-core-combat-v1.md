# Prototype Core Combat V1

## Purpose

Validate whether a fixed-camera boss confrontation can feel good when combat actions are judged by rhythm timing.

## Current Playable Loop

- Root page opens directly into the combat scene.
- Boss is large and centered.
- Player is shown from behind in the foreground.
- Incoming boss threats travel down lanes toward the player.
- Player responds with beat-timed actions.

## Controls

- `J`: Attack
- `K`: Heavy
- `L`: Dodge
- `;`: Parry
- `R`: Reset

## Implemented Mechanics

- 120 BPM beat clock.
- Timing grades: Miss, Bad, Good, Perfect.
- Boss HP, Player HP, Sync, Energy, Break, Score, Combo.
- Dodge and Parry threats.
- Perfect defensive responses build Break and Energy.
- Attack and Heavy deal beat-graded damage.
- Break meter triggers `Break Phrase`, temporarily increasing damage.

## What This Tests

- Whether fixed camera pressure is readable.
- Whether rhythm timing feels connected to combat value.
- Whether defensive timing can become offensive reward.
- Whether Break Phrase gives a satisfying combat spike.

## Known Limits

- No audio track yet.
- No controller support yet.
- Boss visuals are placeholder shapes.
- Threat authoring is hardcoded.
- Latency calibration is not implemented.

