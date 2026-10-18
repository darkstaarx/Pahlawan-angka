"""Promo #7 "Adaptive" — 54 saat, 9:16, gaya tenang dan sinematik untuk ibu bapa.

Mesej: Pahlawan Angka faham anak. Bila anak salah, app tidak terus tukar topik: kemahiran yang sama
ditanya semula dengan soalan baharu dan cara yang berbeza, sehingga anak betul sendiri.

Sumber AD = adaptive.mp4 (rakaman pemilik, 620×1280, dinaikkan ke 1080×2236, 30 fps), bermula di Soalan 6:
  Soalan 9  Pecahan Wajar      model bar   salah 3/6 (11.4 s), salah 2/10 (14.4 s)
  Soalan 10 Pecahan Set Objek  set objek   salah 1/2 (17.4 s), salah 1/3 (18.4 s)
  Soalan 11 Bina Pecahan       ayat        betul 1/2 (21.2 s) → Betul! Kunci retak.
  Soalan 12 Pecahan            lorek       betul → Kunci EMAS pecah → Jurus Penamat → AURORA DITEMUI (31.6 s)
Soalan 9–11 ialah kemahiran yang sama (D2.3.1) — penjana soalan memutar mod
bar_model → object_set → verbal_part (questions/kssr-content-v3.11.js).
Kemudian sinematik JATUH → mini game Pecahan (G4 Kedai Kek, ⅓ = 3/9 → HEBAT) → 8 mini game lain ikut topik →
ringkasan pencapaian untuk mak ayah (R: Ringkasan Anak, profil Darjah 2) → penutup.
"""
import math

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from engine import Shot, Callout, EndScene, FullClip, VideoGrid, W, font, over, ease_out, ease_back, smooth
from timeline_main import R, Z, end_sfx
from timeline_az import WHITE

DURATION = 54.0

SOURCES = {'AD': 'src_AD.mp4', 'G4': 'src_G4.mp4', 'R': 'src_R.mp4'}
SOURCES_AUDIO = {'AD': 'aud_AD.wav', 'G4': 'aud_G4.wav', 'JATUH': 'aud_JATUH.wav'}

GOLD_TXT = (250, 196, 70)
RED = (232, 86, 96)
GREEN = (46, 190, 110)
AMBER = (245, 184, 61)
CARD = (14, 24, 62)


# ---------------------------------------------------------------- ikon & grafik
def _icon(kind, d, col):
    """Bulatan berwarna dengan simbol dilukis (tidak bergantung pada glyph fon)."""
    ss = 4
    im = Image.new('RGBA', (d * ss, d * ss), (0, 0, 0, 0))
    g = ImageDraw.Draw(im)
    g.ellipse([0, 0, d * ss - 1, d * ss - 1], fill=col + (255,))
    c, r, lw = d * ss / 2, d * ss * 0.24, int(d * ss * 0.11)
    white = (255, 255, 255, 255)
    if kind == 'x':
        g.line([(c - r, c - r), (c + r, c + r)], fill=white, width=lw)
        g.line([(c - r, c + r), (c + r, c - r)], fill=white, width=lw)
    elif kind == 'ok':
        g.line([(c - r * 1.05, c + r * 0.05), (c - r * 0.25, c + r * 0.8), (c + r * 1.1, c - r * 0.75)], fill=white, width=lw, joint='curve')
    elif kind == 'loop':
        g.arc([c - r * 1.15, c - r * 1.15, c + r * 1.15, c + r * 1.15], 40, 330, fill=white, width=lw)
        a = math.radians(40)
        tx, ty = c + r * 1.15 * math.cos(a), c + r * 1.15 * math.sin(a)
        g.polygon([(tx - lw * 1.3, ty - lw * 0.2), (tx + lw * 1.0, ty - lw * 0.9), (tx + lw * 0.3, ty + lw * 1.4)], fill=white)
    elif kind == 'q':
        f = font('InterDisplay-Black.otf', int(d * ss * 0.62))
        g.text((c, c + d * ss * 0.02), '?', font=f, fill=(14, 22, 54, 255), anchor='mm')
    return im.resize((d, d), Image.LANCZOS)


def _pill(label, state):
    """Pil jejak cubaan: ikon keadaan + label cara soalan."""
    f = font('Inter-ExtraBold.otf', 36)
    d, pad, h = 56, 22, 82
    w = int(12 + d + 14 + f.getlength(label) + 26)
    im = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    col = {'active': AMBER, 'bad': RED, 'ok': GREEN}[state]
    glow = Image.new('RGBA', im.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle([pad, pad + 6, pad + w, pad + h + 6], radius=h // 2, fill=(0, 0, 0, 120))
    im = Image.alpha_composite(im, glow.filter(ImageFilter.GaussianBlur(10)))
    g = ImageDraw.Draw(im)
    g.rounded_rectangle([pad, pad, pad + w, pad + h], radius=h // 2, fill=CARD + (240,), outline=col + (255,), width=3)
    ic = _icon({'active': 'q', 'bad': 'x', 'ok': 'ok'}[state], d, col)
    im.alpha_composite(ic, (pad + 12, pad + (h - d) // 2))
    g.text((pad + 12 + d + 14, pad + h / 2), label, font=f, fill=(255, 255, 255, 255), anchor='lm')
    return np.asarray(im, np.float32) / 255


class Trail:
    """Jejak cubaan untuk satu topik: pil muncul satu demi satu, kemudian bertukar ✗ / ✓."""

    def __init__(self, t0, t1, y, items):
        self.t0, self.t1, self.y, self.items, self.layer = t0, t1, y, items, 'front'
        self.imgs = [{s: _pill(lb, s) for s in ('active', 'bad', 'ok')} for lb, _, _, _ in items]

    def active(self, t):
        return self.t0 <= t <= self.t1

    def draw(self, out, t):
        a_all = 1 - smooth((t - (self.t1 - 0.4)) / 0.4)
        shown = [(i, it) for i, it in enumerate(self.items) if t >= it[1]]
        if not shown:
            return
        gap = -26
        ws = [self.imgs[i]['active'].shape[1] for i, _ in shown]
        # baris kekal di tengah; pil baharu menolak baris secara lembut
        total = sum(ws) + gap * (len(ws) - 1)
        x = (W - total) / 2
        for (i, (lb, tin, tres, ok)), w in zip(shown, ws):
            state = ('ok' if ok else 'bad') if t >= tres else 'active'
            im = self.imgs[i][state]
            k = ease_back((t - tin) / 0.5, 1.5)
            pop = 1 + 0.12 * math.sin(min(1.0, max(0.0, (t - tres) / 0.4)) * math.pi) if t >= tres else 1.0
            sc = max(0.05, min(1.2, k) * pop)
            im2 = cv2.resize(im, None, fx=sc, fy=sc, interpolation=cv2.INTER_LINEAR) if abs(sc - 1) > 1e-3 else im
            over(out, im2, int(x + (w - im2.shape[1]) / 2), int(self.y - im2.shape[0] / 2), min(1.0, k) * a_all)
            x += w + gap


class Steps:
    """Kad penerangan cara app menyesuaikan soalan (masuk satu demi satu)."""

    def __init__(self, t0, t1, items, y0=720, gap=236):
        self.t0, self.t1, self.items, self.y0, self.gap, self.layer = t0, t1, items, y0, gap, 'front'
        self.cards = [self._card(*it[:4]) for it in items]

    def _card(self, kind, col, title, body):
        cw, ch, pad = 940, 204, 30
        im = Image.new('RGBA', (cw + 2 * pad, ch + 2 * pad), (0, 0, 0, 0))
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle([pad, pad + 12, pad + cw, pad + ch + 12], radius=40, fill=(0, 0, 0, 140))
        im = Image.alpha_composite(im, sh.filter(ImageFilter.GaussianBlur(16)))
        g = ImageDraw.Draw(im)
        g.rounded_rectangle([pad, pad, pad + cw, pad + ch], radius=40, fill=CARD + (250,), outline=col + (200,), width=3)
        g.rounded_rectangle([pad, pad + 26, pad + 10, pad + ch - 26], radius=5, fill=col + (255,))
        im.alpha_composite(_icon(kind, 104, col), (pad + 40, pad + (ch - 104) // 2))
        ft, fb = font('InterDisplay-ExtraBold.otf', 46), font('Inter-SemiBold.otf', 33)
        tx = pad + 40 + 104 + 34
        g.text((tx, pad + 52), title, font=ft, fill=(255, 255, 255, 255), anchor='lm')
        lines, cur = [], ''
        for wd in body.split():
            nxt = (cur + ' ' + wd).strip()
            if fb.getlength(nxt) > cw - (tx - pad) - 40 and cur:
                lines.append(cur)
                cur = wd
            else:
                cur = nxt
        lines.append(cur)
        for li, ln in enumerate(lines):
            g.text((tx, pad + 110 + li * 44), ln, font=fb, fill=(204, 214, 240, 255), anchor='lm')
        return np.asarray(im, np.float32) / 255

    def active(self, t):
        return self.t0 <= t <= self.t1

    def draw(self, out, t):
        a_all = 1 - smooth((t - (self.t1 - 0.4)) / 0.4)
        for i, (card, it) in enumerate(zip(self.cards, self.items)):
            k = ease_out((t - it[4]) / 0.6)
            if k <= 0:
                continue
            y = self.y0 + i * self.gap + (1 - k) * 60
            over(out, card, (W - card.shape[1]) // 2, int(y - card.shape[0] / 2), k * a_all)


# ---------------------------------------------------------------- babak (latar)
SCENES = [
    dict(t0=0.0, bg='navy'),
    dict(t0=25.4, bg='navy', wipe=0.45, wipe_tile='+', origin=(540, 1100)),
    dict(t0=31.0, bg='deep'),
    dict(t0=34.0, bg='navy', wipe=0.4, wipe_tile='÷', origin=(940, 1600)),
    dict(t0=39.4, bg='navy', wipe=0.35, wipe_tile='+', origin=(540, 1100), tiles=[('+', 120, 1720, 100, -10, 0.5), ('×', 960, 1740, 90, 12, 0.6)]),
    dict(t0=44.0, bg='cream', wipe=0.4, wipe_tile='−', origin=(140, 600), tiles=[('+', 110, 1820, 100, -10, 0.3), ('÷', 990, 1800, 95, 12, 0.4)]),
    dict(t0=49.0, bg='gold', wipe=0.45, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.35), ('−', 930, 330, 120, 10, 0.45), ('×', 160, 1700, 130, 8, 0.55), ('÷', 920, 1680, 150, -8, 0.5)]),
]

# ---------------------------------------------------------------- telefon
SEG_Q9 = [(8.7, 8.7, 0.5), (8.7, 14.65, 5.95), (14.65, 14.65, 0.95)]
SEG_Q10 = [(14.85, 14.85, 0.4), (14.85, 18.75, 4.8)]
SEG_Q11 = [(18.85, 18.85, 0.4), (18.85, 22.1, 3.9), (22.1, 22.1, 0.7)]
SEG_Q12 = [(22.3, 24.2, 1.9), (27.4, 32.4, 5.0), (32.4, 32.4, 0.9)]
SEG_G4 = [(1.8, 7.2, 5.4)]

SHOTS = [
    Shot(0.0, 7.4, 'AD', SEG_Q9, 'q9-model-bar-salah'),
    Shot(7.4, 12.6, 'AD', SEG_Q10, 'q10-set-objek-salah'),
    Shot(12.6, 17.6, 'AD', SEG_Q11, 'q11-ayat-betul'),
    Shot(17.6, 25.4, 'AD', SEG_Q12, 'q12-lorek-jurus-penamat'),
    Shot(34.0, 39.4, 'G4', SEG_G4, 'kedai-kek-pecahan'),
    # ringkasan pencapaian anak (mak ayah): kekuatan, fokus seterusnya
    Shot(44.0, 49.0, 'R', [(0.3, 0.3, 5.0)], 'ringkasan-anak'),
]

CAMERA = [
    # Soalan 9: masuk perlahan, kemudian tolak lembut ke arah jawapan
    (0.0, R(s=1.0, oy=1320, ry=-11, rz=-1.8, rx=4)),
    (1.0, R(s=1.04, oy=1305, ry=-8, rz=-1.2, rx=3), 'out'),
    (3.0, R(s=1.06, oy=1300, ry=-6, rz=-1, rx=2)),
    (7.2, R(s=1.09, oy=1295, ry=-3, rz=-0.5, rx=1.5)),
    # Soalan 10: sudut bertukar perlahan
    (8.0, R(s=1.05, oy=1300, ry=7, rz=1.2, rx=3)),
    (12.4, R(s=1.09, oy=1295, ry=4, rz=0.7, rx=2)),
    # Soalan 11
    (13.2, R(s=1.05, oy=1300, ry=-7, rz=-1.2, rx=3)),
    (17.4, R(s=1.1, oy=1292, ry=-4, rz=-0.6, rx=2)),
    # Soalan 12 → Jurus Penamat (zoom perlahan ke arena)
    (18.2, R(s=1.05, oy=1300, ry=6, rz=1, rx=3)),
    (19.9, R(s=1.08, oy=1296, ry=4, rz=0.6, rx=2)),
    (20.7, Z(0.5, 0.2, 1.5, oy=1170)),
    (24.8, Z(0.5, 0.21, 1.6, oy=1170)),
    (25.35, R(s=1.25, v=0.3, oy=1250, a=0.0), 'in'),
    # mini game Pecahan
    (34.0, R(s=0.96, oy=1360, ry=-14, rz=-2, rx=6, a=0.0)),
    (34.7, R(s=1.1, oy=1300, ry=-6, rz=-1, rx=2), 'out'),
    (38.85, R(s=1.16, oy=1287, ry=-2, rz=-0.3, rx=1)),
    (39.35, R(s=1.25, oy=1260, a=0.0), 'in'),
    # ringkasan pencapaian
    (44.0, R(s=0.85, oy=1420, ry=30, rz=6, rx=12, a=0.0)),
    (44.55, R(s=1.0, ox=560, oy=1250, ry=-8, rz=-1.5, rx=3), 'out'),
    (48.35, R(s=1.04, ox=560, oy=1245, ry=-5, rz=-1, rx=2)),
    (48.9, R(s=0.6, oy=1520, rx=28, a=0.0), 'in'),
    (54.0, R(s=0.6, oy=1520, rx=28, a=0.0)),
]

HIGHLIGHTS = [
    (3.25, 4.4, 0.07, 0.681, 0.484, 0.744),     # 3/6 (salah)
    (10.95, 12.0, 0.52, 0.816, 0.93, 0.88),     # 1/2 (salah)
    (15.85, 16.6, 0.516, 0.735, 0.93, 0.80),    # 1/2 (betul)
    (16.6, 17.5, 0.05, 0.885, 0.4, 0.918),      # Betul! Kunci retak.
    (36.4, 37.3, 0.04, 0.80, 0.35, 0.87),       # Kedai Kek: 3/9 dipilih
]

PHONES = [dict(shots=SHOTS, camera=CAMERA, highlights=HIGHLIGHTS)]

# ---------------------------------------------------------------- teks
TEXTS = [
    dict(t0=0.2, t1=3.1, kicker='PAHLAWAN ANGKA · ADAPTIVE', head='Apa jadi bila anak salah?'),
    dict(t0=3.3, t1=7.25, kicker='PECAHAN · CUBAAN 1', head='Anak tersilap.',
         sub='App terangkan kenapa, tanpa beri jawapan.', small=True),
    dict(t0=7.55, t1=12.45, kicker='TOPIK SAMA · CARA LAIN', head='App tak terus tukar topik.',
         sub='Pecahan datang balik, kali ni guna set objek.', small=True),
    dict(t0=12.75, t1=17.45, kicker='TOPIK SAMA · CARA LAIN', head='Pecahan lagi… kali ni, betul!',
         sub='Dalam bentuk ayat pula. Faham, bukan hafal.', small=True),
    dict(t0=17.75, t1=20.6, kicker='PECAHAN · LOREK SENDIRI', head='Betul lagi, sendiri.', small=True),
    dict(t0=20.8, t1=25.25, kicker='KUNCI EMAS PECAH', head='Faham dulu… baru menang besar!'),
    dict(t0=25.6, t1=30.85, kicker='CARA PAHLAWAN ANGKA FAHAM ANAK', head='Bukan sekadar betul atau salah.', small=True),
    dict(t0=31.15, t1=34.0, kicker='MASIH BELUM KUKUH?', head='Kemahiran Fokus bawa anak…'),
    dict(t0=34.25, t1=39.25, kicker='MINI-GAME PECAHAN · KEDAI KEK', head='…ke dunia Pecahan sendiri.',
         sub='Topik sama, cara lebih seronok.', small=True),
    dict(t0=39.55, t1=43.85, kicker='KEMAHIRAN FOKUS', head='DAN ada lagi 8 mini-game…',
         sub='…ikut topik yang anak perlu kukuhkan!'),
    dict(t0=44.2, t1=48.85, kicker='UNTUK MAK AYAH · RINGKASAN', head='Pencapaian anak, sekali pandang.',
         sub='Yang semakin kuat, dan fokus seterusnya.', small=True),
]

# 8 mini game lain (selain Kedai Kek), dengan label topik
GRID8 = [('src_G1.mp4', 5.4), ('src_G2.mp4', 3.6), ('src_G3.mp4', 3.2), ('src_G5.mp4', 2.6),
         ('src_G6.mp4', 5.6), ('src_G7.mp4', 3.6), ('src_G8.mp4', 13.2), ('src_G9.mp4', 0.8)]
GRID8_LABELS = ['Wang', 'Masa', 'Ruang', 'Ukuran', 'Nombor', 'Nisbah', 'Data', 'Perpuluhan']

TRAIL = [('Model bar', 0.7, 3.25, False), ('Set objek', 7.7, 10.95, False),
         ('Ayat', 12.9, 15.85, True), ('Lorek', 17.9, 19.95, True)]

STEPS = [
    ('x', RED, 'Salah?', 'Topik sama datang balik, dengan soalan baharu.', 26.3),
    ('loop', AMBER, 'Cara soalan bertukar.', 'Model bar, set objek, ayat. Anak kena faham, bukan hafal.', 27.5),
    ('ok', GREEN, 'Betul berturut-turut?', 'Tanpa petunjuk, baru app naik ke kemahiran seterusnya.', 28.7),
]


def _bg(src, t0, t1, segs, fade_in=0.4):
    """Latar sinematik: rakaman yang sama, dizum ke arena, kabur dan gelap di belakang telefon."""
    return FullClip(src, t0, t1, segs, zoom=(2.3, 2.42), dim=0.34, blur=18, scrim=0.5, fade=(fade_in, 0.0), center=(0.5, 0.17))


SPECIALS = [
    _bg('src_AD.mp4', 0.0, 7.4, SEG_Q9, fade_in=0.0),
    _bg('src_AD.mp4', 7.4, 12.6, SEG_Q10, fade_in=0.0),
    _bg('src_AD.mp4', 12.6, 17.6, SEG_Q11, fade_in=0.0),
    _bg('src_AD.mp4', 17.6, 25.4, SEG_Q12, fade_in=0.0),
    # sinematik: Wira jatuh ke pusaran Matematik → bola cahaya
    FullClip('src_JATUH.mp4', 31.0, 34.1, [(0.0, 3.1, 3.1)], zoom=(1.0, 1.06), scrim=0.6, fade=(0.35, 0.0)),
    FullClip('src_G4.mp4', 34.0, 39.4, SEG_G4, zoom=(1.9, 2.0), dim=0.4, blur=18, scrim=0.0, fade=(0.5, 0.0), center=(0.5, 0.2)),
    Trail(0.6, 21.0, 565, TRAIL),
    # penerangan app dinaikkan di atas arena supaya boleh dibaca
    lambda r: Callout(r, 0, 3.7, 6.1, (0.03, 0.825, 0.97, 0.885), 540, 935, 960, ry=-4, rz=-0.5),
    lambda r: Callout(r, 0, 11.35, 12.1, (0.03, 0.882, 0.97, 0.92), 540, 935, 960, ry=4, rz=0.5),
    Steps(25.4, 30.95, STEPS, y0=720, gap=236),
    VideoGrid(39.45, 43.9, GRID8, cols=4, tile=232, y0=900, gap=(18, 92), labels=GRID8_LABELS),
    # ringkasan: statistik, kemudian "Yang semakin kuat" + "Fokus seterusnya"
    lambda r: Callout(r, 0, 44.85, 48.85, (0.03, 0.493, 0.97, 0.56), 540, 905, 940, ry=-5, rz=-1),
    lambda r: Callout(r, 0, 46.0, 48.85, (0.03, 0.64, 0.97, 0.86), 560, 1330, 880, ry=6, rz=1),
    EndScene(49.0, 54.6, lines=[('Pahlawan Angka', 54, WHITE), ('faham', 76, GOLD_TXT), ('anak anda.', 76, GOLD_TXT)], box_h=580),
]

FLASHES = [(20.15, 0.3, 0.3), (22.3, 0.25, 0.25), (33.85, 0.35, 0.6), (39.45, 0.25, 0.25)]

# ---------------------------------------------------------------- audio
MUSIC = [('intro', 0, 2), ('light', 2, 6), ('groove', 8, 2), ('drop', 10, 2), ('groove', 12, 1), ('break', 13, 2),
         ('build', 15, 2), ('groove', 17, 5), ('light', 22, 2), ('outro', 24, 3)]

SFX = [
    ('src', 3.05, 'AD', 11.25, 12.0, 0.6), ('src', 6.05, 'AD', 14.25, 14.65, 0.55),
    ('pop', 0.75, 0.35), ('pop', 7.75, 0.35), ('pop', 12.95, 0.35), ('pop', 17.95, 0.35),
    ('whoosh', 7.3, 0.5, 0.35), ('whoosh', 12.5, 0.5, 0.35), ('whoosh', 17.5, 0.5, 0.35),
    ('src', 10.85, 'AD', 17.3, 17.9, 0.6), ('src', 12.07, 'AD', 18.3, 18.75, 0.5),
    ('src', 15.72, 'AD', 21.1, 22.0, 0.7), ('shimmer', 16.0, 0.3),
    ('src', 19.5, 'AD', 27.4, 32.4, 0.85),
    ('whoosh', 25.2, 0.7, 0.5), ('pop', 26.35, 0.4), ('pop', 27.55, 0.4), ('pop', 28.75, 0.4),
    ('whoosh', 30.8, 0.6, 0.5), ('src', 31.0, 'JATUH', 0.0, 3.1, 0.6),
    ('src', 34.0, 'G4', 1.8, 7.2, 0.5), ('shimmer', 37.2, 0.4),
    ('whoosh', 39.25, 0.6, 0.6), *[('pop', 39.55 + 0.07 * i, 0.28) for i in range(8)],
    ('whoosh', 43.8, 0.6, 0.6), ('pop', 44.9, 0.5), ('pop', 46.05, 0.5),
    *end_sfx(49.0),
]
