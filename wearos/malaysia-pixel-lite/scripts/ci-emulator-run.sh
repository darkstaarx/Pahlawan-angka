#!/usr/bin/env bash
# CI helper: runs inside a booted Wear OS emulator (see .github/workflows/wearos-watchface.yml).
# Windows users run scripts/emulator-test.ps1 directly instead.
set -euo pipefail
cd "$(dirname "$0")/.."

adb shell settings put global device_provisioned 1 || true
adb shell settings put secure user_setup_complete 1 || true
# Let the Wear OS home and watch face service settle after boot.
sleep 60
echo "Display/ambient related settings:"
for ns in global secure system; do
  adb shell settings list "$ns" | grep -i -E 'ambient|always|aod|doze|screen_off' | sed "s/^/$ns: /" || true
done
adb shell pm list packages | grep -i -E 'watchface|wearable' || true

pwsh -NoProfile -File scripts/emulator-test.ps1 -SkipBuild -NonInteractive
