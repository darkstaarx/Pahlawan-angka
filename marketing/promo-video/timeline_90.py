"""Timeline video utama ~93 saat (9:16).

Semua masa sumber merujuk footage gameplay asal (rakaman 3:27) selepas ditukar
kepada 30 fps tetap. Segmen (a, b, d): main sumber a..b dalam d saat output;
a == b bermaksud tahan bingkai (freeze) untuk paparan UI statik.
"""
from timeline_common import Shot, Z, R, chunk_vo, GANGSA, PERAK, EMAS

DURATION = 93.0

SHOTS = [
    Shot(0.0, 6.0, [(124.9, 130.9, 6.0)], 'hook-jurus-penamat'),
    Shot(6.0, 9.0, [(28.4, 31.4, 3.0)], 'masuk-pengembaraan'),
    Shot(9.0, 16.0, [(58.9, 65.9, 7.0)], 'soalan-jawapan-aksi'),
    Shot(16.0, 21.0, [(51.5, 55.2, 5.0)], 'hub-kembara-dimensi'),
    Shot(21.0, 25.0, [(15.0, 15.0, 4.0)], 'peta-topik-penguasaan'),
    Shot(25.0, 29.0, [(26.3, 27.45, 4.0)], 'baba-kemahiran-fokus'),
    Shot(29.0, 32.4, [(37.6, 41.0, 3.4)], 'misi-tahun6-kebolehjadian'),
    Shot(32.4, 36.0, [(132.4, 136.0, 3.6)], 'berjaya-cikgu-dimensi'),
    Shot(36.0, 39.6, [(67.4, 70.9, 3.6)], 'kunci-gangsa'),
    Shot(39.6, 44.0, [(86.8, 91.2, 4.4)], 'kunci-perak-ke-emas'),
    Shot(44.0, 49.0, [(109.7, 114.2, 4.5), (114.2, 114.2, 0.5)], 'kunci-emas-taip'),
    Shot(49.0, 56.6, [(141.0, 141.0, 2.9), (141.0, 142.7, 2.2), (142.7, 143.1, 2.5)], 'khazanah-teman'),
    Shot(56.6, 62.6, [(148.3, 154.3, 6.0)], 'evolusi-bara'),
    Shot(62.6, 68.0, [(161.2, 164.2, 3.0), (164.2, 164.2, 2.4)], 'ringkasan-anak'),
    Shot(68.0, 72.4, [(169.5, 169.5, 4.4)], 'laporan-kemahiran'),
    Shot(72.4, 81.0, [(175.6, 177.6, 2.0), (177.6, 177.6, 6.6)], 'had-masa-bermain'),
    Shot(81.0, 84.4, [(183.0, 186.4, 3.4)], 'worksheet-sediakan'),
    Shot(84.4, 93.0, [(193.8, 196.4, 2.6), (196.4, 196.4, 6.0)], 'worksheet-pdf'),
]

CAMERA = [
    # 0–6 hook: telefon masuk dari bawah, kemudian device push-in perlahan
    (0.0, R(s=0.92, oy=1320, ry=-16, rz=-5, a=0.0)),
    (0.9, R(s=1.02, oy=1120, ry=-7, rz=-2)),
    (5.6, R(s=1.15, v=0.42, ry=-3, rz=-1)),
    (6.4, R()),
    # 9–16 soalan -> jawapan -> aksi
    (9.5, R()), (10.3, Z(0.5, 0.52, 1.95)), (12.3, Z(0.5, 0.52, 1.95)), (13.0, R()),
    # 16–21 Kembara Dimensi
    (16.3, R()), (17.1, Z(0.5, 0.55, 2.0)), (20.2, Z(0.5, 0.55, 2.0)), (20.9, R()),
    # 21–25 peta topik
    (21.1, R()), (21.8, Z(0.5, 0.24, 2.0)), (24.3, Z(0.5, 0.27, 2.0)), (25.0, R()),
    # 25–29 fokus Baba
    (25.3, R()), (26.0, Z(0.27, 0.71, 2.2)), (28.2, Z(0.27, 0.71, 2.2)), (28.85, R()),
    # 29–32.4 misi Tahun 6
    (29.15, R()), (29.8, Z(0.5, 0.045, 2.3)), (30.6, Z(0.5, 0.045, 2.3)), (31.3, Z(0.5, 0.56, 1.8)), (32.1, Z(0.5, 0.56, 1.8)), (32.55, R()),
    # 32.4–36 BERJAYA + Cikgu Dimensi
    (32.7, R()), (33.3, Z(0.56, 0.72, 2.1)), (35.3, Z(0.56, 0.72, 2.1)), (35.9, R()),
    # 36–39.6 Gangsa
    (36.1, R()), (36.7, Z(0.80, 0.15, 2.4)), (37.6, Z(0.80, 0.15, 2.4)), (38.3, Z(0.45, 0.86, 1.9)), (39.2, Z(0.45, 0.86, 1.9)), (39.75, R()),
    # 39.6–44 Perak -> Emas
    (40.1, R()), (40.7, Z(0.48, 0.84, 1.9)), (42.4, Z(0.48, 0.84, 1.9)), (42.95, Z(0.76, 0.125, 2.3)), (43.5, Z(0.76, 0.125, 2.3)), (44.05, R()),
    # 44–49 Emas: taip jawapan sendiri
    (44.4, R()), (45.1, Z(0.5, 0.42, 1.95)), (47.25, Z(0.5, 0.42, 1.95)), (47.8, R()), (48.2, R()), (48.7, Z(0.45, 0.86, 1.8)), (49.0, Z(0.45, 0.86, 1.8)),
    # 49–51.9 kad enam teman (telefon diketepikan)
    (49.45, R(s=0.92, oy=1300, a=0.0)), (51.5, R(s=0.95, oy=1240, a=0.0)), (52.1, R()),
    # 52–56.6 Khazanah: push-in, kemudian close-up Riya
    (53.4, R(s=1.2, v=0.47)), (54.25, Z(0.5, 0.66, 1.85)), (56.05, Z(0.5, 0.66, 1.85)), (56.55, R()),
    # 56.6–62.6 evolusi: device push-in perlahan, tahan pada rupa baharu
    (56.8, R()), (60.2, R(s=1.26, v=0.45)), (62.2, R(s=1.26, v=0.45)), (62.7, R()),
    # 62.6–68 Ringkasan Anak
    (62.9, R()), (63.6, Z(0.5, 0.34, 1.9)), (65.0, Z(0.5, 0.34, 1.9)), (65.7, Z(0.5, 0.78, 2.0)), (67.4, Z(0.5, 0.78, 2.0)), (68.0, R()),
    # 68–72.4 Laporan kemahiran
    (68.2, R()), (68.9, Z(0.5, 0.64, 2.1)), (71.8, Z(0.5, 0.64, 2.1)), (72.4, R()),
    # 72.4–81 Had masa bermain
    (73.9, R()), (74.6, Z(0.5, 0.63, 2.0)), (77.1, Z(0.5, 0.63, 2.0)), (77.8, Z(0.36, 0.77, 2.2)), (80.4, Z(0.36, 0.77, 2.2)), (81.0, R()),
    # 81–87 worksheet
    (81.2, R()), (81.9, Z(0.5, 0.6, 1.7)), (83.9, Z(0.5, 0.6, 1.7)), (84.45, R()), (85.0, R()), (85.7, R(s=1.25, v=0.62)), (87.0, R(s=1.28, v=0.62)),
    # 87–93 penutup
    (87.8, R(s=0.95, oy=1350, a=0.0)), (93.0, R(s=0.95, oy=1350, a=0.0)),
]

# highlight (t0, t1, u0, v0, u1, v1) — dilukis pada footage, jadi terkunci pada skrin
HIGHLIGHTS = [
    (12.95, 13.9, 0.51, 0.765, 0.965, 0.835),   # jawapan 80 + 3
    (17.2, 20.1, 0.04, 0.485, 0.96, 0.625),     # kad Kembara Dimensi
    (21.9, 24.3, 0.03, 0.15, 0.97, 0.29),       # Penguasaan keseluruhan
    (26.1, 28.2, 0.03, 0.64, 0.49, 0.785),      # Kemahiran Fokus Baba
    (29.85, 30.6, 0.2, 0.0, 0.8, 0.065),        # tajuk misi Tahun 6
    (33.4, 35.3, 0.30, 0.655, 0.975, 0.775),    # mesej Cikgu Dimensi
    (36.8, 37.6, 0.64, 0.125, 0.94, 0.175),     # segel Gangsa (2 pip)
    (41.4, 42.4, 0.02, 0.79, 0.62, 0.93),       # Kunci PERAK pecah
    (43.0, 43.5, 0.53, 0.095, 0.96, 0.15),      # 5 pip Emas
    (45.2, 47.25, 0.03, 0.515, 0.97, 0.625),    # KUNCI EMAS + ruang taip
    (48.3, 49.0, 0.02, 0.86, 0.6, 0.935),       # Betul! Kunci retak
    (54.45, 56.05, 0.08, 0.60, 0.92, 0.745),    # status Riya
    (63.7, 65.0, 0.03, 0.22, 0.97, 0.56),       # Kuasa Cica semakin stabil + statistik
    (65.8, 67.4, 0.03, 0.63, 0.97, 0.88),       # Yang semakin kuat / Fokus seterusnya
    (69.0, 71.8, 0.03, 0.585, 0.97, 0.715),     # pratonton kemahiran utama
    (74.7, 77.1, 0.03, 0.545, 0.97, 0.72),       # had harian, had sesi, rehat
    (77.9, 80.4, 0.03, 0.725, 0.62, 0.805),     # kunci apabila had dicapai
    (82.0, 83.0, 0.69, 0.30, 0.985, 0.405),     # Disyorkan (ikut bukti anak)
    (83.05, 83.9, 0.03, 0.795, 0.97, 0.865),    # Latihan + skema
]

TIERS = [('Gangsa', GANGSA, 38.9), ('Perak', PERAK, 42.0), ('Emas', EMAS, 42.6)]

TEXTS = [
    (0.7, 5.9, 'PAHLAWAN ANGKA', 'Matematik jadi pengembaraan'),
    (6.2, 11.9, 'DALAM BAHASA MELAYU', 'Matematik KSSR Darjah 1–6'),
    (12.2, 15.9, 'SOALAN · JAWAPAN · AKSI', 'Jawab betul, wira beraksi'),
    (16.2, 20.9, 'KEMBARA DIMENSI', 'Latihan ikut kemampuan anak'),
    (21.1, 24.9, 'PETA TOPIK', 'Penguasaan setiap topik dipantau'),
    (25.2, 32.3, 'CONTOH: BABA · DARJAH 6', 'Misi ikut fokus kemahiran'),
    (32.6, 35.9, 'CIKGU DIMENSI', 'Setiap usaha disambut semangat'),
    (36.1, 43.9, 'TIGA TAHAP KUNCI', '@tiers'),
    (44.1, 48.9, 'KUNCI EMAS', 'Taip jawapan sendiri'),
    (49.1, 51.8, 'KHAZANAH', 'Enam teman untuk dikumpul'),
    (52.0, 56.5, 'TEMAN KEMBARA', 'Selamatkan teman dalam kembara'),
    (56.8, 62.5, 'EVOLUSI TEMAN', 'Evolusi Bara'),
    (62.8, 67.9, 'UNTUK IBU BAPA', 'Ringkasan Anak'),
    (68.1, 72.3, 'LAPORAN KEMAHIRAN', 'Kekuatan & latihan seterusnya'),
    (72.6, 74.5, 'KAWALAN IBU BAPA', 'Ibu bapa tentukan masa bermain'),
    (74.6, 80.9, 'CONTOH TETAPAN IBU BAPA', 'Had sesi, had harian & kunci'),
    (81.2, 86.9, 'WORKSHEET', 'Sambung latihan atas kertas'),
]

VO = [
    (0.5, 3.7, 'Macam mana kalau latihan matematik jadi satu pengembaraan?'),
    (6.2, 11.8, 'Inilah Pahlawan Angka — latihan Matematik KSSR Darjah 1 hingga 6, dalam Bahasa Melayu yang mudah difahami.'),
    (12.3, 15.2, 'Jawab dengan betul, dan wira terus beraksi!'),
    (16.3, 20.7, 'Dalam Kembara Dimensi, Cikgu Dimensi membantu memilih latihan mengikut kemampuan anak.'),
    (21.2, 24.8, 'Penguasaan setiap topik dipantau — bukan sekadar ikut darjah sekolah.'),
    (25.3, 28.9, 'Fokus Baba ialah Kebolehjadian, jadi misinya pun tentang Kebolehjadian.'),
    (29.3, 32.1, 'Misi berkembang bersama kemajuan mereka.'),
    (32.6, 35.8, 'Setiap usaha disambut kata semangat daripada Cikgu Dimensi.'),
    (37.3, 40.3, 'Harungi cabaran Gangsa, Perak dan Emas.'),
    (44.3, 47.6, 'Pada tahap Emas, ada jawapan yang perlu ditaip sendiri!'),
    (49.2, 52.4, 'Teruskan pengembaraan dan temui enam teman untuk dikumpul.'),
    (52.8, 56.0, 'Ada teman yang sedang menunggu untuk diselamatkan dalam kembara.'),
    (57.4, 61.4, 'Lihat teman berkembang bersama pengembaraanmu — Evolusi Bara!'),
    (62.8, 67.8, 'Untuk ibu bapa, Ringkasan Anak menunjukkan kemahiran yang semakin kuat dan fokus latihan seterusnya.'),
    (68.3, 72.0, 'Lihat perkembangan anak dan kemahiran yang perlukan latihan lagi.'),
    (72.7, 77.2, 'Ibu bapa tentukan masa bermain — had satu sesi, had harian dan peringatan rehat.'),
    (77.9, 80.5, 'Aktifkan kunci apabila had dicapai.'),
    (81.3, 86.4, 'Dah cukup masa skrin? Muat turun worksheet dan sambung latihan atas kertas.'),
    (87.5, 90.7, 'Pahlawan Angka. Pengembaraan matematik ikut kemampuan anak.'),
    (91.0, 92.6, 'Cuba demo Pahlawan Angka!'),
]

TEMAN = [
    ('Aurora', 'Musang Ekor Angka', 'assets/pets/aurora/front.webp'),
    ('Kukupat', 'Kura-Kura Ketupat', 'assets/pets/collection/ketupat-kura/idle.png'),
    ('Kumbis', 'Kumbang Manggis', 'assets/pets/collection/kumbang-manggis/idle.png'),
    ('Riya', 'Harimau Bunga', 'assets/pets/collection/harimau-bunga/idle.png'),
    ('Bunnis', 'Arnab Kek Lapis', 'assets/pets/collection/arnab-kek-lapis/idle.png'),
    ('Keryan', 'Kerbau Durian', 'assets/pets/collection/durian-kerbau/idle.png'),
]

SPECIALS = [
    ('teman', 49.2, 51.75),
    ('end', 87.0, 93.0, dict(logo_y=820, tag_t=88.0, cta_t=90.9)),
]

# audio: muzik tema permainan + stinger + bunyi gameplay terpilih
MUSIC_GAIN = 0.55
MUSIC_END = 88.2
STINGER = (87.0, 6.0)
# (masa output, sumber mula, sumber tamat, gandaan)
GAME_SFX = [
    (0.0, 124.9, 130.9, 0.9),     # Jurus Penamat + Riya ditemui
    (12.8, 62.7, 64.9, 1.0),      # jawapan betul -> serangan
    (38.6, 70.0, 70.9, 1.0),      # Kunci Gangsa pecah
    (41.0, 88.2, 89.6, 1.0),      # Kunci Perak pecah
    (47.4, 113.3, 114.9, 1.0),    # jawapan Emas betul -> serangan
    (56.6, 148.3, 154.3, 0.9),    # evolusi
]


def subtitle_chunks():
    return chunk_vo(VO)
