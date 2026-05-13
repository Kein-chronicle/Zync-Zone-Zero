# BGM Source

## Active Prototype BGM

- Title: `Sweet Escape | K-pop Music`
- Artist: `kontraa`
- Source: `https://pixabay.com/music/upbeat-sweet-escape-k-pop-music-239117/`
- License: Pixabay Content License
- Runtime file: `public/assets/audio/sweet-escape-k-pop-125bpm.mp3`
- Tempo used by prototype: `125 BPM`
- Duration: `3:20`
- Media type: `MP3`
- Downloaded: `2026-05-13`

## Runtime Contract

- Start BGM from the first player input because browser autoplay blocks unattended playback.
- Press `M` or the `BGM` button to manually toggle playback.
- Show BGM state in the combat HUD so blocked or paused playback is visible.
- Sync the combat beat clock to the BGM start time.
- Keep the HUD BPM label aligned with the active BGM tempo.
- Replace this file and update `src/main.ts` if the BGM changes.
