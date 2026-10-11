"""Promo #2 "Kemahiran Fokus" — 30 saat, 9:16, 120 BPM (1 bar = 2 s).

Sumber F = Screen_Recording_20261011_160959 (Kemahiran Fokus, misi Bahagi wang, Kunci battle).
Bahagian F 1.6–3.05 s TIDAK digunakan: pop-up Chrome "Save password?" memaparkan e-mel akaun.
Hub "Umar" juga dilangkau. PIN hanya kelihatan sebagai titik.
"""
from engine import Shot, REST, Callout, HookText, EndScene, font
from timeline_main import R, Z, end_sfx

DURATION = 30.0

SOURCES = {'F': 'src_F.mp4'}
SOURCES_AUDIO = {'F': 'aud_F.wav'}

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
    dict(t0=6.0, bg='cream', wipe=0.35, wipe_tile='÷', origin=(540, 1300),
         tiles=[('+', 120, 1780, 110, -10, 0.3), ('×', 980, 1700, 95, 12, 0.45)]),
    dict(t0=11.6, bg='navy', wipe=0.4, wipe_tile='+', origin=(900, 1500)),
    dict(t0=20.0, bg='deep', wipe=0.4, wipe_tile='×', origin=(140, 400)),
    dict(t0=26.0, bg='gold', wipe=0.45, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.35), ('−', 930, 330, 120, 10, 0.45), ('×', 160, 1760, 130, 8, 0.55), ('÷', 920, 1740, 150, -8, 0.5)]),
]

# ---------------------------------------------------------------- telefon
SHOTS = [
    Shot(6.0, 11.6, 'F', [(0.8, 1.4, 0.6), (1.4, 1.4, 5.0)], 'kemahiran-fokus'),
    Shot(11.6, 14.0, 'F', [(3.15, 4.9, 2.4)], 'misi-menara'),
    Shot(14.0, 20.0, 'F', [(5.6, 7.5, 1.5), (7.5, 8.3, 0.8), (8.3, 8.3, 1.3), (8.3, 9.5, 1.2), (9.5, 9.5, 1.2)], 'soalan-petunjuk-betul'),
    Shot(20.0, 24.5, 'F', [(10.6, 12.5, 1.9), (12.5, 12.5, 2.6)], 'cuba-keluar-kunci'),
    Shot(24.5, 26.0, 'F', [(17.9, 18.9, 1.0), (18.9, 18.9, 0.5)], 'sambung-battle'),
]

CAMERA = [
    (0.0, R(s=0.85, oy=1420, ry=-30, rz=-6, rx=12, a=0.0)),
    (5.9, R(s=0.85, oy=1420, ry=-30, rz=-6, rx=12, a=0.0)),
    (6.45, R(s=1.0, oy=1250, ry=-8, rz=-1.5, rx=3), 'out'),
    (8.4, R(s=1.0, oy=1250, ry=-5, rz=-1, rx=2)),
    (11.4, R(s=1.02, oy=1240, ry=6, rz=1, rx=2)),
    (12.0, R(s=1.0, oy=1240, ry=8, rz=1.5, rx=3)),
    (13.8, R(s=1.2, v=0.45, oy=1220, ry=0)),
    (14.3, R(s=1.0, oy=1250, ry=-6, rz=-1, rx=2)),
    (17.7, R(s=1.0, oy=1250, ry=-4, rz=-1, rx=2)),
    (18.2, Z(0.5, 0.65, 1.25, oy=1330)),
    (19.8, Z(0.5, 0.65, 1.27, oy=1330)),
    (20.3, R(s=1.0, oy=1250, ry=7, rz=1.5, rx=3)),
    (21.1, R(s=1.0, oy=1250, ry=4, rz=1, rx=2)),
    (21.5, Z(0.2, 0.1, 1.35, oy=1130, ox=360)),
    (21.85, R(s=1.0, oy=1250, ry=2, rz=0.5)),
    (24.3, R(s=1.0, oy=1250, ry=0)),
    (24.7, R(s=1.04, oy=1240, ry=-5, rz=-1)),
    (25.9, R(s=0.7, oy=1500, rx=25, a=0.0), 'in'),
    (30.0, R(s=0.7, oy=1500, rx=25, a=0.0)),
]

HIGHLIGHTS = [
    (6.75, 7.6, 0.2, 0.352, 0.5, 0.392),        # Ketepatan 20%
    (7.25, 8.1, 0.2, 0.508, 0.5, 0.548),        # Ketepatan 28%
    (7.75, 8.6, 0.2, 0.665, 0.5, 0.705),        # Ketepatan 31%
    (18.5, 19.9, 0.04, 0.885, 0.4, 0.918),      # Betul! Kunci retak.
    (21.15, 21.85, 0.02, 0.012, 0.13, 0.062),   # anak tekan butang keluar
    (24.5, 25.3, 0.0, 0.0, 0.0, 0.0),
]
HIGHLIGHTS = [h for h in HIGHLIGHTS if h[4] > h[2]]

PHONES = [dict(shots=SHOTS, camera=CAMERA, highlights=HIGHLIGHTS)]

# ---------------------------------------------------------------- teks
TEXTS = [
    dict(t0=6.15, t1=11.5, kicker='KEMAHIRAN FOKUS', head='Detect topik yang anak perlukan perhatian lebih',
         sub='Ikut ketepatan jawapan anak sendiri.', small=True),
    dict(t0=11.75, t1=13.95, kicker='MISI IKUT FOKUS', head='Terus latih topik tu. Bukan tembak rambang.', small=True),
    dict(t0=14.1, t1=19.9, kicker='BIMBINGAN', head='Salah? Ada petunjuk. Cuba lagi sampai faham.', small=True),
    dict(t0=20.1, t1=24.4, kicker='KUNCI BATTLE · KAWALAN IBU BAPA', head='Nak keluar? Kena PIN mak ayah dulu.',
         sub='Mak ayah boleh kunci battle dengan PIN sendiri.', small=True),
    dict(t0=24.55, t1=25.95, head='Fokus sampai topik tu kukuh.', small=True),
]

SPECIALS = [
    *hook_specials(),
    lambda r: Callout(r, 0, 8.6, 11.45, (0.08, 0.29, 0.92, 0.418), 540, 1010, 900, ry=-6, rz=-1),
    lambda r: Callout(r, 0, 16.2, 17.65, (0.03, 0.715, 0.97, 0.925), 540, 1000, 920, ry=5),
    lambda r: Callout(r, 0, 21.95, 24.4, (0.04, 0.232, 0.96, 0.75), 540, 1130, 760, ry=-4, shake=(22.35, 0.55, 26)),
    EndScene(26.0, 30.6, lines=[('Shhh…', 104, (250, 196, 70)), ('Anak rasa main,', 54, (255, 255, 255)),
                                ('kita tahu dia belajar.', 54, (255, 255, 255))], box_h=540),
]

FLASHES = [(0.66, 0.15, 0.12), (6.0, 0.3, 0.45), (18.45, 0.25, 0.25)]

# ---------------------------------------------------------------- audio
MUSIC = [('intro', 0, 3), ('drop', 3, 2), ('groove', 5, 2), ('groove', 7, 3), ('break', 10, 2), ('drop', 12, 1), ('outro', 13, 2)]

SFX = [
    ('thud', 0.0, 0.5), ('thud', 0.15, 0.5), ('thud', 0.32, 0.45), ('thud', 0.44, 0.55), ('thud', 0.56, 0.65), ('thud', 0.68, 0.95),
    ('whoosh', 1.75, 0.45, 0.85, 6000, 400),
    ('pop', 2.13, 0.55), ('thud', 2.31, 0.6), ('thud', 2.47, 0.9), ('boing', 2.7, 0.65, 0.8), ('whoosh', 3.65, 0.45, 0.85, 6000, 400),
    ('pop', 4.1, 0.35), ('pop', 4.17, 0.35), ('pop', 4.25, 0.35), ('pop', 4.32, 0.35), ('thud', 4.51, 0.6), ('thud', 4.65, 0.6),
    ('thud', 4.82, 1.0), ('boing', 5.05, 0.55, 0.6), ('whoosh', 5.55, 0.45, 0.85, 6000, 400),
    ('pop', 6.75, 0.45), ('pop', 7.25, 0.45), ('pop', 7.75, 0.45), ('pop', 8.65, 0.6),
    ('whoosh', 11.3, 0.6, 0.7), ('src', 11.6, 'F', 3.15, 4.9, 0.55),
    ('src', 15.5, 'F', 7.5, 8.3, 0.8), ('pop', 16.25, 0.55), ('src', 18.0, 'F', 8.8, 9.5, 0.8),
    ('whoosh', 19.6, 0.6, 0.7), ('pop', 21.2, 0.4), ('buzz', 21.95, 0.8), ('buzz', 22.4, 0.6),
    ('whoosh', 24.4, 0.5, 0.6), *end_sfx(26.0), ('shh', 27.05, 0.9, 0.7),
]
