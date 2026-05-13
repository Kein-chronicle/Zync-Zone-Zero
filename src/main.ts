import './styles.css';
import { createPixelEffect, drawPixelEffects, type PixelEffect, updatePixelEffects } from './pixelEffects';
import { drawPixelCityStage } from './pixelEnvironment';
import { coreBrutePalette, drawPixelBoss, drawPixelCharacter, drawPixelGrunt, pixelCharacters } from './pixelSprites';
import {
  createSpriteSheetEffect,
  drawSpriteSheetEffects,
  type SpriteSheetEffect,
  updateSpriteSheetEffects,
} from './spriteSheetEffects';
import type { CharacterPose } from './spriteSheetSprites';

type Action = 'weak' | 'heavy' | 'dodge' | 'tagLeft' | 'tagRight';
type Grade = 'MISS' | 'BAD' | 'GOOD' | 'PERFECT';
type EnemyMove = 'slash' | 'slam' | 'thrust';
type GuardType = 'parryable' | 'unparryable';
type UltimateCutsceneId = 'Z-04' | 'Z-05' | 'Z-06';
type CommandToken = 'W' | 'H' | 'D' | 'TL' | 'TR';
type RuleToken = 'W' | 'H' | 'D' | 'T';
type PhraseName = 'Rush' | 'Break' | 'Evasive Counter' | 'Cross Tag Assault' | 'Zync Ultimate' | 'Broken Phrase' | 'Failed Ultimate';

interface UltimateCutsceneStyle {
  accent: string;
  secondary: string;
  spark: string;
  slashAngle: number;
}

interface EnemyAttack {
  id: number;
  move: EnemyMove;
  guardType: GuardType;
  windupBeat: number;
  impactBeat: number;
  resolved: boolean;
}

interface CombatInput {
  action: Action;
  time: number;
}

interface CommandInput {
  grade: Grade;
  token: CommandToken;
}

interface FloatingText {
  text: string;
  x: number;
  y: number;
  color: string;
  ttl: number;
}

interface RhythmNote {
  x: number;
  y: number;
  size: number;
  drift: number;
  phase: number;
  color: string;
  variant: 'eighth' | 'double' | 'diamond';
}

interface FieldActor {
  attackUntil: number;
  x: number;
  y: number;
  nextMoveAt: number;
  targetX: number;
  targetY: number;
}

interface GruntState {
  id: 'EG-01' | 'EG-02';
  side: 'left' | 'right';
  hp: number;
  maxHp: number;
  actor: FieldActor;
  attackBeatModulo: number;
  attackPhaseUntil: number;
}

interface PhraseAction {
  color: string;
  damagePerPulse: number;
  groggyPerPulse: number;
  intensity: number;
  name: PhraseName;
  nextBeat: number;
  pulseIndex: number;
  untilBeat: number;
}

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

app.innerHTML = `
  <main class="combat-shell">
    <canvas id="game" width="1280" height="720" aria-label="Zync Zone Zero action combat prototype"></canvas>
    <div class="command-legend" aria-label="command combinations">
      <div><b>Rush</b><span data-key="tag">Z/X</span><span data-key="weak">J</span><span data-key="weak">J</span><span data-key="heavy">K</span></div>
      <div><b>Break</b><span data-key="weak">J</span><span data-key="tag">Z/X</span><span data-key="heavy">K</span><span data-key="heavy">K</span></div>
      <div><b>Evade</b><span data-key="dodge">L</span><span data-key="tag">Z/X</span><span data-key="weak">J</span><span data-key="heavy">K</span></div>
      <div><b>Cross</b><span data-key="tag">Z/X</span><span data-key="weak">J</span><span data-key="tag">Z/X</span><span data-key="heavy">K</span></div>
      <div><b>Ult</b><span data-key="weak">J</span><span data-key="heavy">K</span><span data-key="tag">Z/X</span><span data-key="heavy">K</span></div>
    </div>
    <div class="input-strip" aria-label="combat controls">
      <button data-action="weak"><span>J</span>Weak</button>
      <button data-action="heavy"><span>K</span>Heavy</button>
      <button data-action="dodge"><span>L</span>Dodge</button>
      <button data-action="tagLeft"><span>Z</span>Tag Left</button>
      <button data-action="tagRight"><span>X</span>Tag Right</button>
      <button data-bgm-toggle><span>M</span>BGM</button>
    </div>
  </main>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game');
const context = canvas?.getContext('2d');
const bgmButton = document.querySelector<HTMLButtonElement>('[data-bgm-toggle]');

if (!canvas || !context) {
  throw new Error('Canvas context not available');
}

const gameCanvas = canvas;
const gameContext = context;
const levelConfig = {
  bgm: '/assets/audio/glitch-stairs-100bpm.ogg',
  bpm: 100,
  id: 'prototype-slower-groove',
  title: 'Glitch Stairs',
};
const bpm = levelConfig.bpm;
const beatDuration = 60 / bpm;
const commandInputBeats = 4;
const commandActionBeats = 4;
const commandCycleBeats = commandInputBeats + commandActionBeats;
const attackCycleBeats = 24;
const bossMaxHp = 520;
const zyncMax = 100;
const zeroFieldDuration = 10;
const zeroFieldMaxDuration = 14;
const ultimateCutsceneDuration = 2;
let songStartTime = performance.now() / 1000;
const attackPattern: Array<{ move: EnemyMove; guardType: GuardType; windup: number; impact: number }> = [
  { move: 'slash', guardType: 'parryable', windup: 0, impact: 4 },
  { move: 'thrust', guardType: 'parryable', windup: 8, impact: 12 },
  { move: 'slam', guardType: 'unparryable', windup: 16, impact: 20 },
];
const characters = pixelCharacters;
const bgm = new Audio(levelConfig.bgm);
bgm.loop = true;
bgm.volume = 0.52;
const soundSources = {
  command: '/assets/audio/sfx/command-impact.ogg',
  dodge: '/assets/audio/sfx/dodge-swish.ogg',
  heavy: '/assets/audio/sfx/heavy-slash.ogg',
  parry: '/assets/audio/sfx/tag-parry.ogg',
  ultimate: '/assets/audio/sfx/zero-ultimate.ogg',
  weak: '/assets/audio/sfx/weak-slash.ogg',
} as const;
const voiceSources: Record<UltimateCutsceneId, string> = {
  'Z-04': '/assets/audio/voice/z04-grunt.wav',
  'Z-05': '/assets/audio/voice/z05-grunt.wav',
  'Z-06': '/assets/audio/voice/z06-grunt.wav',
};
const soundPool = new Map<string, HTMLAudioElement[]>();
const ultimateCutsceneSources: Record<UltimateCutsceneId, string> = {
  'Z-04': '/assets/cutscenes/z04-ultimate-cutscene-v001.png',
  'Z-05': '/assets/cutscenes/z05-ultimate-cutscene-v001.png',
  'Z-06': '/assets/cutscenes/z06-ultimate-cutscene-v001.png',
};
const ultimateCutsceneStyles: Record<UltimateCutsceneId, UltimateCutsceneStyle> = {
  'Z-04': { accent: '#dff6ff', secondary: '#7c5cff', spark: '#ffffff', slashAngle: -0.38 },
  'Z-05': { accent: '#ff5aee', secondary: '#f5c84c', spark: '#ffe4fb', slashAngle: 0.22 },
  'Z-06': { accent: '#f5c84c', secondary: '#0fb9b1', spark: '#fff3cc', slashAngle: -0.18 },
};
const ultimateCutsceneImages = Object.fromEntries(
  Object.entries(ultimateCutsceneSources).map(([id, source]) => {
    const image = new Image();
    image.src = source;
    return [id, image];
  }),
) as Record<UltimateCutsceneId, HTMLImageElement>;
const keys: Record<string, Action> = {
  KeyJ: 'weak',
  KeyK: 'heavy',
  KeyL: 'dodge',
  KeyX: 'tagRight',
  KeyZ: 'tagLeft',
};

let lastFrame = performance.now() / 1000;
let playerHp = 100;
let bossHp = bossMaxHp;
let sync = 50;
let energy = 0;
let zync = 0;
let zeroFieldUntil = 0;
let zeroUltimateAvailable = false;
let zeroFieldStartedAt = 0;
let groggy = 0;
let score = 0;
let combo = 0;
let maxCombo = 0;
let lastGrade: Grade = 'GOOD';
let lastAction = 'Ready';
let breakUntilBeat = -1;
let generatedCycle = -1;
let attackId = 0;
let evasionUntil = 0;
let counterUntil = 0;
let activeCharacterIndex = 0;
let activePose: CharacterPose = 'idle';
let activePoseUntil = 0;
let weakChainStep = 0;
let heavyChainStep = 0;
let lastAttackChainAction: 'weak' | 'heavy' | undefined;
let lastAttackChainTime = 0;
let lastSupportBeat = -1;
let lastGruntBeat = -1;
let activeAdvanceUntil = 0;
let activeAdvanceTargetY = 585;
let ultimateCutsceneUntil = 0;
let ultimateCutsceneStartedAt = 0;
let activeUltimateCutsceneId: UltimateCutsceneId | undefined;
let queuedUltimatePreviewId: UltimateCutsceneId | undefined;
let bgmStatus: 'STANDBY' | 'STARTING' | 'ON' | 'PAUSED' | 'BLOCKED' = 'STANDBY';
let commandBuffer: CommandInput[] = [];
let activePhraseAction: PhraseAction | undefined;
let lastPhraseName: PhraseName | 'None' = 'None';
let lastCommandInputOpen = true;
const bossActor: FieldActor = { attackUntil: 0, nextMoveAt: 0, x: 640, y: 340, targetX: 640, targetY: 340 };
const characterActors: FieldActor[] = [
  { attackUntil: 0, nextMoveAt: 0, x: 640, y: 585, targetX: 640, targetY: 585 },
  { attackUntil: 0, nextMoveAt: 0, x: 500, y: 585, targetX: 500, targetY: 585 },
  { attackUntil: 0, nextMoveAt: 0, x: 780, y: 585, targetX: 780, targetY: 585 },
];
const grunts: GruntState[] = [
  {
    actor: { attackUntil: 0, nextMoveAt: 0, x: 420, y: 392, targetX: 420, targetY: 392 },
    attackBeatModulo: 3,
    attackPhaseUntil: 0,
    hp: 120,
    id: 'EG-01',
    maxHp: 120,
    side: 'left',
  },
  {
    actor: { attackUntil: 0, nextMoveAt: 0, x: 860, y: 398, targetX: 860, targetY: 398 },
    attackBeatModulo: 4,
    attackPhaseUntil: 0,
    hp: 132,
    id: 'EG-02',
    maxHp: 132,
    side: 'right',
  },
];
const attacks: EnemyAttack[] = [];
const inputHistory: CombatInput[] = [];
const floatingTexts: FloatingText[] = [];
const pixelEffects: PixelEffect[] = [];
const spriteSheetEffects: SpriteSheetEffect[] = [];
const rhythmNotes: RhythmNote[] = [
  { x: 82, y: 242, size: 16, drift: 18, phase: 0.05, color: '#0fb9b1', variant: 'eighth' },
  { x: 142, y: 505, size: 20, drift: 22, phase: 0.58, color: '#7c5cff', variant: 'double' },
  { x: 262, y: 172, size: 13, drift: 13, phase: 0.2, color: '#f5c84c', variant: 'diamond' },
  { x: 1016, y: 258, size: 18, drift: 19, phase: 0.73, color: '#ff5a6e', variant: 'eighth' },
  { x: 1158, y: 450, size: 22, drift: 24, phase: 0.36, color: '#0fb9b1', variant: 'double' },
  { x: 940, y: 582, size: 14, drift: 16, phase: 0.84, color: '#dff6ff', variant: 'diamond' },
  { x: 410, y: 548, size: 14, drift: 16, phase: 0.44, color: '#f5c84c', variant: 'eighth' },
  { x: 846, y: 168, size: 12, drift: 15, phase: 0.66, color: '#7c5cff', variant: 'diamond' },
];

function getSongTime(now = performance.now() / 1000) {
  return now - songStartTime;
}

function getBeatFloat(now = performance.now() / 1000) {
  return getSongTime(now) / beatDuration;
}

function isCommandInputBeat(beat: number) {
  const cycleBeat = ((Math.floor(beat) % commandCycleBeats) + commandCycleBeats) % commandCycleBeats;
  return cycleBeat < commandInputBeats;
}

function isCommandInputTargetOpen(now = performance.now() / 1000) {
  return isCommandInputBeat(Math.round(getBeatFloat(now)));
}

function isBossGroggy(now = performance.now() / 1000) {
  return getBeatFloat(now) < breakUntilBeat;
}

function getNearestBeatOffset(now = performance.now() / 1000) {
  const beatFloat = getBeatFloat(now);
  return beatFloat - Math.round(beatFloat);
}

function gradeInput(now = performance.now() / 1000): Grade {
  const offsetMs = Math.abs(getNearestBeatOffset(now) * beatDuration * 1000);

  if (offsetMs <= 60) {
    return 'PERFECT';
  }

  if (offsetMs <= 120) {
    return 'GOOD';
  }

  if (offsetMs <= 190) {
    return 'BAD';
  }

  return 'MISS';
}

function gradeMultiplier(grade: Grade) {
  if (grade === 'PERFECT') {
    return 1.55;
  }

  if (grade === 'GOOD') {
    return 1;
  }

  if (grade === 'BAD') {
    return 0.4;
  }

  return 0;
}

function actionToCommandToken(action: Action): CommandToken {
  if (action === 'weak') {
    return 'W';
  }

  if (action === 'heavy') {
    return 'H';
  }

  if (action === 'dodge') {
    return 'D';
  }

  if (action === 'tagLeft') {
    return 'TL';
  }

  if (action === 'tagRight') {
    return 'TR';
  }

  throw new Error(`Unsupported action: ${action}`);
}

function normalizeCommandToken(token: CommandToken): RuleToken {
  return token === 'TL' || token === 'TR' ? 'T' : token;
}

function getCommandTokenLabel(token: CommandToken) {
  if (token === 'W') {
    return 'J';
  }

  if (token === 'H') {
    return 'K';
  }

  if (token === 'D') {
    return 'L';
  }

  return token === 'TL' ? 'Z' : 'X';
}

function getKeyColor(key: string) {
  if (key.includes('J')) {
    return '#0fb9b1';
  }

  if (key.includes('K')) {
    return '#f5c84c';
  }

  if (key.includes('L')) {
    return '#5aa7ff';
  }

  if (key.includes('X')) {
    return '#7c5cff';
  }

  if (key.includes('Z')) {
    return '#ff5aee';
  }

  return '#8a95a8';
}

function getGuidanceKeyForAttackSlot(attack: EnemyAttack | undefined, slot: number) {
  const guidance = getAttackGuidance(attack);

  if (!guidance || slot < 0 || slot >= guidance.keys.length) {
    return undefined;
  }

  return guidance.keys[slot];
}

function getAverageGradeMultiplier(inputs: CommandInput[]) {
  if (inputs.length === 0) {
    return 0;
  }

  return inputs.reduce((sum, input) => sum + gradeMultiplier(input.grade), 0) / inputs.length;
}

function countPhraseMisses(inputs: CommandInput[]) {
  return inputs.filter((input) => input.grade === 'MISS').length;
}

function getPhraseName(inputs: CommandInput[]): PhraseName {
  const normalized = inputs.map((input) => normalizeCommandToken(input.token));
  const pattern = normalized.join(' ');
  const tagCount = normalized.filter((token) => token === 'T').length;

  if (tagCount >= 3) {
    return 'Broken Phrase';
  }

  if (tagCount === 0) {
    return 'Broken Phrase';
  }

  if (pattern === 'T W W H') {
    return 'Rush';
  }

  if (pattern === 'W T H H') {
    return 'Break';
  }

  if (pattern === 'D T W H') {
    return 'Evasive Counter';
  }

  if (pattern === 'T W T H') {
    return 'Cross Tag Assault';
  }

  if (pattern === 'W H T H') {
    return 'Zync Ultimate';
  }

  return 'Broken Phrase';
}

function getZyncGradeMultiplier(grade: Grade) {
  if (grade === 'PERFECT') {
    return 1.35;
  }

  if (grade === 'GOOD') {
    return 1;
  }

  if (grade === 'BAD') {
    return 0.45;
  }

  return 0;
}

function getCharacterCombatRole(characterName: string) {
  if (characterName === 'Z-04') {
    return {
      damage: 1.02,
      groggy: 1.28,
      score: 1,
      zeroGain: 1,
      zeroSustain: 1.05,
      label: 'BREAK LEAD',
    };
  }

  if (characterName === 'Z-05') {
    return {
      damage: 1.22,
      groggy: 0.92,
      score: 1.25,
      zeroGain: 0.95,
      zeroSustain: 1,
      label: 'COMBO DPS',
    };
  }

  return {
    damage: 0.96,
    groggy: 1,
    score: 1.05,
    zeroGain: 1.32,
    zeroSustain: 1.28,
    label: 'ZYNC CORE',
  };
}

function isZeroFieldActive(now = performance.now() / 1000) {
  return now < zeroFieldUntil;
}

function enterZeroField(now = performance.now() / 1000) {
  zync = 0;
  zeroFieldUntil = now + zeroFieldDuration;
  zeroFieldStartedAt = now;
  zeroUltimateAvailable = true;
  counterUntil = Math.max(counterUntil, now + 1.2);
  bgm.volume = 0.68;
  bgm.playbackRate = 1.04;
  addEffect('beatRing', 640, 520, '#dff6ff', 2.4);
  addEffect('tagParryFlash', 640, 465, '#7c5cff', 2);
  addEffect('pixelBurst', 640, 360, '#dff6ff', 2.2);
  addSpriteEffect('parryPing', 640, 420, 1.35, 0.6, 1);
  addFloatingText('ZERO FIELD', 640, 500, '#dff6ff');
}

function exitZeroField() {
  zeroFieldUntil = 0;
  zeroUltimateAvailable = false;
  zeroFieldStartedAt = 0;
  bgm.volume = 0.52;
  bgm.playbackRate = 1;
}

function sustainZeroField(points: number, grade: Grade, now = performance.now() / 1000) {
  if (!isZeroFieldActive(now) || grade === 'MISS') {
    return;
  }

  const activeRole = getCharacterCombatRole(characters[activeCharacterIndex].name);
  const extension = points * getZyncGradeMultiplier(grade) * activeRole.zeroSustain * 0.035;
  zeroFieldUntil = Math.min(now + zeroFieldMaxDuration, zeroFieldUntil + extension);

  if (grade === 'PERFECT') {
    addEffect('beatRing', 640, 610, '#dff6ff', 0.7);
  }
}

function punishComboDrop(now = performance.now() / 1000, severity = 1) {
  zync = clamp(zync - 12 * severity, 0, zyncMax);
  if (isZeroFieldActive(now)) {
    zeroFieldUntil = Math.max(now, zeroFieldUntil - 1.6 * severity);
    addEffect('warningPulse', 640, 530, '#ff5a6e', 1.2 * severity);
    addFloatingText('ZERO STABILITY DOWN', 640, 530, '#ff5a6e');
  }
}

function addZync(points: number, grade: Grade, now = performance.now() / 1000) {
  if (isZeroFieldActive(now)) {
    sustainZeroField(points, grade, now);
    return;
  }

  if (grade === 'MISS') {
    return;
  }

  const activeRole = getCharacterCombatRole(characters[activeCharacterIndex].name);
  zync = clamp(zync + points * getZyncGradeMultiplier(grade) * activeRole.zeroGain, 0, zyncMax);

  if (zync >= zyncMax) {
    enterZeroField(now);
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function approach(current: number, target: number, maxStep: number) {
  if (Math.abs(target - current) <= maxStep) {
    return target;
  }

  return current + Math.sign(target - current) * maxStep;
}

function moveActor(actor: FieldActor, speed: number, deltaSeconds: number) {
  const maxStep = speed * deltaSeconds;
  actor.x = approach(actor.x, actor.targetX, maxStep);
  actor.y = approach(actor.y, actor.targetY, maxStep);
}

function isActorMoving(actor: FieldActor) {
  return Math.abs(actor.x - actor.targetX) > 1.5 || Math.abs(actor.y - actor.targetY) > 1.5;
}

function getDistance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function isNearPoint(actor: FieldActor, target: { x: number; y: number }, range: number) {
  return getDistance(actor.x, actor.y, target.x, target.y) <= range;
}

function scheduleMove(actor: FieldActor, now: number, baseX: number, baseY: number, rangeX: number, rangeY: number, minDelay: number, maxDelay: number) {
  if (now < actor.nextMoveAt || isActorMoving(actor) || now < actor.attackUntil) {
    return;
  }

  actor.targetX = baseX + (Math.random() * 2 - 1) * rangeX;
  actor.targetY = baseY + (Math.random() * 2 - 1) * rangeY;
  actor.nextMoveAt = now + minDelay + Math.random() * (maxDelay - minDelay);
}

function addFloatingText(text: string, x: number, y: number, color: string) {
  floatingTexts.push({ text, x, y, color, ttl: 0.85 });
}

function syncSongClockToBgm(now = performance.now() / 1000) {
  songStartTime = bgm.paused ? now : now - bgm.currentTime;
}

function updateBgmButton() {
  if (!bgmButton) {
    return;
  }

  bgmButton.dataset.state = bgmStatus.toLowerCase();
  bgmButton.innerHTML = `<span>M</span>${bgmStatus === 'ON' ? 'BGM On' : 'BGM'}`;
}

function startBgm(now = performance.now() / 1000) {
  if (!bgm.paused) {
    bgmStatus = 'ON';
    updateBgmButton();
    syncSongClockToBgm(now);
    return;
  }

  bgmStatus = 'STARTING';
  updateBgmButton();
  bgm.currentTime = 0;
  songStartTime = now;
  void bgm.play().then(() => {
    bgmStatus = 'ON';
    updateBgmButton();
    syncSongClockToBgm();
  }).catch(() => {
    bgmStatus = 'BLOCKED';
    updateBgmButton();
    songStartTime = performance.now() / 1000;
    addFloatingText('BGM BLOCKED - PRESS M', 640, 610, '#ff9f43');
  });
}

function toggleBgm(now = performance.now() / 1000) {
  if (bgm.paused) {
    startBgm(now);
    return;
  }

  bgm.pause();
  bgmStatus = 'PAUSED';
  updateBgmButton();
  syncSongClockToBgm(now);
}

function isUltimateCutsceneId(name: string): name is UltimateCutsceneId {
  return name === 'Z-04' || name === 'Z-05' || name === 'Z-06';
}

function getSoundInstance(source: string) {
  let pool = soundPool.get(source);

  if (!pool) {
    pool = Array.from({ length: 4 }, () => {
      const audio = new Audio(source);
      audio.preload = 'auto';
      return audio;
    });
    soundPool.set(source, pool);
  }

  return pool.find((audio) => audio.paused) ?? pool[0];
}

function playAudioSource(source: string, volume = 0.65, playbackRate = 1) {
  const audio = getSoundInstance(source);
  audio.pause();
  audio.currentTime = 0;
  audio.volume = clamp(volume, 0, 1);
  audio.playbackRate = playbackRate;
  void audio.play().catch(() => {
    // Browser autoplay policy can reject SFX before the first trusted input.
  });
}

function playSfx(type: keyof typeof soundSources, volume = 0.65, playbackRate = 1) {
  playAudioSource(soundSources[type], volume, playbackRate);
}

function playCharacterVoice(characterName: string, volume = 0.48, playbackRate = 1) {
  if (!isUltimateCutsceneId(characterName)) {
    return;
  }

  playAudioSource(voiceSources[characterName], volume, playbackRate);
}

function triggerUltimateCutscene(characterName: string, now: number) {
  if (!isUltimateCutsceneId(characterName)) {
    return;
  }

  activeUltimateCutsceneId = characterName;
  ultimateCutsceneStartedAt = now;
  ultimateCutsceneUntil = now + ultimateCutsceneDuration;
}

const ultimatePreviewParam = new URLSearchParams(window.location.search).get('ultimatePreview');
if (ultimatePreviewParam && isUltimateCutsceneId(ultimatePreviewParam)) {
  queuedUltimatePreviewId = ultimatePreviewParam;
}

bgm.addEventListener('playing', () => {
  bgmStatus = 'ON';
  updateBgmButton();
  syncSongClockToBgm();
});

bgm.addEventListener('pause', () => {
  if (bgmStatus !== 'BLOCKED') {
    bgmStatus = 'PAUSED';
    updateBgmButton();
  }
});

function addEffect(type: PixelEffect['type'], x: number, y: number, color: string, intensity = 1) {
  pixelEffects.push(createPixelEffect(type, x, y, color, intensity));
}

function addSpriteEffect(type: SpriteSheetEffect['type'], x: number, y: number, scale: number, duration: number, alpha = 1) {
  spriteSheetEffects.push(createSpriteSheetEffect(type, x, y, scale, duration, alpha));
}

function addCommandImpact(x: number, y: number, color: string, intensity: number) {
  addEffect('hitSpark', x, y, color, 2.4 * intensity);
  addEffect('slashArc', x, y + 30, color, 1.9 * intensity);
  addEffect('pixelBurst', x, y + 12, '#dff6ff', 1.3 * intensity);
  addEffect('tagParryFlash', x, y + 48, color, 1.55 * intensity);
  addSpriteEffect('parryPing', x, y + 54, 1.08 + intensity * 0.18, 0.38, 0.92);
  addSpriteEffect(getCharacterSpriteEffect(characters[activeCharacterIndex].name, intensity > 1.2 ? 'heavy' : 'weak'), x, y + 34, 1.06 + intensity * 0.12, 0.42, 0.96);
}

function getPhraseColor(name: PhraseName) {
  if (name === 'Evasive Counter') {
    return '#0fb9b1';
  }

  if (name === 'Break' || name === 'Zync Ultimate') {
    return '#f5c84c';
  }

  if (name === 'Cross Tag Assault') {
    return '#ff5aee';
  }

  if (name === 'Broken Phrase' || name === 'Failed Ultimate') {
    return '#ff5a6e';
  }

  return characters[activeCharacterIndex].accent;
}

function addPhraseSignatureImpact(name: PhraseName, x: number, y: number, intensity: number) {
  if (name === 'Rush') {
    addEffect('slashArc', x - 92, y + 18, '#0fb9b1', 1.7 * intensity);
    addEffect('slashArc', x + 92, y + 18, '#dff6ff', 1.45 * intensity);
    addSpriteEffect(getCharacterSpriteEffect(characters[activeCharacterIndex].name, 'weak'), x, y + 52, 1.22, 0.32, 0.9);
    return;
  }

  if (name === 'Break') {
    addEffect('hitSpark', x, y - 26, '#f5c84c', 3.1 * intensity);
    addEffect('tagParryFlash', x, y + 36, '#f5c84c', 2.2 * intensity);
    addSpriteEffect('parryPing', x, y + 42, 1.42, 0.44, 1);
    return;
  }

  if (name === 'Evasive Counter') {
    addEffect('afterimage', x - 120, y + 150, '#0fb9b1', 1.7 * intensity);
    addEffect('slashArc', x + 86, y + 34, '#dff6ff', 1.8 * intensity);
    addSpriteEffect(getCharacterSpriteEffect(characters[activeCharacterIndex].name, 'heavy'), x + 40, y + 40, 1.12, 0.34, 0.88);
    return;
  }

  if (name === 'Cross Tag Assault') {
    addEffect('slashArc', x - 150, y + 20, '#ff5aee', 2.2 * intensity);
    addEffect('slashArc', x + 150, y + 20, '#f5c84c', 2 * intensity);
    addEffect('pixelBurst', x, y + 36, '#dff6ff', 1.6 * intensity);
    addSpriteEffect('parryPing', x - 80, y + 44, 1.08, 0.34, 0.86);
    addSpriteEffect('parryPing', x + 80, y + 44, 1.08, 0.34, 0.86);
  }
}

function getCharacterSpriteEffect(characterName: string, action: 'heavy' | 'weak' = 'weak'): SpriteSheetEffect['type'] {
  if (characterName === 'Z-02') {
    return 'impactGold';
  }

  if (characterName === 'Z-05') {
    return action === 'weak' ? 'projectile' : 'impactGold';
  }

  if (characterName === 'Z-06') {
    return action === 'weak' ? 'kineticTeal' : 'impactGold';
  }

  if (characterName === 'Z-03') {
    return 'kineticTeal';
  }

  return action === 'weak' ? 'slash' : 'projectile';
}

function setActivePose(pose: CharacterPose, now: number, durationSeconds: number) {
  activePose = pose;
  activePoseUntil = now + durationSeconds;
}

function getAttackChainPose(action: 'weak' | 'heavy', now: number): CharacterPose {
  const keepChain = lastAttackChainAction === action && now - lastAttackChainTime <= 1.25;
  lastAttackChainAction = action;
  lastAttackChainTime = now;

  if (action === 'weak') {
    weakChainStep = keepChain ? (weakChainStep % 3) + 1 : 1;
    heavyChainStep = 0;
    return `weak${weakChainStep}` as CharacterPose;
  }

  heavyChainStep = keepChain ? (heavyChainStep % 3) + 1 : 1;
  weakChainStep = 0;
  return `heavy${heavyChainStep}` as CharacterPose;
}

function resetAttackChain() {
  weakChainStep = 0;
  heavyChainStep = 0;
  lastAttackChainAction = undefined;
}

function generateEnemyAttacks(currentBeat: number) {
  if (isBossGroggy()) {
    return;
  }

  const cycle = Math.floor(currentBeat / attackCycleBeats);

  if (generatedCycle < cycle - 1) {
    generatedCycle = cycle - 1;
  }

  if (cycle <= generatedCycle) {
    return;
  }

  for (let nextCycle = generatedCycle + 1; nextCycle <= cycle + 2; nextCycle += 1) {
    attackPattern.forEach((pattern) => {
      const impactBeat = nextCycle * attackCycleBeats + pattern.impact;

      if (impactBeat <= currentBeat + 1) {
        return;
      }

      attacks.push({
        id: attackId,
        move: pattern.move,
        guardType: pattern.guardType,
        windupBeat: nextCycle * attackCycleBeats + pattern.windup,
        impactBeat,
        resolved: false,
      });
      attackId += 1;
    });
  }

  generatedCycle = cycle + 2;
}

function getActiveAttack(now = performance.now() / 1000) {
  if (isBossGroggy(now)) {
    return undefined;
  }

  const beatFloat = getBeatFloat(now);

  return attacks.find((attack) => {
    if (attack.resolved) {
      return false;
    }

    return beatFloat >= attack.windupBeat - 0.25 && beatFloat <= attack.impactBeat + 0.45;
  });
}

function getIncomingAttack(now = performance.now() / 1000) {
  if (isBossGroggy(now)) {
    return undefined;
  }

  const beatFloat = getBeatFloat(now);

  return attacks.find(
    (attack) => !attack.resolved && attack.impactBeat >= beatFloat - 0.1 && attack.windupBeat - beatFloat <= 1.5,
  );
}

function getGuidanceAttack(now = performance.now() / 1000) {
  if (isBossGroggy(now)) {
    return undefined;
  }

  const beatFloat = getBeatFloat(now);

  return attacks.find(
    (attack) => !attack.resolved && attack.impactBeat >= beatFloat - 0.15 && attack.impactBeat - beatFloat <= 8,
  );
}

function getAttackGuidance(attack: EnemyAttack | undefined) {
  if (!attack) {
    return undefined;
  }

  if (attack.guardType === 'parryable') {
    if (attack.move === 'thrust') {
      return {
        command: ['T', 'W', 'T', 'H'],
        keys: ['Z/X', 'J', 'Z/X', 'K'],
        label: 'CROSS TAG ROUTE',
        response: 'Two tags catch the feint and turn it into a joint punish.',
      };
    }

    return {
      command: ['T', 'W', 'W', 'H'],
      keys: ['Z/X', 'J', 'J', 'K'],
      label: 'TAG PARRY ROUTE',
      response: 'Catch yellow with tag, then convert into Rush.',
    };
  }

  return {
    command: ['D', 'T', 'W', 'H'],
    keys: ['L', 'Z/X', 'J', 'K'],
    label: 'DODGE COUNTER ROUTE',
    response: 'Evade red first, then tag into counter pressure.',
  };
}

function getAttackPhase(attack: EnemyAttack | undefined, now = performance.now() / 1000) {
  if (!attack) {
    return 'idle';
  }

  const beatFloat = getBeatFloat(now);

  if (beatFloat < attack.windupBeat) {
    return 'idle';
  }

  if (beatFloat < attack.impactBeat - 0.18) {
    return 'windup';
  }

  if (beatFloat <= attack.impactBeat + 0.2) {
    return 'impact';
  }

  return 'recover';
}

function findParryTarget(now = performance.now() / 1000) {
  const beatFloat = getBeatFloat(now);

  return attacks.find(
    (attack) => !attack.resolved && attack.guardType === 'parryable' && Math.abs(attack.impactBeat - beatFloat) <= 0.24,
  );
}

function findUnparryableTarget(now = performance.now() / 1000) {
  const beatFloat = getBeatFloat(now);

  return attacks.find(
    (attack) =>
      !attack.resolved && attack.guardType === 'unparryable' && Math.abs(attack.impactBeat - beatFloat) <= 0.24,
  );
}

function getSupportCharacterIndexes() {
  return characters.map((_, index) => index).filter((index) => index !== activeCharacterIndex);
}

function normalizeComboAction(action: Action) {
  return action === 'tagLeft' || action === 'tagRight' ? 'tag' : action;
}

function getTagTargetIndex(action: Extract<Action, 'tagLeft' | 'tagRight'>) {
  const supportIndexes = getSupportCharacterIndexes();
  return action === 'tagLeft' ? supportIndexes[0] : supportIndexes[supportIndexes.length - 1];
}

function getSideGrunt(side: 'left' | 'right') {
  return grunts.find((grunt) => grunt.side === side);
}

function getLivingSideGrunt(side: 'left' | 'right') {
  const grunt = getSideGrunt(side);
  return grunt && grunt.hp > 0 ? grunt : undefined;
}

function getSupportTarget(side: 'left' | 'right') {
  const livingGrunt = getLivingSideGrunt(side);

  if (livingGrunt) {
    return {
      x: livingGrunt.actor.x + (side === 'left' ? 58 : -58),
      y: livingGrunt.actor.y + 118,
    };
  }

  return {
    x: bossActor.x + (side === 'left' ? -104 : 104),
    y: bossActor.y + 142,
  };
}

function findDodgeTarget(now = performance.now() / 1000) {
  const beatFloat = getBeatFloat(now);

  return attacks.find((attack) => !attack.resolved && Math.abs(attack.impactBeat - beatFloat) <= 0.34);
}

function resolveEnemyHits(now = performance.now() / 1000) {
  if (isBossGroggy(now)) {
    return;
  }

  const beatFloat = getBeatFloat(now);

  attacks.forEach((attack) => {
    if (!attack.resolved && beatFloat > attack.impactBeat + 0.26) {
      attack.resolved = true;

      if (now <= evasionUntil || beatFloat < breakUntilBeat) {
        addFloatingText('WHIFF', 640, 455, '#8a95a8');
        return;
      }

      playerHp = clamp(playerHp - 10, 0, 100);
      sync = clamp(sync - 9, 0, 100);
      combo = 0;
      punishComboDrop(now, 1.1);
      addEffect('pixelBurst', 640, 470, '#ff5a6e', 1.1);
      addFloatingText('HIT', 640, 470, '#ff5a6e');
    }
  });
}

function pushInput(action: Action, now: number) {
  inputHistory.push({ action, time: now });

  while (inputHistory.length > 0 && now - inputHistory[0].time > 1.3) {
    inputHistory.shift();
  }
}

function getComboName() {
  const recent = inputHistory.map((input) => normalizeComboAction(input.action)).slice(-3).join('-');

  if (recent.endsWith('weak-weak-heavy')) {
    return 'RUSH FINISH';
  }

  if (recent.endsWith('weak-heavy')) {
    return 'LAUNCH CUT';
  }

  if (recent.endsWith('dodge-weak')) {
    return 'EVADE COUNTER';
  }

  if (recent.endsWith('tag-weak')) {
    return 'TAG COUNTER';
  }

  if (recent.endsWith('heavy-heavy')) {
    return 'BREAKER';
  }

  return '';
}

function enterBreak(now = performance.now() / 1000) {
  const currentBeat = Math.floor(getBeatFloat(now));
  breakUntilBeat = currentBeat + 8;
  groggy = 0;
  counterUntil = now + 1.8;
  generatedCycle = Math.floor(currentBeat / attackCycleBeats) - 1;
  attacks.forEach((attack) => {
    attack.resolved = true;
  });
  addEffect('groggyBreak', 640, 270, '#f5c84c', 1.4);
  addFloatingText('EXHAUSTED', 640, 270, '#f5c84c');
}

function applyAttack(action: 'weak' | 'heavy', grade: Grade, now: number, chainStep: number) {
  const beatFloat = getBeatFloat(now);
  const multiplier = gradeMultiplier(grade);
  const inBreak = beatFloat < breakUntilBeat;
  const inCounter = now < counterUntil;
  const inZeroField = isZeroFieldActive(now);
  const activeCharacter = characters[activeCharacterIndex];
  const activeActor = characterActors[activeCharacterIndex];
  const activeRole = getCharacterCombatRole(activeCharacter.name);
  const comboName = getComboName();
  const energyReady = energy >= 18;
  let damage = action === 'weak' ? 0.85 : 1.8;
  let groggyGain = action === 'weak' ? 2.4 : 5.5;
  damage *= 1 + (chainStep - 1) * 0.18;
  groggyGain *= 1 + (chainStep - 1) * 0.22;

  if (action === 'heavy' && !energyReady && !inBreak) {
    damage *= 0.45;
    groggyGain *= 0.45;
    addFloatingText('LOW ENERGY', 640, 535, '#ff9f43');
  } else if (action === 'heavy' && !inBreak) {
    energy = clamp(energy - 18, 0, 100);
  }

  if (comboName === 'RUSH FINISH') {
    damage += 1.4;
  }

  if (comboName === 'LAUNCH CUT') {
    groggyGain += 3;
  }

  if (comboName === 'EVADE COUNTER') {
    damage += 1.8;
    groggyGain += 3;
  }

  if (comboName === 'TAG COUNTER') {
    damage += 2.2;
    groggyGain += 4;
  }

  if (comboName === 'BREAKER') {
    groggyGain += 7;
  }

  if (inBreak) {
    damage *= 2.7;
  }

  if (inCounter) {
    damage *= 1.6;
    groggyGain *= 1.5;
  }

  if (inZeroField) {
    damage *= 1.35;
    groggyGain *= 1.55;
  }

  bossHp = clamp(bossHp - damage * multiplier * activeRole.damage, 0, bossMaxHp);
  groggy = clamp(groggy + groggyGain * multiplier * activeCharacter.groggyPower * activeRole.groggy, 0, 100);
  energy = action === 'weak' ? clamp(energy + 6 * multiplier, 0, 100) : energy;
  activeActor.attackUntil = now + (action === 'weak' ? 0.42 : 0.56);
  activeAdvanceUntil = now + (action === 'weak' ? 0.52 : 0.66);
  activeAdvanceTargetY = action === 'weak' ? 505 : 485;

  const activeEffectColor =
    activeCharacter.name === 'Z-02'
    || activeCharacter.name === 'Z-03'
    || activeCharacter.name === 'Z-05'
    || activeCharacter.name === 'Z-06'
      ? activeCharacter.accent
      : action === 'weak'
        ? '#f0f3f7'
        : '#f5c84c';
  const activeSpriteEffect =
    getCharacterSpriteEffect(activeCharacter.name, action);
  addEffect(action === 'weak' ? 'slashArc' : 'hitSpark', 640, 265, activeEffectColor, multiplier);
  if (grade === 'PERFECT' || action === 'heavy') {
    addCommandImpact(640, action === 'weak' ? 320 : 300, activeEffectColor, action === 'heavy' ? 0.95 * multiplier : 0.72 * multiplier);
  }
  addSpriteEffect(
    activeSpriteEffect,
    640,
    activeCharacter.name === 'Z-02' || activeCharacter.name === 'Z-05'
      ? 375
      : activeCharacter.name === 'Z-03' || activeCharacter.name === 'Z-06'
        ? 370
        : action === 'weak'
          ? 395
          : 365,
    activeCharacter.name === 'Z-02' || activeCharacter.name === 'Z-05'
      ? 0.76
      : activeCharacter.name === 'Z-03' || activeCharacter.name === 'Z-06'
        ? 0.74
        : action === 'weak'
          ? 0.72
          : 0.82,
    action === 'weak' ? 0.28 : 0.34,
    0.9,
  );
  addEffect('beatRing', 640, 625, grade === 'PERFECT' ? '#f5c84c' : '#0fb9b1', multiplier);
  addFloatingText(comboName || grade, 640, 525, comboName ? '#f5c84c' : '#f0f3f7');
  addZync(action === 'weak' ? 7 + chainStep * 1.5 : 12 + chainStep * 2, grade, now);
  score += Math.round(35 * multiplier * activeRole.score);
}

function applyUltimate(grade: Grade, now: number, phraseCast = false) {
  const multiplier = gradeMultiplier(grade);
  const activeCharacter = characters[activeCharacterIndex];
  const activeRole = getCharacterCombatRole(activeCharacter.name);
  const zeroCast = isZeroFieldActive(now) && zeroUltimateAvailable;

  if (!zeroCast && phraseCast && zync < zyncMax) {
    combo = 0;
    sync = clamp(sync - 4, 0, 100);
    addEffect('warningPulse', 640, 520, '#ff9f43', 1.2);
    addFloatingText('ULT FAILED', 640, 520, '#ff9f43');
    return false;
  }

  if (!zeroCast && !phraseCast && energy < 60) {
    combo = 0;
    sync = clamp(sync - 4, 0, 100);
    addEffect('warningPulse', 640, 520, '#ff9f43', 0.8);
    addFloatingText('ULT LOW ENERGY', 640, 520, '#ff9f43');
    return false;
  }

  if (zeroCast) {
    exitZeroField();
  } else if (phraseCast) {
    zync = 0;
  } else {
    energy = clamp(energy - 60, 0, 100);
  }

  triggerUltimateCutscene(activeCharacter.name, now);
  playSfx('ultimate', zeroCast ? 0.9 : 0.78, zeroCast ? 0.92 : 1);
  playCharacterVoice(activeCharacter.name, 0.58, zeroCast ? 0.96 : 1);
  counterUntil = now + 1.6;
  bossHp = clamp(bossHp - (zeroCast ? bossMaxHp * 0.05 : bossMaxHp * 0.038) * multiplier * activeRole.damage, 0, bossMaxHp);
  groggy = clamp(groggy + (zeroCast ? 30 : 18) * multiplier * activeCharacter.groggyPower * activeRole.groggy, 0, 100);
  score += Math.round((zeroCast ? 1100 : 700) * multiplier * activeRole.score);
  addEffect('tagParryFlash', 640, 410, activeCharacter.accent, 1.45 * multiplier);
  addEffect('hitSpark', 640, 255, activeCharacter.accent, 1.6 * multiplier);
  addSpriteEffect(getCharacterSpriteEffect(activeCharacter.name), 640, 360, 0.75, 0.44, 1);
  addSpriteEffect(getCharacterSpriteEffect(activeCharacter.name, 'heavy'), 640, 340, 0.65, 0.5, 0.95);
  if (zeroCast) {
    addSpriteEffect('parryPing', 640, 410, 0.8, 0.38, 0.9);
  }
  addEffect('beatRing', 640, 625, '#f5c84c', 1.3 * multiplier);
  addFloatingText(`${activeCharacter.name} ${zeroCast ? 'ZERO ULTIMATE' : 'ULTIMATE'}`, 640, 500, zeroCast ? '#dff6ff' : '#f5c84c');
  return true;
}

function startPhraseAction(name: PhraseName, gradePower: number, now: number) {
  const currentBeat = Math.floor(getBeatFloat(now));
  const color = getPhraseColor(name);
  const activeRole = getCharacterCombatRole(characters[activeCharacterIndex].name);
  const phraseScale = name === 'Cross Tag Assault' ? 1.35
    : name === 'Break' ? 1.18
      : name === 'Evasive Counter' ? 1.08
        : name === 'Rush' ? 1
          : 0.58;
  const damageBase = name === 'Cross Tag Assault' ? 4.8
    : name === 'Break' ? 3.6
      : name === 'Evasive Counter' ? 3.1
        : name === 'Rush' ? 2.7
          : 1.1;
  const groggyBase = name === 'Break' ? 5.8
    : name === 'Cross Tag Assault' ? 4.4
      : name === 'Evasive Counter' ? 3.8
        : name === 'Rush' ? 2.6
          : 0.8;

  activePhraseAction = {
    color,
    damagePerPulse: damageBase * phraseScale * gradePower * activeRole.damage,
    groggyPerPulse: groggyBase * phraseScale * gradePower * activeRole.groggy,
    intensity: phraseScale * Math.max(gradePower, 0.55),
    name,
    nextBeat: currentBeat + 1,
    pulseIndex: 0,
    untilBeat: currentBeat + 5,
  };

  counterUntil = Math.max(counterUntil, now + beatDuration * 4);
  playSfx('command', 0.68, name === 'Break' ? 0.82 : name === 'Cross Tag Assault' ? 1.08 : 1);
  playCharacterVoice(characters[activeCharacterIndex].name, name === 'Break' ? 0.52 : 0.42, name === 'Rush' ? 1.06 : 1);
  addCommandImpact(640, 298, color, activePhraseAction.intensity);
  addPhraseSignatureImpact(name, 640, 298, activePhraseAction.intensity);
  addFloatingText(name.toUpperCase(), 640, 468, color);
}

function resolveCommandPhrase(now: number) {
  const phraseInputs = commandBuffer.slice(0, 4);
  commandBuffer = [];
  const phraseName = getPhraseName(phraseInputs);
  const phrasePattern = phraseInputs.map((input) => normalizeCommandToken(input.token)).join(' ');
  const guidanceAttack = getGuidanceAttack(now);
  const guidance = getAttackGuidance(guidanceAttack);
  const matchesGuidance = !guidance || guidance.command.join(' ') === phrasePattern;
  const misses = countPhraseMisses(phraseInputs);
  const gradePower = Math.max(0.35, getAverageGradeMultiplier(phraseInputs));
  lastPhraseName = phraseName;

  if (misses >= 2 || phraseName === 'Broken Phrase') {
    combo = 0;
    sync = clamp(sync - 8, 0, 100);
    punishComboDrop(now, 1.2);
    activePhraseAction = undefined;
    addEffect('warningPulse', 640, 520, '#ff5a6e', 1.4);
    addFloatingText('BROKEN PHRASE', 640, 520, '#ff5a6e');
    return;
  }

  if (phraseName === 'Zync Ultimate') {
    const bestGrade = phraseInputs.some((input) => input.grade === 'PERFECT') ? 'PERFECT'
      : phraseInputs.some((input) => input.grade === 'GOOD') ? 'GOOD'
        : 'BAD';
    const cast = applyUltimate(bestGrade, now, true);
    lastPhraseName = cast ? 'Zync Ultimate' : 'Failed Ultimate';
    if (!cast) {
      startPhraseAction('Failed Ultimate', 0.45, now);
    }
    return;
  }

  const adjustedGradePower = (misses > 0 ? gradePower * 0.5 : gradePower) * (matchesGuidance ? 1 : 0.78);
  if (guidance && guidanceAttack && matchesGuidance) {
    guidanceAttack.resolved = true;
    addEffect('tagParryFlash', 640, 420, '#dff6ff', 1.1);
    addFloatingText('ROUTE MATCH', 640, 486, '#dff6ff');
  } else if (guidance) {
    sync = clamp(sync - 5, 0, 100);
    punishComboDrop(now, 0.6);
    addEffect('warningPulse', 640, 520, '#ff9f43', 0.9);
    addFloatingText('OFF ROUTE', 640, 520, '#ff9f43');
  }

  startPhraseAction(phraseName, adjustedGradePower, now);
  addZync((phraseName === 'Cross Tag Assault' ? 24 : phraseName === 'Break' ? 18 : phraseName === 'Rush' ? 14 : 10) * (matchesGuidance ? 1.25 : 0.65), phraseInputs[3].grade, now);
  score += Math.round(240 * adjustedGradePower * getCharacterCombatRole(characters[activeCharacterIndex].name).score);
  activePose = phraseName === 'Break' || phraseName === 'Cross Tag Assault' ? 'heavy3' : phraseName === 'Evasive Counter' ? 'counter' : 'weak3';
  activePoseUntil = now + beatDuration * 2.2;
}

function recordCommandInput(action: Action, grade: Grade, now: number) {
  commandBuffer.push({ grade, token: actionToCommandToken(action) });

  if (commandBuffer.length >= 4) {
    resolveCommandPhrase(now);
  }
}

function handleAction(action: Action) {
  if (playerHp <= 0 || bossHp <= 0) {
    return;
  }

  const now = performance.now() / 1000;
  startBgm(now);
  if (!isCommandInputTargetOpen(now)) {
    lastAction = 'ACTION PHASE';
    lastGrade = 'GOOD';
    addEffect('beatRing', 640, 625, '#8a95a8', 0.48);
    addFloatingText('ACTION PHASE', 640, 640, '#8a95a8');
    return;
  }

  const grade = gradeInput(now);
  const multiplier = gradeMultiplier(grade);
  lastGrade = grade;
  lastAction = action.toUpperCase();
  pushInput(action, now);
  recordCommandInput(action, grade, now);

  if (grade === 'MISS') {
    combo = 0;
    sync = clamp(sync - 5, 0, 100);
    punishComboDrop(now, 0.8);
    addEffect('pixelBurst', 640, 610, '#8a95a8', 0.65);
    addFloatingText('MISS', 640, 610, '#8a95a8');
    return;
  }

  combo += 1;
  maxCombo = Math.max(maxCombo, combo);
  sync = clamp(sync + (grade === 'PERFECT' ? 4 : 2), 0, 100);
  score += Math.round(90 * multiplier * (1 + combo / 45));

  if (action === 'weak' || action === 'heavy') {
    const attackPose = getAttackChainPose(action, now);
    const chainStep = action === 'weak' ? weakChainStep : heavyChainStep;
    setActivePose(attackPose, now, action === 'weak' ? 0.36 : 0.5);
    playSfx(action, action === 'weak' ? 0.42 : 0.62, action === 'weak' ? 1.05 + chainStep * 0.03 : 0.88 - chainStep * 0.02);
    playCharacterVoice(characters[activeCharacterIndex].name, action === 'weak' ? 0.32 : 0.46, action === 'weak' ? 1.04 : 0.95);
    applyAttack(action, grade, now, chainStep);
  }

  if (action === 'dodge') {
    const target = findDodgeTarget(now);
    resetAttackChain();
    setActivePose('dodge', now, 0.46);
    evasionUntil = now + (grade === 'PERFECT' ? 0.55 : 0.38);
    playSfx('dodge', 0.35, grade === 'PERFECT' ? 1.08 : 0.98);
    addEffect('afterimage', 640, 585, '#0fb9b1', multiplier);

    if (target) {
      target.resolved = true;
      counterUntil = now + 1;
      energy = clamp(energy + 7 * multiplier, 0, 100);
      score += Math.round(140 * multiplier);
      addEffect('pixelBurst', 640, 485, '#0fb9b1', multiplier);
      addFloatingText('EVADE WINDOW', 640, 485, '#0fb9b1');
      addZync(18, grade, now);
    } else {
      addFloatingText('STEP', 640, 575, '#8a95a8');
      addZync(5, grade, now);
    }
  }

  if (action === 'tagLeft' || action === 'tagRight') {
    resetAttackChain();
    const nextCharacterIndex = getTagTargetIndex(action);
    const nextCharacter = characters[nextCharacterIndex];
    const target = findParryTarget(now);
    activeCharacterIndex = nextCharacterIndex;
    setActivePose('dodge', now, target ? 0.62 : 0.42);
    playCharacterVoice(nextCharacter.name, target ? 0.55 : 0.38, target ? 0.96 : 1.04);

    lastAction = `${action === 'tagLeft' ? 'TAG L' : 'TAG R'} ${nextCharacter.name}`;

    if (target) {
      target.resolved = true;
      counterUntil = now + 1.4;
      groggy = clamp(groggy + 24 * multiplier * nextCharacter.groggyPower, 0, 100);
      energy = clamp(energy + 16 * multiplier, 0, 100);
      score += Math.round(280 * multiplier);
      playSfx('parry', 0.78, grade === 'PERFECT' ? 1.04 : 0.94);
      addEffect('tagParryFlash', 640, 465, nextCharacter.accent, 2.2 * multiplier);
      addSpriteEffect('parryPing', 640, 465, 1.24, 0.42, 1);
      addEffect('pixelBurst', 640, 300, '#f5c84c', 1.8 * multiplier);
      addCommandImpact(640, 360, nextCharacter.accent, 1.35 * multiplier);
      addFloatingText(`${nextCharacter.name} TAG PARRY`, 640, 465, nextCharacter.accent);
      addZync(30, grade, now);
    } else if (findUnparryableTarget(now)) {
      combo = 0;
      sync = clamp(sync - 8, 0, 100);
      punishComboDrop(now, 1);
      addEffect('warningPulse', 640, 465, '#ff5a6e', 1);
      addFloatingText('TAG BLOCKED', 640, 575, '#ff5a6e');
    } else {
      counterUntil = now + 0.55;
      playSfx('dodge', 0.32, 1.12);
      addEffect('beatRing', 640, 585, nextCharacter.accent, 0.85);
      addFloatingText(`${nextCharacter.name} TAG IN`, 640, 575, nextCharacter.accent);
      addZync(8, grade, now);
    }
  }

  if (groggy >= 100 && getBeatFloat(now) >= breakUntilBeat) {
    enterBreak(now);
  }
}

function resetFight() {
  playerHp = 100;
  bossHp = bossMaxHp;
  sync = 50;
  energy = 0;
  zync = 0;
  zeroFieldUntil = 0;
  zeroFieldStartedAt = 0;
  zeroUltimateAvailable = false;
  bgm.volume = 0.52;
  bgm.playbackRate = 1;
  groggy = 0;
  score = 0;
  combo = 0;
  maxCombo = 0;
  lastGrade = 'GOOD';
  lastAction = 'Ready';
  breakUntilBeat = -1;
  generatedCycle = -1;
  evasionUntil = 0;
  counterUntil = 0;
  activeCharacterIndex = 0;
  activePose = 'idle';
  activePoseUntil = 0;
  resetAttackChain();
  lastAttackChainTime = 0;
  lastSupportBeat = -1;
  lastGruntBeat = -1;
  activeAdvanceUntil = 0;
  activeAdvanceTargetY = 585;
  ultimateCutsceneUntil = 0;
  ultimateCutsceneStartedAt = 0;
  activeUltimateCutsceneId = undefined;
  activePhraseAction = undefined;
  commandBuffer = [];
  lastCommandInputOpen = true;
  lastPhraseName = 'None';
  syncSongClockToBgm();
  bossActor.x = 640;
  bossActor.y = 340;
  bossActor.attackUntil = 0;
  bossActor.nextMoveAt = 0;
  bossActor.targetX = 640;
  bossActor.targetY = 340;
  characterActors[0] = { attackUntil: 0, nextMoveAt: 0, x: 640, y: 585, targetX: 640, targetY: 585 };
  characterActors[1] = { attackUntil: 0, nextMoveAt: 0, x: 500, y: 585, targetX: 500, targetY: 585 };
  characterActors[2] = { attackUntil: 0, nextMoveAt: 0, x: 780, y: 585, targetX: 780, targetY: 585 };
  grunts[0].hp = grunts[0].maxHp;
  grunts[0].attackPhaseUntil = 0;
  grunts[0].actor = { attackUntil: 0, nextMoveAt: 0, x: 420, y: 392, targetX: 420, targetY: 392 };
  grunts[1].hp = grunts[1].maxHp;
  grunts[1].attackPhaseUntil = 0;
  grunts[1].actor = { attackUntil: 0, nextMoveAt: 0, x: 860, y: 398, targetX: 860, targetY: 398 };
  attacks.length = 0;
  inputHistory.length = 0;
  floatingTexts.length = 0;
  pixelEffects.length = 0;
  spriteSheetEffects.length = 0;
}

function drawPanel(x: number, y: number, width: number, height: number, accent = '#2c313a', alpha = 0.78) {
  gameContext.globalAlpha = alpha;
  gameContext.fillStyle = '#111721';
  gameContext.fillRect(x, y, width, height);
  gameContext.globalAlpha = 1;
  gameContext.fillStyle = accent;
  gameContext.fillRect(x, y, 4, height);
  gameContext.fillRect(x, y, width, 2);
}

function drawBar(x: number, y: number, width: number, height: number, value: number, color: string, back = '#20242b') {
  gameContext.fillStyle = back;
  gameContext.fillRect(x, y, width, height);
  gameContext.fillStyle = color;
  gameContext.fillRect(x, y, width * clamp(value / 100, 0, 1), height);
}

function drawText(text: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left') {
  gameContext.fillStyle = color;
  gameContext.font = `${size}px system-ui, sans-serif`;
  gameContext.textAlign = align;
  gameContext.fillText(text, x, y);
}

function drawNoteHead(x: number, y: number, width: number, height: number, color: string, alpha: number) {
  gameContext.save();
  gameContext.translate(x, y);
  gameContext.rotate(-0.28);
  gameContext.globalAlpha = alpha;
  gameContext.fillStyle = color;
  gameContext.fillRect(Math.round(-width / 2), Math.round(-height / 2), Math.round(width), Math.round(height));
  gameContext.globalAlpha = 1;
  gameContext.restore();
}

function drawRhythmNote(note: RhythmNote, beatFloat: number, beatPulse: number) {
  const local = beatFloat + note.phase;
  const bob = Math.sin(local * Math.PI * 2) * note.drift;
  const sway = Math.cos(local * Math.PI * 1.2) * note.drift * 0.55;
  const pulseScale = 1 + beatPulse * 0.24 + Math.sin(local * Math.PI * 4) * 0.04;
  const size = note.size * pulseScale;
  const x = note.x + sway;
  const y = note.y + bob;
  const alpha = 0.16 + beatPulse * 0.26;

  gameContext.save();
  gameContext.shadowColor = note.color;
  gameContext.shadowBlur = 14 + beatPulse * 18;
  gameContext.lineWidth = Math.max(2, size * 0.12);
  gameContext.strokeStyle = note.color;

  if (note.variant === 'diamond') {
    gameContext.globalAlpha = alpha * 0.8;
    gameContext.fillStyle = note.color;
    gameContext.translate(x, y);
    gameContext.rotate(Math.PI / 4 + local * 0.08);
    gameContext.fillRect(Math.round(-size * 0.32), Math.round(-size * 0.32), Math.round(size * 0.64), Math.round(size * 0.64));
    gameContext.restore();
    return;
  }

  drawNoteHead(x, y + size * 0.42, size * 0.52, size * 0.34, note.color, alpha);
  gameContext.globalAlpha = alpha;
  gameContext.beginPath();
  gameContext.moveTo(x + size * 0.22, y + size * 0.32);
  gameContext.lineTo(x + size * 0.22, y - size * 0.72);
  gameContext.stroke();

  if (note.variant === 'double') {
    const x2 = x + size * 0.62;
    drawNoteHead(x2, y + size * 0.3, size * 0.52, size * 0.34, note.color, alpha);
    gameContext.beginPath();
    gameContext.moveTo(x2 + size * 0.22, y + size * 0.2);
    gameContext.lineTo(x2 + size * 0.22, y - size * 0.84);
    gameContext.moveTo(x + size * 0.22, y - size * 0.72);
    gameContext.lineTo(x2 + size * 0.22, y - size * 0.84);
    gameContext.stroke();
  } else {
    gameContext.beginPath();
    gameContext.moveTo(x + size * 0.22, y - size * 0.72);
    gameContext.quadraticCurveTo(x + size * 0.78, y - size * 0.64, x + size * 0.7, y - size * 0.18);
    gameContext.stroke();
  }

  gameContext.globalAlpha = 1;
  gameContext.restore();
}

function drawRhythmAtmosphere(now: number) {
  const beatFloat = getBeatFloat(now);
  const beatPhase = beatFloat - Math.floor(beatFloat);
  const beatPulse = Math.pow(1 - beatPhase, 2.6);

  rhythmNotes.forEach((note) => {
    drawRhythmNote(note, beatFloat, beatPulse);
  });

  gameContext.save();
  gameContext.globalAlpha = 0.08 + beatPulse * 0.1;
  gameContext.strokeStyle = '#0fb9b1';
  gameContext.lineWidth = 2 + beatPulse * 3;
  for (let index = 0; index < 3; index += 1) {
    const radius = 112 + index * 52 + beatPhase * 32;
    gameContext.beginPath();
    gameContext.arc(640, 520, radius, Math.PI * 1.08, Math.PI * 1.92);
    gameContext.stroke();
  }
  gameContext.restore();
}

function drawRhythmLane(now: number) {
  const beatFloat = getBeatFloat(now);
  const laneLeftX = 150;
  const laneRightX = 1130;
  const laneCenterX = 640;
  const laneY = 625;
  const travelBeats = 4;
  const phase = beatFloat - Math.floor(beatFloat);
  const pulse = Math.pow(1 - phase, 2.4);

  gameContext.save();
  gameContext.globalAlpha = 0.9;
  gameContext.strokeStyle = '#1b5662';
  gameContext.lineWidth = 3;
  gameContext.beginPath();
  gameContext.moveTo(laneLeftX, laneY);
  gameContext.lineTo(laneCenterX - 36, laneY);
  gameContext.moveTo(laneCenterX + 36, laneY);
  gameContext.lineTo(laneRightX, laneY);
  gameContext.stroke();

  gameContext.globalAlpha = 0.22 + pulse * 0.24;
  gameContext.strokeStyle = '#0fb9b1';
  gameContext.lineWidth = 8;
  gameContext.beginPath();
  gameContext.moveTo(laneLeftX, laneY);
  gameContext.lineTo(laneCenterX - 36, laneY);
  gameContext.moveTo(laneCenterX + 36, laneY);
  gameContext.lineTo(laneRightX, laneY);
  gameContext.stroke();

  for (let index = 0; index < 6; index += 1) {
    const t = index / 5;
    const leftTickX = laneLeftX + (laneCenterX - 36 - laneLeftX) * t;
    const rightTickX = laneRightX - (laneRightX - laneCenterX - 36) * t;
    gameContext.globalAlpha = index === 5 ? 0.7 : 0.22;
    gameContext.fillStyle = index === 5 ? '#dff6ff' : '#0fb9b1';
    gameContext.fillRect(Math.round(leftTickX - 2), laneY - 8, 4, 16);
    gameContext.fillRect(Math.round(rightTickX - 2), laneY - 8, 4, 16);
  }

  const firstBeat = Math.floor(beatFloat) - 1;
  const lastBeat = Math.ceil(beatFloat + travelBeats + 1);

  for (let targetBeat = firstBeat; targetBeat <= lastBeat; targetBeat += 1) {
    if (!isCommandInputBeat(targetBeat)) {
      continue;
    }

    const progress = 1 - (targetBeat - beatFloat) / travelBeats;

    if (progress < -0.04 || progress > 1.12) {
      continue;
    }

    const passed = progress > 1;
    const distanceToPerfect = Math.abs(progress - 1);
    const nodeRadius = 12 + Math.max(0, 1 - distanceToPerfect * 5) * 5;
    const alpha = passed ? Math.max(0, 1 - (progress - 1) * 6) : 0.62 + Math.max(0, 1 - distanceToPerfect * 3) * 0.32;
    const bossAttackForNote = attacks.find(
      (attack) => !attack.resolved && targetBeat >= attack.impactBeat - commandInputBeats && targetBeat < attack.impactBeat,
    );
    const guidanceSlot = bossAttackForNote ? targetBeat - (bossAttackForNote.impactBeat - commandInputBeats) : -1;
    const guidanceKey = getGuidanceKeyForAttackSlot(bossAttackForNote, guidanceSlot);
    const noteColor = guidanceKey ? getKeyColor(guidanceKey) : '#0fb9b1';
    const fillColor = guidanceKey ? noteColor : '#dff6ff';

    const drawLaneNode = (x: number) => {
      gameContext.globalAlpha = alpha;
      gameContext.shadowColor = noteColor;
      gameContext.shadowBlur = 10 + Math.max(0, 1 - distanceToPerfect * 4) * 18;
      gameContext.fillStyle = fillColor;
      gameContext.beginPath();
      gameContext.arc(x, laneY, nodeRadius, 0, Math.PI * 2);
      gameContext.fill();
      gameContext.strokeStyle = noteColor;
      gameContext.lineWidth = 3;
      gameContext.stroke();
      gameContext.shadowBlur = 0;

      gameContext.globalAlpha = alpha * 0.48;
      gameContext.fillStyle = guidanceKey ? '#101114' : '#0fb9b1';
      gameContext.beginPath();
      gameContext.arc(x, laneY, Math.max(4, nodeRadius * 0.35), 0, Math.PI * 2);
      gameContext.fill();

      if (guidanceKey && progress > 0.72 && progress < 1.08) {
        drawText(guidanceKey, x, laneY - 28, 13, noteColor, 'center');
      }
    };

    drawLaneNode(laneLeftX + (laneCenterX - laneLeftX) * progress);
    drawLaneNode(laneRightX - (laneRightX - laneCenterX) * progress);
  }

  gameContext.globalAlpha = 0.38 + pulse * 0.34;
  gameContext.strokeStyle = '#dff6ff';
  gameContext.lineWidth = 3 + pulse * 2;
  gameContext.beginPath();
  gameContext.arc(laneCenterX, laneY, 30 + pulse * 6, 0, Math.PI * 2);
  gameContext.stroke();
  drawText('PERFECT', laneCenterX, laneY + 45, 11, '#8a95a8', 'center');

  gameContext.globalAlpha = 1;
  gameContext.restore();
}

function drawBoss(now: number) {
  const activeAttack = getActiveAttack(now);
  const groggyActive = isBossGroggy(now);
  const phase = groggyActive ? 'groggy' : getAttackPhase(activeAttack, now);
  const attackColor = activeAttack?.guardType === 'unparryable' ? '#ff5a6e' : '#f5c84c';
  const x = bossActor.x;

  grunts.forEach((grunt, index) => {
    if (grunt.hp <= 0) {
      return;
    }

    const gruntPhase = now < grunt.attackPhaseUntil ? 'impact' : 'idle';
    const color = grunt.id === 'EG-01' ? '#f5c84c' : '#ff5a6e';
    drawPixelGrunt(gameContext, grunt.id, grunt.actor.x, grunt.actor.y, grunt.id === 'EG-01' ? 0.46 : 0.44, {
      beat: getBeatFloat(now) + 0.25 + index * 0.3,
      move: activeAttack?.move,
      phase: gruntPhase,
      warningColor: color,
    });
    drawBar(grunt.actor.x - 44, grunt.actor.y + 42, 88, 5, (grunt.hp / grunt.maxHp) * 100, color, '#151923');
  });

  drawPixelBoss(gameContext, x, bossActor.y, 1.35, coreBrutePalette, {
    beat: getBeatFloat(now),
    move: activeAttack?.move,
    phase,
    warningColor: groggyActive ? '#f5c84c' : activeAttack ? attackColor : coreBrutePalette.armor,
  });

  const label = activeAttack
    ? `${activeAttack.move.toUpperCase()} · ${activeAttack.guardType === 'parryable' ? 'PARRY' : 'DODGE'}`
    : groggyActive
      ? 'EXHAUSTED · FREE COMBO'
      : 'WATCH THE BOSS';
  drawText(label, x, 112, 15, groggyActive ? '#f5c84c' : activeAttack ? attackColor : '#8a95a8', 'center');
}

function drawParty(now: number) {
  const isEvading = now <= evasionUntil;
  const isCounter = now <= counterUntil;
  const lean = isEvading ? -34 : 0;
  const activeCharacter = characters[activeCharacterIndex];
  const supportIndexes = getSupportCharacterIndexes();
  const supportCharacters = supportIndexes.map((index) => characters[index]);

  supportCharacters.forEach((character, index) => {
    const characterIndex = supportIndexes[index];
    const actor = characterActors[characterIndex];
    const supportPose: CharacterPose = now < actor.attackUntil ? 'weak1' : isActorMoving(actor) ? 'walk' : 'idle';

    gameContext.globalAlpha = 0.65;
    drawPixelCharacter(gameContext, character, actor.x, actor.y, 2.15, {
      active: supportPose !== 'idle' && supportPose !== 'walk',
      beat: getBeatFloat(now) + index * 0.35,
      counter: false,
      evading: false,
      pose: supportPose,
    });
    gameContext.globalAlpha = 1;
    drawText(character.name, actor.x, actor.y + 72, 13, '#8a95a8', 'center');
  });

  const activeActor = characterActors[activeCharacterIndex];
  const activePoseNow = now <= activePoseUntil ? activePose : isActorMoving(activeActor) ? 'walk' : isCounter ? 'counter' : 'idle';
  drawPixelCharacter(gameContext, activeCharacter, activeActor.x + lean, activeActor.y, 2.85, {
    active: true,
    beat: getBeatFloat(now),
    counter: isCounter,
    evading: isEvading,
    pose: activePoseNow,
  });
  drawText(activeCharacter.name, activeActor.x + lean, activeActor.y + 98, 15, activeCharacter.accent, 'center');
}

function drawAttackRead(now: number) {
  const attack = getGuidanceAttack(now);

  if (!attack) {
    drawText(isBossGroggy(now) ? 'Boss exhausted. Push damage.' : 'Enemy neutral. Build pressure.', 640, 420, 17, '#8a95a8', 'center');
    return;
  }

  const beatFloat = getBeatFloat(now);
  const untilImpact = attack.impactBeat - beatFloat;
  const color = attack.guardType === 'parryable' ? '#f5c84c' : '#ff5a6e';
  const pulse = Math.max(0, Math.sin(getBeatFloat(now) * Math.PI * 2));
  const urgent = untilImpact <= 2;

  gameContext.save();
  gameContext.globalAlpha = urgent ? 0.16 + pulse * 0.16 : 0.08 + pulse * 0.08;
  gameContext.strokeStyle = color;
  gameContext.lineWidth = urgent ? 12 : 7;
  gameContext.strokeRect(28, 188, 1224, 404);
  gameContext.globalAlpha = 1;
  drawText(`${attack.guardType === 'parryable' ? 'YELLOW' : 'RED'} ${attack.move.toUpperCase()} · ${Math.max(untilImpact, 0).toFixed(1)} BEATS`, 640, 420, 18, color, 'center');
  drawText('FOLLOW COLORED NOTES', 640, 446, 12, '#8a95a8', 'center');

  gameContext.restore();
}

function drawBeatRing(now: number) {
  const beatFloat = getBeatFloat(now);
  const phase = beatFloat - Math.floor(beatFloat);
  const radius = 38 + (1 - phase) * 30;
  const x = 640;
  const y = 625;

  gameContext.strokeStyle = '#0fb9b1';
  gameContext.lineWidth = 4;
  gameContext.beginPath();
  gameContext.arc(x, y, radius, 0, Math.PI * 2);
  gameContext.stroke();

  gameContext.fillStyle = '#f0f3f7';
  gameContext.beginPath();
  gameContext.arc(x, y, 12, 0, Math.PI * 2);
  gameContext.fill();

  drawText(`${bpm} BPM · BGM ${bgmStatus}`, x, y - 48, 12, bgmStatus === 'ON' ? '#0fb9b1' : '#8a95a8', 'center');
}

function drawFloatingTexts(deltaSeconds: number) {
  for (let index = floatingTexts.length - 1; index >= 0; index -= 1) {
    const item = floatingTexts[index];
    item.ttl -= deltaSeconds;
    item.y -= deltaSeconds * 42;

    if (item.ttl <= 0) {
      floatingTexts.splice(index, 1);
      continue;
    }

    gameContext.globalAlpha = clamp(item.ttl / 0.85, 0, 1);
    drawText(item.text, item.x, item.y, 24, item.color, 'center');
    gameContext.globalAlpha = 1;
  }
}

function drawCutsceneEnergyLine(x: number, y: number, length: number, width: number, angle: number, color: string, alpha: number) {
  gameContext.save();
  gameContext.translate(x, y);
  gameContext.rotate(angle);
  const gradient = gameContext.createLinearGradient(-length / 2, 0, length / 2, 0);
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(0.35, color);
  gradient.addColorStop(0.5, '#ffffff');
  gradient.addColorStop(0.65, color);
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  gameContext.globalAlpha = alpha;
  gameContext.fillStyle = gradient;
  gameContext.fillRect(-length / 2, -width / 2, length, width);
  gameContext.restore();
}

function drawCutsceneOverlay(progress: number, elapsed: number, style: UltimateCutsceneStyle) {
  const beatPulse = 0.5 + Math.sin(elapsed * Math.PI * 8) * 0.5;
  const burst = clamp(1 - progress / 0.34, 0, 1);
  const sweep = clamp((progress - 0.08) / 0.38, 0, 1);
  const outro = clamp((progress - 0.82) / 0.18, 0, 1);

  gameContext.save();
  gameContext.globalCompositeOperation = 'screen';

  for (let index = 0; index < 26; index += 1) {
    const phase = (index / 26 + elapsed * (0.18 + (index % 5) * 0.015)) % 1;
    const y = 70 + ((index * 53) % 620);
    const x = -180 + phase * 1640;
    const width = 140 + (index % 4) * 55;
    const alpha = (0.12 + beatPulse * 0.12) * (1 - outro);
    drawCutsceneEnergyLine(x, y, width, 3 + (index % 3), style.slashAngle, index % 2 ? style.accent : style.secondary, alpha);
  }

  for (let index = 0; index < 44; index += 1) {
    const seed = index * 97.13;
    const phase = (elapsed * (0.22 + (index % 7) * 0.025) + index * 0.061) % 1;
    const x = ((seed * 13) % 1280) + Math.sin(elapsed * 2 + index) * 28;
    const y = 720 - phase * 820 + Math.cos(elapsed * 3 + index * 0.4) * 18;
    const size = 2 + (index % 5);
    gameContext.globalAlpha = (0.18 + beatPulse * 0.18) * (1 - outro);
    gameContext.fillStyle = index % 3 === 0 ? style.spark : index % 3 === 1 ? style.accent : style.secondary;
    gameContext.beginPath();
    gameContext.arc(x, y, size, 0, Math.PI * 2);
    gameContext.fill();
  }

  drawCutsceneEnergyLine(640 + sweep * 140 - 70, 352, 1500, 18 + beatPulse * 8, style.slashAngle, style.accent, 0.38 * (1 - outro));
  drawCutsceneEnergyLine(580 - sweep * 180, 432, 1260, 9 + beatPulse * 5, style.slashAngle + 0.18, style.secondary, 0.28 * (1 - outro));
  gameContext.restore();

  if (burst > 0) {
    gameContext.save();
    gameContext.globalCompositeOperation = 'screen';
    gameContext.globalAlpha = burst * 0.82;
    gameContext.fillStyle = style.spark;
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    gameContext.restore();
  }

  if (sweep < 1) {
    const bandWidth = 520 * (1 - sweep);
    gameContext.save();
    gameContext.globalAlpha = 0.74 * (1 - sweep);
    gameContext.fillStyle = '#05070d';
    gameContext.beginPath();
    gameContext.moveTo(0, 0);
    gameContext.lineTo(bandWidth, 0);
    gameContext.lineTo(0, gameCanvas.height);
    gameContext.closePath();
    gameContext.fill();
    gameContext.beginPath();
    gameContext.moveTo(gameCanvas.width, 0);
    gameContext.lineTo(gameCanvas.width - bandWidth, gameCanvas.height);
    gameContext.lineTo(gameCanvas.width, gameCanvas.height);
    gameContext.closePath();
    gameContext.fill();
    gameContext.restore();
  }
}

function drawUltimateCutscene(now: number) {
  if (!activeUltimateCutsceneId || now >= ultimateCutsceneUntil) {
    return;
  }

  const image = ultimateCutsceneImages[activeUltimateCutsceneId];
  const style = ultimateCutsceneStyles[activeUltimateCutsceneId];
  const elapsed = now - ultimateCutsceneStartedAt;
  const progress = clamp((now - ultimateCutsceneStartedAt) / ultimateCutsceneDuration, 0, 1);
  const fadeIn = clamp(progress / 0.04, 0, 1);
  const fadeOut = clamp((1 - progress) / 0.12, 0, 1);
  const alpha = Math.min(fadeIn, fadeOut);
  const shake = clamp(1 - progress / 0.28, 0, 1);
  const scale = 1.08 - 0.04 * clamp(progress / 0.7, 0, 1);
  const shakeX = Math.sin(elapsed * 84) * 9 * shake;
  const shakeY = Math.cos(elapsed * 71) * 5 * shake;

  gameContext.save();
  gameContext.globalAlpha = alpha;
  gameContext.translate(gameCanvas.width / 2 + shakeX, gameCanvas.height / 2 + shakeY);
  gameContext.scale(scale, scale);
  gameContext.translate(-gameCanvas.width / 2, -gameCanvas.height / 2);

  if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
    const canvasRatio = gameCanvas.width / gameCanvas.height;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;

    if (imageRatio > canvasRatio) {
      sourceWidth = image.naturalHeight * canvasRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = image.naturalWidth / canvasRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }

    gameContext.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, gameCanvas.width, gameCanvas.height);
  } else {
    gameContext.fillStyle = '#05070d';
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
  }

  gameContext.globalAlpha = alpha * 0.26;
  gameContext.fillStyle = '#05070d';
  gameContext.fillRect(0, 0, gameCanvas.width, 84);
  gameContext.fillRect(0, gameCanvas.height - 96, gameCanvas.width, 96);
  gameContext.restore();

  gameContext.save();
  gameContext.globalAlpha = alpha;
  drawCutsceneOverlay(progress, elapsed, style);
  gameContext.restore();
}

function drawZeroFieldFeedback(now: number) {
  if (!isZeroFieldActive(now)) {
    return;
  }

  const elapsed = now - zeroFieldStartedAt;
  const pulse = 0.5 + Math.max(0, Math.sin(getBeatFloat(now) * Math.PI * 2)) * 0.5;
  const intro = clamp(1 - elapsed / 1.2, 0, 1);

  gameContext.save();
  gameContext.globalAlpha = 0.08 + pulse * 0.08 + intro * 0.18;
  gameContext.fillStyle = '#dff6ff';
  gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  gameContext.globalAlpha = 0.18 + pulse * 0.22;
  gameContext.strokeStyle = '#dff6ff';
  gameContext.lineWidth = 4 + pulse * 5;
  gameContext.strokeRect(18, 18, gameCanvas.width - 36, gameCanvas.height - 36);
  gameContext.strokeRect(42, 42, gameCanvas.width - 84, gameCanvas.height - 84);

  for (let index = 0; index < 10; index += 1) {
    const x = 110 + index * 118 + Math.sin(elapsed * 2 + index) * 20;
    const y = 128 + ((index * 53) % 430);
    gameContext.globalAlpha = 0.16 + pulse * 0.18;
    drawText('ZERO', x, y, 16 + (index % 3) * 3, index % 2 === 0 ? '#dff6ff' : '#7c5cff', 'center');
  }

  gameContext.globalAlpha = intro;
  drawText('ZERO FIELD', 640, 188, 46, '#dff6ff', 'center');
  gameContext.restore();
}

function drawHud(now: number) {
  const beatFloat = getBeatFloat(now);
  const inputOpen = isCommandInputBeat(beatFloat);
  const inBreak = beatFloat < breakUntilBeat;
  const inZeroField = isZeroFieldActive(now);
  const zeroRemaining = Math.max(0, zeroFieldUntil - now);
  const result = playerHp <= 0 ? 'FAILED' : bossHp <= 0 ? 'CLEARED' : inZeroField ? 'ZERO FIELD' : inBreak ? 'EXHAUSTED' : inputOpen ? 'COMMAND INPUT' : 'ACTION PHASE';
  const activeAttack = getIncomingAttack(now);
  const guidanceAttack = getGuidanceAttack(now);
  const intentAttack = activeAttack ?? guidanceAttack;
  const warningColor = inZeroField ? '#dff6ff' : intentAttack?.guardType === 'unparryable' ? '#ff5a6e' : intentAttack ? '#f5c84c' : '#0fb9b1';

  drawPanel(292, 24, 696, 74, warningColor, 0.82);
  drawText('CORE BRUTE', 320, 51, 18, '#f0f3f7');
  drawText(result, 958, 51, 14, inZeroField ? '#dff6ff' : inBreak ? '#f5c84c' : '#8a95a8', 'right');
  drawBar(320, 64, 640, 12, (bossHp / bossMaxHp) * 100, '#ff5a6e');
  drawBar(320, 84, 640, 8, groggy, '#f5c84c');
  drawText('HP', 292, 74, 11, '#8a95a8');
  drawText('GRG', 292, 94, 11, '#8a95a8');

  drawPanel(24, 24, 218, 210, inZeroField ? '#dff6ff' : characters[activeCharacterIndex].accent, inZeroField ? 0.95 : 0.78);
  drawText('PARTY', 42, 52, 16, '#f0f3f7');
  characters.forEach((character, index) => {
    const y = 74 + index * 30;
    const active = index === activeCharacterIndex;
    gameContext.fillStyle = active ? character.accent : '#2a303a';
    gameContext.fillRect(42, y, 16, 16);
    drawText(character.name, 66, y + 13, 13, active ? '#f0f3f7' : '#8a95a8');
    drawText(`GRG x${character.groggyPower.toFixed(2)}`, 200, y + 13, 11, active ? character.accent : '#596171', 'right');
  });
  drawBar(42, 160, 178, 8, playerHp, '#0fb9b1');
  const activeRole = getCharacterCombatRole(characters[activeCharacterIndex].name);
  const zeroGaugeValue = inZeroField ? Math.min(100, (zeroRemaining / zeroFieldDuration) * 100) : zync;
  const zeroPulse = inZeroField ? 0.5 + Math.max(0, Math.sin(beatFloat * Math.PI * 2)) * 0.5 : 0;
  drawText(activeRole.label, 42, 184, 11, characters[activeCharacterIndex].accent);
  drawText(inZeroField ? `ZERO ${zeroRemaining.toFixed(1)}s` : 'ZYNC DRIVE', 42, 204, 12, inZeroField ? '#dff6ff' : '#8a95a8');
  if (inZeroField) {
    gameContext.strokeStyle = '#dff6ff';
    gameContext.lineWidth = 2 + zeroPulse * 3;
    gameContext.strokeRect(38, 190, 186, 28);
  }
  drawBar(122, 196, 98, 10, zeroGaugeValue, inZeroField ? '#dff6ff' : '#7c5cff');
  drawText(zeroUltimateAvailable ? 'ULT READY' : inZeroField ? 'CHAIN IT' : `${Math.floor(zync)}/${zyncMax}`, 220, 214, 10, zeroUltimateAvailable ? '#f5c84c' : inZeroField ? '#dff6ff' : '#8a95a8', 'right');

  drawPanel(1014, 24, 242, 206, '#7c5cff', 0.78);
  drawText('TIMING', 1032, 52, 16, '#f0f3f7');
  drawText(lastGrade, 1238, 52, 20, lastGrade === 'PERFECT' ? '#f5c84c' : '#f0f3f7', 'right');
  drawText(lastAction, 1032, 82, 14, '#8a95a8');
  drawText(`COMBO ${combo}`, 1032, 112, 20, '#f0f3f7');
  drawText(`MAX ${maxCombo}`, 1238, 112, 12, '#8a95a8', 'right');
  drawBar(1032, 132, 196, 8, sync, '#f5c84c');
  drawText(`SCORE ${score}`, 1032, 164, 15, '#f0f3f7');
  drawText('ENERGY', 1032, 188, 12, '#8a95a8');
  drawBar(1092, 180, 136, 8, energy, '#0fb9b1');
  drawText(inZeroField ? 'ZERO AUDIO BOOST' : 'ROUTE SCORE', 1032, 214, 12, inZeroField ? '#dff6ff' : '#8a95a8');

  const bufferWidth = 92;
  const bufferGap = 14;
  const bufferX = (gameCanvas.width - bufferWidth * 4 - bufferGap * 3) / 2;
  const bufferY = 668;
  for (let index = 0; index < 4; index += 1) {
    const entry = commandBuffer[index];
    const x = bufferX + index * (bufferWidth + bufferGap);
    const keyLabel = entry ? getCommandTokenLabel(entry.token) : '-';
    const keyColor = entry ? getKeyColor(keyLabel) : '#2c313a';
    gameContext.fillStyle = entry ? '#1d2632' : '#10151d';
    gameContext.fillRect(x, bufferY, bufferWidth, 42);
    gameContext.strokeStyle = entry ? keyColor : '#2c313a';
    gameContext.lineWidth = entry ? 3 : 2;
    gameContext.strokeRect(x, bufferY, bufferWidth, 42);
    drawText(keyLabel, x + bufferWidth / 2, bufferY + 29, 22, entry ? keyColor : '#596171', 'center');
  }
  drawText(
    activePhraseAction ? `EXECUTING ${activePhraseAction.name.toUpperCase()}` : `PHRASE ${lastPhraseName.toUpperCase()}`,
    640,
    630,
    13,
    activePhraseAction ? activePhraseAction.color : '#8a95a8',
    'center',
  );

  const banner = inBreak
    ? 'EXHAUSTED: FREE COMBO'
    : inZeroField
      ? `ZERO FIELD: DAMAGE x1.35 · GROGGY x1.55 · ${zeroUltimateAvailable ? 'ULTIMATE READY' : 'ULTIMATE USED'}`
      : !inputOpen
        ? 'ACTION PHASE: WATCH THE 4-BEAT EXECUTION'
        : intentAttack
      ? intentAttack.guardType === 'parryable'
        ? 'YELLOW: TAG PARRY OR DODGE'
        : 'RED: DODGE ONLY'
      : 'NEUTRAL: BUILD RHYTHM PRESSURE';
  drawText(banner, 640, 694, 14, warningColor, 'center');
}

function updatePhraseAction(now: number) {
  if (!activePhraseAction) {
    return;
  }

  const currentBeat = Math.floor(getBeatFloat(now));
  if (currentBeat >= activePhraseAction.untilBeat) {
    activePhraseAction = undefined;
    return;
  }

  if (currentBeat < activePhraseAction.nextBeat) {
    return;
  }

  const pulse = activePhraseAction.pulseIndex;
  const offset = [-132, -44, 44, 132][pulse % 4] ?? 0;
  const y = activePhraseAction.name === 'Evasive Counter' ? 360 : activePhraseAction.name === 'Cross Tag Assault' ? 316 : 332;
  const x = 640 + offset;
  const activeCharacter = characters[activeCharacterIndex];
  characterActors[activeCharacterIndex].attackUntil = now + 0.46;
  activeAdvanceUntil = now + 0.52;
  activeAdvanceTargetY = pulse % 2 === 0 ? 492 : 474;
  bossHp = clamp(bossHp - activePhraseAction.damagePerPulse, 0, bossMaxHp);
  groggy = clamp(groggy + activePhraseAction.groggyPerPulse * activeCharacter.groggyPower, 0, 100);
  score += Math.round(80 * activePhraseAction.intensity);
  playSfx(
    activePhraseAction.name === 'Break' ? 'heavy' : activePhraseAction.name === 'Cross Tag Assault' ? 'parry' : 'command',
    activePhraseAction.name === 'Cross Tag Assault' ? 0.58 : 0.46,
    activePhraseAction.name === 'Rush' ? 1.12 : activePhraseAction.name === 'Break' ? 0.82 : 1,
  );
  addCommandImpact(x, y, activePhraseAction.color, activePhraseAction.intensity);
  addPhraseSignatureImpact(activePhraseAction.name, x, y, activePhraseAction.intensity);

  if (activePhraseAction.name === 'Cross Tag Assault' && pulse % 2 === 1) {
    const supportIndexes = getSupportCharacterIndexes();
    const supportIndex = supportIndexes[pulse % supportIndexes.length] ?? activeCharacterIndex;
    const support = characters[supportIndex];
    characterActors[supportIndex].attackUntil = now + 0.5;
    addSpriteEffect(getCharacterSpriteEffect(support.name, 'heavy'), 640 - offset * 0.45, y + 30, 0.92, 0.36, 0.9);
    addEffect('slashArc', 640 - offset * 0.45, y + 30, support.accent, activePhraseAction.intensity);
  }

  if (groggy >= 100 && getBeatFloat(now) >= breakUntilBeat) {
    enterBreak(now);
  }

  activePhraseAction.pulseIndex += 1;
  activePhraseAction.nextBeat += 1;
}

function updateSupportAttacks(now: number) {
  const currentBeat = Math.floor(getBeatFloat(now));

  if (currentBeat === lastSupportBeat || currentBeat % 2 !== 0 || bossHp <= 0 || playerHp <= 0) {
    return;
  }

  lastSupportBeat = currentBeat;
  let supportGroggy = 0;
  const supportIndexes = getSupportCharacterIndexes();
  const supportSides: Array<'left' | 'right'> = ['left', 'right'];

  supportIndexes.forEach((characterIndex, supportIndex) => {
    const character = characters[characterIndex];
    const actor = characterActors[characterIndex];
    const side = supportSides[supportIndex];
    const sideGrunt = getLivingSideGrunt(side);
    const attackPosition = getSupportTarget(side);

    if (!isNearPoint(actor, attackPosition, 76)) {
      actor.targetX = attackPosition.x;
      actor.targetY = attackPosition.y;
      actor.nextMoveAt = now + 0.16;
      return;
    }

    if (sideGrunt) {
      const role = getCharacterCombatRole(character.name);
      const damage = (2.6 + character.groggyPower * 0.8) * role.damage;
      actor.attackUntil = now + 0.42;
      sideGrunt.hp = clamp(sideGrunt.hp - damage, 0, sideGrunt.maxHp);
      playSfx('weak', 0.16, side === 'left' ? 1.1 : 0.98);
      addEffect('hitSpark', sideGrunt.actor.x, sideGrunt.actor.y + 28, character.accent, 0.35);
      addSpriteEffect(getCharacterSpriteEffect(character.name), sideGrunt.actor.x, sideGrunt.actor.y + 18, 0.32, 0.24, 0.78);

      if (sideGrunt.hp === 0) {
        addEffect('pixelBurst', sideGrunt.actor.x, sideGrunt.actor.y + 24, character.accent, 0.9);
        addFloatingText(`${sideGrunt.id} DOWN`, sideGrunt.actor.x, sideGrunt.actor.y + 18, character.accent);
      }

      return;
    }

    const role = getCharacterCombatRole(character.name);
    supportGroggy += 0.22 * character.groggyPower * role.groggy;
    actor.attackUntil = now + 0.42;
    bossHp = clamp(bossHp - 0.45 * role.damage, 0, bossMaxHp);
    playSfx('weak', 0.14, side === 'left' ? 1.08 : 0.96);
    addEffect('hitSpark', bossActor.x + (side === 'left' ? -80 : 80), bossActor.y + 34, character.accent, 0.25);
    addSpriteEffect(getCharacterSpriteEffect(character.name), bossActor.x + (side === 'left' ? -92 : 92), bossActor.y + 34, 0.38, 0.24, 0.72);
  });

  groggy = clamp(groggy + supportGroggy, 0, 100);
  score += (characters.length - 1) * 12;
}

function updateGruntAttacks(now: number) {
  const currentBeat = Math.floor(getBeatFloat(now));

  if (currentBeat === lastGruntBeat) {
    return;
  }

  lastGruntBeat = currentBeat;

  grunts.forEach((grunt) => {
    if (grunt.hp <= 0 || currentBeat % grunt.attackBeatModulo !== 1) {
      return;
    }

    grunt.attackPhaseUntil = now + 0.42;
    grunt.actor.attackUntil = now + 0.42;
  });
}

function updateFieldMotion(deltaSeconds: number, now: number) {
  const activeAttack = getActiveAttack(now);
  const bossHomeY = isBossGroggy(now) ? 365 : activeAttack?.move === 'slam' ? 350 : 340;
  scheduleMove(bossActor, now, 640, bossHomeY, 14, 5, 2.4, 4.4);
  moveActor(bossActor, 36, deltaSeconds);

  grunts.forEach((grunt, index) => {
    const homeX = grunt.side === 'left' ? 420 : 860;
    const homeY = grunt.side === 'left' ? 392 : 398;
    scheduleMove(grunt.actor, now, homeX, homeY, 28, 16, 1.1 + index * 0.2, 2.2 + index * 0.3);
    moveActor(grunt.actor, 44, deltaSeconds);
  });

  const supportIndexes = getSupportCharacterIndexes();
  const supportSides: Array<'left' | 'right'> = ['left', 'right'];
  characterActors.forEach((actor, index) => {
    if (index === activeCharacterIndex) {
      actor.targetX = 640;
      actor.targetY = now < activeAdvanceUntil ? activeAdvanceTargetY : 585;
      moveActor(actor, now < activeAdvanceUntil ? 430 : 260, deltaSeconds);
      return;
    }

    const supportSideIndex = supportIndexes.indexOf(index);
    const side = supportSides[supportSideIndex] ?? 'left';
    const target = getSupportTarget(side);
    if (!isNearPoint(actor, target, 72)) {
      actor.targetX = target.x;
      actor.targetY = target.y;
      actor.nextMoveAt = now + 0.12;
    } else {
      scheduleMove(actor, now, target.x, target.y, 22, 12, 0.35 + index * 0.1, 0.9 + index * 0.15);
    }
    moveActor(actor, 150, deltaSeconds);
  });
}

function update(deltaSeconds: number, now: number) {
  const beatFloat = getBeatFloat(now);
  const beat = Math.floor(beatFloat);
  const commandInputOpen = isCommandInputBeat(beatFloat);

  if (commandInputOpen !== lastCommandInputOpen) {
    if (!commandInputOpen && commandBuffer.length > 0) {
      commandBuffer = [];
      combo = 0;
      sync = clamp(sync - 5, 0, 100);
      punishComboDrop(now, 0.7);
      lastPhraseName = 'Broken Phrase';
      addEffect('warningPulse', 640, 638, '#ff5a6e', 0.9);
      addFloatingText('INCOMPLETE PHRASE', 640, 638, '#ff5a6e');
    }
    lastCommandInputOpen = commandInputOpen;
  }

  if (queuedUltimatePreviewId && getSongTime(now) > 0.35) {
    triggerUltimateCutscene(queuedUltimatePreviewId, now);
    queuedUltimatePreviewId = undefined;
  }
  if (zeroFieldUntil > 0 && now >= zeroFieldUntil) {
    exitZeroField();
  }
  if (ultimateCutsceneUntil > 0 && now >= ultimateCutsceneUntil) {
    ultimateCutsceneUntil = 0;
    activeUltimateCutsceneId = undefined;
  }
  generateEnemyAttacks(beat);
  resolveEnemyHits(now);
  updatePhraseAction(now);
  updateSupportAttacks(now);
  updateGruntAttacks(now);
  updateFieldMotion(deltaSeconds, now);
  updatePixelEffects(pixelEffects, deltaSeconds);
  updateSpriteSheetEffects(spriteSheetEffects, deltaSeconds);

  if (sync <= 0) {
    playerHp = clamp(playerHp - deltaSeconds * 3, 0, 100);
  }
}

function render(nowMs: number) {
  const now = nowMs / 1000;
  const deltaSeconds = Math.min(now - lastFrame, 0.05);
  lastFrame = now;

  update(deltaSeconds, now);

  gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  const guidanceAttack = getGuidanceAttack(now);
  const activeAttack = getActiveAttack(now) ?? guidanceAttack;
  drawPixelCityStage(gameContext, gameCanvas.width, gameCanvas.height, {
    beat: getBeatFloat(now),
    warningColor: activeAttack?.guardType === 'unparryable' ? '#ff5a6e' : activeAttack ? '#f5c84c' : '#0fb9b1',
  });

  drawRhythmAtmosphere(now);
  drawBoss(now);
  drawAttackRead(now);
  drawSpriteSheetEffects(gameContext, spriteSheetEffects, { excludeType: 'parryPing' });
  drawPixelEffects(gameContext, pixelEffects);
  drawRhythmLane(now);
  drawBeatRing(now);
  drawParty(now);
  drawSpriteSheetEffects(gameContext, spriteSheetEffects, { onlyType: 'parryPing' });
  drawZeroFieldFeedback(now);
  drawHud(now);
  drawFloatingTexts(deltaSeconds);
  drawUltimateCutscene(now);

  requestAnimationFrame(render);
}

window.addEventListener('keydown', (event) => {
  if (event.repeat) {
    return;
  }

  if (event.code === 'KeyM') {
    toggleBgm();
    return;
  }

  if (event.code === 'KeyR') {
    resetFight();
    return;
  }

  const action = keys[event.code];

  if (action) {
    handleAction(action);
  }
});

document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action as Action | undefined;

    if (action) {
      handleAction(action);
    }
  });
});

bgmButton?.addEventListener('click', () => {
  toggleBgm();
});

updateBgmButton();

requestAnimationFrame(render);
