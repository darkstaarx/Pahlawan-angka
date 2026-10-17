# v3.86.55 — "Daftar untuk Akses Penuh" uses the app's own pricing component

- The first-time "Daftar untuk Akses Penuh" button now opens the existing pricing overlay (`PACommercial.openPricing`) in entry mode instead of the separate white plans page:
  - dark navy panel with the gold PROMO PELANCARAN banner
  - Family Plus RM29 first, then Akses Keluarga RM19
  - struck-out normal prices (RM49 / RM29) and the "Jimat" labels
  - the same benefits and buttons
- The white plan cards in `#entryPlans` were removed, so there is one pricing component. `#entryPlans` is now a dark backdrop with a "Lihat pakej" button, shown behind the overlay and after closing checkout. It also keeps the payment-check panel.
- Entry mode differences:
  - The Free card is hidden.
  - The steps "Pilih pakej · Log masuk Google · Bayar · Setup profil anak" are shown.
  - The affiliate commission note is hidden.
  - Plan buttons continue the entry flow (`PAEntry.choose`) instead of the signed-in checkout.
  - × returns to the welcome screen.
- Signed-in upgrade/manage pricing is unchanged: Free card shown, no steps.
- Flow kept from 3.86.53/54: choose plan → Google sign-in → ToyyibPay → server-verified payment → child profile setup. The free demo route is unchanged.

## Verification
- Playwright at 1280×900, 375×812 and 320×640:
  - entry mode shows only Family Plus then Akses Keluarga, plus the banner, struck prices, Jimat labels and steps
  - no horizontal scroll, no page errors
  - Pilih Family Plus leads to "Daftar untuk teruskan pembayaran" (Google) with the plan saved
  - × returns to the welcome screen
  - manage mode still shows the Free card
- Signed-in buyer with a saved plan: the ToyyibPay checkout opens for that plan and profiles are not opened.
- `audit/entry-flow.test.js`: 10/10, with a new test for the signed-in checkout.
