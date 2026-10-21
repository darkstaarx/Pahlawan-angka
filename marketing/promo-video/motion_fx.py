"""Elemen motion design tambahan (gaya "claude-motion-design": satu bentuk dari awal ke akhir,
teks naik bertopeng perkataan demi perkataan, spring dengan sedikit overshoot, satu warna aksen).

  Face      ikon muka emas yang ekspresinya berubah lancar (senyum ↔ masam ↔ teruja)
  RiseText  baris teks besar; setiap perkataan naik dari bawah garis (bertopeng), keluar ke atas
  TapRings  riak sentuhan pada lokasi ketukan sebenar di skrin telefon (ikut pose telefon)
"""
import math

import cv2
import numpy as np
from PIL import Image, ImageDraw

from engine import Pose, SW, SH, SRC_W, SRC_H, W, H, font, over, smooth, ease_out

GOLD = (250, 196, 70)
GOLD_D = (196, 128, 24)
INK = (14, 22, 54)


def spring(x, z=0.72, w=9.0):
    """Tindak balas langkah spring teredam (0 → 1), overshoot kecil (redaman ≥ 0.72)."""
    if x <= 0:
        return 0.0
    if x >= 1.6:
        return 1.0
    wd = w * math.sqrt(1 - z * z)
    return 1 - math.exp(-z * w * x) * (math.cos(wd * x) + z / math.sqrt(1 - z * z) * math.sin(wd * x))


def _lerp(a, b, k):
    return a + (b - a) * k


class Face:
    """Muka emas. keys = [(t, dict(x, y, size, mood, eyes, a, squash))]; antara kunci: smooth.
    mood: −1 masam/malas … 0 biasa … +1 senyum lebar. eyes: 1 terbuka … 0.3 separuh tertutup."""

    DEF = dict(x=540.0, y=960.0, size=380.0, mood=0.4, eyes=1.0, a=1.0, squash=0.0, look=0.0)

    def __init__(self, t0, t1, keys, layer='front'):
        self.t0, self.t1, self.layer = t0, t1, layer
        cur, self.keys = dict(self.DEF), []
        for k in keys:
            cur = dict(cur)
            cur.update(k[1])
            self.keys.append((k[0], cur))

    def active(self, t):
        return self.t0 <= t <= self.t1

    def at(self, t):
        ks = self.keys
        if t <= ks[0][0]:
            return dict(ks[0][1])
        for (ta, a), (tb, b) in zip(ks, ks[1:]):
            if ta <= t <= tb:
                k = smooth((t - ta) / max(1e-6, tb - ta))
                return {n: _lerp(a[n], b[n], k) for n in a}
        return dict(ks[-1][1])

    @staticmethod
    def render(size, mood, eyes, squash=0.0, look=0.0):
        ss = 2
        S = int(size * ss)
        pad = int(S * 0.12)
        im = np.zeros((S + 2 * pad, S + 2 * pad, 4), np.float32)
        c = (S + 2 * pad) / 2
        r = S / 2 * 0.96
        sx, sy = 1 + squash * 0.08, 1 - squash * 0.08
        # badan: emas dengan cahaya lembut dari kiri atas, bayang di bawah
        yy, xx = np.mgrid[0:im.shape[0], 0:im.shape[1]].astype(np.float32)
        d = np.sqrt(((xx - c) / sx) ** 2 + ((yy - c) / sy) ** 2)
        body = np.clip((r - d) / 2.0, 0, 1)
        lit = np.clip(1 - np.sqrt(((xx - (c - r * 0.35)) ** 2 + (yy - (c - r * 0.4)) ** 2)) / (r * 1.6), 0, 1)
        col = np.array(GOLD, np.float32) / 255
        dark = np.array(GOLD_D, np.float32) / 255
        rim = np.clip((d - r * 0.9) / (r * 0.1), 0, 1)[..., None]
        base = col * (0.9 + 0.22 * lit[..., None]) * (1 - rim * 0.45) + dark * rim * 0.45
        im[..., :3] = np.clip(base, 0, 1)
        im[..., 3] = body
        canvas = (im * 255).astype(np.uint8)
        ink = INK + (255,)
        # mata: elips; kelopak (emas) menutup bahagian atas ikut `eyes`
        ex, ey = r * 0.34, -r * 0.12
        erx, ery = r * 0.11, r * 0.15
        eye_mask = np.zeros(canvas.shape[:2], np.uint8)
        lid = 1 - max(0.0, min(1.0, eyes))
        lw = max(4, int(r * 0.045))
        for side in (-1, 1):
            cx, cy = int(c + side * ex * sx + look * r * 0.09), int(c + ey * sy)
            m1 = np.zeros_like(eye_mask)
            cv2.ellipse(m1, (cx, cy), (int(erx), int(ery)), 0, 0, 360, 255, -1, cv2.LINE_AA)
            cut = int(cy - ery + 2 * ery * lid)
            if lid > 0.01:
                m1[:max(0, cut)] = 0
            eye_mask = np.maximum(eye_mask, m1)
            if lid > 0.01:
                cv2.line(canvas, (int(cx - erx - 3), cut), (int(cx + erx + 3), cut), ink, lw, cv2.LINE_AA)
            # kening: senyum = naik sedikit; masam = rata, rendah, hujung dalam terangkat sedikit (malas/menyampah)
            by = cy - ery - r * (0.15 + 0.07 * max(0.0, mood)) + r * 0.05 * max(0.0, -mood)
            inner = -r * 0.03 * max(0.0, -mood)
            p_in = (int(cx - side * erx * 1.2), int(by + inner))
            p_out = (int(cx + side * erx * 1.25), int(by - r * 0.02 * max(0.0, mood)))
            cv2.line(canvas, p_in, p_out, ink, max(4, int(r * 0.05)), cv2.LINE_AA)
        em = (eye_mask.astype(np.float32) / 255)[..., None]
        canvas[..., :3] = (canvas[..., :3] * (1 - em) + np.array(INK, np.float32) * em).astype(np.uint8)
        for side in (-1, 1):
            if lid < 0.3:
                cx, cy = int(c + side * ex * sx + look * r * 0.09), int(c + ey * sy)
                cv2.circle(canvas, (int(cx - erx * 0.3 + look * r * 0.04), int(cy - ery * 0.35)), max(2, int(erx * 0.32)), (255, 255, 255, 255), -1, cv2.LINE_AA)
        # mulut: lengkung Bezier; senyum lebar (mood > 0.6) menjadi mulut terbuka
        mw, my = r * 0.36, c + r * 0.36 * sy
        bend = mood * r * 0.32
        n = 40
        tt = np.linspace(0, 1, n)
        x0, x2 = c - mw, c + mw
        yc = my + bend
        bx = (1 - tt) ** 2 * x0 + 2 * (1 - tt) * tt * c + tt ** 2 * x2
        byy = (1 - tt) ** 2 * my + 2 * (1 - tt) * tt * yc + tt ** 2 * my
        pts = np.stack([bx, byy], 1).astype(np.int32)
        open_k = max(0.0, (mood - 0.6) / 0.4)
        if open_k > 0.02:
            # senyum terbuka berbentuk "D": tepi atas hampir lurus, tepi bawah melengkung dalam
            yu = my + bend * (1 - 0.75 * open_k)
            upper = np.stack([bx, (1 - tt) ** 2 * my + 2 * (1 - tt) * tt * yu + tt ** 2 * my], 1)
            yl = my + bend * (1 + 1.3 * open_k)
            lower = np.stack([bx, (1 - tt) ** 2 * my + 2 * (1 - tt) * tt * yl + tt ** 2 * my], 1)
            cv2.fillPoly(canvas, [np.concatenate([upper, lower[::-1]]).astype(np.int32)], ink, cv2.LINE_AA)
            pts = upper.astype(np.int32)
        cv2.polylines(canvas, [pts], False, ink, max(5, int(r * 0.07)), cv2.LINE_AA)
        out = cv2.resize(canvas, None, fx=1 / ss, fy=1 / ss, interpolation=cv2.INTER_AREA).astype(np.float32) / 255
        return out

    def draw(self, out, t):
        p = self.at(t)
        if p['a'] <= 0.01 or p['size'] < 4:
            return
        img = self.render(p['size'], p['mood'], p['eyes'], p['squash'], p['look'])
        rgb_, a = img[..., :3], img[..., 3:4]
        prem = np.concatenate([rgb_ * a, a], 2)
        h, w = prem.shape[:2]
        x0, y0 = int(p['x'] - w / 2), int(p['y'] - h / 2)
        # bayang lembut
        sh = np.zeros_like(prem)
        sh[..., 3] = cv2.GaussianBlur(a[..., 0], (0, 0), max(2, p['size'] * 0.05)) * 0.45
        over(out, sh, x0 + int(p['size'] * 0.02), y0 + int(p['size'] * 0.07), p['a'])
        over(out, np.concatenate([rgb_, a], 2), x0, y0, p['a'])


class RiseText:
    """Baris teks besar berpusat. lines = [[(perkataan, warna)], ...]; setiap perkataan naik dari bawah
    garisnya (bertopeng), sela 55 ms, dan keluar ke atas pada t1."""

    def __init__(self, t0, t1, lines, y, size=104, font_name='InterDisplay-Black.otf', stagger=0.055, lead=1.12, layer='front',
                 exit_=0.3, shadow=0.0):
        self.t0, self.t1, self.y, self.layer, self.exit_ = t0, t1, y, layer, exit_
        f = font(font_name, size)
        self.lh = int(size * lead)
        self.words = []
        space = f.getlength(' ')
        i = 0
        for li, line in enumerate(lines):
            widths = [f.getlength(w) for w, _ in line]
            x = (W - (sum(widths) + space * (len(line) - 1))) / 2
            for (wd, col), ww in zip(line, widths):
                asc, desc = f.getmetrics()
                im = Image.new('RGBA', (int(ww) + 24, asc + desc + 24), (0, 0, 0, 0))
                ImageDraw.Draw(im).text((12, 12), wd, font=f, fill=tuple(col) + (255,))
                arr = np.asarray(im, np.float32) / 255
                self.words.append(dict(img=arr, x=int(x) - 12, line=li, d=i * stagger))
                x += ww + space
                i += 1
        self.shadow = shadow

    def active(self, t):
        return self.t0 <= t <= self.t1

    def draw(self, out, t):
        for wd in self.words:
            img = wd['img']
            h = img.shape[0]
            ly = int(self.y + wd['line'] * self.lh - h / 2)
            kin = spring((t - self.t0 - wd['d']) / 0.55)
            kout = ease_out((t - (self.t1 - self.exit_) - wd['d'] * 0.4) / self.exit_) if self.exit_ else 0.0
            if kin <= 0:
                continue
            dy = (1 - kin) * h * 1.02 - kout * h * 1.02
            rot = (1 - min(1.0, kin)) * 6
            src = img
            if abs(rot) > 0.2:
                M = cv2.getRotationMatrix2D((img.shape[1] / 2, img.shape[0]), rot, 1.0)
                src = cv2.warpAffine(img, M, (img.shape[1], img.shape[0]), flags=cv2.INTER_LINEAR)
            # topeng: hanya bahagian dalam kotak garis yang kelihatan
            oy = int(round(dy))
            top, bot = max(0, -oy), min(h, h - oy)
            if bot <= top:
                continue
            piece = src[top:bot]
            over(out, piece, wd['x'], ly + oy + top, 1.0)


class TapRings:
    """Riak ketukan jari pada lokasi sebenar di skrin telefon. taps = [(t, x_px, y_px)] dalam piksel rakaman
    (1080×2236), diunjur melalui pose telefon yang sama setiap bingkai."""

    def __init__(self, r, phone, taps, layer='front'):
        self.ph, self.taps, self.layer = r.phones[phone], taps, layer
        self.t0 = min(t for t, _, _ in taps) - 0.3 if taps else 0
        self.t1 = max(t for t, _, _ in taps) + 0.8 if taps else 0

    def active(self, t):
        return self.t0 <= t <= self.t1

    def draw(self, out, t):
        pp = self.ph.track.at(t)
        if pp['a'] < 0.3:
            return
        pose = Pose(pp)
        for (tt, x, y) in self.taps:
            k = t - tt
            if not (-0.25 <= k <= 0.7):
                continue
            c = pose.project(np.array([[(x / SRC_W - 0.5) * SW, (y / SRC_H - 0.5) * SH]]))[0]
            lay = np.zeros((H, W), np.float32)
            if k < 0:      # jari turun: titik mengecil
                rad = 30 * pp['s'] * (1 + 3 * (-k))
                cv2.circle(lay, (int(c[0]), int(c[1])), int(rad), 0.55 * (1 + k * 4), -1, cv2.LINE_AA)
            else:
                rad = 30 * pp['s'] * (1 + 2.6 * ease_out(k / 0.7))
                cv2.circle(lay, (int(c[0]), int(c[1])), int(rad), 1.0, max(3, int(6 * pp['s'])), cv2.LINE_AA)
                cv2.circle(lay, (int(c[0]), int(c[1])), int(26 * pp['s']), 0.5, -1, cv2.LINE_AA)
                lay *= (1 - smooth(k / 0.7))
            m = np.clip(lay, 0, 1)[..., None]
            out[:] = out * (1 - m) + np.ones(3, np.float32) * m
