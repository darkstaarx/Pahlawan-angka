"""Promo 4 — gaya pelancaran "Muse": kanvas bersih, UI sebenar terapung, zoom-tembus, ikon sebaris (54 s).

Koordinat dunia = piksel skrin apabila kamera (cx 540, cy 960, z 1).
Muzik 120 BPM (1 bar = 2 s): drop tepat pada serangan (30 s) dan Evolusi Bara (40 s), outro pada kad akhir (50 s).
"""
import os
from muse import (Img, Vid, Line, Bubble, Check, Burst, Confetti, Panel, Tap, asset, rounded, rich_img,
                  INK, BLUE, BUILD)

DURATION = 54.0
WHITE = (255, 255, 255)
GOLD = (214, 158, 24)
YELLOW = (255, 205, 60)
NAVY = (14, 22, 54)

ICON = rounded(asset('assets/icons/pa-master-1024.png', 520), 116)
ICON_S = rounded(asset('assets/icons/pa-master-1024.png', 220), 50)
PDF = os.path.join(BUILD, 'pdf_ws-1.png')

OBJ = ['assets/questions/money/money_10sen.png', 'assets/missions/v2/kiraan.webp', 'assets/questions/counting/apple.png',
       'assets/ui/star-earned-v1.webp', 'assets/questions/money/money_rm5.png', 'assets/missions/v2/masa.webp',
       'assets/questions/counting/rambutan.png', 'assets/enemies/minions/pigiramid.webp', 'assets/questions/money/money_50sen.png',
       'assets/missions/v2/pecahan.webp', 'assets/questions/counting/watermelon_slice.png', 'assets/ui/trophies-v1/bintang-sempurna.png',
       'assets/questions/counting/orange.png', 'assets/missions/v2/wang.webp', 'assets/questions/money/money_rm1.png',
       'assets/enemies/minions/askabus.webp', 'assets/questions/counting/starfruit_slice.png', 'assets/missions/v2/ruang.webp',
       'assets/fx/reward/coin-v1.webp', 'assets/questions/counting/balloon.png', 'assets/missions/v2/tambah-tolak.webp',
       'assets/questions/money/money_20sen.png', 'assets/enemies/minions/syilinggit.webp', 'assets/questions/counting/pencil.png',
       'assets/missions/v2/ukuran.webp', 'assets/ui/trophies-v1/yakin-sendiri.png', 'assets/questions/counting/candy.png',
       'assets/missions/v2/data.webp', 'assets/questions/money/money_rm10.png', 'assets/enemies/minions/wipening.webp']

PETS = ['assets/pets/collection/ketupat-kura/idle.png', 'assets/pets/collection/kumbang-manggis/idle.png',
        'assets/pets/collection/harimau-bunga/idle.png', 'assets/pets/collection/arnab-kek-lapis/idle.png',
        'assets/pets/collection/durian-kerbau/idle.png']


def words(t, text, gap=0.14, **opt):
    """'a b c' → token bermasa satu perkataan demi satu."""
    return [(t + i * gap, w, opt) for i, w in enumerate(text.split())]


def cam(*keys):
    return list(keys)


# ---------------------------------------------------------------- babak

SCENES = []

# S1 0–2.6: ikon app → letupan objek
SCENES.append(dict(t0=0.0, bg='light', cam=cam((0, dict(z=1.0)), (2.6, dict(z=1.1), 'linear')), els=[
    Burst(OBJ, 0.65, 2.55, 540, 960, cols=5, rows=9, cell=215, size=150, seed=7, hole=(250, 690, 830, 1230)),
    Img(ICON, 0.1, 2.6, [(0.1, dict(x=540, y=960, s=0.78)), (0.7, dict(s=0.7), 'back'), (2.6, dict(s=0.76))], shadow=0.9, pop=0.5),
]))

# S2 2.6–5.2: Memperkenalkan / Pahlawan Angka
SCENES.append(dict(t0=2.6, bg='light', cam=cam((2.6, dict(z=1.0)), (5.2, dict(z=1.05), 'linear')), els=[
    Line([(2.75, 'Memperkenalkan')], 540, 880, 64, 5.1, color=(96, 104, 124), weight='InterDisplay-SemiBold.otf'),
    Line([(3.2, 'Pahlawan'), (3.35, 'Angka', dict(color=BLUE))], 540, 1000, 112, 5.1),
]))

# S3 5.2–9.6: ayat dengan ikon sebaris → zoom-tembus ke Wira
SCENES.append(dict(t0=5.2, bg='light', cam=cam((5.2, dict(z=1.0)), (8.9, dict(z=1.06), 'linear'),
                                                  (9.6, dict(cx=600, cy=1150, z=5.0), 'in')), els=[
    Line([*words(5.35, 'Pahlawan Angka'), (5.65, ('i', ICON_S), dict(icon=1.05)), (5.8, 'ialah')], 540, 740, 84, 9.6, out=0),
    Line([(6.15, 'pengembaraan'), (6.35, ('i', 'assets/missions/v2/kiraan.webp'), dict(icon=1.35))], 540, 870, 84, 9.6, out=0),
    Line([(6.75, 'matematik'), (6.95, ('i', 'assets/ui/star-earned-v1.webp'), dict(icon=1.1)), (7.1, 'KSSR', dict(color=BLUE))],
         540, 1000, 84, 9.6, out=0),
    Line([*words(7.5, 'untuk anak'), (7.8, ('i', 'assets/heroes/wira-chibi/frames/happy-05-v2.webp'), dict(icon=1.6)), (8.0, 'anda.')],
         540, 1140, 84, 9.6, out=0),
]))

# S4a 9.6–11.2: soalan sebenar terapung → zoom ke teks soalan
Q_X, Q_Y, Q_S = 540, 860, 0.8
WIRA = 'assets/heroes/wira-chibi/frames/happy-05-v2.webp'
SCENES.append(dict(t0=9.6, bg='light', cam=cam((9.6, dict(z=1.0)), (10.55, dict(z=1.04), 'linear'),
                                                  (11.2, dict(cx=540, cy=630, z=2.7), 'in')), els=[
    Img('muse/q_neutral.png', 9.65, 11.2, [(9.65, dict(x=Q_X, y=Q_Y, s=Q_S, r=-1.5)), (10.6, dict(r=0))], shadow=0.8, out=0),
    Img(WIRA, 9.9, 11.2, [(9.9, dict(x=215, y=1560, s=0.44))], size=900, shadow=0.4, out=0),
    Bubble('Jom jawab!', 10.1, 11.2, 330, 1490, size=44, align='l'),
]))

# S4b 11.2–13.6: teks soalan gergasi, kamera menyorot
BIG = rich_img([[('Wang sebanyak', INK)], [('RM41.25', BLUE), (' dibahagi', INK)], [('sama rata kepada', INK)],
                [('5 orang', BLUE), ('. Berapa', INK)], [('setiap orang dapat?', INK)]], 138)
SCENES.append(dict(t0=11.2, bg='light', cam=cam((11.2, dict(cx=420, cy=900, z=1.25)), (13.0, dict(cx=640, cy=1010, z=1.08), 'linear'),
                                                   (13.6, dict(cx=640, cy=1040, z=0.9), 'in')), els=[
    Img(BIG, 11.2, 13.6, [(11.2, dict(x=540, y=960, s=0.9, a=0.0)), (11.45, dict(s=1.0, a=1.0), 'out')], shadow=0, pop=0, out=0.15),
]))

# S4c 13.6–17.6: zoom keluar → tekan RM8.25 → Betul! ✓
SCENES.append(dict(t0=13.6, bg='light', cam=cam((13.6, dict(cx=540, cy=640, z=2.3)), (14.1, dict(cx=540, cy=960, z=1.0), 'out'),
                                                   (16.95, dict(z=1.04), 'linear'), (17.6, dict(cx=470, cy=1520, z=5.0), 'in')), els=[
    Img('muse/q_neutral.png', 13.6, 14.45, [(13.6, dict(x=Q_X, y=Q_Y, s=Q_S))], shadow=0.8, pop=0, out=0),
    Img('muse/q_correct.png', 14.45, 17.6, [(14.45, dict(x=Q_X, y=Q_Y, s=Q_S * 0.965)), (14.75, dict(s=Q_S), 'back')],
        shadow=0.8, pop=0, out=0),
    Tap(14.22, 348, 1214, dur=0.3),
    Img(WIRA, 13.6, 14.75, [(13.6, dict(x=215, y=1560, s=0.44))], size=900, shadow=0.4, pop=0, out=0.12),
    Img('assets/heroes/wira-chibi/frames/victory-v1.webp', 14.65, 17.6, [(14.65, dict(x=215, y=1545, s=1.35))], shadow=0.4, pop=0.4, out=0),
    Check(14.75, 17.6, 450, 1520, r=46),
    Bubble('Betul!  Kunci retak.', 14.95, 17.6, 515, 1520, size=44, align='l', type_speed=0.03),
]))

# S5 17.6–25.6: templat "Matematik yang / [ikon] … / untuk anak anda."
SLOTS = [
    ('assets/coach/cikgu-dimensi/hub-portrait-v1.webp', 'ikut kemampuan', 1.45),
    ('assets/missions/v2/tambah-tolak.webp', 'jadi pengembaraan', 1.35),
    ('assets/enemies/minions/askabus.webp', 'ada cabaran', 1.5),
    ('assets/ui/star-earned-v1.webp', 'beri ganjaran', 1.15),
    ('assets/pets/aurora/front.webp', 'ada teman', 1.5),
    (PDF, 'boleh dicetak', 1.4),
]
slot_els = []
for i, (ic, txt, isz) in enumerate(SLOTS):
    t = 18.3 + i * 1.2
    last = i == len(SLOTS) - 1
    slot_els.append(Line([(t, ('i', ic), dict(icon=isz)), *words(t + 0.1, txt, 0.1, color=BLUE)], 540, 960, 92,
                         25.55 if last else t + 1.35, out=0.25 if not last else 0.3, exit_up=0 if last else 70))
SCENES.append(dict(t0=17.6, bg='light', cam=cam((17.6, dict(z=1.0)), (25.6, dict(z=1.06), 'linear')), els=[
    Line(words(17.75, 'Matematik yang'), 540, 790, 80, 25.55, color=(70, 76, 96)),
    *slot_els,
    Line(words(18.0, 'untuk anak anda.'), 540, 1135, 80, 25.55, color=(70, 76, 96)),
]))

# S6a 25.6–29.3: 3 fokus dipilih ikut jawapan → tekan Latih → panel navy
FC = [(800, -1.5), (1062, 1.2), (1322, -0.8)]
SCENES.append(dict(t0=25.6, bg='light', cam=cam((25.6, dict(z=1.0)), (28.5, dict(z=1.04), 'linear')), els=[
    Line(words(25.75, 'Fokus latihan dipilih'), 540, 420, 76, 29.3, out=0),
    Line(words(26.1, 'ikut jawapan anak.', color=BLUE), 540, 525, 76, 29.3, out=0),
    *[Img(f'muse/focus{i + 1}.png', 26.4 + i * 0.25, 29.3, [(26.4, dict(x=540, y=y, s=0.86, r=r))], shadow=0.7, bob=4, out=0)
      for i, (y, r) in enumerate(FC)],
    Tap(28.55, 803, 800, color=WHITE),
    Panel(28.8, 29.3, 803, 800, 150, 80, NAVY, grow=0.5),
]))

# S6b 29.3–34.0: (gelap) setiap jawapan betul jadi serangan — rakaman sebenar Jurus Penamat
SCENES.append(dict(t0=29.3, bg='dark', cam=cam((29.3, dict(z=1.0)), (34.0, dict(z=1.05), 'linear')), els=[
    Line(words(29.4, 'Setiap jawapan betul'), 540, 300, 78, 33.95, color=WHITE, out=0.2),
    Line(words(29.75, 'jadi serangan!', color=YELLOW), 540, 410, 78, 33.95, color=WHITE, out=0.2),
    Vid('src_C.mp4', (0.0, 0.0, 1.0, 0.372), 30.0, 33.95, [(12.35, 16.3, 3.95)],
        [(30.0, dict(x=540, y=1040, s=1.0)), (33.95, dict(s=1.05), 'linear')], width=980, radius=44, shadow=0.0),
    Bubble('Teman baharu ditemui!', 33.15, 33.95, 540, 1570, size=44, fill=YELLOW, type_speed=0.025),
]))

# S7 34.0–38.0: tiga tahap kunci → Kunci Emas: taip jawapan sendiri
SEG = [('gangsa', 'Gangsa', (236, 150, 96), 200), ('perak', 'Perak', (196, 206, 224), 540), ('emas', 'Emas', YELLOW, 880)]
seg_els = []
for i, (k, name, col, x) in enumerate(SEG):
    t = 34.4 + i * 0.2
    if k == 'emas':
        keys = [(t, dict(x=x, y=900, s=0.4)), (35.7, dict()), (36.2, dict(x=540, y=850, s=0.82), 'back')]
        t1 = 38.0
    else:
        keys = [(t, dict(x=x, y=900, s=0.4)), (35.7, dict()), (36.0, dict(s=0.25, a=0.0), 'in')]
        t1 = 36.05
    seg_els.append(Img(f'assets/fx/segel/{k}-v2.png', t, t1, keys, size=700, shadow=0.3, bob=5, out=0))
    seg_els.append(Line([(t + 0.1, name, dict(color=col))], x, 1120, 52, 35.75, out=0.2))
SCENES.append(dict(t0=34.0, bg='dark', cam=cam((34.0, dict(z=1.0)), (37.4, dict(z=1.04), 'linear'),
                                                   (38.0, dict(cx=540, cy=860, z=4.0), 'in')), els=[
    Line(words(34.15, 'Tiga tahap kunci'), 540, 520, 84, 35.75, color=WHITE, out=0.25, exit_up=60),
    *seg_els,
    Line([(36.2, 'Kunci'), (36.32, 'Emas', dict(color=YELLOW))], 540, 1290, 84, 38.0, color=WHITE, out=0),
    Bubble('taip jawapan sendiri', 36.55, 38.0, 540, 1420, size=46, fill=(226, 236, 255), type_speed=0.04),
]))

# S8 38.0–44.0: teman membesar → EVOLUSI BARA (drop 40 s) → kumpul 6 teman
BARA = 'assets/pets/evolution/fire/aurora/happy-v1.webp'
RING = [(540 + 330 * c, 1080 + 330 * s) for c, s in [(0, -1), (0.866, -0.5), (0.866, 0.5), (0, 1), (-0.866, 0.5), (-0.866, -0.5)]]
SCENES.append(dict(t0=38.0, bg='light', cam=cam((38.0, dict(z=1.0)), (39.9, dict(z=1.08), 'linear'), (40.0, dict(z=1.0)),
                                                   (41.8, dict(z=1.03), 'linear'), (42.4, dict(z=1.0))), els=[
    Line(words(38.15, 'Teman pun membesar'), 540, 430, 80, 41.7, out=0.25, exit_up=60),
    Img('assets/pets/aurora/front.webp', 38.25, 40.0, [(38.25, dict(x=540, y=1000, s=0.6)), (39.3, dict()),
                                                        (39.95, dict(s=0.66), 'in')], shadow=0.5, bob=6, out=0.1),
    Img('assets/ui/evolution/emblem-bara-v1.png', 39.25, 40.02, [(39.25, dict(x=540, y=990, s=0.9)), (39.95, dict(s=1.05), 'in')],
        size=560, shadow=0.4, pop=0.3, out=0.05),
    Confetti(40.0, 43.8, n=150),
    Img(BARA, 40.0, 44.0, [(40.0, dict(x=540, y=1000, s=1.25)), (41.8, dict()), (42.35, dict(x=RING[0][0], y=RING[0][1], s=0.56), 'smooth')],
        shadow=0.5, pop=0.45, bob=6, out=0),
    Bubble('Evolusi Bara!', 40.35, 41.75, 540, 1350, size=50, fill=(255, 228, 206), color=(196, 64, 20), type_speed=0.04),
    Line([*words(42.0, 'Kumpul semua'), (42.3, '6', dict(color=BLUE)), (42.42, 'teman', dict(color=BLUE))], 540, 430, 80, 44.0, out=0),
    *[Img(p, 42.25 + i * 0.12, 44.0, [(42.25, dict(x=RING[i + 1][0], y=RING[i + 1][1]))], size=250, shadow=0.4, bob=5, out=0)
      for i, p in enumerate(PETS)],
]))

# S9 44.0–47.6: ibu bapa nampak kemajuan
SCENES.append(dict(t0=44.0, bg='light', cam=cam((44.0, dict(z=1.04)), (47.6, dict(z=1.0), 'linear')), els=[
    Line(words(44.15, 'Mak ayah pun nampak'), 540, 380, 76, 47.55, out=0.2),
    Line(words(44.5, 'kemajuan anak.', color=BLUE), 540, 482, 76, 47.55, out=0.2),
    Img('muse/report.png', 44.65, 47.55, [(44.65, dict(x=540, y=748, s=0.86, r=-1.2))], shadow=0.7, bob=4, out=0.2),
    Img('muse/fokus_seterusnya.png', 44.9, 47.55, [(44.9, dict(x=540, y=1010, s=0.86, r=1.0))], shadow=0.7, bob=4, out=0.2),
    Img('muse/lock.png', 45.15, 47.55, [(45.15, dict(x=300, y=1420, s=0.37, r=-4))], shadow=0.8, bob=5, out=0.2),
    Img(PDF, 45.4, 47.55, [(45.4, dict(x=785, y=1420, s=0.3, r=4))], shadow=0.8, bob=5, out=0.2),
    Bubble('Laporan kemahiran', 45.0, 47.55, 540, 575, size=34, fill=(226, 236, 255), type_speed=0),
    Bubble('Kunci battle', 45.3, 47.55, 300, 1680, size=34, fill=(226, 236, 255), type_speed=0),
    Bubble('Worksheet PDF', 45.55, 47.55, 785, 1680, size=34, fill=(226, 236, 255), type_speed=0),
]))

# S10 47.6–50.0: medan ikon + slogan → panel gelap
SCENES.append(dict(t0=47.6, bg='light', cam=cam((47.6, dict(z=1.1)), (50.0, dict(z=1.0), 'linear')), els=[
    Burst(OBJ[::-1], 47.6, 50.0, 540, 960, cols=5, rows=9, cell=215, size=150, seed=3, hole=(150, 730, 930, 1190), collapse=49.35),
    Line([(47.85, 'Belajar.')], 540, 850, 100, 49.6, out=0.2),
    Line([(48.25, 'Bertarung.')], 540, 965, 100, 49.6, out=0.2),
    Line([(48.65, 'Jadi'), (48.75, 'Pahlawan.', dict(color=BLUE))], 540, 1080, 100, 49.6, out=0.2),
    Panel(49.5, 50.0, 540, 960, 60, 60, NAVY, grow=0.48, radius=30),
]))

# S11 50.0–54.0: kad akhir gelap
SCENES.append(dict(t0=50.0, bg='dark', cam=cam((50.0, dict(z=1.0)), (54.0, dict(z=1.04), 'linear')), els=[
    Img('assets/branding/pahlawan-angka-full-logo-v1.png', 50.05, 54.0, [(50.05, dict(x=540, y=770, s=0.6))], shadow=0.0, pop=0.55,
        bob=4, out=0),
    Line(words(50.7, 'Pengembaraan matematik', 0.12), 540, 1190, 60, 54.0, color=WHITE, weight='InterDisplay-SemiBold.otf', out=0),
    Line(words(51.0, 'ikut kemampuan anak.', 0.12), 540, 1272, 60, 54.0, color=(200, 214, 245), weight='InterDisplay-SemiBold.otf', out=0),
    Bubble('Cuba Demo Sekarang', 51.6, 54.0, 540, 1480, size=58, fill=YELLOW, color=INK, type_speed=0),
]))

FADES = [(2.6, 0.18, (246, 247, 250)), (9.6, 0.16, (246, 247, 250)), (11.2, 0.14, (246, 247, 250)),
         (17.6, 0.16, (246, 247, 250)), (25.6, 0.16, (246, 247, 250)), (34.0, 0.14, NAVY),
         (38.0, 0.2, (246, 247, 250)), (40.0, 0.2, (255, 250, 236)), (44.0, 0.16, (246, 247, 250))]

# ---------------------------------------------------------------- audio

BAR = 2.0
MUSIC = [('intro', 0, 2), ('light', 2, 3), ('groove', 5, 8), ('build', 13, 2), ('drop', 15, 2), ('groove', 17, 2),
         ('break', 19, 1), ('drop', 20, 2), ('light', 22, 2), ('groove', 24, 1), ('outro', 25, 2)]
SOURCES_AUDIO = {'C': 'aud_C.wav'}


def pops(ts, g=0.3):
    return [('pop', t, g) for t in ts]


SFX = [
    ('pop', 0.1, 0.55), ('whoosh', 0.62, 0.55, 0.7, 500, 5000), ('shimmer', 0.75, 0.4), ('whoosh', 2.35, 0.4, 0.5, 6000, 500),
    ('pop', 2.75, 0.3), ('pop', 3.2, 0.4), ('pop', 3.35, 0.4),
    *pops([5.35, 5.65, 6.15, 6.35, 6.75, 6.95, 7.1, 7.5, 7.8, 8.0], 0.26),
    ('whoosh', 9.0, 0.6, 0.7, 400, 6000),
    ('pop', 9.65, 0.45), ('pop', 9.9, 0.35), ('pop', 10.1, 0.3),
    ('whoosh', 10.65, 0.55, 0.7, 400, 6000), ('whoosh', 13.4, 0.5, 0.6, 6000, 400),
    ('pop', 14.22, 0.6), ('shimmer', 14.55, 0.55), ('pop', 14.75, 0.45), ('pop', 14.95, 0.3),
    ('whoosh', 17.0, 0.6, 0.7, 400, 6000),
    *pops([17.75, 18.0], 0.28), *pops([18.3 + i * 1.2 for i in range(6)], 0.42),
    *[('whoosh', 18.3 + i * 1.2 - 0.12, 0.3, 0.22, 3000, 800) for i in range(1, 6)],
    *pops([25.75, 26.1], 0.28), *pops([26.4, 26.65, 26.9], 0.45),
    ('pop', 28.55, 0.6), ('whoosh', 28.75, 0.55, 0.75, 300, 4000),
    ('src', 30.0, 'C', 12.35, 16.3, 0.8), ('pop', 33.15, 0.35),
    *pops([34.15, 34.4, 34.6, 34.8], 0.38), ('whoosh', 35.65, 0.45, 0.5), ('pop', 36.2, 0.45),
    *pops([36.75 + i * 0.16 for i in range(10)], 0.12),
    ('whoosh', 37.45, 0.55, 0.6, 400, 6000),
    ('pop', 38.25, 0.4), ('thud', 39.25, 0.7), ('shimmer', 40.0, 0.7), ('pop', 40.35, 0.4),
    ('whoosh', 41.8, 0.45, 0.45), *pops([42.25 + i * 0.12 for i in range(5)], 0.35),
    *pops([44.15, 44.65, 44.9, 45.15, 45.4], 0.38),
    ('whoosh', 47.55, 0.5, 0.6, 500, 5000), *pops([47.85, 48.25, 48.65], 0.45), ('whoosh', 49.3, 0.6, 0.7, 5000, 300),
    ('pop', 51.6, 0.5), ('shimmer', 51.65, 0.45),
]
