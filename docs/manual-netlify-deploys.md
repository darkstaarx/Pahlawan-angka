# Manual Netlify releases

Git pushes are intentionally ignored by Netlify using `[build].ignore = "exit 0"`.
Do not remove this rule or enable automatic publishing without an explicit user request.

The existing published site remains available. Repository updates do not authorize a production release.

For an explicitly authorized release, use a manual CLI deploy or a Netlify build hook. Netlify build hooks bypass the ignore command; treat invoking a hook as a production release action. Generate and verify the asset manifest before any CLI upload because a manual upload does not automatically run the build command.

The dashboard's **Stopped builds** setting is a separate control. Verify it in Netlify when account access is available; do not report it as changed based only on this repository rule.

Reference: https://docs.netlify.com/build/configure-builds/ignore-builds/
