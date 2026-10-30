const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const page = fs.readFileSync('demo-jelajah.html', 'utf8');
const controller = fs.readFileSync('js/jelajah-v1.js', 'utf8');
const bridge = fs.readFileSync('js/jelajah-battle-bridge-v1.js', 'utf8');
const tracker = fs.readFileSync('js/demo-funnel-v1.js', 'utf8');

test('standalone Jelajah loads the shared anonymous tracker before controller', () => {
  const trackingScript = page.indexOf('src="js/demo-funnel-v1.js?');
  const controllerScript = page.indexOf('src="js/jelajah-v1.js?');
  assert.ok(trackingScript >= 0 && controllerScript > trackingScript);
  assert.match(controller, /track\('demo_open'\);entry\(\)/);
  assert.match(tracker, /'website_visit','demo_open','demo_start','demo_complete'/);
});

test('start is sent when the FIRST real manual question is rendered, not when grade is clicked', () => {
  assert.match(bridge, /tell\('question',\{index,auto,/);
  assert.match(controller, /if\(d\.type==='question'\)\{if\(d\.index===0&&!d\.auto\)track\('demo_start'\)/);
  const gradeClick = controller.slice(controller.indexOf("$('content').onclick="), controller.indexOf(' window.PAJelajahFinale.onReplay='));
  assert.doesNotMatch(gradeClick, /track\('demo_start'\)/);
});

test('completion is tied to the four-stage finale, not merely the 12-question battle', () => {
  assert.match(controller, /watchReport\(\$\('content'\),\(\)=>active===3&&done\.size===4,\(\)=>\{finaleShown=true;track\('demo_complete'\)\}/);
  const finished = controller.slice(controller.indexOf("if(d.type==='finished')"));
  assert.doesNotMatch(finished, /if\(d\.type==='finished'\)[^\n]*track\('demo_complete'\)/);
});

test('tracker never sends child learning data, demo answers or profile information', () => {
  assert.match(tracker, /const payload=\{session_id:s\.id,event_name:event,is_test:s\.test,\.\.\.s\.attribution\}/);
  assert.doesNotMatch(tracker, /payload=.*\b(grade|child_id|answer|profile)\b/);
});
