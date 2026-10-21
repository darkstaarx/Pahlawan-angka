"""Promo #8b "Cuba Dulu · Kelas Wira" — 54 saat, 9:16.

Cerita (ikut pemilik): hook muka berubah → anak main satu cabaran → salah? Tak apa, ada petunjuk dalam battle →
masih tak boleh? Tak apa → masuk mini-game, cuba lagi → 3 kali salah → Wira terus tunjuk cara, langkah demi langkah
("Jom tengok cara") → macam kelas tambahan dengan Wira, tanpa kos tambahan → menang → tengok gameplay dulu.

Semua rakaman ialah app sebenar (main 3.87.8), bingkai demi bingkai 1080×2236 dengan jam maya (capture/):
  DM  capture.js         Demo Darjah 2 penuh: Pilih Darjah, Jurus Penamat, BERJAYA (lihat CUBA.md)
  SL  capture_salah.js   Demo Darjah 2, benih 11: S1 betul; S2 "Cerita Berkurang" 257 pensel, 230 dijual: 487 salah
                         (tambah, bukan tolak) → petunjuk "Tolak bilangan yang telah dijual daripada jumlah asal." →
                         37 salah → petunjuk lagi, soalan beralih
  GH  capture_gudang.js  Gudang Harta #d2-tolak (benih 5), cerita 117 − 48 syiling: 79 / 89 / 99 salah →
                         "Jom tengok cara" → 6 langkah (ayat matematik, pinjam, 17 − 8 = 9, pinjam, 10 − 4 = 6,
                         0 di depan tidak ditulis) → SIAP! Cara Wira · 69
Topik battle dan mini-game sama (Tolak, Darjah 2).
"""
from engine import Shot, Callout, EndScene, FullClip
from timeline_main import R, end_sfx
from timeline_adaptive import Trail
from motion_fx import Face, RiseText, TapRings

DURATION = 54.0

SOURCES = {'DM': 'src_DM.mp4', 'SL': 'src_SL.mp4', 'GH': 'src_GH.mp4'}
GS = ['correct', 'wrong', 'sword-slash-v2', 'hit', 'ui', 'aura-charge', 'glacier-thunder', 'finisher', 'coin-pickup',
      'chargeup', 'StingerPA']
SOURCES_AUDIO = {'ENTER': 'aud_ENTER.wav', 'JATUH': 'aud_JATUH.wav', **{f'GS_{n}': f'aud_GS_{n}.wav' for n in GS}}

WH = (255, 255, 255)
GD = (250, 196, 70)
SOFT = (204, 214, 240)

# DM (capture.js benih 7): mula Jurus Penamat (jawapan soalan terakhir) dan skrin BERJAYA, masa rakaman
DM_JURUS, DM_DONE = 70.5, 76.7

# ---------------------------------------------------------------- rakaman → masa filem
SHOTS = [
    Shot(3.4, 6.0, 'DM', [(0.35, 2.55, 2.2), (2.55, 2.55, 0.4)], 'pilih-darjah'),
    Shot(8.6, 10.6, 'SL', [(0.7, 2.7, 2.0)], 's1-betul-serang'),
    Shot(10.6, 15.2, 'SL', [(2.7, 7.3, 4.6)], 's2-cerita-salah-petunjuk'),
    Shot(15.2, 18.6, 'SL', [(7.3, 8.7, 1.4), (8.7, 8.7, 2.0)], 's2-salah-lagi'),
    Shot(21.7, 41.1, 'GH', [(0.0, 2.6, 2.6), (2.6, 8.5, 3.3), (8.5, 11.1, 2.6), (11.1, 20.3, 8.4),
                            (20.3, 22.2, 1.9), (22.2, 22.2, 0.6)], 'gudang-salah3-jom-tengok-cara-siap'),
    Shot(41.1, 44.55, 'DM', [(DM_JURUS, DM_JURUS + 4.8, 3.45)], 'jurus-penamat-aurora'),
    Shot(44.55, 47.25, 'DM', [(DM_DONE, DM_DONE + 2.5, 2.5), (DM_DONE + 2.5, DM_DONE + 2.5, 0.2)], 'berjaya'),
]


def ft(src, c):
    """Masa rakaman `c` sumber `src` → masa filem (None jika tidak ditayang)."""
    for sh in SHOTS:
        if sh.src != src:
            continue
        t = sh.t0
        for a, b, d in sh.segs:
            if a < b and a <= c < b:
                return t + (c - a) * d / (b - a)
            t += d
    return None


# bunyi asal game (masa rakaman, dilog semasa rakaman)
GAME_SFX = {
    'DM': [(DM_JURUS - 0.83, 'correct', 0.52), (DM_JURUS + 0.17, 'sword-slash-v2', 0.52), (DM_JURUS + 1.32, 'sword-slash-v2', 0.52),
           (DM_JURUS + 1.46, 'glacier-thunder', 0.52), (DM_JURUS + 1.57, 'glacier-thunder', 0.4), (DM_JURUS + 2.74, 'finisher', 0.64),
           (DM_JURUS + 4.77, 'coin-pickup', 0.44), (DM_DONE + 0.13, 'StingerPA', 0.66)],
    'SL': [(1.633, 'correct', 0.52), (1.803, 'sword-slash-v2', 0.52), (1.943, 'hit', 0.52), (4.8, 'wrong', 0.52),
           (7.8, 'wrong', 0.52)],
    # Gudang Harta guna WebAudio (tidak dilog): bunyi set game yang sama diletak pada ketukan sebenar
    'GH': [(2.333, 'wrong', 0.5), (5.167, 'wrong', 0.5), (8.0, 'wrong', 0.5), (10.9, 'ui', 0.7),
           (12.7, 'correct', 0.5), (13.967, 'correct', 0.45), (15.233, 'correct', 0.5), (16.5, 'correct', 0.45),
           (17.767, 'correct', 0.5), (19.033, 'correct', 0.45),
           (20.35, 'coin-pickup', 0.5), (20.5, 'coin-pickup', 0.5), (20.65, 'coin-pickup', 0.5)],
}
GH_KEYS = [1.633, 1.8, 4.033, 4.1, 4.467, 4.633, 6.867, 6.933, 7.3, 7.467]
TAPS = {
    'DM': [(1.433, 540, 1085), (2.433, 540, 1520)],
    'SL': [(1.633, 298, 1870), (4.8, 782, 1667), (7.8, 298, 1614)],
    'GH': [(2.333, 725, 2147), (5.167, 725, 2147), (8.0, 725, 2147), (10.9, 204, 2147), (12.7, 540, 1503),
           (13.967, 540, 1990), (15.233, 194, 1990), (16.5, 540, 1991), (17.767, 194, 1986), (19.033, 540, 1986)],
}


def _game_sfx():
    out = []
    for src, evs in GAME_SFX.items():
        for c, name, vol in evs:
            t = ft(src, c)
            if t is not None:
                dur = {'StingerPA': 3.8, 'aura-charge': 1.3, 'glacier-thunder': 1.6}.get(name, 1.0)
                out.append(('src', t, f'GS_{name}', 0.0, dur, min(1.0, vol * 1.25)))
    for c in GH_KEYS:
        t = ft('GH', c)
        if t is not None:
            out.append(('pop', t, 0.16))
    for c in (1.433, 2.433):
        out.append(('src', ft('DM', c), 'GS_ui', 0.0, 0.05, 0.7))
    return out


def _taps(r):
    pts = [(ft(src, c), x, y) for src, lst in TAPS.items() for c, x, y in lst]
    return TapRings(r, 0, [p for p in pts if p[0] is not None])


# ---------------------------------------------------------------- babak (latar)
SCENES = [
    dict(t0=0.0, bg='deep'),
    dict(t0=3.4, bg='navy', wipe=0.35, wipe_tile='+', origin=(540, 1080)),
    dict(t0=21.7, bg='navy', wipe=0.35, wipe_tile='÷', origin=(540, 1100)),
    dict(t0=41.1, bg='navy', wipe=0.3, wipe_tile='×', origin=(540, 1100)),
    dict(t0=47.25, bg='deep', wipe=0.35, wipe_tile='×', origin=(540, 1080)),
    dict(t0=49.85, bg='gold', wipe=0.45, wipe_tile='÷', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.35), ('−', 930, 330, 120, 10, 0.45), ('×', 160, 1700, 130, 8, 0.55), ('÷', 920, 1680, 150, -8, 0.5)]),
]

HIDE = R(s=1.0, oy=1500, rx=20, a=0.0)
GONE = R(s=1.45, oy=1260, a=0.0)
BASE = dict(s=1.28, oy=1282)

CAMERA = [
    (0.0, HIDE),
    (3.25, R(s=0.9, oy=1560, ry=-14, rz=-3, rx=14, a=0.0)),
    (3.75, R(**BASE, ry=-6, rz=-1, rx=3), 'out'),
    (5.85, R(s=1.31, oy=1276, ry=-3, rz=-0.4, rx=1)),
    (6.0, GONE, 'in'),
    # battle
    (8.6, R(s=1.0, oy=1380, ry=12, rz=2, rx=8, a=0.0)),
    (9.0, R(**BASE, ry=5, rz=1, rx=2), 'out'),
    (10.5, R(s=1.3, oy=1278, ry=3, rz=0.5, rx=1)),
    (10.9, R(**BASE, ry=-5, rz=-1, rx=2)),
    (15.1, R(s=1.31, oy=1276, ry=-3, rz=-0.5, rx=1)),
    (15.5, R(**BASE, ry=4, rz=0.8, rx=2)),
    (18.45, R(s=1.31, oy=1276, ry=2)),
    (18.6, GONE, 'in'),
    # mini-game
    (21.7, R(s=1.0, oy=1380, ry=-12, rz=-2, rx=8, a=0.0)),
    (22.1, R(**BASE, ry=-5, rz=-1, rx=2), 'out'),
    (29.2, R(s=1.3, oy=1278, ry=-2, rz=-0.3, rx=1)),
    (30.1, R(s=1.3, oy=1276, ry=4, rz=0.6, rx=2)),
    (38.3, R(s=1.33, oy=1270, ry=2, rz=0.3, rx=1)),
    (38.8, R(**BASE, ry=-3, rz=-0.5, rx=1)),
    (41.0, R(s=1.31, oy=1276, ry=-1)),
    # kembali ke battle: Jurus Penamat, BERJAYA
    (41.1, R(s=1.3, oy=1278, ry=1)),
    (41.85, dict(R(), s=1.75, u=0.5, v=0.19, oy=1150)),
    (44.4, dict(R(), s=1.82, u=0.5, v=0.2, oy=1150)),
    (44.7, R(**BASE, ry=-3, rz=-0.5, rx=1)),
    (47.1, R(s=1.31, oy=1276, ry=-1)),
    (47.4, GONE, 'in'),
    (54.0, GONE),
]

PHONES = [dict(shots=SHOTS, camera=CAMERA, highlights=[])]

# ---------------------------------------------------------------- muka: hook → penonton → penutup
CORNER = dict(x=952, y=1762, size=160)
FACE_KEYS = [
    (0.0, dict(x=540, y=1050, size=340, mood=0.45, eyes=1.0, a=1.0)),
    (0.35, dict(size=430)),
    (1.25, dict(mood=0.45, eyes=1.0, squash=0.0)),
    (1.5, dict(mood=-0.85, eyes=0.42, look=1.0, squash=0.5)),       # "terus muka berubah?"
    (1.75, dict(squash=-0.2)),
    (2.0, dict(squash=0.0)),
    (3.25, dict(mood=-0.85, eyes=0.42, x=540, y=1050, size=430)),
    (4.0, dict(**CORNER, mood=-0.6, eyes=0.55, look=-1.0)),
    (5.85, dict(a=1.0)),
    (6.0, dict(a=0.0)),
    (8.7, dict(a=0.0, mood=-0.3, eyes=0.7, look=-1.0)),
    (9.0, dict(a=1.0)),
    (10.1, dict(mood=-0.3)),
    (10.4, dict(mood=0.3, eyes=1.0, squash=0.3)),                   # serangan: mula berminat
    (10.7, dict(squash=0.0)),
    (12.6, dict(mood=0.3)),
    (12.9, dict(mood=-0.4, eyes=0.85)),                             # salah
    (15.5, dict(mood=-0.4)),
    (15.8, dict(mood=-0.7, eyes=0.6, look=1.0)),                    # salah lagi
    (18.45, dict(a=1.0)),
    (18.6, dict(a=0.0)),
    (21.8, dict(a=0.0, mood=-0.2, eyes=0.85, look=-1.0)),
    (22.1, dict(a=1.0)),
    (23.9, dict(mood=-0.2)),
    (24.2, dict(mood=-0.45, eyes=0.75)),
    (27.3, dict(mood=-0.45)),
    (27.6, dict(mood=-0.6, eyes=0.6)),                              # 3 kali salah
    (29.4, dict(mood=-0.6, eyes=0.6, look=-1.0)),
    (29.7, dict(mood=0.1, eyes=1.0, look=0.0, squash=0.25)),        # "Jom tengok cara"
    (30.0, dict(squash=0.0)),
    (35.0, dict(mood=0.45)),
    (38.5, dict(mood=0.45)),
    (38.8, dict(mood=0.85, squash=0.35)),                           # SIAP!
    (39.1, dict(squash=0.0)),
    (40.9, dict(a=1.0)),
    (41.2, dict(a=0.0)),                                            # ruang untuk Jurus Penamat
    (44.55, dict(a=0.0, mood=1.0, eyes=1.0, look=0.0)),
    (44.95, dict(a=1.0, squash=0.4)),
    (45.25, dict(squash=0.0)),
    (47.15, dict(**CORNER, mood=1.0)),
    (47.85, dict(x=540, y=1000, size=440, mood=1.0, squash=0.0)),   # kembali besar: muka sudah berubah
    (48.1, dict(squash=0.35)),
    (48.35, dict(squash=0.0)),
    (49.55, dict(x=540, y=1000, size=440, a=1.0)),
    (49.95, dict(size=200, y=880, a=0.0)),
]

# ---------------------------------------------------------------- teks
TEXTS = []
L2 = 357    # baris kedua teks atas (size 96)
RISES = [
    RiseText(0.02, 3.3, [[('Ajak', WH), ('buat', WH)], [('matematik,', GD)]], y=420, size=118),
    RiseText(1.45, 3.35, [[('terus', WH), ('muka', WH)], [('berubah?', GD)]], y=1560, size=118),
    RiseText(3.55, 5.95, [[('Cuba', WH), ('tunjuk', WH)], [('Pahlawan', GD), ('Angka.', GD)]], y=250, size=96),
    RiseText(6.1, 8.45, [[('Anak', WH), ('main', WH)], [('satu', GD), ('cabaran.', GD)]], y=250, size=104),
    RiseText(8.75, 10.5, [[('Jawab', WH), ('betul,', WH)], [('Wira', GD), ('serang!', GD)]], y=250, size=96),
    RiseText(10.75, 12.6, [[('Kalau', WH), ('salah?', GD)]], y=250, size=96),
    RiseText(12.75, 15.05, [[('Tak', WH), ('apa.', WH)], [('Ada', GD), ('petunjuk.', GD)]], y=250, size=96),
    RiseText(15.35, 18.45, [[('Masih', WH), ('tak', WH), ('boleh?', WH)]], y=250, size=96),
    RiseText(16.6, 18.45, [[('Tak', GD), ('apa.', GD)]], y=L2, size=96),
    RiseText(18.75, 21.55, [[('Masuk', WH), ('mini-game,', GD)], [('cuba', WH), ('lagi.', WH)]], y=250, size=96),
    RiseText(21.85, 23.9, [[('Topik', WH), ('sama,', WH)], [('dunia', GD), ('lain.', GD)]], y=250, size=96),
    RiseText(24.05, 29.25, [[('Cuba,', WH), ('cuba', WH), ('lagi…', WH)]], y=250, size=96),
    RiseText(26.9, 29.25, [[('3', GD), ('kali', GD), ('salah?', GD)]], y=L2, size=96),
    RiseText(29.4, 31.6, [[('Wira', WH), ('terus', WH)], [('tunjuk', GD), ('cara.', GD)]], y=250, size=96),
    RiseText(31.75, 38.45, [[('Langkah', WH), ('demi', WH)], [('langkah.', GD)]], y=250, size=96),
    RiseText(38.6, 41.0, [[('Macam', WH), ('kelas', WH), ('tambahan', WH)], [('dengan', WH), ('Wira,', GD)]], y=230, size=84),
    RiseText(39.05, 41.0, [[('tanpa', GD), ('kos', GD), ('tambahan.*', GD)]], y=420, size=70),
    RiseText(39.5, 41.0, [[('*Mini-game', SOFT), ('Kemahiran', SOFT), ('Fokus', SOFT), ('dalam', SOFT), ('pakej', SOFT),
                           ('Family', SOFT), ('Plus.', SOFT)]], y=505, size=30, font_name='Inter-SemiBold.otf'),
    RiseText(41.25, 44.45, [[('Dah', WH), ('faham?', WH)], [('Terus', GD), ('menang!', GD)]], y=250, size=96),
    RiseText(44.7, 47.2, [[('Terus', WH), ('nampak', WH)], [('hasilnya.', GD)]], y=250, size=96),
    RiseText(47.95, 49.75, [[('Tengok', WH), ('gameplay', WH), ('dulu…', WH)]], y=330, size=84),
    RiseText(48.3, 49.75, [[('baru', GD), ('decide.', GD)]], y=1610, size=118),
    RiseText(48.75, 49.75, [[('Sesuai', WH), ('ke', WH), ('tak', WH), ('untuk', WH), ('anak.', WH)]], y=1760, size=50,
             font_name='InterDisplay-Bold.otf'),
]

TRAIL = [('Cuba 1', 22.4, ft('GH', 2.333), False), ('Cuba 2', ft('GH', 4.033), ft('GH', 5.167), False),
         ('Cuba 3', ft('GH', 6.867), ft('GH', 8.0), False)]

SPECIALS = [
    # portal yang sama dengan app semasa masuk battlefield
    FullClip('src_ENTER.mp4', 6.0, 8.6, [(1.7, 4.3, 2.6)], zoom=(1.0, 1.05), scrim=0.65, fade=(0.15, 0.2)),
    # "masuk mini-game": Wira jatuh ke pusaran Matematik
    FullClip('src_JATUH.mp4', 18.6, 21.7, [(0.0, 3.1, 3.1)], zoom=(1.0, 1.06), scrim=0.6, fade=(0.15, 0.0)),
    _taps,
    # petunjuk dalam battle (dinaikkan supaya boleh dibaca)
    lambda r: Callout(r, 0, ft('SL', 5.35), 15.1, (0.04, 0.83, 0.96, 0.885), 540, 545, 980, ry=-4, rz=-0.5),
    lambda r: Callout(r, 0, ft('SL', 8.3), 18.45, (0.04, 0.83, 0.96, 0.885), 540, 545, 980, ry=4, rz=0.5),
    Trail(22.3, 29.25, 540, TRAIL),
    # arahan langkah Wira (pinjam), diangkat supaya boleh dibaca
    lambda r: Callout(r, 0, 31.8, 34.0, (0.065, 0.35, 0.935, 0.445), 540, 650, 940, ry=4, rz=0.5),
    Face(0.0, 50.0, FACE_KEYS),
    *RISES,
    EndScene(49.85, 54.6, lines=[('Satu cabaran.', 62, WH), ('Tiada akaun', 58, GD), ('diperlukan.', 58, GD)],
             button='Cuba Demo', tag=('Pilih darjah,', 'terus ke battlefield.'), box_h=560),
]

FLASHES = [(8.6, 0.3, 0.45), (21.7, 0.3, 0.45), (ft('GH', 20.3), 0.3, 0.35), (42.6, 0.3, 0.35), (44.55, 0.3, 0.4)]

# ---------------------------------------------------------------- audio
# 1 bar = 2 s: tenang semasa salah dan mini-game, drop hanya pada Jurus Penamat (~41 s)
MUSIC = [('intro', 0, 2), ('light', 2, 2), ('groove', 4, 1), ('break', 5, 1), ('light', 6, 3), ('break', 9, 2),
         ('light', 11, 8), ('build', 19, 1), ('drop', 20, 3), ('groove', 23, 1), ('outro', 24, 4)]
MUSIC_OFFSET = 0.0

SFX = [
    ('pop', 0.15, 0.45), ('pop', 0.25, 0.45), ('pop', 0.4, 0.5), ('thud', 0.35, 0.6),
    ('boing', 1.5, 0.7, 0.85), ('pop', 1.45, 0.4), ('pop', 1.55, 0.4), ('pop', 1.7, 0.45),
    ('whoosh', 3.25, 0.6, 0.7), ('whoosh', 5.9, 0.6, 0.6), ('src', 6.0, 'ENTER', 1.7, 4.3, 0.6),
    ('whoosh', 8.45, 0.5, 0.6), ('whoosh', 18.45, 0.6, 0.6), ('src', 18.6, 'JATUH', 0.0, 3.1, 0.6),
    ('whoosh', 21.55, 0.5, 0.6), ('shimmer', ft('GH', 20.3), 0.5), ('whoosh', 40.95, 0.5, 0.6),
    *_game_sfx(),
    ('pop', 44.75, 0.4), ('whoosh', 47.15, 0.6, 0.6), ('boing', 48.1, 0.5, 0.6), ('pop', 48.3, 0.45),
    *end_sfx(49.85),
]
