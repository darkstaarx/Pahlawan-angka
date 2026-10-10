"""Timeline promo sinematik utama — 64 saat, 9:16, 120 BPM (1 bar = 2 s).

Sumber (footage perantaraan dalam $PROMO_BUILD, status bar dibuang, 30 fps):
  A  Screen_Recording_20261010_234227  hub Cica (Kembara Dimensi)
  T  Screen_Recording_20261010_234245  Peta Topik Darjah 1
  K  Screen_Recording_20261010_234314  Khazanah (teman) + Evolusi Bara
  B  Screen_Recording_20261010_234634  Mula Kembara, sinematik menara
  C  Screen_Recording_20261010_234759  Perak, Jurus Penamat, Emas pecah, BERJAYA
  P  Screen_Recording_20261010_234931  Ibu Bapa: Ringkasan, Kemahiran, Had Masa, Latihan
  O  video_2026-10-10_23-20-39 (590p, dinaikkan) — hanya Kunci Gangsa & menaip Kunci Emas
Bahagian yang memaparkan e-mel (B 1.5–3.5 s), PIN (P 0–1.5 s) dan notifikasi muat turun
(P > 22.1 s) tidak digunakan.
"""
import os
from engine import Shot, REST, CardGrid, TierPills, PdfPages, LogoReveal, Callout, BUILD

DURATION = 64.0


def R(**kw):
    d = dict(REST)
    d.update(kw)
    return d


def Z(u, v, s=1.8, oy=1190.0, ox=540.0, **kw):
    d = dict(REST, s=s, u=u, v=v, ox=ox, oy=oy)
    d.update(kw)
    return d


SOURCES = {k: f'src_{k}.mp4' for k in 'ATKBCPO'}
SOURCES_AUDIO = {k: f'aud_{k}.wav' for k in 'BCKO'}

GANGSA, PERAK, EMAS = (205, 127, 50), (196, 204, 218), (245, 190, 60)

# ---------------------------------------------------------------- babak (latar)
SCENES = [
    dict(t0=0.0, bg='cream', tiles=[('+', 150, 360, 150, -14, 0.0), ('÷', 930, 1600, 170, 12, 0.15), ('×', 940, 330, 110, 8, 0.3), ('−', 170, 1560, 120, -6, 0.4)]),
    dict(t0=3.6, bg='navy', wipe=0.45, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 170, 470, 130, -12, 0.15), ('−', 910, 520, 120, 10, 0.25), ('×', 180, 1560, 130, 8, 0.3), ('÷', 900, 1520, 150, -8, 0.2)]),
    dict(t0=6.0, bg='deep', wipe=0.3, wipe_tile='+', origin=(540, 1300)),
    dict(t0=12.0, bg='cream', wipe=0.45, wipe_tile='÷', origin=(940, 1600), tiles=[('+', 120, 1760, 110, -10, 0.3), ('×', 980, 640, 90, 12, 0.45)]),
    dict(t0=22.0, bg='navy', wipe=0.45, wipe_tile='−', origin=(140, 600)),
    dict(t0=36.0, bg='deep', wipe=0.4, wipe_tile='+', origin=(540, 1150)),
    dict(t0=41.6, bg='gold', wipe=0.45, wipe_tile='×', origin=(540, 1100), tiles=[('÷', 120, 1780, 110, -10, 0.5), ('+', 980, 1760, 100, 10, 0.6)]),
    dict(t0=44.6, bg='cream', wipe=0.45, wipe_tile='÷', origin=(100, 1800), tiles=[('−', 990, 1800, 100, 8, 0.4)]),
    dict(t0=56.0, bg='navy', wipe=0.45, wipe_tile='+', origin=(540, 1500)),
    dict(t0=60.0, bg='gold', wipe=0.45, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.35), ('−', 930, 330, 120, 10, 0.45), ('×', 160, 1700, 130, 8, 0.55), ('÷', 920, 1680, 150, -8, 0.5)]),
]

# ---------------------------------------------------------------- telefon
SHOTS = [
    Shot(6.0, 12.0, 'C', [(10.6, 16.6, 6.0)], 'hook-soalan-jurus-penamat'),
    Shot(12.0, 16.0, 'A', [(0.3, 4.3, 4.0)], 'hub-kembara-dimensi'),
    Shot(16.0, 19.0, 'T', [(1.4, 1.7, 0.3), (1.7, 1.7, 1.0), (1.7, 4.6, 1.7)], 'peta-topik'),
    Shot(19.0, 19.7, 'B', [(4.55, 5.25, 0.7)], 'tekan-mula-kembara'),
    Shot(19.7, 20.6, 'B', [(7.2, 8.1, 0.9)], 'menara-dimensi'),
    Shot(20.6, 22.0, 'C', [(19.35, 20.75, 1.4)], 'berjaya-cikgu-dimensi'),
    Shot(22.0, 24.4, 'O', [(68.8, 70.9, 2.1), (70.9, 70.9, 0.3)], 'kunci-gangsa'),
    Shot(24.4, 26.4, 'C', [(7.3, 8.9, 1.6), (8.9, 8.9, 0.4)], 'kunci-perak'),
    Shot(26.4, 32.0, 'O', [(110.4, 114.3, 3.9), (114.3, 114.3, 1.7)], 'kunci-emas-taip'),
    Shot(32.0, 35.0, 'K', [(1.6, 4.6, 3.0)], 'khazanah-teman'),
    Shot(36.0, 41.6, 'K', [(12.0, 17.6, 5.6)], 'evolusi-bara'),
    Shot(44.6, 47.6, 'P', [(1.6, 2.5, 0.9), (2.5, 2.5, 2.1)], 'ringkasan-anak'),
    Shot(47.6, 50.2, 'P', [(5.3, 5.6, 0.3), (5.6, 5.6, 2.3)], 'laporan-kemahiran'),
    Shot(50.2, 54.4, 'P', [(9.3, 9.6, 0.3), (9.6, 9.6, 3.9)], 'had-masa-bermain'),
    Shot(54.4, 56.6, 'P', [(20.9, 22.05, 1.15), (22.05, 22.05, 1.05)], 'latihan-skema'),
]

CAMERA = [
    (0.0, R(s=0.85, oy=1420, ry=-38, rz=-9, rx=14, a=0.0)),
    (6.0, R(s=0.85, oy=1420, ry=-38, rz=-9, rx=14, a=0.0)),
    # hook: telefon masuk dengan sudut dramatik, kemudian push-in ke Jurus Penamat
    (6.6, R(s=1.0, oy=1190, ry=-8, rz=-2, rx=4), 'out'),
    (7.6, R(s=1.0, oy=1190, ry=-5, rz=-1, rx=2)),
    (8.05, Z(0.5, 0.19, 1.7, oy=1130), 'out'),
    (11.3, Z(0.5, 0.21, 1.8, oy=1130)),
    # Kembara Dimensi (latar krim)
    (12.4, R(s=0.98, ox=610, oy=1240, ry=14, rz=2, rx=3)),
    (15.8, R(s=0.98, ox=600, oy=1240, ry=10, rz=1.5, rx=2)),
    (16.35, R(s=1.0, ox=540, oy=1230, ry=-10, rz=-1.5, rx=6)),
    (18.6, R(s=1.04, ox=540, oy=1220, ry=-7, rz=-1, rx=4)),
    (19.05, R(s=1.0, ox=540, oy=1210, ry=4, rz=0, rx=2)),
    (19.75, R(s=1.0, ox=540, oy=1210, ry=2)),
    (20.5, R(s=1.25, v=0.45, oy=1180, ry=0), 'smooth'),
    (20.95, R(s=1.0, ox=540, oy=1230, ry=8, rz=1, rx=2)),
    # tiga tahap kunci
    (22.3, R(s=1.0, oy=1260, ry=8, rz=1)),
    (22.85, Z(0.64, 0.2, 1.8, oy=1220)),
    (23.45, Z(0.64, 0.2, 1.8, oy=1220)),
    (23.9, Z(0.42, 0.86, 1.7, oy=1200)),
    (24.4, Z(0.42, 0.86, 1.7, oy=1200)),
    (24.75, Z(0.55, 0.22, 1.7, oy=1220)),
    (25.25, Z(0.55, 0.22, 1.7, oy=1220)),
    (25.6, Z(0.45, 0.8, 1.6, oy=1200)),
    (27.2, Z(0.45, 0.82, 1.6, oy=1200)),
    (27.6, Z(0.5, 0.42, 1.55, oy=1200)),
    (29.6, Z(0.5, 0.43, 1.6, oy=1200)),
    (30.2, R(s=1.04, oy=1230)),
    (31.7, R(s=1.04, oy=1230, ry=-4)),
    # teman
    (32.4, R(s=0.95, oy=1240, ry=-14, rz=-2, rx=3)),
    (33.4, R(s=0.95, oy=1240, ry=-12, rz=-2, rx=3)),
    (34.0, R(s=0.72, oy=1380, ry=-22, rz=-4, rx=12, a=0.0), 'in'),
    (35.9, R(s=0.8, oy=1320, ry=26, rz=5, rx=10, a=0.0)),
    # evolusi
    (36.5, R(s=1.0, oy=1220, ry=6, rz=1, rx=2), 'out'),
    (39.7, R(s=1.32, v=0.42, oy=1150, ry=0, rz=0, rx=0)),
    (41.1, R(s=1.34, v=0.42, oy=1150)),
    (41.6, R(s=1.15, v=0.42, oy=1150, a=0.0), 'in'),
    (44.3, R(s=0.85, oy=1450, ry=-25, rz=-4, rx=10, a=0.0)),
    # ibu bapa
    (44.95, R(s=1.0, ox=560, oy=1230, ry=-8, rz=-1.5, rx=3), 'out'),
    (47.4, R(s=1.0, ox=560, oy=1230, ry=-6, rz=-1, rx=2)),
    (47.9, R(s=1.0, ox=520, oy=1230, ry=8, rz=1.5, rx=2)),
    (50.0, R(s=1.0, ox=520, oy=1230, ry=6, rz=1, rx=2)),
    (50.5, R(s=1.0, ox=560, oy=1240, ry=-8, rz=-1, rx=3)),
    (54.2, R(s=1.0, ox=560, oy=1240, ry=-6, rz=-1, rx=2)),
    (54.7, R(s=1.05, ox=540, oy=1180, ry=0, rz=0, rx=0)),
    (55.9, R(s=1.05, ox=540, oy=1180)),
    (56.7, R(s=0.6, oy=1520, rx=28, a=0.0), 'in'),
    (64.0, R(s=0.6, oy=1520, rx=28, a=0.0)),
]

HIGHLIGHTS = [
    (19.0, 19.65, 0.32, 0.56, 0.85, 0.615),     # Mula Kembara
    (22.9, 23.45, 0.63, 0.125, 0.83, 0.175),    # 2 pip segel Gangsa
    (23.75, 24.4, 0.04, 0.878, 0.45, 0.93),     # Kunci GANGSA pecah!
    (25.6, 26.3, 0.05, 0.785, 0.42, 0.82),      # Kunci PERAK pecah!
    (28.6, 29.6, 0.06, 0.555, 0.70, 0.635),     # ruang taip jawapan Emas
    (32.4, 33.4, 0.72, 0.205, 0.975, 0.235),    # 3/6 diselamatkan
    (54.85, 55.8, 0.05, 0.805, 0.95, 0.868),    # Latihan + skema
]

PHONES = [dict(shots=SHOTS, camera=CAMERA, highlights=HIGHLIGHTS)]

# ---------------------------------------------------------------- teks
TEXTS = [
    dict(t0=0.2, t1=3.65, style='slate', size=112, y=720, lines=[
        [('Bila', 0.25, 'fill'), ('matematik', 0.5, 'fill')],
        [('jadi', 1.2, 'fill')],
        [('pengembaraan…', 1.45, 'outline')],
    ]),
    dict(t0=4.1, t1=5.95, kicker='MATEMATIK KSSR · DARJAH 1–6', head='Dalam Bahasa Melayu', align='center', y=1290, small=True),
    dict(t0=6.15, t1=11.8, kicker='JAWAB SOALAN', head='Jawapan betul, wira beraksi!'),
    dict(t0=12.15, t1=15.9, kicker='KEMBARA DIMENSI', head='Latihan ikut kemampuan anak',
         sub='Cikgu Dimensi pilih latihan ikut tahap penguasaan.'),
    dict(t0=16.1, t1=18.95, kicker='PETA TOPIK', head='Penguasaan setiap topik dipantau'),
    dict(t0=19.1, t1=21.95, kicker='CIKGU DIMENSI', head='Pilih misi & beri semangat'),
    dict(t0=22.05, t1=31.9, kicker='TIGA TAHAP KUNCI', head='', align='center'),
    dict(t0=26.45, t1=31.9, head='Kunci Emas: taip jawapan sendiri', align='center', y=410, small=True),
    dict(t0=32.1, t1=35.9, kicker='KHAZANAH', head='Enam teman untuk dikumpul'),
    dict(t0=36.15, t1=41.45, kicker='EVOLUSI TEMAN', head='Teman berkembang bersamamu'),
    dict(t0=41.7, t1=44.5, kicker='KHAZANAH · TROFI', head='Trofi untuk setiap pencapaian'),
    dict(t0=44.75, t1=47.5, kicker='UNTUK IBU BAPA', head='Lihat perkembangan anak'),
    dict(t0=47.7, t1=50.1, kicker='LAPORAN KEMAHIRAN', head='Kekuatan & fokus seterusnya'),
    dict(t0=50.3, t1=54.3, kicker='CONTOH TETAPAN IBU BAPA', head='Ibu bapa tentukan masa bermain',
         sub='Had sesi, had harian, rehat & kunci.'),
    dict(t0=54.5, t1=55.95, kicker='WORKSHEET', head='Muat turun latihan bercetak'),
    dict(t0=56.1, t1=59.9, kicker='WORKSHEET PDF', head='Sambung latihan atas kertas', sub='Lengkap dengan skema jawapan.'),
]

TEMAN = [
    ('Aurora', 'Musang Ekor Angka', 'assets/pets/aurora/front.webp'),
    ('Kukupat', 'Kura-Kura Ketupat', 'assets/pets/collection/ketupat-kura/idle.png'),
    ('Kumbis', 'Kumbang Manggis', 'assets/pets/collection/kumbang-manggis/idle.png'),
    ('Riya', 'Harimau Bunga', 'assets/pets/collection/harimau-bunga/idle.png'),
    ('Bunnis', 'Arnab Kek Lapis', 'assets/pets/collection/arnab-kek-lapis/idle.png'),
    ('Keryan', 'Kerbau Durian', 'assets/pets/collection/durian-kerbau/idle.png'),
]
TROFI = [
    ('Langkah Pertama', 'Misi pertama', 'assets/ui/trophies-v1/langkah-pertama.png'),
    ('Rentak Lima', '5 betul berturut-turut', 'assets/ui/trophies-v1/rentak-lima.png'),
    ('Bintang Sempurna', '3 bintang satu misi', 'assets/ui/trophies-v1/bintang-sempurna.png'),
    ('Yakin Sendiri', 'Tanpa petunjuk', 'assets/ui/trophies-v1/yakin-sendiri.png'),
    ('Gigih Berlatih', '100 soalan', 'assets/ui/trophies-v1/gigih-berlatih.png'),
    ('Penewas Cabaran', 'Cabaran besar', 'assets/ui/trophies-v1/penewas-boss.png'),
]

PDF_A = os.path.join(BUILD, 'pdf_ws-1.png')   # Latihan Disyorkan Cikgu Dimensi (halaman 1)
PDF_B = os.path.join(BUILD, 'pdf_sk-5.png')   # Skema dan Cara Menjawab (halaman 5)

SPECIALS = [
    LogoReveal(3.75, 5.95, y=830, scale=0.92, dark_text=False),
    lambda r: Callout(r, 0, 6.45, 7.55, (0.03, 0.445, 0.97, 0.6), 540, 560, 900, ry=-4),
    lambda r: Callout(r, 0, 12.9, 15.85, (0.03, 0.475, 0.97, 0.632), 500, 1020, 880, ry=-6, rz=-1),
    lambda r: Callout(r, 0, 14.0, 15.85, (0.03, 0.637, 0.49, 0.785), 300, 1500, 420, ry=8, rz=-2),
    lambda r: Callout(r, 0, 14.25, 15.85, (0.505, 0.637, 0.955, 0.785), 790, 1560, 400, ry=-8, rz=2),
    lambda r: Callout(r, 0, 16.4, 17.85, (0.02, 0.15, 0.98, 0.305), 540, 640, 900, ry=4),
    lambda r: Callout(r, 0, 20.8, 21.95, (0.08, 0.485, 0.9, 0.625), 540, 700, 880, ry=-4),
    TierPills(22.1, 31.9, 300, [('Gangsa', GANGSA, 23.65), ('Perak', PERAK, 25.3), ('Emas', EMAS, 25.75)]),
    CardGrid(33.5, 36.1, TEMAN, y0=760),
    CardGrid(41.75, 44.7, TROFI, y0=800),
    lambda r: Callout(r, 0, 45.35, 47.5, (0.025, 0.628, 0.975, 0.885), 540, 1150, 860, ry=-6),
    lambda r: Callout(r, 0, 47.95, 50.1, (0.04, 0.59, 0.96, 0.715), 540, 1060, 900, ry=6),
    lambda r: Callout(r, 0, 50.6, 54.3, (0.035, 0.283, 0.975, 0.745), 540, 1140, 760, ry=-5),
    PdfPages(56.0, 60.3, [PDF_A, PDF_B], [
        [(56.0, R(s=0.12, oy=1350, rz=-30, a=0.0)), (56.15, R(s=0.2, oy=1330, rz=-26, a=1.0)),
         (56.95, R(s=1.3, ox=420, oy=1150, rz=-7, ry=12, rx=6), 'back'), (59.6, R(s=1.34, ox=410, oy=1130, rz=-6, ry=10, rx=5)),
         (60.0, R(s=1.45, ox=390, oy=1110, rz=-6, ry=10, rx=5, a=0.0))],
        [(56.3, R(s=0.12, oy=1350, rz=20, a=0.0)), (56.45, R(s=0.2, oy=1330, rz=16, a=1.0)),
         (57.25, R(s=1.15, ox=690, oy=1340, rz=6, ry=-14, rx=6), 'back'), (59.6, R(s=1.19, ox=700, oy=1330, rz=5, ry=-12, rx=5)),
         (60.0, R(s=1.3, ox=720, oy=1320, rz=5, ry=-12, rx=5, a=0.0))],
    ]),
    LogoReveal(60.15, 64.6, y=760, scale=1.0, tag=['Pengembaraan matematik', 'ikut kemampuan anak.'], tag_t=60.9,
               cta='Cuba demo Pahlawan Angka', cta_t=61.9, dark_text=True),
]

FLASHES = [(6.0, 0.2, 0.2), (7.82, 0.35, 0.55), (23.6, 0.25, 0.25), (25.25, 0.25, 0.25), (40.0, 0.45, 0.6)]

# ---------------------------------------------------------------- audio
MUSIC = [
    ('intro', 0, 3), ('drop', 3, 3), ('groove', 6, 5), ('drop', 11, 5), ('groove', 16, 2),
    ('break', 18, 2), ('drop', 20, 2), ('light', 22, 6), ('groove', 28, 1), ('build', 29, 1), ('outro', 30, 2),
]

SFX = [
    ('whoosh', 3.2, 0.7, 0.8), ('pop', 3.9, 0.7), ('whoosh', 5.65, 0.6, 0.9),
    ('pop', 6.5, 0.6), ('src', 7.3, 'C', 11.9, 16.8, 0.8),
    ('whoosh', 11.5, 0.6, 0.7), ('pop', 12.95, 0.6), ('pop', 14.05, 0.45), ('pop', 14.3, 0.45),
    ('whoosh', 15.95, 0.5, 0.5), ('pop', 16.45, 0.55),
    ('src', 19.7, 'B', 7.2, 8.6, 0.6), ('pop', 20.85, 0.55),
    ('whoosh', 21.5, 0.6, 0.7), ('src', 23.0, 'O', 69.8, 70.95, 0.8), ('src', 24.6, 'C', 7.5, 8.9, 0.8),
    ('src', 28.8, 'O', 112.8, 114.3, 0.8),
    ('whoosh', 33.35, 0.7, 0.7), ('pop', 33.55, 0.4), ('pop', 33.8, 0.4), ('pop', 34.0, 0.4),
    ('whoosh', 35.6, 0.7, 0.8), ('src', 36.0, 'K', 12.0, 17.6, 0.35), ('impact', 40.0, 0.45), ('shimmer', 40.05, 0.7),
    ('whoosh', 41.2, 0.6, 0.7), ('pop', 41.85, 0.4), ('pop', 42.1, 0.4), ('pop', 42.35, 0.4),
    ('whoosh', 44.2, 0.6, 0.7), ('pop', 45.4, 0.55), ('pop', 48.0, 0.55), ('pop', 50.65, 0.55), ('pop', 54.9, 0.45),
    ('whoosh', 55.6, 0.7, 0.8), ('whoosh', 56.1, 0.6, 0.6), ('whoosh', 59.55, 0.7, 0.8),
]
