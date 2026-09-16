# Nota Render Stack: HTML vs Three.js vs Unity

Nota ini menjawab satu soalan: **apa yang patut melukis pentas Pahlawan Angka,
dan apa yang patut kekal HTML?**

Demo hidup (buka melalui server tempatan, bukan `file://`, kerana ia guna ES module):

- `audit/battle-portrait-preview.html` - susun atur telefon sebenar: chrome atas,
  pentas Segel Tambah, kad soalan wang Tahun 1. Inilah rujukan utama.
- `audit/threejs-stage-preview.html` - kajian ringkas Wira lawan Askabus.

---

## 1. Tiga benda ini bukan tiga pilihan yang sama jenis

| | Apa dia sebenarnya | Di mana ia hidup |
|---|---|---|
| **HTML/CSS/DOM** | Cara browser susun & lukis elemen (`<div>`, `<img>`) | Dalam halaman |
| **Three.js** | *Library* JavaScript yang melukis ke dalam satu `<canvas>` guna GPU (WebGL) | Dalam halaman, satu elemen sahaja |
| **Unity** | *Enjin permainan* lengkap (editor, fizik, animasi, C#) | Program berasingan; untuk web ia di-*export* jadi WebGL blob |

Maksudnya:

- Three.js **bukan pengganti** HTML. Ia duduk **di dalam** HTML.
- Unity **memang pengganti**. Build WebGL Unity mengambil alih seluruh skrin;
  HTML di sekelilingnya jadi bekas kosong sahaja.

## 2. Boleh gabung?

- **HTML + Three.js** - ya, dan inilah gabungan biasa. Canvas jadi pentas,
  DOM jadi UI di atasnya. Kedua-duanya kongsi `window`, jadi `battle.js`
  boleh panggil pentas terus tanpa jambatan.
- **HTML + Unity WebGL** - boleh secara teknikal, tetapi UI mesti pilih
  satu dunia. Lalu lintas antara JS dan C# perlu `SendMessage`/`jslib`.
  Semua teks BM, TTS, pembaca skrin dan `<input>` jadi kerja tambahan.

## 3. Kenapa DOM kekal untuk UI

Skrin Pahlawan Angka bukan skrin aksi. Ia skrin **teks + pilihan**:
soalan, 4 jawapan, petunjuk, maklum balas, bar HP, PIN penjaga.
Untuk itu DOM menang mutlak:

- teks sebenar: boleh pilih, boleh zoom, boleh baca kuat (TTS), boleh
  diterjemah, boleh diuji dengan `querySelector`
- aksesibiliti percuma: fokus papan kekunci, `aria-live`, saiz fon sistem
- 2 baris CSS untuk tukar rupa butang, tiada *rebuild*

Teks di dalam canvas WebGL bermakna melukis fon sendiri, tiada pemilihan,
tiada pembaca skrin, dan kabur pada DPI pelik. **Jangan pindahkan kad soalan
ke dalam canvas.**

## 4. Apa sebenarnya Three.js beli untuk kita

Bukan "UI lebih cantik". Butang tetap DOM. Yang ia beli ialah **pentas**:

| Sekarang (sprite DOM + CSS) | Dengan Three.js |
|---|---|
| Setiap kesan = satu `<div>`/`<img>` lagi; ~20 zarah sudah mula tersekat | 200-2000 zarah satu *draw call*, GPU |
| Goncang skrin = animasikan `transform` pada bekas; layout boleh terganggu | Goncang kamera; sifar kos layout |
| Kedalaman palsu (`z-index`, skala) | Kedalaman betul: parallax, kabur jarak |
| Kilat kena = `filter:brightness()` pada `<img>` (mahal di Android) | Ubah warna material, hampir percuma |
| Lengkung senjata = PNG bingkai demi bingkai | Jejak dinamik ikut kedudukan sebenar |

Kalau yang kita mahu cuma "butang lebih cantik", Three.js **tidak** jawab itu.
Kalau yang kita mahu "hentaman terasa berat", ya, itu kerja Three.js.

## 5. Harga yang kena bayar

- **Saiz**: `three.module.min.js` = 672 KB mentah, ~170 KB gzip.
  Di-*vendor* dalam `js/vendor/`, **bukan CDN** - PWA ini mesti jalan offline
  dan `sw.js` kena boleh cache fail itu.
- **GPU rendah**: had `setPixelRatio` kepada 2. Tablet sekolah murah akan
  panas kalau render 3x DPI.
- **Konteks WebGL boleh hilang** (Android jimat memori). Perlu pengendali
  `webglcontextlost` yang jatuh balik ke sprite DOM.
- **Gerakan minimum**: hormati `prefers-reduced-motion`; demo ada suisnya.
- Semua ini bermakna **pentas DOM tidak boleh dibuang** - ia jadi fallback.

## 6. Jadi Unity untuk apa?

`PahlawanAngka-Unity-Prototype` berguna sebagai **makmal rasa**, bukan sasaran
penghantaran. Di sana kita cepat menemui masa hentaman, lengkung kamera,
susunan orb ganjaran. Bila rasa itu sudah betul, kita bina semula rasa yang
sama di web. Menghantar Unity WebGL kepada murid bermakna muat turun puluhan MB
sebelum soalan pertama, tiada PWA offline, dan UI teks yang lebih susah.

## 7. Jalan yang dicadangkan

1. **Lapisan adapter dahulu** - satu objek `PAStage` dengan kaedah seperti
   `heroAttack()`, `enemyAttack()`, `hit()`. `battle.js` hanya panggil itu.
   Hari ini `PAStage` boleh dilaksanakan dengan sprite DOM sedia ada.
2. **Tukar enjin di belakang adapter** untuk satu skrin sahaja (arena battle).
   Tiada logik pembelajaran yang berubah.
3. **Ukur** pada peranti Android paling lemah yang kita sokong sebelum
   meluaskan ke hub/finisher.

Adapter ini yang penting. Tanpa ia, tukar enjin bermakna tulis semula battle.
