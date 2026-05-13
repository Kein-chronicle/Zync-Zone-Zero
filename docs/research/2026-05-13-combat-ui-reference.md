# Combat UI Reference and Zync UI Plan

Date: 2026-05-13

## Reference Notes

Sources:

- Prydwen ZZZ combat guide:
  - https://www.prydwen.gg/zenless/guides/combat-system/
- ZZZ Daze wiki:
  - https://zenless-zone-zero.fandom.com/wiki/Daze
- Pocket Gamer ZZZ combat guide:
  - https://www.pocketgamer.com/zenless-zone-zero/combat-guide/
- GameWith Chain Attack guide:
  - https://gamewith.net/zenless-zone-zero/46189

Observed useful UI concepts:

- HP display for player agents.
- Energy display for each active character.
- Enemy Daze/Stun gauge below or near enemy HP.
- Three-agent party information.
- Character switching / assist prompt.
- Chain Attack prompt during stun/daze windows.
- Ultimate/Decibel-style high-value gauge.
- Clear dodge/assist feedback.

## Zync UI Requirements

Do not copy ZZZ UI placement, icons, typography, or exact framing.

Use the same functional lessons:

- player status must be visible without blocking action
- boss HP and Groggy must be impossible to miss
- active character and support characters must be clear
- tag parry opportunities must be clear
- timing grade feedback must be immediate
- command buttons must remind the player what can be done next

## Current UI Plan

### Top Boss Bar

- Boss name/status
- Boss HP bar
- Groggy bar
- Exhausted state indicator

### Party Cards

- Three character cards.
- Active character highlighted.
- Each card shows role and Groggy power identity.
- Support characters stay visible.

### Command Strip

- Weak
- Heavy
- Dodge
- Tag Parry

Command strip should show keyboard labels and combat meaning.

### Timing Panel

- Last action
- Timing grade
- Combo
- Sync
- Score

### Warning Banner

- Yellow: tag parry or dodge.
- Red: dodge only.
- Exhausted: free combo window.

## Priority

1. Boss HP/Groggy top bar.
2. Party cards with active highlight.
3. Command strip.
4. Timing/score panel.
5. Warning banner state.
6. Future: character-specific energy/ultimate cards.

