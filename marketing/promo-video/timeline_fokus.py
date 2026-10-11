"""Promo #2 "Kemahiran Fokus" — 50 saat, 9:16, 120 BPM (1 bar = 2 s).

Hook teks (0–6 s) → JURUS PENAMAT sebenar sebagai hook visual pada drop 6 s (C 12.4–16.4) →
cerita: app memerhati jawapan → menganalisis corak → mencadangkan 3 topik (adaptive, bukan pilih manual).
Sumber F = Screen_Recording_20261011_160959 (Kemahiran Fokus, misi Bahagi wang, Kunci battle).
Sumber C = Screen_Recording_20261010_234759 (Jurus Penamat → KUKUPAT DITEMUI).
Sumber R = Screen_Recording_20261011_170834 (Ibu Bapa: Ringkasan & Laporan Kemahiran, profil yang sama).
Bahagian F 1.6–3.05 s TIDAK digunakan: pop-up Chrome "Save password?" memaparkan e-mel akaun.
Hub "Umar" juga dilangkau. PIN hanya kelihatan sebagai titik.
"""
from engine import Shot, REST, Callout, HookText, EndScene, FocusShift, font
from timeline_main import R, Z, end_sfx

DURATION = 50.0

SOURCES = {'F': 'src_F.mp4', 'R': 'src_R.mp4', 'C': 'src_C.mp4'}
SOURCES_AUDIO = {'F': 'aud_F.wav', 'C': 'aud_C.wav'}

GOLD_T = (252, 192, 66)

# ---------------------------------------------------------------- hook (0-6 s)


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


def hook_specials():
    # 1) "Worksheet dah bertimbun…" — perkataan "bertimbun" bertindih macam kertas
    w1 = _line(['Worksheet', 'dah'], 112, 790, 0.0, 0.14)
    stack = [(-12, -78, -5, 0.4, (150, 112, 52)), (16, -52, 4, 0.55, (176, 132, 58)), (-8, -26, -2, 0.72, (205, 152, 60))]
    for i, (dx, dy, ang, al, col) in enumerate(stack):
        w1.append(dict(text='bertimbun', size=150, x=540 + dx, y=1060 + dy, t=0.3 + 0.12 * i, color=col, alpha=al, angle=ang, spin=-14))
    w1.append(dict(text='bertimbun', size=150, x=540, y=1060, t=0.66, color=GOLD_T, stroke=6, stroke_color=(112, 50, 0),
                   glow=(255, 140, 30), spin=10))
    h1 = HookText(0.0, w1, twist=(9, 9.5), exit_=(1.8, 2.15), center=(540, 940))
    # 2) "result tetap sama?" — "sama?" bergoyang
    w2 = [dict(text='result', size=130, x=540, y=860, t=2.12, spin=-8)]
    w2 += _line(['tetap', 'sama?'], 150, 1040, 2.3, 0.16)
    w2[-1].update(color=GOLD_T, focus=True, stroke=6, stroke_color=(112, 50, 0), glow=(255, 140, 30), spin=12)
    h2 = HookText(2.1, w2, twist=(2.7, 3.35), exit_=(3.7, 4.05), center=(540, 960), shake_word=2)
    # 3) "Mungkin bukan kurang latihan. Tapi salah sasaran."
    w3 = _line(['Mungkin', 'bukan'], 80, 740, 4.08, 0.07) + _line(['kurang', 'latihan.'], 80, 835, 4.22, 0.07)
    w3 += _line(['Tapi', 'salah'], 130, 1000, 4.5, 0.14)
    w3.append(dict(text='sasaran.', size=170, x=540, y=1170, t=4.8, color=GOLD_T, focus=True, stroke=7,
                   stroke_color=(112, 50, 0), glow=(255, 140, 30), spin=14))
    h3 = HookText(4.05, w3, twist=(5.05, 5.6), exit_=(5.6, 5.95), center=(540, 960), shake_word=len(w3) - 1)
    return [h1, h2, h3]


# ---------------------------------------------------------------- babak
SCENES = [
    dict(t0=0.0, bg='deep'),
    dict(t0=10.0, bg='cream', wipe=0.35, wipe_tile='÷', origin=(540, 1300),
         tiles=[('+', 110, 1800, 100, -10, 0.3), ('×', 990, 1760, 90, 12, 0.45)]),
    dict(t0=24.0, bg='navy', wipe=0.4, wipe_tile='+', origin=(540, 1200)),
    dict(t0=29.5, bg='deep', wipe=0.35, wipe_tile='×', origin=(900, 1500)),
    dict(t0=40.0, bg='cream', wipe=0.4, wipe_tile='−', origin=(140, 500),
         tiles=[('+', 110, 1820, 100, -10, 0.3), ('÷', 990, 1800, 95, 12, 0.4)]),
    dict(t0=46.0, bg='gold', wipe=0.45, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.35), ('−', 930, 330, 120, 10, 0.45), ('×', 160, 1760, 130, 8, 0.55), ('÷', 920, 1740, 150, -8, 0.5)]),
]

# ---------------------------------------------------------------- telefon
SHOTS = [
    # Babak 1b: HOOK VISUAL — Jurus Penamat sebenar (final blow) tepat pada drop 6 s
    Shot(5.0, 10.0, 'C', [(12.25, 12.4, 1.0), (12.4, 16.4, 4.0)], 'jurus-penamat'),
    # Babak 2: setiap jawapan direkod (senarai kemahiran dengan bukti betul sendiri / selepas bantuan)
    Shot(10.0, 17.0, 'R', [(4.3, 6.8, 2.2), (6.8, 7.6, 0.8), (7.6, 7.6, 4.0)], 'laporan-bukti'),
    # Babak 3: analisis corak (Laporan Kemahiran) dan Ringkasan "Fokus seterusnya"
    Shot(17.0, 20.5, 'R', [(3.4, 3.4, 3.5)], 'laporan-pratonton'),
    Shot(20.5, 24.0, 'R', [(0.3, 0.3, 3.5)], 'ringkasan-fokus-seterusnya'),
    # Babak 4: Kemahiran Fokus mencadangkan 3 topik
    Shot(24.0, 29.5, 'F', [(0.8, 1.4, 0.6), (1.4, 1.4, 4.9)], 'kemahiran-fokus'),
    # Babak 5: latihan + petunjuk
    Shot(29.5, 35.5, 'F', [(5.6, 7.5, 1.5), (7.5, 8.3, 0.8), (8.3, 8.3, 1.3), (8.3, 9.5, 1.2), (9.5, 9.5, 1.2)], 'soalan-petunjuk-betul'),
    # Babak 6: kunci battle
    Shot(35.5, 40.0, 'F', [(10.6, 12.5, 1.9), (12.5, 12.5, 2.6)], 'cuba-keluar-kunci'),
]

CAMERA = [
    # 0-5.9 s: hook teks sahaja; telefon muncul terus di Jurus Penamat pada drop 6.0 s
    (0.0, Z(0.5, 0.19, 2.2, oy=1130, a=0.0)),
    (5.9, Z(0.5, 0.19, 2.2, oy=1130, a=0.0)),
    (5.98, Z(0.5, 0.19, 2.0, oy=1130, a=1.0)),
    (6.3, Z(0.5, 0.19, 1.7, oy=1130), 'out'),
    (9.4, Z(0.5, 0.21, 1.8, oy=1130)),
    (9.95, R(s=1.2, v=0.3, oy=1250, a=0.0), 'in'),
    (10.0, R(s=0.85, oy=1420, ry=-30, rz=-6, rx=12, a=0.0)),
    (10.5, R(s=1.0, oy=1270, ry=-9, rz=-1.5, rx=3), 'out'),
    (16.6, R(s=1.0, oy=1270, ry=-5, rz=-1, rx=2)),
    (17.1, R(s=1.0, oy=1270, ry=8, rz=1.5, rx=3)),
    (20.3, R(s=1.0, oy=1270, ry=6, rz=1, rx=2)),
    (20.7, R(s=1.0, oy=1270, ry=-7, rz=-1.5, rx=3)),
    (23.6, R(s=1.0, oy=1270, ry=-5, rz=-1, rx=2)),
    (24.1, R(s=0.8, oy=1420, ry=20, rz=4, rx=10, a=0.0)),
    (24.55, R(s=1.0, oy=1260, ry=-8, rz=-1.5, rx=3), 'out'),
    (29.2, R(s=1.02, oy=1250, ry=6, rz=1, rx=2)),
    (29.8, R(s=1.0, oy=1250, ry=-6, rz=-1, rx=2)),
    (33.2, R(s=1.0, oy=1250, ry=-4, rz=-1, rx=2)),
    (33.7, Z(0.5, 0.65, 1.25, oy=1330)),
    (35.3, Z(0.5, 0.65, 1.27, oy=1330)),
    (35.8, R(s=1.0, oy=1250, ry=7, rz=1.5, rx=3)),
    (36.6, R(s=1.0, oy=1250, ry=4, rz=1, rx=2)),
    (37.0, Z(0.2, 0.1, 1.35, oy=1130, ox=360)),
    (37.35, R(s=1.0, oy=1250, ry=2, rz=0.5)),
    (39.6, R(s=1.0, oy=1250, ry=0)),
    (40.2, R(s=0.7, oy=1520, rx=25, a=0.0), 'in'),
    (50.0, R(s=0.7, oy=1520, rx=25, a=0.0)),
]

HIGHLIGHTS = [
    (24.8, 25.65, 0.2, 0.352, 0.5, 0.392),      # Ketepatan 20%
    (25.3, 26.15, 0.2, 0.508, 0.5, 0.548),      # Ketepatan 28%
    (25.8, 26.65, 0.2, 0.665, 0.5, 0.705),      # Ketepatan 31%
    (34.0, 35.4, 0.04, 0.885, 0.4, 0.918),      # Betul! Kunci retak.
    (36.65, 37.35, 0.02, 0.012, 0.13, 0.062),   # anak tekan butang keluar
]

PHONES = [dict(shots=SHOTS, camera=CAMERA, highlights=HIGHLIGHTS)]

# ---------------------------------------------------------------- teks
TEXTS = [
    dict(t0=6.1, t1=9.85, kicker='PAHLAWAN ANGKA', head='Latihan tepat sasaran.', sub='Setiap jawapan betul jadi serangan!'),
    dict(t0=10.15, t1=16.9, kicker='LAPORAN KEMAHIRAN', head='Setiap jawapan anak direkod.',
         sub='Betul sendiri? Selepas bantuan? Semua dikira.', small=True),
    dict(t0=17.1, t1=23.9, kicker='CIKGU DIMENSI', head='Corak jawapan anak dianalisis.',
         sub='Bukan sekadar markah, tapi cara anak menjawab.', small=True),
    dict(t0=24.15, t1=29.4, kicker='KEMAHIRAN FOKUS', head='Lalu app cadangkan 3 topik untuk dilatih.',
         sub='Ikut 20 jawapan terkini. Bukan teka, bukan pilih manual.', small=True),
    dict(t0=29.6, t1=35.4, kicker='BIMBINGAN', head='Latihan terus ke topik tu. Salah? Ada petunjuk.', small=True),
    dict(t0=35.6, t1=39.9, kicker='KUNCI BATTLE · KAWALAN IBU BAPA', head='Nak keluar? Kena PIN mak ayah dulu.',
         sub='Mak ayah boleh kunci battle dengan PIN sendiri.', small=True),
    dict(t0=40.15, t1=45.9, kicker='ADAPTIVE', head='Dah kukuh? Topik tu keluar sendiri.',
         sub='Fokus beralih ke topik seterusnya.', small=True),
]

SPECIALS = [
    *hook_specials(),
    # babak 2: bukti setiap kemahiran
    lambda r: Callout(r, 0, 13.2, 16.9, (0.03, 0.325, 0.97, 0.418), 540, 960, 920, ry=-5, rz=-1),
    lambda r: Callout(r, 0, 13.85, 16.9, (0.03, 0.6, 0.97, 0.69), 540, 1270, 920, ry=5, rz=1),
    # babak 3: pratonton kemahiran utama, kemudian Ringkasan
    lambda r: Callout(r, 0, 17.45, 20.4, (0.03, 0.592, 0.97, 0.716), 540, 1110, 920, ry=6),
    lambda r: Callout(r, 0, 20.9, 23.9, (0.03, 0.405, 0.63, 0.477), 420, 960, 700, ry=-5, rz=-1),
    lambda r: Callout(r, 0, 21.5, 23.9, (0.03, 0.745, 0.97, 0.872), 560, 1290, 900, ry=5, rz=1),
    # babak 4: kad Fokus utama
    lambda r: Callout(r, 0, 26.6, 29.4, (0.08, 0.29, 0.92, 0.418), 540, 1010, 900, ry=-6, rz=-1),
    # babak 5: petunjuk
    lambda r: Callout(r, 0, 31.7, 33.15, (0.03, 0.715, 0.97, 0.925), 540, 1000, 920, ry=5),
    # babak 6: kunci battle
    lambda r: Callout(r, 0, 37.45, 39.9, (0.04, 0.232, 0.96, 0.75), 540, 1130, 760, ry=-4, shake=(37.85, 0.55, 26)),
    # babak 7: ilustrasi adaptive guna kad Fokus sebenar
    FocusShift('src_F.mp4', 1.4, [(0.09, 0.288, 0.91, 0.418), (0.09, 0.448, 0.91, 0.575), (0.09, 0.605, 0.91, 0.733)],
               40.3, 45.95, top=720),
    EndScene(46.0, 50.6, lines=[('Shhh…', 104, (250, 196, 70)), ('Anak rasa main,', 54, (255, 255, 255)),
                                ('kita tahu dia belajar.', 54, (255, 255, 255))], box_h=540),
]

FLASHES = [(0.66, 0.15, 0.12), (6.0, 0.35, 0.6), (6.8, 0.25, 0.3), (10.0, 0.3, 0.45), (24.0, 0.35, 0.5), (34.0, 0.25, 0.25)]

# ---------------------------------------------------------------- audio
MUSIC = [('intro', 0, 3), ('drop', 3, 2), ('groove', 5, 7), ('drop', 12, 3), ('light', 15, 3),
         ('groove', 18, 2), ('light', 20, 3), ('outro', 23, 2)]

SFX = [
    ('thud', 0.0, 0.5), ('thud', 0.15, 0.5), ('thud', 0.32, 0.45), ('thud', 0.44, 0.55), ('thud', 0.56, 0.65), ('thud', 0.68, 0.95),
    ('whoosh', 1.75, 0.45, 0.85, 6000, 400),
    ('pop', 2.13, 0.55), ('thud', 2.31, 0.6), ('thud', 2.47, 0.9), ('boing', 2.7, 0.65, 0.8), ('whoosh', 3.65, 0.45, 0.85, 6000, 400),
    ('pop', 4.1, 0.35), ('pop', 4.17, 0.35), ('pop', 4.25, 0.35), ('pop', 4.32, 0.35), ('thud', 4.51, 0.6), ('thud', 4.65, 0.6),
    ('thud', 4.82, 1.0), ('boing', 5.05, 0.55, 0.6), ('whoosh', 5.55, 0.45, 0.85, 6000, 400),
    ('src', 5.95, 'C', 12.35, 16.4, 0.85), ('whoosh', 9.6, 0.5, 0.7),
    ('pop', 13.25, 0.55), ('pop', 13.9, 0.55),
    ('whoosh', 16.8, 0.5, 0.6), ('pop', 17.5, 0.55), ('whoosh', 20.3, 0.5, 0.6), ('pop', 20.95, 0.5), ('pop', 21.55, 0.55),
    ('whoosh', 23.6, 0.6, 0.8), ('pop', 24.85, 0.45), ('pop', 25.35, 0.45), ('pop', 25.85, 0.45), ('pop', 26.65, 0.6),
    ('src', 31.0, 'F', 7.5, 8.3, 0.8), ('pop', 31.75, 0.55), ('src', 33.5, 'F', 8.8, 9.5, 0.8),
    ('whoosh', 35.1, 0.6, 0.7), ('pop', 36.7, 0.4), ('buzz', 37.45, 0.8), ('buzz', 37.9, 0.6),
    ('whoosh', 39.9, 0.5, 0.6), ('pop', 40.35, 0.4), ('pop', 40.47, 0.4), ('pop', 40.59, 0.4),
    ('thud', 41.45, 0.7), ('shimmer', 41.5, 0.45), ('whoosh', 42.3, 0.55, 0.8), ('pop', 43.35, 0.5),
    *end_sfx(46.0), ('shh', 47.05, 0.9, 0.7),
]
