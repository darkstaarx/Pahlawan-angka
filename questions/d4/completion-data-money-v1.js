// D4 completion content: payment instruments and pictograph interpretation.
// This file is intentionally standalone; the D4 loader decides when to call it.
(function (root) {
  'use strict';

  var paymentMethods = ['tunai', 'kad debit', 'e-dompet', 'perbankan internet'];
  var source = 'd4-completion-v1';

  function methodChoices(answer) {
    return paymentMethods.filter(function (method) { return method !== answer; })
      .map(function (method) { return N(method, 'payment-instrument'); });
  }

  function paymentQuestion() {
    var scene=pick([
      {place:'kedai makanan',item:'sepinggan nasi',prices:[4,6,8,10,12]},
      {place:'kedai buku',item:'buku cerita',prices:[8,12,15,18,24]},
      {place:'gerai buah',item:'sebakul buah',prices:[12,18,24,35,42]},
      {place:'kedai alat tulis',item:'set pensel',prices:[5,8,12,15,18]},
      {place:'kedai pakaian',item:'sehelai baju',prices:[12,18,24,35,56]},
      {place:'kedai sukan',item:'bola',prices:[24,35,42,56,68]}
    ]);
    var amount=pick(scene.prices),place=scene.place,item=scene.item;
    var mode = pick(['identify', 'process', 'record', 'constraint']);
    var answer, prompt, archetypeId, hint, qaEvidence;

    if (mode === 'identify') {
      var identify = pick([
        ['Dia menyerahkan wang kertas kepada penjual dan menerima baki.', 'tunai', 'Perhatikan wang kertas yang diserahkan kepada penjual.'],
        ['Dia memasukkan kad ke dalam mesin pembayaran dan menaip nombor PIN. Wang ditolak terus daripada akaun banknya.', 'kad debit', 'Kad digunakan pada mesin pembayaran. Wang ditolak terus daripada akaun bank.'],
        ['Dia mengimbas kod menggunakan aplikasi pembayaran. Bayaran ditolak daripada baki aplikasi yang telah ditambah nilai.', 'e-dompet', 'Bayaran menggunakan baki dalam aplikasi yang telah ditambah nilai.'],
        ['Dia membuka laman web bank dan membuat pindahan wang kepada penjual.', 'perbankan internet', 'Pindahan wang dibuat melalui laman web bank.']
      ]);
      answer = identify[1];
      prompt = 'Seorang pembeli membayar RM' + amount + ' untuk ' + item + ' di ' + place + '. ' + identify[0] + ' Apakah kaedah pembayaran yang digunakan?';
      archetypeId = 'identify-instrument';
      hint = identify[2];
      qaEvidence = { domain: 'payment', mode: mode, instrumentId: answer, answerLabel: answer, anyGivenCapabilities: [identify[0]], context: place, amountRM: amount, item: item };
    } else if (mode === 'process') {
      var process = pick([
        ['Serahkan wang kertas kepada penjual. Terima baki jika ada.', 'tunai'],
        ['Masukkan kad ke dalam mesin pembayaran. Taip nombor PIN. Wang ditolak terus daripada akaun bank.', 'kad debit'],
        ['Buka aplikasi pembayaran yang telah ditambah nilai. Imbas kod penjual dan bayar menggunakan baki aplikasi itu.', 'e-dompet'],
        ['Log masuk ke laman web bank. Pilih penerima, masukkan jumlah bayaran dan sahkan pindahan.', 'perbankan internet']
      ]);
      answer = process[1];
      prompt = 'Pembeli membayar RM' + amount + ' untuk ' + item + ' di ' + place + '. Langkah pembayarannya ialah: “' + process[0] + '” Apakah kaedah pembayaran ini?';
      archetypeId = 'match-process';
      hint = 'Perhatikan cara wang dibayar dalam langkah yang diberikan.';
      qaEvidence = { domain: 'payment', mode: mode, instrumentId: answer, answerLabel: answer, anyGivenCapabilities: [process[0]], context: place, amountRM: amount, item: item };
    } else if (mode === 'record') {
      var record = pick([
        ['Kad digunakan pada mesin pembayaran. Wang ditolak terus daripada akaun bank pembeli.', 'kad debit'],
        ['Pembeli membayar dengan wang kertas. Penjual memulangkan baki sebanyak RM' + pick([2, 5, 8]) + '.', 'tunai'],
        ['Pembeli mengimbas kod penjual. Bayaran ditolak daripada baki aplikasi yang telah ditambah nilai.', 'e-dompet'],
        ['Pembeli membuat pindahan wang kepada penjual melalui laman web bank.', 'perbankan internet']
      ]);
      answer = record[1];
      prompt = 'Pembeli membeli ' + item + ' berharga RM' + amount + ' di ' + place + '. Baca catatan bayaran ini: “' + record[0] + '” Apakah kaedah pembayaran yang digunakan?';
      archetypeId = 'read-transaction';
      hint = 'Cari maklumat tentang cara pembeli membayar.';
      qaEvidence = { domain: 'payment', mode: mode, instrumentId: answer, answerLabel: answer, anyGivenCapabilities: [record[0]], context: place, amountRM: amount, item: item };
    } else {
      var allowed = pick(paymentMethods);
      var constraint = allowed === 'tunai' ? 'Kaunter ini menerima wang kertas atau syiling sahaja.' :
        allowed === 'kad debit' ? 'Mesin pembayaran hanya menerima kad yang menolak wang terus daripada akaun bank pembeli.' :
        allowed === 'e-dompet' ? 'Penjual hanya menerima bayaran daripada baki aplikasi pembayaran yang telah ditambah nilai.' :
          'Penjual hanya menerima pindahan wang melalui laman web bank.';
      answer = allowed;
      prompt = 'Harga ' + item + ' di ' + place + ' ialah RM' + amount + '. ' + constraint + ' Kaedah pembayaran manakah yang sesuai?';
      archetypeId = 'decide-acceptance-constraint';
      hint = 'Pilih kaedah yang sepadan dengan bentuk bayaran yang diterima.';
      qaEvidence = { domain: 'payment', mode: mode, instrumentId: answer, answerLabel: answer, anyGivenCapabilities: [constraint], context: place, amountRM: amount, item: item };
    }

    var q = Q(prompt, answer, methodChoices(answer), hint, 'Tahun 4 · Kaedah Pembayaran', true, true);
    q.source = source;
    q.familyKey = 'D4.MONEY';
    q.competencyId = mode === 'identify' ? '3.6.1' : '3.6.2';
    q.curriculumStandard=q.competencyId;
    q.archetypeId = archetypeId;
    q.representation = 'story';
    q.demand = mode === 'identify' ? 'concept' : 'application';
    q.contextId='payment-instruments';q.difficultyBand=mode==='identify'?1:3;q.misconceptionTargets=['payment-instrument'];
    q.qaEvidence = qaEvidence;
    return q;
  }

  var chartLabels = [
    ['buku cerita', 'buku sains', 'buku komik', 'majalah'],
    ['epal', 'pisang', 'oren', 'mangga'],
    ['basikal merah', 'basikal biru', 'basikal hijau', 'basikal kuning'],
    ['bungkus roti', 'kotak susu', 'kotak jus', 'botol air mineral'],
    ['ikan emas', 'ikan biru', 'ikan merah', 'ikan belang']
  ];
  var legendText = function (key) { return '1 simbol penuh = ' + key + ' item'; };
  function numericWrong(answer,candidates){
    var out=[],seen=new Set([answer]);
    candidates.concat([answer+1,answer+2,answer+3]).forEach(function(v){if(v>=0&&!seen.has(v)&&out.length<3){seen.add(v);out.push(N(v,'data'));}});
    return out;
  }

  function pictographSymbols(count, key) {
    var symbols = count / key;
    var full = Math.floor(symbols), half = symbols % 1 === 0.5;
    var html = '';
    var dot='<span style="display:block;flex:none;width:16px;height:16px;border-radius:50%;background:#3b6eaa"></span>';
    for (var i = 0; i < full; i++) html += '<span data-symbol="whole" aria-hidden="true" style="display:inline-block;width:16px;height:16px;flex:none">'+dot+'</span>';
    if (half) html += '<span data-symbol="half" aria-hidden="true" style="display:inline-block;width:8px;height:16px;overflow:hidden;flex:none">'+dot+'</span>';
    return html;
  }

  function pictographHtml(labels, counts, key, missingIndex) {
    var description='Piktograf. '+labels.map(function(label,index){
      if(index===missingIndex)return label+': belum dilengkapkan';
      var n=counts[index]/key;
      return label+': '+Math.floor(n)+' simbol penuh'+(n%1===0.5?' dan setengah simbol':'');
    }).join('. ')+'.';
    var rows = labels.map(function (label, index) {
      var hidden = index === missingIndex;
      return '<div data-category="' + label + '" data-count="' + (hidden ? '' : counts[index]) + '" data-key="' + key + '" style="display:flex;align-items:center;gap:8px;margin:3px 0">' +
        '<span style="display:inline-block;width:112px;font-size:13px">' + label + '</span><span style="display:inline-flex;gap:1px;min-height:25px">' + (hidden ? '<span aria-hidden="true" style="font-size:20px">?</span>' : pictographSymbols(counts[index], key)) + '</span></div>';
    }).join('');
    return '<div role="img" aria-label="'+description+'" style="max-width:310px;margin:5px auto 9px;padding:8px 10px;border:2px solid #90a4c5;border-radius:10px;background:#f8fbff">' + rows + '</div><div style="font-size:12px;text-align:center">' + legendText(key) + (key%2===0?'; setengah simbol = '+key/2+' item':'') + '</div>';
  }

  function pictographQuestion(allowedModes) {
    var labels = pick(chartLabels).slice();
    var key = pick([2, 5, 10]);
    var countChoices = key === 5 ? [key, key * 2, key * 3, key * 4, key * 5] : [key, key * 2, key * 3, key * 4, key * 5, key * 2.5, key * 3.5];
    var counts = labels.map(function () { return pick(countChoices); });
    var mode = pick(allowedModes || ['read', 'total', 'difference', 'missing', 'legend', 'maximum']);
    var prompt, answer, wrong, archetypeId, hint, qaEvidence, missingIndex = -1;
    if (mode === 'read') {
      var ri = R(0, labels.length - 1);
      answer = counts[ri];
      wrong = numericWrong(answer,[counts[(ri+1)%labels.length],answer+key,Math.max(0,answer-key)]);
      prompt = pictographHtml(labels, counts, key) + 'Berapakah bilangan ' + labels[ri] + '?';
      archetypeId = 'pictograph-read'; hint = 'Kira simbol pada baris itu. Gunakan petunjuk untuk mencari bilangannya.';
    } else if (mode === 'total') {
      answer = counts.reduce(function (sum, value) { return sum + value; }, 0);
      wrong = numericWrong(answer,[Math.max.apply(null,counts),answer-counts[0],answer+key]);
      prompt = pictographHtml(labels, counts, key) + 'Berapakah jumlah semua item dalam piktograf?';
      archetypeId = 'pictograph-total'; hint = 'Cari nilai setiap baris, kemudian tambah semua nilai.';
    } else if (mode === 'difference') {
      var hi = Math.max.apply(null, counts), lo = Math.min.apply(null, counts);
      answer = hi - lo;
      wrong = numericWrong(answer,[hi,lo,hi+lo]);
      prompt = pictographHtml(labels, counts, key) + 'Berapakah beza antara bilangan item yang paling banyak dengan bilangan item yang paling sedikit?';
      archetypeId = 'pictograph-difference'; hint = 'Tolak nilai paling sedikit daripada nilai paling banyak.';
    } else if (mode === 'missing') {
      missingIndex = R(0, labels.length - 1);
      answer = counts[missingIndex];
      wrong = numericWrong(answer,[answer+key,Math.max(0,answer-key),answer+key*2]);
      var totalCount=counts.reduce(function(sum,n){return sum+n;},0);
      prompt = pictographHtml(labels, counts, key, missingIndex) + 'Jumlah semua item ialah '+totalCount+'. Berapakah bilangan ' + labels[missingIndex] + ' pada baris yang belum dilengkapkan?';
      archetypeId = 'pictograph-missing-symbol'; hint = 'Cari jumlah baris yang ditunjukkan, kemudian tolak daripada jumlah semua item.';
    } else if (mode === 'legend') {
      var legendOptions = [1, 2, 5, 10];
      answer = legendText(key);
      wrong = legendOptions.filter(function (value) { return value !== key; }).map(function (value) { return N(legendText(value), 'legend'); });
      prompt = pictographHtml(labels, counts, key).replace(/<div style="font-size:12px;text-align:center">[^<]*<\/div>$/, '') + 'Nilai setiap simbol belum ditulis. Pilih petunjuk yang betul berdasarkan piktograf ini.';
      archetypeId = 'pictograph-legend'; hint = 'Bandingkan bilangan simbol dengan jumlah item yang diketahui daripada cerita.';
      var knownIndex = R(0, labels.length - 1);
      prompt += ' Rekod menunjukkan bilangan ' + labels[knownIndex] + ' ialah ' + counts[knownIndex] + ' item.';
      qaEvidence = { domain: 'pictograph', mode: mode, labels: labels, numberOfSymbols: counts.map(function (value) { return value / key; }), key: key, targetIndex: knownIndex, knownCategory: labels[knownIndex], knownCount: counts[knownIndex] };
    } else {
      var max = Math.max.apply(null, counts), maxLabels = labels.filter(function (_, index) { return counts[index] === max; });
      answer = maxLabels.join(' dan ');
      var maxWrong = labels.filter(function(label){return maxLabels.indexOf(label)<0;});
      labels.forEach(function(label){if(label!==answer&&!maxWrong.includes(label))maxWrong.push(label);});
      wrong = maxWrong.slice(0,3).map(function(label){return N(label,'data');});
      prompt = pictographHtml(labels, counts, key) + 'Pilihan manakah menyenaraikan semua kategori yang mempunyai bilangan item paling banyak?';
      archetypeId = 'pictograph-maximum'; hint = 'Cari baris yang mempunyai simbol paling banyak.';
    }
    var q = Q(prompt, answer, wrong, hint, 'Tahun 4 · Piktograf', true, true);
    q.source = source;
    q.familyKey = 'D4.DATA';
    q.competencyId = mode === 'legend' || mode === 'missing' ? '8.1.1' : '8.1.2';
    q.curriculumStandard=q.competencyId;
    q.archetypeId = archetypeId;
    q.representation = 'visual';
    q.demand = mode === 'read' || mode === 'legend' ? 'concept' : 'application';
    q.contextId='pictograph';q.difficultyBand=q.demand==='concept'?1:3;q.misconceptionTargets=['data','legend'];
    q.qaEvidence = Object.assign({ domain: 'pictograph', mode: mode, labels: labels, numberOfSymbols: counts.map(function (value) { return value / key; }), key: key, targetIndex: mode === 'read' || mode === 'missing' ? (mode === 'read' ? ri : missingIndex) : -1, targetIndices: mode === 'maximum' ? labels.map(function (_, index) { return counts[index] === Math.max.apply(null, counts) ? index : -1; }).filter(function (index) { return index >= 0; }) : [] }, qaEvidence || {});
    if (typeof answer === 'number') q.qaEvidence.answerNumber = answer;
    else q.qaEvidence.answerLabel = answer;
    return q;
  }

  root.PAD4CompletionContent = { paymentQuestion: paymentQuestion, pictographQuestion: pictographQuestion, version: '1.0.0' };
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this);
