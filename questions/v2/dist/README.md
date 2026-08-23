# questions/v2/dist/ — generated, do not hand-edit

`runtime.js` in this folder is produced by `node questions/v2/build/build.js`
from the current contents of `questions/v2/curriculum/`, `banks/`,
`generators/`, and `renderers/`. See `questions/v2/build/README.md` for the
full build/browser-runtime-boundary design.

If you edit anything under those four directories, regenerate this file
(`node questions/v2/build/build.js`) and commit the result — or CI/local
checks using `node questions/v2/build/build.js --check` will flag drift.

Nothing in `index.html` references this file yet (Phase 1.1). It is
verified but dormant.
