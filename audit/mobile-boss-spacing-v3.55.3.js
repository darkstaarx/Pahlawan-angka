#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert');
const css=fs.readFileSync('css/boss-stage-dev-v3.21.4.css','utf8');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
assert(/@media\(max-width:600px\)[\s\S]*--pa-boss-stage-inset:44px/.test(css),'mobile boss is not pulled inward');
assert(/@media\(max-width:380px\).*--pa-boss-stage-inset:42px/.test(css),'narrow mobile boss inset is missing');
assert(/right:calc\(var\(--pa-enemy-inset\) \+ var\(--pa-boss-stage-inset\)\)/.test(css),'boss-only stage inset is not applied');
assert(/bossCss=`css\/boss-stage-dev-v\$\{BOSS_LAB_VERSION\}\.css\?v=\$\{APP_VERSION\}`/.test(pwa),'boss CSS does not use release cache bust');
assert(/PA_APP_VERSION='3\.55\.3'/.test(version),'release version is not 3.55.3');
console.log('PASS v3.55.3: mobile boss moves inward without changing hero or minion staging');
