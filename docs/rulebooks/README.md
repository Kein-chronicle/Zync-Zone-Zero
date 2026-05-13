# Rulebooks

This directory is the entry point for canonical implementation rules.

Use these documents before making related runtime changes.

## Canonical Rulebooks

### Combat Commands

- `docs/rulebooks/combat-command-rulebook.md`

Defines:

- 4-beat command phrase rules
- token mapping
- tag-slot direction handling
- phrase grades
- five first-version commands
- boss yellow/red hint response
- ultimate command activation

### Character Generation

- `docs/art/sprite-production-rules.md`

Defines:

- playable character concept workflow
- image-generation requirements
- pose and frame requirements
- sprite QA
- ultimate cutscene requirements
- game integration requirements

### Enemy Generation

- `docs/art/enemy-production-rules.md`

Defines:

- grunt, elite, and boss enemy tiers
- enemy visual direction
- attack readability
- hit, groggy, and phase requirements
- enemy sprite QA and integration rules

## Supporting Rule Documents

These are not primary rulebooks, but they are still active constraints:

- `docs/design/combat-effect-requirements.md`
- `docs/design/combat-visual-requirements.md`
- `docs/art/stage-environment-plan.md`
- `docs/audio/bgm-source.md`

## Historical / Research Documents

Files under `docs/research/` are references. They are not implementation rules unless a canonical rulebook links to them.

Gameplay review documents under `docs/design/` are analysis snapshots. Use them for context, not as final rules.
