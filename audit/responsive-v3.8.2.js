const { chromium } = require('playwright');

const viewports = [
  { name: 'phone-portrait', width: 360, height: 800 },
  { name: 'phone-landscape', width: 844, height: 390 },
  { name: 'tablet-portrait', width: 800, height: 1280 },
  { name: 'tablet-landscape', width: 1280, height: 800 },
  { name: 'car-display', width: 1280, height: 480 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = [];
  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      await page.goto('http://127.0.0.1:4173', { waitUntil: 'load' });
      await page.evaluate(() => {
        document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('on'));
        document.querySelector('#game').classList.add('on');
        document.body.dataset.screen = 'game';
        document.querySelector('#question').textContent = 'Berapakah 4,275 ÷ 5?';
        document.querySelector('#answers').innerHTML = '<button class="ans">855</button><button class="ans">850</button><button class="ans">875</button><button class="ans">805</button>';
      });
      const battle = await page.evaluate(() => ({
        bodyWidth: document.body.scrollWidth,
        viewportWidth: innerWidth,
        gameBottom: Math.round(document.querySelector('#game').getBoundingClientRect().bottom),
        viewportHeight: innerHeight,
        qcardBottom: Math.round(document.querySelector('.qcard').getBoundingClientRect().bottom),
      }));
      assert(battle.bodyWidth <= battle.viewportWidth + 1, `${viewport.name}: horizontal battle overflow`);
      const compact = viewport.height <= 650 && viewport.width / viewport.height >= 16 / 9;
      if (compact) {
        assert(battle.gameBottom <= battle.viewportHeight + 1, `${viewport.name}: game exceeds viewport`);
        assert(battle.qcardBottom <= battle.viewportHeight + 1, `${viewport.name}: qcard exceeds viewport`);
      }
      await page.screenshot({ path: `/tmp/pahlawan-${viewport.name}-battle.png` });

      await page.evaluate(() => {
        document.querySelector('#game').classList.remove('on');
        document.querySelector('#learning').classList.add('on');
        document.body.dataset.screen = 'learning';
      });
      const coach = await page.evaluate(() => ({
        bodyWidth: document.body.scrollWidth,
        viewportWidth: innerWidth,
        learningBottom: Math.round(document.querySelector('#learning').getBoundingClientRect().bottom),
        viewportHeight: innerHeight,
      }));
      assert(coach.bodyWidth <= coach.viewportWidth + 1, `${viewport.name}: horizontal coach overflow`);
      if (compact) assert(coach.learningBottom <= coach.viewportHeight + 1, `${viewport.name}: coach exceeds viewport`);
      await page.screenshot({ path: `/tmp/pahlawan-${viewport.name}-coach.png` });
      report.push({ viewport, battle, coach, status: 'pass' });
      await page.close();
    }
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
