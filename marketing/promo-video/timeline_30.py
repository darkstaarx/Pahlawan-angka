"""Timeline versi ringkas 30 saat (9:16) — bahan dan enjin yang sama dengan versi utama."""
from timeline_common import Shot, Z, R, chunk_vo, GANGSA, PERAK, EMAS

DURATION = 30.0

SHOTS = [
    Shot(0.0, 3.0, [(125.2, 128.2, 3.0)], 'hook-jurus-penamat'),
    Shot(3.0, 7.0, [(60.0, 64.0, 4.0)], 'soalan-jawapan-aksi'),
    Shot(7.0, 11.0, [(51.7, 55.7, 4.0)], 'hub-kembara-dimensi'),
    Shot(11.0, 15.0, [(110.8, 114.2, 3.4), (114.2, 114.2, 0.6)], 'kunci-emas-taip'),
    Shot(15.0, 18.4, [(150.6, 154.0, 3.4)], 'evolusi-bara'),
    Shot(18.4, 21.8, [(161.2, 163.0, 1.8), (163.0, 163.0, 1.6)], 'ringkasan-anak'),
    Shot(21.8, 24.6, [(177.6, 177.6, 2.8)], 'had-masa-bermain'),
    Shot(24.6, 30.0, [(184.2, 186.4, 2.2), (186.4, 186.4, 3.2)], 'worksheet'),
]

CAMERA = [
    (0.0, R(s=0.94, oy=1300, ry=-14, rz=-4, a=0.0)),
    (0.8, R(s=1.04, oy=1120, ry=-6, rz=-2)),
    (2.9, R(s=1.12, v=0.42, ry=-3, rz=-1)),
    (3.4, R()), (3.9, Z(0.5, 0.52, 1.95)), (5.4, Z(0.5, 0.52, 1.95)), (5.95, R()),
    (7.2, R()), (7.8, Z(0.5, 0.55, 2.0)), (10.4, Z(0.5, 0.55, 2.0)), (10.95, R()),
    (11.15, R()), (11.7, Z(0.5, 0.42, 1.95)), (13.2, Z(0.5, 0.42, 1.95)), (13.7, R()), (14.0, R()), (14.45, Z(0.45, 0.86, 1.8)), (15.0, Z(0.45, 0.86, 1.8)),
    (15.35, R()), (17.0, R(s=1.24, v=0.45)), (18.05, R(s=1.24, v=0.45)), (18.45, R()),
    (18.6, R()), (19.15, Z(0.5, 0.78, 2.0)), (21.3, Z(0.5, 0.78, 2.0)), (21.75, R()),
    (22.0, R()), (22.5, Z(0.5, 0.68, 1.85)), (24.2, Z(0.5, 0.68, 1.85)), (24.6, R()),
    (24.8, R()), (25.3, Z(0.5, 0.6, 1.7)), (26.6, Z(0.5, 0.6, 1.7)),
    (27.3, R(s=0.95, oy=1350, a=0.0)), (30.0, R(s=0.95, oy=1350, a=0.0)),
]

HIGHLIGHTS = [
    (5.95, 6.8, 0.51, 0.765, 0.965, 0.835),     # jawapan 80 + 3
    (7.9, 10.4, 0.04, 0.485, 0.96, 0.625),      # kad Kembara Dimensi
    (11.8, 13.2, 0.03, 0.515, 0.97, 0.625),     # KUNCI EMAS + ruang taip
    (14.55, 15.0, 0.02, 0.86, 0.6, 0.935),      # Betul! Kunci retak
    (19.2, 21.3, 0.03, 0.63, 0.97, 0.88),       # Yang semakin kuat / Fokus seterusnya
    (22.55, 24.2, 0.03, 0.545, 0.97, 0.805),    # had masa + kunci
    (25.4, 26.6, 0.03, 0.795, 0.97, 0.865),     # Latihan + skema
]

TIERS = [('Gangsa', GANGSA, 11.4), ('Perak', PERAK, 11.9), ('Emas', EMAS, 12.4)]

TEXTS = [
    (0.6, 2.9, 'PAHLAWAN ANGKA', 'Matematik jadi pengembaraan'),
    (3.1, 6.9, 'DALAM BAHASA MELAYU', 'Matematik KSSR Darjah 1–6'),
    (7.1, 10.9, 'KEMBARA DIMENSI', 'Latihan ikut kemampuan anak'),
    (11.1, 14.9, 'TIGA TAHAP KUNCI', '@tiers'),
    (15.1, 18.3, 'KHAZANAH', 'Enam teman · Evolusi Bara'),
    (18.5, 21.7, 'UNTUK IBU BAPA', 'Lihat perkembangan anak'),
    (21.9, 24.5, 'CONTOH TETAPAN IBU BAPA', 'Had masa & kunci'),
    (24.7, 26.8, 'WORKSHEET', 'Sambung atas kertas'),
]

VO = [
    (0.3, 2.8, 'Bila latihan matematik jadi pengembaraan...'),
    (3.1, 6.8, 'Matematik KSSR Darjah 1 hingga 6 — jawab betul, wira beraksi!'),
    (7.1, 10.8, 'Cikgu Dimensi membantu memilih latihan mengikut kemampuan anak.'),
    (11.1, 14.8, 'Gangsa, Perak, Emas — ada jawapan yang ditaip sendiri!'),
    (15.1, 18.2, 'Kumpul enam teman dan lihat Evolusi Bara!'),
    (18.5, 21.6, 'Lihat kekuatan anak dan fokus latihan seterusnya.'),
    (21.9, 24.4, 'Tetapkan had masa dan kunci.'),
    (24.7, 26.7, 'Sambung latihan atas kertas dengan worksheet.'),
    (27.1, 29.6, 'Pahlawan Angka. Cuba demo sekarang!'),
]

TEMAN = None

SPECIALS = [
    ('end', 26.8, 30.0, dict(logo_y=820, tag_t=27.4, cta_t=28.1)),
]

MUSIC_GAIN = 0.55
MUSIC_END = 27.4
STINGER = (26.8, 3.2)
GAME_SFX = [
    (0.0, 125.2, 128.2, 0.9),
    (5.8, 62.8, 64.0, 1.0),
    (13.5, 113.3, 114.2, 1.0),
    (15.0, 150.6, 154.0, 0.9),
]


def subtitle_chunks():
    return chunk_vo(VO)
