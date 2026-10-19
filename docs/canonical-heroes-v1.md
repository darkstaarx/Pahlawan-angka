# Penyatuan watak — 19 Oktober 2026

Permainan kini mempunyai tiga pilihan watak sahaja: Wira, Bunga dan Sidma. Kunci simpanan lama wirachibi dibaca sebagai wira tanpa menghapuskan kemajuan.

Base Wira ialah salinan bait demi bait idle-loop-0-v1.webp yang diberikan pengguna (SHA-256 cc5fd2ce33117240fa9907068398015c890ed45a136ada03e902cc8f7f965e68). Bunga dan Sidma menggunakan dua chibi yang diluluskan. Lokasi dan hash ada dalam assets/heroes/manifest.json.

Artwork watak lama, sheet tebasan lama dan sprite balingan perisai daripada base salah dibuang daripada versi semasa. Sejarah Git menyimpan versi terdahulu. Animasi Wira yang diperiksa dipindahkan ke folder Wira rasmi. Sumber PNG Bunga dan Sidma dikekalkan; WebP mengekalkan RGBA asal.

Pose badan bagi serangan biasa kini menggunakan base rasmi dan pergerakan transform. Ini mengelakkan rupa watak bertukar apabila menyerang. Balingan perisai perlu dilukis semula daripada base rasmi sebelum diaktifkan semula.

Cache, hash aset dan pautan permainan dikemas kini bersama versi 3.86.72. Pratonton: audit/canonical-heroes-preview.html. Ujian utama: node audit/canonical-heroes.test.cjs; node audit/loading-cache-install.test.cjs; node tools/generate-asset-manifest.cjs --check.

Semakan: ujian tiga watak, pemeliharaan data kemajuan, 11 ujian Segel, cache dan manifest lulus. Pelayar Edge diperiksa pada 1000px dan 390px; tiada ralat pratonton. Pemasangan penuh mencatat sifar fail tempatan hilang dan berfungsi selepas muat semula luar talian; tiga base watak dan tujuh FX Bunga berjaya dinyahkod luar talian. Ujian sejarah profile-navigation-race-v3.55.1.js masih meminta nombor keluaran 3.56.2, termasuk pada baseline sebelum perubahan ini.
