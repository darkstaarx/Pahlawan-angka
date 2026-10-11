"""Promo 4 v2 — gaya pelancaran "Muse" dengan gameplay sebenar sebagai teras (56 s).

Koordinat dunia = piksel skrin apabila kamera (cx 540, cy 960, z 1).
Hampir setiap babak ialah kad video rakaman sebenar yang terapung; transisi Muse (letupan jubin, ikon/klip
sebaris dalam ayat, zoom-tembus, templat slot, butang → skrin penuh) menyambungkan babak.
Muzik 120 BPM (1 bar = 2 s): drop pada Jurus Penamat (16 s) dan Evolusi Bara (40 s), outro pada kad akhir (52 s).
"""
from muse import (Img, Vid, Tiles, Line, Bubble, Check, Confetti, Panel, Tap, asset, rounded, rich_img, INK, BLUE)

DURATION = 56.0
WHITE = (255, 255, 255)
YELLOW = (255, 205, 60)
NAVY = (14, 22, 54)
LIGHT = (246, 247, 250)

ICON_S = rounded(asset('assets/icons/pa-master-1024.png', 220), 50)
ICON = rounded(asset('assets/icons/pa-master-1024.png', 520), 116)

# kawasan potongan rakaman telefon 1080×2236 (pecahan)
ARENA = (0.0, 0.0, 1.0, 0.372)       # pengepala + arena battle
QPANEL = (0.0, 0.395, 1.0, 0.885)    # kad soalan + jawapan
GAME = (0.0, 0.0, 1.0, 0.885)        # skrin permainan tanpa bar bawah
SQ_ARENA = (0.1, 0.0, 0.9, 0.386)    # jubin segi empat: arena
SQ_Q = (0.0, 0.40, 1.0, 0.883)       # jubin segi empat: soalan


def sq(v0):
    return (0.0, v0, 1.0, v0 + 0.483)


def words(t, text, gap=0.14, **opt):
    return [(t + i * gap, w, opt) for i, w in enumerate(text.split())]


def cam(*keys):
    return list(keys)


SCENES = []

# ---------------------------------------------------------------- S1 0–2.4: ikon app → letupan jubin gameplay hidup
GRID = [(195, 270), (540, 270), (885, 270), (195, 615), (540, 615), (885, 615), (195, 960), (885, 960),
        (195, 1305), (540, 1305), (885, 1305), (195, 1650), (540, 1650), (885, 1650)]
TILES1 = [('src_O.mp4', SQ_ARENA, 62.6), ('src_C.mp4', SQ_ARENA, 12.3), ('src_K.mp4', sq(0.2), 13.2),
          ('src_B.mp4', SQ_Q, 18.0), ('src_B.mp4', sq(0.18), 6.0), ('src_A.mp4', sq(0.08), 0.5),
          ('src_T.mp4', sq(0.12), 2.0), ('src_O.mp4', SQ_ARENA, 91.4),
          ('src_K.mp4', sq(0.1), 2.2), ('src_C.mp4', SQ_ARENA, 13.8), ('src_R.mp4', sq(0.1), 4.3),
          ('src_O.mp4', SQ_ARENA, 81.6), ('src_K.mp4', sq(0.12), 16.2), ('src_O.mp4', SQ_ARENA, 119.6)]
SCENES.append(dict(t0=0.0, bg='light', cam=cam((0, dict(z=1.04)), (2.4, dict(z=1.12), 'linear')), els=[
    Tiles(TILES1, GRID, 0.3, 2.4, 540, 960, size=300, collapse=1.95),
    Img(ICON, 0.05, 2.4, [(0.05, dict(x=540, y=960, s=0.62)), (0.45, dict(s=0.56), 'back'), (1.95, dict()), (2.35, dict(s=0.7), 'in')],
        shadow=0.9, pop=0.45, out=0.1),
]))

# ---------------------------------------------------------------- S2 2.4–4.2: Memperkenalkan / [ikon] Pahlawan Angka
SCENES.append(dict(t0=2.4, bg='light', cam=cam((2.4, dict(z=1.0)), (4.2, dict(z=1.05), 'linear')), els=[
    Line([(2.5, 'Memperkenalkan')], 540, 880, 62, 4.1, color=(96, 104, 124), weight='InterDisplay-SemiBold.otf'),
    Line([(2.85, ('i', ICON_S), dict(icon=1.0)), (3.0, 'Pahlawan'), (3.15, 'Angka', dict(color=BLUE))], 540, 1000, 104, 4.1),
]))

# ---------------------------------------------------------------- S3 4.2–8.0: ayat dengan klip hidup sebaris → zoom-tembus ke battle
L3a = Line([(4.35, 'Pengembaraan'), (4.6, ('vid', 'src_B.mp4', (0.1, 0.18, 0.9, 0.58), 5.7, 0.6), dict(icon=1.6))], 540, 775, 86, 8.0, out=0)
L3b = Line([(5.0, 'matematik'), (5.25, ('vid', 'src_C.mp4', ARENA, 7.55), dict(icon=1.6)), (5.5, 'KSSR', dict(color=BLUE))],
           540, 950, 86, 8.0, out=0)
L3c = Line(words(5.9, 'Darjah 1 hingga 6.', 0.13), 540, 1115, 86, 8.0, out=0)
BX, BY, BW = L3b.centers()[1]
Z_IN = 1026 / BW
SCENES.append(dict(t0=4.2, bg='light', cam=cam((4.2, dict(z=1.0)), (7.2, dict(z=1.05), 'linear'),
                                                  (8.0, dict(cx=BX, cy=BY, z=Z_IN), 'in')), els=[L3a, L3b, L3c]))

# ---------------------------------------------------------------- S4 8.0–16.0: UI battle dipisahkan (arena + soalan hidup)
AW, QW = 900, 820
AY, QY = 455, 1310
QTOP = QY - QW * (0.885 - 0.395) * 2236 / 1080 / 2        # tepi atas kad soalan (dunia)
QH = QW * (0.885 - 0.395) * 2236 / 1080
TEXT_Y = QTOP + (0.495 - 0.395) / 0.49 * QH
PAGI = (540 + (0.67 - 0.5) * QW, QTOP + (0.806 - 0.395) / 0.49 * QH)

# S4a 8.0–10.0: mula sebesar klip sebaris, tarik keluar → zoom ke teks soalan
SCENES.append(dict(t0=8.0, bg='light', cam=cam((8.0, dict(cx=540, cy=AY, z=1026 / AW)), (8.75, dict(cx=540, cy=960, z=1.0), 'smooth'),
                                                  (9.35, dict(z=1.02), 'linear'), (10.0, dict(cx=540, cy=TEXT_Y, z=2.5), 'in')), els=[
    Vid('src_C.mp4', ARENA, 8.0, 10.0, [(10.4, 10.9, 1.6), (10.9, 10.9, 0.4)], [(8.0, dict(x=540, y=AY))], width=AW, radius=40,
        shadow=0.7, pop=False, out=0),
    Vid('src_C.mp4', QPANEL, 8.0, 10.0, [(10.4, 10.9, 1.6), (10.9, 10.9, 0.4)], [(8.0, dict(x=540, y=QY + 60, a=0.0)),
                                                                                  (8.6, dict(y=QY, a=1.0), 'out')],
        width=QW, radius=40, shadow=0.7, pop=False, out=0),
]))

# S4b 10.0–12.0: teks soalan gergasi, kamera menyorot
BIG = rich_img([[('Matahari baru', BLUE)], [('terbit', BLUE), (' dan murid', INK)], [('bersiap ke sekolah.', INK)],
                [('Waktu yang paling', INK)], [('sesuai?', INK)]], 140)
SCENES.append(dict(t0=10.0, bg='light', cam=cam((10.0, dict(cx=420, cy=900, z=1.25)), (11.45, dict(cx=640, cy=1010, z=1.08), 'linear'),
                                                   (12.0, dict(cx=640, cy=1040, z=0.9), 'in')), els=[
    Img(BIG, 10.0, 12.0, [(10.0, dict(x=540, y=960, s=0.9, a=0.0)), (10.25, dict(s=1.0, a=1.0), 'out')], shadow=0, pop=0, out=0.15),
]))

# S4c 12.0–16.0: zoom keluar → tekan "pagi" → Betul ✓ → Jurus Penamat, arena membesar
SCENES.append(dict(t0=12.0, bg='light', cam=cam((12.0, dict(cx=540, cy=TEXT_Y, z=2.2)), (12.5, dict(cx=540, cy=960, z=1.0), 'out'),
                                                   (14.2, dict()), (16.0, dict(cy=900, z=1.05), 'in')), els=[
    Vid('src_C.mp4', QPANEL, 12.0, 16.0, [(10.5, 14.5, 4.0)], [(12.0, dict(x=540, y=QY)), (14.1, dict()),
                                                              (14.9, dict(y=QY + 420, a=0.0, r=4), 'in')],
        width=QW, radius=40, shadow=0.7, pop=False, out=0),
    Vid('src_C.mp4', ARENA, 12.0, 16.0, [(10.5, 14.5, 4.0)], [(12.0, dict(x=540, y=AY)), (14.1, dict()),
                                                             (15.6, dict(y=760, s=1.15), 'smooth')],
        width=AW, radius=40, shadow=0.7, pop=False, out=0),
    Tap(13.15, *PAGI),
    Check(13.4, 14.4, 400, TEXT_Y + 250, r=46),
    Bubble('Betul!', 13.55, 14.4, 460, TEXT_Y + 250, size=46, align='l', type_speed=0.04),
]))

# ---------------------------------------------------------------- S5 16.0–19.6: (gelap) DROP — serangan & teman ditemui
SCENES.append(dict(t0=16.0, bg='dark', cam=cam((16.0, dict(z=1.06)), (16.5, dict(z=1.0), 'out'), (19.6, dict(z=1.03), 'linear')), els=[
    Vid('src_C.mp4', ARENA, 16.0, 19.6, [(14.5, 18.1, 3.6)], [(16.0, dict(x=540, y=760, s=1.15)), (19.25, dict()),
                                                            (19.6, dict(y=-520), 'in')],
        width=AW, radius=40, shadow=0.0, pop=False, out=0),
    Line(words(16.15, 'Setiap jawapan betul'), 540, 1330, 80, 19.5, color=WHITE, out=0.25),
    Line(words(16.5, 'jadi serangan!', color=YELLOW), 540, 1445, 80, 19.5, color=WHITE, out=0.25),
    Bubble('Teman baharu ditemui!', 17.25, 19.5, 540, 1610, size=44, fill=YELLOW, type_speed=0.025),
]))

# ---------------------------------------------------------------- S6 19.6–27.6: templat "Setiap topik / [ikon] X / jadi pengembaraan."
TOPICS = [
    ('assets/missions/v2/kiraan.webp', 'Nombor', 'src_O.mp4', (61.9, 63.7)),
    ('assets/missions/v2/wang.webp', 'Wang', 'src_B.mp4', (17.6, 19.0)),
    ('assets/missions/v2/masa.webp', 'Masa', 'src_O.mp4', (90.9, 92.5)),
    ('assets/missions/v2/ruang.webp', 'Ruang', 'src_O.mp4', (68.9, 70.4)),
    ('assets/missions/v2/data.webp', 'Data', 'src_O.mp4', (119.2, 120.8)),
    ('assets/missions/v2/pecahan.webp', '& banyak lagi', 'src_T.mp4', (1.7, 3.6)),
]
CW, CY, STEP = 580, 655, 1.3
topic_els = []
for i, (ic, name, src, (a, b)) in enumerate(TOPICS):
    t = 19.75 + i * STEP
    last = i == len(TOPICS) - 1
    t1 = 27.6 if last else t + STEP + 0.12
    keys = [(t - 0.05, dict(x=1380, y=CY, r=9)), (t + 0.25, dict(x=540, r=0), 'out')]
    if not last:
        keys += [(t + STEP - 0.15, dict()), (t + STEP + 0.12, dict(x=-300, r=-9), 'in')]
    topic_els.append(Vid(src, GAME, t - 0.05, t1, [(a, b, t1 - t + 0.05)], keys, width=CW, radius=34, shadow=0.75,
                         pop=False, out=0.2 if last else 0))
    topic_els.append(Line([(t, ('i', ic), dict(icon=1.35)), (t + 0.08, name, dict(color=BLUE))], 540, 1420, 96,
                          27.55 if last else t + STEP + 0.1, out=0.3 if last else 0.2, exit_up=0 if last else 60))
SCENES.append(dict(t0=19.6, bg='light', cam=cam((19.6, dict(z=1.0)), (27.6, dict(z=1.04), 'linear')), els=[
    *topic_els,
    Line(words(19.8, 'Setiap topik'), 540, 1285, 72, 27.55, color=(70, 76, 96)),
    Line(words(20.0, 'jadi pengembaraan.'), 540, 1555, 72, 27.55, color=(70, 76, 96)),
]))

# ---------------------------------------------------------------- S7 27.6–33.2: (gelap) Gangsa → Perak → Emas, rakaman hidup
TIERS = [('gangsa', 'Gangsa', (236, 150, 96), 'src_O.mp4', (68.95, 70.45), 27.6, 29.1),
         ('perak', 'Perak', (200, 210, 228), 'src_C.mp4', (7.3, 8.8), 29.1, 30.6),
         ('emas', 'Emas', YELLOW, 'src_O.mp4', (111.6, 114.3), 30.6, 33.2)]
tier_els = []
for k, name, col, src, (a, b), t0, t1 in TIERS:
    last = k == 'emas'
    tier_els.append(Vid(src, GAME, t0, t1, [(a, b, t1 - t0)],
                        [(t0, dict(x=540, y=1080, s=0.92)), (t0 + 0.3, dict(s=1.0), 'out')] +
                        ([] if last else [(t1 - 0.15, dict()), (t1, dict(s=0.9, a=0.0), 'in')]),
                        width=600, radius=36, shadow=0.0, pop=False, fade_in=0.12, out=0.25 if last else 0))
    tier_els.append(Line([(t0 + 0.05, ('i', f'assets/fx/segel/{k}-v2.png'), dict(icon=1.5)), (t0 + 0.12, 'Kunci', {}),
                          (t0 + 0.2, name, dict(color=col))], 540, 330, 84, t1 + 0.05, color=WHITE, out=0.15 if not last else 0.25))
SCENES.append(dict(t0=27.6, bg='dark', cam=cam((27.6, dict(z=1.0)), (33.2, dict(z=1.04), 'linear')), els=[
    Line(words(27.7, 'Tiga tahap kunci'), 540, 190, 46, 33.1, color=(150, 166, 204), weight='InterDisplay-SemiBold.otf'),
    *tier_els,
    Bubble('taip jawapan sendiri', 30.9, 33.15, 540, 1720, size=46, fill=(226, 236, 255), type_speed=0.04),
]))

# ---------------------------------------------------------------- S8 33.2–36.0: Khazanah — selamatkan & kumpul teman
SCENES.append(dict(t0=33.2, bg='light', cam=cam((33.2, dict(z=1.0)), (35.4, dict(z=1.04), 'linear'),
                                                   (36.0, dict(cy=1000, z=1.7), 'in')), els=[
    Line(words(33.3, 'Selamatkan &'), 540, 300, 80, 36.0, out=0),
    Line(words(33.6, 'kumpul teman.', color=BLUE), 540, 405, 80, 36.0, out=0),
    Vid('src_K.mp4', (0.0, 0.05, 1.0, 0.80), 33.35, 36.0, [(1.6, 4.25, 2.65)], [(33.35, dict(x=540, y=1100, r=-1.5)), (34.5, dict(r=0))],
        width=600, radius=36, shadow=0.75, out=0),
]))

# ---------------------------------------------------------------- S9 36.0–42.0: (gelap) EVOLUSI BARA — drop 40 s
SCENES.append(dict(t0=36.0, bg='dark', cam=cam((36.0, dict(z=1.0)), (39.9, dict(z=1.06), 'linear'), (40.0, dict(z=1.0)),
                                                   (42.0, dict(z=1.03), 'linear')), els=[
    Line(words(36.15, 'Teman pun membesar…'), 540, 215, 70, 41.9, color=WHITE, out=0.2),
    Vid('src_K.mp4', (0.0, 0.1, 1.0, 0.75), 36.0, 42.0, [(12.0, 17.6, 5.6), (17.6, 17.6, 0.4)], [(36.0, dict(x=540, y=1010))],
        width=900, radius=40, shadow=0.0, pop=False, fade_in=0.15, out=0.2),
    Confetti(40.0, 42.0, n=170),
    Bubble('Evolusi Bara!', 40.2, 41.9, 540, 1745, size=54, fill=(255, 228, 206), color=(196, 64, 20), type_speed=0.04),
]))

# ---------------------------------------------------------------- S10 42.0–46.4: ibu bapa — kad laporan, fokus & kunci hidup
SCENES.append(dict(t0=42.0, bg='light', cam=cam((42.0, dict(z=1.05)), (46.4, dict(z=1.0), 'linear')), els=[
    Line(words(42.15, 'Mak ayah pun nampak'), 540, 290, 72, 46.35, out=0.2),
    Line(words(42.5, 'kemajuan anak.', color=BLUE), 540, 390, 72, 46.35, out=0.2),
    Vid('src_R.mp4', (0.0, 0.04, 1.0, 0.86), 42.5, 46.35, [(4.3, 6.8, 2.5), (6.8, 6.8, 1.35)], [(42.5, dict(x=285, y=1060, r=-2))],
        width=470, radius=30, shadow=0.75, out=0.2),
    Vid('src_F.mp4', (0.06, 0.1, 0.94, 0.84), 42.8, 46.35, [(0.2, 1.4, 1.2), (1.4, 1.4, 2.35)], [(42.8, dict(x=790, y=890, r=2))],
        width=420, radius=30, shadow=0.75, out=0.2),
    Vid('src_F.mp4', (0.03, 0.15, 0.97, 0.55), 43.1, 46.35, [(12.1, 12.5, 0.4), (12.5, 12.5, 2.85)], [(43.1, dict(x=770, y=1520, r=3))],
        width=480, radius=30, shadow=0.8, out=0.2),
    Bubble('Laporan kemahiran', 42.9, 46.35, 285, 1545, size=32, fill=(226, 236, 255), type_speed=0),
    Bubble('Fokus pilihan app', 43.2, 46.35, 790, 480, size=32, fill=(226, 236, 255), type_speed=0),
    Bubble('Kunci battle (PIN)', 43.5, 46.35, 770, 1775, size=32, fill=(226, 236, 255), type_speed=0),
]))

# ---------------------------------------------------------------- S11 46.4–49.0: semua skrin (audio rakaman dibisukan)
SCENES.append(dict(t0=46.4, bg='light', cam=cam((46.4, dict(z=1.04)), (49.0, dict(z=1.0), 'linear')), els=[
    Line([(46.5, 'Telefon,'), (46.7, 'laptop,'), (46.95, 'tablet,'), (47.2, 'TV.', dict(color=BLUE))], 540, 300, 76, 48.95, out=0.2),
    Vid('src_LAP.mp4', (0.0, 0.0, 1.0, 1.0), 46.7, 48.95, [(12.0, 14.25, 2.25)], [(46.7, dict(x=540, y=720, r=-1))],
        width=860, radius=26, shadow=0.75, out=0.2),
    Vid('src_TAB.mp4', (0.0, 0.0, 1.0, 1.0), 46.95, 48.95, [(24.0, 26.0, 2.0)], [(46.95, dict(x=290, y=1380, r=-2))],
        width=380, radius=26, shadow=0.75, out=0.2),
    Vid('src_TV1.mp4', (0.0, 0.15, 1.0, 0.75), 47.2, 48.95, [(0.5, 2.25, 1.75)], [(47.2, dict(x=770, y=1380, r=2))],
        width=440, radius=26, shadow=0.75, out=0.2),
]))

# ---------------------------------------------------------------- S12 49.0–52.0: slogan dalam medan jubin hidup → panel gelap
GRID2 = [(195, 270), (540, 270), (885, 270), (195, 600), (885, 600), (195, 1320), (885, 1320), (195, 1650), (540, 1650), (885, 1650)]
TILES2 = [('src_C.mp4', SQ_ARENA, 13.6), ('src_K.mp4', sq(0.12), 16.4), ('src_O.mp4', SQ_ARENA, 92.0), ('src_B.mp4', sq(0.18), 6.6),
          ('src_O.mp4', SQ_ARENA, 120.0), ('src_K.mp4', sq(0.1), 3.0), ('src_C.mp4', SQ_Q, 11.0), ('src_A.mp4', sq(0.08), 1.5),
          ('src_O.mp4', SQ_ARENA, 63.0), ('src_T.mp4', sq(0.12), 3.0)]
SCENES.append(dict(t0=49.0, bg='light', cam=cam((49.0, dict(z=1.1)), (52.0, dict(z=1.0), 'linear')), els=[
    Tiles(TILES2, GRID2, 49.0, 52.0, 540, 960, size=290, collapse=51.15, seed=8),
    Line([(49.25, 'Belajar.')], 540, 830, 100, 51.3, out=0.2),
    Line([(49.65, 'Bertarung.')], 540, 950, 100, 51.3, out=0.2),
    Line([(50.05, 'Jadi'), (50.15, 'Pahlawan.', dict(color=BLUE))], 540, 1070, 100, 51.3, out=0.2),
    Panel(51.5, 52.0, 540, 960, 60, 60, NAVY, grow=0.48, radius=30),
]))

# ---------------------------------------------------------------- S13 52.0–56.0: kad akhir gelap
SCENES.append(dict(t0=52.0, bg='dark', cam=cam((52.0, dict(z=1.0)), (56.0, dict(z=1.04), 'linear')), els=[
    Img('assets/branding/pahlawan-angka-full-logo-v1.png', 52.05, 56.0, [(52.05, dict(x=540, y=770, s=0.6))], shadow=0.0, pop=0.55,
        bob=4, out=0),
    Line(words(52.7, 'Pengembaraan matematik', 0.12), 540, 1190, 60, 56.0, color=WHITE, weight='InterDisplay-SemiBold.otf', out=0),
    Line(words(53.0, 'ikut kemampuan anak.', 0.12), 540, 1272, 60, 56.0, color=(200, 214, 245), weight='InterDisplay-SemiBold.otf', out=0),
    Bubble('Cuba Demo Sekarang', 53.6, 56.0, 540, 1480, size=58, fill=YELLOW, color=INK, type_speed=0),
]))

FADES = [(2.4, 0.18, LIGHT), (16.0, 0.12, WHITE), (19.6, 0.14, LIGHT), (27.6, 0.14, NAVY), (33.2, 0.16, LIGHT),
         (36.0, 0.18, NAVY), (40.0, 0.2, (255, 250, 236)), (42.0, 0.16, LIGHT), (46.4, 0.14, LIGHT), (49.0, 0.14, LIGHT)]
SHAKES = [(16.0, 0.45, 16), (17.15, 0.3, 8), (40.0, 0.5, 14)]

# ---------------------------------------------------------------- audio

MUSIC = [('intro', 0, 2), ('light', 2, 2), ('groove', 4, 3), ('build', 7, 1), ('drop', 8, 2), ('groove', 10, 6),
         ('light', 16, 2), ('break', 18, 2), ('drop', 20, 2), ('light', 22, 2), ('groove', 24, 2), ('outro', 26, 2)]
SOURCES_AUDIO = {'C': 'aud_C.wav', 'K': 'aud_K.wav'}


def pops(ts, g=0.3):
    return [('pop', t, g) for t in ts]


SFX = [
    ('pop', 0.05, 0.55), ('whoosh', 0.28, 0.55, 0.7, 500, 5000), *pops([0.35 + i * 0.03 for i in range(0, 14, 3)], 0.22),
    ('whoosh', 1.95, 0.45, 0.6, 5000, 400),
    ('pop', 2.5, 0.3), ('pop', 2.85, 0.45), ('pop', 3.0, 0.35), ('pop', 3.15, 0.35),
    *pops([4.35, 4.6, 5.0, 5.25, 5.5, 5.9, 6.03, 6.16, 6.29], 0.26),
    ('whoosh', 7.25, 0.75, 0.75, 400, 6000),
    ('whoosh', 9.4, 0.6, 0.6, 400, 6000), ('whoosh', 11.8, 0.5, 0.55, 6000, 400),
    ('src', 12.0, 'C', 10.5, 18.1, 0.8),
    ('pop', 13.15, 0.6), ('shimmer', 13.4, 0.5), ('pop', 13.55, 0.35),
    ('whoosh', 19.3, 0.45, 0.6, 3000, 600),
    *pops([19.8, 19.94, 20.0, 20.14], 0.25),
    *[('whoosh', 19.75 + i * 1.3 - 0.08, 0.32, 0.35, 900, 4000) for i in range(6)], *pops([19.75 + i * 1.3 + 0.05 for i in range(6)], 0.4),
    ('whoosh', 27.45, 0.4, 0.5), ('pop', 27.65, 0.45), ('pop', 29.15, 0.45), ('pop', 30.65, 0.45),
    *pops([31.1 + i * 0.12 for i in range(14)], 0.1),
    ('whoosh', 33.05, 0.4, 0.5), *pops([33.3, 33.45, 33.6, 33.75], 0.32), ('whoosh', 35.5, 0.55, 0.6, 400, 6000),
    ('src', 36.0, 'K', 12.0, 17.6, 0.75), ('shimmer', 40.0, 0.7), ('pop', 40.2, 0.4),
    *pops([42.15, 42.5, 42.8, 43.1], 0.38),
    ('whoosh', 46.3, 0.4, 0.5), *pops([46.5, 46.7, 46.95, 47.2], 0.42),
    ('whoosh', 48.9, 0.5, 0.6, 500, 5000), *pops([49.25, 49.65, 50.05], 0.45), ('whoosh', 51.05, 0.6, 0.7, 5000, 300),
    ('pop', 53.6, 0.5), ('shimmer', 53.65, 0.45),
]
