#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert');
const pwa=fs.readFileSync('js/pwa.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const version=fs.readFileSync('js/version.js','utf8');
const html=fs.readFileSync('index.html','utf8');
assert(!/controllerchange[\s\S]{0,300}location\.reload/.test(pwa),'controller change still forces a page reload');
assert(!/clients\.claim\s*\(/.test(sw),'new worker still takes control of an active page');
assert(!/client\.navigate\s*\(/.test(sw),'service-worker activation still navigates active clients');
assert(/registration\.update\(\)/.test(pwa),'background update check was removed');
assert(/PA_APP_VERSION='3\.55\.2'/.test(version),'release version is not 3.55.2');
assert(/js\/version\.js\?v=3\.55\.2/.test(html)&&/js\/pwa\.js\?v=3\.55\.2/.test(html),'HTML cache bust is stale');
console.log('PASS v3.55.2: PWA updates install without reloading or navigating active play');
