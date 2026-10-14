# Test report — Malaysia Pixel Lite (WFF v1)

_Status: DRAFT, waiting for CI emulator results._

## Where tests ran

| Environment | What it could do | Why |
|---|---|---|
| Development sandbox (Linux, this session) | Static checks, official XML validator, font rendering, PowerShell dry run | Its network policy blocks `dl.google.com` (Android SDK, emulator, Google Maven), and it has no KVM. No APK build or emulator was possible there. |
| GitHub Actions `ubuntu-latest` (`.github/workflows/wearos-watchface.yml`) | Real APK build with AGP 9.0.0 / Gradle 9.2.1, Wear OS emulators with KVM | Same scripts as Windows users run (`scripts/emulator-test.ps1`). |
