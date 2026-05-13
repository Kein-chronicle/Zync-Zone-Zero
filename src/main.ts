import './styles.css';

type Action = 'attack' | 'heavy' | 'dodge' | 'parry';
type Grade = 'MISS' | 'BAD' | 'GOOD' | 'PERFECT';
type ThreatType = 'dodge' | 'parry';

interface Threat {
  id: number;
  beat: number;
  type: ThreatType;
  lane: number;
  resolved: boolean;
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
    <canvas id="game" width="1280" height="720" aria-label="Zync Zone Zero core combat prototype"></canvas>
    <div class="input-strip" aria-label="combat controls">
      <button data-action="attack"><span>J</span>Attack</button>
      <button data-action="heavy"><span>K</span>Heavy</button>
      <button data-action="dodge"><span>L</span>Dodge</button>
      <button data-action="parry"><span>;</span>Parry</button>
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
const startTime = performance.now() / 1000;
const threatPattern: Array<Omit<Threat, 'id' | 'beat' | 'resolved'>> = [
  { type: 'dodge', lane: 0 },
  { type: 'parry', lane: 1 },
  { type: 'dodge', lane: 2 },
  { type: 'parry', lane: 1 },
];
const threatBeats = [2, 4, 6, 7];
const keys: Record<string, Action> = {
  j: 'attack',
  k: 'heavy',
  l: 'dodge',
  ';': 'parry',
};

let lastFrame = performance.now() / 1000;
let playerHp = 100;
let bossHp = 100;
let sync = 50;
let energy = 0;
let breakMeter = 0;
let score = 0;
let combo = 0;
let maxCombo = 0;
let lastGrade: Grade = 'GOOD';
let lastAction = 'Ready';
let breakUntilBeat = -1;
let threatId = 0;
let generatedCycle = -1;
const threats: Threat[] = [];
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

  if (offsetMs <= 55) {
    return 'PERFECT';
  }

  if (offsetMs <= 110) {
    return 'GOOD';
  }

  if (offsetMs <= 180) {
    return 'BAD';
  }

  return 'MISS';
}

function gradeMultiplier(grade: Grade) {
  if (grade === 'PERFECT') {
    return 1.6;
  }

  if (grade === 'GOOD') {
    return 1;
  }

  if (grade === 'BAD') {
    return 0.45;
  }

  return 0;
}

function addFloatingText(text: string, x: number, y: number, color: string) {
  floatingTexts.push({ text, x, y, color, ttl: 0.9 });
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function generateThreats(currentBeat: number) {
  const cycle = Math.floor(currentBeat / 8);

  if (cycle <= generatedCycle) {
    return;
  }

  for (let nextCycle = generatedCycle + 1; nextCycle <= cycle + 2; nextCycle += 1) {
    threatBeats.forEach((beatOffset, index) => {
      const pattern = threatPattern[index];
      threats.push({
        id: threatId,
        beat: nextCycle * 8 + beatOffset,
        lane: pattern.lane,
        type: pattern.type,
        resolved: false,
      });
      threatId += 1;
    });
  }

  generatedCycle = cycle + 2;
}

function findActiveThreat(action: Action, now = performance.now() / 1000) {
  const beatFloat = getBeatFloat(now);

  return threats.find((threat) => {
    if (threat.resolved || threat.type !== action) {
      return false;
    }

    return Math.abs(threat.beat - beatFloat) <= 0.28;
  });
}

function resolveMissedThreats(now = performance.now() / 1000) {
  const beatFloat = getBeatFloat(now);

  threats.forEach((threat) => {
    if (!threat.resolved && beatFloat - threat.beat > 0.32 && breakUntilBeat < beatFloat) {
      threat.resolved = true;
      playerHp = clamp(playerHp - 9, 0, 100);
      combo = 0;
      sync = clamp(sync - 8, 0, 100);
      addFloatingText('HIT', 640 + (threat.lane - 1) * 150, 460, '#ff5a6e');
    }
  });
}

function enterBreak(now = performance.now() / 1000) {
  const currentBeat = Math.floor(getBeatFloat(now));
  breakUntilBeat = currentBeat + 8;
  breakMeter = 0;
  addFloatingText('BREAK PHRASE', 640, 270, '#f5c84c');
}

function handleAction(action: Action) {
  if (playerHp <= 0 || bossHp <= 0) {
    return;
  }

  const now = performance.now() / 1000;
  const beatFloat = getBeatFloat(now);
  const grade = gradeInput(now);
  const multiplier = gradeMultiplier(grade);
  const inBreak = beatFloat < breakUntilBeat;
  lastGrade = grade;
  lastAction = action.toUpperCase();

  if (grade === 'MISS') {
    combo = 0;
    sync = clamp(sync - 6, 0, 100);
    addFloatingText('MISS', 640, 610, '#8a95a8');
    return;
  }

  combo += 1;
  maxCombo = Math.max(maxCombo, combo);
  sync = clamp(sync + (grade === 'PERFECT' ? 4 : 2), 0, 100);
  score += Math.round(100 * multiplier * (1 + combo / 50));

  if (action === 'attack') {
    const damage = (inBreak ? 2.4 : 0.9) * multiplier;
    bossHp = clamp(bossHp - damage, 0, 100);
    energy = clamp(energy + 8 * multiplier, 0, 100);
    breakMeter = clamp(breakMeter + 4 * multiplier, 0, 100);
    addFloatingText(grade, 640, 530, grade === 'PERFECT' ? '#0fb9b1' : '#f0f3f7');
  }

  if (action === 'heavy') {
    const canSpend = energy >= 20 || inBreak;
    const damage = canSpend ? (inBreak ? 4.8 : 2.1) * multiplier : 0.4 * multiplier;
    bossHp = clamp(bossHp - damage, 0, 100);
    energy = canSpend && !inBreak ? clamp(energy - 20, 0, 100) : clamp(energy + 3, 0, 100);
    breakMeter = clamp(breakMeter + (canSpend ? 9 : 2) * multiplier, 0, 100);
    addFloatingText(canSpend ? grade : 'LOW ENERGY', 640, 520, canSpend ? '#f5c84c' : '#ff9f43');
  }

  if (action === 'dodge' || action === 'parry') {
    const threat = findActiveThreat(action, now);

    if (threat) {
      threat.resolved = true;
      const reward = action === 'parry' ? 15 : 9;
      breakMeter = clamp(breakMeter + reward * multiplier, 0, 100);
      energy = clamp(energy + reward * 0.7, 0, 100);
      score += Math.round(220 * multiplier);
      addFloatingText(action === 'parry' ? 'COUNTER' : 'EVADE', 640, 455, action === 'parry' ? '#f5c84c' : '#0fb9b1');
    } else {
      sync = clamp(sync - 3, 0, 100);
      addFloatingText('NO THREAT', 640, 610, '#8a95a8');
    }
  }

  if (breakMeter >= 100 && beatFloat >= breakUntilBeat) {
    enterBreak(now);
  }
}

function resetFight() {
  playerHp = 100;
  bossHp = 100;
  sync = 50;
  energy = 0;
  breakMeter = 0;
  score = 0;
  combo = 0;
  maxCombo = 0;
  lastGrade = 'GOOD';
  lastAction = 'Ready';
  breakUntilBeat = -1;
  threats.length = 0;
  floatingTexts.length = 0;
  generatedCycle = -1;
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
  const beatPulse = 1 + Math.sin(getBeatFloat(now) * Math.PI * 2) * 0.025;
  const x = 640;
  const y = 220;
  const width = 390 * beatPulse;
  const height = 250 * beatPulse;

  gameContext.fillStyle = '#242932';
  gameContext.beginPath();
  gameContext.roundRect(x - width / 2, y - height / 2, width, height, 34);
  gameContext.fill();

  gameContext.fillStyle = '#ff5a6e';
  gameContext.beginPath();
  gameContext.arc(x - 82, y - 26, 18, 0, Math.PI * 2);
  gameContext.arc(x + 82, y - 26, 18, 0, Math.PI * 2);
  gameContext.fill();

  gameContext.strokeStyle = '#0fb9b1';
  gameContext.lineWidth = 4;
  gameContext.beginPath();
  gameContext.moveTo(x - 120, y + 78);
  gameContext.lineTo(x + 120, y + 78);
  gameContext.stroke();

  drawText('BOSS', x, y - 150, 15, '#8a95a8', 'center');
}

function drawPlayer() {
  const x = 640;
  const y = 585;

  gameContext.fillStyle = '#f0f3f7';
  gameContext.beginPath();
  gameContext.arc(x, y - 78, 28, 0, Math.PI * 2);
  gameContext.fill();

  gameContext.fillStyle = '#d9dee8';
  gameContext.beginPath();
  gameContext.roundRect(x - 48, y - 46, 96, 120, 22);
  gameContext.fill();

  gameContext.strokeStyle = '#0fb9b1';
  gameContext.lineWidth = 6;
  gameContext.beginPath();
  gameContext.moveTo(x - 90, y + 15);
  gameContext.lineTo(x - 18, y - 22);
  gameContext.moveTo(x + 90, y + 15);
  gameContext.lineTo(x + 18, y - 22);
  gameContext.stroke();
}

function drawThreats(now: number) {
  const beatFloat = getBeatFloat(now);
  const laneX = [440, 640, 840];
  const judgmentY = 594;

  gameContext.strokeStyle = '#2c313a';
  gameContext.lineWidth = 2;
  laneX.forEach((x) => {
    gameContext.beginPath();
    gameContext.moveTo(x, 330);
    gameContext.lineTo(x, judgmentY);
    gameContext.stroke();
  });

  gameContext.strokeStyle = '#f0f3f7';
  gameContext.lineWidth = 3;
  gameContext.beginPath();
  gameContext.moveTo(360, judgmentY);
  gameContext.lineTo(920, judgmentY);
  gameContext.stroke();

  threats
    .filter((threat) => !threat.resolved && threat.beat - beatFloat < 5 && threat.beat - beatFloat > -0.4)
    .forEach((threat) => {
      const distance = threat.beat - beatFloat;
      const y = judgmentY - distance * 70;
      const x = laneX[threat.lane];
      gameContext.fillStyle = threat.type === 'parry' ? '#f5c84c' : '#ff5a6e';
      gameContext.beginPath();
      gameContext.roundRect(x - 38, y - 20, 76, 40, 10);
      gameContext.fill();
      drawText(threat.type.toUpperCase(), x, y + 6, 14, '#101114', 'center');
    });
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

    gameContext.globalAlpha = clamp(item.ttl / 0.9, 0, 1);
    drawText(item.text, item.x, item.y, 24, item.color, 'center');
    gameContext.globalAlpha = 1;
  }
}

function drawHud(now: number) {
  const beatFloat = getBeatFloat(now);
  const inBreak = beatFloat < breakUntilBeat;
  const result = playerHp <= 0 ? 'FAILED' : bossHp <= 0 ? 'CLEARED' : inBreak ? 'BREAK PHRASE' : 'ASSAULT';

  drawText('ZYNC ZONE ZERO', 32, 44, 26, '#f0f3f7');
  drawText(result, 32, 74, 15, inBreak ? '#f5c84c' : '#8a95a8');

  drawMeter('PLAYER HP', playerHp, 32, 112, 240, '#0fb9b1');
  drawMeter('SYNC', sync, 32, 150, 240, '#f5c84c');
  drawMeter('ENERGY', energy, 32, 188, 240, '#7c5cff');
  drawMeter('BOSS HP', bossHp, 1008, 112, 240, '#ff5a6e');
  drawMeter('BREAK', breakMeter, 1008, 150, 240, '#f5c84c');

  drawText(`SCORE ${score}`, 32, 662, 22, '#f0f3f7');
  drawText(`COMBO ${combo} / MAX ${maxCombo}`, 32, 690, 15, '#8a95a8');
  drawText(`${lastAction} · ${lastGrade}`, 1248, 690, 18, '#f0f3f7', 'right');
  drawText('J Attack   K Heavy   L Dodge   ; Parry   R Reset', 640, 32, 15, '#8a95a8', 'center');
}

function update(deltaSeconds: number, now: number) {
  const beat = Math.floor(getBeatFloat(now));
  generateThreats(beat);
  resolveMissedThreats(now);

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
  drawThreats(now);
  drawPlayer();
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
