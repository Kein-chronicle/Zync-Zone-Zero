import './styles.css';
import { createPixelEffect, drawPixelEffects, type PixelEffect, updatePixelEffects } from './pixelEffects';
import { drawPixelCityStage } from './pixelEnvironment';
import { coreBrutePalette, drawPixelBoss, drawPixelCharacter, pixelCharacters } from './pixelSprites';
import {
  createSpriteSheetEffect,
  drawSpriteSheetEffects,
  type SpriteSheetEffect,
  updateSpriteSheetEffects,
} from './spriteSheetEffects';
import type { CharacterPose } from './spriteSheetSprites';

type Action = 'weak' | 'heavy' | 'dodge' | 'tag' | 'ultimate';
type Grade = 'MISS' | 'BAD' | 'GOOD' | 'PERFECT';
type EnemyMove = 'slash' | 'slam' | 'thrust';
type GuardType = 'parryable' | 'unparryable';

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

interface FloatingText {
  text: string;
  x: number;
  y: number;
  color: string;
  ttl: number;
}

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

app.innerHTML = `
  <main class="combat-shell">
    <canvas id="game" width="1280" height="720" aria-label="Zync Zone Zero action combat prototype"></canvas>
    <div class="input-strip" aria-label="combat controls">
      <button data-action="weak"><span>J</span>Weak</button>
      <button data-action="heavy"><span>K</span>Heavy</button>
      <button data-action="dodge"><span>L</span>Dodge</button>
      <button data-action="tag"><span>;</span>Tag Parry</button>
      <button data-action="ultimate"><span>I</span>Ultimate</button>
    </div>
  </main>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game');
const context = canvas?.getContext('2d');

if (!canvas || !context) {
  throw new Error('Canvas context not available');
}

const gameCanvas = canvas;
const gameContext = context;
const beatDuration = 0.5;
const attackCycleBeats = 16;
const startTime = performance.now() / 1000;
const attackPattern: Array<{ move: EnemyMove; guardType: GuardType; windup: number; impact: number }> = [
  { move: 'slash', guardType: 'parryable', windup: 5, impact: 6 },
  { move: 'slam', guardType: 'unparryable', windup: 12, impact: 13 },
];
const characters = pixelCharacters;
const keys: Record<string, Action> = {
  j: 'weak',
  k: 'heavy',
  l: 'dodge',
  ';': 'tag',
  i: 'ultimate',
};

let lastFrame = performance.now() / 1000;
let playerHp = 100;
let bossHp = 100;
let sync = 50;
let energy = 0;
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
const attacks: EnemyAttack[] = [];
const inputHistory: CombatInput[] = [];
const floatingTexts: FloatingText[] = [];
const pixelEffects: PixelEffect[] = [];
const spriteSheetEffects: SpriteSheetEffect[] = [];

function getSongTime(now = performance.now() / 1000) {
  return now - startTime;
}

function getBeatFloat(now = performance.now() / 1000) {
  return getSongTime(now) / beatDuration;
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function addFloatingText(text: string, x: number, y: number, color: string) {
  floatingTexts.push({ text, x, y, color, ttl: 0.85 });
}

function addEffect(type: PixelEffect['type'], x: number, y: number, color: string, intensity = 1) {
  pixelEffects.push(createPixelEffect(type, x, y, color, intensity));
}

function addSpriteEffect(type: SpriteSheetEffect['type'], x: number, y: number, scale: number, duration: number, alpha = 1) {
  spriteSheetEffects.push(createSpriteSheetEffect(type, x, y, scale, duration, alpha));
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

function getNextCharacterIndex() {
  return (activeCharacterIndex + 1) % characters.length;
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
  const recent = inputHistory.map((input) => input.action).slice(-3).join('-');

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
  const activeCharacter = characters[activeCharacterIndex];
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

  bossHp = clamp(bossHp - damage * multiplier, 0, 100);
  groggy = clamp(groggy + groggyGain * multiplier * activeCharacter.groggyPower, 0, 100);
  energy = action === 'weak' ? clamp(energy + 6 * multiplier, 0, 100) : energy;

  const activeEffectColor =
    activeCharacter.name === 'Z-02' || activeCharacter.name === 'Z-03'
      ? activeCharacter.accent
      : action === 'weak'
        ? '#f0f3f7'
        : '#f5c84c';
  const activeSpriteEffect =
    activeCharacter.name === 'Z-02'
      ? 'impactGold'
      : activeCharacter.name === 'Z-03'
        ? 'kineticTeal'
        : action === 'weak'
          ? 'slash'
          : 'projectile';
  addEffect(action === 'weak' ? 'slashArc' : 'hitSpark', 640, 265, activeEffectColor, multiplier);
  addSpriteEffect(
    activeSpriteEffect,
    640,
    activeCharacter.name === 'Z-02' ? 375 : activeCharacter.name === 'Z-03' ? 370 : action === 'weak' ? 395 : 365,
    activeCharacter.name === 'Z-02' ? 0.58 : activeCharacter.name === 'Z-03' ? 0.56 : action === 'weak' ? 0.55 : 0.48,
    action === 'weak' ? 0.28 : 0.34,
    0.9,
  );
  addEffect('beatRing', 1120, 610, grade === 'PERFECT' ? '#f5c84c' : '#0fb9b1', multiplier);
  addFloatingText(comboName || grade, 640, 525, comboName ? '#f5c84c' : '#f0f3f7');
}

function applyUltimate(grade: Grade, now: number) {
  const multiplier = gradeMultiplier(grade);
  const activeCharacter = characters[activeCharacterIndex];

  if (energy < 60) {
    combo = 0;
    sync = clamp(sync - 4, 0, 100);
    addEffect('warningPulse', 640, 520, '#ff9f43', 0.8);
    addFloatingText('ULT LOW ENERGY', 640, 520, '#ff9f43');
    return;
  }

  energy = clamp(energy - 60, 0, 100);
  counterUntil = now + 1.6;
  bossHp = clamp(bossHp - 9.5 * multiplier, 0, 100);
  groggy = clamp(groggy + 18 * multiplier * activeCharacter.groggyPower, 0, 100);
  score += Math.round(700 * multiplier);
  addEffect('tagParryFlash', 640, 410, activeCharacter.accent, 1.45 * multiplier);
  addEffect('hitSpark', 640, 255, activeCharacter.accent, 1.6 * multiplier);
  addSpriteEffect(activeCharacter.name === 'Z-03' ? 'kineticTeal' : 'slash', 640, 360, 0.75, 0.44, 1);
  addSpriteEffect(activeCharacter.name === 'Z-02' ? 'impactGold' : activeCharacter.name === 'Z-03' ? 'kineticTeal' : 'projectile', 640, 340, 0.65, 0.5, 0.95);
  addEffect('beatRing', 1120, 610, '#f5c84c', 1.3 * multiplier);
  addFloatingText(`${activeCharacter.name} ULTIMATE`, 640, 500, '#f5c84c');
}

function handleAction(action: Action) {
  if (playerHp <= 0 || bossHp <= 0) {
    return;
  }

  const now = performance.now() / 1000;
  const grade = gradeInput(now);
  const multiplier = gradeMultiplier(grade);
  lastGrade = grade;
  lastAction = action.toUpperCase();
  pushInput(action, now);

  if (grade === 'MISS') {
    combo = 0;
    sync = clamp(sync - 5, 0, 100);
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
    applyAttack(action, grade, now, chainStep);
  }

  if (action === 'dodge') {
    const target = findDodgeTarget(now);
    resetAttackChain();
    setActivePose('dodge', now, 0.46);
    evasionUntil = now + (grade === 'PERFECT' ? 0.55 : 0.38);
    addEffect('afterimage', 640, 585, '#0fb9b1', multiplier);

    if (target) {
      target.resolved = true;
      counterUntil = now + 1;
      energy = clamp(energy + 7 * multiplier, 0, 100);
      score += Math.round(140 * multiplier);
      addEffect('pixelBurst', 640, 485, '#0fb9b1', multiplier);
      addFloatingText('EVADE WINDOW', 640, 485, '#0fb9b1');
    } else {
      addFloatingText('STEP', 640, 575, '#8a95a8');
    }
  }

  if (action === 'tag') {
    resetAttackChain();
    const nextCharacterIndex = getNextCharacterIndex();
    const nextCharacter = characters[nextCharacterIndex];
    const target = findParryTarget(now);
    activeCharacterIndex = nextCharacterIndex;
    setActivePose('tagParry', now, target ? 0.62 : 0.42);

    lastAction = `TAG ${nextCharacter.name}`;

    if (target) {
      target.resolved = true;
      counterUntil = now + 1.4;
      groggy = clamp(groggy + 24 * multiplier * nextCharacter.groggyPower, 0, 100);
      energy = clamp(energy + 16 * multiplier, 0, 100);
      score += Math.round(280 * multiplier);
      addEffect('tagParryFlash', 640, 465, nextCharacter.accent, multiplier);
      addEffect('pixelBurst', 640, 300, '#f5c84c', multiplier);
      addFloatingText(`${nextCharacter.name} TAG PARRY`, 640, 465, nextCharacter.accent);
    } else if (findUnparryableTarget(now)) {
      combo = 0;
      sync = clamp(sync - 8, 0, 100);
      addEffect('warningPulse', 640, 465, '#ff5a6e', 1);
      addFloatingText('TAG BLOCKED', 640, 575, '#ff5a6e');
    } else {
      counterUntil = now + 0.55;
      addEffect('beatRing', 640, 585, nextCharacter.accent, 0.85);
      addFloatingText(`${nextCharacter.name} TAG IN`, 640, 575, nextCharacter.accent);
    }
  }

  if (action === 'ultimate') {
    resetAttackChain();
    setActivePose('ultimate', now, 0.8);
    applyUltimate(grade, now);
  }

  if (groggy >= 100 && getBeatFloat(now) >= breakUntilBeat) {
    enterBreak(now);
  }
}

function resetFight() {
  playerHp = 100;
  bossHp = 100;
  sync = 50;
  energy = 0;
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

function drawBoss(now: number) {
  const activeAttack = getActiveAttack(now);
  const groggyActive = isBossGroggy(now);
  const phase = groggyActive ? 'groggy' : getAttackPhase(activeAttack, now);
  const attackColor = activeAttack?.guardType === 'unparryable' ? '#ff5a6e' : '#f5c84c';
  const x = 640;
  const y = groggyActive ? 365 : activeAttack?.move === 'slam' ? 350 : 340;

  drawPixelBoss(gameContext, x, y, 1.35, coreBrutePalette, {
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
  const x = 640;
  const y = 585;
  const isEvading = now <= evasionUntil;
  const isCounter = now <= counterUntil;
  const lean = isEvading ? -34 : 0;
  const activeCharacter = characters[activeCharacterIndex];
  const supportSlots = [500, 780];
  const supportCharacters = characters.filter((_, index) => index !== activeCharacterIndex);

  supportCharacters.forEach((character, index) => {
    const supportX = supportSlots[index];

    gameContext.globalAlpha = 0.65;
    drawPixelCharacter(gameContext, character, supportX, y, 2.15, {
      active: false,
      beat: getBeatFloat(now) + index * 0.35,
      counter: false,
      evading: false,
      pose: 'idle',
    });
    gameContext.globalAlpha = 1;
    drawText(character.name, supportX, y + 72, 13, '#8a95a8', 'center');
  });

  drawPixelCharacter(gameContext, activeCharacter, x + lean, y, 2.85, {
    active: true,
    beat: getBeatFloat(now),
    counter: isCounter,
    evading: isEvading,
    pose: now <= activePoseUntil ? activePose : isCounter ? 'counter' : 'idle',
  });
  drawText(activeCharacter.name, x + lean, y + 98, 15, activeCharacter.accent, 'center');
}

function drawAttackRead(now: number) {
  const attack = getIncomingAttack(now);

  if (!attack) {
    drawText(isBossGroggy(now) ? 'Boss exhausted. Push damage.' : 'Enemy neutral. Build pressure.', 640, 420, 17, '#8a95a8', 'center');
    return;
  }

  const beatFloat = getBeatFloat(now);
  const untilImpact = attack.impactBeat - beatFloat;
  const progress = clamp(1 - untilImpact / Math.max(attack.impactBeat - attack.windupBeat, 0.1), 0, 1);
  const color = attack.guardType === 'parryable' ? '#f5c84c' : '#ff5a6e';
  const response = attack.guardType === 'parryable' ? 'TAG PARRY OR DODGE' : 'DODGE ONLY';

  gameContext.fillStyle = '#20242b';
  gameContext.fillRect(440, 405, 400, 10);
  gameContext.fillStyle = color;
  gameContext.fillRect(440, 405, 400 * progress, 10);
  drawText('Enemy motion read', 640, 389, 15, '#8a95a8', 'center');
  drawText(
    `${attack.move.toUpperCase()} · ${response} · ${Math.max(untilImpact, 0).toFixed(1)} beats`,
    640,
    436,
    20,
    color,
    'center',
  );
}

function drawBeatRing(now: number) {
  const beatFloat = getBeatFloat(now);
  const phase = beatFloat - Math.floor(beatFloat);
  const radius = 38 + (1 - phase) * 30;

  gameContext.strokeStyle = '#0fb9b1';
  gameContext.lineWidth = 4;
  gameContext.beginPath();
  gameContext.arc(1120, 610, radius, 0, Math.PI * 2);
  gameContext.stroke();

  gameContext.fillStyle = '#f0f3f7';
  gameContext.beginPath();
  gameContext.arc(1120, 610, 12, 0, Math.PI * 2);
  gameContext.fill();

  drawText('120 BPM', 1120, 675, 15, '#8a95a8', 'center');
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

function drawHud(now: number) {
  const beatFloat = getBeatFloat(now);
  const inBreak = beatFloat < breakUntilBeat;
  const result = playerHp <= 0 ? 'FAILED' : bossHp <= 0 ? 'CLEARED' : inBreak ? 'EXHAUSTED' : 'ACTION ASSAULT';
  const activeAttack = getIncomingAttack(now);
  const warningColor = activeAttack?.guardType === 'unparryable' ? '#ff5a6e' : activeAttack ? '#f5c84c' : '#0fb9b1';

  drawPanel(292, 24, 696, 74, warningColor, 0.82);
  drawText('CORE BRUTE', 320, 51, 18, '#f0f3f7');
  drawText(result, 958, 51, 14, inBreak ? '#f5c84c' : '#8a95a8', 'right');
  drawBar(320, 64, 640, 12, bossHp, '#ff5a6e');
  drawBar(320, 84, 640, 8, groggy, '#f5c84c');
  drawText('HP', 292, 74, 11, '#8a95a8');
  drawText('GRG', 292, 94, 11, '#8a95a8');

  drawPanel(24, 24, 218, 154, characters[activeCharacterIndex].accent, 0.78);
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

  drawPanel(1014, 24, 242, 184, '#7c5cff', 0.78);
  drawText('TIMING', 1032, 52, 16, '#f0f3f7');
  drawText(lastGrade, 1238, 52, 20, lastGrade === 'PERFECT' ? '#f5c84c' : '#f0f3f7', 'right');
  drawText(lastAction, 1032, 82, 14, '#8a95a8');
  drawText(`COMBO ${combo}`, 1032, 112, 20, '#f0f3f7');
  drawText(`MAX ${maxCombo}`, 1238, 112, 12, '#8a95a8', 'right');
  drawBar(1032, 132, 196, 8, sync, '#f5c84c');
  drawText(`SCORE ${score}`, 1032, 164, 15, '#f0f3f7');
  drawText('ENERGY', 1032, 188, 12, '#8a95a8');
  drawBar(1092, 180, 136, 8, energy, '#0fb9b1');

  drawPanel(270, 626, 740, 64, warningColor, 0.82);
  const commands = [
    ['J', 'WEAK'],
    ['K', 'HEAVY'],
    ['L', 'DODGE'],
    [';', 'TAG'],
    ['I', 'ULT'],
  ];
  commands.forEach(([key, label], index) => {
    const x = 295 + index * 140;
    gameContext.fillStyle = '#1b222d';
    gameContext.fillRect(x, 642, 112, 30);
    drawText(key, x + 14, 663, 18, '#f0f3f7');
    drawText(label, x + 96, 663, 13, '#8a95a8', 'right');
  });

  const banner = inBreak
    ? 'EXHAUSTED: FREE COMBO'
    : activeAttack
      ? activeAttack.guardType === 'parryable'
        ? 'YELLOW: TAG PARRY OR DODGE'
        : 'RED: DODGE ONLY'
      : 'NEUTRAL: BUILD RHYTHM PRESSURE';
  drawText(banner, 640, 616, 15, warningColor, 'center');
}

function updateSupportAttacks(now: number) {
  const currentBeat = Math.floor(getBeatFloat(now));

  if (currentBeat === lastSupportBeat || currentBeat % 2 !== 0 || bossHp <= 0 || playerHp <= 0) {
    return;
  }

  lastSupportBeat = currentBeat;
  let supportGroggy = 0;
  characters.forEach((character, index) => {
    if (index !== activeCharacterIndex) {
      supportGroggy += 0.16 * character.groggyPower;
    }
  });
  bossHp = clamp(bossHp - (characters.length - 1) * 0.18, 0, 100);
  groggy = clamp(groggy + supportGroggy, 0, 100);
  score += (characters.length - 1) * 12;
}

function update(deltaSeconds: number, now: number) {
  const beat = Math.floor(getBeatFloat(now));
  generateEnemyAttacks(beat);
  resolveEnemyHits(now);
  updateSupportAttacks(now);
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
  drawPixelCityStage(gameContext, gameCanvas.width, gameCanvas.height, {
    beat: getBeatFloat(now),
    warningColor: getActiveAttack(now)?.guardType === 'unparryable' ? '#ff5a6e' : '#0fb9b1',
  });

  drawBoss(now);
  drawAttackRead(now);
  drawParty(now);
  drawSpriteSheetEffects(gameContext, spriteSheetEffects);
  drawBeatRing(now);
  drawHud(now);
  drawPixelEffects(gameContext, pixelEffects);
  drawFloatingTexts(deltaSeconds);

  requestAnimationFrame(render);
}

window.addEventListener('keydown', (event) => {
  if (event.repeat) {
    return;
  }

  if (event.key.toLowerCase() === 'r') {
    resetFight();
    return;
  }

  const action = keys[event.key.toLowerCase()];

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

requestAnimationFrame(render);
