// Guest demo wrap-up: rate the demo (stored anonymously), then pick a package.
// No identity, answers or child data are sent: rating, optional comment,
// demo grade and the anonymous funnel session only.
(() => {'use strict';
  const ENDPOINT = 'https://pxxekdeqlxwqwaqvfbnh.supabase.co/rest/v1/demo_feedback';
  const KEY = 'sb_publishable_xVRVgrb4EP6RnFv_p6WI_g_u67xGW6C';
  const TEST = new URLSearchParams(location.search).get('pa_tracking_test') === '1' || !['pahlawanangka.netlify.app', 'darkstaarx.github.io'].includes(location.hostname);
  const LABELS = ['', 'Kurang seronok', 'Boleh tahan', 'Seronok', 'Best!', 'Sangat best!'];
  // Aurora reacts to the rating: sad at 1, beaming at 5.
  const MOOD = ['', 'sad-0-v1', 'sad-4-v1', 'joy-1-v1', 'joy-0-v1', 'happy-v1'].map(f => f && `assets/pets/aurora/frames/${f}.webp`);
  const PACKAGES = {
    free: { name: 'Demo Percuma', price: 'RM0', cta: 'Daftar Percuma', features: ['Satu profil anak', 'Satu misi sehari', 'Demo boleh dimainkan tanpa had', 'Jejak kemajuan anak'] },
    premium: { name: 'Akses Keluarga', price: 'RM19', cta: 'Teruskan · RM19', note: 'Sekali bayar, akses kekal', features: ['Semua misi Tahun 1–6 tanpa had', 'Dua profil anak', 'Cikgu Dimensi + jejak kemajuan', 'Satu muat turun lembaran kerja sehari'] },
    family_plus: { name: 'Family Plus', price: 'RM29', cta: 'Teruskan · RM29', note: 'Sekali bayar, akses kekal', features: ['Semua manfaat Akses Keluarga', 'Sehingga lima profil anak', '9 mini games Kemahiran Fokus', 'PDF + lembaran kerja tanpa had', 'Ciri baharu dalam tempoh 2 bulan'] },
  };
  let root = null, rating = 0, grade = null, choice = null;

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  function sessionId() {
    try { const s = JSON.parse(sessionStorage.getItem('pa_demo_funnel_v1')); if (/^[0-9a-f-]{36}$/i.test(s?.id || '')) return s.id; } catch (_) {}
    return crypto.randomUUID();
  }

  function build() {
    root = el('div', 'paWrap hidden'); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'paWrapTitle');
    root.innerHTML = `<section class="paWrapCard">
      <button type="button" class="paWrapClose" aria-label="Tutup">×</button>
      <div class="paWrapStep" data-step="rate">
        <p class="paWrapKicker">DEMO SELESAI</p>
        <h2 id="paWrapTitle">Macam mana pengalaman demo tadi?</h2>
        <p class="paWrapSub">Geser bintang untuk menilai Pahlawan Angka. Maklum balas anda membantu kami menambah baik permainan.</p>
        <div class="paWrapMood" data-mood="0"><span class="paWrapSpark" aria-hidden="true"></span><img class="paWrapAurora" alt="" src="${MOOD[3]}"></div>
        <div class="paWrapStars" aria-hidden="true"></div>
        <p class="paWrapLabel" aria-live="polite">Geser untuk menilai</p>
        <div class="paWrapSlider">
          <input type="range" class="paWrapRange" min="1" max="5" step="1" value="3" aria-label="Penilaian, 1 hingga 5 bintang" aria-valuetext="Belum dinilai">
          <div class="paWrapTicks">${[1,2,3,4,5].map(i => `<button type="button" tabindex="-1" data-v="${i}" aria-label="${i} bintang">${i}</button>`).join('')}</div>
        </div>
        <label class="paWrapCommentLabel" for="paWrapComment">Apa yang paling anak suka, atau boleh diperbaiki? <span>(pilihan)</span></label>
        <textarea id="paWrapComment" class="paWrapComment" maxlength="500" rows="3" placeholder="Contoh: anak suka lawan boss, tapi soalan agak susah"></textarea>
        <div class="paWrapActions"><button type="button" class="paWrapPrimary" data-act="send" disabled>Hantar</button><button type="button" class="paWrapLink" data-act="skip">Langkau</button></div>
      </div>
      <div class="paWrapStep" data-step="plans" hidden>
        <p class="paWrapKicker" data-thanks>TERIMA KASIH!</p>
        <h2>Nak teruskan pengembaraan?</h2>
        <p class="paWrapSub">Pilih pakej, kemudian daftar guna akaun Google penjaga.</p>
        <div class="paWrapOptions" role="group" aria-label="Pilih pakej"></div>
        <div class="paWrapDetail" hidden aria-live="polite"></div>
      </div>
    </section>`;
    document.body.append(root);
    const stars = root.querySelector('.paWrapStars');
    for (let i = 1; i <= 5; i++) { const sEl = el('span', 'paWrapStar', '★'); sEl.dataset.v = String(i); stars.append(sEl); }
    const range = root.querySelector('.paWrapRange');
    range.addEventListener('input', () => setRating(Number(range.value)));
    range.addEventListener('change', () => setRating(Number(range.value)));
    root.querySelectorAll('.paWrapTicks button').forEach(b => b.addEventListener('click', () => setRating(Number(b.dataset.v))));
    const options = root.querySelector('.paWrapOptions');
    Object.entries(PACKAGES).forEach(([id, p]) => {
      const b = el('button', 'paWrapOption' + (id === 'family_plus' ? ' plus' : '')); b.type = 'button'; b.dataset.pkg = id; b.setAttribute('aria-pressed', 'false');
      b.append(el('b', '', p.name), el('span', '', p.price)); b.addEventListener('click', () => pick(id)); options.append(b);
    });
    root.querySelector('.paWrapClose').addEventListener('click', close);
    root.querySelector('[data-act="skip"]').addEventListener('click', () => showPlans(false));
    root.querySelector('[data-act="send"]').addEventListener('click', send);
    root.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  function paintSlider(v, touched) {
    const range = root.querySelector('.paWrapRange');
    range.value = String(v);
    range.style.setProperty('--pw-fill', `${(v - 1) * 25}%`);
    range.classList.toggle('touched', touched);
    range.setAttribute('aria-valuetext', touched ? `${v} bintang, ${LABELS[v]}` : 'Belum dinilai');
    root.querySelectorAll('.paWrapTicks button').forEach(b => b.classList.toggle('on', touched && Number(b.dataset.v) === v));
  }
  function setRating(v) {
    if (!(v >= 1 && v <= 5)) return;
    const changed = v !== rating; rating = v;
    paintSlider(v, true);
    root.querySelectorAll('.paWrapStar').forEach(s => s.classList.toggle('on', Number(s.dataset.v) <= v));
    root.querySelector('.paWrapLabel').textContent = LABELS[v];
    const mood = root.querySelector('.paWrapMood');
    mood.dataset.mood = String(v);
    mood.querySelector('img').src = MOOD[v];
    if (changed) { mood.classList.remove('pop'); void mood.offsetWidth; mood.classList.add('pop'); }
    root.querySelector('[data-act="send"]').disabled = false;
  }

  async function send() {
    const button = root.querySelector('[data-act="send"]'); if (!rating) return;
    button.disabled = true; button.textContent = 'Menghantar…';
    const comment = root.querySelector('#paWrapComment').value.trim().slice(0, 500) || null;
    try {
      await fetch(ENDPOINT, { method: 'POST', credentials: 'omit', keepalive: true,
        headers: { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ session_id: sessionId(), rating, comment, grade, is_test: TEST }) });
    } catch (_) { /* Feedback must never block the next step. */ }
    showPlans(true);
  }

  function showPlans(thanked) {
    root.querySelector('[data-step="rate"]').hidden = true;
    const step = root.querySelector('[data-step="plans"]'); step.hidden = false;
    step.querySelector('[data-thanks]').textContent = thanked ? 'TERIMA KASIH!' : 'DEMO SELESAI';
    step.querySelector('.paWrapOption')?.focus();
  }

  function pick(id) {
    choice = id; const p = PACKAGES[id];
    root.querySelectorAll('.paWrapOption').forEach(b => { const on = b.dataset.pkg === id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    const detail = root.querySelector('.paWrapDetail'); detail.hidden = false; detail.replaceChildren();
    const head = el('div', 'paWrapDetailHead'); head.append(el('b', '', p.name), el('span', '', p.price)); detail.append(head);
    if (p.note) detail.append(el('p', 'paWrapNote', p.note));
    const list = el('ul', 'paWrapFeatures'); p.features.forEach(f => list.append(el('li', '', f))); detail.append(list);
    const go = el('button', 'paWrapPrimary', p.cta); go.type = 'button'; go.addEventListener('click', proceed); detail.append(go);
  }

  function proceed() {
    const id = choice; close();
    if (id === 'free') window.PAEntry?.registerFree?.();
    else if (id) window.PAEntry?.choose?.(id);
  }

  function open(options = {}) {
    if (!root) build();
    rating = 0; choice = null; grade = Number.isInteger(options.grade) && options.grade >= 1 && options.grade <= 6 ? options.grade : null;
    root.querySelectorAll('.paWrapStar').forEach(s => s.classList.remove('on'));
    root.querySelector('.paWrapLabel').textContent = 'Geser untuk menilai';
    const mood = root.querySelector('.paWrapMood'); mood.dataset.mood = '0'; mood.classList.remove('pop'); mood.querySelector('img').src = MOOD[3];
    paintSlider(3, false);
    MOOD.forEach(src => { if (src) { const i = new Image(); i.src = src; } });
    root.querySelector('#paWrapComment').value = '';
    const send = root.querySelector('[data-act="send"]'); send.disabled = true; send.textContent = 'Hantar';
    root.querySelector('[data-step="rate"]').hidden = false;
    root.querySelector('[data-step="plans"]').hidden = true;
    root.querySelector('.paWrapDetail').hidden = true;
    root.querySelectorAll('.paWrapOption').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
    root.classList.remove('hidden');
    const card = root.querySelector('.paWrapCard'); card.tabIndex = -1; card.focus({ preventScroll: true });
  }
  function close() { root?.classList.add('hidden'); }

  window.PADemoWrapup = Object.freeze({ open, close });
})();
