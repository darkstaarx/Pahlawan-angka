"""Promo #5 Versi B "Dua-dua" — 62 saat, 9:16, 120 BPM (1 bar = 2 s).

Hook: "Ibu bapa nak result… Tapi anak nak main? Pahlawan Angka tolong dua-dua!"
Video disusun selang-seli dua sisi, dengan dua telefon sebelah-menyebelah (MAK AYAH: RESULT | ANAK: MAIN)
di awal dan akhir:
  anak main (battle → Jurus Penamat → selamatkan pet) → mak ayah nampak result (Ringkasan, Laporan) →
  Kemahiran Fokus kesan bahagian belum faham → anak latih dengan 9 mini-game (dunia sendiri, takdelah sama) →
  mak ayah kongsi result (Muat turun PDF / Kongsi kad kemajuan) → worksheet PDF + skema → rumusan dua-dua → Wira.

Sumber & julat dielak sama seperti timeline_az.py (lihat AZ.md). R = laporan ibu bapa (Screen_Recording_20261011_170834).
"""
import os
from engine import Shot, Callout, HookText, EndScene, PdfPages, FullClip, Chip, VideoGrid, BUILD
from timeline_main import R, Z, end_sfx
from timeline_az import _line, whip, HOT, WHITE, GRID, GRID_LABELS, PDF_A, PDF_B, GONE

DURATION = 62.0

SOURCES = {k: f'src_{k}.mp4' for k in ['C', 'F', 'O', 'P', 'R'] + [f'G{i}' for i in range(1, 10)]}
SOURCES_AUDIO = {'C': 'aud_C.wav'}

GOLD = (250, 196, 70)
HIDE = R(s=0.85, oy=1420, ry=-30, rz=-6, rx=12, a=0.0)
HIDE_L = R(s=0.6, ox=-200, oy=1300, ry=40, rz=6, rx=8, a=0.0)
HIDE_R = R(s=0.6, ox=1280, oy=1300, ry=-40, rz=-6, rx=8, a=0.0)
DROP = R(s=0.6, oy=1520, rx=28, a=0.0)
LEFT = R(s=0.74, ox=292, oy=1180, ry=12, rz=2, rx=3)
RIGHT = R(s=0.74, ox=788, oy=1180, ry=-12, rz=-2, rx=3)


# ---------------------------------------------------------------- tipografi kinetik
def hooks():
    # "Ibu bapa nak result…"
    w1 = _line(['Ibu', 'bapa', 'nak'], 110, 720, 0.05, 0.12)
    w1.append(dict(text='result…', size=200, x=540, y=950, t=0.5, focus=True, spin=12, **HOT))
    h1 = HookText(0.0, w1, twist=(0.8, 1.45), exit_=(1.6, 1.95), center=(540, 880), shake_word=3)
    # "Tapi anak nak main?"
    w2 = _line(['Tapi', 'anak', 'nak'], 110, 720, 2.05, 0.12)
    w2.append(dict(text='main?', size=240, x=540, y=960, t=2.45, focus=True, spin=-14, **HOT))
    h2 = HookText(2.0, w2, twist=(2.7, 3.4), exit_=(3.6, 3.95), center=(540, 880), shake_word=3)
    # "Pahlawan Angka tolong dua-dua!"
    w3 = _line(['Pahlawan', 'Angka'], 110, 700, 4.05, 0.12)
    w3.append(dict(text='tolong', size=120, x=540, y=870, t=4.4))
    w3.append(dict(text='dua-dua!', size=190, x=540, y=1070, t=4.65, focus=True, spin=14, **HOT))
    h3 = HookText(4.0, w3, twist=(4.9, 5.5), exit_=(5.6, 5.95), center=(540, 900), shake_word=3)
    # jambatan Fokus → mini game: "…anak latih dengan 9 MINI-GAME!"
    w4 = _line(['…anak', 'latih', 'dengan'], 100, 650, 25.65, 0.1)
    w4.append(dict(text='9', size=360, x=540, y=900, t=26.1, focus=True, spin=-20, **HOT))
    w4.append(dict(text='MINI-GAME!', size=130, x=540, y=1130, t=26.35))
    h4 = HookText(25.6, w4, twist=(26.4, 26.9), exit_=(27.55, 27.95), center=(540, 900), shake_word=3)
    return [h1, h2, h3, h4]


# ---------------------------------------------------------------- babak (latar)
SCENES = [
    dict(t0=0.0, bg='deep'),
    dict(t0=6.0, bg='navy', wipe=0.4, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 120, 1760, 120, -12, 0.15), ('−', 960, 1780, 110, 10, 0.25), ('×', 540, 1830, 120, 8, 0.3)]),
    dict(t0=9.6, bg='deep', wipe=0.35, wipe_tile='+', origin=(540, 1300)),
    dict(t0=16.0, bg='cream', wipe=0.45, wipe_tile='÷', origin=(100, 1800), tiles=[('−', 990, 1800, 100, 8, 0.4)]),
    dict(t0=25.6, bg='navy', wipe=0.4, wipe_tile='×', origin=(540, 960)),
    dict(t0=27.9, bg='cream', wipe=0.4, wipe_tile='÷', origin=(940, 1600), tiles=[('+', 120, 1760, 110, -10, 0.3), ('×', 980, 640, 90, 12, 0.45)]),
    dict(t0=37.6, bg='navy', wipe=0.4, wipe_tile='+', origin=(540, 1200)),
    dict(t0=40.3, bg='cream', wipe=0.4, wipe_tile='−', origin=(140, 600), tiles=[('+', 110, 1820, 100, -10, 0.3), ('÷', 990, 1800, 95, 12, 0.4)]),
    dict(t0=46.5, bg='navy', wipe=0.45, wipe_tile='+', origin=(540, 1500)),
    dict(t0=51.9, bg='deep', wipe=0.35, wipe_tile='×', origin=(540, 960)),
    dict(t0=56.0, bg='gold', wipe=0.45, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.35), ('−', 930, 330, 120, 10, 0.45), ('×', 160, 1700, 130, 8, 0.55), ('÷', 920, 1680, 150, -8, 0.5)]),
]

# ---------------------------------------------------------------- telefon 0 (utama / kiri)
SHOTS0 = [
    Shot(5.9, 9.6, 'P', [(5.3, 5.6, 0.4), (5.6, 5.6, 3.3)], 'dua-dua-result'),
    # ANAK: battle — jawab soalan → Jurus Penamat → KUKUPAT DITEMUI
    Shot(9.6, 16.0, 'C', [(10.3, 10.5, 0.6), (10.5, 16.3, 5.8)], 'anak-battle'),
    # MAK AYAH: result
    Shot(16.0, 18.6, 'P', [(1.6, 2.5, 0.9), (2.5, 2.5, 1.7)], 'ringkasan-anak'),
    Shot(18.6, 22.0, 'P', [(5.3, 5.6, 0.3), (5.6, 5.6, 3.1)], 'laporan-kemahiran'),
    # Kemahiran Fokus
    Shot(22.0, 25.6, 'F', [(0.8, 1.4, 0.6), (1.4, 1.4, 3.0)], 'kemahiran-fokus'),
    # ANAK: 9 mini game
    Shot(28.0, 30.2, 'G1', [(0.3, 0.3, 0.2), (0.3, 1.2, 0.5), (4.2, 6.9, 1.5)], 'cashier'),
    Shot(30.2, 31.8, 'G3', [(3.0, 4.8, 1.6)], 'bina-bentuk'),
    Shot(31.8, 33.4, 'G2', [(2.6, 5.4, 1.6)], 'masa'),
    Shot(33.4, 35.0, 'G6', [(4.4, 7.8, 1.6)], 'harta'),
    Shot(35.0, 35.44, 'G4', [(4.3, 4.9, 0.44)], 'kek'),
    Shot(35.44, 35.88, 'G5', [(3.7, 4.3, 0.44)], 'bengkel'),
    Shot(35.88, 36.32, 'G7', [(4.8, 5.4, 0.44)], 'ramuan'),
    Shot(36.32, 36.76, 'G8', [(14.6, 15.2, 0.44)], 'pos'),
    Shot(36.76, 37.6, 'G9', [(2.1, 3.0, 0.84)], 'lombong'),
    # MAK AYAH: result senang dikongsi (Muat turun PDF / Kongsi kad kemajuan)
    Shot(40.3, 46.5, 'R', [(4.3, 4.8, 0.9), (4.8, 4.8, 5.3)], 'kongsi-result'),
    # MAK AYAH: worksheet PDF + skema
    Shot(46.5, 48.8, 'P', [(20.9, 22.05, 1.15), (22.05, 22.05, 1.15)], 'latihan-skema'),
    # rumusan dua-dua (kiri: result)
    Shot(51.9, 56.0, 'P', [(5.6, 5.6, 4.1)], 'rumusan-result'),
]

CAMERA0 = [
    (0.0, HIDE_L),
    (5.9, HIDE_L),
    (6.45, LEFT, 'out'),
    (9.2, R(s=0.76, ox=290, oy=1175, ry=10, rz=1.5, rx=2)),
    (9.6, R(s=0.7, ox=290, oy=1300, a=0.0), 'in'),
    (9.7, R(s=0.85, oy=1420, ry=30, rz=6, rx=12, a=0.0)),
    (10.2, R(s=1.0, oy=1220, ry=8, rz=1.5, rx=3), 'out'),
    (11.4, R(s=1.0, oy=1220, ry=4, rz=1, rx=2)),
    (11.9, Z(0.5, 0.19, 1.75, oy=1130), 'out'),
    (15.6, Z(0.5, 0.21, 1.85, oy=1130)),
    (15.95, GONE, 'in'),
    (16.0, HIDE),
    (16.45, R(s=1.0, ox=560, oy=1230, ry=-8, rz=-1.5, rx=3), 'out'),
    (18.4, R(s=1.0, ox=560, oy=1230, ry=-6, rz=-1, rx=2)),
    (18.85, R(s=1.0, ox=520, oy=1230, ry=8, rz=1.5, rx=2)),
    (21.8, R(s=1.0, ox=520, oy=1230, ry=6, rz=1, rx=2)),
    (22.25, R(s=1.0, oy=1260, ry=-8, rz=-1.5, rx=3), 'out'),
    (25.1, R(s=1.02, oy=1250, ry=6, rz=1, rx=2)),
    (25.55, GONE, 'in'),
    (27.8, R(s=0.9, oy=1400, ry=-25, rz=-4, rx=10, a=0.0)),
    (28.2, R(s=1.3, oy=1270, ry=-6, rz=-1, rx=2), 'out'),
    *whip(30.2, 1), *whip(31.8, -1), *whip(33.4, 1),
    (34.85, R(s=1.36, oy=1265, ry=3)),
    (35.15, R(s=1.42, oy=1260, ry=0, rz=0, rx=0), 'out'),
    (37.25, R(s=1.5, oy=1250)),
    (37.6, GONE, 'in'),
    (40.3, R(s=0.85, oy=1420, ry=30, rz=6, rx=12, a=0.0)),
    (40.8, R(s=1.0, oy=1240, ry=6, rz=1, rx=2), 'out'),
    (41.5, R(s=1.0, oy=1240, ry=4, rz=1, rx=2)),
    (42.0, Z(0.5, 0.6, 1.45, oy=1150)),
    (45.9, Z(0.5, 0.6, 1.5, oy=1150)),
    (46.45, R(s=1.0, ox=560, oy=1230, ry=-6, rz=-1, rx=2)),
    (47.2, R(s=1.05, ox=540, oy=1180, ry=0, rz=0, rx=0)),
    (48.0, R(s=1.05, ox=540, oy=1180)),
    (48.7, DROP, 'in'),
    (51.9, HIDE_L),
    (52.45, LEFT, 'out'),
    (55.6, R(s=0.76, ox=290, oy=1175, ry=10, rz=1.5, rx=2)),
    (56.0, DROP, 'in'),
    (62.0, DROP),
]

HIGHLIGHTS0 = [
    (22.8, 23.65, 0.2, 0.352, 0.5, 0.392),      # Ketepatan 20%
    (23.3, 24.15, 0.2, 0.508, 0.5, 0.548),      # Ketepatan 28%
    (23.8, 24.65, 0.2, 0.665, 0.5, 0.705),      # Ketepatan 31%
    (41.7, 43.0, 0.07, 0.533, 0.93, 0.58),      # Muat turun PDF
    (43.0, 45.9, 0.07, 0.597, 0.93, 0.643),     # Kongsi kad kemajuan
    (46.8, 47.6, 0.05, 0.805, 0.95, 0.868),     # Latihan + skema
]

# ---------------------------------------------------------------- telefon 1 (kanan, hanya babak dua-dua)
SHOTS1 = [
    Shot(5.9, 9.6, 'O', [(61.6, 63.9, 2.3), (63.9, 63.9, 1.4)], 'dua-dua-main'),
    Shot(51.9, 56.0, 'G4', [(3.6, 5.0, 1.4), (5.0, 5.0, 2.7)], 'rumusan-main'),
]
CAMERA1 = [
    (0.0, HIDE_R),
    (5.95, HIDE_R),
    (6.55, RIGHT, 'out'),
    (9.2, R(s=0.76, ox=790, oy=1175, ry=-10, rz=-1.5, rx=2)),
    (9.6, R(s=0.7, ox=790, oy=1300, a=0.0), 'in'),
    (51.95, HIDE_R),
    (52.55, RIGHT, 'out'),
    (55.6, R(s=0.76, ox=790, oy=1175, ry=-10, rz=-1.5, rx=2)),
    (56.0, DROP, 'in'),
    (62.0, DROP),
]

PHONES = [dict(shots=SHOTS0, camera=CAMERA0, highlights=HIGHLIGHTS0),
          dict(shots=SHOTS1, camera=CAMERA1, highlights=[])]

# ---------------------------------------------------------------- teks
TEXTS = [
    dict(t0=6.1, t1=9.5, kicker='PAHLAWAN ANGKA', head='Satu app, dua-dua happy.'),
    dict(t0=9.8, t1=11.35, kicker='UNTUK ANAK', head='Main jadi hero…'),
    dict(t0=11.45, t1=14.4, head='…jawab soalan, guna kuasa!'),
    dict(t0=14.5, t1=15.9, head='Selamatkan pet!'),
    dict(t0=16.1, t1=21.9, kicker='UNTUK MAK AYAH', head='Nampak result sebenar.', sub='Kekuatan anak & fokus seterusnya.'),
    dict(t0=22.15, t1=25.5, kicker='KEMAHIRAN FOKUS', head='App kesan bahagian yang belum faham…', small=True),
    dict(t0=28.1, t1=37.4, kicker='UNTUK ANAK', head='Setiap topik, dunia sendiri.'),
    dict(t0=37.8, t1=40.4, kicker='9 MINI-GAME · 9 TOPIK', head='Takdelah rasa setiap topik sama je!'),
    dict(t0=40.55, t1=46.3, kicker='UNTUK MAK AYAH', head='Result senang dikongsi.', sub='Muat turun PDF atau kongsi kad kemajuan.'),
    dict(t0=46.6, t1=51.8, kicker='LATIHAN TAMBAHAN', head='Worksheet PDF + skema jawapan.', sub='Sambung latihan atas kertas.'),
    dict(t0=52.1, t1=55.9, head='Anak dapat main. Mak ayah dapat result.'),
]

SPECIALS = [
    # latar hook: laporan kabur ("result…"), arena kabur ("main?")
    FullClip('src_R.mp4', 0.0, 2.0, [(4.3, 5.3, 2.0)], zoom=(1.25, 1.15), dim=0.4, blur=6, fade=(0.0, 0.2), center=(0.5, 0.45)),
    FullClip('src_C.mp4', 2.0, 4.0, [(13.9, 15.1, 2.0)], zoom=(2.35, 2.2), dim=0.42, blur=6, fade=(0.15, 0.2), center=(0.5, 0.19)),
    *hooks(),
    # dua-dua: label setiap telefon
    Chip('MAK AYAH: RESULT', 6.6, 9.4, 292, 520),
    Chip('ANAK: MAIN', 6.8, 9.4, 788, 520),
    lambda r: Callout(r, 0, 16.6, 18.5, (0.025, 0.628, 0.975, 0.885), 540, 1150, 860, ry=-6),
    lambda r: Callout(r, 0, 19.2, 21.9, (0.04, 0.59, 0.96, 0.715), 540, 1060, 900, ry=6),
    lambda r: Callout(r, 0, 24.6, 25.5, (0.08, 0.29, 0.92, 0.418), 540, 1010, 900, ry=-6, rz=-1),
    # mini game
    Chip('Jadi cashier', 28.35, 30.1, 540, 505),
    Chip('Bina bentuk', 30.3, 31.75, 540, 505),
    Chip('Main dengan masa', 31.9, 33.35, 540, 505),
    Chip('Cari harta', 33.5, 34.95, 540, 505),
    Chip('+ 5 dunia lagi!', 35.1, 37.3, 540, 505),
    VideoGrid(37.6, 40.45, GRID, y0=640, labels=GRID_LABELS),
    # result dikongsi
    Chip('Muat turun PDF', 41.7, 42.95, 540, 470),
    Chip('Kongsi kad kemajuan', 43.0, 46.2, 540, 470),
    PdfPages(47.7, 51.9, [PDF_A, PDF_B], [
        [(47.7, R(s=0.12, oy=1350, rz=-30, a=0.0)), (47.85, R(s=0.2, oy=1330, rz=-26, a=1.0)),
         (48.65, R(s=1.3, ox=420, oy=1150, rz=-7, ry=12, rx=6), 'back'), (51.45, R(s=1.34, ox=410, oy=1130, rz=-6, ry=10, rx=5)),
         (51.85, R(s=1.45, ox=390, oy=1110, rz=-6, ry=10, rx=5, a=0.0))],
        [(48.0, R(s=0.12, oy=1350, rz=20, a=0.0)), (48.15, R(s=0.2, oy=1330, rz=16, a=1.0)),
         (48.95, R(s=1.15, ox=690, oy=1340, rz=6, ry=-14, rx=6), 'back'), (51.45, R(s=1.19, ox=700, oy=1330, rz=5, ry=-12, rx=5)),
         (51.85, R(s=1.3, ox=720, oy=1320, rz=5, ry=-12, rx=5, a=0.0))],
    ]),
    # rumusan dua-dua
    Chip('MAK AYAH: RESULT', 52.6, 55.8, 292, 520),
    Chip('ANAK: MAIN', 52.8, 55.8, 788, 520),
    EndScene(56.0, 62.6, lines=[('Anak seronok,', 62, WHITE), ('mak ayah', 62, GOLD), ('nampak result!', 62, WHITE)], box_h=560),
]

FLASHES = [(0.5, 0.15, 0.12), (6.0, 0.35, 0.6), (11.95, 0.3, 0.45), (13.0, 0.25, 0.3), (28.0, 0.35, 0.5),
           (37.6, 0.3, 0.35), (52.0, 0.3, 0.4)]

# ---------------------------------------------------------------- audio
MUSIC = [('intro', 0, 3), ('drop', 3, 2), ('groove', 5, 3), ('light', 8, 5), ('build', 13, 1), ('drop', 14, 3),
         ('groove', 17, 3), ('light', 20, 6), ('groove', 26, 2), ('outro', 28, 3)]

SFX = [
    # hook
    ('pop', 0.05, 0.4), ('pop', 0.17, 0.4), ('pop', 0.29, 0.4), ('thud', 0.5, 0.9), ('boing', 0.8, 0.6, 0.8),
    ('whoosh', 1.55, 0.45, 0.85, 6000, 400),
    ('pop', 2.05, 0.4), ('pop', 2.17, 0.4), ('pop', 2.29, 0.4), ('thud', 2.45, 0.9), ('boing', 2.7, 0.65, 0.8),
    ('whoosh', 3.55, 0.45, 0.85, 6000, 400),
    ('pop', 4.05, 0.4), ('pop', 4.17, 0.4), ('pop', 4.4, 0.45), ('impact', 4.65, 0.5), ('shimmer', 4.7, 0.45),
    ('whoosh', 5.55, 0.45, 0.85, 6000, 400),
    # dua-dua
    ('whoosh', 5.9, 0.5, 0.7), ('pop', 6.6, 0.5), ('pop', 6.8, 0.5),
    # anak: battle
    ('whoosh', 9.55, 0.6, 0.7), ('src', 10.2, 'C', 10.5, 16.3, 0.85),
    # mak ayah: result
    ('whoosh', 15.95, 0.6, 0.7), ('pop', 16.65, 0.55), ('pop', 19.25, 0.55),
    # Fokus → mini game
    ('whoosh', 22.0, 0.4, 0.4), ('pop', 22.85, 0.45), ('pop', 23.35, 0.45), ('pop', 23.85, 0.45), ('pop', 24.65, 0.6),
    ('whoosh', 25.5, 0.5, 0.7), ('pop', 25.65, 0.4), ('pop', 25.75, 0.4), ('pop', 25.85, 0.4), ('impact', 26.1, 0.5),
    ('pop', 26.35, 0.5), ('whoosh', 27.5, 0.45, 0.85, 6000, 400),
    ('pop', 28.4, 0.5), ('shimmer', 29.7, 0.35), ('whoosh', 30.1, 0.35, 0.5), ('pop', 30.35, 0.45), ('shimmer', 31.1, 0.35),
    ('whoosh', 31.7, 0.35, 0.5), ('pop', 31.95, 0.45), ('shimmer', 33.0, 0.35), ('whoosh', 33.3, 0.35, 0.5),
    ('pop', 33.55, 0.45), ('shimmer', 34.65, 0.35), ('whoosh', 34.9, 0.35, 0.5), ('pop', 35.15, 0.45),
    *[('whoosh', 35.4 + 0.44 * i, 0.22, 0.25, 3000, 800) for i in range(4)],
    ('whoosh', 37.5, 0.5, 0.6), *[('pop', 37.65 + 0.07 * i, 0.28) for i in range(9)],
    # mak ayah: kongsi result, worksheet
    ('whoosh', 40.25, 0.6, 0.7), ('pop', 41.75, 0.55), ('pop', 43.05, 0.55), ('shimmer', 43.1, 0.4),
    ('whoosh', 46.45, 0.6, 0.7), ('pop', 46.85, 0.45), ('whoosh', 47.7, 0.7, 0.8), ('whoosh', 48.0, 0.6, 0.6),
    ('whoosh', 51.85, 0.6, 0.7),
    # rumusan
    ('pop', 52.6, 0.5), ('pop', 52.8, 0.5), ('shimmer', 53.0, 0.4),
    *end_sfx(56.0),
]
