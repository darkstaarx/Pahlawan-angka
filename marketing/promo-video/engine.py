#!/usr/bin/env python3
"""Enjin render sinematik promo Pahlawan Angka (9:16, 1080x1920).

Bahasa visual (diinspirasikan daripada video rujukan pelancaran aplikasi):
- babak berwarna jenama (navy / emas / krim) dengan wipe jubin logo (+ − × ÷);
- teks kinetik: baris kecil ditaip huruf demi huruf, tajuk muncul huruf demi
  huruf daripada kabur ke tajam;
- rakaman skrin sebenar dalam telefon 3D (berketebalan, bayang, kilauan kaca);
- callout: bahagian UI sebenar "terangkat" keluar dari skrin sebagai kad
  terapung supaya mudah dibaca tanpa zoom seluruh telefon.

Motion lock: skrin, bingkai, sisi telefon, highlight dan titik permulaan callout
semuanya diunjur oleh `Pose` yang SAMA setiap bingkai.

Guna:
  python3 engine.py timeline_main --out out/promo-main.mp4 --workers 4
  python3 engine.py timeline_main --frames 3.5,12 --out build/semak
"""
import argparse, importlib, math, os, subprocess, sys, tempfile
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
FONT_DIR = '/usr/share/fonts/opentype/inter'
BUILD = os.environ.get('PROMO_BUILD', os.path.join(HERE, 'build'))

W, H, FPS = 1080, 1920, 30
SRC_W, SRC_H = 1080, 2236
SW = 520.0
SH = SW * SRC_H / SRC_W
BZ = 13.0
PW, PH = SW + 2 * BZ, SH + 2 * BZ
R_OUT, R_IN = 72.0, 60.0
THICK = 30.0
MARGIN = 8.0
FOCAL = 1900.0


def rgb(*c):
    return np.array(c, np.float32) / 255


GOLD = rgb(245, 184, 61)
NAVY = rgb(9, 16, 40)
TILE_COLORS = {'+': (244, 74, 46), '−': (48, 196, 92), '×': (22, 176, 242), '÷': (196, 82, 238)}

PALETTE = {
    'navy':  dict(top=(16, 27, 66), bot=(5, 8, 22), head=(255, 255, 255), kicker=(245, 184, 61), sub=(204, 214, 240), glow=0.16, particles=True),
    'deep':  dict(top=(10, 14, 36), bot=(2, 3, 10), head=(255, 255, 255), kicker=(245, 184, 61), sub=(204, 214, 240), glow=0.22, particles=True),
    'gold':  dict(top=(250, 198, 82), bot=(236, 158, 34), head=(14, 22, 54), kicker=(120, 58, 4), sub=(60, 40, 20), glow=0.0, particles=False),
    'cream': dict(top=(253, 248, 236), bot=(243, 232, 206), head=(14, 22, 54), kicker=(198, 124, 14), sub=(74, 84, 112), glow=0.0, particles=False),
}


def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name), size)


# ---------------------------------------------------------------- easing

def smooth(x):
    x = min(1.0, max(0.0, x))
    return x * x * x * (x * (x * 6 - 15) + 10)


def ease_out(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


def ease_back(x, s=1.6):
    x = min(1.0, max(0.0, x))
    return 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2


def ease_in(x):
    x = min(1.0, max(0.0, x))
    return x ** 3


EASE = {'smooth': smooth, 'out': ease_out, 'in': ease_in, 'back': ease_back,
        'linear': lambda x: min(1.0, max(0.0, x))}


def ramp(t, t0, t1, fin=0.3, fout=None):
    fout = fin if fout is None else fout
    if t < t0 or t > t1:
        return 0.0
    return smooth(min((t - t0) / fin, (t1 - t) / fout, 1.0))


# ---------------------------------------------------------------- pose & unjuran

POSE_KEYS = ['s', 'u', 'v', 'ox', 'oy', 'rz', 'ry', 'rx', 'a']
REST = dict(s=1.0, u=0.5, v=0.5, ox=540.0, oy=1190.0, rz=0.0, ry=0.0, rx=0.0, a=1.0)


class Pose:
    """Unjuran 3D: titik tempatan (x, y, z) -> piksel output. (u, v) fokus diletak di (ox, oy)."""

    def __init__(self, p, w=SW, h=SH):
        self.p, self.w, self.h = p, w, h
        rx, ry, rz = (math.radians(p[k]) for k in ('rx', 'ry', 'rz'))
        Rx = np.array([[1, 0, 0], [0, math.cos(rx), -math.sin(rx)], [0, math.sin(rx), math.cos(rx)]])
        Ry = np.array([[math.cos(ry), 0, math.sin(ry)], [0, 1, 0], [-math.sin(ry), 0, math.cos(ry)]])
        self.R = Rx @ Ry
        s = p['s']
        self.A = np.array([[s * math.cos(rz), -s * math.sin(rz)], [s * math.sin(rz), s * math.cos(rz)]])
        f = self._raw(np.array([[(p['u'] - 0.5) * w, (p['v'] - 0.5) * h, 0.0]]))[0]
        self.off = np.array([p['ox'], p['oy']]) - f

    def _raw(self, P3):
        Q = P3 @ self.R.T
        xy = FOCAL * Q[:, :2] / (Q[:, 2] + FOCAL)[:, None]
        return xy @ self.A.T

    def project(self, P3):
        P3 = np.asarray(P3, np.float64)
        if P3.shape[1] == 2:
            P3 = np.c_[P3, np.zeros(len(P3))]
        return self._raw(P3) + self.off

    def homography(self):
        R, F = self.R, FOCAL
        P = np.array([[F * R[0, 0], F * R[0, 1], 0], [F * R[1, 0], F * R[1, 1], 0], [R[2, 0], R[2, 1], F]])
        A3 = np.eye(3)
        A3[:2, :2] = self.A
        T = np.array([[1, 0, self.off[0]], [0, 1, self.off[1]], [0, 0, 1]])
        return T @ A3 @ P


class Track:
    def __init__(self, keys, base=None):
        cur = dict(base or REST)
        self.keys = []
        for k in keys:
            cur = dict(cur)
            cur.update(k[1])
            self.keys.append((k[0], cur, k[2] if len(k) > 2 else 'smooth'))

    def at(self, t):
        ks = self.keys
        if t <= ks[0][0]:
            return dict(ks[0][1])
        for (t0, a, _), (t1, b, e) in zip(ks, ks[1:]):
            if t0 <= t <= t1:
                k = EASE[e]((t - t0) / max(1e-6, t1 - t0))
                return {key: a[key] + (b[key] - a[key]) * k for key in POSE_KEYS}
        return dict(ks[-1][1])


def rounded_rect(w, h, r, n=10):
    pts = []
    for cx, cy, a0 in ((w / 2 - r, -h / 2 + r, -90), (w / 2 - r, h / 2 - r, 0),
                       (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return np.array(pts)


def roi_of(pts, pad=4):
    x0, y0 = np.floor(pts.min(0)).astype(int) - pad
    x1, y1 = np.ceil(pts.max(0)).astype(int) + pad
    x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
    if x1 <= x0 or y1 <= y0:
        return None
    return x0, y0, x1, y1


def poly_mask(pts, roi):
    x0, y0, x1, y1 = roi
    m = np.zeros((y1 - y0, x1 - x0), np.float32)
    cv2.fillPoly(m, [np.round((pts - [x0, y0]) * 16).astype(np.int32)], 1.0, cv2.LINE_AA, shift=4)
    return m


def over(dst, rgba, x, y, alpha=1.0):
    h, w = rgba.shape[:2]
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(dst.shape[1], x + w), min(dst.shape[0], y + h)
    if x1 <= x0 or y1 <= y0 or alpha <= 0.002:
        return
    s = rgba[y0 - y:y1 - y, x0 - x:x1 - x]
    a = s[..., 3:4] * alpha
    reg = dst[y0:y1, x0:x1]
    reg *= (1 - a)
    reg += s[..., :3] * a


def warp_plane(out, rgba, pose_dict, alpha=1.0, shadow=0.5, shadow_off=(14, 40), blur=18):
    """Imej RGBA (float) sebagai satah 3D. Saiz satah = saiz imej / 2 unit."""
    h, w = rgba.shape[:2]
    pw, ph = w / 2.0, h / 2.0
    pose = Pose(pose_dict, pw, ph)
    corners = pose.project(np.array([[-pw / 2, -ph / 2], [pw / 2, -ph / 2], [pw / 2, ph / 2], [-pw / 2, ph / 2]]))
    so = np.array(shadow_off) * pose_dict['s']
    roi = roi_of(np.vstack([corners, corners + so]), pad=int(blur * 2.5) + 4)
    if roi is None or alpha <= 0.002:
        return None
    x0, y0, x1, y1 = roi
    if shadow > 0:
        sm = cv2.GaussianBlur(poly_mask(corners + so, roi), (0, 0), blur)
        out[y0:y1, x0:x1] *= (1 - sm[..., None] * shadow * alpha)
    A = np.array([[pw / w, 0, -pw / 2], [0, ph / h, -ph / 2], [0, 0, 1]])
    Hm = np.array([[1, 0, -x0], [0, 1, -y0], [0, 0, 1]]) @ pose.homography() @ A
    eff = pose_dict['s'] * 0.5
    src = rgba
    if eff < 0.6:
        ds = max(0.15, eff * 1.4)
        src = cv2.resize(rgba, (max(2, int(w * ds)), max(2, int(h * ds))), interpolation=cv2.INTER_AREA)
        Hm = Hm @ np.array([[w / src.shape[1], 0, 0], [0, h / src.shape[0], 0], [0, 0, 1]])
    img = cv2.warpPerspective(src, Hm, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    a = img[..., 3:4] * alpha
    reg = out[y0:y1, x0:x1]
    reg *= (1 - a)
    reg += img[..., :3] * a
    return corners


# ---------------------------------------------------------------- aset

def build_bezel(ss):
    bw, bh = int(round((PW + 2 * MARGIN) * ss)), int(round((PH + 2 * MARGIN) * ss))
    m = MARGIN * ss
    yy = np.linspace(0, 1, bh)[:, None]
    xx = np.linspace(0, 1, bw)[None, :]
    base = 26 + 16 * (1 - yy) + 14 * np.abs(xx - 0.5)
    arr = np.zeros((bh, bw, 4), np.uint8)
    arr[..., 0] = np.clip(base, 0, 255)
    arr[..., 1] = np.clip(base + 3, 0, 255)
    arr[..., 2] = np.clip(base + 10, 0, 255)
    arr[..., 3] = 255
    body = Image.fromarray(arr, 'RGBA')
    mask = Image.new('L', (bw, bh), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([m, m, m + PW * ss, m + PH * ss], radius=R_OUT * ss, fill=255)
    md.rounded_rectangle([m + BZ * ss, m + BZ * ss, m + (BZ + SW) * ss, m + (BZ + SH) * ss], radius=R_IN * ss, fill=0)
    img = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
    img.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(img)
    lw = max(1, int(round(1.6 * ss)))
    d.rounded_rectangle([m, m, m + PW * ss, m + PH * ss], radius=R_OUT * ss, outline=(176, 184, 204, 255), width=lw)
    d.rounded_rectangle([m + 2.5 * ss, m + 2.5 * ss, m + (PW - 2.5) * ss, m + (PH - 2.5) * ss], radius=(R_OUT - 2.5) * ss, outline=(64, 70, 86, 255), width=lw)
    d.rounded_rectangle([m + (BZ - 1.5) * ss, m + (BZ - 1.5) * ss, m + (BZ + SW + 1.5) * ss, m + (BZ + SH + 1.5) * ss],
                        radius=(R_IN + 1.5) * ss, outline=(3, 4, 7, 255), width=max(1, int(2.5 * ss)))
    cx, cy, r = m + PW * ss / 2, m + BZ * ss / 2 + 0.5 * ss, 3.6 * ss
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(8, 9, 14, 255))
    return np.asarray(img, np.uint8)


def build_scene_bg(name):
    pal = PALETTE[name]
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    t = (yy / H)[..., None]
    bg = rgb(*pal['top']) * (1 - t) + rgb(*pal['bot']) * t
    if pal['glow'] > 0:
        d = np.sqrt((xx - W / 2) ** 2 + (yy - H * 0.6) ** 2) / 900
        bg += (np.clip(1 - d, 0, 1) ** 2 * pal['glow'])[..., None] * GOLD
        d2 = np.sqrt((xx - W * 0.1) ** 2 + (yy - H * 0.1) ** 2) / 760
        bg += (np.clip(1 - d2, 0, 1) ** 2 * 0.07)[..., None] * rgb(63, 208, 224)
        d = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2)
        bg *= (1 - np.clip(d - 0.33, 0, 1))[..., None]
    else:
        d = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H * 0.45) / H) ** 2)
        bg *= (1 - np.clip(d - 0.38, 0, 1) * 0.35)[..., None]
    return np.clip(bg, 0, 1).astype(np.float32)


def build_tile(sym, size=320):
    ss = 2
    s = size * ss
    col = TILE_COLORS[sym]
    pad = int(s * 0.12)
    im = Image.new('RGBA', (s + 2 * pad, s + 2 * pad), (0, 0, 0, 0))
    g = np.linspace(1.12, 0.82, s)[:, None]
    arr = np.zeros((s, s, 4), np.uint8)
    for c in range(3):
        arr[..., c] = np.clip(col[c] * g, 0, 255)
    arr[..., 3] = 255
    body = Image.fromarray(arr, 'RGBA')
    m = Image.new('L', (s, s), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.24), fill=255)
    tile = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    tile.paste(body, (0, 0), m)
    d = ImageDraw.Draw(tile)
    d.rounded_rectangle([s * 0.03, s * 0.03, s * 0.97, s * 0.97], radius=int(s * 0.22), outline=(255, 255, 255, 90), width=max(2, int(s * 0.02)))
    f = font('InterDisplay-Black.otf', int(s * 0.78))
    d.text((s / 2, s / 2 + s * 0.02), sym, font=f, fill=(255, 255, 255, 255), anchor='mm')
    im.alpha_composite(tile, (pad, pad))
    return np.asarray(im, np.float32) / 255


class Particles:
    def __init__(self, n=36, seed=3):
        rng = np.random.default_rng(seed)
        self.x, self.y = rng.uniform(0, W, n), rng.uniform(0, H, n)
        self.r, self.v = rng.uniform(1.5, 5.0, n), rng.uniform(8, 30, n)
        self.ph, self.depth = rng.uniform(0, 6.28, n), rng.uniform(0.3, 1.0, n)

    def layer(self, t, px):
        sm = np.zeros((H // 4, W // 4), np.float32)
        for x, y, r, v, ph, dp in zip(self.x, self.y, self.r, self.v, self.ph, self.depth):
            yy = (y - v * t) % H
            xx = (x + 16 * math.sin(t * 0.4 + ph) + px * dp) % W
            a = 0.45 + 0.55 * math.sin(t * 1.3 + ph)
            cv2.circle(sm, (int(xx / 4), int(yy / 4)), max(1, int(r * dp / 2)), 0.3 + 0.7 * a, -1, cv2.LINE_AA)
        return cv2.resize(cv2.GaussianBlur(sm, (0, 0), 1.5), (W, H))[..., None] * GOLD * 0.5


# ---------------------------------------------------------------- footage

class Source:
    def __init__(self, path):
        self.cap = cv2.VideoCapture(path)
        if not self.cap.isOpened():
            raise SystemExit(f'tidak dapat buka {path}')
        self.n = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.idx, self.frame = -1, None

    def get(self, i):
        i = max(0, min(self.n - 1, i))
        if i == self.idx and self.frame is not None:
            return self.frame
        if not (self.idx < i <= self.idx + 45) or self.frame is None:
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
    """segs = [(src_a, src_b, durasi_output)]; a == b = tahan bingkai."""

    def __init__(self, t0, t1, src, segs, name=''):
        self.t0, self.t1, self.src, self.segs, self.name = t0, t1, src, segs, name

    def src_time(self, t):
        tt = t - self.t0
        for a, b, d in self.segs:
            if tt <= d:
                return a + (b - a) * (tt / d if d > 0 else 0)
            tt -= d
        return self.segs[-1][1]


class Phone:
    def __init__(self, spec, sources):
        self.track = Track(spec['camera'])
        self.shots = spec['shots']
        self.highlights = spec.get('highlights', [])
        self.sources = sources
        self.readers = {}

    def reader(self, src, slot):
        key = (src, slot)
        if key not in self.readers:
            self.readers[key] = Source(self.sources[src])
        return self.readers[key]

    def frame(self, i, t):
        sh = self.shots[i]
        st = sh.src_time(min(max(t, sh.t0), sh.t1))
        return self.reader(sh.src, i % 2).get(int(round(st * FPS)))

    def screen(self, t, xf=0.1):
        shots = self.shots
        for i, sh in enumerate(shots):
            if sh.t0 <= t < sh.t1 or (i == len(shots) - 1 and t >= sh.t0) or (i == 0 and t < sh.t0):
                cur = self.frame(i, t)
                if i + 1 < len(shots) and t > sh.t1 - xf and shots[i + 1].t0 <= sh.t1 + 1e-3:
                    k = smooth((t - (sh.t1 - xf)) / (2 * xf))
                    return cv2.addWeighted(cur, 1 - k, self.frame(i + 1, shots[i + 1].t0), k, 0)
                if i > 0 and t < sh.t0 + xf and shots[i - 1].t1 >= sh.t0 - 1e-3:
                    k = smooth((t - (sh.t0 - xf)) / (2 * xf))
                    return cv2.addWeighted(self.frame(i - 1, shots[i - 1].t1), 1 - k, cur, k, 0)
                return cur
        return None


# ---------------------------------------------------------------- teks

class Glyphs:
    def __init__(self):
        self.cache = {}

    def img(self, text, fnt, color, shadow=0.0, outline=0, blur=0.0):
        key = (text, fnt.path, fnt.size, color, shadow, outline, round(blur, 1))
        if key in self.cache:
            return self.cache[key]
        bb = fnt.getbbox(text)
        pad = 30
        w, h = max(1, bb[2] - bb[0]) + 2 * pad, fnt.size + int(fnt.size * 0.35) + 2 * pad
        im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        if outline:
            d.text((pad - bb[0], pad), text, font=fnt, fill=(0, 0, 0, 0), stroke_width=outline, stroke_fill=color + (255,))
        else:
            d.text((pad - bb[0], pad), text, font=fnt, fill=color + (255,))
        if shadow > 0:
            a = im.getchannel('A').filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * shadow))
            sh = Image.new('RGBA', im.size, (2, 5, 16, 0))
            sh.putalpha(a)
            im = Image.alpha_composite(sh, im)
        if blur > 0.3:
            im = im.filter(ImageFilter.GaussianBlur(blur))
        arr = np.asarray(im, np.float32) / 255
        self.cache[key] = (arr, pad - bb[0], pad)
        return self.cache[key]


def wrap_text(text, fnt, maxw):
    lines, cur = [], ''
    for w in text.split():
        nxt = (cur + ' ' + w).strip()
        if cur and fnt.getlength(nxt) > maxw:
            lines.append(cur)
            cur = w
        else:
            cur = nxt
    if cur:
        lines.append(cur)
    return lines


# ---------------------------------------------------------------- renderer

class Renderer:
    def __init__(self, tl):
        self.tl = tl
        srcs = {k: os.path.join(BUILD, v) for k, v in tl.SOURCES.items()}
        self.phones = [Phone(p, srcs) for p in tl.PHONES]
        self.scene_bg = {k: build_scene_bg(k) for k in PALETTE}
        self.tiles = {s: build_tile(s) for s in TILE_COLORS}
        self.particles = Particles()
        self.bezels = {ss: build_bezel(ss) for ss in (1, 2, 3)}
        self.g = Glyphs()
        self.body_front = rounded_rect(PW, PH, R_OUT)
        self.screen_poly = rounded_rect(SW, SH, R_IN)
        self.fonts = dict(
            kicker=font('Inter-Bold.otf', 32), head=font('InterDisplay-ExtraBold.otf', 80),
            sub=font('Inter-Medium.otf', 40), beat=font('InterDisplay-Black.otf', 170),
            slate=font('InterDisplay-ExtraBold.otf', 124), slate_o=font('InterDisplay-Bold.otf', 124),
        )
        self.specials = [sp(self) if callable(sp) else sp for sp in getattr(tl, 'SPECIALS', [])]

    def scene_at(self, t):
        sc = self.tl.SCENES
        cur = sc[0]
        for s in sc:
            if s['t0'] <= t:
                cur = s
        return cur

    def palette(self, t):
        return PALETTE[self.scene_at(t)['bg']]

    # -- latar: warna babak + wipe jubin + jubin terapung
    def background(self, t):
        sc = self.tl.SCENES
        idx = max(i for i, s in enumerate(sc) if s['t0'] <= t) if t >= sc[0]['t0'] else 0
        cur = sc[idx]
        out = self.scene_bg[cur['bg']].copy()
        if PALETTE[cur['bg']]['particles']:
            out += self.particles.layer(t, 0)
        self.draw_tiles(out, cur, t)
        # wipe ke babak seterusnya
        if idx + 1 < len(sc):
            nxt = sc[idx + 1]
            tb = nxt['t0']
            wd = nxt.get('wipe', 0.5)
            if wd and tb - wd <= t < tb:
                k = ease_in((t - (tb - wd)) / wd)
                ox, oy = nxt.get('origin', (540, 1180))
                sym = nxt.get('wipe_tile', '×')
                acc = rgb(*TILE_COLORS[sym])
                for kk, col, layer in ((min(1, k * 1.12), acc, None), (max(0, k * 1.12 - 0.12), None, nxt)):
                    if kk <= 0:
                        continue
                    size = 40 + 2900 * kk
                    rr = rounded_rect(size, size, size * 0.24)
                    a = math.radians(20 + 70 * kk)
                    R = np.array([[math.cos(a), -math.sin(a)], [math.sin(a), math.cos(a)]])
                    pts = rr @ R.T + [ox, oy]
                    m = poly_mask(pts, (0, 0, W, H))[..., None]
                    if layer is None:
                        out = out * (1 - m) + col * m
                    else:
                        nb = self.scene_bg[layer['bg']]
                        out = out * (1 - m) + nb * m
        return out

    def draw_tiles(self, out, scene, t):
        for tile in scene.get('tiles', []):
            sym, x, y, size, rot = tile[:5]
            delay = tile[5] if len(tile) > 5 else 0.0
            k = ease_back((t - scene['t0'] - 0.15 - delay) / 0.55)
            if k <= 0:
                continue
            drift = math.sin(t * 0.7 + x * 0.01) * 14
            ang = rot + 6 * math.sin(t * 0.5 + y * 0.01)
            img = self.tiles[sym]
            sc = size / (img.shape[1] / 2) * max(0.01, k)
            pose = dict(REST, s=sc, ox=x, oy=y + drift, rz=ang, ry=8 * math.sin(t * 0.6 + x), rx=0, a=1)
            warp_plane(out, img, pose, alpha=min(1, k), shadow=0.25, shadow_off=(10, 26), blur=14)

    # -- telefon
    def draw_phone(self, out, ph, t):
        p = ph.track.at(t)
        if p['a'] <= 0.003:
            return None
        rest = max(0.0, 1 - abs(p['s'] - 1.0) / 0.25)
        p['oy'] += 6 * math.sin(t * 0.9) * rest
        p['ry'] += 1.2 * math.sin(t * 0.55) * rest
        alpha = p['a']
        pose = Pose(p)
        front = pose.project(self.body_front)
        back = pose.project(np.c_[self.body_front, np.full(len(self.body_front), THICK)])
        allp = np.vstack([front, back])
        roi = roi_of(np.vstack([allp, allp + [26 * p['s'], 64 * p['s']]]), pad=60)
        if roi is None:
            return None
        x0, y0, x1, y1 = roi
        reg = out[y0:y1, x0:x1]
        light_bg = not PALETTE[self.scene_at(t)['bg']]['particles']
        sm = cv2.GaussianBlur(poly_mask(allp + [22 * p['s'], 58 * p['s']], roi), (0, 0), 28 * p['s'] + 4) * (0.42 if light_bg else 0.62)
        sm2 = cv2.GaussianBlur(poly_mask(allp + [6, 16 * p['s']], roi), (0, 0), 6) * (0.25 if light_bg else 0.35)
        reg *= (1 - np.clip(sm + sm2, 0, 0.9)[..., None] * alpha)
        hull = cv2.convexHull(allp.astype(np.float32)).reshape(-1, 2)
        side = poly_mask(hull, roi)
        lit = 0.6 + 0.4 * abs(math.sin(math.radians(p['ry'] * 1.6)))
        reg *= (1 - side[..., None] * alpha)
        reg += side[..., None] * rgb(70, 76, 92) * lit * alpha
        edge = np.zeros(side.shape, np.float32)
        cv2.polylines(edge, [np.round((back - [x0, y0]) * 16).astype(np.int32)], True, 1.0, 2, cv2.LINE_AA, shift=4)
        reg += edge[..., None] * rgb(120, 126, 142) * 0.5 * alpha * side[..., None]
        f = ph.screen(t)
        Hm = np.array([[1, 0, -x0], [0, 1, -y0], [0, 0, 1]]) @ pose.homography()
        eff = p['s'] * SW / SRC_W
        if f is not None:
            if eff < 0.62:
                ds = max(0.2, eff * 1.3)
                f = cv2.resize(f, (int(SRC_W * ds), int(SRC_H * ds)), interpolation=cv2.INTER_AREA)
            fh, fw = f.shape[:2]
            A = np.array([[SW / fw, 0, -SW / 2], [0, SH / fh, -SH / 2], [0, 0, 1]])
            scr = cv2.warpPerspective(f, Hm @ A, (x1 - x0, y1 - y0), flags=cv2.INTER_CUBIC if eff > 0.9 else cv2.INTER_LINEAR)
            scr = scr[..., ::-1].astype(np.float32) / 255
        else:
            scr = np.zeros((y1 - y0, x1 - x0, 3), np.float32)
        smask = poly_mask(pose.project(self.screen_poly), roi)
        yy, xx = np.mgrid[0:(y1 - y0):4, 0:(x1 - x0):4].astype(np.float32)
        c = pose.project(np.array([[0.0, 0.0]]))[0] - [x0, y0]
        band = ((xx - c[0]) * 0.6 + (yy - c[1]) * 0.8) / (p['s'] * SH)
        g = np.exp(-((band - (-0.28 + p['ry'] / 45 + p['rx'] / 70)) / 0.09) ** 2) * 0.07 + 0.012
        scr = np.clip(scr + cv2.resize(g, (x1 - x0, y1 - y0))[..., None], 0, 1)
        reg *= (1 - smask[..., None] * alpha)
        reg += scr * smask[..., None] * alpha
        for (t0, t1, u0, v0, u1, v1) in ph.highlights:
            a = ramp(t, t0, t1, 0.25)
            if a <= 0:
                continue
            w_, h_ = (u1 - u0) * SW, (v1 - v0) * SH
            cx, cy = ((u0 + u1) / 2 - 0.5) * SW, ((v0 + v1) / 2 - 0.5) * SH
            grow = 1 + 0.06 * (1 - ease_out((t - t0) / 0.35))
            pts = pose.project(rounded_rect(w_ * grow, h_ * grow, min(14, h_ / 3)) + [cx, cy])
            line = np.zeros(side.shape, np.float32)
            cv2.polylines(line, [np.round((pts - [x0, y0]) * 16).astype(np.int32)], True, 1.0, max(2, int(3.2 * p['s'])), cv2.LINE_AA, shift=4)
            m = np.clip(line + cv2.GaussianBlur(line, (0, 0), 7 * p['s'] + 2) * 1.6, 0, 1)[..., None] * a * alpha
            reg *= (1 - m)
            reg += GOLD * m
        ss = 3 if eff > 1.0 else (2 if eff > 0.5 else 1)
        Ab = np.array([[1 / ss, 0, -(PW / 2 + MARGIN)], [0, 1 / ss, -(PH / 2 + MARGIN)], [0, 0, 1]])
        bzw = cv2.warpPerspective(self.bezels[ss], Hm @ Ab, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR).astype(np.float32) / 255
        ba = bzw[..., 3:4] * alpha
        reg *= (1 - ba)
        reg += bzw[..., :3] * ba
        return pose, roi

    def motion_blur(self, out, ph, t, roi):
        c0 = Pose(ph.track.at(t - 1 / FPS)).project(np.array([[0.0, 0.0]]))[0]
        c1 = Pose(ph.track.at(t)).project(np.array([[0.0, 0.0]]))[0]
        d = c1 - c0
        L = float(np.hypot(*d)) * 0.9
        if L < 5:
            return
        n = int(min(L, 80)) | 1
        k = np.zeros((n, n), np.float32)
        cv2.line(k, (0, n // 2), (n - 1, n // 2), 1.0, 1)
        M = cv2.getRotationMatrix2D((n / 2 - 0.5, n / 2 - 0.5), -math.degrees(math.atan2(d[1], d[0])), 1.0)
        k = cv2.warpAffine(k, M, (n, n))
        k /= max(1e-6, k.sum())
        x0, y0, x1, y1 = roi
        out[y0:y1, x0:x1] = cv2.filter2D(out[y0:y1, x0:x1], -1, k)

    # -- teks
    def draw_texts(self, out, t):
        F, G = self.fonts, self.g
        for spec in self.tl.TEXTS:
            t0, t1 = spec['t0'], spec['t1']
            if not (t0 - 0.01 <= t <= t1 + 0.01):
                continue
            pal = PALETTE[spec.get('pal') or self.scene_at(t0 + 0.01)['bg']]
            style = spec.get('style', 'type')
            a_out = 1 - smooth((t - (t1 - 0.25)) / 0.25)
            dark = pal['particles']
            if style == 'beat':
                k = ease_out((t - t0) / 0.16)
                sc = 1.2 - 0.2 * k
                arr, ox, oy = G.img(spec['head'], F['beat'], pal['head'], shadow=0.6 if dark else 0)
                if abs(sc - 1) > 0.002:
                    arr = cv2.resize(arr, None, fx=sc, fy=sc, interpolation=cv2.INTER_LINEAR)
                y = spec.get('y', 300)
                over(out, arr, (W - arr.shape[1]) // 2, int(y - arr.shape[0] / 2), k * a_out)
            elif style == 'slate':
                self.draw_slate(out, spec, pal, t, a_out)
            else:
                self.draw_type(out, spec, pal, t, a_out)

    def draw_type(self, out, spec, pal, t, a_out):
        F, G = self.fonts, self.g
        t0 = spec['t0']
        x = spec.get('x', 84)
        y = spec.get('y', 150)
        dark = pal['particles']
        shadow = 0.55 if dark else 0.0
        dy_out = -(1 - a_out) * 24
        center = spec.get('align') == 'center'
        if spec.get('kicker'):
            n = int(max(0, t - t0) / 0.028)
            sub = spec['kicker'][:n]
            if sub:
                arr, ox, oy = G.img(sub, F['kicker'], pal['kicker'], shadow=shadow * 0.6)
                kx = (W - F['kicker'].getlength(spec['kicker'])) / 2 if center else x
                over(out, arr, int(kx - ox), int(y - oy + dy_out), a_out)
            y += 52
        d0 = spec.get('head_delay', 0.18)
        fh = F['head'] if not spec.get('small') else font('InterDisplay-ExtraBold.otf', 68)
        lh = int(fh.size * 1.08)
        ci = 0
        for li, line in enumerate(wrap_text(spec['head'], fh, spec.get('maxw', 920))):
            lx = (W - fh.getlength(line)) / 2 if center else x
            for j, ch in enumerate(line):
                if ch == ' ':
                    ci += 1
                    continue
                k = ease_out((t - t0 - d0 - 0.024 * ci) / 0.42)
                ci += 1
                if k <= 0:
                    continue
                blur = (1 - k) * 14
                arr, ox, oy = G.img(ch, fh, pal['head'], shadow=shadow, blur=round(blur / 3.5) * 3.5)
                cx = lx + fh.getlength(line[:j])
                over(out, arr, int(cx - ox + (1 - k) * 26), int(y + li * lh - oy + dy_out), k * a_out)
        y += len(wrap_text(spec['head'], fh, spec.get('maxw', 920))) * lh + 14
        if spec.get('sub'):
            ks = ease_out((t - t0 - d0 - 0.35) / 0.45) * a_out
            for li, line in enumerate(wrap_text(spec['sub'], F['sub'], spec.get('maxw', 920))):
                arr, ox, oy = G.img(line, F['sub'], pal['sub'], shadow=shadow * 0.7)
                sx = (W - F['sub'].getlength(line)) / 2 if center else x
                over(out, arr, int(sx - ox), int(y + li * 52 - oy + (1 - ks) * 16 + dy_out), ks)

    def draw_slate(self, out, spec, pal, t, a_out):
        """Teks besar berpusat: setiap perkataan [(teks, masa, 'fill'|'outline'), ...] per baris."""
        F, G = self.fonts, self.g
        fs = spec.get('size', 124)
        ff = font('InterDisplay-ExtraBold.otf', fs)
        fo = font('InterDisplay-Bold.otf', fs)
        lh = int(fs * 1.12)
        lines = spec['lines']
        y = spec.get('y', (H - lh * len(lines)) / 2)
        for li, words in enumerate(lines):
            widths = [(ff if st == 'fill' else fo).getlength(w) for w, _, st in words]
            space = ff.getlength(' ')
            total = sum(widths) + space * (len(words) - 1)
            x = (W - total) / 2
            for (w, tw, st), ww in zip(words, widths):
                if t >= tw:
                    if st == 'fill':
                        n = min(len(w), int((t - tw) / 0.035) + 1)
                        arr, ox, oy = G.img(w[:n], ff, pal['head'])
                        over(out, arr, int(x - ox), int(y + li * lh - oy), a_out)
                    else:
                        k = ease_out((t - tw) / 0.45)
                        arr, ox, oy = G.img(w, fo, pal['head'], outline=3, blur=round((1 - k) * 10 / 3.5) * 3.5)
                        over(out, arr, int(x - ox), int(y + li * lh - oy + (1 - k) * 50), k * a_out)
                x += ww + space

    def render(self, t):
        out = self.background(t)
        for sp in self.specials:
            if getattr(sp, 'layer', 'front') == 'back' and sp.active(t):
                sp.draw(out, t)
        for ph in self.phones:
            r = self.draw_phone(out, ph, t)
            if r is not None:
                self.motion_blur(out, ph, t, r[1])
        z = max((smooth((ph.track.at(t)['s'] - 1.12) / 0.45) * ph.track.at(t)['a'] for ph in self.phones), default=0)
        if z > 0:
            base = rgb(*self.palette(t)['top'])
            yy = np.arange(760, dtype=np.float32)
            g = (1 - np.clip((yy - 500) / 260, 0, 1) ** 2) * 0.94 * z
            out[:760] = out[:760] * (1 - g[:, None, None]) + base * g[:, None, None]
        for sp in self.specials:
            if getattr(sp, 'layer', 'front') == 'front' and sp.active(t):
                sp.draw(out, t)
        for (tf, dur, strength) in getattr(self.tl, 'FLASHES', []):
            if tf - 0.05 <= t <= tf + dur:
                k = (t - tf + 0.05) / (dur + 0.05)
                e = math.sin(min(1, k * 4) * math.pi / 2) * (1 - k) ** 1.5 * strength
                out += (GOLD * 0.6 + 0.4) * e
        self.draw_texts(out, t)
        return np.clip(out, 0, 1)


# ---------------------------------------------------------------- grafik khas

class Callout:
    """Bahagian UI sebenar diangkat keluar dari skrin telefon sebagai kad terapung."""

    def __init__(self, r, phone, t0, t1, rect, x, y, width, ry=0.0, rz=0.0, ring=True):
        self.r, self.ph = r, r.phones[phone]
        self.t0, self.t1, self.rect = t0, t1, rect
        self.x, self.y, self.width, self.ry, self.rz, self.ring = x, y, width, ry, rz, ring
        u0, v0, u1, v1 = rect
        self.px = (int(u0 * SRC_W), int(v0 * SRC_H), int(u1 * SRC_W), int(v1 * SRC_H))
        cw, ch = self.px[2] - self.px[0], self.px[3] - self.px[1]
        m = Image.new('L', (cw, ch), 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, cw - 1, ch - 1], radius=int(min(cw, ch) * 0.12 + 10), fill=255)
        self.mask = (np.asarray(m, np.float32) / 255)[..., None]
        border = Image.new('L', (cw, ch), 0)
        ImageDraw.Draw(border).rounded_rectangle([1, 1, cw - 2, ch - 2], radius=int(min(cw, ch) * 0.12 + 10), outline=255, width=5)
        self.border = (np.asarray(border, np.float32) / 255)[..., None]
        self.layer = 'front'

    def active(self, t):
        return self.t0 <= t <= self.t1

    def draw(self, out, t):
        f = self.ph.screen(t)
        if f is None:
            return
        x0, y0, x1, y1 = self.px
        crop = f[y0:y1, x0:x1][..., ::-1].astype(np.float32) / 255
        if self.ring:
            crop = crop * (1 - self.border) + GOLD * self.border
        rgba = np.concatenate([crop, self.mask], 2)
        cw, ch = crop.shape[1], crop.shape[0]
        # titik mula: lokasi sebenar elemen pada skrin telefon (pose yang sama)
        pp = self.ph.track.at(t)
        pose = Pose(pp)
        u0, v0, u1, v1 = self.rect
        c_screen = pose.project(np.array([[((u0 + u1) / 2 - 0.5) * SW, ((v0 + v1) / 2 - 0.5) * SH]]))[0]
        s_start = pp['s'] * (u1 - u0) * SW / (cw / 2)
        s_end = self.width / (cw / 2)
        kin = ease_back((t - self.t0) / 0.55, 1.2)
        kout = smooth((t - (self.t1 - 0.35)) / 0.35)
        k = kin * (1 - kout)
        float_y = math.sin((t - self.t0) * 1.6) * 5 * min(1, kin)
        pd = dict(REST, s=s_start + (s_end - s_start) * k,
                  ox=c_screen[0] + (self.x - c_screen[0]) * k, oy=c_screen[1] + (self.y - c_screen[1]) * k + float_y,
                  ry=pp['ry'] * (1 - k) + self.ry * k, rx=pp['rx'] * (1 - k) + 4 * k, rz=pp['rz'] * (1 - k) + self.rz * k, a=1)
        a = min(1, (t - self.t0) / 0.12) * (1 - smooth((t - (self.t1 - 0.12)) / 0.12))
        warp_plane(out, rgba, pd, alpha=a, shadow=0.55 * k, shadow_off=(16, 44), blur=22)


class TierPills:
    """Tiga pil tahap kunci (Gangsa, Perak, Emas) yang menyala mengikut masa."""

    def __init__(self, t0, t1, y, items):
        self.t0, self.t1, self.y, self.items, self.layer = t0, t1, y, items, 'front'
        self.imgs = {}
        f = font('InterDisplay-ExtraBold.otf', 48)
        for label, col, _ in items:
            for on in (False, True):
                bw, bh, pad = int(f.getlength(label)) + 76, 88, 26
                im = Image.new('RGBA', (bw + 2 * pad, bh + 2 * pad), (0, 0, 0, 0))
                if on:
                    g = Image.new('RGBA', im.size, (0, 0, 0, 0))
                    ImageDraw.Draw(g).rounded_rectangle([pad, pad, pad + bw, pad + bh], radius=44, fill=col + (210,))
                    im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(16)))
                d = ImageDraw.Draw(im)
                if on:
                    d.rounded_rectangle([pad, pad, pad + bw, pad + bh], radius=44, fill=col + (255,))
                    d.text((pad + bw / 2, pad + bh / 2), label, font=f, fill=(16, 16, 30, 255), anchor='mm')
                else:
                    d.rounded_rectangle([pad, pad, pad + bw, pad + bh], radius=44, outline=col + (170,), width=3, fill=(10, 18, 40, 150))
                    d.text((pad + bw / 2, pad + bh / 2), label, font=f, fill=col + (170,), anchor='mm')
                self.imgs[(label, on)] = np.asarray(im, np.float32) / 255

    def active(self, t):
        return self.t0 <= t <= self.t1

    def draw(self, out, t):
        a = ramp(t, self.t0, self.t1, 0.3)
        ims = [self.imgs[(lb, t >= ton)] for lb, _, ton in self.items]
        gap = -18
        total = sum(i.shape[1] for i in ims) + gap * (len(ims) - 1)
        x = (W - total) // 2
        for i, ((lb, _, ton), im) in enumerate(zip(self.items, ims)):
            k = ease_back((t - self.t0 - 0.08 * i) / 0.45)
            if k <= 0:
                x += im.shape[1] + gap
                continue
            pop = 1 + 0.14 * math.sin(min(1, max(0, (t - ton) / 0.35)) * math.pi) if t >= ton else 1
            sc = max(0.05, k * pop)
            im2 = cv2.resize(im, None, fx=sc, fy=sc, interpolation=cv2.INTER_LINEAR) if abs(sc - 1) > 1e-3 else im
            over(out, im2, int(x + (im.shape[1] - im2.shape[1]) / 2), int(self.y - im2.shape[0] / 2), a * min(1, k))
            x += im.shape[1] + gap


class CardGrid:
    """Kad aset sebenar (teman / trofi) terbalik masuk dalam 3D."""

    def __init__(self, t0, t1, items, cols=3, card=(300, 380), y0=760, gap=(26, 30), frame=(20, 32, 72)):
        self.t0, self.t1, self.items, self.cols = t0, t1, items, cols
        self.card, self.y0, self.gap, self.frame = card, y0, gap, frame
        self.cards = [self._card(*it) for it in items]
        self.layer = 'front'

    def _card(self, name, sub, path):
        cw, ch = self.card
        ss = 2
        im = Image.new('RGBA', (cw * ss, ch * ss), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([0, 0, cw * ss - 1, ch * ss - 1], radius=34 * ss, fill=self.frame + (252,), outline=(245, 184, 61, 220), width=3 * ss)
        glow = Image.new('RGBA', im.size, (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([cw * ss * 0.12, ch * ss * 0.06, cw * ss * 0.88, ch * ss * 0.66], fill=(90, 120, 255, 80))
        im = Image.alpha_composite(im, glow.filter(ImageFilter.GaussianBlur(30)))
        sp = Image.open(os.path.join(REPO, path)).convert('RGBA')
        sp = sp.crop(sp.getbbox())
        sp.thumbnail((int(cw * ss * 0.8), int(ch * ss * 0.56)), Image.LANCZOS)
        im.alpha_composite(sp, ((cw * ss - sp.width) // 2, int(ch * ss * 0.05 + (ch * ss * 0.58 - sp.height) / 2)))
        d = ImageDraw.Draw(im)
        fn = font('InterDisplay-ExtraBold.otf', 34 * ss)
        if fn.getlength(name) > cw * ss * 0.9:
            fn = font('InterDisplay-ExtraBold.otf', 27 * ss)
        d.text((cw * ss / 2, ch * ss * 0.72), name, font=fn, fill=(255, 255, 255, 255), anchor='mm')
        d.text((cw * ss / 2, ch * ss * 0.85), sub, font=font('Inter-Medium.otf', 21 * ss), fill=(176, 192, 228, 255), anchor='mm')
        return np.asarray(im, np.float32) / 255

    def active(self, t):
        return self.t0 - 0.05 <= t <= self.t1 + 0.05

    def draw(self, out, t):
        cw, ch = self.card
        for i, c in enumerate(self.cards):
            r, col = divmod(i, self.cols)
            n_in_row = min(self.cols, len(self.cards) - r * self.cols)
            x = W / 2 + (col - (n_in_row - 1) / 2) * (cw + self.gap[0])
            y = self.y0 + r * (ch + self.gap[1])
            k = ease_out((t - self.t0 - 0.08 * i) / 0.55)
            ko = smooth((t - (self.t1 - 0.3)) / 0.3)
            if k <= 0:
                continue
            pose = dict(REST, s=1.0 - 0.1 * ko, ox=x, oy=y + math.sin(t * 1.2 + i) * 4 + (1 - k) * 60,
                        ry=(1 - k) * 80 + (col - (n_in_row - 1) / 2) * 7, rx=(1 - k) * 12 + 4, rz=0, a=1)
            warp_plane(out, c, pose, alpha=min(1, k * 1.5) * (1 - ko), shadow=0.4)


class PdfPages:
    """Halaman PDF sebenar terbang keluar dan terapung dalam 3D."""

    def __init__(self, t0, t1, pages, keys_list):
        self.t0, self.t1, self.layer = t0, t1, 'front'
        self.pages = []
        for p in pages:
            im = Image.open(p).convert('RGBA')
            im.thumbnail((1100, 1556), Image.LANCZOS)
            ImageDraw.Draw(im).rectangle([0, 0, im.width - 1, im.height - 1], outline=(214, 218, 226, 255), width=2)
            self.pages.append(np.asarray(im, np.float32) / 255)
        self.tracks = [Track(k) for k in keys_list]

    def active(self, t):
        return self.t0 <= t <= self.t1

    def draw(self, out, t):
        for img, tr in zip(self.pages, self.tracks):
            p = tr.at(t)
            if p['a'] > 0.003:
                warp_plane(out, img, p, alpha=p['a'], shadow=0.45, shadow_off=(20, 50), blur=26)


class LogoReveal:
    """Logo jenama dengan jubin + − × ÷ berputar masuk."""

    def __init__(self, t0, t1, y=820, scale=1.0, tag=None, tag_t=None, cta=None, cta_t=None, dark_text=True):
        self.t0, self.t1, self.y, self.layer = t0, t1, y, 'front'
        logo = Image.open(os.path.join(REPO, 'assets/branding/pahlawan-angka-full-logo-v1.png')).convert('RGBA')
        logo = logo.crop(logo.getbbox())
        logo.thumbnail((int(860 * scale), int(860 * scale)), Image.LANCZOS)
        self.logo = np.asarray(logo, np.float32) / 255
        col = (14, 22, 54) if dark_text else (255, 255, 255)
        self.tag = self.tag_t = None
        if tag:
            f1 = font('InterDisplay-Bold.otf', 54)
            im = Image.new('RGBA', (W, 80 * len(tag)), (0, 0, 0, 0))
            d = ImageDraw.Draw(im)
            for i, ln in enumerate(tag):
                d.text((W / 2, 8 + i * 68), ln, font=f1, fill=col + (255,), anchor='mt')
            self.tag, self.tag_t = np.asarray(im, np.float32) / 255, tag_t
        self.cta = self.cta_t = None
        if cta:
            f2 = font('Inter-ExtraBold.otf', 46)
            bw, bh = int(f2.getlength(cta)) + 120, 112
            im = Image.new('RGBA', (bw + 80, bh + 80), (0, 0, 0, 0))
            g = Image.new('RGBA', im.size, (0, 0, 0, 0))
            ImageDraw.Draw(g).rounded_rectangle([40, 48, 40 + bw, 48 + bh], radius=56, fill=(9, 16, 40, 110))
            im = Image.alpha_composite(im, g.filter(ImageFilter.GaussianBlur(16)))
            d = ImageDraw.Draw(im)
            d.rounded_rectangle([40, 40, 40 + bw, 40 + bh], radius=56, fill=(14, 22, 54, 255))
            d.text((40 + bw / 2, 40 + bh / 2), cta, font=f2, fill=(245, 184, 61, 255), anchor='mm')
            self.cta, self.cta_t = np.asarray(im, np.float32) / 255, cta_t

    def active(self, t):
        return self.t0 <= t <= self.t1

    def draw(self, out, t):
        a = 1 - smooth((t - (self.t1 - 0.3)) / 0.3)
        k = ease_back((t - self.t0) / 0.7, 1.3)
        if k <= 0:
            return
        sc = max(0.05, 0.6 + 0.4 * k)
        lg = cv2.resize(self.logo, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
        over(out, lg, (W - lg.shape[1]) // 2, int(self.y - lg.shape[0] / 2), min(1, k * 1.4) * a)
        if self.tag is not None:
            at = ease_out((t - self.tag_t) / 0.5) * a
            over(out, self.tag, 0, int(self.y + self.logo.shape[0] / 2 + 40 + (1 - at) * 24), at)
        if self.cta is not None:
            ac = ease_back((t - self.cta_t) / 0.5) * a
            if ac > 0:
                pulse = 1 + 0.02 * math.sin((t - self.cta_t) * 4)
                c2 = cv2.resize(self.cta, None, fx=max(0.05, pulse * ac), fy=max(0.05, pulse * ac), interpolation=cv2.INTER_LINEAR)
                over(out, c2, (W - c2.shape[1]) // 2, int(self.y + self.logo.shape[0] / 2 + 210 - c2.shape[0] / 2 + 56), min(1, ac))


# ---------------------------------------------------------------- audio

def build_audio(tl, out_wav):
    from scipy.io import wavfile
    import music
    SR = music.SR
    n = int(tl.DURATION * SR)
    mus = music.render_music(tl.MUSIC, tl.DURATION + 0.5, start_offset=getattr(tl, 'MUSIC_OFFSET', 0.0))[:n]
    sfx = np.zeros((n, 2))
    duck = np.ones(n)
    cache = {}
    for ev in tl.SFX:
        kind, at = ev[0], ev[1]
        i = int(at * SR)
        if kind == 'src':
            _, _, src, s0, s1, gain = ev
            if src not in cache:
                sr, x = wavfile.read(os.path.join(BUILD, tl.SOURCES_AUDIO[src]))
                cache[src] = x.astype(np.float64) / 32768
            x = cache[src][int(s0 * SR):int(s1 * SR)].copy()
            fi, fo = min(len(x), int(0.06 * SR)), min(len(x), int(0.2 * SR))
            x[:fi] *= np.linspace(0, 1, fi)[:, None]
            x[-fo:] *= np.linspace(1, 0, fo)[:, None]
            x = x * gain
            duck[i:i + len(x)] = np.minimum(duck[i:i + len(x)], 0.6)
        elif kind == 'whoosh':
            x = music.whoosh(ev[2]) * ev[3]
        elif kind == 'pop':
            x = music.pop() * ev[2]
        elif kind == 'impact':
            x = np.stack([music.impact()] * 2, 1) * ev[2]
        elif kind == 'shimmer':
            x = music.shimmer() * ev[2]
        else:
            continue
        seg = x[: max(0, n - i)]
        sfx[i:i + len(seg)] += seg
    k = int(0.15 * SR)
    duck = np.convolve(duck, np.ones(k) / k, mode='same')
    mix = mus * duck[:, None] + sfx
    mix /= max(1e-6, np.abs(mix).max()) / 0.9
    tmp = out_wav + '.raw.wav'
    wavfile.write(tmp, SR, (mix * 32767).astype(np.int16))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.2:LRA=9,aresample=48000', '-ar', '48000', out_wav + '.n.wav'], check=True)
    os.replace(out_wav + '.n.wav', out_wav)
    os.remove(tmp)


# ---------------------------------------------------------------- main

def render_range(tl, start, end, path):
    r = Renderer(tl)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', path], stdin=subprocess.PIPE)
    for i in range(start, end):
        enc.stdin.write((r.render(i / FPS) * 255 + 0.5).astype(np.uint8).tobytes())
        if (i - start) % 90 == 0:
            print(f'[{start}-{end}] {i / FPS:6.1f}s', flush=True)
    enc.stdin.close()
    enc.wait()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('timeline')
    ap.add_argument('--out', required=True)
    ap.add_argument('--frames')
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--range')
    ap.add_argument('--audio-only', action='store_true')
    args = ap.parse_args()
    sys.path.insert(0, HERE)
    tl = importlib.import_module(args.timeline)
    if args.frames:
        r = Renderer(tl)
        for ts in args.frames.split(','):
            Image.fromarray((r.render(float(ts)) * 255).astype(np.uint8)).save(f'{args.out}_{float(ts):06.2f}.png')
        return
    if args.range:
        a, b, p = args.range.split(':')
        render_range(tl, int(a), int(b), p)
        return
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    wav = args.out + '.audio.wav'
    build_audio(tl, wav)
    if args.audio_only:
        return
    n = int(round(tl.DURATION * FPS))
    k = args.workers
    bounds = [round(n * i / k) for i in range(k + 1)]
    tmpd = tempfile.mkdtemp(dir=os.path.dirname(os.path.abspath(args.out)))
    parts = [os.path.join(tmpd, f'part{i}.mp4') for i in range(k)]
    procs = [subprocess.Popen([sys.executable, __file__, args.timeline, '--out', args.out, '--range', f'{bounds[i]}:{bounds[i + 1]}:{parts[i]}'])
             for i in range(k)]
    if any(p.wait() != 0 for p in procs):
        raise SystemExit('render worker gagal')
    lst = os.path.join(tmpd, 'list.txt')
    with open(lst, 'w') as f:
        f.writelines(f"file '{p}'\n" for p in parts)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-i', wav, '-map', '0:v', '-map', '1:a',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', args.out], check=True)
    for p in parts + [lst, wav]:
        os.remove(p)
    os.rmdir(tmpd)


if __name__ == '__main__':
    main()
