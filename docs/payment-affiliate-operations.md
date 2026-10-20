# Pembayaran dan affiliate Pahlawan Angka

## Kadar awal

| Pelan | Harga | Komisen |
|---|---:|---:|
| premium / Akses Keluarga | RM19 | RM9 |
| family_plus / Family Plus | RM29 | RM15 |

Harga dan komisen disalin ke setiap order. Untuk tukar kadar, nyahaktif versi katalog lama dan tambah versi baharu dalam satu transaksi; jangan ubah order atau versi katalog lama. Link affiliate kekal.

## Operasi

Penjaga mendaftar affiliate secara percuma melalui butang Rakan Affiliate dalam Tetapan Ibu Bapa. Akaun dengan email disahkan terus mendapat kod dan pautan daripada pelayan; tiada approval manual diperlukan. Nama dan telefon diperlukan, butiran bank boleh diisi kemudian. Akaun suspended tidak boleh mengaktifkan semula dirinya. Pendaftaran semula mengekalkan kod dan tidak menambah welcome email.

Nama, status dan kod disimpan dalam affiliate_applications; telefon dan bank disimpan dalam affiliate_bank_info private. Dashboard affiliate memaparkan komisen sendiri; dashboard admin memaparkan komisen dan rekod payout. Payout dibuat oleh admin melalui bank dahulu, kemudian simpan rujukan pada komisen. Butang rekod payout tidak memindahkan wang.

Welcome email menggunakan queue private affiliate_welcome_email_outbox dengan satu rekod bagi setiap affiliate. Snapshot harga dan komisen datang daripada katalog aktif ketika pendaftaran. Worker Gmail memproses kedua-dua queue dalam jumlah maksimum sepuluh email setiap panggilan, satu claim sebelum setiap penghantaran; cron berjalan setiap lima minit. Telegram belum dikonfigurasi dan tiada pautan palsu dipaparkan.

Migration affiliate_auto_registration dan ujian SQL rollback telah lulus pada projek live pada 11 Oktober 2026. Ujian Node gabungan 26 lulus, Deno type check lulus, dan semakan Astra tidak menemui isu material. Worker baru dipanggil secara langsung menggunakan Vault dan membalas HTTP 200 tanpa menghantar semula email payment lama. Welcome email pelanggan sebenar masih memerlukan pendaftaran ujian.

Referral terakhir disimpan sehingga 30 hari dalam pelayar; kod mesti milik affiliate diluluskan dan pembelian sendiri tidak mendapat komisen. Tempoh pelayar ialah aturan atribusi aplikasi, bukan cookie merentas peranti. Order menyimpan affiliate ketika dicipta.

## Konfigurasi

Gateway: CHIP Collect (https://docs.chip-in.asia). Secrets backend: CHIP_SECRET_KEY, CHIP_BRAND_ID, APP_URL, PAYMENTS_ENABLED. Key tidak boleh masuk Git atau kod web. Ambil Secret Key dan Brand ID di portal.chip-in.asia → Developers (guna key test mode untuk ujian; key test hanya cipta bayaran ujian). Checkout memanggil POST /purchases/ dan pengguna dibawa ke checkout_url CHIP (gate.chip-in.asia). Callback di SUPABASE_URL/functions/v1/chip-callback (verify_jwt=false): fungsi itu mengesahkan X-Signature (RSA SHA-256, kunci awam dari GET /public_key/), kemudian membaca semula purchase dari CHIP dan hanya mengaktifkan pelan jika status paid, brand, reference dan jumlah sepadan. Return URL tidak mengaktifkan pelan.

Peralihan dari ToyyibPay: jalankan supabase/schema/payment_chip_provider.sql (label provider 'chip' untuk bil CHIP). Kekalkan fungsi toyyibpay-callback dan secrets TOYYIBPAY_* sehingga tiada lagi order ToyyibPay berstatus pending, supaya bil lama yang dibayar lewat masih disahkan.

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
