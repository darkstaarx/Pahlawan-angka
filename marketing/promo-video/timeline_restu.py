"""Promo #9 "Bukan Teka" — 66.6 saat, 9:16. Portal Restu + 9 mini-game + Jom tengok cara (perlahan).

Mesej: animasi cantik, ciri power. Anak teka-teka? Pahlawan Angka perasan: 2 tekaan laju → amaran Cikgu Dimensi,
3 tekaan laju → Wira jatuh ke Portal Restu, ibu bapa buka dengan PIN dan nampak SEMAKAN 3 soalan itu.
Bukan sekadar halang teka: 9 mini-game dan "Jom tengok cara" bantu anak faham cara selesaikan soalan.

Rakaman (app sebenar main 5c579d5, 1080×2236, jam maya, benih tetap; capture/):
  RS  capture_restu.js   Demo Darjah 2 (benih 21): S1, S2 betul; S3 Pecahan 3/8 (betul 2/8) ⚡0.5 s, S4 0.9 _ 0.5
                         "Tidak dapat ditentukan" (betul >) ⚡0.5 s → amaran Cikgu, S5 "bulatan" (betul segi empat
                         tepat) ⚡0.5 s → Portal Restu → PIN (titik) → SEMAKAN → Teruskan main → … → Jurus Penamat → BERJAYA
  GT  capture_gudang.js  Gudang Harta #d1-tolak cerita (benih 5, rentak 3.6 s/langkah): "Kumbis ada 40 anak panah. 3 patah
                         semasa latihan. Berapa yang tinggal?" → 47, 57, 67 salah → Jom tengok cara → 1 pilih ayat 40 − 3,
                         2 pinjam 1 dari puluh ("0 jadi 10"), 3 tempat sa 10 − 3 = 7, 4 tempat puluh "3 turun" → SIAP 37
                         → Cuba soalan serupa. Bahagian ini dimainkan pada kelajuan sebenar (1×): inilah kelebihan app.
  G1–G9                  9 mini-game Kemahiran Fokus (grid hidup)
  JATUH                  sinematik jatuh ke Portal Restu (sama dengan assets/cinematics/portal-restu-jatuh-v1.mp4)
Portal Restu tidak aktif dalam Demo tetamu; RS memanggil UI sebenar modul (PARapidLock.warn/lock) pada saat yang
sama enjinnya memanggil dalam akaun keluarga, dengan 3 soalan yang baru dijawab laju dalam rakaman itu.
"""
from engine import Shot, Callout, HookText, EndScene, FullClip, VideoGrid
from timeline_main import R, Z, end_sfx
from timeline_az import _line, HOT, GRID, GRID_LABELS
from timeline_adaptive import Trail
from motion_fx import RiseText, TapRings

DURATION = 66.6

SOURCES = {'RS': 'src_RS.mp4', 'GT': 'src_GT.mp4'}
GS = ['correct', 'wrong', 'sword-slash-v2', 'hit', 'ui', 'aura-charge', 'glacier-thunder', 'finisher', 'coin-pickup',
      'chargeup', 'StingerPA']
SOURCES_AUDIO = {'JATUH': 'aud_JATUH.wav', **{f'GS_{n}': f'aud_GS_{n}.wav' for n in GS}}

WH = (255, 255, 255)
GD = (250, 196, 70)
SOFT = (204, 214, 240)

# RS: mula Jurus Penamat (selepas jawapan terakhir) dan skrin BERJAYA, masa rakaman
RS_JURUS, RS_DONE = 68.55, 75.85

# ---------------------------------------------------------------- rakaman → masa filem
SHOTS = [
    Shot(4.0, 8.2, 'RS', [(6.95, 8.75, 2.1), (11.75, 13.65, 2.1)], 'wow-serangan-gangsa-pecah'),
    Shot(10.4, 16.0, 'RS', [(8.45, 9.7, 1.25), (9.7, 10.5, 0.8), (13.25, 16.2, 2.95), (19.05, 19.65, 0.6)],
         'tekaan-laju-amaran'),
    Shot(19.1, 22.85, 'RS', [(19.65, 21.2, 1.55), (22.55, 24.75, 2.2)], 'portal-restu-pin'),
    Shot(22.85, 28.55, 'RS', [(24.85, 30.55, 5.7)], 'semakan-ibu-bapa'),
    # Kelas Wira: 3 kali salah (dipercepat sedikit), kemudian setiap langkah pada 1×, "0 jadi 10" diperlahan 0.5×
    Shot(33.0, 58.2, 'GT', [(1.45, 3.2, 1.75), (4.0, 5.6, 1.2), (6.8, 8.55, 1.75), (9.9, 11.2, 1.3), (11.2, 18.1, 6.9),
                            (18.1, 18.9, 1.6), (18.9, 28.4, 9.5), (32.2, 33.4, 1.2)], 'kelas-wira-40-tolak-3'),
    Shot(58.2, 61.1, 'RS', [(RS_JURUS, RS_JURUS + 4.2, 2.9)], 'jurus-penamat-aurora-bebas'),
    Shot(61.1, 62.7, 'RS', [(RS_DONE, RS_DONE + 1.4, 1.4), (RS_DONE + 1.4, RS_DONE + 1.4, 0.2)], 'berjaya'),
]


def ft(src, c):
    """Masa rakaman `c` sumber `src` → masa filem (None jika tidak ditayang)."""
    for sh in SHOTS:
        if sh.src != src:
            continue
        t = sh.t0
        for a, b, d in sh.segs:
            if a < b and a <= c < b:
                return t + (c - a) * d / (b - a)
            t += d
    return None


TAPS = {
    'RS': [(8.9, 298, 2039), (13.7, 782, 1584), (19.5, 782, 1785), (22.833, 540, 1209), (30.333, 540, 1600)],
    'GT': [(2.333, 725, 2147), (5.167, 725, 2147), (8.0, 725, 2147), (10.9, 204, 2147), (14.5, 540, 1480),
           (18.1, 540, 1990), (21.7, 540, 1990), (25.3, 540, 1990), (32.5, 725, 2147)],
}
# Gudang Harta guna WebAudio (tidak dilog): bunyi set game yang sama diletak pada ketukan sebenar
GT_SFX = [(2.333, 'wrong', 0.5), (5.167, 'wrong', 0.5), (8.0, 'wrong', 0.5), (10.9, 'ui', 0.7), (14.5, 'correct', 0.45),
          (18.1, 'correct', 0.4), (21.7, 'correct', 0.45), (25.3, 'correct', 0.4), (26.2, 'coin-pickup', 0.5),
          (26.35, 'coin-pickup', 0.5), (26.5, 'coin-pickup', 0.5), (32.5, 'ui', 0.7)]
GT_KEYS = [1.633, 1.8, 4.033, 4.1, 4.467, 4.633, 6.867, 6.933, 7.3, 7.467]
# bunyi asal game dilog semasa rakaman RS (masa rakaman = jam maya − 3.967 s), (masa, nama, kelantangan)
RS_SFX = [(2.663, 'aura-charge', 0.58), (3.866, 'correct', 0.52), (4.036, 'sword-slash-v2', 0.52), (4.176, 'hit', 0.52), (7.0, 'correct', 0.52), (7.17, 'sword-slash-v2', 0.52), (7.31, 'hit', 0.52), (8.9, 'wrong', 0.52), (11.8, 'correct', 0.52), (11.97, 'sword-slash-v2', 0.52), (12.11, 'hit', 0.52), (13.7, 'wrong', 0.52), (17.6, 'correct', 0.52), (17.77, 'sword-slash-v2', 0.52), (17.91, 'hit', 0.52), (19.5, 'wrong', 0.52), (19.6, 'portal-restu-jatuh-v1', 1), (19.633, 'portal-restu-jatuh-v1', 1), (31.933, 'correct', 0.52), (32.103, 'sword-slash-v2', 0.52), (32.243, 'hit', 0.52), (35.066, 'correct', 0.52), (35.236, 'sword-slash-v2', 0.52), (35.376, 'hit', 0.52), (38.2, 'correct', 0.52), (38.37, 'sword-slash-v2', 0.52), (38.51, 'hit', 0.52), (42.2, 'correct', 0.52), (42.37, 'sword-slash-v2', 0.52), (42.51, 'hit', 0.52), (46.2, 'correct', 0.52), (46.37, 'sword-slash-v2', 0.52), (46.51, 'hit', 0.52), (50.333, 'correct', 0.52), (50.503, 'sword-slash-v2', 0.52), (50.643, 'hit', 0.52), (54.466, 'correct', 0.52), (54.636, 'sword-slash-v2', 0.52), (54.776, 'hit', 0.52), (58.733, 'correct', 0.52), (58.903, 'sword-slash-v2', 0.52), (59.043, 'hit', 0.52), (62.866, 'correct', 0.52), (63.036, 'sword-slash-v2', 0.52), (63.176, 'hit', 0.52), (67.0, 'correct', 0.52), (67.0, 'aura-charge', 0.58), (67.0, 'chargeup', 0.58), (68.6, 'sword-slash-v2', 0.52), (69.75, 'sword-slash-v2', 0.52), (69.89, 'hit', 0.52), (69.89, 'glacier-thunder', 0.52), (70.3, 'glacier-thunder', 0.52), (70.5, 'glacier-thunder', 0.52), (72.242, 'finisher', 0.64), (74.266, 'coin-pickup', 0.44), (74.366, 'coin-pickup', 0.44), (74.5, 'coin-pickup', 0.44), (74.6, 'coin-pickup', 0.44), (74.733, 'coin-pickup', 0.44), (74.866, 'coin-pickup', 0.44), (75.832, 'StingerPA', 0.66)]


def _game_sfx():
    out = []
    for src, evs in (('RS', RS_SFX), ('GT', GT_SFX)):
        for c, name, vol in evs:
            t = ft(src, c)
            if t is not None and name in GS:
                dur = {'StingerPA': 3.8, 'aura-charge': 1.3, 'glacier-thunder': 1.6}.get(name, 1.0)
                out.append(('src', t, f'GS_{name}', 0.0, dur, min(1.0, vol * 1.25)))
    for c in GT_KEYS:
        t = ft('GT', c)
        if t is not None:
            out.append(('pop', t, 0.16))
    for c in (23.333, 23.7, 24.067, 24.433):    # titik PIN
        t = ft('RS', c)
        if t is not None:
            out.append(('pop', t, 0.18))
    return out


def _taps(r):
    pts = [(ft(src, c), x, y) for src, lst in TAPS.items() for c, x, y in lst]
    return TapRings(r, 0, [p for p in pts if p[0] is not None])


# ---------------------------------------------------------------- hook
def hooks():
    w1 = _line(['Anak', 'main', 'app'], 104, 760, 0.0, 0.1)
    w1.append(dict(text='Matematik…', size=150, x=540, y=930, t=0.32))
    h1 = HookText(0.0, w1, twist=(0.9, 1.4), exit_=(1.62, 1.98), center=(540, 860))
    w2 = _line(['tekan', 'je,'], 130, 820, 2.0, 0.12)
    w2.append(dict(text='teka', size=290, x=540, y=1060, t=2.35, focus=True, spin=16, **HOT))
    w2.append(dict(text='je?', size=150, x=540, y=1270, t=2.62))
    h2 = HookText(2.0, w2, twist=(2.75, 3.4), exit_=(3.62, 3.98), center=(540, 1000), shake_word=2)
    return [h1, h2]


# ---------------------------------------------------------------- babak (latar)
SCENES = [
    dict(t0=0.0, bg='deep'),
    dict(t0=8.2, bg='deep'),
    dict(t0=10.4, bg='navy', wipe=0.35, wipe_tile='−', origin=(540, 1100)),
    dict(t0=19.1, bg='deep', wipe=0.3, wipe_tile='+', origin=(540, 1100)),
    dict(t0=28.55, bg='deep'),
    dict(t0=30.0, bg='navy', wipe=0.35, wipe_tile='×', origin=(540, 960)),
    dict(t0=33.0, bg='deep', wipe=0.35, wipe_tile='÷', origin=(540, 1100)),
    dict(t0=58.2, bg='navy'),
    dict(t0=62.7, bg='gold', wipe=0.45, wipe_tile='×', origin=(540, 960),
         tiles=[('+', 150, 300, 140, -14, 0.35), ('−', 930, 330, 120, 10, 0.45), ('×', 160, 1700, 130, 8, 0.55), ('÷', 920, 1680, 150, -8, 0.5)]),
]

HIDE = R(s=1.0, oy=1500, rx=20, a=0.0)
GONE = R(s=1.45, oy=1260, a=0.0)
BASE = dict(s=1.28, oy=1282)
KELAS = dict(s=1.28, oy=1335)      # telefon diturunkan sedikit: ruang untuk label langkah dan arahan Wira yang diangkat

CAMERA = [
    (0.0, HIDE),
    # WOW: zoom terus ke arena
    (3.9, Z(0.5, 0.18, 2.55, oy=900, a=0.0)),
    (4.0, Z(0.5, 0.18, 2.45, oy=900)),
    (4.45, Z(0.5, 0.18, 2.22, oy=900), 'out'),
    (6.0, Z(0.5, 0.18, 2.3, oy=900)),
    (6.1, Z(0.5, 0.18, 2.42, oy=900)),
    (6.55, Z(0.5, 0.18, 2.22, oy=900), 'out'),
    (8.05, Z(0.5, 0.185, 2.3, oy=900)),
    (8.2, Z(0.5, 0.185, 2.45, oy=900, a=0.0), 'in'),
    (10.25, R(s=0.9, oy=1560, ry=-14, rz=-3, rx=14, a=0.0)),
    (10.7, R(**BASE, ry=-6, rz=-1, rx=3), 'out'),
    (12.7, R(s=1.3, oy=1278, ry=-3, rz=-0.5, rx=1)),
    (13.1, R(s=1.34, oy=1270, ry=4, rz=0.8, rx=2)),
    (15.85, R(s=1.36, oy=1266, ry=2, rz=0.3, rx=1)),
    (16.0, GONE, 'in'),
    # Portal Restu → SEMAKAN
    (19.1, R(s=1.0, oy=1380, ry=12, rz=2, rx=8, a=0.0)),
    (19.5, R(**BASE, ry=5, rz=1, rx=2), 'out'),
    (22.7, R(s=1.3, oy=1278, ry=2, rz=0.4, rx=1)),
    (23.1, R(**BASE, ry=-5, rz=-1, rx=2)),
    (28.3, R(s=1.31, oy=1276, ry=-2, rz=-0.3, rx=1)),
    (28.55, GONE, 'in'),
    # Kelas Wira: tenang, hampir statik supaya setiap langkah boleh dibaca
    (33.0, R(s=1.0, oy=1420, ry=-12, rz=-2, rx=8, a=0.0)),
    (33.45, R(**KELAS, ry=-4, rz=-0.6, rx=2), 'out'),
    (38.9, R(**KELAS, ry=-2, rz=-0.3, rx=1)),
    (39.6, R(**KELAS, ry=0, rz=0, rx=0)),
    (56.8, R(s=1.3, oy=1330, ry=0)),
    (57.2, R(**KELAS, ry=3, rz=0.5, rx=1)),
    (58.1, R(s=1.3, oy=1330, ry=2)),
    # Jurus Penamat, BERJAYA
    (58.2, R(s=1.3, oy=1278, ry=1)),
    (58.5, Z(0.5, 0.18, 2.2, oy=900)),
    (60.95, Z(0.5, 0.185, 2.3, oy=900)),
    (61.2, R(**BASE, ry=-3, rz=-0.5, rx=1)),
    (62.55, R(s=1.31, oy=1276, ry=-1)),
    (62.75, GONE, 'in'),
    (66.6, GONE),
]

PHONES = [dict(shots=SHOTS, camera=CAMERA, highlights=[])]


def g(c):
    return ft('GT', c)


# ---------------------------------------------------------------- teks
TEXTS = []
STEP_K = 150     # baris "LANGKAH n / 4"
STEP_H = 238     # tajuk langkah
RISES = [
    RiseText(4.1, 6.0, [[('Animasi', WH), ('cantik.', GD)]], y=260, size=104),
    RiseText(6.2, 8.1, [[('Jawab', WH), ('betul,', WH)], [('kunci', GD), ('pecah!', GD)]], y=250, size=104),
    RiseText(8.35, 10.3, [[('Tapi', WH), ('kalau', WH), ('anak', WH)], [('teka-teka?', GD)]], y=860, size=110),
    RiseText(10.5, 12.5, [[('Teka', WH), ('laju?', GD)]], y=250, size=104),
    RiseText(12.65, 15.1, [[('Cikgu', WH), ('Dimensi', WH)], [('terus', GD), ('perasan.', GD)]], y=250, size=96),
    RiseText(15.2, 15.98, [[('Kali', WH), ('ke-3…', GD)]], y=250, size=104),
    RiseText(16.25, 19.0, [[('Wira', WH), ('jatuh', WH), ('ke', WH)], [('Portal', GD), ('Restu!', GD)]], y=270, size=104),
    RiseText(19.25, 22.75, [[('Panggil', WH)], [('mak', GD), ('ayah.', GD)]], y=250, size=96),
    RiseText(21.0, 22.75, [[('Portal', SOFT), ('Restu', SOFT), ('aktif', SOFT), ('dalam', SOFT), ('akaun', SOFT), ('keluarga,', SOFT),
                            ('bukan', SOFT), ('Demo.', SOFT)]], y=470, size=30, font_name='Inter-SemiBold.otf'),
    RiseText(22.95, 25.4, [[('Mak', WH), ('ayah', WH), ('nampak', WH)], [('setiap', GD), ('tekaan.', GD)]], y=250, size=92),
    RiseText(25.55, 28.45, [[('Lepas', WH), ('tu,', WH)], [('teruskan', GD), ('main.', GD)]], y=250, size=96),
    RiseText(28.65, 30.0, [[('Bukan', WH), ('sekadar', WH)], [('halang', WH), ('teka…', GD)]], y=860, size=110),
    RiseText(30.1, 32.95, [[('…Wira', WH), ('ajar', WH)], [('sampai', GD), ('faham.', GD)]], y=250, size=96),
    RiseText(30.5, 32.95, [[('9', GD), ('MINI-GAME', GD), ('KEMAHIRAN', GD), ('FOKUS*', GD)]], y=470, size=40,
             font_name='InterDisplay-ExtraBold.otf'),
    RiseText(31.0, 32.95, [[('*Mini-game', SOFT), ('Kemahiran', SOFT), ('Fokus', SOFT), ('dalam', SOFT), ('pakej', SOFT),
                           ('Family', SOFT), ('Plus.', SOFT)]], y=1800, size=30, font_name='Inter-SemiBold.otf'),
    # --- Kelas Wira (1×)
    RiseText(33.15, 37.6, [[('Salah', WH), ('3', GD), ('kali?', WH)]], y=230, size=104),
    RiseText(35.2, 37.6, [[('Tak', GD), ('apa.', GD)]], y=350, size=104),
    RiseText(37.75, g(11.15), [[('Wira', WH), ('terus', WH)], [('tunjuk', GD), ('cara.', GD)]], y=230, size=104),
    RiseText(g(11.25), g(15.35), [[('LANGKAH', GD), ('1', GD), ('/', GD), ('4', GD)]], y=STEP_K, size=44, font_name='InterDisplay-ExtraBold.otf'),
    RiseText(g(11.3), g(15.35), [[('Baca', WH), ('cerita,', WH), ('pilih', WH), ('ayat.', GD)]], y=STEP_H, size=72),
    RiseText(g(15.45), g(18.85), [[('LANGKAH', GD), ('2', GD), ('/', GD), ('4', GD)]], y=STEP_K, size=44, font_name='InterDisplay-ExtraBold.otf'),
    RiseText(g(15.5), g(18.85), [[('Tak', WH), ('cukup?', WH), ('Pinjam', GD), ('1.', GD)]], y=STEP_H, size=72),
    RiseText(g(18.95), g(22.55), [[('LANGKAH', GD), ('3', GD), ('/', GD), ('4', GD)]], y=STEP_K, size=44, font_name='InterDisplay-ExtraBold.otf'),
    RiseText(g(19.0), g(22.55), [[('Tempat', WH), ('sa:', WH), ('10', GD), ('−', GD), ('3', GD), ('=', GD), ('7', GD)]], y=STEP_H, size=72),
    RiseText(g(22.65), g(26.05), [[('LANGKAH', GD), ('4', GD), ('/', GD), ('4', GD)]], y=STEP_K, size=44, font_name='InterDisplay-ExtraBold.otf'),
    RiseText(g(22.7), g(26.05), [[('Tempat', WH), ('puluh:', WH), ('3', GD), ('turun.', GD)]], y=STEP_H, size=72),
    RiseText(g(26.15), g(28.35), [[('40', WH), ('−', WH), ('3', WH), ('=', WH), ('37.', GD)]], y=200, size=120),
    RiseText(g(26.6), g(28.35), [[('Faham', WH), ('cara,', WH), ('bukan', WH), ('hafal', GD), ('jawapan.', GD)]], y=330, size=56),
    RiseText(g(32.2), 58.15, [[('Lepas', WH), ('faham,', WH)], [('anak', GD), ('cuba', GD), ('sendiri.', GD)]], y=230, size=96),
    RiseText(58.35, 62.6, [[('Faham', WH), ('dulu…', WH)], [('baru', GD), ('menang!', GD)]], y=250, size=96),
]

TRAIL = [('Teka 1 · 0.5 s', 10.6, ft('RS', 8.9), False), ('Teka 2 · 0.5 s', 12.7, ft('RS', 13.7), False),
         ('Teka 3 · 0.5 s', 15.6, ft('RS', 19.5), False)]
TRAIL_GT = [('Cuba 1', 33.2, g(2.333), False), ('Cuba 2', g(4.033), g(5.167), False), ('Cuba 3', g(6.867), g(8.0), False)]

# kotak cerita dan kotak arahan Wira dalam rakaman GT (u0, v0, u1, v1)
STORY = (0.035, 0.228, 0.965, 0.296)
SAY = (0.06, 0.328, 0.94, 0.436)

SPECIALS = [
    # latar hook: arena kabur dengan riak tekaan
    FullClip('src_RS.mp4', 0.0, 4.0, [(8.5, 10.1, 4.0)], zoom=(2.3, 2.4), dim=0.4, blur=14, fade=(0.0, 0.3), center=(0.5, 0.17)),
    *hooks(),
    # WOW: latar arena kabur di belakang telefon yang dizum ke arena (serangan, kemudian GANGSA PECAH!)
    FullClip('src_RS.mp4', 4.0, 8.2, [(6.95, 8.75, 2.1), (11.75, 13.65, 2.1)], zoom=(2.3, 2.42), dim=0.38, blur=18, scrim=0.5,
             fade=(0.15, 0.25), center=(0.5, 0.17)),
    FullClip('src_RS.mp4', 8.2, 10.4, [(8.45, 10.65, 2.2)], zoom=(2.3, 2.4), dim=0.36, blur=10, fade=(0.25, 0.0), center=(0.5, 0.17)),
    FullClip('src_GT.mp4', 28.55, 30.0, [(19.4, 20.85, 1.45)], zoom=(1.9, 2.0), dim=0.32, blur=12, fade=(0.25, 0.2), center=(0.5, 0.5)),
    # jatuh ke Portal Restu (sinematik yang sama dimainkan app)
    FullClip('src_JATUH.mp4', 16.0, 19.1, [(0.0, 3.1, 3.1)], zoom=(1.0, 1.07), scrim=0.6, fade=(0.1, 0.0)),
    _taps,
    Trail(10.5, 16.0, 540, TRAIL),
    Trail(33.1, 37.6, 520, TRAIL_GT),
    # amaran Cikgu Dimensi (belon sebenar), dinaikkan
    lambda r: Callout(r, 0, 13.2, 15.4, (0.02, 0.004, 0.975, 0.092), 540, 660, 980, ry=-4, rz=-0.5),
    # Portal Restu: Cikgu
    lambda r: Callout(r, 0, 19.45, 20.9, (0.11, 0.33, 0.885, 0.45), 540, 610, 900, ry=4, rz=0.5),
    # SEMAKAN: tekaan pertama, kemudian nasihat Cikgu
    lambda r: Callout(r, 0, 23.3, 25.45, (0.11, 0.192, 0.89, 0.482), 540, 790, 860, ry=-4, rz=-0.5),
    lambda r: Callout(r, 0, 25.75, 28.35, (0.1, 0.487, 0.9, 0.628), 540, 640, 900, ry=4, rz=0.5),
    VideoGrid(30.0, 32.95, GRID, y0=700, labels=GRID_LABELS),
    # Kelas Wira: cerita (langkah 1) dan arahan Wira (langkah 2–4) diangkat besar, terus dari skrin app
    lambda r: Callout(r, 0, g(11.6), g(15.3), STORY, 540, 450, 1000, ry=0, rz=0),
    lambda r: Callout(r, 0, g(15.55), g(18.85), SAY, 540, 455, 990, ry=0, rz=0),
    lambda r: Callout(r, 0, g(18.95), g(22.55), SAY, 540, 455, 990, ry=0, rz=0),
    lambda r: Callout(r, 0, g(22.7), g(26.05), SAY, 540, 455, 990, ry=0, rz=0),
    *RISES,
    EndScene(62.7, 67.2, lines=[('App yang', 58, WH), ('betul-betul', 66, GD), ('mengajar.', 66, GD)],
             tag=('Bukan main semata.', 'Cuba demo, tengok sendiri.'), box_h=560),
]

FLASHES = [(4.0, 0.35, 0.6), (6.1, 0.3, 0.45), (16.0, 0.35, 0.7), (30.0, 0.3, 0.45), (g(26.15), 0.3, 0.3), (61.1, 0.3, 0.4)]

# ---------------------------------------------------------------- audio (1 bar = 2 s)
# tenang semasa Kelas Wira (33–58 s), drop pada Jurus Penamat (58 s)
MUSIC = [('intro', 0, 2), ('drop', 2, 2), ('build', 4, 1), ('groove', 5, 3), ('drop', 8, 2), ('light', 10, 4),
         ('build', 14, 1), ('drop', 15, 1), ('break', 16, 1), ('light', 17, 11), ('build', 28, 1), ('drop', 29, 2),
         ('groove', 31, 1), ('outro', 32, 2)]

SFX = [
    ('pop', 0.02, 0.4), ('pop', 0.12, 0.4), ('pop', 0.22, 0.4), ('thud', 0.33, 0.8), ('whoosh', 1.6, 0.45, 0.85, 6000, 400),
    ('pop', 2.02, 0.45), ('pop', 2.14, 0.45), ('thud', 2.36, 1.0), ('buzz', 2.4, 0.5), ('pop', 2.63, 0.5),
    ('boing', 2.75, 0.6, 0.8), ('whoosh', 3.6, 0.45, 0.85, 6000, 400),
    ('impact', 4.0, 0.5), ('whoosh', 6.0, 0.5, 0.6), ('impact', 6.2, 0.4), ('whoosh', 8.1, 0.6, 0.6),
    ('pop', 8.4, 0.4), ('pop', 8.55, 0.4), ('thud', 8.75, 0.7), ('whoosh', 10.25, 0.5, 0.6),
    ('buzz', 13.0, 0.6), ('whoosh', 15.85, 0.6, 0.8), ('impact', 16.0, 0.6), ('src', 16.0, 'JATUH', 0.0, 3.1, 0.75),
    ('whoosh', 18.95, 0.5, 0.6), ('pop', 19.5, 0.4), ('pop', 23.35, 0.45), ('pop', 25.8, 0.45),
    ('whoosh', 28.4, 0.6, 0.6), ('pop', 28.7, 0.35), ('whoosh', 29.85, 0.5, 0.6),
    *[('pop', 30.05 + 0.07 * i, 0.28) for i in range(9)], ('whoosh', 32.9, 0.5, 0.6),
    ('pop', 37.8, 0.4), ('shimmer', g(26.15), 0.5), ('whoosh', 58.05, 0.5, 0.6),
    *_game_sfx(),
    *end_sfx(62.7),
]
