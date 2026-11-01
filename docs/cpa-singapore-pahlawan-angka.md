# CPA Singapura → Pahlawan Angka (cadangan pelaksanaan)

Disemak: 1 November 2026. Status: **penyelidikan dan reka bentuk**, bukan ciri yang telah dibangunkan. Sasaran kurikulum kekal **KSSR Malaysia**; Singapura menjadi rujukan pendekatan pedagogi, bukan pengganti DSKP.

## Apa yang disokong sumber

- Singapore MOE, *Using Concrete-Pictorial-Abstract (CPA) Approach* (30 Apr 2025): pengalaman objek → gambar/model → simbol. https://nel.moe.edu.sg/la/numeracy/how-can-you-do-it-/using-concrete-pictorial-abstract--cpa--approach/
- Shuqun Primary School, *P1 Mathematics Handbook*, MA-9: objek manipulatif, pictorial dan bar model kepada persamaan. https://www.shuqunpri.moe.edu.sg/files/P1_Mathematics_Handbook.pdf
- Si Ling Primary School, *Curriculum and Approach*: CPA digunakan secara berperingkat bagi penguasaan konsep. https://www.silingpri.moe.edu.sg/departments/mathematics/curriculum-and-approach/
- North Spring Primary School, *Math Resources for Parents*: model **part-whole, comparison, unitary**, dan strategi working backward / looking for a pattern. https://sites.google.com/moe.edu.sg/nspsupperprimathworkshop/home
- Ng, Swee Fong (2022), *The model method: Crown jewel in Singapore mathematics*: bar model membantu struktur part–part–whole untuk penyelesaian masalah aritmetik dan algebra. https://journals.sagepub.com/doi/10.1177/27527263221107526
- Singapore Math publisher, *School FAQ*: tidak semua soalan memerlukan ketiga-tiga peringkat; tahap CPA perlu fleksibel mengikut konsep/kemajuan. https://www.singaporemath.com/pages/school-faq

## Garis panduan PA

**C (buat)**: murid mengalih/membahagi/melorek objek digital yang benar-benar boleh disentuh. Ini simulasi manipulatif, *bukan objek fizikal*.

**P (lihat)**: selepas tindakan C, paparkan model yang setara (bar, number bond, array, garis nombor, rajah geometri). Kuantiti, skala dan unit mesti konsisten.

**A (tulis)**: sambungkan tepat kepada persamaan, unit dan jawapan sebenar. Jangan terus beri jawapan ketika petunjuk pertama.

Sebagai scaffolding, jika pengguna berkali-kali salah atau dua petunjuk habis, mulakan “Jom tengok cara” pada langkah terawal yang perlu; kemudian kembali kepada soalan *serupa dengan nombor lain*, bukan ulang salin jawapan.

Setiap soalan perlu mempunyai metadata seperti `concept`, `visualModel`, `concreteAction`, `equation`, `expectedForm`, `correctValue`, `facets` dan `prerequisites`. Jangan tentukan bantuan berdasarkan keyword raw dalam teks sahaja. Kekalkan telemetry percubaan pertama dan bilangan petunjuk untuk Diagnostic Brain.

## Library CPA yang patut ada (ikut topik)

| Topik KSSR / umur sasaran | Concrete, tindakan digital | Pictorial / model | Abstract + diagnostik |
|---|---|---|---|
| D1–2 nilai tempat, +/− | Seret 10 unit menjadi satu batang puluh; pecah puluh semasa tolak | Base-ten dan **number bonds** | 42 = 4 puluh + 2 sa; rekod salah pinjam/regroup |
| D1–3 sifir dan bahagi | Susun 24 benda jadi 4 kumpulan sama | **Array** 4×6; model kumpulan | 4×6=24, 24÷4=6; kenal pasti salah sifir tertentu |
| D1–4 masalah berayat | Alih objek dari kumpulan A kepada B | **Part–whole / comparison bar models** | 18−7=11; kesan operasi salah vs bacaan masalah |
| D1–6 pecahan, persepuluh | Kek potongan dari **atas**, lorek bahagian; lipat/jajarkan jalur | Diska pecahan, **fraction strips** dan grid 10×10 | 3/10=0.3; satu keseluruhan mesti sama saiz |
| D2–5 wang | Pilih duit dan bayar harga, pulangkan baki | Kombinasi syiling/wang kertas → bar jumlah/baki | RM10−RM6.80=RM3.20; periksa unit RM/sen |
| D1–4 masa | Gerakkan jarum jam dan tempah slot masa | Jam analog → **timeline** | 2:35 + 45 min=3:20; bezakan masa mula, tamat dan tempoh |
| D1–5 panjang/jisim/isipadu | Letak objek pada pembaris/penimbang; tuang aras silinder | Garis skala, unit berlabel, **double number line** | 1 m=100 cm, 1 L=1000 mL; kesan faktor 10/100/1000 |
| D2–6 luas & perimeter | Tutup lantai dengan petak sama saiz, jejaki keliling | Grid luas / outline perimeter | Luas = p×l; perimeter = 2(p+l); bezakan dua konsep |
| D2–6 bentuk dan geometri | Susun bentuk, bina pola, pusing/pantulkan | Geoboard / grid koordinat | Ciri bucu/sisi/sudut, koordinat; pemetaan tepat |
| D3–6 nisbah/peratus | Bahagi set kuantiti dalam nisbah sama | **Unitary bar models**, double number line | 3:5 dan 25%=1/4; jangan guna graf tak berskala |
| D1–6 data/statistik | Susun objek mengikut kategori | Piktograf → bar chart dengan paksi & skala | Kira jumlah, beza, purata; kesan salah baca paksi |

## Susunan keutamaan yang disyorkan (cadangan, bukan kerja siap)

**P0 — Kek dan pecahan.** Kek bulat sudah top-down. Tukar *kek lapis/bar* kepada model top-down dengan potongan sama besar. Jangan tukar botol jus kepada top-down: ketinggian cecair memerlukan pandangan sisi. Kekalkan semua state pada `data-i` untuk petikan lorek dan semak jawapan. *Status kod: dilaksanakan 1 Nov 2026 di `kedai-kek.html`; memerlukan deployment & QA visual.*

**P1 — Nilai tempat, sifir, masalah berayat.** Tiga intervention yang memberi banyak peluang untuk mengenal pasti *kenapa* jawapan salah: (a) cuboid unit/puluh, (b) array sifir, (c) bar model part-whole / comparison yang dipilih berdasarkan skema masalah.

**P2 — Masa, wang, ukuran.** Tindakan manipulatif berskala; pastikan masa / wang / unit terpapar tepat dan bukan hiasan. Boleh diintegrasi dengan kemahiran fokus yang sedia ada selepas audit setiap enjin.

**P3 — Pecahan setara, nisbah, peratus, geometri, data.** Jalur pecahan dan bar unitary sebelum persamaan; grid interaktif untuk luas dan data.

## Acceptance criteria sebelum membina modul CPA lain

1. Objek sama dengan masalah sebenar: 3/10 dilorek ialah **3 daripada 10 saiz sama besar**, tidak kira skrin.
2. Wira tidak membocorkan jawapan pada petunjuk pertama. Setelah bimbingan lengkap, berikan nombor baharu untuk cuba sendiri.
3. Tiada modul CPA yang mencipta *engine* soalan palsu di luar runtime production; gunakan `q` dan validation sedia ada.
4. Jawapan setara dibenarkan hanya jika kehendak soalan mengizinkan; contoh tugasan penukaran memerlukan representasi yang diminta.
5. Pilihan *C/P/A* menjadi evidence/sokongan pada Diagnostic Brain, tetapi bantuan tidak dikira sebagai mastery bebas.
6. Ujian berasingan untuk saiz 320, 360, 390 px; sentuhan, screen reader, low motion, bukan hiasan sahaja.
7. Uji murid: ketepatan cuba pertama, ketepatan soalan susulan selepas bimbingan, dan masa sampai ke jawapan; tidak mendakwa keberkesanan semata-mata kerana gameplay lebih cantik.

**Peringatan:** CPA Singapura ialah pendekatan memahami konsep. Tidak wajar menggantikan KSSR dengan turutan kandungan Singapura atau memaksa C→P→A tiga kali untuk setiap soalan yang murid sudah kuasai.
