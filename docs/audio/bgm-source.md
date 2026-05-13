# BGM Source

## Previous Prototype BGM

- Title: `Sweet Escape | K-pop Music`
- Artist: `kontraa`
- Source: `https://pixabay.com/music/upbeat-sweet-escape-k-pop-music-239117/`
- License: Pixabay Content License
- Runtime file: `public/assets/audio/sweet-escape-k-pop-125bpm.mp3`
- Tempo used by prototype: `125 BPM`
- Duration: `3:20`
- Media type: `MP3`
- Downloaded: `2026-05-13`
- Status: replaced by the slower prototype level track below.

## Active Prototype BGM

- Title: `Glitch Stairs`
- Artist: `Fupi`
- Source: `https://opengameart.org/content/glitch-stairs`
- License: CC0
- Runtime file: `public/assets/audio/glitch-stairs-100bpm.ogg`
- Tempo used by prototype: `100 BPM`
- Duration: `1:57`
- Media type: `OGG Vorbis`
- Downloaded: `2026-05-13`

## Active Prototype SFX

- Sword attacks/clashes: `20 Sword Sound Effects (Attacks and Clashes)` by `StarNinjas`
- Source: `https://opengameart.org/content/20-sword-sound-effects-attacks-and-clashes`
- License: CC0
- Runtime files:
  - `public/assets/audio/sfx/weak-slash.ogg`
  - `public/assets/audio/sfx/heavy-slash.ogg`
  - `public/assets/audio/sfx/dodge-swish.ogg`
  - `public/assets/audio/sfx/tag-parry.ogg`
  - `public/assets/audio/sfx/command-impact.ogg`
  - `public/assets/audio/sfx/zero-ultimate.ogg`

## Active Prototype Voices

- Female grunts: `Female Hurt Grunts & Groans`
- Artist: `Nocturnal_Vanguard / AuraVoice`
- Source: `https://opengameart.org/content/female-hurt-grunts-groans`
- License: CC0
- Runtime files:
  - `public/assets/audio/voice/z04-grunt.wav`
  - `public/assets/audio/voice/z05-grunt.wav`
  - `public/assets/audio/voice/z06-grunt.wav`

## Runtime Contract

- Start BGM from the first player input because browser autoplay blocks unattended playback.
- Press `M` or the `BGM` button to manually toggle playback.
- Show BGM state in the combat HUD so blocked or paused playback is visible.
- Sync the combat beat clock to the BGM start time.
- Keep the HUD BPM label aligned with the active BGM tempo.
- Replace this file and update `src/main.ts` if the BGM changes.
