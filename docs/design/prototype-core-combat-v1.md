# Prototype Core Combat V1

## Purpose

Validate whether a fixed-camera boss confrontation can feel good when combat actions are judged by enemy motion and rhythm timing together.

## Current Playable Loop

- Root page opens directly into the combat scene.
- Boss is large and centered.
- Player is shown from behind in the foreground.
- Boss attacks are readable through windup, impact, and recovery animation states.
- Player responds to the boss movement with beat-timed actions.
- Most beats are for player-initiated rhythm offense; enemy attacks interrupt that flow only occasionally.

## Controls

- `J`: Weak attack
- `K`: Heavy attack
- `L`: Dodge
- `;`: Tag Parry
- `R`: Reset

## Implemented Mechanics

- 125 BPM beat clock synced to the prototype K-pop style BGM.
- Timing grades: Miss, Bad, Good, Perfect.
- Boss HP, Player HP, Sync, Energy, Groggy, Score, Combo.
- Enemy attacks are represented by boss action states, not falling notes.
- Enemy attacks are split into yellow parryable attacks and red unparryable attacks.
- Party has three characters. One is active; the other two auto-attack on rhythm.
- Weak attack, heavy attack, and dodge can form short action combos.
- Yellow attacks can be parried or dodged.
- Red attacks must be dodged.
- Tag during a yellow impact window switches character and parries on entry, building high Groggy.
- Tag outside a parry window still switches the active character.
- Dodge during any enemy impact window opens a counter window.
- Weak and heavy attacks deal beat-graded damage.
- Groggy triggers an exhausted boss state.
- While exhausted, the boss cannot act and becomes a free-combo damage target.
- Characters build Groggy at different rates; Z-02 is currently the strongest Groggy builder.

## What This Tests

- Whether fixed camera boss movement is readable without note lanes.
- Whether rhythm timing can support action combat instead of replacing it.
- Whether the player can keep attacking rhythmically, then adjust the next command when the enemy commits to an action.
- Whether dodge and attack combinations feel useful.
- Whether tag parry feels like the main Groggy-building skill.
- Whether the exhausted boss window gives a satisfying combat spike.

## Known Limits

- Prototype BGM is loaded from `public/assets/audio/sweet-escape-k-pop-125bpm.mp3`.
- No controller support yet.
- Boss visuals are placeholder shapes.
- Threat authoring is hardcoded.
- Latency calibration is not implemented.
