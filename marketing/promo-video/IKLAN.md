# Format iklan Meta (Facebook / Instagram)

Video asal ialah 9:16 (1080×1920) untuk TikTok, Reels dan Shorts organik. Untuk iklan Meta, enjin boleh menghasilkan dua format lain daripada timeline yang **sama**, tanpa menulis semula babak:

| `PROMO_FORMAT` | Saiz | Penempatan | Apa yang berubah |
| --- | --- | --- | --- |
| `916` (lalai) | 1080×1920 | TikTok / Reels / Shorts organik | Tiada perubahan |
| `ads916` | 1080×1920 | Iklan Reels & Stories | Teks tajuk diturunkan ke y ≈ 280, jadi berada di bawah zon ~14% atas (nama page / "Bersponsor"). Kandungan telefon diskala 0.9 dan diturunkan sedikit. Kad akhir (logo, Wira, butang, tagline) diskala 0.82 dan dinaikkan supaya keluar dari ~20% bawah (kapsyen + butang CTA Meta) |
| `feed45` | **1080×1350** | Feed FB & IG | Disusun semula, bukan sekadar crop. Teks di bahagian atas (y ≈ 50), telefon dan callout diskala 0.72 di bawah teks, hook dan kad akhir diskala 0.74 di tengah, latar dan footage penuh (TV) di-crop ke tengah |

Zon UI Meta berbeza sedikit antara sumber (bawah 20% atau 35%). Sahkan dengan pratonton penempatan dan *Safe Zone* dalam Ads Manager sebelum publish.

## Cara ia berfungsi (`engine.py`)

Kanvas maya kekal 1080×1920, jadi semua timeline tidak berubah. Dalam mod iklan, `Renderer.render_fmt` melakukan langkah berikut:

1. Lapisan dibahagi kepada beberapa kumpulan (`fmt_group`):
   - `full`: latar babak dan `FullClip`;
   - `content`: telefon, `Callout`, kad, PDF, peranti dan label;
   - `hook`: `HookText`;
   - `end`: `EndScene`.
2. Setiap kumpulan dirender atas kanvas **hitam dan putih**. Alfa dan warna premultiplied diekstrak (*difference matting*), jadi bayang, glow dan motion blur kekal betul.
3. Setiap kumpulan diletak semula dengan skala `k` mengikut `LAYOUTS[FMT]`, iaitu titik `(sx, sy)` kanvas maya dipetakan ke `(dx, dy)` kanvas output.
4. Teks ditulis terus pada kanvas output:
   - teks atas pada `text_y`;
   - teks dengan `y` eksplisit mengikut pemetaan `content`.
5. Gradien atas ketika zoom (`fade`), scrim `FullClip` dan latar gelap di belakang teks atas footage TV disesuaikan dengan kedudukan teks baharu.

Masa render lebih kurang 1.5–2× masa format asal, kerana lapisan dirender dua kali.

## Render

```bash
export PROMO_BUILD=/laluan/ke/build
PROMO_FORMAT=ads916 python3 engine.py timeline_main --out out/ads-9x16_promo-main-64s.mp4 --workers 4
PROMO_FORMAT=feed45 python3 engine.py timeline_main --out out/feed-4x5_promo-main-64s.mp4 --workers 4
# sama untuk timeline_platform (promo3-semua-skrin) dan timeline_fokus (promo2-fokus-v3)
PROMO_FORMAT=feed45 python3 engine.py timeline_fokus --frames 7.5,26.8 --out semak   # bingkai semakan
```

## Cadangan ujian iklan

- Uji sekurang-kurangnya dua penempatan, iaitu **Reels/Stories (9:16 Ads)** dan **Feed (4:5)**, dengan kreatif yang sama.
- Ketiga-tiga promo membawa sudut berbeza, jadi boleh diuji sebagai tiga kreatif dalam satu ad set:
  - utama 64 s: hook "anak liat";
  - Fokus 50 s: hook "salah sasaran" dan Jurus Penamat;
  - Semua Skrin 32.5 s: hook TV.
- Kapsyen iklan: letakkan [PAUTAN DEMO] dan CTA "Learn more" / "Ketahui lebih lanjut". Jangan tulis harga atau "percuma".
