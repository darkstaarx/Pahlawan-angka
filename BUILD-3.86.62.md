# 3.86.62 — stop loading retired Sidma and minion artwork

- Removed 20 retired artwork URLs (8,071,659 bytes) from the automatic asset precache. Original files remain available for compatibility with older clients.
- Removed the hidden legacy battle's eager Askabus image URL.
- Removed the archived Sidma module and stylesheet from startup and shell precaching.
- Combat motion no longer preloads Sidma poses or Sigma FX during startup. Its archived Sidma branch loads these only on explicit use.
- The clock manipulative uses its existing SVG clock without the retired Sidma rider image.
- Live Wira Chibi Segel gameplay, questions, scoring, timing and player saves are unchanged.

Verify with `node audit/legacy-preload.test.cjs` and the Playwright `audit/legacy-asset-requests.test.cjs` request audit. The latter exercises cold install, guest Segel entry and a saved Sidma profile and records requests at the server, including worker precache requests.
