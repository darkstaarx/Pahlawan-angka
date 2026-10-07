# Kad evolusi Tahap 5

Status: pelan animasi sahaja. Evolusi Bara sudah aktif; kad animasi belum dilaksanakan.

## Aliran murid

Selepas Gembok selesai dan ganjaran disahkan, kad Teman aktif muncul dengan bentuk asal. Skrin di belakang dimalapkan. Teks pendek: “Aurora mencapai Tahap 5!” (gunakan nama pilihan murid untuk semua pet).

1. 0–0.6 saat: kad asal masuk dengan gerakan naik dan skala lembut, bersama nama dan Tahap 5.
2. 0.6–1.3 saat: bingkai emas menyala, corak Bara naik sepanjang tepi kad, bunyi cas lembut. Pet kekal jelas.
3. 1.3–2.0 saat: denyutan cahaya hangat dan putaran separuh kad; gambar bertukar kepada design Bara yang diluluskan pada titik tengah.
4. 2.0–3.0 saat: kad Bara kembali menghadap hadapan; “Evolusi Bara dibuka!” dan “Lihat dalam Khazanah”. Butang “Teruskan” aktif serta-merta apabila design Bara sudah didedahkan.

Tiada tahan last frame secara paksa. Selepas reveal, kad kekal sehingga murid tekan “Teruskan” atau “Lihat Khazanah”. Butang belakang tidak kehilangan ganjaran. Pada reduced motion, gantikan putaran dengan crossfade pendek; tiada kelipan strob.

## Peraturan

- Trigger hanya pet aktif yang betul-betul menyeberang Tahap 4 → 5 selepas completion yang sah; bukan tahap pemain, bukan setiap login atau reload.
- Simpan event evolusi mengikut pet dan tahap supaya tidak dipaparkan dua kali ketika replay atau request berulang. Simpan status pending sebelum membuka kad; selepas acknowledgement, tandakan dilihat. Jika aplikasi ditutup, tunjuk semula kad pending selepas pemulihan sesi.
- Reward dan XP mesti selesai dahulu. Animasi tidak memberi XP tambahan dan tidak mengubah jawapan, mastery atau rescue.
- Gunakan nama semasa murid dan asset Asas/Bara sebenar daripada katalog. Preload kedua-dua gambar; jika gagal, teks ganjaran tetap dipaparkan tanpa menahan navigasi.
- Kad mesra telefon/tablet, tidak melebihi tinggi viewport, safe area dipatuhi. Fokus masuk ke dialog dan kembali ke keputusan selepas ditutup. Sokong Escape, pembaca skrin dan bunyi mute.
- DEV kelak boleh mempunyai “Uji kad evolusi” untuk keenam-enam pet, tanpa menulis progress. Khazanah penuh yang ditambah sekarang menyediakan perbandingan Asas/Bara, belum memainkan kad ini.

## Ujian sebelum pelaksanaan live

Completion 380 → 400 XP memaparkan satu kad pet aktif; 400 → 420 tidak memaparkannya lagi. Duplicate completion, demo dan misi ditinggalkan tidak mencipta event. Periksa reload sebelum/selepas acknowledgement, asset gagal, nama custom, telefon/tablet, reduced motion dan mute.
