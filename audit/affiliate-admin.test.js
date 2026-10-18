const assert = require('node:assert/strict');
const core = require('../admin/admin-core.js');
const rows = [
  { id: 'a', affiliate_id: 'one', amount_cents: 1200, status: 'pending', order_status: 'paid' },
  { id: 'b', affiliate_id: 'one', amount_cents: 800, status: 'paid', order_status: 'paid' },
  { id: 'c', affiliate_id: 'two', amount_cents: 900, status: 'void', order_status: 'paid' },
  { id: 'a', affiliate_id: 'one', amount_cents: 1200, status: 'pending', order_status: 'paid' },
];
assert.deepEqual(core.aggregate(rows), { referrals: 2, payable_cents: 1200, paid_cents: 800, void_cents: 900 });
assert.equal(core.sum(rows), 1200);
assert.equal(core.filterRows(rows, { affiliateId: 'one', status: 'pending' }).length, 1);
const csv = core.toCsv([{ id: 'x', order_reference: '=SUM(A1:A2)', amount_cents: 10 }]);
assert.match(csv, /'=SUM\(A1:A2\)/);
assert.match(csv, /"x"/);
console.log('affiliate admin core tests passed');

// The game worker must not cache the admin portal as the game shell.
const fs=require('node:fs'),vm=require('node:vm');
const handlers={};const self={location:{origin:'https://example.test'},addEventListener:(name,fn)=>{handlers[name]=fn}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8'),{self,URL,importScripts(){self.PA_APP_VERSION='test';}});
for(const route of ['/admin','/admin/','/admin/admin.js']){
 let handled=false;handlers.fetch({request:{method:'GET',url:'https://example.test'+route,mode:'navigate'},respondWith(){handled=true;}});
 assert.equal(handled,false,'admin route must bypass game cache: '+route);
}
console.log('admin service worker isolation passed');
