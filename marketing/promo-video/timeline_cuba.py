"""Promo #8 "Cuba Dulu" — 36 saat, 9:16. Hook: "Ajak buat matematik, terus muka berubah?"

Gaya: iklan app gaya Duolingo dengan tatabahasa claude-motion-design: satu bentuk dari awal ke akhir
(ikon muka emas yang menjadi "penonton" di sudut, kemudian kembali besar di penutup), teks naik bertopeng,
satu warna aksen (emas), satu benda bergerak pada satu masa, UI sebenar dan riak ketukan pada lokasi sebenar.

Sumber DM = rakaman Demo sebenar (main, Darjah 2) bingkai demi bingkai pada 1080×2236 dengan jam maya
(rec/capture.js): Pilih Darjah → 14 soalan → Jurus Penamat → AURORA BEBAS! → BERJAYA!.
  0.0–2.4   kad Demo Battlefield · Pilih Darjah (ketuk Darjah 2 @1.43, Masuk ke Battlefield @2.43)
  2.5–5.3   S1 Isi Padu Cecair, betul @4.30 → serangan
  8.0–13.5  S3 Baca Jam: 3:45 salah @9.83 → "Jarum pendek menunjukkan jam…" → 3:35 betul @12.43 → KUNCI GANGSA PECAH
  50.5–54   S10 Kunci Emas, taip 600 → Jawab @53.30
  66.5–76.8 S14 taip RM2.60 → Jawab @69.70 → Jurus Penamat → AURORA BEBAS! → syiling
  76.87–    BERJAYA! 14/14 · 100% · "Demo Darjah 2 · 14/14 soalan · 9 topik diteroka. Keputusan ini tidak disimpan."
Sinematik ENTER (portal) = video yang sama dimainkan app semasa masuk battlefield (assets/cinematics/enter.mp4).
Skrin pakej harga selepas demo TIDAK dirakam (tiada harga dalam video).
"""
from engine import Shot, Callout, EndScene, FullClip
from timeline_main import R, Z, end_sfx
from motion_fx import Face, RiseText, TapRings

DURATION = 36.0

SOURCES = {'DM': 'src_DM.mp4'}
GS = ['correct', 'wrong', 'sword-slash-v2', 'hit', 'ui', 'aura-charge', 'glacier-thunder', 'finisher', 'coin-pickup',
      'chargeup', 'StingerPA']
SOURCES_AUDIO = {'ENTER': 'aud_ENTER.wav', **{f'GS_{n}': f'aud_GS_{n}.wav' for n in GS}}

WH = (255, 255, 255)
GD = (250, 196, 70)

# ---------------------------------------------------------------- rakaman → masa filem
SHOTS = [
    Shot(4.0, 6.2, 'DM', [(0.35, 2.55, 2.2)], 'pilih-darjah'),
    Shot(9.6, 12.0, 'DM', [(2.9, 5.3, 2.4)], 's1-jawab-serang'),
    Shot(12.0, 16.4, 'DM', [(8.7, 9.95, 1.25), (9.95, 11.6, 1.65), (11.95, 13.45, 1.5)], 's3-salah-petunjuk-betul'),
    Shot(16.4, 19.6, 'DM', [(50.9, 53.9, 3.0), (53.9, 53.9, 0.2)], 's10-kunci-emas-taip'),
    Shot(19.6, 26.4, 'DM', [(68.9, 75.7, 6.8)], 's14-jurus-penamat-aurora'),
    Shot(26.4, 30.2, 'DM', [(76.7, 80.3, 3.6), (80.3, 80.3, 0.2)], 'berjaya'),
]

# bunyi asal game (dilog semasa rakaman, masa rakaman)
GAME_SFX = [(1.4, 'ui', 0.0), (4.267, 'correct', 0.52), (4.437, 'sword-slash-v2', 0.52), (4.577, 'hit', 0.52),
            (9.8, 'wrong', 0.52), (12.4, 'correct', 0.52), (12.57, 'sword-slash-v2', 0.52), (12.71, 'hit', 0.52),
            (53.267, 'correct', 0.52), (53.437, 'sword-slash-v2', 0.52), (53.577, 'hit', 0.52),
            (69.667, 'correct', 0.52), (69.667, 'aura-charge', 0.58), (70.667, 'sword-slash-v2', 0.52),
            (71.817, 'sword-slash-v2', 0.52), (71.957, 'glacier-thunder', 0.52), (72.067, 'glacier-thunder', 0.4),
            (72.2, 'glacier-thunder', 0.35), (73.237, 'finisher', 0.64), (75.267, 'coin-pickup', 0.44),
            (75.367, 'coin-pickup', 0.44), (75.5, 'coin-pickup', 0.44), (75.6, 'coin-pickup', 0.44),
            (76.827, 'StingerPA', 0.66)]
TAPS = [(1.433, 540, 1085), (2.433, 540, 1520), (4.3, 782, 2036), (9.833, 782, 1870), (12.433, 298, 1763),
        (52.3, 422, 1984), (53.3, 902, 1984), (69.7, 902, 1984)]


def film_time(c):
    """Masa rakaman → masa filem melalui segmen Shot (None jika tidak ditayang)."""
    for sh in SHOTS:
        t = sh.t0
        for a, b, d in sh.segs:
            if a < b and a <= c < b:
                return t + (c - a) * d / (b - a)
            t += d
    return None


def _game_sfx():
    out = []
    for c, name, vol in GAME_SFX:
        ft = film_time(c)
        if ft is not None and vol > 0:
            dur = {'StingerPA': 3.8, 'aura-charge': 1.3, 'glacier-thunder': 1.6}.get(name, 1.0)
            out.append(('src', ft, f'GS_{name}', 0.0, dur, min(1.0, vol * 1.25)))
    out.append(('src', film_time(1.43), 'GS_ui', 0.0, 0.05, 0.7))
    out.append(('src', film_time(2.43), 'GS_ui', 0.0, 0.05, 0.7))
    return out


# ---------------------------------------------------------------- babak (latar)
SCENES = [
    dict(t0=0.0, bg='deep'),
    dict(t0=4.0, bg='navy', wipe=0.35, wipe_tile='+', origin=(540, 1080)),
    dict(t0=9.6, bg='navy'),
    dict(t0=30.2, bg='deep', wipe=0.35, wipe_tile='×', origin=(540, 1080)),
    dict(t0=32.6, bg='gold', wipe=0.45, wipe_tile='÷', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.35), ('−', 930, 330, 120, 10, 0.45), ('×', 160, 1700, 130, 8, 0.55), ('÷', 920, 1680, 150, -8, 0.5)]),
]

HIDE = R(s=1.0, oy=1500, rx=20, a=0.0)
BASE = dict(s=1.28, oy=1282)

CAMERA = [
    (0.0, HIDE),
    (3.85, R(s=0.9, oy=1560, ry=-14, rz=-3, rx=14, a=0.0)),
    (4.35, R(**BASE, ry=-6, rz=-1, rx=3), 'out'),
    (6.05, R(s=1.31, oy=1276, ry=-3, rz=-0.4, rx=1)),
    (6.2, R(s=1.45, oy=1260, a=0.0), 'in'),
    # battle
    (9.6, R(s=1.0, oy=1380, ry=12, rz=2, rx=8, a=0.0)),
    (10.0, R(**BASE, ry=5, rz=1, rx=2), 'out'),
    (11.95, R(s=1.3, oy=1278, ry=3, rz=0.5, rx=1)),
    (12.35, R(**BASE, ry=-5, rz=-1, rx=2)),
    (16.25, R(s=1.31, oy=1276, ry=-3, rz=-0.5, rx=1)),
    (16.65, R(**BASE, ry=5, rz=1, rx=2)),
    (19.5, R(s=1.31, oy=1276, ry=3, rz=0.5, rx=1)),
    # Jurus Penamat: zoom perlahan ke arena
    (20.1, R(s=1.3, oy=1278, ry=1)),
    (21.0, Z(0.5, 0.19, 1.75, oy=1150)),
    (25.9, Z(0.5, 0.2, 1.85, oy=1150)),
    # BERJAYA
    (26.55, R(**BASE, ry=-3, rz=-0.5, rx=1)),
    (29.9, R(s=1.31, oy=1276, ry=-1)),
    (30.2, R(s=1.45, oy=1260, a=0.0), 'in'),
    (36.0, R(s=1.45, oy=1260, a=0.0)),
]

PHONES = [dict(shots=SHOTS, camera=CAMERA, highlights=[])]

# ---------------------------------------------------------------- muka: hook → penonton di sudut → penutup
CORNER = dict(x=952, y=1762, size=160)
FACE_KEYS = [
    (0.0, dict(x=540, y=1050, size=40, mood=0.45, eyes=1.0, a=0.0)),
    (0.35, dict(size=430, a=1.0)),
    (1.25, dict(mood=0.45, eyes=1.0, squash=0.0)),
    (1.5, dict(mood=-0.85, eyes=0.42, look=1.0, squash=0.5)),     # "terus muka berubah?"
    (1.75, dict(squash=-0.2)),
    (2.0, dict(squash=0.0)),
    (3.45, dict(mood=-0.85, eyes=0.42, x=540, y=1050, size=430)),
    (4.2, dict(**CORNER, mood=-0.6, eyes=0.55, look=-1.0)),       # jadi penonton: masih ragu-ragu
    (6.0, dict(a=1.0)),
    (6.2, dict(a=0.0)),                                           # sembunyi semasa portal skrin penuh
    (9.7, dict(a=0.0, mood=-0.3, eyes=0.7, look=-1.0)),
    (10.0, dict(a=1.0)),
    (11.0, dict(mood=-0.3, eyes=0.7)),
    (11.3, dict(mood=0.25, eyes=1.0, squash=0.3)),                # serangan pertama: mula berminat
    (11.6, dict(squash=0.0)),
    (13.1, dict(mood=0.25)),
    (13.4, dict(mood=-0.35, eyes=0.85)),                          # salah
    (15.3, dict(mood=-0.35)),
    (15.6, dict(mood=0.6, eyes=1.0, squash=0.3)),                 # betul selepas petunjuk
    (15.9, dict(squash=0.0)),
    (18.8, dict(mood=0.6)),
    (19.1, dict(mood=0.8, squash=0.3)),
    (19.4, dict(squash=0.0)),
    (20.9, dict(a=1.0)),
    (21.2, dict(a=0.0)),                                          # beri ruang untuk Jurus Penamat
    (26.5, dict(a=0.0, mood=1.0, eyes=1.0, look=0.0)),
    (26.9, dict(a=1.0, squash=0.4)),
    (27.2, dict(squash=0.0)),
    (29.9, dict(**CORNER, mood=1.0)),
    (30.6, dict(x=540, y=1000, size=440, mood=1.0, squash=0.0)),  # kembali besar: muka sudah berubah
    (30.85, dict(squash=0.35)),
    (31.1, dict(squash=0.0)),
    (32.3, dict(x=540, y=1000, size=440, a=1.0)),
    (32.7, dict(size=200, y=880, a=0.0)),
]

# ---------------------------------------------------------------- teks
TEXTS = []

RISES = [
    RiseText(0.15, 3.35, [[('Ajak', WH), ('buat', WH)], [('matematik,', GD)]], y=420, size=118),
    RiseText(1.45, 3.4, [[('terus', WH), ('muka', WH)], [('berubah?', GD)]], y=1560, size=118),
    RiseText(4.05, 6.15, [[('Cuba', WH), ('tunjuk', WH)], [('Pahlawan', GD), ('Angka.', GD)]], y=250, size=96),
    RiseText(6.3, 9.45, [[('Anak', WH), ('main', WH)], [('satu', GD), ('cabaran.', GD)]], y=250, size=104),
    RiseText(9.75, 12.0, [[('Jawab', WH), ('soalan', WH)], [('matematik…', GD)]], y=250, size=96),
    RiseText(12.2, 15.2, [[('Salah?', WH)], [('Ada', GD), ('petunjuk.', GD)]], y=250, size=96),
    RiseText(15.3, 16.35, [[('Cuba', WH), ('lagi…', WH)], [('betul!', GD)]], y=250, size=96),
    RiseText(16.55, 19.5, [[('Kunci', WH), ('Emas?', WH)], [('Taip', GD), ('sendiri.', GD)]], y=250, size=96),
    RiseText(19.7, 21.6, [[('Dan', WH), ('tengok', WH), ('apa', WH)], [('jadi', GD), ('lepas', GD), ('tu…', GD)]], y=250, size=92),
    RiseText(26.6, 30.1, [[('Terus', WH), ('nampak', WH)], [('hasilnya.', GD)]], y=250, size=96),
    RiseText(30.7, 32.5, [[('Tengok', WH), ('gameplay', WH), ('dulu…', WH)]], y=330, size=84),
    RiseText(31.05, 32.5, [[('baru', GD), ('decide.', GD)]], y=1610, size=118),
    RiseText(31.5, 32.5, [[('Sesuai', WH), ('ke', WH), ('tak', WH), ('untuk', WH), ('anak.', WH)]], y=1760, size=50,
             font_name='InterDisplay-Bold.otf'),
]

SPECIALS = [
    # portal yang sama dengan app semasa masuk battlefield
    FullClip('src_ENTER.mp4', 6.2, 9.6, [(0.4, 4.3, 3.4)], zoom=(1.0, 1.06), scrim=0.65, fade=(0.15, 0.2)),
    lambda r: TapRings(r, 0, [(film_time(c), x, y) for c, x, y in TAPS if film_time(c) is not None]),
    # penerangan app selepas jawapan salah, dinaikkan supaya boleh dibaca
    lambda r: Callout(r, 0, 13.4, 15.15, (0.04, 0.9, 0.96, 0.945), 540, 900, 960, ry=-4, rz=-0.5),
    # keputusan: statistik + ringkasan demo, kemudian pesanan Cikgu Dimensi
    lambda r: Callout(r, 0, 27.0, 30.05, (0.1, 0.372, 0.9, 0.5), 540, 700, 860, ry=-4, rz=-0.5),
    lambda r: Callout(r, 0, 28.0, 30.05, (0.08, 0.53, 0.92, 0.63), 560, 1620, 900, ry=5, rz=0.5),
    Face(0.0, 32.8, FACE_KEYS),
    *RISES,
    EndScene(32.6, 36.6, lines=[('Satu cabaran.', 62, WH), ('Tiada akaun', 58, GD), ('diperlukan.', 58, GD)],
             button='Cuba Demo', tag=('Pilih darjah,', 'terus ke battlefield.'), box_h=560),
]

FLASHES = [(9.6, 0.3, 0.45), (21.65, 0.3, 0.35), (22.9, 0.25, 0.3), (26.4, 0.3, 0.4)]

# ---------------------------------------------------------------- audio
MUSIC = [('intro', 0, 2), ('light', 2, 1), ('build', 3, 2), ('drop', 5, 1), ('groove', 6, 5), ('drop', 11, 2),
         ('groove', 13, 2), ('light', 15, 1), ('outro', 16, 2)]

SFX = [
    ('pop', 0.15, 0.45), ('pop', 0.25, 0.45), ('pop', 0.4, 0.5), ('thud', 0.35, 0.6),
    ('boing', 1.5, 0.7, 0.85), ('pop', 1.45, 0.4), ('pop', 1.55, 0.4), ('pop', 1.7, 0.45),
    ('whoosh', 3.4, 0.6, 0.7), ('pop', 4.1, 0.4), ('pop', 4.25, 0.4),
    ('whoosh', 6.1, 0.6, 0.6), ('src', 6.2, 'ENTER', 0.4, 4.3, 0.6),
    ('whoosh', 9.45, 0.5, 0.6),
    *_game_sfx(),
    ('pop', 12.2, 0.35), ('pop', 15.3, 0.35), ('pop', 16.55, 0.35), ('whoosh', 19.6, 0.5, 0.5),
    ('pop', 26.6, 0.4), ('pop', 27.05, 0.5), ('pop', 28.05, 0.5),
    ('whoosh', 30.1, 0.6, 0.6), ('boing', 30.85, 0.5, 0.6), ('pop', 31.05, 0.45), ('pop', 31.15, 0.45),
    *end_sfx(32.6),
]
