const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const CANONICAL_APP_URL = 'https://pahlawanangka.netlify.app/';
// Affiliate group for promotion material (owner's manual welcome e-mail, 2026-10-20).
export const AFFILIATE_TELEGRAM_URL = 'https://t.me/+BnCBaArZh301ODZl';

/* Welcome e-mail for a new affiliate. Layout and tone follow the owner's hand-written welcome e-mail
   (to an early affiliate, 2026-10-20): dark header, gold title, link box, commission table, Telegram,
   "kenal produk dulu", demo button. The product section leads with what sets PA apart from other
   practice apps: it understands where the child is stuck and acts on it. */
export function affiliateWelcomeEmail(input: { affiliateCode: string; commissionSnapshot: Record<string, unknown>; appUrl: string; name?: string | null; email?: string | null }) {
  const url = new URL(CANONICAL_APP_URL);
  const codeRaw = input.affiliateCode;
  const code = escapeHtml(codeRaw);
  const appUrl = escapeHtml(url.href);
  const affiliatePage = new URL('affiliate.html', url.href).href;
  const snapshot = input.commissionSnapshot;
  const premiumPlan = (snapshot.premium ?? {}) as Record<string, unknown>;
  const familyPlan = (snapshot.family_plus ?? {}) as Record<string, unknown>;
  const planValue = (plan: Record<string, unknown>, key: string, fallbackKey: string) => Number(plan[key] ?? snapshot[fallbackKey] ?? 0);
  const premiumPrice = planValue(premiumPlan, 'price_cents', 'premium_price_cents') / 100;
  const premium = planValue(premiumPlan, 'commission_cents', 'premium_commission_cents') / 100;
  const familyPrice = planValue(familyPlan, 'price_cents', 'family_plus_price_cents') / 100;
  const family = planValue(familyPlan, 'commission_cents', 'family_plus_commission_cents') / 100;
  const rm = (v: number) => 'RM' + (Number.isInteger(v) ? String(v) : v.toFixed(2));
  const lo = Math.min(premium, family), hi = Math.max(premium, family);
  const range = lo === hi ? rm(hi) : `${rm(lo)}–${rm(hi)}`;
  const name = String(input.name ?? '').trim().slice(0, 60);
  const hello = name ? `Assalamualaikum dan hai ${name}!` : 'Assalamualaikum dan hai!';
  const email = String(input.email ?? '').trim();
  const referralUrl = new URL(url.href); referralUrl.searchParams.set('ref', codeRaw);
  const ref = escapeHtml(referralUrl.href);
  const tg = escapeHtml(AFFILIATE_TELEGRAM_URL);
  const subject = `Link affiliate anda dah aktif! Komisen ${range} 🎉`;
  const preheader = `Link ${codeRaw} sudah aktif. Semak komisen, masuk Telegram untuk bahan promosi dan cuba demo PA dahulu.`;

  const moat: [string, string, string][] = [
    ['🧠', 'Faham di mana anak tersangkut', 'PA perhati cara anak menjawab dan kesan corak kesilapannya. Contohnya sifir 7 yang masih lambat, salah bila tolak perlu pinjam, atau keliru bila soalan dalam bentuk ayat.'],
    ['🎯', 'Terus bantu bahagian itu', 'Latihan seterusnya, mini game Kemahiran Fokus dan "Jom tengok cara" (langkah demi langkah) difokuskan pada kelemahan itu, bukan latihan yang sama berulang-ulang.'],
    ['📊', 'Ibu bapa tahu sebabnya', 'Bukan sekadar "betul 72%". Ibu bapa nampak topik mana yang lemah dan kenapa, dalam bahasa yang mudah.'],
    ['🎮', 'Anak memang nak main', 'Setiap jawapan betul, Wira bertarung dan selamatkan pet. Ikut KSSR Darjah 1–6.'],
  ];

  const text = [
    preheader, '',
    hello, '',
    'Selamat datang sebagai Rakan Affiliate Pahlawan Angka. Link anda dah sedia. Tak perlu membeli pakej untuk mula berkongsi.', '',
    `KOD AFFILIATE ANDA: ${codeRaw}`,
    `Link: ${referralUrl.href}`, '',
    'Berapa komisen anda?',
    `- Akses Keluarga ${rm(premiumPrice)}: komisen ${rm(premium)}`,
    `- Family Plus ${rm(familyPrice)}: komisen ${rm(family)}`,
    'Komisen dikira selepas bayaran pelanggan melalui link anda disahkan, dan dibayar secara manual selepas semakan. Pembelian sendiri tidak menerima komisen.', '',
    `Bahan promosi ada di Telegram: ${AFFILIATE_TELEGRAM_URL}`,
    `Ayat promosi sedia guna dan butang WhatsApp: ${affiliatePage}`, '',
    'Apa yang buat PA lain daripada app latihan biasa:',
    ...moat.map(([, t, d]) => `- ${t}: ${d}`), '',
    `Cuba demo percuma dahulu: ${url.href}${email ? ` (log masuk dengan ${email})` : ''}`, '',
    'Bila ada jualan pertama, kami akan hubungi anda untuk butiran bank.',
    'Ada soalan? Balas sahaja email ini.', '',
    'Jumpa dalam pengembaraan,', 'Pasukan Pahlawan Angka',
  ].join('\n');

  const logoUrl = escapeHtml(new URL('assets/branding/pahlawan-angka-full-logo-v1.png', url.href).href);
  const h2 = 'font-size:22px;line-height:1.4;margin:28px 0 14px;color:#173451';
  const btn = (href: string, label: string, bg: string, fg: string) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${bg}" style="background:${bg};border-radius:7px"><a href="${href}" style="display:inline-block;padding:14px 22px;color:${fg};font-weight:bold;text-decoration:none" target="_blank">${label}</a></td></tr></table>`;
  const row = (plan: string, price: number, comm: number, bg: string) => `<tr bgcolor="${bg}" style="background:${bg}"><td style="padding:12px;border-bottom:1px solid #eadfc7">${plan}</td><td style="padding:12px;border-bottom:1px solid #eadfc7;white-space:nowrap">${rm(price)}</td><td style="padding:12px;border-bottom:1px solid #eadfc7;color:#173451;font-size:20px;font-weight:bold;white-space:nowrap">${rm(comm)}</td></tr>`;

  const html = `<!doctype html><html lang="ms"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#0b1728;font-family:Arial,Helvetica,sans-serif;color:#18243a">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b1728" style="width:100%;background:#0b1728"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#fffaf0">
<tr><td align="center" bgcolor="#10243b" style="background:#10243b;padding:28px 24px">
<img src="${logoUrl}" width="220" alt="Pahlawan Angka" style="display:block;width:220px;max-width:100%;height:auto;margin:0 auto">
<h1 style="color:#ffda58;font-size:28px;line-height:1.3;margin:24px 0 12px">Link affiliate anda dah aktif! 🎉</h1>
<p style="color:#e8edf3;font-size:15px;line-height:1.7;margin:0">Jom kongsi pengembaraan PA.<br>Komisen <strong style="color:#ffda58">${range}</strong> bagi setiap jualan yang layak.</p>
</td></tr>
<tr><td style="padding:28px 24px 12px;font-size:16px;line-height:1.8">
<p style="margin:0 0 18px">${escapeHtml(hello)}</p>
<p style="margin:0 0 18px"><strong>Selamat datang sebagai Rakan Affiliate Pahlawan Angka. 💛</strong><br>Link anda dah sedia. Tak perlu membeli pakej untuk mula berkongsi.</p>
<h2 style="${h2}">Ini link affiliate anda</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border:1px solid #ead9a6"><tr><td style="padding:20px">
<p style="font-size:12px;letter-spacing:1.5px;font-weight:bold;color:#7f6420;margin:0 0 7px">KOD AFFILIATE ANDA</p>
<p style="font-size:26px;letter-spacing:1.5px;font-weight:bold;color:#173451;margin:0 0 12px">${code}</p>
<p style="font-size:14px;line-height:1.7;word-break:break-word;margin:0"><a href="${ref}" style="color:#1d567b" target="_blank">${ref}</a></p>
</td></tr></table>
<p style="font-size:14px;line-height:1.8;margin:12px 0 14px">Kongsi link ini supaya jualan yang layak direkodkan untuk komisen anda. Ayat promosi sedia guna dan butang WhatsApp ada di halaman affiliate anda.</p>
${btn(escapeHtml(affiliatePage), 'Buka halaman affiliate →', '#ffda58', '#10243b')}
<h2 style="${h2}">Berapa komisen anda?</h2>
<table width="100%" cellpadding="12" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.6">
<thead><tr bgcolor="#173451" style="background:#173451;color:#fff"><th scope="col" style="text-align:left;padding:12px">Pakej</th><th scope="col" style="text-align:left;padding:12px">Harga promo</th><th scope="col" style="text-align:left;padding:12px">Komisen</th></tr></thead>
<tbody>${row('Akses Keluarga', premiumPrice, premium, '#ffffff')}${row('Family Plus', familyPrice, family, '#fff0bf')}</tbody></table>
<p style="font-size:13px;line-height:1.8;color:#586674;margin:13px 0 0">Komisen dikira selepas bayaran pelanggan melalui link anda disahkan, dan dibayar secara manual selepas semakan. Pembelian sendiri tidak menerima komisen. Bila anda ada jualan pertama, kami akan hubungi anda untuk butiran bank.</p>
<h2 style="${h2}">Bahan promosi ada di Telegram 📣</h2>
<p style="margin:0 0 18px">Masuk kumpulan Telegram untuk akses material promosi Pahlawan Angka. Gunakan bahan tersebut bersama <strong>link affiliate anda sendiri</strong> apabila berkongsi.</p>
${btn(tg, 'Masuk Telegram Affiliate →', '#ffda58', '#10243b')}
<p style="font-size:12px;line-height:1.7;margin:12px 0 0;word-break:break-word"><a href="${tg}" style="color:#1d567b" target="_blank">${tg}</a></p>
<h2 style="${h2}">Kenapa ibu bapa pilih PA, bukan app latihan biasa</h2>
<p style="margin:0 0 16px">App latihan Matematik ada banyak, dan kebanyakannya beri soalan yang sama berulang-ulang. Pahlawan Angka berfungsi macam <strong>cikgu tuisyen peribadi</strong> untuk anak <strong>Darjah 1–6</strong>:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:1.8">
${moat.map(([i, t, d]) => `<tr><td width="34" valign="top" style="padding:0 6px 13px 0">${i}</td><td style="padding:0 0 13px"><strong>${escapeHtml(t)}</strong><br>${escapeHtml(d)}</td></tr>`).join('\n')}
</table>
<p style="margin:0 0 18px">Itulah cerita yang paling kuat untuk dikongsi. Cuba demo percuma dahulu dan rasai sendiri. Di laman utama, pilih <strong>“Cuba Demo”</strong>${email ? ` dan log masuk menggunakan <strong>${escapeHtml(email)}</strong>` : ''}.</p>
${btn(appUrl, 'Cuba Demo Percuma →', '#173451', '#ffffff')}
<p style="font-size:13px;line-height:1.8;color:#586674;margin:13px 0 20px">Untuk melihat link dan rekod komisen: halaman affiliate di atas, atau dalam app <strong>Tetapan Ibu Bapa → Rakan Affiliate</strong>.</p>
</td></tr>
<tr><td style="padding:0 24px 28px;font-size:16px;line-height:1.8">
<p style="margin:0 0 16px">Ada soalan tentang produk, komisen atau cara berkongsi? Balas sahaja email ini. Kami sedia membantu.</p>
<p style="margin:0">Jumpa dalam pengembaraan,<br><strong>Pasukan Pahlawan Angka</strong></p>
</td></tr>
<tr><td bgcolor="#10243b" style="background:#10243b;padding:18px 24px;text-align:center;color:#d8e0e9;font-size:12px;line-height:1.8">Belajar. Bertarung. Jadi Pahlawan.<br><a href="${appUrl}" style="color:#ffda58;text-decoration:none" target="_blank">pahlawanangka.netlify.app</a><br>Untuk bantuan, balas email ini.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}
