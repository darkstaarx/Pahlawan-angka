'use strict';
// Playwright for the browser audits. The module resolves normally (local or
// NODE_PATH install); the browser comes from PA_BROWSER_PATH, then the
// pre-installed Playwright browsers, then the caller's old machine path.
// With none of them present Playwright picks its own default browser.
const fs=require('fs'),path=require('path');
function loadPlaywright(fallbackModule){
 const explicit=process.env.PA_PLAYWRIGHT_PATH||process.env.PLAYWRIGHT_MODULE;
 if(explicit)return require(explicit);
 try{return require('playwright');}
 catch(e){if(e.code!=='MODULE_NOT_FOUND'||!fallbackModule)throw e;return require(fallbackModule);}
}
function browserPath(fallback){
 const installed=process.env.PLAYWRIGHT_BROWSERS_PATH&&path.join(process.env.PLAYWRIGHT_BROWSERS_PATH,'chromium');
 if(process.env.PA_BROWSER_PATH)return process.env.PA_BROWSER_PATH;
 return [installed,fallback].find(p=>p&&fs.existsSync(p));
}
module.exports={loadPlaywright,browserPath};
