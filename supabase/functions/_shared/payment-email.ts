const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function paymentEmail(input: { plan: 'premium' | 'family_plus'; amountCents: number; orderId: string; appUrl: string }) {
  const url = new URL(input.appUrl);
  if (url.protocol !== 'https:') throw new Error('HTTPS app URL required');
  const appUrl = escapeHtml(url.href);
  const logoUrl = escapeHtml(new URL('assets/branding/pahlawan-angka-full-logo-v1.png', url.href.endsWith('/') ? url.href : url.href + '/').href);
  const plus = input.plan === 'family_plus';
  const plan = plus ? 'Family Plus' : 'Akses Keluarga';
  const benefits = plus
    ? ['Sehingga lima profil anak', 'Misi dan worksheet tanpa had', 'Latihan Fokus Plus dan laporan PDF', 'Ciri baharu yang dilancarkan dalam dua bulan selepas pembelian']
    : ['Sehingga dua profil anak', 'Misi tanpa had untuk Darjah 1–6', 'Satu muat turun worksheet sehari bagi setiap akaun keluarga'];
  const amount = 'RM' + (input.amountCents / 100).toFixed(2);
  const subject = `${plan} Pahlawan Angka anda sudah aktif!`;
  const text = `Terima kasih kerana menyokong Pahlawan Angka!\n\nBayaran ${amount} telah disahkan dan pakej ${plan} anda sudah aktif. Sekali bayar, akses kekal.\n\n${benefits.map(x => '- ' + x).join('\n')}\n\nMasuk Pahlawan Angka: ${url.href}\nGunakan akaun Google yang sama semasa pembelian.\n\nRujukan pesanan: ${input.orderId}\nPerlukan bantuan? Balas email ini.\n\nPasukan Pahlawan Angka`;
  const html = `<!doctype html><html lang="ms"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#edf1f7;font-family:Arial,Helvetica,sans-serif;color:#18243a;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Bayaran ${amount} disahkan. Pakej ${plan} anda sudah aktif.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf1f7;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr><td align="center" style="background:#0c1c33;padding:24px 20px;border-bottom:4px solid #efbd45;"><img src="${logoUrl}" width="220" alt="Pahlawan Angka" style="display:block;width:220px;max-width:100%;height:auto;border:0;"></td></tr>
<tr><td style="padding:30px 26px 20px;"><p style="margin:0 0 10px;font-size:12px;font-weight:bold;letter-spacing:1px;color:#947020;">PAKEJ ANDA SUDAH AKTIF</p>
<h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:#0c1c33;">Terima kasih, keluarga wira!</h1>
<p style="margin:0 0 22px;font-size:15px;line-height:1.7;">Bayaran anda telah disahkan. Kini anak anda boleh meneruskan kembara matematik bersama <strong>Pahlawan Angka</strong>.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8fc;border:1px solid #e1e7ef;border-radius:10px;"><tr><td style="padding:18px;"><p style="margin:0 0 7px;font-size:19px;font-weight:bold;color:#0c1c33;">${plan}</p><p style="margin:0;font-size:14px;color:#53627a;">${amount} &nbsp;·&nbsp; Sekali bayar, akses kekal</p></td></tr></table>
<ul style="margin:20px 0 24px;padding-left:20px;font-size:14px;line-height:1.9;">${benefits.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#efbd45" style="border-radius:9px;"><a href="${appUrl}" style="display:inline-block;padding:14px 22px;border:1px solid #efbd45;border-radius:9px;font-size:15px;font-weight:bold;color:#0c1c33;text-decoration:none;">Masuk Pahlawan Angka →</a></td></tr></table>
<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#53627a;">Gunakan akaun Google yang sama semasa pembelian.</p>
</td></tr><tr><td style="padding:0 26px 26px;"><hr style="border:0;border-top:1px solid #e1e7ef;margin:8px 0 18px;"><p style="margin:0 0 8px;font-size:13px;line-height:1.6;">Perlukan bantuan? Balas email ini. Kami sedia membantu.</p><p style="margin:0;font-size:11px;line-height:1.6;color:#77839a;word-break:break-all;">Rujukan pesanan: ${escapeHtml(input.orderId)}</p></td></tr>
</table><p style="margin:18px 0 0;font-size:12px;color:#68758b;">Pahlawan Angka · Belajar. Bertarung. Jadi Pahlawan.</p>
</td></tr></table></body></html>`;
  return { subject, text, html };
}
