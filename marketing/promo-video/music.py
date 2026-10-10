#!/usr/bin/env python3
"""Penjana muzik latar promo Pahlawan Angka (120 BPM, D major).

Muzik disintesis sepenuhnya dalam kod (tiada sampel luar), jadi tiada isu hak
cipta. Struktur lagu datang daripada senarai seksyen dalam timeline supaya
setiap 'drop' jatuh tepat pada potongan video.

Seksyen: (jenis, bar_mula, bilangan_bar)
  intro  — pad ditapis + arp + riser, tanpa dram
  drop   — kick 4/4, clap, hat, bass pam, supersaw, melodi utama
  groove — kick 4/4, clap, hat, bass, stab, arp (tanpa melodi)
  light  — groove ringan (kick 1 & 3, shaker) untuk bahagian ibu bapa
  break  — pad + arp tanpa dram, riser di hujung
  build  — groove + riser + snare roll menuju drop
  outro  — hentakan akhir + kord panjang
"""
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
RNG = np.random.default_rng(11)

# progresi (bass root, voicing pad, nada arp)
CHORDS = {
    'D':  (38, [62, 66, 69, 74], [62, 66, 69, 74, 78, 81]),
    'A':  (45, [61, 64, 69, 73], [61, 64, 69, 73, 76, 81]),
    'Bm': (47, [62, 66, 71, 74], [59, 62, 66, 71, 74, 78]),
    'G':  (43, [62, 67, 71, 74], [59, 62, 67, 71, 74, 79]),
}
PROG = {
    'drop': ['D', 'A', 'Bm', 'G'],
    'groove': ['Bm', 'G', 'D', 'A'],
    'light': ['G', 'D', 'A', 'Bm'],
    'break': ['Bm', 'G', 'D', 'A'],
    'build': ['G', 'A', 'Bm', 'A'],
    'intro': ['Bm', 'A', 'G', 'A'],
    'outro': ['D'],
}
MELODY = [
    [69, None, 69, 66, 69, None, 74, None],
    [73, None, 71, 69, 64, None, 69, None],
    [71, None, 71, 69, 66, None, 74, None],
    [74, None, 76, 74, 71, None, 69, None],
]
ARP_PAT = [0, 2, 1, 3, 2, 4, 3, 5, 4, 3, 2, 4, 1, 3, 0, 2]


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def saw(f, n, phase=0.0):
    ph = (phase + f * np.arange(n) / SR) % 1.0
    return 2 * ph - 1


def lp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR / 2 * 0.95), 'low', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)


def hp(x, fc, order=2):
    sos = signal.butter(order, fc, 'high', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)


def bp(x, f1, f2, order=2):
    sos = signal.butter(order, [f1, f2], 'band', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)


def sweep_lp(x, f0, f1, block=256):
    """Lowpass dengan frekuensi potong bergerak eksponen f0 -> f1."""
    out = np.zeros_like(x)
    n = len(x)
    zi = None
    for i in range(0, n, block):
        k = i / max(1, n - 1)
        fc = f0 * (f1 / f0) ** k
        sos = signal.butter(2, min(fc, SR / 2 * 0.95), 'low', fs=SR, output='sos')
        if zi is None:
            zi = np.zeros((sos.shape[0], 2) + x.shape[1:])
        out[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], axis=0, zi=zi)
    return out


def noise(n):
    return RNG.uniform(-1, 1, n)


# ---------------------------------------------------------------- instrumen

def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 46 + 120 * np.exp(-t / 0.032)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.19)
    click = hp(noise(n), 3000) * np.exp(-t / 0.0025) * 0.35
    x = np.tanh(1.8 * (x + click)) / np.tanh(1.8)
    return x


def clap():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    e = np.zeros(n)
    for d in (0.0, 0.011, 0.022):
        e += np.where(t >= d, np.exp(-(t - d) / 0.006), 0)
    e += np.exp(-t / 0.13) * 0.55
    x = bp(noise(n), 900, 4200) * e
    body = np.sin(2 * np.pi * 195 * t) * np.exp(-t / 0.05) * 0.5
    return np.tanh(1.4 * (x + body))


def hat(open_=False):
    n = int((0.38 if open_ else 0.08) * SR)
    t = np.arange(n) / SR
    x = hp(noise(n), 7500, 4) * np.exp(-t / (0.16 if open_ else 0.022))
    return x


def shaker():
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    env = np.minimum(1, t / 0.01) * np.exp(-t / 0.035)
    return bp(noise(n), 5000, 11000) * env


def crash():
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    return hp(noise(n), 4000) * np.exp(-t / 0.7)


def impact():
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    f = 32 + 60 * np.exp(-t / 0.12)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9)
    body = lp(noise(n), 900) * np.exp(-t / 0.25) * 0.8
    return np.tanh(1.5 * (boom + body))


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    k = t / dur
    x = noise(n)
    out = np.zeros(n)
    block = 512
    zi = None
    for i in range(0, n, block):
        fc = 300 * (9000 / 300) ** k[i]
        sos = signal.butter(2, [fc * 0.7, min(fc * 1.4, SR / 2 * 0.95)], 'band', fs=SR, output='sos')
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        out[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], zi=zi)
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2.5 * k)) / SR) * 0.15
    return (out * 1.6 + tone) * k ** 2.2


def snare_roll(dur):
    n = int(dur * SR)
    out = np.zeros(n)
    c = clap()
    t = 0.0
    while t < dur - 0.02:
        k = t / dur
        step = S16 if k < 0.5 else S16 / 2
        i = int(t * SR)
        seg = c[: max(0, min(len(c), n - i))] * (0.25 + 0.75 * k ** 1.5)
        out[i:i + len(seg)] += seg
        t += step
    return out


def pluck(f, dur, bright=1.0):
    n = int((dur + 0.25) * SR)
    t = np.arange(n) / SR
    x = 0.6 * saw(f, n) + 0.4 * np.sign(np.sin(2 * np.pi * f * t))
    x += 0.5 * saw(f * 1.004, n)
    env = np.minimum(1, t / 0.004) * (0.35 + 0.65 * np.exp(-t / 0.12))
    env *= np.where(t < dur, 1, np.exp(-(t - dur) / 0.06))
    return lp(x * env, 2500 + 3500 * bright)


def bell(f, dur):
    n = int((dur + 0.3) * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.08)
    tri = 2 * np.abs(saw(f, n)) - 1
    x = 0.7 * x + 0.3 * tri
    return x * np.minimum(1, t / 0.003) * np.exp(-t / 0.14)


def supersaw(notes, dur, voices=5, spread=0.16):
    n = int(dur * SR)
    out = np.zeros((n, 2))
    for m in notes:
        for v in range(voices):
            det = (v - (voices - 1) / 2) / ((voices - 1) / 2) * spread
            f = mtof(m + det)
            x = saw(f, n, RNG.uniform())
            pan = 0.5 + 0.45 * (v - (voices - 1) / 2) / ((voices - 1) / 2)
            out[:, 0] += x * (1 - pan)
            out[:, 1] += x * pan
    t = np.arange(n) / SR
    env = np.minimum(1, t / 0.012) * np.where(t > dur - 0.05, np.clip((dur - t) / 0.05, 0, 1), 1)
    return out * env[:, None] / (len(notes) * voices) * 2.2


def bass_note(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(m)
    x = 0.55 * np.sin(2 * np.pi * f * t) + 0.45 * saw(f, n) + 0.25 * saw(2 * f, n)
    env = np.minimum(1, t / 0.006) * np.where(t > dur - 0.03, np.clip((dur - t) / 0.03, 0, 1), 1)
    return np.tanh(1.3 * x * env)


def pad(notes, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for i, m in enumerate(notes):
        f = mtof(m)
        for ch, d in ((0, -0.07), (1, 0.07)):
            out[:, ch] += np.sin(2 * np.pi * mtof(m + d) * t) * 0.6 + saw(mtof(m + d * 1.5), n) * 0.25
    env = np.minimum(1, t / 0.35) * np.where(t > dur - 0.3, np.clip((dur - t) / 0.3, 0, 1), 1)
    return out * env[:, None] / len(notes)


# ---------------------------------------------------------------- kesan bunyi video

def whoosh(dur=0.7, f0=500, f1=5000):
    n = int(dur * SR)
    t = np.arange(n) / SR
    k = t / dur
    x = noise(n)
    out = np.zeros(n)
    zi = None
    for i in range(0, n, 256):
        kk = k[i]
        fc = f0 * (f1 / f0) ** (np.sin(np.pi * kk * 0.5))
        sos = signal.butter(2, [fc * 0.6, min(fc * 1.6, SR / 2 * 0.95)], 'band', fs=SR, output='sos')
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        out[i:i + 256], zi = signal.sosfilt(sos, x[i:i + 256], zi=zi)
    env = np.sin(np.pi * k) ** 1.6
    st = np.zeros((n, 2))
    st[:, 0] = out * env * (1 - 0.6 * k)
    st[:, 1] = out * env * (0.4 + 0.6 * k)
    return st * 1.4


def pop():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    f = 900 + 1400 * np.exp(-t / 0.01)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03)
    return np.stack([x, x], 1) * 0.5


def shimmer(dur=1.6):
    n = int(dur * SR)
    out = np.zeros((n, 2))
    notes = [74, 78, 81, 86, 90, 93]
    for i, m in enumerate(notes):
        b = bell(mtof(m), 0.25)
        o = int(i * 0.07 * SR)
        seg = b[: n - o]
        out[o:o + len(seg), i % 2] += seg * 0.5
        out[o:o + len(seg), 1 - i % 2] += seg * 0.25
    return out


# ---------------------------------------------------------------- reverb & bus

def make_ir(dur=2.4, decay=0.55):
    n = int(dur * SR)
    t = np.arange(n) / SR
    ir = np.stack([noise(n), noise(n)], 1) * np.exp(-t / decay)[:, None]
    ir = lp(ir, 6500)
    ir[: int(0.018 * SR)] = 0
    return ir / np.sqrt((ir ** 2).sum(0)).max() * 0.9


def reverb(x, ir):
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    out = np.zeros((len(x) + len(ir) - 1, 2))
    for ch in range(2):
        out[:, ch] = signal.fftconvolve(x[:, ch], ir[:, ch])
    return out[: len(x)]


def delay(x, d, fb=0.35, wet=0.3, pingpong=True):
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    n = int(d * SR)
    out = x.copy()
    tap = x.copy()
    for k in range(1, 6):
        tap = np.roll(tap, n, axis=0) * fb
        tap[:n] = 0
        if pingpong:
            tap = tap[:, ::-1]
        out += tap * (wet / fb)
    return out


class Mix:
    def __init__(self, total):
        self.n = int(total * SR)
        self.st = {}

    def stem(self, name, stereo=True):
        if name not in self.st:
            self.st[name] = np.zeros((self.n, 2)) if stereo else np.zeros(self.n)
        return self.st[name]

    def add(self, name, x, t, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i >= self.n:
            return
        seg = x[: self.n - i] * gain
        if seg.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            seg = np.stack([seg * l, seg * r], 1) * 1.414
        self.stem(name)[i:i + len(seg)] += seg


# ---------------------------------------------------------------- penyusun lagu

def render_music(sections, total, out_path=None, start_offset=0.0):
    """sections: [(jenis, bar_mula, bilangan_bar)], total: saat."""
    mix = Mix(total)
    K, C, HC, HO, SH = kick(), clap(), hat(), hat(True), shaker()
    pump = np.ones(mix.n)

    def pump_at(t0, bars):
        for b in range(bars * 4):
            i = int((t0 + b * BEAT) * SR)
            m = int(BEAT * SR)
            tt = np.arange(m) / SR
            g = 1 - 0.72 * np.clip(1 - tt / 0.24, 0, 1) ** 2
            seg = pump[i:i + m]
            seg[:] = np.minimum(seg, g[: len(seg)])

    for kind, b0, nb in sections:
        t0 = start_offset + b0 * BAR
        prog = PROG[kind if kind in PROG else 'drop']
        if kind in ('drop',):
            mix.add('fx', crash(), t0, 0.32)
            mix.add('fx', impact(), t0, 0.55)
        for bi in range(nb):
            tb = t0 + bi * BAR
            ch = CHORDS[prog[bi % len(prog)]]
            root, voicing, tones = ch
            last = bi == nb - 1
            # dram
            if kind in ('drop', 'groove', 'build'):
                for q in range(4):
                    mix.add('kick', K, tb + q * BEAT, 1.0)
                for q in (1, 3):
                    mix.add('clap', C, tb + q * BEAT, 0.55)
                for e in range(8):
                    if e % 2 == 1:
                        mix.add('hat', HO if kind == 'drop' else HC, tb + e * BEAT / 2, 0.22 if kind == 'drop' else 0.3, pan=0.25)
                if kind == 'drop':
                    for s in range(16):
                        mix.add('hat', HC, tb + s * S16, 0.08 + 0.05 * (s % 2), pan=-0.3)
                pump_at(tb, 1)
            elif kind == 'light':
                for q in (0, 2):
                    mix.add('kick', K, tb + q * BEAT, 0.85)
                if bi % 2 == 1 or True:
                    for q in (1, 3):
                        mix.add('clap', C, tb + q * BEAT, 0.32)
                for s in range(16):
                    mix.add('hat', SH, tb + s * S16, 0.18 + 0.12 * (s % 2 == 0), pan=0.35)
            # bass
            if kind in ('drop', 'groove', 'build'):
                for e in range(8):
                    if kind == 'drop' and e % 2 == 0:
                        continue
                    m = root + (12 if (kind == 'drop' and e == 7) else 0)
                    mix.add('bass', bass_note(m, BEAT / 2 * 0.9), tb + e * BEAT / 2, 0.55)
            elif kind == 'light':
                for q in (0, 2):
                    mix.add('bass', bass_note(root, BEAT * 0.95), tb + q * BEAT, 0.42)
            # kord
            if kind == 'drop':
                mix.add('saw', supersaw(voicing, BAR), tb, 0.55)
            elif kind in ('groove', 'build'):
                for e in range(8):
                    if e % 2 == 1:
                        mix.add('stab', supersaw(voicing, BEAT / 2 * 0.55, voices=3), tb + e * BEAT / 2, 0.42)
                mix.add('pad', pad(voicing, BAR), tb, 0.22)
            elif kind in ('intro', 'break', 'light'):
                mix.add('pad', pad(voicing, BAR + 0.3), tb, 0.38 if kind != 'light' else 0.26)
            # arp
            if kind in ('intro', 'break', 'groove', 'light', 'build', 'drop'):
                gain = {'drop': 0.10, 'groove': 0.16, 'light': 0.17, 'break': 0.2, 'intro': 0.16, 'build': 0.17}[kind]
                if kind == 'intro' and bi == 0:
                    gain *= 0.6
                for s in range(16):
                    m = tones[ARP_PAT[s] % len(tones)] + 12
                    mix.add('arp', bell(mtof(m), S16 * 0.9), tb + s * S16, gain, pan=0.4 * np.sin(s * 0.9))
            # melodi
            if kind == 'drop':
                mel = MELODY[bi % 4]
                for e, m in enumerate(mel):
                    if m is None:
                        continue
                    ln = 1
                    while e + ln < 8 and mel[e + ln] is None:
                        ln += 1
                    mix.add('lead', pluck(mtof(m), BEAT / 2 * ln * 0.9), tb + e * BEAT / 2, 0.30)
                    mix.add('lead', pluck(mtof(m + 12), BEAT / 2 * ln * 0.9, 0.6), tb + e * BEAT / 2, 0.09)
            # transisi
            if last and kind in ('intro', 'break', 'build'):
                rdur = min(nb, 2) * BAR
                mix.add('fx', riser(rdur), t0 + nb * BAR - rdur, 0.30)
                mix.add('fx', snare_roll(BAR), tb, 0.30)
        if kind == 'outro':
            mix.add('fx', crash(), t0, 0.4)
            mix.add('fx', impact(), t0, 0.7)
            mix.add('saw', supersaw(CHORDS['D'][1] + [50], 3.2), t0, 0.5)
            mix.add('pad', pad(CHORDS['D'][1], 3.6), t0, 0.4)
            mix.add('bass', bass_note(38, 1.2), t0, 0.5)
            mix.add('arp', shimmer(), t0 + 0.05, 0.6)

    # proses stem
    st = mix.st
    ir = make_ir()
    out = np.zeros((mix.n, 2))
    pump2 = pump[:, None]
    if 'kick' in st:
        out += st['kick'] * 0.42
    if 'clap' in st:
        c = st['clap']
        out += c * 0.85 + reverb(c[:, 0], ir) * 0.22
    if 'hat' in st:
        out += st['hat'] * 0.85
    if 'bass' in st:
        b = lp(st['bass'], 1400)
        out += b * pump2 * 0.7
    if 'saw' in st:
        s = lp(st['saw'], 5200)
        out += s * pump2 * 1.25 + reverb(s.mean(1), ir) * 0.24
    if 'stab' in st:
        s = lp(st['stab'], 3800)
        out += s * 0.9 + reverb(s.mean(1), ir) * 0.2
    if 'pad' in st:
        p = lp(st['pad'], 2600)
        out += p * pump2 * 0.8 + reverb(p.mean(1), ir) * 0.2
    if 'arp' in st:
        a = delay(st['arp'], BEAT * 0.75, fb=0.35, wet=0.35)
        out += a * 0.8 + reverb(a.mean(1), ir) * 0.2
    if 'lead' in st:
        l = delay(st['lead'], BEAT * 0.75, fb=0.3, wet=0.22)
        out += l * 1.45 + reverb(l.mean(1), ir) * 0.34
    if 'fx' in st:
        out += st['fx'] * 0.8 + reverb(st['fx'].mean(1), ir) * 0.12
    out = hp(out, 30)
    out = out + hp(out, 2500) * 0.35 - lp(out, 70) * 0.25
    out /= max(1e-6, np.abs(out).max()) / 1.4
    out = np.tanh(out) / np.tanh(1.4)
    out /= max(1e-6, np.abs(out).max()) / 0.89
    if out_path:
        wavfile.write(out_path, SR, (out * 32767).astype(np.int16))
    return out


if __name__ == '__main__':
    import sys
    import importlib
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    tl = importlib.import_module(sys.argv[1])
    render_music(tl.MUSIC, tl.DURATION, sys.argv[2])
