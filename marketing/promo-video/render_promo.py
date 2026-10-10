#!/usr/bin/env python3
"""Enjin render video promosi Pahlawan Angka — gaya Premium Phone Showcase.

Prinsip utama:
- Footage gameplay dan bezel telefon dipetakan oleh SATU homografi yang sama
  setiap frame (lihat `pose_matrix`). Footage tidak boleh terapung, bergeser
  atau terkeluar dari skrin kerana kedudukannya tidak pernah dikira berasingan.
- Zoom UI dan device push-in kedua-duanya ialah perubahan pose telefon
  (skala + titik fokus), jadi motion lock kekal sepanjang zoom.
- Nisbah footage dikekalkan: skrin mockup dibina mengikut nisbah rakaman
  sumber yang telah dipotong status bar (392 x 812).

Guna:
  python3 render_promo.py --timeline timeline_90 --src build/src30.mp4 \
      --src-audio build/src_audio.wav --out out/promo-90s.mp4
Pilihan: --preview (separuh resolusi, 15 fps), --start/--end (saat), --frames t1,t2 (PNG sahaja).
"""
import argparse, importlib, math, os, subprocess, sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
FONT_DIR = '/usr/share/fonts/opentype/inter'

W, H, FPS = 1080, 1920, 30
SRC_W, SRC_H = 784, 1624            # footage perantaraan (2x, status bar dibuang)
SW = 520.0                          # lebar skrin dalam unit tempatan telefon
SH = SW * SRC_H / SRC_W             # tinggi skrin ikut nisbah footage (tiada stretch)
BZ = 15.0                           # ketebalan bezel
PW, PH = SW + 2 * BZ, SH + 2 * BZ
R_OUT, R_IN = 74.0, 60.0
MARGIN = 8.0                        # ruang untuk butang sisi
FOCAL = 2600.0

GOLD = (245, 184, 61)
NAVY = (9, 16, 40)
WHITE = (255, 255, 255)


# ---------------------------------------------------------------- utiliti

def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name), size)


def smooth(x):
    x = min(1.0, max(0.0, x))
    return x * x * x * (x * (x * 6 - 15) + 10)


def smooth_arr(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * x * (x * (x * 6 - 15) + 10)


def lerp(a, b, k):
    return a + (b - a) * k


def ramp(t, t0, t1, fade=0.3):
    """Nilai 0..1 untuk elemen yang muncul pada t0 dan hilang pada t1."""
    if t < t0 or t > t1:
        return 0.0
    return smooth(min((t - t0) / fade, (t1 - t) / fade, 1.0))


def pil_to_rgba(im):
    a = np.asarray(im.convert('RGBA'), dtype=np.float32) / 255.0
    return a


def over(dst, rgba, x, y, alpha=1.0):
    """Alpha-composite rgba (float 0..1, premultiplied tidak) ke dst float pada (x,y)."""
    h, w = rgba.shape[:2]
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(dst.shape[1], x + w), min(dst.shape[0], y + h)
    if x1 <= x0 or y1 <= y0 or alpha <= 0:
        return
    src = rgba[y0 - y:y1 - y, x0 - x:x1 - x]
    a = src[..., 3:4] * alpha
    region = dst[y0:y1, x0:x1]
    region *= (1 - a)
    region += src[..., :3] * a


# ---------------------------------------------------------------- aset statik

def rounded_rect_points(w, h, r, n=12):
    """Titik poligon segi empat bucu bulat berpusat pada asalan."""
    pts = []
    for cx, cy, a0 in ((w / 2 - r, -h / 2 + r, -90), (w / 2 - r, h / 2 - r, 0),
                       (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return np.array(pts, dtype=np.float64)


def build_bezel(ss):
    """Bingkai telefon RGBA pada faktor supersample `ss`. Lubang skrin lutsinar."""
    bw, bh = int(round((PW + 2 * MARGIN) * ss)), int(round((PH + 2 * MARGIN) * ss))
    img = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    m = MARGIN * ss
    # butang sisi
    btn = (52, 56, 66, 255)
    d.rounded_rectangle([m + PW * ss - 2 * ss, m + 250 * ss, m + PW * ss + 4 * ss, m + 340 * ss], radius=3 * ss, fill=btn)
    d.rounded_rectangle([m - 4 * ss, m + 200 * ss, m + 2 * ss, m + 250 * ss], radius=3 * ss, fill=btn)
    d.rounded_rectangle([m - 4 * ss, m + 265 * ss, m + 2 * ss, m + 315 * ss], radius=3 * ss, fill=btn)
    # badan logam: kecerunan menegak lembut
    body = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
    grad = np.zeros((bh, bw, 4), np.uint8)
    yy = np.linspace(0, 1, bh)[:, None]
    xx = np.linspace(0, 1, bw)[None, :]
    base = 30 + 18 * (1 - yy) + 10 * np.abs(xx - 0.5)
    grad[..., 0] = np.clip(base, 0, 255)
    grad[..., 1] = np.clip(base + 3, 0, 255)
    grad[..., 2] = np.clip(base + 10, 0, 255)
    grad[..., 3] = 255
    body = Image.fromarray(grad, 'RGBA')
    mask = Image.new('L', (bw, bh), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([m, m, m + PW * ss, m + PH * ss], radius=R_OUT * ss, fill=255)
    md.rounded_rectangle([m + BZ * ss, m + BZ * ss, m + (BZ + SW) * ss, m + (BZ + SH) * ss], radius=R_IN * ss, fill=0)
    img.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(img)
    # tepi berkilat dan garis dalam gelap
    d.rounded_rectangle([m, m, m + PW * ss, m + PH * ss], radius=R_OUT * ss, outline=(150, 160, 182, 255), width=max(1, int(1.6 * ss)))
    d.rounded_rectangle([m + 3 * ss, m + 3 * ss, m + (PW - 3) * ss, m + (PH - 3) * ss], radius=(R_OUT - 3) * ss, outline=(70, 76, 92, 255), width=max(1, int(1.2 * ss)))
    d.rounded_rectangle([m + (BZ - 2) * ss, m + (BZ - 2) * ss, m + (BZ + SW + 2) * ss, m + (BZ + SH + 2) * ss], radius=(R_IN + 2) * ss, outline=(4, 5, 8, 255), width=max(1, int(3 * ss)))
    # kamera punch-hole kecil (tidak menutup tajuk UI)
    cx, cy, r = m + PW * ss / 2, m + (BZ + 11) * ss, 6.5 * ss
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(6, 7, 10, 255))
    d.ellipse([cx - r * 0.45, cy - r * 0.55, cx + r * 0.05, cy - r * 0.05], fill=(40, 50, 80, 255))
    arr = np.asarray(img, dtype=np.uint8)
    return arr


def build_background():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    t = yy / H
    bg = np.zeros((H, W, 3), np.float32)
    top = np.array([14, 24, 58], np.float32) / 255
    bot = np.array([5, 9, 24], np.float32) / 255
    bg[:] = top * (1 - t[..., None]) + bot * t[..., None]
    def glow(cx, cy, rad, col, k):
        d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / rad
        g = np.clip(1 - d, 0, 1) ** 2 * k
        return g[..., None] * (np.array(col, np.float32) / 255)
    bg += glow(540, 1150, 820, GOLD, 0.20)
    bg += glow(120, 260, 700, (63, 208, 224), 0.07)
    bg += glow(980, 1700, 640, (90, 110, 255), 0.06)
    # simbol matematik samar
    sym = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(sym)
    f = font('InterDisplay-Bold.otf', 150)
    rng = np.random.default_rng(7)
    for i in range(14):
        ch = '+−×÷'[i % 4]
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        d.text((x, y), ch, font=f, fill=int(rng.uniform(16, 30)), anchor='mm')
    sym = sym.filter(ImageFilter.GaussianBlur(3))
    bg += (np.asarray(sym, np.float32) / 255)[..., None] * np.array([0.9, 0.8, 0.5], np.float32) * 0.35
    # vignette
    d = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2)
    bg *= (1 - np.clip(d - 0.35, 0, 1) * 0.9)[..., None]
    return np.clip(bg, 0, 1)


class Particles:
    def __init__(self, n=34, seed=3):
        rng = np.random.default_rng(seed)
        self.x = rng.uniform(0, W, n)
        self.y = rng.uniform(0, H, n)
        self.r = rng.uniform(1.6, 4.2, n)
        self.v = rng.uniform(10, 26, n)
        self.ph = rng.uniform(0, 6.28, n)

    def layer(self, t):
        sm = np.zeros((H // 4, W // 4), np.float32)
        for x, y, r, v, ph in zip(self.x, self.y, self.r, self.v, self.ph):
            yy = (y - v * t) % H
            xx = x + 14 * math.sin(t * 0.4 + ph)
            a = 0.5 + 0.5 * math.sin(t * 1.3 + ph)
            cv2.circle(sm, (int(xx / 4), int(yy / 4)), max(1, int(r / 2)), 0.35 + 0.65 * a, -1, cv2.LINE_AA)
        sm = cv2.GaussianBlur(sm, (0, 0), 1.6)
        big = cv2.resize(sm, (W, H), interpolation=cv2.INTER_LINEAR)
        return big[..., None] * (np.array(GOLD, np.float32) / 255) * 0.55


# ---------------------------------------------------------------- pose / homografi

REST = dict(s=1.05, u=0.5, v=0.5, ox=540.0, oy=1110.0, rz=0.0, ry=0.0, rx=0.0, a=1.0)
POSE_KEYS = list(REST.keys())


def pose_matrix(p):
    """Homografi 3x3: koordinat tempatan telefon (pusat skrin = 0,0) -> piksel output."""
    rx, ry, rz = (math.radians(p[k]) for k in ('rx', 'ry', 'rz'))
    Rx = np.array([[1, 0, 0], [0, math.cos(rx), -math.sin(rx)], [0, math.sin(rx), math.cos(rx)]])
    Ry = np.array([[math.cos(ry), 0, math.sin(ry)], [0, 1, 0], [-math.sin(ry), 0, math.cos(ry)]])
    R = Rx @ Ry
    P = np.array([[FOCAL * R[0, 0], FOCAL * R[0, 1], 0],
                  [FOCAL * R[1, 0], FOCAL * R[1, 1], 0],
                  [R[2, 0], R[2, 1], FOCAL]])
    s = p['s']
    A = np.array([[s * math.cos(rz), -s * math.sin(rz), 0], [s * math.sin(rz), s * math.cos(rz), 0], [0, 0, 1]])
    M = A @ P
    fx, fy = (p['u'] - 0.5) * SW, (p['v'] - 0.5) * SH
    q = M @ np.array([fx, fy, 1.0])
    T = np.array([[1, 0, p['ox'] - q[0] / q[2]], [0, 1, p['oy'] - q[1] / q[2]], [0, 0, 1]])
    return T @ M


def project(Hm, pts):
    ph = np.c_[pts, np.ones(len(pts))] @ Hm.T
    return ph[:, :2] / ph[:, 2:3]


class Track:
    """Laluan kamera/pose: senarai (t, dict). Kunci yang tiada diwarisi."""
    def __init__(self, keys):
        full, cur = [], dict(REST)
        for t, d in keys:
            cur = dict(cur)
            cur.update(d)
            full.append((t, cur))
        self.keys = full

    def at(self, t):
        ks = self.keys
        if t <= ks[0][0]:
            return dict(ks[0][1])
        for (t0, a), (t1, b) in zip(ks, ks[1:]):
            if t0 <= t <= t1:
                k = smooth((t - t0) / max(1e-6, t1 - t0))
                return {key: lerp(a[key], b[key], k) for key in POSE_KEYS}
        return dict(ks[-1][1])


# ---------------------------------------------------------------- sumber footage

class Reader:
    def __init__(self, path):
        self.cap = cv2.VideoCapture(path)
        self.n = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.idx = -1
        self.frame = None

    def get(self, i):
        i = max(0, min(self.n - 1, i))
        if i == self.idx:
            return self.frame
        if i != self.idx + 1 or self.frame is None:
            if not (self.idx < i <= self.idx + 40) or self.frame is None:
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, i)
                self.idx = i - 1
        while self.idx < i:
            ok, f = self.cap.read()
            if not ok:
                break
            self.idx += 1
            self.frame = f
        return self.frame


class Shot:
    def __init__(self, t0, t1, segs, name=''):
        self.t0, self.t1, self.segs, self.name = t0, t1, segs, name

    def src_time(self, t):
        """Masa sumber bagi masa output t. segs = [(src_a, src_b, durasi_output)]."""
        tt = t - self.t0
        for a, b, dur in self.segs:
            if tt <= dur:
                return a + (b - a) * (tt / dur if dur > 0 else 0)
            tt -= dur
        a, b, dur = self.segs[-1]
        return b


# ---------------------------------------------------------------- teks

class TextCache:
    def __init__(self):
        self.c = {}

    def block(self, kicker, headline):
        key = ('blk', kicker, headline)
        if key in self.c:
            return self.c[key]
        fk = font('Inter-Bold.otf', 28)
        fh = font('InterDisplay-ExtraBold.otf', 64)
        lines = wrap(headline, fh, 980) if headline else []
        lh = 74
        hgt = 46 + lh * len(lines) + 10
        im = Image.new('RGBA', (W, hgt), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        if kicker:
            d.text((W / 2, 14), kicker, font=fk, fill=GOLD + (255,), anchor='mt')
        for i, ln in enumerate(lines):
            d.text((W / 2, 46 + i * lh), ln, font=fh, fill=WHITE + (255,), anchor='mt')
        sh = im.filter(ImageFilter.GaussianBlur(8))
        shadow = Image.new('RGBA', im.size, (0, 0, 0, 0))
        shadow.putalpha(sh.getchannel('A').point(lambda v: int(v * 0.7)))
        out = Image.alpha_composite(shadow, im)
        self.c[key] = pil_to_rgba(out)
        return self.c[key]

    def subtitle(self, text):
        key = ('sub', text)
        if key in self.c:
            return self.c[key]
        f = font('Inter-SemiBold.otf', 40)
        lines = wrap(text, f, 900)
        lh = 52
        tw = max(f.getbbox(l)[2] for l in lines)
        bw, bh = int(tw + 52), int(lh * len(lines) + 30)
        im = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([0, 0, bw - 1, bh - 1], radius=24, fill=(6, 12, 30, 205))
        for i, ln in enumerate(lines):
            d.text((bw / 2, 15 + i * lh + lh / 2), ln, font=f, fill=(240, 244, 255, 255), anchor='mm')
        self.c[key] = pil_to_rgba(im)
        return self.c[key]

    def pill(self, label, col, on):
        key = ('pill', label, col, on)
        if key in self.c:
            return self.c[key]
        f = font('InterDisplay-ExtraBold.otf', 46)
        tw = f.getbbox(label)[2]
        bw, bh = tw + 70, 84
        pad = 24
        im = Image.new('RGBA', (bw + 2 * pad, bh + 2 * pad), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        if on:
            g = Image.new('RGBA', im.size, (0, 0, 0, 0))
            gd = ImageDraw.Draw(g)
            gd.rounded_rectangle([pad, pad, pad + bw, pad + bh], radius=42, fill=col + (200,))
            g = g.filter(ImageFilter.GaussianBlur(14))
            im = Image.alpha_composite(im, g)
            d = ImageDraw.Draw(im)
            d.rounded_rectangle([pad, pad, pad + bw, pad + bh], radius=42, fill=col + (255,))
            d.text((pad + bw / 2, pad + bh / 2), label, font=f, fill=(20, 18, 30, 255), anchor='mm')
        else:
            d.rounded_rectangle([pad, pad, pad + bw, pad + bh], radius=42, outline=col + (150,), width=3, fill=(10, 18, 40, 170))
            d.text((pad + bw / 2, pad + bh / 2), label, font=f, fill=col + (150,), anchor='mm')
        self.c[key] = pil_to_rgba(im)
        return self.c[key]


def wrap(text, f, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        nxt = (cur + ' ' + w).strip()
        if f.getbbox(nxt)[2] <= maxw:
            cur = nxt
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


# ---------------------------------------------------------------- grafik khas

def build_teman_cards(spec):
    cards = []
    fn, fs = font('InterDisplay-ExtraBold.otf', 38), font('Inter-Medium.otf', 24)
    for name, species, path in spec:
        cw, ch = 296, 372
        im = Image.new('RGBA', (cw + 40, ch + 40), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        g = Image.new('RGBA', im.size, (0, 0, 0, 0))
        ImageDraw.Draw(g).rounded_rectangle([20, 28, 20 + cw, 28 + ch], radius=34, fill=(0, 0, 0, 160))
        im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(12)))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([20, 20, 20 + cw, 20 + ch], radius=34, fill=(18, 30, 68, 245), outline=GOLD + (170,), width=3)
        sp = Image.open(os.path.join(REPO, path)).convert('RGBA')
        sp = sp.crop(sp.getbbox())
        sp.thumbnail((236, 220), Image.LANCZOS)
        im.alpha_composite(sp, (20 + (cw - sp.width) // 2, 20 + 18 + (224 - sp.height) // 2))
        d.text((20 + cw / 2, 20 + 270), name, font=fn, fill=WHITE + (255,), anchor='mm')
        d.text((20 + cw / 2, 20 + 318), species, font=fs, fill=(170, 186, 222, 255), anchor='mm')
        cards.append(pil_to_rgba(im))
    return cards


def build_endcard():
    logo = Image.open(os.path.join(REPO, 'assets/branding/pahlawan-angka-full-logo-v1.png')).convert('RGBA')
    logo = logo.crop(logo.getbbox())
    logo.thumbnail((820, 820), Image.LANCZOS)
    f1 = font('InterDisplay-Bold.otf', 52)
    tag = Image.new('RGBA', (W, 150), (0, 0, 0, 0))
    d = ImageDraw.Draw(tag)
    for i, ln in enumerate(['Pengembaraan matematik', 'ikut kemampuan anak.']):
        d.text((W / 2, 10 + i * 66), ln, font=f1, fill=WHITE + (255,), anchor='mt')
    f2 = font('Inter-ExtraBold.otf', 44)
    label = 'Cuba demo Pahlawan Angka'
    tw = f2.getbbox(label)[2]
    bw, bh = tw + 110, 104
    cta = Image.new('RGBA', (bw + 60, bh + 60), (0, 0, 0, 0))
    g = Image.new('RGBA', cta.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).rounded_rectangle([30, 30, 30 + bw, 30 + bh], radius=52, fill=GOLD + (190,))
    cta = Image.alpha_composite(cta, g.filter(ImageFilter.GaussianBlur(18)))
    d = ImageDraw.Draw(cta)
    d.rounded_rectangle([30, 30, 30 + bw, 30 + bh], radius=52, fill=GOLD + (255,))
    d.text((30 + bw / 2, 30 + bh / 2), label, font=f2, fill=NAVY + (255,), anchor='mm')
    return pil_to_rgba(logo), pil_to_rgba(tag), pil_to_rgba(cta)


# ---------------------------------------------------------------- renderer

class Renderer:
    def __init__(self, tl, src_path, scale=1.0):
        self.tl = tl
        self.scale = scale
        self.readers = [Reader(src_path), Reader(src_path)]
        self.bg = build_background()
        self.particles = Particles()
        self.bezels = {ss: build_bezel(ss) for ss in (1, 2, 3)}
        self.track = Track(tl.CAMERA)
        self.text = TextCache()
        self.glare = self._glare()
        self.screen_poly = rounded_rect_points(SW, SH, R_IN)
        self.body_poly = rounded_rect_points(PW, PH, R_OUT)
        self.cards = build_teman_cards(tl.TEMAN) if getattr(tl, 'TEMAN', None) else None
        self.endcard = build_endcard()
        self.shots = tl.SHOTS

    def _glare(self):
        yy, xx = np.mgrid[0:SRC_H, 0:SRC_W].astype(np.float32)
        band = (xx / SRC_W * 0.55 + yy / SRC_H * 0.45)
        g = np.exp(-((band - 0.28) / 0.10) ** 2) * 0.045 + (1 - yy / SRC_H) * 0.02
        return g[..., None]

    # -- footage untuk skrin pada masa t (dengan crossfade antara shot)
    def screen_frame(self, t):
        shots = self.shots
        xf = 0.14
        for i, sh in enumerate(shots):
            if sh.t0 <= t < sh.t1 or (i == len(shots) - 1 and t >= sh.t0):
                cur = self._frame(i, t)
                if i + 1 < len(shots) and t > sh.t1 - xf:
                    k = smooth((t - (sh.t1 - xf)) / (2 * xf))
                    nxt = self._frame(i + 1, shots[i + 1].t0)
                    cur = cur * (1 - k) + nxt * k
                elif i > 0 and t < sh.t0 + xf:
                    k = smooth((t - (sh.t0 - xf)) / (2 * xf))
                    prv = self._frame(i - 1, shots[i - 1].t1)
                    cur = prv * (1 - k) + cur * k
                return cur
        return self._frame(0, 0)

    def _frame(self, i, t):
        sh = self.shots[i]
        st = sh.src_time(min(max(t, sh.t0), sh.t1))
        f = self.readers[i % 2].get(int(round(st * FPS)))
        return f.astype(np.float32) / 255.0

    def decorate(self, f, t):
        """Highlight dilukis dalam koordinat footage -> terkunci pada skrin."""
        f = f[..., ::-1].copy()  # BGR -> RGB
        f = np.clip(f + self.glare, 0, 1)
        for (t0, t1, u0, v0, u1, v1) in self.tl.HIGHLIGHTS:
            a = ramp(t, t0, t1, 0.25)
            if a <= 0:
                continue
            x0, y0, x1, y1 = int(u0 * SRC_W), int(v0 * SRC_H), int(u1 * SRC_W), int(v1 * SRC_H)
            lay = np.zeros((SRC_H, SRC_W), np.float32)
            cv2.rectangle(lay, (x0, y0), (x1, y1), 1.0, 7, cv2.LINE_AA)
            glow = cv2.GaussianBlur(lay, (0, 0), 9) * 1.4
            m = np.clip(lay + glow, 0, 1)[..., None] * a
            col = np.array(GOLD, np.float32) / 255
            f = f * (1 - m) + col * m
        return f

    def render(self, t):
        tl = self.tl
        out = self.bg.copy()
        out += self.particles.layer(t)
        p = self.track.at(t)
        # gerakan terapung sangat halus hanya ketika telefon dalam keadaan rehat
        rest = 1 - smooth((p['s'] - 1.08) / 0.25)
        p['oy'] += 5 * math.sin(t * 0.9) * rest
        p['ry'] += 1.1 * math.sin(t * 0.55) * rest
        alpha = p['a']
        if alpha > 0.002:
            Hm = pose_matrix(p)
            body = project(Hm, self.body_poly)
            # bayang
            sm = np.zeros((H // 4, W // 4), np.float32)
            cv2.fillPoly(sm, [np.int32((body + [10, 46 * p['s']]) / 4 * 16)], 1.0, cv2.LINE_AA, shift=4)
            soft = cv2.GaussianBlur(sm, (0, 0), 9 * p['s'])
            sm2 = np.zeros_like(sm)
            cv2.fillPoly(sm2, [np.int32((body + [0, 14 * p['s']]) / 4 * 16)], 1.0, cv2.LINE_AA, shift=4)
            soft = soft * 0.55 + cv2.GaussianBlur(sm2, (0, 0), 3) * 0.35
            shadow = cv2.resize(soft, (W, H), interpolation=cv2.INTER_LINEAR)[..., None]
            out *= (1 - shadow * alpha)
            # skrin: footage -> tempatan -> output (homografi sama dengan bezel)
            f = self.decorate(self.screen_frame(t), t)
            eff = p['s'] * SW / SRC_W
            ds = min(1.0, eff * 1.15)
            if ds < 0.97:
                f = cv2.resize(f, (int(SRC_W * ds), int(SRC_H * ds)), interpolation=cv2.INTER_AREA)
            fh, fw = f.shape[:2]
            A = np.array([[SW / fw, 0, -SW / 2], [0, SH / fh, -SH / 2], [0, 0, 1]])
            Hs = Hm @ A
            scr = cv2.warpPerspective(f, Hs, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT)
            mask = np.zeros((H, W), np.float32)
            cv2.fillPoly(mask, [np.int32(project(Hm, self.screen_poly) * 16)], 1.0, cv2.LINE_AA, shift=4)
            mask = mask[..., None] * alpha
            out = out * (1 - mask) + np.clip(scr, 0, 1) * mask
            # bezel
            ss = 3 if eff > 1.0 else (2 if eff > 0.55 else 1)
            bz = self.bezels[ss]
            Ab = np.array([[1 / ss, 0, -(PW / 2 + MARGIN)], [0, 1 / ss, -(PH / 2 + MARGIN)], [0, 0, 1]])
            bzw = cv2.warpPerspective(bz, Hm @ Ab, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT).astype(np.float32) / 255
            ba = bzw[..., 3:4] * alpha
            out = out * (1 - ba) + bzw[..., :3] * ba
        # grafik khas (kad teman / kad penutup)
        for sp in getattr(tl, 'SPECIALS', []):
            kind, t0, t1 = sp[0], sp[1], sp[2]
            if not (t0 - 0.01 <= t <= t1 + 0.01):
                continue
            if kind == 'teman':
                self._draw_teman(out, t, t0, t1)
            elif kind == 'end':
                self._draw_end(out, t, t0, t1, sp[3] if len(sp) > 3 else {})
        # scrim atas ketika zoom supaya teks kekal mudah dibaca
        z = smooth((p['s'] - 1.15) / 0.5) * alpha
        if z > 0:
            yy = np.arange(720, dtype=np.float32)
            g = (1 - smooth_arr((yy - 470) / 250)) * 0.93 * z
            out[:720] *= (1 - g[:, None, None])
            out[:720] += (np.array(NAVY, np.float32) / 255) * g[:, None, None]
        # teks utama
        sub_y = 392
        for (t0, t1, kicker, head) in tl.TEXTS:
            a = ramp(t, t0, t1, 0.35)
            if a <= 0:
                continue
            blk = self.text.block(kicker, head) if head != '@tiers' else self.text.block(kicker, '')
            dy = int((1 - a) * 22)
            over(out, blk, 0, 150 + dy, a)
            sub_y = max(sub_y, 150 + blk.shape[0] + (110 if head == '@tiers' else 14))
            if head == '@tiers':
                self._draw_tiers(out, t, a)
        # sari kata (voice-over)
        if not getattr(self, 'no_subs', False):
            for (t0, t1, txt) in tl.subtitle_chunks():
                a = ramp(t, t0, t1, 0.12)
                if a <= 0:
                    continue
                s = self.text.subtitle(txt)
                over(out, s, (W - s.shape[1]) // 2, sub_y, a)
        return np.clip(out, 0, 1)

    def _draw_tiers(self, out, t, a):
        tiers = self.tl.TIERS
        imgs = []
        for label, col, ton in tiers:
            imgs.append(self.text.pill(label, col, t >= ton))
        gap = -10
        total = sum(i.shape[1] for i in imgs) + gap * (len(imgs) - 1)
        x = (W - total) // 2
        for (label, col, ton), im in zip(tiers, imgs):
            pop = 1.0
            if t >= ton:
                k = min(1.0, (t - ton) / 0.35)
                pop = 1 + 0.12 * math.sin(k * math.pi)
            if abs(pop - 1) > 1e-3:
                im2 = cv2.resize(im, None, fx=pop, fy=pop, interpolation=cv2.INTER_LINEAR)
                over(out, im2, int(x - (im2.shape[1] - im.shape[1]) / 2), int(196 - (im2.shape[0] - im.shape[0]) / 2), a)
            else:
                over(out, im, x, 196, a)
            x += im.shape[1] + gap

    def _draw_teman(self, out, t, t0, t1):
        cols, cw, ch = 3, 330, 404
        x0 = (W - cols * cw) // 2 + 4
        y0 = 640
        for i, card in enumerate(self.cards):
            a = ramp(t, t0 + 0.12 * i, t1, 0.3)
            if a <= 0:
                continue
            r, c = divmod(i, cols)
            sc = 0.9 + 0.1 * a
            im = cv2.resize(card, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA) if sc < 0.999 else card
            x = x0 + c * cw + (card.shape[1] - im.shape[1]) // 2
            y = y0 + r * ch + (card.shape[0] - im.shape[0]) // 2 + int((1 - a) * 30)
            over(out, im, x, y, a)

    def _draw_end(self, out, t, t0, t1, opt):
        logo, tag, cta = self.endcard
        a = ramp(t, t0 + 0.2, t1 + 5, 0.6)
        k = smooth((t - t0 - 0.2) / 1.2)
        sc = 0.9 + 0.1 * k
        lg = cv2.resize(logo, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
        # cahaya di belakang logo
        yy, xx = np.ogrid[0:H, 0:W]
        cy = opt.get('logo_y', 800)
        g = np.clip(1 - np.sqrt((xx - 540) ** 2 + (yy - cy) ** 2) / 560, 0, 1) ** 2 * (0.32 + 0.06 * math.sin(t * 2.0)) * a
        out += g[..., None] * (np.array(GOLD, np.float32) / 255)
        over(out, lg, (W - lg.shape[1]) // 2, cy - lg.shape[0] // 2, a)
        at = ramp(t, opt.get('tag_t', t0 + 0.6), t1 + 5, 0.5)
        over(out, tag, 0, cy + 300 + int((1 - at) * 20), at)
        ac = ramp(t, opt.get('cta_t', t0 + 3.6), t1 + 5, 0.4)
        if ac > 0:
            pulse = 1 + 0.025 * math.sin((t - opt.get('cta_t', t0 + 3.6)) * 4)
            c2 = cv2.resize(cta, None, fx=pulse * (0.94 + 0.06 * ac), fy=pulse * (0.94 + 0.06 * ac), interpolation=cv2.INTER_LINEAR)
            over(out, c2, (W - c2.shape[1]) // 2, cy + 470 - (c2.shape[0] - cta.shape[0]) // 2, ac)


# ---------------------------------------------------------------- audio

def build_audio(tl, src_audio, out_wav, offset=0.0, duration=None):
    dur = duration or tl.DURATION
    music = os.path.join(REPO, 'assets/audio/PAMusic.mp3')
    sting = os.path.join(REPO, 'assets/audio/StingerPA.mp3')
    inputs = ['-i', music, '-i', sting]
    parts, labels = [], []
    m_end = tl.MUSIC_END
    parts.append(f"[0:a]atrim=0:{m_end + 1},asetpts=PTS-STARTPTS,volume={tl.MUSIC_GAIN},afade=t=in:d=0.6,afade=t=out:st={m_end - 1.8}:d=1.8,aformat=sample_rates=48000:channel_layouts=stereo[mus]")
    labels.append('[mus]')
    st0, sdur = tl.STINGER
    parts.append(f"[1:a]atrim=0:{sdur},asetpts=PTS-STARTPTS,volume=0.9,afade=t=out:st={sdur - 1.5}:d=1.5,adelay={int(st0 * 1000)}|{int(st0 * 1000)},aformat=sample_rates=48000:channel_layouts=stereo[stg]")
    labels.append('[stg]')
    for i, (o0, s0, s1, gain) in enumerate(tl.GAME_SFX):
        inputs += ['-i', src_audio]
        d = s1 - s0
        parts.append(f"[{i + 2}:a]atrim={s0}:{s1},asetpts=PTS-STARTPTS,volume={gain},afade=t=in:d=0.08,afade=t=out:st={d - 0.25}:d=0.25,adelay={int(o0 * 1000)}|{int(o0 * 1000)}[g{i}]")
        labels.append(f'[g{i}]')
    fc = ';'.join(parts) + ';' + ''.join(labels) + f"amix=inputs={len(labels)}:normalize=0,atrim=0:{dur},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aout]"
    cmd = ['ffmpeg', '-v', 'error', '-y'] + inputs + ['-filter_complex', fc, '-map', '[aout]', '-ac', '2', out_wav]
    subprocess.run(cmd, check=True)


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--timeline', default='timeline_90')
    ap.add_argument('--src', required=True)
    ap.add_argument('--src-audio')
    ap.add_argument('--out')
    ap.add_argument('--preview', action='store_true')
    ap.add_argument('--start', type=float, default=0)
    ap.add_argument('--end', type=float)
    ap.add_argument('--frames')
    ap.add_argument('--no-subs', action='store_true')
    args = ap.parse_args()
    sys.path.insert(0, HERE)
    tl = importlib.import_module(args.timeline)
    r = Renderer(tl, args.src)
    r.no_subs = args.no_subs
    if args.frames:
        base = args.out or 'frame'
        for ts in args.frames.split(','):
            img = (r.render(float(ts)) * 255).astype(np.uint8)
            Image.fromarray(img).save(f'{base}_{float(ts):06.2f}.png')
        return
    end = args.end or tl.DURATION
    fps = 15 if args.preview else FPS
    size = (W // 2, H // 2) if args.preview else (W, H)
    tmp_video = args.out + '.video.mp4'
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{size[0]}x{size[1]}',
                            '-r', str(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17' if not args.preview else '23',
                            '-pix_fmt', 'yuv420p', '-movflags', '+faststart', tmp_video], stdin=subprocess.PIPE)
    n = int(round((end - args.start) * fps))
    for i in range(n):
        t = args.start + i / fps
        img = (r.render(t) * 255 + 0.5).astype(np.uint8)
        if args.preview:
            img = cv2.resize(img, size, interpolation=cv2.INTER_AREA)
        enc.stdin.write(img.tobytes())
        if i % 60 == 0:
            print(f'{t:6.1f}s / {end:.1f}s', flush=True)
    enc.stdin.close()
    enc.wait()
    if args.src_audio:
        wav = args.out + '.audio.wav'
        build_audio(tl, args.src_audio, wav)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp_video, '-ss', str(args.start), '-i', wav,
                        '-map', '0:v', '-map', '1:a', '-t', str(end - args.start), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                        '-movflags', '+faststart', args.out], check=True)
        os.remove(wav)
        os.remove(tmp_video)
    else:
        os.replace(tmp_video, args.out)


if __name__ == '__main__':
    main()
