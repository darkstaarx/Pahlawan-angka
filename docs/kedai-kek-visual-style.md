# Kedai Kek — peraturan seni visual (dikunci)

Tarikh: 1 November 2026. Gaya rasmi Pahlawan Angka: **2.5D cartoon game art** dengan outline, bayang lembut, kedalaman objek, highlight hangat dan palet watak yang sedia ada. **Jangan campur realistic 3D render, flat worksheet, clip-art atau gaya UI lain** dalam satu skrin.

## Perspektif: fungsi berbeza, gaya sama

- **Prop kedai (kek atas kaunter, rak, ikon, dekorasi)**: pandangan sisi / 3/4, kekal sebagai kek comel yang berisi, bukan peta pecahan pandangan atas. `cakeIcon(fl)` dipakai oleh `drawShelf` dan `stand`. Jangan ubah perspektif prop sewaktu membetulkan soalan.
- **Model jawapan bulat (`roundSVG`)**: pandangan atas, jejari sama, semua sektor sama luas. Sesuai untuk 1/2, 1/4 dan pecahan biasa.
- **Model jawapan dulang (`barSVG`, `barsSVG`)**: pandangan atas kek segi empat, **n bahagian sama lebar**. Sesuai bagi 1/3, persepuluh dan pecahan bercampur. Model mesti nampak seperti kek berkrim atas pinggan, bukan bar atau kotak putih kosong.
- **Botol jus**: kekal pandangan sisi kerana aras cecair ialah objektif soalan.
- **Lapisan sebenar**: jika murid perlu mengira lapisan kek menegak, gunakan side view khusus dan ayat soalan yang membezakannya daripada potongan di permukaan.

## Art direction yang digunakan oleh kod

`cakeLook(fl)` menetapkan keluarga accent, light, dark; `cakeFlavourMark(fl,x,y,z)` memberi topping berbentuk berbeza; `cakeCrumb(fl,x,y,z)` menambah tekstur bakar yang ringan. **Ketiga-tiga renderer** (bulat, dulang, prop) menggunakan helper yang sama dan mengekalkan depth sekitar 4–6 unit serta pinggan/bayang stylized, tanpa perspective kamera 3D.

| Perisa | Kek asas | Dekorasi ciri |
|---|---|---|
| Coklat | Perang | Swirl/cocoa coklat |
| Pandan | Hijau | Daun pandan |
| Vanila | Kuning krim | Sugar pearls |
| Keladi | Ungu lembut | Kelopak/krim ungu |
| Oren | Oren | Lengkung kulit oren |

Perisa berbeza pada warna **dan** dekorasi, bukan warna sahaja. Bahagian dipilih masih menerima highlight krim yang jelas; dekorasi tidak sepatutnya mengelirukan kiraan pecahan. Semua label dan teks permainan dalam Bahasa Malaysia.

## Mathematics / interaction invariants

1. `data-i` tepat **satu** bagi setiap kepingan kek yang boleh disentuh, daripada indeks 0 hingga n−1.
2. Sektor bulat mestilah sama sudut; segi empat mestilah sama lebar. Bayang, pinggan, frosting swirl, buah dan dekorasi **bukan** kepingan tambahan.
3. Dekorasi di atas potongan mesti `pointer-events="none"`, supaya tap masih sampai kepada `data-i`.
4. `st.sh`, `st.sh2`, `st.eat` dan `shadeSet` kekal tanpa pertukaran semantik. Jangan ubah soalan, jawapan, bintang, petunjuk, telemetri atau sistem adaptif semata-mata untuk efek visual.
5. `barsSVG` pecahan bercampur mesti menunjukkan keseluruhan dan baki yang betul.
6. Karya asal Wira/Kumbis, rak bakeri, background serta komponen UI tidak dibentuk semula tanpa permintaan pemilik.
7. Uji pecahan 2, 3, 4, 5, 8, 10 bagi kelima-lima perisa; semak saiz mudah alih dan jelas selepas dikecilkan.

## Status

Kod dan ujian regression ada di `kedai-kek.html` dan `audit/kedai-kek-topview.test.js`. Perubahan GitHub memerlukan deploy sebelum muncul di Netlify; QA visual manual pada telefon masih diperlukan.
