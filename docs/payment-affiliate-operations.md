# Pembayaran dan affiliate Pahlawan Angka

## Kadar awal

| Pelan | Harga | Komisen |
|---|---:|---:|
| premium / Akses Keluarga | RM19 | RM9 |
| family_plus / Family Plus | RM29 | RM15 |

Harga dan komisen disalin ke setiap order. Untuk tukar kadar, nyahaktif versi katalog lama dan tambah versi baharu dalam satu transaksi; jangan ubah order atau versi katalog lama. Link affiliate kekal.

## Operasi

Penjaga memohon affiliate melalui Tetapan Ibu Bapa. Admin menyemak permohonan, meluluskan kod, dan melihat bank apabila diperlukan. Dashboard affiliate memaparkan komisen sendiri; dashboard admin memaparkan komisen dan rekod payout. Payout dibuat oleh admin melalui bank dahulu, kemudian simpan rujukan pada komisen. Butang rekod payout tidak memindahkan wang.

Referral terakhir disimpan sehingga 30 hari dalam pelayar; kod mesti milik affiliate diluluskan dan pembelian sendiri tidak mendapat komisen. Tempoh pelayar ialah aturan atribusi aplikasi, bukan cookie merentas peranti. Order menyimpan affiliate ketika dicipta.

## Konfigurasi

Secrets backend: TOYYIBPAY_SECRET_KEY, CATEGORY_CODE, APP_URL, TOYYIBPAY_BASE_URL, PAYMENTS_ENABLED. Key tidak boleh masuk Git atau kod web. Callback di SUPABASE_URL/functions/v1/toyyibpay-callback; return di APP_URL dengan payment_order. Callback menggunakan pengesahan hash provider, kemudian semakan transaksi provider sebelum mengaktifkan pelan. Endpoint checkout dan permohonan menggunakan pengesahan pengguna.

PAYMENTS_ENABLED kekal false sehingga ujian pembayaran disahkan. Sandbox memerlukan akaun/key/kategori sandbox sendiri; key live tidak boleh digunakan di sandbox. Tiada dana dipindahkan atau bayaran sebenar dibuat oleh ujian database.

Untuk ujian bil live sebelum pelancaran, tetapkan PAYMENTS_ADMIN_TEST_MODE=true sementara PAYMENTS_ENABLED=false. Hanya pengguna yang mempunyai role admin dalam app_user_roles boleh menjana bil; metadata pengguna tidak digunakan. Bil ujian ini masih mengenakan harga sebenar jika dibayar. Selepas ujian pembayaran dan callback disahkan, tetapkan PAYMENTS_ENABLED=true dan PAYMENTS_ADMIN_TEST_MODE=false.

## Ujian penerimaan

Akaun dummy boleh diuji tanpa diberi role admin: isi PAYMENTS_TEST_USER_IDS dengan UUID pengguna terpilih (dipisahkan koma), sementara PAYMENTS_ADMIN_TEST_MODE=true dan PAYMENTS_ENABLED=false. Backend menyemak UUID daripada getUser(), bukan email atau metadata yang dihantar browser. Kos bil kekal sebenar. Kosongkan senarai selepas ujian selesai. Ujian tanpa referral mesti menggunakan pelayar yang tiada referral tersimpan; pastikan affiliate_id order kosong sebelum membayar. Ujian referral menggunakan pembeli yang berbeza daripada pemilik affiliate.

- Permohonan affiliate menyimpan bank peribadi; guardian lain tidak boleh baca atau approve.
- Bayaran RM19/RM29 menghasilkan komisen RM9/RM15 hanya jika referral sah.
- Callback berulang tidak menambah komisen atau reset tarikh pembelian.
- Return URL atau status browser tidak boleh aktifkan pelan.
- Bayaran selepas Family Plus tidak menurunkan akses.
- Harga berubah ketika checkout meminta pengguna sahkan harga baharu.
- Admin rekod payout selepas pemindahan sebenar; komisen void tidak dibayar.

Refund dan pembatalan komisen perlu disemak admin sebelum payout; tiada refund automatik dijanjikan.
