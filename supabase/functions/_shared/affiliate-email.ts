const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function affiliateWelcomeEmail(input: { affiliateCode: string; commissionSnapshot: Record<string, unknown>; appUrl: string }) {
  const url = new URL(input.appUrl);
  if (url.protocol !== 'https:') throw new Error('HTTPS app URL required');
  const code = escapeHtml(input.affiliateCode);
  const appUrl = escapeHtml(url.href);
  const premiumPlan = (input.commissionSnapshot.premium ?? {}) as Record<string, unknown>;
  const familyPlan = (input.commissionSnapshot.family_plus ?? {}) as Record<string, unknown>;
  const premiumPrice = Number(premiumPlan.price_cents ?? 0) / 100;
  const premium = Number(premiumPlan.commission_cents ?? 0) / 100;
  const familyPrice = Number(familyPlan.price_cents ?? 0) / 100;
  const family = Number(familyPlan.commission_cents ?? 0) / 100;
  const subject = 'Selamat datang ke program affiliate Pahlawan Angka!';
  const referralUrl = new URL(url.href); referralUrl.searchParams.set('ref', input.affiliateCode);
  const text = `Tahniah! Anda kini affiliate Pahlawan Angka.\n\nKod referral anda: ${input.affiliateCode}\n\nKomisen semasa:\n- Akses Keluarga RM${premiumPrice.toFixed(2)}: RM${premium.toFixed(2)}\n- Family Plus RM${familyPrice.toFixed(2)}: RM${family.toFixed(2)}\n\nTiada bayaran pendahuluan. Komisen dibayar secara manual selepas disahkan.\n\nKongsi pautan anda: ${referralUrl.href}\nUrus akaun affiliate: ${url.href}\n\nPasukan Pahlawan Angka`;
  const logoUrl = escapeHtml(new URL('assets/branding/pahlawan-angka-full-logo-v1.png', url.href.endsWith('/') ? url.href : `${url.href}/`).href);
  const html = `<!doctype html><html lang="ms"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head><body style="margin:0;padding:28px 12px;background:#edf1f7;font-family:Arial,Helvetica,sans-serif;color:#18243a"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:#0c1c33;padding:24px;text-align:center;border-bottom:4px solid #efbd45"><img src="${logoUrl}" width="220" alt="Pahlawan Angka" style="display:block;width:220px;max-width:100%;height:auto;margin:auto"></td></tr><tr><td style="padding:30px 26px"><p style="margin:0 0 10px;font-size:12px;font-weight:bold;letter-spacing:1px;color:#947020">PROGRAM AFFILIATE</p><h1 style="margin:0 0 16px;color:#0c1c33">Selamat datang, wira!</h1><p style="line-height:1.7">Akaun affiliate anda sudah aktif. Kod referral anda ialah:</p><p style="padding:15px;text-align:center;background:#f6f8fc;border:1px solid #e1e7ef;border-radius:10px;font-size:24px;font-weight:bold;letter-spacing:2px;color:#0c1c33">${code}</p><p style="line-height:1.7"><strong>Komisen semasa</strong><br>Akses Keluarga RM${premiumPrice.toFixed(2)}: RM${premium.toFixed(2)}<br>Family Plus RM${familyPrice.toFixed(2)}: RM${family.toFixed(2)}</p><p style="line-height:1.7">Tiada bayaran pendahuluan. Komisen dibayar secara manual selepas disahkan.</p><p><a href="${escapeHtml(referralUrl.href)}" style="display:inline-block;padding:14px 20px;background:#efbd45;border-radius:9px;color:#0c1c33;font-weight:bold;text-decoration:none">Kongsi pautan referral →</a></p><p style="font-size:13px;color:#53627a">Urus akaun affiliate: <a href="${appUrl}">${appUrl}</a></p></td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}
