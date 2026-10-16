"""Promo #5 "Pahlawan Angka A–Z" — 64 saat, 9:16, 120 BPM (1 bar = 2 s).

Ikut perjalanan skrip VO pemilik (lihat AZ.md), dengan mini game sebagai "ubat" selepas Kemahiran Fokus:
hook "ulang game banyak kali… hilang semangat" → "Haa, cuba tengok ni!" → battle biasa: jadi hero (Wira sahaja),
jawab cabaran, guna kuasa, selamatkan pet → bukan hentam soalan → Kemahiran Fokus kesan bahagian yang belum faham →
"Nak improve, tapi nak lebih fun? Ubatnya: 9 mini-game!" → setiap topik dunia sendiri, takdelah rasa sama →
petunjuk → mak ayah → "Nak main game? Mainlah." → penutup Wira.

Sumber (build, 30 fps, 1080×2236): A B C F K O P (lihat SINEMATIK.md / FOKUS.md) dan G1–G9
(9 mini game Kemahiran Fokus, Screen_Recording_20261016_1533xx; jalur sisa label "DEV" 14 px di atas dibuang,
skrin dipad dengan warna tepi supaya nisbah 1080:2236 tanpa memotong UI game).
Julat dielak: B 1.5–3.5 (e-mel), F 1.6–3.05 (e-mel) & ≥ 12.6 (PIN ditaip), P 0–1.5 (PIN) & > 22.1 (notifikasi).
"""
import os
from engine import (Shot, REST, Callout, HookText, EndScene, LogoReveal, PdfPages, FullClip, Chip, VideoGrid,
                    BUILD, font)
from timeline_main import R, Z, end_sfx

DURATION = 64.0

SOURCES = {k: f'src_{k}.mp4' for k in ['A', 'B', 'C', 'F', 'K', 'O', 'P'] + [f'G{i}' for i in range(1, 10)]}
SOURCES_AUDIO = {k: f'aud_{k}.wav' for k in 'BCFK'}

GOLD_T = (252, 192, 66)
GREY_T = (150, 158, 176)
WHITE = (255, 255, 255)
HOT = dict(color=GOLD_T, stroke=7, stroke_color=(112, 50, 0), glow=(255, 140, 30))
PDF_A = os.path.join(BUILD, 'pdf_ws-1.png')
PDF_B = os.path.join(BUILD, 'pdf_sk-5.png')
HIDE = R(s=0.85, oy=1420, ry=-30, rz=-6, rx=12, a=0.0)
GONE = R(s=1.2, v=0.3, oy=1250, a=0.0)


def _line(words, size, y, t0, dt, **kw):
    f = font('InterDisplay-Black.otf', size)
    space = f.getlength(' ')
    widths = [f.getlength(w) for w in words]
    x = 540 - (sum(widths) + space * (len(words) - 1)) / 2
    out = []
    for i, (w, ww) in enumerate(zip(words, widths)):
        out.append(dict(text=w, size=size, x=x + ww / 2, y=y, t=t0 + dt * i, **kw))
        x += ww + space
    return out


# ---------------------------------------------------------------- tipografi kinetik
def hooks():
    # 1) "Anak boleh ulang game banyak kali…" — "banyak kali…" bergema berulang
    w1 = _line(['Anak', 'boleh', 'ulang'], 100, 690, 0.0, 0.1)
    w1.append(dict(text='game', size=240, x=540, y=900, t=0.32, focus=True, spin=14, **HOT))
    for j, (dy, al) in enumerate(((150, 0.18), (100, 0.32), (50, 0.5))):
        w1.append(dict(text='banyak kali…', size=120, x=540, y=1110 + dy, t=0.62 + 0.09 * j, alpha=al, spin=-6))
    w1.append(dict(text='banyak kali…', size=120, x=540, y=1110, t=0.9, spin=-8))
    h1 = HookText(0.0, w1, twist=(1.0, 1.7), exit_=(2.5, 2.88), center=(540, 920), shake_word=3)
    # 2) "tapi bila buka buku Matematik, terus hilang semangat?" — kelabu & lentur
    w2 = _line(['tapi', 'bila', 'buka'], 90, 600, 2.95, 0.09)
    w2.append(dict(text='buku Matematik,', size=128, x=540, y=760, t=3.25))
    w2.append(dict(text='terus', size=100, x=540, y=960, t=3.75))
    w2.append(dict(text='hilang', size=190, x=540, y=1135, t=3.95, color=GREY_T, stroke=6, stroke_color=(40, 44, 60),
                   focus=True, spin=-12))
    w2.append(dict(text='semangat?', size=150, x=540, y=1315, t=4.2, color=GREY_T, stroke=5, stroke_color=(40, 44, 60),
                   spin=8, angle=-4))
    h2 = HookText(2.9, w2, twist=(4.5, 5.3), exit_=(5.55, 5.92), center=(540, 960), shake_word=4)
    # 3) "Haa, cuba tengok ni!"
    w3 = [dict(text='Haa,', size=230, x=540, y=820, t=6.05, focus=True, spin=-16, **HOT)]
    w3 += _line(['cuba', 'tengok', 'ni!'], 120, 1040, 6.5, 0.12)
    h3 = HookText(6.0, w3, twist=(6.2, 6.7), exit_=(7.55, 7.95), center=(540, 930), shake_word=0)
    # 4) selepas Kemahiran Fokus: "Nak improve, tapi nak lebih fun? Ubatnya: 9 MINI-GAME!"
    w4 = _line(['Nak', 'improve,'], 110, 600, 23.65, 0.1)
    w4 += _line(['tapi', 'nak', 'lebih', 'fun?'], 100, 745, 23.9, 0.08)
    w4.append(dict(text='Ubatnya:', size=120, x=540, y=930, t=24.5))
    w4.append(dict(text='9', size=360, x=540, y=1150, t=24.75, focus=True, spin=-20, **HOT))
    w4.append(dict(text='MINI-GAME!', size=130, x=540, y=1375, t=24.95))
    h4 = HookText(23.6, w4, twist=(25.0, 25.45), exit_=(25.62, 25.98), center=(540, 980), shake_word=7)
    # 5) "Nak main game? Mainlah."
    w5 = _line(['Nak', 'main', 'game?'], 120, 830, 52.05, 0.12)
    w5.append(dict(text='Mainlah.', size=220, x=540, y=1050, t=52.75, focus=True, spin=12, **HOT))
    h5 = HookText(52.0, w5, twist=(53.0, 53.5), exit_=(53.6, 53.95), center=(540, 950))
    return [h1, h2, h3, h4, h5]


# ---------------------------------------------------------------- babak (latar)
TILES4 = [('+', 170, 470, 130, -12, 0.15), ('−', 910, 520, 120, 10, 0.25), ('×', 180, 1560, 130, 8, 0.3), ('÷', 900, 1520, 150, -8, 0.2)]
SCENES = [
    dict(t0=0.0, bg='deep'),
    dict(t0=8.0, bg='navy', wipe=0.4, wipe_tile='×', origin=(540, 960), tiles=TILES4),
    dict(t0=10.0, bg='deep'),
    dict(t0=11.0, bg='deep', wipe=0.35, wipe_tile='+', origin=(540, 1300)),
    dict(t0=17.0, bg='cream', wipe=0.4, wipe_tile='−', origin=(140, 600), tiles=[('+', 110, 1820, 100, -10, 0.3), ('÷', 990, 1800, 95, 12, 0.4)]),
    dict(t0=23.6, bg='navy', wipe=0.4, wipe_tile='×', origin=(540, 960)),
    dict(t0=25.9, bg='cream', wipe=0.4, wipe_tile='÷', origin=(940, 1600), tiles=[('+', 120, 1760, 110, -10, 0.3), ('×', 980, 640, 90, 12, 0.45)]),
    dict(t0=35.0, bg='navy', wipe=0.4, wipe_tile='+', origin=(540, 1200)),
    dict(t0=38.0, bg='deep', wipe=0.35, wipe_tile='×', origin=(900, 1500)),
    dict(t0=43.0, bg='cream', wipe=0.45, wipe_tile='÷', origin=(100, 1800), tiles=[('−', 990, 1800, 100, 8, 0.4)]),
    dict(t0=48.0, bg='navy', wipe=0.45, wipe_tile='+', origin=(540, 1500)),
    dict(t0=52.0, bg='deep', wipe=0.35, wipe_tile='×', origin=(540, 960)),
    dict(t0=53.9, bg='navy', wipe=0.35, wipe_tile='+', origin=(540, 1300)),
    dict(t0=58.0, bg='gold', wipe=0.45, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.35), ('−', 930, 330, 120, 10, 0.45), ('×', 160, 1700, 130, 8, 0.55), ('÷', 920, 1680, 150, -8, 0.5)]),
]

# ---------------------------------------------------------------- telefon
SHOTS = [
    # battle biasa: jawab cabaran → guna kuasa (Jurus Penamat) → selamatkan pet (KUKUPAT DITEMUI)
    Shot(11.0, 17.0, 'C', [(10.3, 10.5, 0.2), (10.5, 16.3, 5.8)], 'cabaran-kuasa-pet'),
    # bukan hentam soalan: Kembara Dimensi (Cikgu Dimensi pilih latihan ikut tahap)
    Shot(17.0, 20.0, 'A', [(0.3, 0.3, 0.2), (0.3, 3.1, 2.8)], 'kembara-dimensi'),
    # Kemahiran Fokus kesan bahagian yang belum faham
    Shot(20.0, 23.6, 'F', [(0.8, 1.4, 0.6), (1.4, 1.4, 3.0)], 'kemahiran-fokus'),
    # "ubatnya": 9 mini game — 4 dinamakan, 5 lagi pantas, setiap satu tamat pada HEBAT/BAGUS
    Shot(25.8, 28.0, 'G1', [(0.3, 0.3, 0.2), (0.3, 1.2, 0.5), (4.2, 6.9, 1.5)], 'cashier-gerai-wirayung'),
    Shot(28.0, 29.6, 'G3', [(3.0, 4.8, 1.6)], 'bina-bentuk-arkitek-dimensi'),
    Shot(29.6, 31.2, 'G2', [(2.6, 5.4, 1.6)], 'masa-tren-jam'),
    Shot(31.2, 32.8, 'G6', [(4.4, 7.8, 1.6)], 'harta-gudang-harta'),
    Shot(32.8, 33.24, 'G4', [(4.3, 4.9, 0.44)], 'kedai-kek'),
    Shot(33.24, 33.68, 'G5', [(3.7, 4.3, 0.44)], 'bengkel-besi'),
    Shot(33.68, 34.12, 'G7', [(4.8, 5.4, 0.44)], 'dapur-ramuan'),
    Shot(34.12, 34.56, 'G8', [(14.6, 15.2, 0.44)], 'pos-peninjau'),
    Shot(34.56, 35.3, 'G9', [(2.1, 2.9, 0.74)], 'lombong-permata'),
    # petunjuk, bukan jawapan
    Shot(38.0, 43.0, 'F', [(5.6, 7.5, 1.3), (7.5, 8.3, 0.8), (8.3, 8.3, 1.2), (8.3, 9.5, 1.2), (9.5, 9.5, 0.5)], 'petunjuk'),
    # mak ayah
    Shot(43.0, 45.6, 'P', [(1.6, 2.5, 0.9), (2.5, 2.5, 1.7)], 'ringkasan-anak'),
    Shot(45.6, 48.0, 'P', [(5.3, 5.6, 0.3), (5.6, 5.6, 2.1)], 'laporan-kemahiran'),
    Shot(48.0, 50.0, 'P', [(20.9, 22.05, 1.15), (22.05, 22.05, 0.85)], 'latihan-skema'),
    # "Kali ni, biar Matematik pun ikut sekali!" — detik kejayaan pantas
    Shot(53.8, 54.8, 'O', [(62.4, 63.4, 1.0)], 'serangan'),
    Shot(54.8, 55.5, 'G4', [(4.1, 4.8, 0.7)], 'kek-hebat'),
    Shot(55.5, 56.3, 'K', [(15.6, 16.4, 0.8)], 'evolusi-bara'),
    Shot(56.3, 57.0, 'G7', [(4.5, 5.2, 0.7)], 'ramuan-bagus'),
    Shot(57.0, 58.4, 'C', [(19.35, 20.75, 1.4)], 'berjaya'),
]


def whip(tc, side, s=1.3, oy=1270):
    """Potongan montaj: telefon sapu dari satu sisi, hentian lembut, kemudian sedikit zoom ke dalam."""
    return [(tc - 0.18, R(s=s + 0.06, oy=oy - 5, ry=-4 * side, rz=-0.5 * side, rx=1)),
            (tc + 0.16, R(s=s, oy=oy, ry=7 * side, rz=1 * side, rx=2), 'out')]


CAMERA = [
    (0.0, HIDE),
    (11.0, R(s=0.85, oy=1420, ry=30, rz=6, rx=12, a=0.0)),
    (11.5, R(s=1.0, oy=1220, ry=8, rz=1.5, rx=3), 'out'),
    (12.85, R(s=1.0, oy=1220, ry=4, rz=1, rx=2)),
    (13.2, Z(0.5, 0.19, 1.75, oy=1130), 'out'),
    (16.4, Z(0.5, 0.21, 1.85, oy=1130)),
    (16.95, GONE, 'in'),
    (17.0, R(s=0.85, oy=1420, ry=30, rz=6, rx=12, a=0.0)),
    (17.5, R(s=0.98, ox=610, oy=1240, ry=14, rz=2, rx=3), 'out'),
    (19.8, R(s=0.98, ox=600, oy=1240, ry=10, rz=1.5, rx=2)),
    (20.25, R(s=1.0, oy=1260, ry=-8, rz=-1.5, rx=3), 'out'),
    (23.1, R(s=1.02, oy=1250, ry=6, rz=1, rx=2)),
    (23.55, GONE, 'in'),
    (25.8, R(s=0.9, oy=1400, ry=-25, rz=-4, rx=10, a=0.0)),
    (26.2, R(s=1.3, oy=1270, ry=-6, rz=-1, rx=2), 'out'),
    *whip(28.0, 1), *whip(29.6, -1), *whip(31.2, 1),
    (32.65, R(s=1.36, oy=1265, ry=3)),
    (32.95, R(s=1.42, oy=1260, ry=0, rz=0, rx=0), 'out'),
    (34.75, R(s=1.5, oy=1250)),
    (35.1, GONE, 'in'),
    (37.8, R(s=0.85, oy=1420, ry=30, rz=6, rx=12, a=0.0)),
    (38.25, R(s=1.0, oy=1250, ry=6, rz=1, rx=2), 'out'),
    (41.7, R(s=1.0, oy=1250, ry=4, rz=1, rx=2)),
    (42.2, Z(0.5, 0.65, 1.25, oy=1330)),
    (42.85, Z(0.5, 0.65, 1.27, oy=1330)),
    (43.25, R(s=1.0, ox=560, oy=1230, ry=-8, rz=-1.5, rx=3), 'out'),
    (45.4, R(s=1.0, ox=560, oy=1230, ry=-6, rz=-1, rx=2)),
    (45.85, R(s=1.0, ox=520, oy=1230, ry=8, rz=1.5, rx=2)),
    (47.8, R(s=1.0, ox=520, oy=1230, ry=6, rz=1, rx=2)),
    (48.25, R(s=1.05, ox=540, oy=1180, ry=0, rz=0, rx=0)),
    (49.1, R(s=1.05, ox=540, oy=1180)),
    (49.8, R(s=0.6, oy=1520, rx=28, a=0.0), 'in'),
    (53.8, HIDE),
    (54.2, R(s=1.3, oy=1270, ry=-6, rz=-1, rx=2), 'out'),
    *whip(54.8, 1), *whip(55.5, -1), *whip(56.3, 1), *whip(57.0, -1),
    (57.75, R(s=1.36, oy=1265)),
    (58.15, R(s=0.6, oy=1520, rx=28, a=0.0), 'in'),
    (64.0, R(s=0.6, oy=1520, rx=28, a=0.0)),
]

HIGHLIGHTS = [
    (20.8, 21.65, 0.2, 0.352, 0.5, 0.392),      # Ketepatan 20%
    (21.3, 22.15, 0.2, 0.508, 0.5, 0.548),      # Ketepatan 28%
    (21.8, 22.65, 0.2, 0.665, 0.5, 0.705),      # Ketepatan 31%
    (42.4, 42.98, 0.04, 0.885, 0.4, 0.918),     # Betul! Kunci retak.
    (48.3, 49.1, 0.05, 0.805, 0.95, 0.868),     # Latihan + skema
]

PHONES = [dict(shots=SHOTS, camera=CAMERA, highlights=HIGHLIGHTS)]

# ---------------------------------------------------------------- teks (ikut skrip VO)
TEXTS = [
    dict(t0=8.3, t1=9.9, kicker='MATEMATIK KSSR · DARJAH 1–6', head='Dalam Bahasa Melayu', align='center', y=1290, small=True),
    dict(t0=10.1, t1=11.1, kicker='DALAM PAHLAWAN ANGKA', head='Anak jadi hero…'),
    dict(t0=11.3, t1=12.95, head='Jawab cabaran Matematik…'),
    dict(t0=13.1, t1=15.55, head='…guna kuasa!'),
    dict(t0=15.65, t1=16.95, head='Selamatkan pet!'),
    dict(t0=17.15, t1=19.95, kicker='YANG BEST', head='Bukan main hentam soalan.',
         sub='Cikgu Dimensi pilih latihan ikut tahap anak.', small=True),
    dict(t0=20.15, t1=23.5, kicker='KEMAHIRAN FOKUS', head='Selalu tersangkut?',
         sub='Fokus kesan bahagian yang belum betul-betul faham.'),
    dict(t0=26.1, t1=34.9, kicker='MINI-GAME KEMAHIRAN FOKUS', head='Setiap topik, dunia sendiri.'),
    dict(t0=35.2, t1=37.9, kicker='9 MINI-GAME · 9 TOPIK', head='Takdelah rasa setiap topik sama je!'),
    dict(t0=38.15, t1=42.9, kicker='TANYA WIRA', head='Ada petunjuk…', sub='…tapi bukan terus bagi jawapan.'),
    dict(t0=43.15, t1=47.9, kicker='UNTUK MAK AYAH', head='Tengok perkembangan anak.'),
    dict(t0=48.1, t1=51.9, kicker='LATIHAN TAMBAHAN', head='Sediakan latihan bercetak.', sub='Lengkap dengan skema jawapan.'),
    dict(t0=54.1, t1=57.95, head='Kali ni, biar Matematik pun ikut sekali!'),
]

GRID = [('src_G1.mp4', 5.4), ('src_G2.mp4', 3.6), ('src_G3.mp4', 3.2), ('src_G4.mp4', 3.4), ('src_G5.mp4', 2.6),
        ('src_G6.mp4', 5.6), ('src_G7.mp4', 3.6), ('src_G8.mp4', 13.2), ('src_G9.mp4', 0.8)]
GRID_LABELS = ['Wang', 'Masa', 'Ruang', 'Pecahan', 'Ukuran', 'Nombor', 'Nisbah', 'Data', 'Perpuluhan']

SPECIALS = [
    # hook: latar gameplay kabur (detik serangan) untuk "ulang game", halaman worksheet pudar untuk "buku Matematik"
    FullClip('src_C.mp4', 0.0, 2.95, [(13.9, 15.5, 2.95)], zoom=(2.35, 2.15), dim=0.42, blur=6, fade=(0.0, 0.3), center=(0.5, 0.19)),
    PdfPages(2.95, 5.95, [PDF_A], [[(2.95, R(s=0.3, oy=1400, rz=-20, a=0.0)), (3.4, R(s=1.25, ox=540, oy=980, rz=-6, ry=10, rx=8, a=0.26), 'out'),
                                    (5.5, R(s=1.3, ox=540, oy=1000, rz=-5, ry=8, rx=6, a=0.26)), (5.95, R(s=1.2, oy=1100, a=0.0), 'in')]]),
    FullClip('src_O.mp4', 52.0, 54.0, [(62.2, 64.2, 2.0)], zoom=(2.35, 2.15), dim=0.42, blur=6, fade=(0.2, 0.2), center=(0.5, 0.19)),
    *hooks(),
    LogoReveal(8.0, 9.95, y=830, scale=0.92, dark_text=False),
    # jadi hero: sinematik Wira berjalan ke menara (skrin penuh)
    FullClip('src_B.mp4', 10.0, 11.25, [(5.95, 7.2, 1.25)], zoom=(1.0, 1.08), dim=0.9, scrim=0.75, fade=(0.15, 0.2)),
    lambda r: Callout(r, 0, 18.1, 19.95, (0.03, 0.475, 0.97, 0.632), 500, 1020, 880, ry=-6, rz=-1),
    lambda r: Callout(r, 0, 22.6, 23.5, (0.08, 0.29, 0.92, 0.418), 540, 1010, 900, ry=-6, rz=-1),
    # mini game: label aksi
    Chip('Jadi cashier', 26.15, 27.9, 540, 505),
    Chip('Bina bentuk', 28.1, 29.55, 540, 505),
    Chip('Main dengan masa', 29.7, 31.15, 540, 505),
    Chip('Cari harta', 31.3, 32.75, 540, 505),
    Chip('+ 5 dunia lagi!', 32.9, 34.9, 540, 505),
    VideoGrid(35.0, 37.95, GRID, y0=640, labels=GRID_LABELS),
    lambda r: Callout(r, 0, 40.2, 41.65, (0.03, 0.715, 0.97, 0.925), 540, 1000, 920, ry=5),
    lambda r: Callout(r, 0, 43.7, 45.5, (0.025, 0.628, 0.975, 0.885), 540, 1150, 860, ry=-6),
    lambda r: Callout(r, 0, 46.2, 47.9, (0.04, 0.59, 0.96, 0.715), 540, 1060, 900, ry=6),
    PdfPages(49.2, 52.0, [PDF_A, PDF_B], [
        [(49.2, R(s=0.12, oy=1350, rz=-30, a=0.0)), (49.35, R(s=0.2, oy=1330, rz=-26, a=1.0)),
         (50.15, R(s=1.3, ox=420, oy=1150, rz=-7, ry=12, rx=6), 'back'), (51.55, R(s=1.34, ox=410, oy=1130, rz=-6, ry=10, rx=5)),
         (51.95, R(s=1.45, ox=390, oy=1110, rz=-6, ry=10, rx=5, a=0.0))],
        [(49.5, R(s=0.12, oy=1350, rz=20, a=0.0)), (49.65, R(s=0.2, oy=1330, rz=16, a=1.0)),
         (50.45, R(s=1.15, ox=690, oy=1340, rz=6, ry=-14, rx=6), 'back'), (51.55, R(s=1.19, ox=700, oy=1330, rz=5, ry=-12, rx=5)),
         (51.95, R(s=1.3, ox=720, oy=1320, rz=5, ry=-12, rx=5, a=0.0))],
    ]),
    EndScene(58.0, 64.6, lines=[('Jom selamatkan', 66, WHITE), ('semua teman', 66, (250, 196, 70)),
                                ('sambil belajar!', 50, WHITE)], box_h=560),
]

FLASHES = [(0.32, 0.15, 0.12), (8.0, 0.35, 0.6), (13.1, 0.3, 0.45), (14.2, 0.25, 0.3), (26.0, 0.35, 0.5),
           (35.0, 0.3, 0.35), (54.0, 0.35, 0.5), (55.5, 0.3, 0.45)]

# ---------------------------------------------------------------- audio
MUSIC = [('intro', 0, 3), ('build', 3, 1), ('drop', 4, 2), ('groove', 6, 3), ('light', 9, 3), ('build', 12, 1),
         ('drop', 13, 3), ('groove', 16, 3), ('light', 19, 3), ('groove', 22, 4), ('build', 26, 1), ('drop', 27, 2),
         ('outro', 29, 3)]

SFX = [
    # hook
    ('pop', 0.02, 0.4), ('pop', 0.12, 0.4), ('pop', 0.22, 0.4), ('thud', 0.33, 0.9), ('pop', 0.62, 0.25), ('pop', 0.71, 0.25),
    ('pop', 0.8, 0.25), ('thud', 0.9, 0.6), ('boing', 1.0, 0.65, 0.8), ('whoosh', 2.45, 0.45, 0.85, 6000, 400),
    ('pop', 2.96, 0.35), ('pop', 3.05, 0.35), ('pop', 3.14, 0.35), ('thud', 3.26, 0.7), ('pop', 3.76, 0.35),
    ('whoosh', 3.95, 0.7, 0.6, 2400, 180), ('thud', 4.21, 0.6), ('boing', 4.5, 0.8, 0.5), ('whoosh', 5.5, 0.45, 0.85, 6000, 400),
    ('thud', 6.05, 1.0), ('pop', 6.5, 0.4), ('pop', 6.62, 0.4), ('pop', 6.74, 0.4), ('whoosh', 7.5, 0.5, 0.9, 6000, 400),
    # jenama, hero, battle biasa
    ('pop', 8.3, 0.6), ('whoosh', 9.9, 0.6, 0.7), ('src', 10.0, 'B', 5.95, 7.2, 0.6),
    ('whoosh', 10.95, 0.6, 0.7), ('src', 11.0, 'C', 10.3, 16.3, 0.85),
    # bukan hentam soalan, Kemahiran Fokus
    ('whoosh', 16.95, 0.6, 0.7), ('pop', 18.15, 0.55),
    ('whoosh', 20.0, 0.4, 0.4), ('pop', 20.85, 0.45), ('pop', 21.35, 0.45), ('pop', 21.85, 0.45), ('pop', 22.65, 0.6),
    # "ubatnya: 9 mini-game"
    ('whoosh', 23.5, 0.5, 0.7), ('pop', 23.65, 0.4), ('pop', 23.75, 0.4), ('pop', 23.9, 0.35), ('pop', 23.98, 0.35),
    ('pop', 24.06, 0.35), ('pop', 24.14, 0.35), ('thud', 24.5, 0.7), ('impact', 24.75, 0.5), ('pop', 24.95, 0.5),
    ('whoosh', 25.6, 0.45, 0.85, 6000, 400),
    ('pop', 26.2, 0.5), ('shimmer', 27.5, 0.35), ('whoosh', 27.9, 0.35, 0.5), ('pop', 28.15, 0.45), ('shimmer', 28.9, 0.35),
    ('whoosh', 29.5, 0.35, 0.5), ('pop', 29.75, 0.45), ('shimmer', 30.8, 0.35), ('whoosh', 31.1, 0.35, 0.5),
    ('pop', 31.35, 0.45), ('shimmer', 32.45, 0.35), ('whoosh', 32.7, 0.35, 0.5), ('pop', 32.95, 0.45),
    *[('whoosh', 33.2 + 0.44 * i, 0.22, 0.25, 3000, 800) for i in range(4)],
    ('whoosh', 34.9, 0.5, 0.6), *[('pop', 35.05 + 0.07 * i, 0.28) for i in range(9)],
    # petunjuk
    ('whoosh', 37.95, 0.5, 0.6), ('src', 39.5, 'F', 7.5, 8.3, 0.8), ('pop', 40.25, 0.55), ('src', 42.0, 'F', 8.8, 9.5, 0.8),
    # mak ayah
    ('whoosh', 42.9, 0.6, 0.7), ('pop', 43.75, 0.55), ('pop', 46.25, 0.55), ('pop', 48.35, 0.45),
    ('whoosh', 49.1, 0.7, 0.8), ('whoosh', 49.5, 0.6, 0.6), ('whoosh', 51.85, 0.6, 0.7),
    # Nak main game? Mainlah.
    ('pop', 52.05, 0.4), ('pop', 52.17, 0.4), ('pop', 52.29, 0.4), ('thud', 52.75, 0.9), ('boing', 53.0, 0.6, 0.8),
    ('whoosh', 53.55, 0.45, 0.85, 6000, 400),
    ('whoosh', 54.7, 0.35, 0.5), ('whoosh', 55.4, 0.35, 0.5), ('src', 55.5, 'K', 15.6, 16.4, 0.5), ('shimmer', 55.55, 0.5),
    ('whoosh', 56.2, 0.35, 0.5), ('whoosh', 56.9, 0.35, 0.5), ('src', 57.0, 'C', 19.35, 20.4, 0.6),
    *end_sfx(58.0),
]
