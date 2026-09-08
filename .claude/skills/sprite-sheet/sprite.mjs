#!/usr/bin/env node
/* Sprite sheet slicer + smoothness ranker for Pahlawan Angka hero art.
 *
 * This box has no Pillow and no ImageMagick, so image decode/encode runs
 * through headless Chromium's canvas. See SKILL.md for the method and for
 * the failure modes these steps exist to catch.
 *
 *   node sprite.mjs slice <sheet> <outDir> [--cols N] [--height 340] [--pad .05]
 *   node sprite.mjs rank  <frameDir> [--display 178]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function loadChromium() {
  const roots = [
    process.cwd(),
    path.join(process.env.HOME || '/root', '.sprite-sheet'),
    '/tmp/sprite-sheet-deps',
  ];
  for (const r of roots) {
    try { return require(require.resolve('playwright-core', { paths: [r] })); } catch {}
  }
  try { return require('playwright-core'); } catch {}
  console.error(
    'playwright-core not found. Install it once, anywhere on the box:\n' +
    '  mkdir -p /tmp/sprite-sheet-deps && cd /tmp/sprite-sheet-deps && npm i playwright-core\n' +
    'Chromium itself is already present at /opt/pw-browsers/chromium.'
  );
  process.exit(1);
}

const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };
const dataUri = (file) => {
  const ext = path.extname(file).toLowerCase();
  if (!MIME[ext]) throw new Error(`unsupported image type: ${ext}`);
  return `data:${MIME[ext]};base64,${fs.readFileSync(file).toString('base64')}`;
};

async function withPage(fn) {
  const { chromium } = loadChromium();
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
    args: ['--headless=new'],
  });
  try {
    return await fn(await browser.newPage());
  } finally {
    await browser.close();
  }
}

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : process.argv[i + 1];
};

/* ---------------------------------------------------------------- slice */

async function slice() {
  const input = process.argv[3];
  const outDir = process.argv[4];
  if (!input || !outDir) {
    console.error('usage: sprite.mjs slice <sheet|frameDir> <outDir> [--cols N] [--height 340] [--pad .05] [--anchor body|full]');
    process.exit(1);
  }
  const cols = arg('--cols') ? +arg('--cols') : null;
  const height = +arg('--height', 340);
  const pad = +arg('--pad', 0.05);
  const anchor = arg('--anchor', 'body');
  if (anchor !== 'body' && anchor !== 'full') { console.error("--anchor must be 'body' or 'full'"); process.exit(1); }

  /* One image is a sheet to be cut up; a directory is frames already separate.
     Generators hand back either, and the alignment work is identical once the
     frames are found, so accept both here rather than in two commands. */
  const isDir = fs.statSync(input).isDirectory();
  const sources = isDir
    ? fs.readdirSync(input)
        .filter((f) => MIME[path.extname(f).toLowerCase()])
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((f) => path.join(input, f))
    : [input];
  if (!sources.length) { console.error(`no images found in ${input}`); process.exit(1); }

  const result = await withPage((page) =>
    page.evaluate(async ({ uris, cols, height, pad, anchor }) => {
      const sheetMode = uris.length === 1;
      const imgs = [], data = [];
      for (const uri of uris) {
        const img = new Image();
        img.src = uri;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0);
        imgs.push(img);
        data.push(g.getImageData(0, 0, img.width, img.height).data);
      }
      const alphaAt = (s, x, y) => data[s][(y * imgs[s].width + x) * 4 + 3];

      /* Everything downstream needs the same three measurements per frame, so
         take them in one place whether the frame came from a cell of a sheet
         or from its own file. */
      function measure(src, x0, x1, y0, y1) {
        let minX = Infinity, maxX = -1, minY = Infinity, maxY = -1;
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            if (alphaAt(src, x, y) > 24) {
              if (x < minX) minX = x; if (x > maxX) maxX = x;
              if (y < minY) minY = y; if (y > maxY) maxY = y;
            }
          }
        }
        if (maxX < 0) return null;

        /* Anchor on the feet, not the bounding box: the box drifts with
           whatever the character is holding. */
        const footBand = Math.max(4, Math.round((maxY - minY) * 0.06));
        let footL = Infinity, footR = -1;
        for (let y = maxY - footBand; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            if (alphaAt(src, x, y) > 60) { if (x < footL) footL = x; if (x > footR) footR = x; }
          }
        }
        const footC = (footL + footR) / 2;

        /* Body height, measured without the raised prop, so a frame drawn
           with a shorter prop cannot quietly scale the body up during
           normalisation.

           Finding the head by "topmost solid pixel beside the body" breaks the
           moment the prop swings upright and enters that column — it then
           reports the blade tip as the head and shrinks the whole frame. Go by
           width instead: a blade and a hair spike are thin, the head and torso
           are not. The first row wide enough to be bulk is the top of the
           body. Measured across a five-frame set where one frame held the
           sword upright, this cut the body-height spread from 29px to 8px. */
        const rowWidth = [];
        let widest = 0;
        for (let y = minY; y <= maxY; y++) {
          let n = 0;
          for (let x = minX; x <= maxX; x++) if (alphaAt(src, x, y) > 170) n++;
          rowWidth.push(n);
          if (n > widest) widest = n;
        }
        let headY = minY;
        for (let i = 0; i < rowWidth.length; i++) {
          if (rowWidth[i] >= 0.18 * widest) { headY = minY + i; break; }
        }

        return {
          src, minX, maxX, minY, maxY, footC,
          fullH: maxY - minY + 1,
          bodyH: maxY - headY + 1,
          propRise: headY - minY,
          footW: footR - footL + 1,
        };
      }

      const frames = [], notes = [];
      let rowCount = 1;

      if (!sheetMode) {
        for (let s = 0; s < imgs.length; s++) {
          const f = measure(s, 0, imgs[s].width, 0, imgs[s].height);
          if (f) frames.push({ ...f, row: 0, rowTop: 0 });
        }
      } else {
        const W = imgs[0].width, H = imgs[0].height;

        /* Rows come free: a sheet always leaves fully transparent scanlines
           between rows. Columns often do not — neighbouring frames overlap. */
        const rowSum = [];
        for (let y = 0; y < H; y++) { let s = 0; for (let x = 0; x < W; x++) s += alphaAt(0, x, y); rowSum.push(s / 255); }
        const bands = [];
        let open = null;
        for (let y = 0; y < H; y++) {
          if (rowSum[y] > 0.5) { if (!open) open = { y0: y }; open.y1 = y; }
          else if (open) { bands.push(open); open = null; }
        }
        if (open) bands.push(open);
        const rows = bands.filter((b) => b.y1 - b.y0 > H * 0.1);
        rowCount = rows.length;

        for (const [rowIndex, band] of rows.entries()) {
          const colSum = [];
          for (let x = 0; x < W; x++) { let s = 0; for (let y = band.y0; y <= band.y1; y++) s += alphaAt(0, x, y); colSum.push(s / 255); }

          /* How many frames across? Count the transparent gutters, but a
             gutter only exists where neighbours do not overlap, so an explicit
             --cols always wins. */
          const gutters = [];
          let run = null;
          for (let x = 0; x < W; x++) {
            if (colSum[x] < 0.5) { if (!run) run = { x0: x }; run.x1 = x; }
            else if (run) { gutters.push(run); run = null; }
          }
          if (run) gutters.push(run);
          const inner = gutters.filter((g) => g.x0 > 0 && g.x1 < W - 1 && g.x1 - g.x0 >= 2);
          const detected = inner.length + 1;
          const n = cols || detected;
          if (cols && detected !== cols) {
            notes.push(`row y=${band.y0}-${band.y1}: ${detected} clean gutter(s) but --cols ${cols} given — frames overlap, boundaries taken at the alpha valleys`);
          }

          /* Cut at the LOWEST-alpha column near each nominal boundary, never
             at the nominal boundary itself. Equal division clips whatever
             sticks out past its share of the width. */
          const cuts = [0];
          for (let k = 1; k < n; k++) {
            const guess = Math.round((W * k) / n);
            const window = Math.round(W / n / 8);
            let best = guess, bestVal = Infinity;
            for (let x = Math.max(1, guess - window); x <= Math.min(W - 2, guess + window); x++) {
              if (colSum[x] < bestVal) { bestVal = colSum[x]; best = x; }
            }
            cuts.push(best);
          }
          cuts.push(W);

          for (let k = 0; k < n; k++) {
            const f = measure(0, cuts[k], cuts[k + 1], band.y0, band.y1 + 1);
            if (f) frames.push({ ...f, row: rowIndex, rowTop: band.y0 });
          }
        }
      }

      /* Normalise every frame to the same height and plant the feet on one
         line, then hand back WebP with the alpha intact. */
      const outW = Math.round(height * 1.02);
      const urls = [], lum = [], drawn = [];

      /* Scaling every frame to the same TOTAL height is wrong whenever the
         prop changes length: a frame drawn with a shorter sword gets stretched
         until its body is visibly bigger than the others, and the character
         pumps once per loop. Scale on body height instead and reserve enough
         headroom that the longest prop still fits inside the canvas. */
      const ratio = Math.max(...frames.map((f) => f.fullH / f.bodyH));
      const bodyTarget = (height * (1 - pad)) / ratio;

      /* Wrap the contact sheet at four across — a single strip of eight is
         too wide to actually look at, and looking at it is the point. */
      const gridCols = Math.min(4, frames.length);
      const gridRows = Math.ceil(frames.length / gridCols);
      const contact = document.createElement('canvas');
      contact.width = outW * gridCols;
      contact.height = height * gridRows;
      const cg = contact.getContext('2d');
      cg.fillStyle = '#16233a';
      cg.fillRect(0, 0, contact.width, contact.height);

      frames.forEach((f, i) => {
        const cell = document.createElement('canvas');
        cell.width = outW; cell.height = height;
        const g = cell.getContext('2d');
        g.imageSmoothingQuality = 'high';
        const scale = anchor === 'body' ? bodyTarget / f.bodyH : (height * (1 - pad)) / f.fullH;
        g.drawImage(
          imgs[f.src], f.minX, f.minY, f.maxX - f.minX + 1, f.fullH,
          outW / 2 - (f.footC - f.minX) * scale, height * (1 - pad / 2) - f.fullH * scale,
          (f.maxX - f.minX + 1) * scale, f.fullH * scale
        );
        const px = g.getImageData(0, 0, outW, height).data;
        let sum = 0, n = 0;
        for (let k = 0; k < px.length; k += 4) {
          if (px[k + 3] > 200) { sum += 0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2]; n++; }
        }
        lum.push(+(sum / n).toFixed(1));
        drawn.push({ body: Math.round(f.bodyH * scale), full: Math.round(f.fullH * scale) });
        urls.push(cell.toDataURL('image/webp', 0.85));

        const gx = (i % gridCols) * outW, gy = Math.floor(i / gridCols) * height;
        cg.drawImage(cell, gx, gy);
        cg.strokeStyle = '#3d5f8d';
        cg.strokeRect(gx, gy, outW, height);
        cg.fillStyle = '#ffd479';
        cg.font = 'bold 20px sans-serif';
        cg.fillText('F' + (i + 1), gx + 8, gy + 24);
      });

      return {
        W: imgs[0].width, H: imgs[0].height, rows: rowCount, anchor, sheetMode,
        frames: frames.map((f, i) => ({
          f: i + 1, row: f.row + 1, x: f.minX, y: f.minY, w: f.maxX - f.minX + 1,
          fullH: f.fullH, bodyH: f.bodyH, propRise: f.propRise,
          baseline: f.maxY - f.rowTop, footW: f.footW, lum: lum[i],
          drawnBody: drawn[i].body, drawnFull: drawn[i].full,
        })),
        notes, urls, contact: contact.toDataURL('image/png'),
      };
    }, { uris: sources.map(dataUri), cols, height, pad, anchor })
  );

  fs.mkdirSync(outDir, { recursive: true });
  result.urls.forEach((u, i) =>
    fs.writeFileSync(path.join(outDir, `f${i + 1}.webp`), Buffer.from(u.split(',')[1], 'base64')));
  fs.writeFileSync(path.join(outDir, 'contact.png'), Buffer.from(result.contact.split(',')[1], 'base64'));

  const report = { input, mode: result.sheetMode ? 'sheet' : 'frames', size: `${result.W}x${result.H}`, rows: result.rows, anchor: result.anchor, frames: result.frames, notes: result.notes };
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));

  console.log(result.sheetMode
    ? `sheet ${result.W}x${result.H} — ${result.rows} row(s), ${result.frames.length} frame(s)`
    : `${sources.length} separate frames, first is ${result.W}x${result.H}`);
  console.table(result.frames);

  const spread = (list, k) => {
    const v = list.map((f) => f[k]);
    return +(Math.max(...v) - Math.min(...v)).toFixed(1);
  };
  /* Baselines only compare inside a row — across rows they are hundreds of
     pixels apart by construction. A sheet laid out in two rows also tends to
     drift in scale between them, which is why one row is the safer ask. */
  const perRow = [...new Set(result.frames.map((f) => f.row))]
    .map((r) => spread(result.frames.filter((f) => f.row === r), 'baseline'));
  console.log(`spread — fullH ${spread(result.frames, 'fullH')}px · bodyH ${spread(result.frames, 'bodyH')}px · baseline ${Math.max(...perRow)}px (worst row) · luminance ${spread(result.frames, 'lum')}`);

  /* The number that decides whether the character pumps: how much the drawn
     body varies once every frame has been scaled. */
  const drawnSpread = spread(result.frames, 'drawnBody');
  const meanBody = result.frames.reduce((a, f) => a + f.drawnBody, 0) / result.frames.length;
  console.log(`anchored on ${result.anchor} — drawn body varies ${drawnSpread}px of ${Math.round(meanBody)}px (${(drawnSpread / meanBody * 100).toFixed(1)}%)${result.anchor === 'full' ? ', and every prop-length difference lands on the body' : ''}`);
  if (drawnSpread / meanBody > 0.03) {
    console.log('WARNING: over 3% — the character will visibly grow and shrink through the loop.');
  }
  if (result.rows > 1) {
    const byRow = [...new Set(result.frames.map((f) => f.row))]
      .map((r) => result.frames.filter((f) => f.row === r))
      .map((g) => g.reduce((a, f) => a + f.fullH, 0) / g.length);
    const drift = Math.max(...byRow) - Math.min(...byRow);
    console.log(`row-to-row scale drift: ${drift.toFixed(1)}px mean height${drift > 4 ? ' — normalisation will paper over this, but a one-row sheet avoids it entirely' : ''}`);
  }

  const rises = result.frames.map((f) => f.propRise).sort((a, b) => a - b);
  const median = rises[Math.floor(rises.length / 2)];
  const odd = result.frames.filter((f) => median >= 6 && f.propRise < median * 0.6);
  for (const f of odd) {
    /* Under body anchoring this no longer distorts the body — it just means
       that frame's prop is drawn shorter, which is the art's own business. */
    const consequence = result.anchor === 'body'
      ? 'its body is still the right size, but the prop is probably drawn shorter'
      : 'its body will scale up when heights are normalised — rerun with --anchor body';
    console.log(`note F${f.f}: only ${f.propRise}px of thin detail above the body, median is ${median}px — ${consequence}. Worth a look at contact.png; this is a hint, not a verdict.`);
  }
  result.notes.forEach((n) => console.log('note: ' + n));
  console.log(`\nwrote ${result.urls.length} frames + contact.png + report.json to ${outDir}`);
  console.log('Look at contact.png before trusting any of this — clipped shields and swords are obvious there and invisible in the numbers.');
}

/* ----------------------------------------------------------------- rank */

async function rank() {
  const dir = process.argv[3];
  if (!dir) { console.error('usage: sprite.mjs rank <frameDir> [--display 178]'); process.exit(1); }
  const display = +arg('--display', 178);
  const files = fs.readdirSync(dir)
    .filter((f) => /^f\d+\.webp$/.test(f))
    .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
  if (files.length < 2) { console.error(`need at least 2 fN.webp frames in ${dir}`); process.exit(1); }

  const out = await withPage((page) =>
    page.evaluate(async ({ uris, display }) => {
      const w = Math.round(display * 1.02);
      const px = [];
      for (const uri of uris) {
        const img = new Image();
        img.src = uri;
        await img.decode();
        const c = document.createElement('canvas');
        c.width = w; c.height = display;
        const g = c.getContext('2d');
        g.imageSmoothingQuality = 'high';
        g.drawImage(img, 0, 0, w, display);
        px.push(g.getImageData(0, 0, w, display).data);
      }
      /* Cost = mean per-pixel colour + alpha difference over the union of the
         two silhouettes, judged at the size it will actually be shown. */
      const cost = (i, j) => {
        const a = px[i], b = px[j];
        let sum = 0, n = 0;
        for (let k = 0; k < a.length; k += 4) {
          const aa = a[k + 3], ab = b[k + 3];
          if (aa > 24 || ab > 24) {
            n++;
            sum += (Math.abs(a[k] - b[k]) + Math.abs(a[k + 1] - b[k + 1]) + Math.abs(a[k + 2] - b[k + 2])) / 3 + Math.abs(aa - ab);
          }
        }
        return sum / n;
      };
      const N = px.length, M = [];
      for (let i = 0; i < N; i++) { M.push([]); for (let j = 0; j < N; j++) M[i].push(i === j ? 0 : cost(i, j)); }
      return M;
    }, { uris: files.map((f) => dataUri(path.join(dir, f))), display })
  );

  const N = out.length;
  const bestCycle = (idx) => {
    let best = null;
    const walk = (rest, order) => {
      if (!rest.length) {
        const cycle = [idx[0], ...order];
        let total = 0, worst = 0;
        for (let k = 0; k < cycle.length; k++) {
          const v = out[cycle[k]][cycle[(k + 1) % cycle.length]];
          total += v;
          if (v > worst) worst = v;
        }
        const avg = total / cycle.length;
        if (!best || avg < best.avg) best = { order: cycle.map((v) => v + 1), avg: +avg.toFixed(1), max: +worst.toFixed(1) };
        return;
      }
      for (let k = 0; k < rest.length; k++) walk([...rest.slice(0, k), ...rest.slice(k + 1)], [...order, rest[k]]);
    };
    walk(idx.slice(1), []);
    return best;
  };
  const subsets = (n) => {
    const res = [];
    const walk = (start, cur) => {
      if (cur.length === n) { res.push([...cur]); return; }
      for (let i = start; i < N; i++) { cur.push(i); walk(i + 1, cur); cur.pop(); }
    };
    walk(0, []);
    return res;
  };

  const rows = [];
  for (let n = N; n >= 2; n--) {
    let best = null;
    for (const s of subsets(n)) { const c = bestCycle(s); if (!best || c.avg < best.avg) best = c; }
    rows.push({ frames: n, order: best.order.map((v) => 'F' + v).join(' '), avg: best.avg, max: best.max });
  }
  console.log(`ranked ${N} frames at ${display}px display height — lower is smoother`);
  console.table(rows);

  /* Whichever frame is furthest from all the others is the one to regenerate. */
  const meanTo = out.map((r, i) => r.reduce((a, v, j) => (i === j ? a : a + v), 0) / (N - 1));
  const sorted = [...meanTo].sort((a, b) => a - b);
  const median = sorted[Math.floor(N / 2)];
  meanTo.forEach((v, i) => {
    if (v > median * 1.25) console.log(`outlier F${i + 1}: mean cost ${v.toFixed(1)} vs median ${median.toFixed(1)} — dropping it usually beats keeping it`);
  });
  console.log('\nPlay the winning order with a crossfade, never a hard cut. See SKILL.md — the outgoing layer stays fully opaque.');
}

const cmd = process.argv[2];
if (cmd === 'slice') await slice();
else if (cmd === 'rank') await rank();
else {
  console.error('usage:\n  sprite.mjs slice <sheet> <outDir> [--cols N] [--height 340] [--pad .05]\n  sprite.mjs rank <frameDir> [--display 178]');
  process.exit(1);
}
