"""Promo #6 "Gameplay" — 60 saat, 9:16, 120 BPM (1 bar = 2 s).

Lebih banyak gameplay, semua ciri dalam satu minit, ikut susunan pemilik:
JURUS PENAMAT terus pada saat 0 → game ni bijak (Kembara Dimensi, Kemahiran Fokus) →
sinematik portal (ENTER) → battle asas: jawab betul = serang, Kunci Gangsa → Perak → Emas (taip), pecah Emas =
Jurus Penamat → sinematik jatuh ke pusaran Matematik (JATUH) → 9 mini game → progress: selamatkan teman,
Khazanah, evolusi teman, trofi → mak ayah (laporan + worksheet PDF) → penutup Wira.

Sumber: A B C F K O P G1–G9 (lihat SINEMATIK.md / FOKUS.md / AZ.md) dan dua sinematik Wira baharu:
  ENTER  enter.mp4  Wira keluar dari portal, berpaling, masuk semula dan larut jadi zarah biru
         (sama seperti sinematik portal sebelum battle dalam app, assets/cinematics/wira-demo-entry-v1.mp4)
  JATUH  jatuh.mp4  Wira jatuh ke pusaran simbol Matematik dan ditelan bola cahaya
Kedua-duanya 1080×1920, ditukar ke 30 fps.
Julat dielak: B 1.5–3.5 (e-mel), F 1.6–3.05 (e-mel) & ≥ 12.6 (PIN ditaip), P 0–1.5 (PIN) & > 22.1 (notifikasi).
"""
from engine import Shot, Callout, HookText, EndScene, LogoReveal, PdfPages, FullClip, Chip, VideoGrid, TierPills, CardGrid
from timeline_main import R, Z, end_sfx, TROFI, GANGSA, PERAK, EMAS
from timeline_az import _line, whip, HOT, WHITE, GRID, GRID_LABELS, PDF_A, PDF_B, GONE, HIDE

DURATION = 60.0

SOURCES = {k: f'src_{k}.mp4' for k in ['A', 'B', 'C', 'F', 'K', 'O', 'P'] + [f'G{i}' for i in range(1, 10)]}
SOURCES_AUDIO = {k: f'aud_{k}.wav' for k in ['B', 'C', 'F', 'K', 'O', 'ENTER', 'JATUH']}

GOLD_TXT = (250, 196, 70)
TILES4 = [('+', 170, 470, 130, -12, 0.15), ('−', 910, 520, 120, 10, 0.25), ('×', 180, 1560, 130, 8, 0.3), ('÷', 900, 1520, 150, -8, 0.2)]


def mini_hook():
    """Selepas Wira ditelan bola cahaya: "Terjun ke 9 MINI-GAME!" — "9" jatuh tepat pada drop 30 s."""
    w = _line(['Terjun', 'ke'], 110, 700, 29.62, 0.1)
    w.append(dict(text='9', size=380, x=540, y=960, t=29.95, focus=True, spin=-20, **HOT))
    w.append(dict(text='MINI-GAME!', size=140, x=540, y=1200, t=30.15))
    return HookText(29.6, w, twist=(30.3, 30.8), exit_=(31.6, 31.98), center=(540, 950), shake_word=2)


# ---------------------------------------------------------------- babak (latar)
SCENES = [
    dict(t0=0.0, bg='deep'),
    dict(t0=4.0, bg='navy', wipe=0.4, wipe_tile='×', origin=(540, 960), tiles=TILES4),
    dict(t0=6.0, bg='cream', wipe=0.4, wipe_tile='÷', origin=(940, 1600), tiles=[('+', 120, 1760, 110, -10, 0.3), ('×', 980, 640, 90, 12, 0.45)]),
    dict(t0=12.0, bg='deep'),
    dict(t0=16.2, bg='navy', wipe=0.35, wipe_tile='−', origin=(140, 600)),
    dict(t0=26.6, bg='deep'),
    dict(t0=29.6, bg='navy', wipe=0.35, wipe_tile='+', origin=(540, 960)),
    dict(t0=32.0, bg='cream', wipe=0.4, wipe_tile='÷', origin=(940, 1600), tiles=[('+', 120, 1760, 110, -10, 0.3), ('×', 980, 640, 90, 12, 0.45)]),
    dict(t0=40.2, bg='navy', wipe=0.4, wipe_tile='+', origin=(540, 1200)),
    dict(t0=43.0, bg='deep', wipe=0.35, wipe_tile='×', origin=(900, 1500)),
    dict(t0=50.0, bg='gold', wipe=0.45, wipe_tile='×', origin=(540, 1100), tiles=[('÷', 120, 1780, 110, -10, 0.5), ('+', 980, 1760, 100, 10, 0.6)]),
    dict(t0=52.4, bg='navy', wipe=0.45, wipe_tile='+', origin=(540, 1500)),
    dict(t0=56.0, bg='gold', wipe=0.45, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.35), ('−', 930, 330, 120, 10, 0.45), ('×', 160, 1700, 130, 8, 0.55), ('÷', 920, 1680, 150, -8, 0.5)]),
]

# ---------------------------------------------------------------- telefon
SHOTS = [
    # 0 s: JURUS PENAMAT terus (tajuk → serangan kilat → KUKUPAT DITEMUI)
    Shot(0.0, 4.0, 'C', [(12.68, 16.3, 3.62), (16.3, 16.3, 0.38)], 'jurus-penamat'),
    # game ni bijak
    Shot(6.0, 8.6, 'A', [(0.3, 0.3, 0.2), (0.3, 3.1, 2.4)], 'kembara-dimensi'),
    Shot(8.6, 12.0, 'F', [(0.8, 1.4, 0.6), (1.4, 1.4, 2.8)], 'kemahiran-fokus'),
    # battle asas: jawab betul → Wira serang → Betul! Kunci retak.
    Shot(16.2, 18.8, 'B', [(16.6, 18.8, 2.2), (18.8, 18.8, 0.4)], 'jawab-serang'),
    # tiga tahap kunci
    Shot(18.8, 21.0, 'O', [(68.8, 70.55, 1.75), (70.55, 70.55, 0.45)], 'kunci-gangsa'),
    Shot(21.0, 23.0, 'C', [(7.3, 8.9, 1.6), (8.9, 8.9, 0.4)], 'kunci-perak'),
    Shot(23.0, 26.0, 'O', [(110.6, 114.3, 2.6), (114.3, 114.3, 0.4)], 'kunci-emas-taip'),
    # pecah Emas = Jurus Penamat (imbas semula sekejap)
    Shot(26.0, 26.62, 'C', [(12.72, 13.32, 0.62)], 'emas-jurus'),
    # 9 mini game: 4 dinamakan, 5 lagi pantas
    Shot(32.0, 33.8, 'G1', [(0.3, 1.2, 0.45), (4.4, 6.9, 1.35)], 'cashier-gerai-wirayung'),
    Shot(33.8, 35.2, 'G3', [(3.0, 4.8, 1.4)], 'bina-bentuk-arkitek-dimensi'),
    Shot(35.2, 36.6, 'G2', [(2.6, 5.4, 1.4)], 'masa-tren-jam'),
    Shot(36.6, 38.0, 'G6', [(4.4, 7.8, 1.4)], 'harta-gudang-harta'),
    Shot(38.0, 38.4, 'G4', [(4.3, 4.9, 0.4)], 'kedai-kek'),
    Shot(38.4, 38.8, 'G5', [(3.7, 4.3, 0.4)], 'bengkel-besi'),
    Shot(38.8, 39.2, 'G7', [(4.8, 5.4, 0.4)], 'dapur-ramuan'),
    Shot(39.2, 39.6, 'G8', [(14.6, 15.2, 0.4)], 'pos-peninjau'),
    Shot(39.6, 40.3, 'G9', [(2.1, 2.9, 0.7)], 'lombong-permata'),
    # progress: teman diselamatkan → Khazanah → evolusi
    Shot(43.0, 44.6, 'C', [(19.35, 20.75, 1.4), (20.75, 20.75, 0.2)], 'berjaya-teman-selamat'),
    Shot(44.6, 46.0, 'K', [(1.6, 3.6, 1.4)], 'khazanah-teman'),
    Shot(46.0, 50.0, 'K', [(12.1, 17.6, 4.0)], 'evolusi-bara'),
    # mak ayah
    Shot(52.4, 54.6, 'P', [(5.3, 5.6, 0.3), (5.6, 5.6, 1.9)], 'laporan-kemahiran'),
]

CAMERA = [
    # Jurus Penamat: telefon zoom ke arena dari bingkai pertama
    (0.0, Z(0.5, 0.19, 2.1, oy=1130)),
    (0.45, Z(0.5, 0.19, 1.7, oy=1130), 'out'),
    (3.45, Z(0.5, 0.21, 1.8, oy=1130)),
    (3.95, GONE, 'in'),
    # bijak: Kembara Dimensi (krim)
    (6.0, R(s=0.85, oy=1420, ry=30, rz=6, rx=12, a=0.0)),
    (6.5, R(s=0.98, ox=610, oy=1240, ry=14, rz=2, rx=3), 'out'),
    (8.4, R(s=0.98, ox=600, oy=1240, ry=10, rz=1.5, rx=2)),
    (8.85, R(s=1.0, oy=1260, ry=-8, rz=-1.5, rx=3), 'out'),
    (11.5, R(s=1.02, oy=1250, ry=6, rz=1, rx=2)),
    (11.95, GONE, 'in'),
    # battle asas (telefon tersembunyi semasa sinematik portal)
    (16.2, R(s=0.85, oy=1420, ry=-30, rz=-6, rx=12, a=0.0)),
    (16.65, R(s=1.2, oy=1230, ry=-7, rz=-1.2, rx=2), 'out'),
    (18.6, R(s=1.2, oy=1230, ry=-4, rz=-0.8, rx=2)),
    # Gangsa: zoom ke segel (2 pip) → mesej pecah
    (19.1, R(s=1.0, oy=1260, ry=8, rz=1)),
    (19.5, Z(0.64, 0.2, 1.8, oy=1220)),
    (20.1, Z(0.64, 0.2, 1.8, oy=1220)),
    (20.5, Z(0.5, 0.6, 1.3, oy=1200)),
    # Perak
    (21.4, Z(0.55, 0.22, 1.7, oy=1220)),
    (21.75, Z(0.55, 0.22, 1.7, oy=1220)),
    (22.1, Z(0.5, 0.6, 1.3, oy=1200)),
    # Emas: taip jawapan sendiri → serangan
    (23.0, Z(0.5, 0.6, 1.3, oy=1200)),
    (23.5, Z(0.5, 0.42, 1.55, oy=1200)),
    (24.95, Z(0.5, 0.43, 1.6, oy=1200)),
    (25.4, R(s=1.04, oy=1230)),
    (25.98, R(s=1.04, oy=1230)),
    # potong terus ke tajuk Jurus Penamat
    (26.0, Z(0.5, 0.19, 1.95, oy=1130)),
    (26.58, Z(0.5, 0.19, 1.8, oy=1130)),
    (26.62, Z(0.5, 0.19, 1.8, oy=1130, a=0.0)),
    # 9 mini game
    (32.0, R(s=0.9, oy=1400, ry=-25, rz=-4, rx=10, a=0.0)),
    (32.4, R(s=1.3, oy=1270, ry=-6, rz=-1, rx=2), 'out'),
    *whip(33.8, 1), *whip(35.2, -1), *whip(36.6, 1),
    (37.85, R(s=1.36, oy=1265, ry=3)),
    (38.15, R(s=1.42, oy=1260, ry=0, rz=0, rx=0), 'out'),
    (39.95, R(s=1.5, oy=1250)),
    (40.3, GONE, 'in'),
    # progress
    (43.0, R(s=0.85, oy=1420, ry=30, rz=6, rx=12, a=0.0)),
    (43.45, R(s=1.0, oy=1230, ry=8, rz=1, rx=2), 'out'),
    (44.45, R(s=1.04, oy=1225, ry=5, rz=1, rx=2)),
    (44.75, R(s=0.95, oy=1240, ry=-14, rz=-2, rx=3)),
    (45.85, R(s=0.95, oy=1240, ry=-12, rz=-2, rx=3)),
    (46.3, R(s=1.0, oy=1220, ry=6, rz=1, rx=2), 'out'),
    (47.95, R(s=1.32, v=0.42, oy=1150, ry=0, rz=0, rx=0)),
    (49.5, R(s=1.34, v=0.42, oy=1150)),
    (49.95, R(s=1.15, v=0.42, oy=1150, a=0.0), 'in'),
    # mak ayah
    (52.4, R(s=0.85, oy=1420, ry=-30, rz=-6, rx=12, a=0.0)),
    (52.85, R(s=1.0, ox=520, oy=1230, ry=8, rz=1.5, rx=2), 'out'),
    (54.1, R(s=1.0, ox=520, oy=1230, ry=6, rz=1, rx=2)),
    (54.7, R(s=0.6, oy=1520, rx=28, a=0.0), 'in'),
    (60.0, R(s=0.6, oy=1520, rx=28, a=0.0)),
]

HIGHLIGHTS = [
    (9.4, 10.25, 0.2, 0.352, 0.5, 0.392),       # Ketepatan 20%
    (9.9, 10.75, 0.2, 0.508, 0.5, 0.548),       # Ketepatan 28%
    (10.4, 11.25, 0.2, 0.665, 0.5, 0.705),      # Ketepatan 31%
    (18.2, 18.8, 0.04, 0.885, 0.4, 0.92),       # Betul! Kunci retak.
    (19.6, 20.1, 0.63, 0.125, 0.83, 0.175),     # 2 pip segel Gangsa
    (20.45, 21.0, 0.04, 0.878, 0.45, 0.93),     # Kunci GANGSA pecah!
    (21.85, 22.95, 0.05, 0.785, 0.42, 0.82),    # Kunci PERAK pecah! → lencana KUNCI EMAS (baris yang sama)
    (24.0, 24.9, 0.06, 0.555, 0.70, 0.635),     # ruang taip jawapan Emas
    (44.8, 45.9, 0.72, 0.205, 0.975, 0.235),    # 3/6 diselamatkan
]

PHONES = [dict(shots=SHOTS, camera=CAMERA, highlights=HIGHLIGHTS)]

# ---------------------------------------------------------------- teks
TEXTS = [
    dict(t0=0.35, t1=3.9, kicker='PAHLAWAN ANGKA', head='Setiap jawapan betul jadi serangan!'),
    dict(t0=4.3, t1=5.9, kicker='MATEMATIK KSSR · DARJAH 1–6', head='Dalam Bahasa Melayu', align='center', y=1290, small=True),
    dict(t0=6.15, t1=8.5, kicker='GAME NI BIJAK', head='Dia tahu anak perlu improve kat mana.',
         sub='Cikgu Dimensi pilih latihan ikut tahap anak.', small=True),
    dict(t0=8.75, t1=11.95, kicker='KEMAHIRAN FOKUS', head='Selalu tersangkut? Dia kesan sendiri.',
         sub='Latihan terus ke topik yang belum kukuh.', small=True),
    dict(t0=12.25, t1=16.0, kicker='KEMBARA DIMENSI', head='Masuk portal…'),
    dict(t0=16.35, t1=18.65, kicker='BATTLE', head='Jawab betul, Wira serang!'),
    dict(t0=18.85, t1=26.5, kicker='TIGA TAHAP KUNCI', head='', align='center'),
    dict(t0=23.1, t1=25.35, head='Kunci Emas: taip jawapan sendiri', align='center', y=410, small=True),
    dict(t0=25.45, t1=26.55, head='Pecah Emas = JURUS PENAMAT!', align='center', y=410, small=True),
    dict(t0=26.75, t1=29.35, kicker='NAK LEBIH FUN?', head='Jatuh ke dunia baharu…'),
    dict(t0=32.1, t1=40.1, kicker='MINI-GAME KEMAHIRAN FOKUS', head='Setiap topik, dunia sendiri.'),
    dict(t0=40.35, t1=42.9, kicker='9 MINI-GAME · 9 TOPIK', head='Takdelah rasa setiap topik sama je!'),
    dict(t0=43.15, t1=44.5, kicker='PROGRESS', head='Selamatkan teman…'),
    dict(t0=44.7, t1=45.9, kicker='KHAZANAH', head='…kumpul enam teman…'),
    dict(t0=46.15, t1=49.9, kicker='EVOLUSI TEMAN', head='…dan teman berevolusi!', sub='Setiap misi, teman aktif makin kuat.'),
    dict(t0=50.1, t1=52.3, kicker='KHAZANAH · TROFI', head='Trofi untuk setiap pencapaian.'),
    dict(t0=52.55, t1=55.9, kicker='UNTUK MAK AYAH', head='Laporan kemahiran + worksheet PDF.', small=True),
]

SPECIALS = [
    # sinematik portal sebelum battle (seperti dalam app)
    FullClip('src_ENTER.mp4', 12.0, 16.2, [(0.0, 4.3, 4.2)], zoom=(1.0, 1.06), scrim=0.7, fade=(0.15, 0.0)),
    # Wira jatuh ke pusaran Matematik → ditelan bola cahaya → "Terjun ke 9 MINI-GAME!"
    FullClip('src_JATUH.mp4', 26.6, 29.7, [(0.0, 3.1, 3.1)], zoom=(1.0, 1.08), scrim=0.6, fade=(0.1, 0.0)),
    mini_hook(),
    LogoReveal(4.05, 5.95, y=830, scale=0.92, dark_text=False),
    # bijak
    lambda r: Callout(r, 0, 7.0, 8.5, (0.03, 0.475, 0.97, 0.632), 500, 1020, 880, ry=-6, rz=-1),
    lambda r: Callout(r, 0, 11.2, 11.95, (0.08, 0.29, 0.92, 0.418), 540, 1010, 900, ry=-6, rz=-1),
    # tiga tahap kunci
    TierPills(18.85, 26.5, 300, [('Gangsa', GANGSA, 20.45), ('Perak', PERAK, 21.8), ('Emas', EMAS, 22.3)]),
    # mini game: label aksi
    Chip('Jadi cashier', 32.15, 33.75, 540, 505),
    Chip('Bina bentuk', 33.9, 35.15, 540, 505),
    Chip('Main dengan masa', 35.3, 36.55, 540, 505),
    Chip('Cari harta', 36.7, 37.95, 540, 505),
    Chip('+ 5 dunia lagi!', 38.1, 40.1, 540, 505),
    VideoGrid(40.2, 42.95, GRID, y0=640, labels=GRID_LABELS),
    CardGrid(50.05, 52.5, TROFI, y0=800),
    # mak ayah
    lambda r: Callout(r, 0, 53.0, 54.3, (0.04, 0.59, 0.96, 0.715), 540, 1060, 900, ry=6),
    PdfPages(54.3, 56.0, [PDF_A, PDF_B], [
        [(54.3, R(s=0.12, oy=1350, rz=-30, a=0.0)), (54.42, R(s=0.2, oy=1330, rz=-26, a=1.0)),
         (55.05, R(s=1.3, ox=420, oy=1150, rz=-7, ry=12, rx=6), 'back'), (55.6, R(s=1.33, ox=412, oy=1135, rz=-6, ry=10, rx=5)),
         (55.98, R(s=1.45, ox=390, oy=1110, rz=-6, ry=10, rx=5, a=0.0))],
        [(54.45, R(s=0.12, oy=1350, rz=20, a=0.0)), (54.57, R(s=0.2, oy=1330, rz=16, a=1.0)),
         (55.2, R(s=1.15, ox=690, oy=1340, rz=6, ry=-14, rx=6), 'back'), (55.6, R(s=1.18, ox=698, oy=1332, rz=5, ry=-12, rx=5)),
         (55.98, R(s=1.3, ox=720, oy=1320, rz=5, ry=-12, rx=5, a=0.0))],
    ]),
    EndScene(56.0, 60.6, lines=[('Jom selamatkan', 66, WHITE), ('semua teman', 66, GOLD_TXT),
                                ('sambil belajar!', 50, WHITE)], box_h=560),
]

FLASHES = [(1.0, 0.25, 0.3), (4.0, 0.35, 0.5), (16.2, 0.35, 0.55), (20.45, 0.25, 0.25), (21.8, 0.25, 0.25),
           (26.0, 0.35, 0.6), (29.45, 0.3, 0.7), (30.0, 0.3, 0.35), (32.0, 0.3, 0.4), (40.2, 0.3, 0.35), (48.0, 0.45, 0.6)]

# ---------------------------------------------------------------- audio
MUSIC = [('drop', 0, 2), ('groove', 2, 1), ('light', 3, 3), ('build', 6, 2), ('drop', 8, 5), ('break', 13, 1),
         ('build', 14, 1), ('drop', 15, 6), ('groove', 21, 3), ('drop', 24, 2), ('light', 26, 2), ('outro', 28, 2)]

SFX = [
    # Jurus Penamat (bunyi asal)
    ('src', 0.0, 'C', 12.68, 16.3, 0.85), ('whoosh', 3.6, 0.6, 0.8), ('pop', 4.3, 0.6),
    # bijak
    ('whoosh', 5.85, 0.6, 0.7), ('pop', 7.05, 0.55), ('whoosh', 8.5, 0.4, 0.4),
    ('pop', 9.45, 0.45), ('pop', 9.95, 0.45), ('pop', 10.45, 0.45), ('pop', 11.25, 0.6),
    # portal
    ('whoosh', 11.8, 0.6, 0.7), ('src', 12.0, 'ENTER', 0.0, 4.2, 0.7),
    # battle asas + tiga tahap kunci
    ('whoosh', 16.0, 0.5, 0.7), ('src', 16.9, 'B', 17.3, 18.8, 0.7),
    ('src', 19.2, 'O', 69.2, 70.95, 0.8), ('src', 21.2, 'C', 7.5, 8.9, 0.8),
    ('src', 24.4, 'O', 112.8, 114.3, 0.8), ('src', 26.0, 'C', 12.72, 13.32, 0.85),
    # jatuh → 9 mini game
    ('src', 26.6, 'JATUH', 0.0, 3.1, 0.7),
    ('pop', 29.62, 0.4), ('pop', 29.72, 0.4), ('thud', 29.95, 0.9), ('impact', 29.98, 0.5), ('pop', 30.15, 0.5),
    ('boing', 30.3, 0.6, 0.7), ('whoosh', 31.55, 0.45, 0.85, 6000, 400),
    ('pop', 32.2, 0.5), ('shimmer', 33.4, 0.35), ('whoosh', 33.7, 0.35, 0.5), ('pop', 33.95, 0.45), ('shimmer', 34.8, 0.35),
    ('whoosh', 35.1, 0.35, 0.5), ('pop', 35.35, 0.45), ('shimmer', 36.2, 0.35), ('whoosh', 36.5, 0.35, 0.5),
    ('pop', 36.75, 0.45), ('shimmer', 37.6, 0.35), ('whoosh', 37.9, 0.35, 0.5), ('pop', 38.15, 0.45),
    *[('whoosh', 38.4 + 0.4 * i, 0.22, 0.25, 3000, 800) for i in range(4)],
    ('whoosh', 40.1, 0.5, 0.6), *[('pop', 40.25 + 0.07 * i, 0.28) for i in range(9)],
    # progress
    ('whoosh', 42.9, 0.6, 0.7), ('src', 43.1, 'C', 19.45, 20.75, 0.6), ('pop', 44.85, 0.5),
    ('whoosh', 45.9, 0.5, 0.6), ('src', 47.95, 'K', 14.95, 17.0, 0.4), ('impact', 48.0, 0.45), ('shimmer', 48.05, 0.7),
    ('whoosh', 49.7, 0.6, 0.7), ('pop', 50.25, 0.4), ('pop', 50.5, 0.4), ('pop', 50.75, 0.4),
    # mak ayah
    ('whoosh', 52.2, 0.6, 0.7), ('pop', 53.05, 0.55), ('whoosh', 54.2, 0.6, 0.6), ('whoosh', 55.85, 0.6, 0.7),
    *end_sfx(56.0),
]
