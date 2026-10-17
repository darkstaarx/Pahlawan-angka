# v3.86.56 — Lapor Bug tab for paid guardians (Pemburu Bug event)

- New parent tab **Lapor Bug** after Tetapan, shown only when `PACommercial.isPaid()`.
- Event card "Pemburu Bug Pahlawan Angka": RM1 for each verified bug, 17 Okt – 17 Nov 2026 (`EVENT` in `js/bug-report-v1.js`). After the end date the card says the event has ended and reports are still welcome.
- Rules shown:
  - paid users only
  - new, reproducible bugs; the first reporter counts
  - reviewed by the team, who reply by e-mail
- Form fields:
  - tajuk
  - bahagian (Kembara/Segel, Kemahiran Fokus, soalan, laporan, pembayaran, paparan, lain-lain)
  - apa yang berlaku
  - langkah (optional)
- Auto-added to the report: reference (PA-YYYYMMDD-XXXX), account e-mail, child's Darjah, app version, device/browser and time.
- **No server storage.** "Buka e-mel untuk hantar" opens the guardian's own mail app (mailto) to pahlawanangka.app@gmail.com with subject `[Bug PA] <tajuk> · <rujukan>`. Screenshots are attached there. "Salin laporan" copies the same text when no mail app is set up.
- Style: PA dark navy cards with the gold badge/price and gold primary button (same family as the pricing panel).
- `tab()` in `js/parent.js` and the tab bridge in `js/parent-live-runtime-v1.js` accept 'bug'.

## Verification
- Playwright 375×812 and 1280×900:
  - the paid profile shows the tab and the panel opens
  - empty submit asks for a title
  - a filled submit opens the e-mail with a reference
  - switching back to Tetapan works
  - no horizontal scroll, no page errors
- Free profile: no Lapor Bug tab.
