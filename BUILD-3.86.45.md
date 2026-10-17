# v3.86.45 — Checkout: allow both sites, clearer network error

- "Failed to send a request to the Edge Function" is the browser failing to reach `create-checkout` at all (CORS or function not deployed). A server-side refusal (e.g. payments not enabled) would show its own Malay message instead.
- `supabase/functions/_shared/http.ts`: CORS now accepts both https://pahlawanangka.netlify.app and https://darkstaarx.github.io, not only the single `APP_URL` origin. **Takes effect only after the edge functions are redeployed** (`supabase functions deploy create-checkout`, and `affiliate-application` which shares the helper).
- `js/payment-affiliate-v1.js`: that error now reads "Tidak dapat menghubungi pelayan pembayaran. Semak sambungan internet dan cuba semula."
