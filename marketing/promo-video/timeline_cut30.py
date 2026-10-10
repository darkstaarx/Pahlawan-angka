"""Potongan ringkas 30 saat (9:16) — enjin, footage dan muzik yang sama dengan timeline_main."""
import os
from engine import Shot, REST, CardGrid, TierPills, PdfPages, LogoReveal, Callout, BUILD
from timeline_main import R, Z, SOURCES, SOURCES_AUDIO, GANGSA, PERAK, EMAS, PDF_A, PDF_B

DURATION = 30.0

SCENES = [
    dict(t0=0.0, bg='deep'),
    dict(t0=6.0, bg='navy', wipe=0.4, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 170, 470, 130, -12, 0.1), ('−', 910, 520, 120, 10, 0.2), ('÷', 900, 1520, 150, -8, 0.15)]),
    dict(t0=8.0, bg='cream', wipe=0.4, wipe_tile='÷', origin=(940, 1600)),
    dict(t0=12.0, bg='navy', wipe=0.4, wipe_tile='−', origin=(140, 600)),
    dict(t0=16.0, bg='deep', wipe=0.35, wipe_tile='+', origin=(540, 1150)),
    dict(t0=20.0, bg='cream', wipe=0.4, wipe_tile='÷', origin=(100, 1800)),
    dict(t0=24.6, bg='navy', wipe=0.35, wipe_tile='+', origin=(540, 1500)),
    dict(t0=26.0, bg='gold', wipe=0.4, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.3), ('−', 930, 330, 120, 10, 0.4), ('×', 160, 1700, 130, 8, 0.5), ('÷', 920, 1680, 150, -8, 0.45)]),
]

SHOTS = [
    Shot(0.0, 6.0, 'C', [(11.0, 11.0, 0.6), (11.0, 12.4, 1.4), (12.4, 16.4, 4.0)], 'hook-masalah-jurus-penamat'),
    Shot(8.0, 12.0, 'A', [(0.3, 4.3, 4.0)], 'hub-kembara-dimensi'),
    Shot(12.0, 13.8, 'C', [(7.3, 8.9, 1.6), (8.9, 8.9, 0.2)], 'kunci-perak'),
    Shot(13.8, 16.0, 'O', [(112.3, 114.3, 2.0), (114.3, 114.3, 0.2)], 'kunci-emas-taip'),
    Shot(16.0, 20.0, 'K', [(14.0, 17.6, 3.6), (17.6, 17.6, 0.4)], 'evolusi-bara'),
    Shot(20.0, 22.2, 'P', [(1.6, 2.5, 0.9), (2.5, 2.5, 1.3)], 'ringkasan-anak'),
    Shot(22.2, 24.0, 'P', [(9.3, 9.6, 0.3), (9.6, 9.6, 1.5)], 'had-masa-bermain'),
    Shot(24.0, 25.4, 'P', [(20.9, 22.05, 1.15), (22.05, 22.05, 0.25)], 'latihan-skema'),
]

CAMERA = [
    (0.0, R(s=1.02, oy=1250, ry=-7, rz=-1.5, rx=3)),
    (1.95, R(s=1.1, oy=1235, ry=-3, rz=-0.5, rx=1)),
    (2.15, Z(0.5, 0.19, 1.7, oy=1130), 'out'),
    (5.4, Z(0.5, 0.21, 1.8, oy=1130)),
    (5.95, R(s=1.2, v=0.3, oy=1250, a=0.0), 'in'),
    (7.85, R(s=0.85, oy=1400, ry=30, rz=6, rx=12, a=0.0)),
    (8.35, R(s=0.98, ox=610, oy=1240, ry=14, rz=2, rx=3)),
    (11.7, R(s=0.98, ox=600, oy=1240, ry=10, rz=1.5, rx=2)),
    (12.25, R(s=1.0, oy=1260, ry=8, rz=1)),
    (12.6, Z(0.55, 0.22, 1.7, oy=1220)),
    (13.15, Z(0.55, 0.22, 1.7, oy=1220)),
    (13.65, Z(0.5, 0.6, 1.3, oy=1200)),
    (13.85, Z(0.5, 0.6, 1.3, oy=1200)),
    (14.3, Z(0.5, 0.43, 1.55, oy=1200)),
    (15.2, Z(0.5, 0.43, 1.6, oy=1200)),
    (15.75, R(s=1.04, oy=1230)),
    (16.0, R(s=1.0, oy=1220, ry=6, rz=1, rx=2)),
    (18.2, R(s=1.3, v=0.42, oy=1150)),
    (19.5, R(s=1.32, v=0.42, oy=1150)),
    (20.15, R(s=1.0, ox=560, oy=1230, ry=-8, rz=-1.5, rx=3)),
    (22.0, R(s=1.0, ox=560, oy=1230, ry=-6, rz=-1, rx=2)),
    (22.45, R(s=1.0, ox=520, oy=1240, ry=8, rz=1, rx=2)),
    (23.85, R(s=1.0, ox=520, oy=1240, ry=6)),
    (24.25, R(s=1.05, ox=540, oy=1180, ry=0, rz=0, rx=0)),
    (25.2, R(s=1.05, ox=540, oy=1180)),
    (25.9, R(s=0.6, oy=1520, rx=28, a=0.0), 'in'),
    (30.0, R(s=0.6, oy=1520, rx=28, a=0.0)),
]

HIGHLIGHTS = [
    (13.2, 13.8, 0.05, 0.785, 0.42, 0.82),      # Kunci PERAK pecah!
    (14.6, 15.4, 0.06, 0.555, 0.70, 0.635),     # ruang taip jawapan Emas
    (24.5, 25.3, 0.05, 0.805, 0.95, 0.868),     # Latihan + skema
]

PHONES = [dict(shots=SHOTS, camera=CAMERA, highlights=HIGHLIGHTS, grade=[(0.0, 1.9, 2.05)])]

TEXTS = [
    dict(t0=0.0, t1=1.98, style='slate', size=88, y=210, lines=[
        [('Anak', 0.0, 'fill'), ('liat', 0.12, 'fill'), ('nak', 0.24, 'fill'), ('buat', 0.34, 'fill')],
        [('latihan', 0.5, 'fill'), ('Matematik?', 0.72, 'fill')],
    ]),
    dict(t0=2.1, t1=5.85, kicker='PAHLAWAN ANGKA', head='Setiap jawapan betul jadi serangan!'),
    dict(t0=6.3, t1=7.95, kicker='MATEMATIK KSSR · DARJAH 1–6', head='Dalam Bahasa Melayu', align='center', y=1290, small=True),
    dict(t0=8.15, t1=11.9, kicker='KEMBARA DIMENSI', head='Latihan ikut kemampuan anak',
         sub='Cikgu Dimensi pilih latihan ikut tahap penguasaan.'),
    dict(t0=12.05, t1=15.9, kicker='TIGA TAHAP KUNCI', head='', align='center'),
    dict(t0=13.85, t1=15.9, head='Kunci Emas: taip jawapan sendiri', align='center', y=410, small=True),
    dict(t0=16.1, t1=19.9, kicker='KHAZANAH', head='Kumpul teman & lihat Evolusi Bara'),
    dict(t0=20.1, t1=22.1, kicker='UNTUK IBU BAPA', head='Lihat perkembangan anak'),
    dict(t0=22.3, t1=23.95, kicker='CONTOH TETAPAN IBU BAPA', head='Had masa & kunci'),
    dict(t0=24.1, t1=24.55, kicker='WORKSHEET', head=''),
    dict(t0=24.65, t1=25.95, kicker='WORKSHEET', head='Sambung latihan atas kertas'),
]

SPECIALS = [
    LogoReveal(6.1, 7.95, y=830, scale=0.92, dark_text=False),
    lambda r: Callout(r, 0, 8.7, 11.85, (0.03, 0.475, 0.97, 0.632), 500, 1020, 880, ry=-6, rz=-1),
    TierPills(12.1, 15.9, 300, [('Gangsa', GANGSA, 12.2), ('Perak', PERAK, 13.15), ('Emas', EMAS, 13.6)]),
    lambda r: Callout(r, 0, 20.5, 22.1, (0.025, 0.628, 0.975, 0.885), 540, 1150, 860, ry=-6),
    lambda r: Callout(r, 0, 22.5, 23.95, (0.035, 0.283, 0.975, 0.745), 540, 1140, 760, ry=-5),
    PdfPages(24.6, 26.3, [PDF_A, PDF_B], [
        [(24.6, R(s=0.12, oy=1350, rz=-30, a=0.0)), (24.75, R(s=0.2, oy=1330, rz=-26, a=1.0)),
         (25.4, R(s=1.3, ox=420, oy=1150, rz=-7, ry=12, rx=6), 'back'), (25.95, R(s=1.34, ox=410, oy=1130, rz=-6, ry=10, rx=5)),
         (26.2, R(s=1.45, ox=390, oy=1110, rz=-6, ry=10, rx=5, a=0.0))],
        [(24.75, R(s=0.12, oy=1350, rz=20, a=0.0)), (24.9, R(s=0.2, oy=1330, rz=16, a=1.0)),
         (25.55, R(s=1.15, ox=690, oy=1340, rz=6, ry=-14, rx=6), 'back'), (25.95, R(s=1.19, ox=700, oy=1330, rz=5, ry=-12, rx=5)),
         (26.2, R(s=1.3, ox=720, oy=1320, rz=5, ry=-12, rx=5, a=0.0))],
    ]),
    LogoReveal(26.15, 30.6, y=760, scale=1.0, tag=['Pengembaraan matematik', 'ikut kemampuan anak.'], tag_t=26.8,
               cta='Cuba demo Pahlawan Angka', cta_t=27.6, dark_text=True),
]

FLASHES = [(2.0, 0.35, 0.6), (2.8, 0.25, 0.3), (13.15, 0.25, 0.25), (18.0, 0.45, 0.6)]

MUSIC = [('intro', 0, 1), ('drop', 1, 3), ('groove', 4, 2), ('drop', 6, 2), ('break', 8, 1), ('drop', 9, 1),
         ('light', 10, 2), ('build', 12, 1), ('outro', 13, 2)]

SFX = [
    ('src', 1.5, 'C', 11.9, 16.4, 0.85), ('whoosh', 5.6, 0.6, 0.8), ('pop', 6.3, 0.7),
    ('whoosh', 7.6, 0.6, 0.7), ('pop', 8.75, 0.6),
    ('whoosh', 11.6, 0.6, 0.7), ('src', 12.2, 'C', 7.5, 8.9, 0.8), ('src', 14.3, 'O', 112.8, 114.3, 0.8),
    ('whoosh', 15.65, 0.6, 0.8), ('src', 16.0, 'K', 14.0, 17.6, 0.35), ('impact', 18.0, 0.45), ('shimmer', 18.05, 0.7),
    ('whoosh', 19.6, 0.6, 0.7), ('pop', 20.55, 0.55), ('pop', 22.55, 0.55), ('pop', 24.55, 0.45),
    ('whoosh', 24.6, 0.6, 0.7), ('whoosh', 25.6, 0.7, 0.8),
]
