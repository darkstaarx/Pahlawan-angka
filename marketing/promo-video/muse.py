#!/usr/bin/env python3
"""Enjin gaya "Muse" (pelancaran produk minimalis) untuk promo Pahlawan Angka.

Bahasa visual:
- kanvas putih bersih dengan kecerunan biru lembut di bawah, tiada mockup peranti;
- UI sebenar (dipotong daripada rakaman) terapung sebagai objek sendiri;
- kamera 2D: zoom-tembus ke dalam elemen sehingga elemen itu menjadi babak seterusnya;
- tipografi berpusat dengan ikon sebaris yang muncul perkataan demi perkataan;
- templat berulang "baris atas / [ikon] baris tengah bertukar / baris bawah";
- letupan objek, tanda ✓ dilukis, confetti.

Guna:
  python3 muse.py timeline_muse --out out/promo4.mp4 --workers 4
  python3 muse.py timeline_muse --frames 1.5,9 --out build/semak
"""
import argparse, importlib, math, os, subprocess, sys, tempfile
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from engine import (font, smooth, ease_out, ease_in, ease_back, over, Source, Shot, build_audio,
                    REPO, BUILD, W, H, FPS)

INK = (22, 24, 34)
BLUE = (38, 102, 230)
EASE = {'smooth': smooth, 'out': ease_out, 'in': ease_in, 'back': ease_back, 'linear': lambda x: min(1.0, max(0.0, x))}


def rgbf(c):
    return np.array(c, np.float32) / 255


def asset(path, max_side=None):
    if isinstance(path, np.ndarray):
        return path
    p = path if os.path.isabs(path) else (os.path.join(BUILD, path) if path.startswith('muse/') else os.path.join(REPO, path))
    im = Image.open(p).convert('RGBA')
    bb = im.getchannel('A').getbbox()
    if bb:
        im = im.crop(bb)
    if max_side:
        im.thumbnail((max_side, max_side), Image.LANCZOS)
    return np.asarray(im, np.float32) / 255


def rounded(img, radius):
    """Bucu bulat pada imej RGBA float (contoh: ikon app persegi)."""
    h, w = img.shape[:2]
    m = Image.new('L', (w * 2, h * 2), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w * 2 - 1, h * 2 - 1], radius=radius * 2, fill=255)
    m = np.asarray(m.resize((w, h), Image.LANCZOS), np.float32) / 255
    out = img.copy()
    out[..., 3] *= m
    return out


def rich_img(lines, size, weight='InterDisplay-Bold.otf', lead=1.12, align='l', pad=24):
    """Blok teks besar berbilang baris; lines = [[(teks, warna), ...], ...]."""
    f = font(weight, size)
    widths = [sum(f.getlength(tx) for tx, _ in ln) for ln in lines]
    w, lh = int(max(widths)) + 2 * pad, int(size * lead)
    h = lh * len(lines) + 2 * pad
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i, ln in enumerate(lines):
        x = pad + (0 if align == 'l' else (w - 2 * pad - widths[i]) / 2)
        for tx, col in ln:
            d.text((x, pad + i * lh), tx, font=f, fill=tuple(col) + (255,))
            x += f.getlength(tx)
    return np.asarray(im, np.float32) / 255


class Keys:
    """Keyframe generik: [(t, {k: v}, ease)]; kunci yang tiada diwarisi."""

    def __init__(self, keys, base):
        cur, self.k = dict(base), []
        for k in keys:
            cur = dict(cur)
            cur.update(k[1])
            self.k.append((k[0], cur, k[2] if len(k) > 2 else 'smooth'))

    def at(self, t):
        ks = self.k
        if t <= ks[0][0]:
            return dict(ks[0][1])
        for (t0, a, _), (t1, b, e) in zip(ks, ks[1:]):
            if t <= t1:
                k = EASE[e]((t - t0) / max(1e-6, t1 - t0))
                return {n: a[n] + (b[n] - a[n]) * k for n in a}
        return dict(ks[-1][1])


# ---------------------------------------------------------------- lukisan asas

def blit(out, img, cx, cy, scale, alpha=1.0, rot=0.0, shadow=0.0, mips=None):
    """Lukis imej RGBA (float) berpusat pada (cx, cy) dengan skala & putaran; hanya kawasan kelihatan."""
    if alpha <= 0.003 or scale <= 1e-3:
        return
    src = img
    s = scale
    if mips is not None and scale < 0.6:
        for f, m in mips:
            if scale <= f * 0.9:
                src, s = m, scale / f
    h, w = src.shape[:2]
    c, si = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    M = np.array([[s * c, -s * si], [s * si, s * c]])
    corners = np.array([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]) @ M.T + [cx, cy]
    pad = int(40 * shadow) + 2
    x0, y0 = np.floor(corners.min(0)).astype(int) - pad
    x1, y1 = np.ceil(corners.max(0)).astype(int) + pad + int(30 * shadow)
    x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
    if x1 <= x0 or y1 <= y0:
        return
    A = np.hstack([M, (np.array([cx - x0, cy - y0]) - M @ np.array([w / 2, h / 2]))[:, None]])
    wp = cv2.warpAffine(src, A, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    reg = out[y0:y1, x0:x1]
    if shadow > 0:
        sh = cv2.GaussianBlur(wp[..., 3], (0, 0), 16 + 20 * shadow)
        sh = np.roll(sh, int(18 * shadow), axis=0)
        reg *= (1 - sh[..., None] * 0.22 * shadow * alpha)
    a = wp[..., 3:4] * alpha
    reg *= (1 - a)
    reg += wp[..., :3] * a


def make_mips(img):
    out, cur, f = [], img, 1.0
    for _ in range(4):
        f *= 0.5
        cur = cv2.resize(cur, (max(2, cur.shape[1] // 2), max(2, cur.shape[0] // 2)), interpolation=cv2.INTER_AREA)
        out.append((f, cur))
    return out


def text_img(txt, size, color=INK, weight='InterDisplay-Bold.otf', pad=16):
    f = font(weight, size)
    bb = f.getbbox(txt)
    w, h = bb[2] - bb[0] + 2 * pad, int(size * 1.32) + 2 * pad
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((pad - bb[0], pad + int(size * 0.06)), txt, font=f, fill=color + (255,))
    return np.asarray(im, np.float32) / 255


# ---------------------------------------------------------------- elemen

class El:
    def __init__(self, t0, t1):
        self.t0, self.t1 = t0, t1

    def live(self, t):
        return self.t0 <= t <= self.t1


class Img(El):
    """Imej terapung. keys: x, y (dunia), s (skala), a, r (putaran)."""

    def __init__(self, path_or_arr, t0, t1, keys, size=None, shadow=0.6, pop=0.35, out=0.25, bob=0.0, fade_in=0.0):
        super().__init__(t0, t1)
        self.img = asset(path_or_arr, size)
        self.mips = make_mips(self.img)
        self.k = Keys(keys, dict(x=0, y=0, s=1.0, a=1.0, r=0.0))
        self.shadow, self.pop, self.fout, self.bob, self.fin = shadow, pop, out, bob, fade_in

    def draw(self, out, t, cam):
        p = self.k.at(t)
        kin = ease_back((t - self.t0) / self.pop, 1.6) if self.pop else (smooth((t - self.t0) / self.fin) if self.fin else 1.0)
        kout = 1 - smooth((t - (self.t1 - self.fout)) / self.fout) if self.fout else 1.0
        y = p['y'] + self.bob * math.sin(t * 2.2 + p['x'] * 0.01)
        sx, sy, z = cam.to_screen(p['x'], y)
        ks = max(0.02, kin) if self.pop else 1.0
        blit(out, self.img, sx, sy, p['s'] * z * ks, p['a'] * min(1, kin * 2 if self.pop else kin) * kout, p['r'], self.shadow, self.mips)


def round_mask(w, h, radius):
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    return (np.asarray(m, np.float32) / 255)[..., None]


class Clip:
    """Pembaca rakaman: potong rect (u0, v0, u1, v1) → RGBA float bersaiz (w, h) dengan bucu bulat."""

    def __init__(self, src, rect, w, radius=36):
        self.name = src
        self.src = Source(os.path.join(BUILD, src))
        self.rect, self.w, self.radius = rect, int(w), radius
        self.mask, self.last = None, (None, None)

    def frame(self, st):
        i = int(round(st * FPS))
        if self.last[0] == i:
            return self.last[1]
        f = self.src.get(i)
        if f is None:
            return None
        Hh, Ww = f.shape[:2]
        u0, v0, u1, v1 = self.rect
        c = f[int(v0 * Hh):int(v1 * Hh), int(u0 * Ww):int(u1 * Ww)]
        h = max(2, int(c.shape[0] * self.w / c.shape[1]))
        c = cv2.resize(c, (self.w, h), interpolation=cv2.INTER_AREA)[..., ::-1].astype(np.float32) / 255
        if self.mask is None or self.mask.shape[:2] != (h, self.w):
            self.mask = round_mask(self.w, h, self.radius)
        img = np.concatenate([c, self.mask], 2)
        self.last = (i, img)
        return img


class Vid(El):
    """Kad video terapung (rakaman sebenar) dengan bucu bulat. keys: x, y, s, a, r."""

    def __init__(self, src, rect, t0, t1, segs, keys, width=900, radius=40, shadow=0.7, pop=True, fade_in=0.0, out=0.25):
        super().__init__(t0, t1)
        self.clip = Clip(src, rect, width, radius)
        self.shot = Shot(t0, t1, None, segs)
        self.shadow, self.pop, self.fin, self.fout = shadow, pop, fade_in, out
        self.k = Keys(keys, dict(x=0, y=0, s=1.0, a=1.0, r=0.0))

    def draw(self, out, t, cam):
        p = self.k.at(t)
        img = self.clip.frame(self.shot.src_time(t))
        if img is None:
            return
        if self.pop:
            kin = ease_back((t - self.t0) / 0.4, 1.3)
            ks, ka = max(0.02, kin), min(1, kin * 2)
        else:
            ks, ka = 1.0, (smooth((t - self.t0) / self.fin) if self.fin else 1.0)
        kout = 1 - smooth((t - (self.t1 - self.fout)) / self.fout) if self.fout else 1.0
        sx, sy, z = cam.to_screen(p['x'], p['y'])
        blit(out, img, sx, sy, p['s'] * z * ks, p['a'] * ka * kout, p['r'], self.shadow)


class Tiles(El):
    """Jubin video hidup yang meletup dari satu titik ke kedudukan masing-masing (gaya ikon app Muse).

    clips: [(src, rect, s0)], pos: [(x, y)] dunia; collapse: masa jubin tersedut semula ke titik asal."""

    def __init__(self, clips, pos, t0, t1, x, y, size=300, radius=40, collapse=None, seed=5, stagger=0.3):
        super().__init__(t0, t1)
        rng = np.random.default_rng(seed)
        self.items = [dict(c=Clip(src, rect, size, radius), s0=s0, gx=gx, gy=gy, d=rng.uniform(0, stagger), rot=rng.uniform(-14, 14))
                      for (src, rect, s0), (gx, gy) in zip(clips, pos)]
        self.x, self.y, self.collapse = x, y, collapse

    def draw(self, out, t, cam):
        for o in self.items:
            k = ease_out((t - self.t0 - o['d']) / 0.6)
            if k <= 0:
                continue
            x = self.x + (o['gx'] - self.x) * k
            y = self.y + (o['gy'] - self.y) * k + 5 * math.sin(t * 2 + o['gx'] * 0.01)
            a, sc = min(1, k * 3), 0.35 + 0.65 * k
            if self.collapse:
                kc = ease_in((t - self.collapse - o['d'] * 0.4) / 0.45)
                x += (self.x - x) * kc
                y += (self.y - y) * kc
                a *= 1 - kc
                sc *= 1 - 0.6 * kc
            else:
                a *= 1 - smooth((t - (self.t1 - 0.3)) / 0.3)
            if a <= 0.003:
                continue
            img = o['c'].frame(o['s0'] + (t - self.t0))
            if img is None:
                continue
            sx, sy, z = cam.to_screen(x, y)
            blit(out, img, sx, sy, z * sc, a, o['rot'] * (1 - k * 0.75), 0.35)


class Line(El):
    """Satu baris tipografi berpusat; token = perkataan atau ikon, muncul satu demi satu.

    tokens: [(t, 'teks' | ('ikon', path), opsyen)] — baris sentiasa berpusat semula dengan licin
    apabila token baharu muncul (gaya Muse)."""

    def __init__(self, tokens, x, y, size, t1, color=INK, weight='InterDisplay-Bold.otf', gap=0.28, out=0.3, exit_up=0.0):
        super().__init__(tokens[0][0], t1)
        self.x, self.y, self.size, self.fout, self.exit_up = x, y, size, out, exit_up
        self.items = []
        for tok in tokens:
            t, v = tok[0], tok[1]
            opt = tok[2] if len(tok) > 2 else {}
            if isinstance(v, tuple) and v[0] == 'vid':
                # ('vid', src, rect, s0[, laju]): klip mini hidup dalam ayat
                hh = size * opt.get('icon', 1.25)
                u0, v0, u1, v1 = v[2]
                ar = (u1 - u0) * 1080 / ((v1 - v0) * 2236)
                clip = Clip(v[1], v[2], int(hh * ar * 2), int(hh * 0.22 * 2))
                self.items.append(dict(t=t, clip=clip, s0=v[3], sp=v[4] if len(v) > 4 else 1.0, w=hh * ar, sc=0.5, icon=True,
                                       img=None, mips=None))
                continue
            if isinstance(v, tuple):
                img = asset(v[1], int(size * opt.get('icon', 1.15) * 2))
                if img.shape[0] > size * opt.get('icon', 1.15) * 2.2:
                    im = Image.fromarray((img * 255).astype(np.uint8))
                    im.thumbnail((int(size * opt.get('icon', 1.15) * 2),) * 2, Image.LANCZOS)
                    img = np.asarray(im, np.float32) / 255
                sc = size * opt.get('icon', 1.15) / max(img.shape[0], img.shape[1])
                self.items.append(dict(t=t, img=img, w=img.shape[1] * sc, sc=sc, icon=True, mips=make_mips(img)))
            else:
                col = opt.get('color', color)
                img = text_img(v, size * 2, col, opt.get('weight', weight))
                self.items.append(dict(t=t, img=img, w=(img.shape[1] - 32) / 2, sc=0.5, icon=False, mips=make_mips(img)))
        self.gap = size * gap

    def centers(self):
        """Pusat dunia setiap token apabila baris lengkap (untuk sasaran zoom-tembus)."""
        total = sum(it['w'] for it in self.items) + self.gap * (len(self.items) - 1)
        xx, out = self.x - total / 2, []
        for it in self.items:
            out.append((xx + it['w'] / 2, self.y, it['w']))
            xx += it['w'] + self.gap
        return out

    def draw(self, out, t, cam):
        kout = 1 - smooth((t - (self.t1 - self.fout)) / self.fout) if self.fout else 1.0
        dy = -self.exit_up * smooth((t - (self.t1 - self.fout)) / self.fout) if self.fout else 0
        ws = []
        for it in self.items:
            k = smooth((t - it['t']) / 0.32)
            ws.append(it['w'] * k)
        vis = [(it, w) for it, w in zip(self.items, ws) if w > 0.01]
        if not vis:
            return
        total = sum(w for _, w in vis) + self.gap * (len(vis) - 1)
        xx = self.x - total / 2
        for it, w in vis:
            k = (t - it['t']) / 0.32
            ka = smooth((k - 0.15) / 0.85)
            pop = ease_back(k, 2.2) if it['icon'] else 1.0
            cx = xx + it['w'] / 2   # berlabuh di kiri ruang: token baharu tidak bertindih token sebelumnya
            sx, sy, z = cam.to_screen(cx, self.y + dy + (1 - ka) * self.size * 0.25 * (0 if it['icon'] else 1))
            if it.get('clip'):
                img = it['clip'].frame(it['s0'] + max(0.0, t - it['t']) * it['sp'])
                if img is not None:
                    blit(out, img, sx, sy, it['sc'] * z * max(0.02, pop), ka * kout, 0.0, 0.3)
                xx += w + self.gap
                continue
            blit(out, it['img'], sx, sy, it['sc'] * z * max(0.02, pop if it['icon'] else (0.92 + 0.08 * ka)),
                 ka * kout, 0.0, 0.25 if it['icon'] else 0.0, it['mips'])
            xx += w + self.gap


class Bubble(El):
    """Gelembung chat bulat dengan teks ditaip."""

    def __init__(self, text, t0, t1, x, y, size=46, fill=(222, 234, 255), color=INK, type_speed=0.035, align='c'):
        super().__init__(t0, t1)
        self.text, self.x, self.y, self.size, self.fill, self.color, self.speed, self.align = text, x, y, size, fill, color, type_speed, align
        self.f = font('Inter-Medium.otf', size * 2)
        self.cache = {}

    def _img(self, s):
        if s in self.cache:
            return self.cache[s]
        f = self.f
        tw = max(f.getlength(self.text[:max(1, len(s))]) if s else 0, f.getlength('mm'))
        pw, ph = int(tw + self.size * 2.0), int(self.size * 2 * 1.9)
        im = Image.new('RGBA', (pw, ph), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([0, 0, pw - 1, ph - 1], radius=ph // 2, fill=self.fill + (255,))
        d.text((self.size, ph / 2), s, font=f, fill=self.color + (255,), anchor='lm')
        arr = np.asarray(im, np.float32) / 255
        self.cache[s] = arr
        return arr

    def draw(self, out, t, cam):
        n = int(max(0, t - self.t0 - 0.2) / self.speed) if self.speed else len(self.text)
        s = self.text[:n]
        img = self._img(s)
        kin = ease_back((t - self.t0) / 0.35, 1.6)
        kout = 1 - smooth((t - (self.t1 - 0.25)) / 0.25)
        x = self.x + (img.shape[1] / 4 if self.align == 'l' else -img.shape[1] / 4 if self.align == 'r' else 0)
        sx, sy, z = cam.to_screen(x, self.y)
        blit(out, img, sx, sy, 0.5 * z * max(0.02, kin), min(1, kin * 2) * kout, 0, 0.15)


class Check(El):
    """Bulatan biru + tanda ✓ dilukis."""

    def __init__(self, t0, t1, x, y, r=40, color=BLUE):
        super().__init__(t0, t1)
        self.x, self.y, self.r, self.col = x, y, r, rgbf(color)

    def draw(self, out, t, cam):
        sx, sy, z = cam.to_screen(self.x, self.y)
        r = self.r * z
        kc = ease_out((t - self.t0) / 0.35)
        kk = ease_out((t - self.t0 - 0.25) / 0.3)
        kout = 1 - smooth((t - (self.t1 - 0.25)) / 0.25)
        lay = np.zeros((H, W), np.float32)
        th = max(3, int(r * 0.16))
        if kc > 0:
            cv2.ellipse(lay, (int(sx), int(sy)), (int(r), int(r)), -90, 0, 360 * kc, 1.0, th, cv2.LINE_AA)
        if kk > 0:
            p0, p1, p2 = np.array([-0.45, 0.02]), np.array([-0.12, 0.34]), np.array([0.5, -0.32])
            l1 = min(1, kk * 2.2)
            a = p0 + (p1 - p0) * l1
            cv2.line(lay, (int(sx + p0[0] * r), int(sy + p0[1] * r)), (int(sx + a[0] * r), int(sy + a[1] * r)), 1.0, th, cv2.LINE_AA)
            if kk > 0.45:
                l2 = (kk - 0.45) / 0.55
                b = p1 + (p2 - p1) * l2
                cv2.line(lay, (int(sx + p1[0] * r), int(sy + p1[1] * r)), (int(sx + b[0] * r), int(sy + b[1] * r)), 1.0, th, cv2.LINE_AA)
        m = lay[..., None] * kout
        out[:] = out * (1 - m) + self.col * m


class Burst(El):
    """Objek meletup dari satu titik ke susunan grid (seperti ikon app Muse)."""

    def __init__(self, paths, t0, t1, x, y, cols=6, rows=9, cell=170, size=120, seed=4, collapse=None, hole=None):
        super().__init__(t0, t1)
        rng = np.random.default_rng(seed)
        self.objs = []
        n = cols * rows
        for i in range(n):
            r, c = divmod(i, cols)
            gx = x + (c - (cols - 1) / 2) * cell + rng.uniform(-28, 28) + (cell / 2 if r % 2 else 0)
            gy = y + (r - (rows - 1) / 2) * cell * 1.02 + rng.uniform(-24, 24)
            if hole and hole[0] < gx < hole[2] and hole[1] < gy < hole[3]:
                continue
            p = paths[len(self.objs) % len(paths)]
            img = asset(p, size)
            self.objs.append(dict(img=img, mips=make_mips(img), gx=gx, gy=gy, d=rng.uniform(0, 0.25), rot=rng.uniform(-25, 25),
                                  sc=rng.uniform(0.75, 1.1), ph=rng.uniform(0, 6.28)))
        self.x, self.y, self.collapse = x, y, collapse

    def draw(self, out, t, cam):
        for o in self.objs:
            k = ease_out((t - self.t0 - o['d']) / 0.7)
            if k <= 0:
                continue
            x = self.x + (o['gx'] - self.x) * k
            y = self.y + (o['gy'] - self.y) * k + 6 * math.sin(t * 2 + o['ph'])
            a = min(1, k * 3)
            if self.collapse:
                kc = ease_in((t - self.collapse - o['d'] * 0.5) / 0.5)
                x += (self.x - x) * kc
                y += (self.y - y) * kc
                a *= 1 - kc
            else:
                a *= 1 - smooth((t - (self.t1 - 0.3)) / 0.3)
            sx, sy, z = cam.to_screen(x, y)
            blit(out, o['img'], sx, sy, o['sc'] * z * (0.3 + 0.7 * k), a, o['rot'] * (1 - k * 0.6), 0.2, o['mips'])


class Confetti(El):
    def __init__(self, t0, t1, n=140, seed=9):
        super().__init__(t0, t1)
        rng = np.random.default_rng(seed)
        cols = [(244, 74, 46), (48, 196, 92), (22, 176, 242), (196, 82, 238), (250, 196, 70), (38, 102, 230)]
        self.p = [dict(x=rng.uniform(0, W), vy=rng.uniform(260, 620), y0=rng.uniform(-900, -40), w=rng.uniform(10, 22),
                       h=rng.uniform(16, 34), col=rgbf(cols[i % len(cols)]), sp=rng.uniform(2, 8), ph=rng.uniform(0, 6.28)) for i in range(n)]

    def draw(self, out, t, cam):
        dt = t - self.t0
        a = 1 - smooth((t - (self.t1 - 0.4)) / 0.4)
        col = np.zeros((H, W, 3), np.float32)
        m = np.zeros((H, W), np.float32)
        for q in self.p:
            y = q['y0'] + q['vy'] * dt
            if y < -40 or y > H + 40:
                continue
            x = q['x'] + 30 * math.sin(dt * 1.7 + q['ph'])
            ang = (dt * q['sp'] + q['ph']) * 57.3
            hh = q['h'] * abs(math.cos(dt * q['sp'] + q['ph']))
            box = cv2.boxPoints(((x, y), (q['w'], max(2, hh)), ang)).astype(np.int32)
            cv2.fillConvexPoly(col, box, tuple(float(v) for v in q['col']))
            cv2.fillConvexPoly(m, box, 1.0, cv2.LINE_AA)
        m = m[..., None] * a
        out[:] = out * (1 - m) + col * m


class Tap(El):
    """Riak sentuhan jari pada satu titik."""

    def __init__(self, t, x, y, color=(38, 102, 230), dur=0.6):
        super().__init__(t, t + dur)
        self.x, self.y, self.col, self.dur = x, y, rgbf(color), dur

    def draw(self, out, t, cam):
        k = (t - self.t0) / self.dur
        sx, sy, z = cam.to_screen(self.x, self.y)
        lay = np.zeros((H, W), np.float32)
        r = (26 + 70 * ease_out(k)) * z
        cv2.circle(lay, (int(sx), int(sy)), int(r), 1.0, max(2, int(6 * z * (1 - k))), cv2.LINE_AA)
        dot = 1 - smooth((k - 0.1) / 0.5)
        cv2.circle(lay, (int(sx), int(sy)), int(30 * z * (1 - 0.25 * k)), 0.45 * dot, -1, cv2.LINE_AA)
        m = lay[..., None] * (1 - smooth(k))
        out[:] = out * (1 - m) + self.col * m


class Panel(El):
    """Kotak warna penuh yang membesar dari satu titik (butang → skrin penuh)."""

    def __init__(self, t0, t1, x, y, w0, h0, color, grow=0.45, radius=40):
        super().__init__(t0, t1)
        self.x, self.y, self.w0, self.h0, self.col, self.grow, self.r = x, y, w0, h0, rgbf(color), grow, radius

    def draw(self, out, t, cam):
        k = ease_in((t - self.t0) / self.grow)
        sx, sy, z = cam.to_screen(self.x, self.y)
        w = self.w0 * z + (W * 2.4 - self.w0 * z) * k
        h = self.h0 * z + (H * 2.4 - self.h0 * z) * k
        cx, cy = sx + (W / 2 - sx) * k, sy + (H / 2 - sy) * k
        m = np.zeros((H, W), np.float32)
        r = int(self.r * (1 - k) + 2)
        x0, y0, x1, y1 = int(cx - w / 2), int(cy - h / 2), int(cx + w / 2), int(cy + h / 2)
        cv2.rectangle(m, (x0 + r, y0), (x1 - r, y1), 1.0, -1)
        cv2.rectangle(m, (x0, y0 + r), (x1, y1 - r), 1.0, -1)
        for (ex, ey) in ((x0 + r, y0 + r), (x1 - r, y0 + r), (x0 + r, y1 - r), (x1 - r, y1 - r)):
            cv2.circle(m, (ex, ey), r, 1.0, -1, cv2.LINE_AA)
        a = 1 - smooth((t - (self.t1 - 0.2)) / 0.2)
        m = m[..., None] * a
        out[:] = out * (1 - m) + self.col * m


# ---------------------------------------------------------------- kamera & babak

class Cam:
    def __init__(self, p):
        self.cx, self.cy, self.z = p['cx'], p['cy'], p['z']

    def to_screen(self, x, y):
        return (x - self.cx) * self.z + W / 2, (y - self.cy) * self.z + H / 2, self.z


def background(kind='light'):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    if kind == 'dark':
        t = (yy / H)[..., None]
        return rgbf((14, 22, 54)) * (1 - t) + rgbf((6, 10, 26)) * t
    base = np.ones((H, W, 3), np.float32) * rgbf((246, 247, 250))
    g = np.clip((yy - H * 0.55) / (H * 0.45), 0, 1) ** 1.6
    blob = np.exp(-(((xx - W * 0.5) / (W * 0.7)) ** 2)) * g
    base = base * (1 - blob[..., None] * 0.55) + rgbf((150, 186, 246)) * blob[..., None] * 0.55
    return np.clip(base, 0, 1)


class Renderer:
    def __init__(self, tl):
        self.tl = tl
        self.bg = {k: background(k) for k in ('light', 'dark')}
        self.scenes = [dict(sc, els=[e(self) if callable(e) else e for e in sc['els']], cam=Keys(sc['cam'], dict(cx=540, cy=960, z=1.0)))
                       for sc in tl.SCENES]

    def render(self, t):
        sc = self.scenes[0]
        for s in self.scenes:
            if s['t0'] <= t:
                sc = s
        out = self.bg[sc.get('bg', 'light')].copy()
        cp = sc['cam'].at(t)
        for (ts, d, amp) in getattr(self.tl, 'SHAKES', []):
            if ts <= t <= ts + d:
                k = (1 - (t - ts) / d) ** 2 * amp
                cp['cx'] += k * math.sin(t * 91.0) / cp['z']
                cp['cy'] += k * math.cos(t * 77.0) / cp['z']
        cam = Cam(cp)
        for e in sc['els']:
            if e.live(t):
                e.draw(out, t, cam)
        # pudar putih / gelap antara babak
        for (tf, d, col) in getattr(self.tl, 'FADES', []):
            if tf - d <= t <= tf + d:
                k = 1 - abs(t - tf) / d
                out[:] = out * (1 - k) + rgbf(col) * k
        return np.clip(out, 0, 1)


# ---------------------------------------------------------------- main

def render_range(tl, a, b, path):
    r = Renderer(tl)
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', path], stdin=subprocess.PIPE)
    for i in range(a, b):
        enc.stdin.write((r.render(i / FPS) * 255 + 0.5).astype(np.uint8).tobytes())
        if (i - a) % 90 == 0:
            print(f'[{a}-{b}] {i / FPS:6.1f}s', flush=True)
    enc.stdin.close()
    enc.wait()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('timeline')
    ap.add_argument('--out', required=True)
    ap.add_argument('--frames')
    ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--range')
    args = ap.parse_args()
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
    n = int(round(tl.DURATION * FPS))
    bounds = [round(n * i / args.workers) for i in range(args.workers + 1)]
    tmpd = tempfile.mkdtemp(dir=os.path.dirname(os.path.abspath(args.out)))
    parts = [os.path.join(tmpd, f'part{i}.mp4') for i in range(args.workers)]
    procs = [subprocess.Popen([sys.executable, __file__, args.timeline, '--out', args.out, '--range', f'{bounds[i]}:{bounds[i + 1]}:{parts[i]}'])
             for i in range(args.workers)]
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
