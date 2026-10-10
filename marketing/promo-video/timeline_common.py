"""Fungsi bersama untuk timeline: pose kamera, pecahan sari kata dan eksport SRT."""
import re
from render_promo import REST, Shot  # noqa: F401  (diguna oleh modul timeline)

GANGSA = (205, 127, 50)
PERAK = (196, 204, 218)
EMAS = (245, 190, 60)


def Z(u, v, s=2.0, oy=1150.0, ox=540.0):
    """UI detail zoom: titik (u,v) dalam skrin (0..1) diletak pada (ox,oy)."""
    return dict(s=s, u=u, v=v, ox=ox, oy=oy, rz=0.0, ry=0.0, rx=0.0, a=1.0)


def R(**kw):
    """Pose rehat (telefon penuh menghadap depan)."""
    d = dict(REST)
    d.update(kw)
    return d


def chunk_vo(vo, maxlen=72):
    """Pecahkan setiap baris VO kepada kepingan sari kata (maks. 2 baris pendek).

    Pecahan diutamakan pada tanda baca supaya frasa tidak terputus; masa
    setiap kepingan berkadar dengan bilangan aksara.
    """
    out = []
    for t0, t1, text in vo:
        phrases = [p.strip() for p in re.split(r'(?<=[,.?!])\s+|\s+(?=—)', text) if p.strip()]
        pieces = []
        for ph in phrases:
            while len(ph) > maxlen:
                words = ph.split()
                half, cur = len(ph) / 2, ''
                for i, w in enumerate(words):
                    if len(cur) + len(w) > half:
                        break
                    cur = (cur + ' ' + w).strip()
                pieces.append(cur)
                ph = ' '.join(words[i:])
            pieces.append(ph)
        chunks = []
        for pc in pieces:
            if chunks and len(chunks[-1]) + 1 + len(pc) <= maxlen and not chunks[-1].endswith(('.', '?', '!')):
                chunks[-1] += ' ' + pc
            else:
                chunks.append(pc)
        total = sum(len(c) for c in chunks)
        t = t0
        for c in chunks:
            d = (t1 - t0) * len(c) / total
            out.append((round(t, 2), round(t + d, 2), c))
            t += d
    return out


def srt_time(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'


def write_srt(chunks, path):
    with open(path, 'w', encoding='utf-8') as f:
        for i, (t0, t1, txt) in enumerate(chunks, 1):
            f.write(f'{i}\n{srt_time(t0)} --> {srt_time(t1)}\n{txt}\n\n')
