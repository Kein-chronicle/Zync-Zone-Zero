import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root not found');
}

app.innerHTML = `
  <main class="shell">
    <section class="hud">
      <p class="eyebrow">Rhythm Action Combat Prototype</p>
      <h1>Zync Zone Zero</h1>
      <p class="status">Vite runtime ready. Electron packaging planned later.</p>
    </section>
    <canvas id="game" width="1280" height="720" aria-label="Zync Zone Zero prototype canvas"></canvas>
  </main>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game');
const context = canvas?.getContext('2d');

if (!canvas || !context) {
  throw new Error('Canvas context not available');
}

const gameCanvas = canvas;
const gameContext = context;

let lastTime = performance.now();
let beatPhase = 0;

function render(now: number) {
  const deltaSeconds = (now - lastTime) / 1000;
  lastTime = now;
  beatPhase = (beatPhase + deltaSeconds * 1.5) % 1;

  gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  gameContext.fillStyle = '#101114';
  gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  const pulse = 0.5 + Math.sin(beatPhase * Math.PI * 2) * 0.5;
  const radius = 56 + pulse * 22;

  gameContext.fillStyle = '#f0f3f7';
  gameContext.beginPath();
  gameContext.arc(gameCanvas.width / 2, gameCanvas.height / 2, radius, 0, Math.PI * 2);
  gameContext.fill();

  gameContext.strokeStyle = '#0fb9b1';
  gameContext.lineWidth = 8;
  gameContext.beginPath();
  gameContext.arc(
    gameCanvas.width / 2,
    gameCanvas.height / 2,
    160,
    -Math.PI / 2,
    -Math.PI / 2 + beatPhase * Math.PI * 2,
  );
  gameContext.stroke();

  gameContext.fillStyle = '#8a95a8';
  gameContext.font = '24px system-ui, sans-serif';
  gameContext.textAlign = 'center';
  gameContext.fillText('Beat sync test loop', gameCanvas.width / 2, gameCanvas.height / 2 + 230);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
