"""Promo #3 "Semua Skrin" — 32.5 saat, 9:16, 120 BPM (1 bar = 2 s). Semua audio sumber dibisukan.

Sumber:
  TV1, TV2  20261011_171100_1/2 (4K, rakaman tangan TV sebenar; audio dibuang)
  LAP, TAB  app sebenar (origin/main, mod Cuba Demo) dirakam dengan Chromium pada 1440×900 dan 834×1194
  C, F      rakaman telefon HD (Jurus Penamat; hub profil yang sama dengan TV)
"""
from engine import Shot, REST, HookText, EndScene, FullClip, DeviceClip, Chip, font
from timeline_main import R, Z, end_sfx

DURATION = 32.5

SOURCES = {'C': 'src_C.mp4', 'F': 'src_F.mp4'}
SOURCES_AUDIO = {}

GOLD_T = (252, 192, 66)
NAVY_T = (14, 22, 54)


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


def hooks():
    hot = dict(color=GOLD_T, stroke=7, stroke_color=(112, 50, 0), glow=(255, 140, 30), spin=14)
    w1 = _line(['Anak', 'depan'], 120, 740, 0.0, 0.14)
    w1.append(dict(text='TV', size=300, x=540, y=960, t=0.3, focus=True, **hot))
    w1.append(dict(text='lagi?', size=130, x=540, y=1170, t=0.5, spin=-8))
    h1 = HookText(0.0, w1, twist=(0.75, 1.35), exit_=(1.62, 1.96), center=(540, 950), shake_word=2)
    w2 = [dict(text='Tenang…', size=96, x=540, y=760, t=2.0, spin=-6)]
    w2 += _line(['dia', 'tengah', 'buat'], 104, 900, 2.22, 0.1)
    w2.append(dict(text='Matematik.', size=140, x=540, y=1080, t=2.55, focus=True, **hot))
    h2 = HookText(2.0, w2, twist=(2.85, 3.4), exit_=(3.62, 3.97), center=(540, 920), shake_word=len(w2) - 1)
    navy = dict(color=NAVY_T)
    w3 = _line(['Tak', 'perlu'], 120, 330, 16.15, 0.12, **navy)
    w3.append(dict(text='download.', size=160, x=540, y=500, t=16.42, strike_t=17.0, color=NAVY_T, spin=10))
    h3 = HookText(16.1, w3, twist=(99, 99.5), exit_=(21.55, 21.95), center=(540, 420))
    return [h1, h2, h3]


# ---------------------------------------------------------------- babak
SCENES = [
    dict(t0=0.0, bg='deep'),
    dict(t0=8.0, bg='navy', wipe=0),
    dict(t0=16.0, bg='cream', wipe=0.4, wipe_tile='÷', origin=(540, 1500),
         tiles=[('+', 110, 1820, 100, -10, 0.3), ('×', 990, 1800, 95, 12, 0.45)]),
    dict(t0=22.0, bg='deep', wipe=0),
    dict(t0=28.0, bg='gold', wipe=0.45, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.35), ('−', 930, 330, 120, 10, 0.45), ('×', 160, 1760, 130, 8, 0.55), ('÷', 920, 1740, 150, -8, 0.5)]),
]

# ---------------------------------------------------------------- telefon (babak D dan F)
SHOTS = [
    Shot(10.0, 16.0, 'C', [(11.6, 17.6, 6.0)], 'jurus-penamat-telefon'),
    Shot(22.0, 28.0, 'F', [(0.2, 0.2, 6.0)], 'hub-telefon-lv21'),
]
CAMERA = [
    (0.0, R(s=0.6, ox=1350, oy=1440, ry=-30, a=0.0)),
    (10.0, R(s=0.6, ox=1350, oy=1440, ry=-30, a=0.0)),
    (10.6, R(s=0.6, ox=800, oy=1480, ry=-14, rz=2, rx=4), 'out'),
    (15.6, R(s=0.6, ox=800, oy=1470, ry=-10, rz=2, rx=3)),
    (16.0, R(s=0.55, ox=800, oy=1320, ry=-10, a=0.0), 'in'),
    (22.0, R(s=0.72, ox=1350, oy=1330, ry=-24, a=0.0)),
    (22.6, R(s=0.72, ox=760, oy=1330, ry=-10, rz=2, rx=3), 'out'),
    (27.6, R(s=0.72, ox=760, oy=1320, ry=-8, rz=1.5, rx=2)),
    (28.0, R(s=0.6, ox=760, oy=1500, a=0.0), 'in'),
    (32.5, R(s=0.6, ox=760, oy=1500, a=0.0)),
]
HIGHLIGHTS = [(23.2, 27.8, 0.03, 0.33, 0.25, 0.362)]   # "Lv. 21" pada telefon
PHONES = [dict(shots=SHOTS, camera=CAMERA, highlights=HIGHLIGHTS)]

# ---------------------------------------------------------------- teks
TEXTS = [
    dict(t0=4.15, t1=7.9, kicker='PAHLAWAN ANGKA DI TV', head='Skrin besar. Lagi seronok.', sub='Buka terus di browser TV pintar.'),
    dict(t0=8.15, t1=15.9, kicker='SEMUA PLATFORM', head='Satu game. Semua skrin.', sub='Telefon · Tablet · Laptop · TV'),
    dict(t0=17.7, t1=21.9, head='Buka browser. Terus main.', sub='Tak makan storan peranti.', align='center', y=1430, small=True),
    dict(t0=22.15, t1=27.9, kicker='SATU AKAUN', head='Main di TV, sambung di telefon.', sub='Progress disimpan dalam akaun.'),
]

SPECIALS = [
    FullClip('src_TV2.mp4', 0.0, 4.0, [(0.0, 4.0, 4.0)], zoom=(1.1, 1.0), dim=0.42, blur=5),
    FullClip('src_TV1.mp4', 4.0, 8.0, [(0.0, 3.95, 4.0)], zoom=(1.0, 1.08), scrim=0.85),
    FullClip('src_TV1.mp4', 22.0, 28.0, [(0.4, 0.4, 6.0)], zoom=(1.0, 1.04), dim=0.6, scrim=0.85,
             rings=[(23.0, 27.8, 0.083, 0.404, 72)]),
    *hooks(),
    DeviceClip('laptop', 'src_LAP.mp4', 8.0, 16.0, [(10.0, 18.0, 8.0)], [
        (8.0, R(s=1.3, ox=-450, oy=800, ry=35, rz=-4, a=0.0)),
        (8.7, R(s=1.4, ox=540, oy=720, ry=8, rx=4), 'out'),
        (15.6, R(s=1.4, ox=540, oy=710, ry=4, rx=3)),
        (16.0, R(s=1.3, ox=540, oy=620, a=0.0), 'in')], label='Laptop', label_t=9.0, label_xy=(540, 1040)),
    DeviceClip('tablet', 'src_TAB.mp4', 9.0, 16.0, [(21.5, 28.5, 7.0)], [
        (9.0, R(s=1.15, ox=-300, oy=1460, ry=30, rz=-6, a=0.0)),
        (9.6, R(s=1.25, ox=300, oy=1480, ry=12, rz=-2, rx=4), 'out'),
        (15.6, R(s=1.25, ox=300, oy=1470, ry=9, rz=-2, rx=3)),
        (16.0, R(s=1.15, ox=300, oy=1330, a=0.0), 'in')], label='Tablet', label_t=9.9, label_xy=(300, 1840)),
    DeviceClip('browser', 'src_LAP.mp4', 16.6, 22.0, [(18.0, 23.4, 5.4)], [
        (16.6, R(s=1.1, ox=540, oy=1250, rx=30, a=0.0)),
        (17.3, R(s=1.42, ox=540, oy=1000, rx=6, ry=-4), 'out'),
        (21.5, R(s=1.42, ox=540, oy=990, rx=4, ry=-2)),
        (22.0, R(s=1.3, ox=540, oy=900, a=0.0), 'in')]),
    EndScene(28.0, 33.1, lines=[('Jom, Wira', 84, (255, 255, 255)), ('temankan!', 84, (250, 196, 70)),
                                ('Di skrin mana pun.', 46, (255, 255, 255))], box_h=560),
]

# label "Telefon" untuk telefon 3D
SPECIALS.append(Chip('Telefon', 10.9, 16.0, 800, 1840))
SPECIALS.append(Chip('TV', 4.6, 7.9, 920, 1700))

FLASHES = [(4.0, 0.35, 0.6), (8.0, 0.3, 0.45), (22.0, 0.3, 0.35)]

# ---------------------------------------------------------------- audio (semua audio sumber dibisukan)
MUSIC = [('intro', 0, 2), ('drop', 2, 2), ('groove', 4, 4), ('light', 8, 3), ('groove', 11, 3), ('outro', 14, 2)]

SFX = [
    ('thud', 0.0, 0.55), ('thud', 0.18, 0.5), ('thud', 0.33, 0.95), ('thud', 0.48, 0.5), ('boing', 0.75, 0.65, 0.8),
    ('whoosh', 1.58, 0.45, 0.85, 6000, 400),
    ('pop', 2.0, 0.45), ('pop', 2.22, 0.35), ('pop', 2.32, 0.35), ('pop', 2.42, 0.35), ('thud', 2.55, 1.0),
    ('boing', 2.85, 0.55, 0.6), ('whoosh', 3.58, 0.45, 0.85, 6000, 400),
    ('whoosh', 7.6, 0.6, 0.7), ('pop', 9.05, 0.6), ('pop', 9.95, 0.6), ('pop', 10.95, 0.6),
    ('whoosh', 15.7, 0.5, 0.6), ('thud', 16.15, 0.5), ('thud', 16.27, 0.5), ('thud', 16.42, 0.8), ('buzz', 17.0, 0.5),
    ('whoosh', 16.9, 0.55, 0.6), ('pop', 17.75, 0.45),
    ('whoosh', 21.6, 0.5, 0.6), ('pop', 22.65, 0.5), ('shimmer', 23.05, 0.5), ('pop', 23.25, 0.45),
    *end_sfx(28.0),
]
