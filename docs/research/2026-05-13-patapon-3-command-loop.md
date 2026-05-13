# Patapon 3 Command Loop Reference

## Research Summary

Patapon 3 uses a rhythm command system built around 4-beat measures.

Core findings:

- A command is entered as a sequence of 4 button inputs timed to the beat.
- One measure is used to input the command.
- The following measure is where units act on that command.
- Invalid command sequences or missed rhythm can cause the army to do nothing or lose combo.
- Perfectly timed measures build toward Fever and hero power states.
- Patapon 3 focuses on a smaller party structure than earlier Patapon games, including the Uberhero.

Sources:

- `https://strategywiki.org/wiki/Patapon_3/Controls`
- `https://patapon.fandom.com/wiki/Patapon_3_Tips`
- `https://www.gamefront.com/games/gamingtoday/article/patapon-3-walkthrough`
- `https://www.gamespot.com/reviews/patapon-3-review/1900-6308897/`
- `https://patapon.fandom.com/wiki/Fever_Mode`

## Useful Pattern

Patapon is not just "press on beat."

It works because it separates intent and execution:

1. Input phase: player drums a 4-beat command.
2. Recognition phase: game validates the command pattern and timing.
3. Action phase: units perform the selected behavior over the next 4 beats.
4. Enemy/world response: the player reads whether to continue, defend, reposition, or change command.

This gives rhythm gameplay a tactical layer. The player is not reacting every single beat with a fully independent action. The player is committing to a short phrase.

## Difference From Current Zync Prototype

Current Zync combat is mostly beat-by-beat:

- press weak
- press heavy
- dodge
- tag
- repeat

Patapon-style combat is phrase-based:

- beat 1 input
- beat 2 input
- beat 3 input
- beat 4 input
- next 4 beats resolve the chosen action phrase

This would make Zync more strategic and less button-mashy.

## Possible Zync Adaptation

Zync should not copy Patapon's army-command fantasy directly.

Instead, use a "combat phrase" model:

- 4-beat input window
- 4-beat action window
- player can queue weak, heavy, dodge, tag-left, tag-right, or ultimate tokens
- the resulting 4-token phrase determines the team's action
- enemy attacks can force the player to alter the next phrase

Example phrase mappings:

- `weak weak weak weak`: stable combo pressure
- `weak weak heavy heavy`: strong finisher route
- `weak heavy weak heavy`: balanced damage and groggy gain
- `dodge weak heavy weak`: evasive counter route
- `tagLeft weak heavy heavy`: left tag entry combo
- `tagRight dodge weak heavy`: right tag evasive assist
- `weak weak tagLeft heavy`: tag parry setup if enemy yellow attack lands during the action window

## Why This Helps Zync

This directly addresses the current gameplay weakness:

- normal beats stop feeling flat
- player commits to intent
- enemy telegraphs become phrase-interruption pressure
- character identity can affect phrase interpretation
- Zync/Zero Field can reward clean phrases, not only isolated button timing

## Recommended Prototype Change

Add a Patapon-inspired phrase layer:

1. Show a 4-slot command buffer above the rhythm lane.
2. During 4 beats, collect the player's command tokens.
3. On the next 4 beats, execute the recognized phrase.
4. Let enemy yellow/red attacks appear during input or execution phases.
5. Allow emergency cancel only through dodge or tag, with a cost.
6. Grade the phrase by both command validity and beat accuracy.

## Design Caution

Do not make the player wait helplessly for 4 beats too often.

Zync is still an action combat game, so the phrase system should support:

- emergency dodge
- tag parry interrupt
- character assist reactions
- Zero Field override
- ultimate cut-in override

The correct target is not Patapon clone. The target is phrase-based rhythm action combat.
