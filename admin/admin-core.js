(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PAAffiliateAdminCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const money = cents => new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format((Number(cents) || 0) / 100);
  const normal = value => String(value == null ? '' : value).trim().toLowerCase();
  const uniqueRows = rows => { const seen = new Set(); return (rows || []).filter(row => { const key = String(row?.id || ''); if (!key || seen.has(key)) return false; seen.add(key); return true; }); };
  const isPayable = row => ['pending', 'approved'].includes(normal(row?.status)) && normal(row?.order_status) === 'paid' && !isVoid(row) && Math.max(0, Number(row?.amount_cents) || 0) > 0;
  const isPaid = row => normal(row?.status) === 'paid';
  const isVoid = row => ['void', 'cancelled', 'canceled'].includes(normal(row?.status));
  function aggregate(commissions) {
    const rows = uniqueRows(commissions);
    return rows.reduce((out, row) => {
      const cents = Math.max(0, Number(row.amount_cents) || 0);
      if (!isVoid(row) && normal(row.order_status) === 'paid') out.referrals += 1;
      if (isPayable(row)) out.payable_cents += cents;
      else if (isPaid(row)) out.paid_cents += cents;
      else if (isVoid(row)) out.void_cents += cents;
      return out;
    }, { referrals: 0, payable_cents: 0, paid_cents: 0, void_cents: 0 });
  }
  function filterRows(rows, { search = '', status = 'all', affiliateId = 'all' } = {}) {
    const query = normal(search); const wanted = normal(status);
    return uniqueRows(rows).filter(row => {
      const haystack = [row.display_name, row.email, row.code, row.order_id, row.order_reference].map(normal).join(' ');
      return (!query || haystack.includes(query)) && (wanted === 'all' || (wanted === 'unpaid' ? isPayable(row) : normal(row.status) === wanted)) && (affiliateId === 'all' || String(row.affiliate_id) === String(affiliateId));
    });
  }
  function csvEscape(value) {
    let text = String(value == null ? '' : value);
    if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function toCsv(rows) {
    const columns = ['id','affiliate_id','affiliate_name','affiliate_email','affiliate_code','order_id','amount_cents','status','payout_reference','paid_at','created_at','order_plan','order_amount_cents','order_status','order_paid_at','order_reference'];
    return [columns.join(','), ...uniqueRows(rows).map(row => columns.map(key => csvEscape(row[key] ?? (key === 'affiliate_name' ? row.display_name : key === 'affiliate_email' ? row.email : key === 'affiliate_code' ? row.code : ''))).join(','))].join('\r\n') + '\r\n';
  }
  function sum(rows) { return uniqueRows(rows).filter(isPayable).reduce((total, row) => total + Math.max(0, Number(row.amount_cents) || 0), 0); }
  return Object.freeze({ money, aggregate, filterRows, toCsv, sum, uniqueRows, isPayable, isPaid, isVoid });
}));
