import './styles.css';
import { coreBrutePalette, drawPixelBoss, drawPixelCharacter, pixelCharacters } from './pixelSprites';

type Action = 'weak' | 'heavy' | 'dodge' | 'tag';
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
let lastSupportBeat = -1;
const attacks: EnemyAttack[] = [];
const inputHistory: CombatInput[] = [];
const floatingTexts: FloatingText[] = [];

function getSongTime(now = performance.now() / 1000) {
  return now - startTime;
}

function getBeatFloat(now = performance.now() / 1000) {
  return getSongTime(now) / beatDuration;
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

function generateEnemyAttacks(currentBeat: number) {
  const cycle = Math.floor(currentBeat / attackCycleBeats);

  if (generatedCycle < cycle - 1) {
    generatedCycle = cycle - 1;
  }

  if (cycle <= generatedCycle) {
    return;
  }

  for (let nextCycle = generatedCycle + 1; nextCycle <= cycle + 2; nextCycle += 1) {
    attackPattern.forEach((pattern) => {
      attacks.push({
        id: attackId,
        move: pattern.move,
        guardType: pattern.guardType,
        windupBeat: nextCycle * attackCycleBeats + pattern.windup,
        impactBeat: nextCycle * attackCycleBeats + pattern.impact,
        resolved: false,
      });
      attackId += 1;
    });
  }

  generatedCycle = cycle + 2;
}

function getActiveAttack(now = performance.now() / 1000) {
  const beatFloat = getBeatFloat(now);

  return attacks.find((attack) => {
    if (attack.resolved) {
      return false;
    }

    return beatFloat >= attack.windupBeat - 0.25 && beatFloat <= attack.impactBeat + 0.45;
  });
}

function getIncomingAttack(now = performance.now() / 1000) {
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
  addFloatingText('GROGGY BREAK', 640, 270, '#f5c84c');
}

function applyAttack(action: 'weak' | 'heavy', grade: Grade, now: number) {
  const beatFloat = getBeatFloat(now);
  const multiplier = gradeMultiplier(grade);
  const inBreak = beatFloat < breakUntilBeat;
  const inCounter = now < counterUntil;
  const comboName = getComboName();
  const energyReady = energy >= 18;
  let damage = action === 'weak' ? 0.85 : 1.8;
  let groggyGain = action === 'weak' ? 2.4 : 5.5;

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
  groggy = clamp(groggy + groggyGain * multiplier, 0, 100);
  energy = action === 'weak' ? clamp(energy + 6 * multiplier, 0, 100) : energy;

  addFloatingText(comboName || grade, 640, 525, comboName ? '#f5c84c' : '#f0f3f7');
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
    addFloatingText('MISS', 640, 610, '#8a95a8');
    return;
  }

  combo += 1;
  maxCombo = Math.max(maxCombo, combo);
  sync = clamp(sync + (grade === 'PERFECT' ? 4 : 2), 0, 100);
  score += Math.round(90 * multiplier * (1 + combo / 45));

  if (action === 'weak' || action === 'heavy') {
    applyAttack(action, grade, now);
  }

  if (action === 'dodge') {
    const target = findDodgeTarget(now);
    evasionUntil = now + (grade === 'PERFECT' ? 0.55 : 0.38);

    if (target) {
      target.resolved = true;
      counterUntil = now + 1;
      energy = clamp(energy + 7 * multiplier, 0, 100);
      score += Math.round(140 * multiplier);
      addFloatingText('EVADE WINDOW', 640, 485, '#0fb9b1');
    } else {
      addFloatingText('STEP', 640, 575, '#8a95a8');
    }
  }

  if (action === 'tag') {
    const nextCharacterIndex = getNextCharacterIndex();
    const nextCharacter = characters[nextCharacterIndex];
    const target = findParryTarget(now);
    activeCharacterIndex = nextCharacterIndex;

    lastAction = `TAG ${nextCharacter.name}`;

    if (target) {
      target.resolved = true;
      counterUntil = now + 1.4;
      groggy = clamp(groggy + 24 * multiplier, 0, 100);
      energy = clamp(energy + 16 * multiplier, 0, 100);
      score += Math.round(280 * multiplier);
      addFloatingText(`${nextCharacter.name} TAG PARRY`, 640, 465, nextCharacter.accent);
    } else if (findUnparryableTarget(now)) {
      combo = 0;
      sync = clamp(sync - 8, 0, 100);
      addFloatingText('TAG BLOCKED', 640, 575, '#ff5a6e');
    } else {
      counterUntil = now + 0.55;
      addFloatingText(`${nextCharacter.name} TAG IN`, 640, 575, nextCharacter.accent);
    }
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
  lastSupportBeat = -1;
  attacks.length = 0;
  inputHistory.length = 0;
  floatingTexts.length = 0;
}

function drawMeter(label: string, value: number, x: number, y: number, width: number, color: string) {
  gameContext.fillStyle = '#20242b';
  gameContext.fillRect(x, y, width, 12);
  gameContext.fillStyle = color;
  gameContext.fillRect(x, y, width * clamp(value / 100, 0, 1), 12);
  gameContext.fillStyle = '#c7cedb';
  gameContext.font = '13px system-ui, sans-serif';
  gameContext.textAlign = 'left';
  gameContext.fillText(label, x, y - 8);
}

function drawText(text: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left') {
  gameContext.fillStyle = color;
  gameContext.font = `${size}px system-ui, sans-serif`;
  gameContext.textAlign = align;
  gameContext.fillText(text, x, y);
}

function drawBoss(now: number) {
  const activeAttack = getActiveAttack(now);
  const phase = getAttackPhase(activeAttack, now);
  const attackColor = activeAttack?.guardType === 'unparryable' ? '#ff5a6e' : '#f5c84c';
  const x = 640;
  const y = activeAttack?.move === 'slam' ? 240 : 220;

  drawPixelBoss(gameContext, x, y, 4, coreBrutePalette, {
    beat: getBeatFloat(now),
    move: activeAttack?.move,
    phase,
    warningColor: activeAttack ? attackColor : coreBrutePalette.armor,
  });

  const label = activeAttack
    ? `${activeAttack.move.toUpperCase()} · ${activeAttack.guardType === 'parryable' ? 'PARRY' : 'DODGE'}`
    : 'WATCH THE BOSS';
  drawText(label, x, y - 150, 15, activeAttack ? attackColor : '#8a95a8', 'center');
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
    drawPixelCharacter(gameContext, character, supportX, y, 3, {
      active: false,
      beat: getBeatFloat(now) + index * 0.35,
      counter: false,
      evading: false,
    });
    gameContext.globalAlpha = 1;
    drawText(character.name, supportX, y + 72, 13, '#8a95a8', 'center');
  });

  drawPixelCharacter(gameContext, activeCharacter, x + lean, y, 4, {
    active: true,
    beat: getBeatFloat(now),
    counter: isCounter,
    evading: isEvading,
  });
  drawText(activeCharacter.name, x + lean, y + 98, 15, activeCharacter.accent, 'center');
}

function drawAttackRead(now: number) {
  const attack = getIncomingAttack(now);

  if (!attack) {
    drawText('Enemy neutral. Build pressure.', 640, 372, 17, '#8a95a8', 'center');
    return;
  }

  const beatFloat = getBeatFloat(now);
  const untilImpact = attack.impactBeat - beatFloat;
  const progress = clamp(1 - untilImpact / Math.max(attack.impactBeat - attack.windupBeat, 0.1), 0, 1);
  const color = attack.guardType === 'parryable' ? '#f5c84c' : '#ff5a6e';
  const response = attack.guardType === 'parryable' ? 'TAG PARRY OR DODGE' : 'DODGE ONLY';

  gameContext.fillStyle = '#20242b';
  gameContext.fillRect(440, 360, 400, 10);
  gameContext.fillStyle = color;
  gameContext.fillRect(440, 360, 400 * progress, 10);
  drawText('Enemy motion read', 640, 344, 15, '#8a95a8', 'center');
  drawText(
    `${attack.move.toUpperCase()} · ${response} · ${Math.max(untilImpact, 0).toFixed(1)} beats`,
    640,
    396,
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
  const result = playerHp <= 0 ? 'FAILED' : bossHp <= 0 ? 'CLEARED' : inBreak ? 'GROGGY BREAK' : 'ACTION ASSAULT';

  drawText('ZYNC ZONE ZERO', 32, 44, 26, '#f0f3f7');
  drawText(result, 32, 74, 15, inBreak ? '#f5c84c' : '#8a95a8');

  drawMeter('PLAYER HP', playerHp, 32, 112, 240, '#0fb9b1');
  drawMeter('SYNC', sync, 32, 150, 240, '#f5c84c');
  drawMeter('ENERGY', energy, 32, 188, 240, '#7c5cff');
  drawMeter('BOSS HP', bossHp, 1008, 112, 240, '#ff5a6e');
  drawMeter('GROGGY', groggy, 1008, 150, 240, '#f5c84c');

  drawText(`SCORE ${score}`, 32, 662, 22, '#f0f3f7');
  drawText(`COMBO ${combo} / MAX ${maxCombo}`, 32, 690, 15, '#8a95a8');
  drawText(`${lastAction} · ${lastGrade}`, 1248, 690, 18, '#f0f3f7', 'right');
  drawText('J Weak   K Heavy   L Dodge   ; Tag Parry   R Reset', 640, 32, 15, '#8a95a8', 'center');
}

function updateSupportAttacks(now: number) {
  const currentBeat = Math.floor(getBeatFloat(now));

  if (currentBeat === lastSupportBeat || currentBeat % 2 !== 0 || bossHp <= 0 || playerHp <= 0) {
    return;
  }

  lastSupportBeat = currentBeat;
  const supportCount = characters.length - 1;
  bossHp = clamp(bossHp - supportCount * 0.18, 0, 100);
  groggy = clamp(groggy + supportCount * 0.16, 0, 100);
  score += supportCount * 12;
}

function update(deltaSeconds: number, now: number) {
  const beat = Math.floor(getBeatFloat(now));
  generateEnemyAttacks(beat);
  resolveEnemyHits(now);
  updateSupportAttacks(now);

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
  gameContext.fillStyle = '#101114';
  gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  gameContext.fillStyle = '#151820';
  gameContext.fillRect(0, 310, gameCanvas.width, 410);

  drawBoss(now);
  drawAttackRead(now);
  drawParty(now);
  drawBeatRing(now);
  drawHud(now);
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
