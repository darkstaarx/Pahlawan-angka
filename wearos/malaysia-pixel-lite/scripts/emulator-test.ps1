<#
.SYNOPSIS
    Builds the Malaysia Pixel Lite watch face, installs it on a running Wear OS
    emulator (or a watch with ADB debugging) and captures real screenshots for the
    test report.

.DESCRIPTION
    Works in Windows PowerShell 5.1 and PowerShell 7. Start a Wear OS emulator with
    API 33 (Wear OS 4) or newer from Android Studio's Device Manager first.

    Tests: time advances, 12/24-hour switch (AM/PM), watch battery %, ambient (AOD),
    step count as reported by the system, optional weather complication, runtime log.
    Screenshots and summary.txt are written to test-output\<timestamp>\.
    Device settings changed by the script are restored at the end.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts\emulator-test.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts\emulator-test.ps1 -Serial emulator-5554 -SkipBuild
#>
[CmdletBinding()]
param(
    # adb serial number, needed only when more than one device is connected.
    [string]$Serial = "",
    # Use the APK that is already built.
    [switch]$SkipBuild,
    # Do not stop for manual steps (setting the face, choosing a weather provider).
    [switch]$NonInteractive,
    # How long to wait between the two time screenshots.
    [int]$MinuteWaitSeconds = 65
)

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $PSScriptRoot
$PackageName = "com.malaysiapixel.lite"
$ApkPath = Join-Path $ProjectDir "watchface\build\outputs\apk\debug\watchface-debug.apk"
$OutDir = Join-Path $ProjectDir ("test-output\" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$SummaryPath = Join-Path $OutDir "summary.txt"
$OnWindows = ($PSVersionTable.PSVersion.Major -lt 6) -or $IsWindows

function Write-Log([string]$Message) {
    $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $Message
    Write-Host $line
    Add-Content -Path $SummaryPath -Value $line
}

function Find-Adb {
    $cmd = Get-Command adb -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $sdkDirs = @($env:ANDROID_HOME, $env:ANDROID_SDK_ROOT)
    if ($env:LOCALAPPDATA) { $sdkDirs += (Join-Path $env:LOCALAPPDATA "Android\Sdk") }
    foreach ($sdk in $sdkDirs) {
        if ($sdk) {
            $candidate = Join-Path $sdk "platform-tools\adb.exe"
            if (Test-Path $candidate) { return $candidate }
        }
    }
    throw "adb not found. Install 'Android SDK Platform-Tools' in Android Studio (SDK Manager) or add platform-tools to PATH."
}

$Adb = Find-Adb
$AdbPrefix = @()
if ($Serial) { $AdbPrefix = @("-s", $Serial) }

function Invoke-Adb {
    # Native tools write progress to stderr; collect it as text instead of failing on it.
    $ErrorActionPreference = "Continue"
    $output = & $script:Adb @script:AdbPrefix @args 2>&1 | ForEach-Object { "$_" }
    $text = ($output -join "`n").Trim()
    if ($LASTEXITCODE -ne 0) { throw ("adb {0} failed: {1}" -f ($args -join " "), $text) }
    return $text
}

function Wait-User([string]$Prompt) {
    if ($NonInteractive) {
        Write-Log "(non-interactive) skipped manual step: $Prompt"
        return
    }
    Read-Host $Prompt | Out-Null
}

function Wake-Watch {
    Invoke-Adb shell input keyevent KEYCODE_WAKEUP | Out-Null
    Start-Sleep -Seconds 3
}

function Save-Screenshot([string]$Name) {
    $remote = "/sdcard/mpl_test_$Name.png"
    $local = Join-Path $OutDir "$Name.png"
    Invoke-Adb shell screencap -p $remote | Out-Null
    Invoke-Adb pull $remote $local | Out-Null
    Invoke-Adb shell rm $remote | Out-Null
    $deviceTime = Invoke-Adb shell date "+%Y-%m-%dT%H:%M:%S"
    Write-Log ("screenshot {0}.png  (device clock {1})" -f $Name, $deviceTime)
    return $local
}

function Get-Sha256([string]$Path) {
    return (Get-FileHash -Algorithm SHA256 -Path $Path).Hash
}

$Expectations = New-Object System.Collections.Generic.List[string]
function Expect([string]$Screenshot, [string]$WhatToCheck) {
    $Expectations.Add(("{0,-28} {1}" -f $Screenshot, $WhatToCheck))
}

# ------------------------------------------------------------------ build
if (-not $SkipBuild) {
    Write-Log "Building :watchface:assembleDebug ..."
    $gradlew = Join-Path $ProjectDir "gradlew"
    if ($OnWindows) { $gradlew = Join-Path $ProjectDir "gradlew.bat" }
    Push-Location $ProjectDir
    try {
        & $gradlew ":watchface:assembleDebug"
        if ($LASTEXITCODE -ne 0) { throw "Gradle build failed (exit code $LASTEXITCODE)" }
    }
    finally { Pop-Location }
}
if (-not (Test-Path $ApkPath)) { throw "APK not found: $ApkPath" }
Write-Log ("APK: {0} ({1} bytes, sha256 {2})" -f $ApkPath, (Get-Item $ApkPath).Length, (Get-Sha256 $ApkPath))

# ------------------------------------------------------------------ device
try { $state = Invoke-Adb get-state } catch { $state = "none" }
if ($state -ne "device") {
    throw "No device found. Start a Wear OS emulator (API 33+) in Android Studio first, then re-run."
}
$sdkLevel = [int](Invoke-Adb shell getprop ro.build.version.sdk)
$characteristics = Invoke-Adb shell getprop ro.build.characteristics
$model = Invoke-Adb shell getprop ro.product.model
$screen = Invoke-Adb shell wm size
$density = Invoke-Adb shell wm density
Write-Log "Device: $model | API $sdkLevel | $characteristics | $screen | $density"
if ($characteristics -notmatch "watch") { Write-Log "WARNING: this device does not report itself as a watch." }
if ($sdkLevel -lt 33) { throw "Watch Face Format needs API 33 (Wear OS 4) or newer; this device is API $sdkLevel." }

$orig1224 = Invoke-Adb shell settings get system time_12_24
$origTimeout = Invoke-Adb shell settings get system screen_off_timeout

try {
    # -------------------------------------------------------------- install
    Write-Log ("install: " + (Invoke-Adb install -r $ApkPath))
    Write-Log "Trying the emulator debug broadcast that selects a watch face (not available on every image)..."
    try {
        $r = Invoke-Adb shell am broadcast -a com.google.android.wearable.app.DEBUG_SURFACE --es operation set-watchface --es watchFaceId $PackageName
        Write-Log "broadcast: $r"
    }
    catch { Write-Log "broadcast failed: $($_.Exception.Message)" }
    Wait-User "Check the emulator shows 'Malaysia Pixel Lite'. If not: long-press the watch face, swipe to the end, tap 'Add', choose Malaysia Pixel Lite. Press Enter to continue"

    Invoke-Adb shell settings put system screen_off_timeout 600000 | Out-Null
    Wake-Watch

    # -------------------------------------------------------------- 1. time advances
    Invoke-Adb shell settings put system time_12_24 24 | Out-Null
    Wake-Watch
    $first = Save-Screenshot "01_time_start"
    Write-Log "Waiting $MinuteWaitSeconds s for the minute to change ..."
    Start-Sleep -Seconds $MinuteWaitSeconds
    Wake-Watch
    $second = Save-Screenshot "02_time_after_wait"
    if ((Get-Sha256 $first) -ne (Get-Sha256 $second)) {
        Write-Log "TIME: the two screenshots differ (compare the digits with the device clock logged above)."
    }
    else {
        Write-Log "TIME: WARNING - screenshots are identical; the time did not visibly change."
    }
    Expect "01/02_time_*.png" "HH:MM matches the logged device clock and moved on by >= 1 minute; date line correct"

    # -------------------------------------------------------------- 2. 12/24-hour
    Invoke-Adb shell settings put system time_12_24 12 | Out-Null
    Wake-Watch
    Save-Screenshot "03_12h_mode" | Out-Null
    Invoke-Adb shell settings put system time_12_24 24 | Out-Null
    Wake-Watch
    Save-Screenshot "04_24h_mode" | Out-Null
    Expect "03_12h_mode.png" "12-hour digits and AM/PM shown right of the time"
    Expect "04_24h_mode.png" "24-hour digits, no AM/PM (if 03/04 look the same, toggle 'Use 24-hour format' in the watch Settings and compare manually)"

    # -------------------------------------------------------------- 3. battery
    Invoke-Adb shell dumpsys battery unplug | Out-Null
    Invoke-Adb shell dumpsys battery set level 37 | Out-Null
    Wake-Watch
    Save-Screenshot "05_battery_37" | Out-Null
    Invoke-Adb shell dumpsys battery set level 82 | Out-Null
    Wake-Watch
    Save-Screenshot "06_battery_82" | Out-Null
    Invoke-Adb shell dumpsys battery reset | Out-Null
    Expect "05_battery_37.png" "middle frame shows 37%"
    Expect "06_battery_82.png" "middle frame shows 82%"

    # -------------------------------------------------------------- 4. ambient
    Invoke-Adb shell input keyevent KEYCODE_SLEEP | Out-Null
    Start-Sleep -Seconds 5
    Save-Screenshot "07_ambient" | Out-Null
    Wake-Watch
    Expect "07_ambient.png" "dark 12_aod_bg, time only (no date/data/decorations). If black: enable Settings > Display > Always-on screen and re-run"

    # -------------------------------------------------------------- 5. steps
    Expect "01..06 left frame" "number equals the system step count (emulators usually report 0 unless an exercise is simulated)"

    # -------------------------------------------------------------- 6. weather complication
    Wait-User "Optional weather test: long-press the face > Edit/Customise > tap the right-hand frame > choose a weather provider. Press Enter when done (or just Enter to skip)"
    Wake-Watch
    Save-Screenshot "08_weather_slot" | Out-Null
    Expect "08_weather_slot.png" "right frame: empty if no provider; otherwise provider text + ONE icon (provider's or the pack's), never two"
}
finally {
    # -------------------------------------------------------------- restore settings
    try {
        if ($orig1224 -eq "null" -or -not $orig1224) { Invoke-Adb shell settings delete system time_12_24 | Out-Null }
        else { Invoke-Adb shell settings put system time_12_24 $orig1224 | Out-Null }
        if ($origTimeout -and $origTimeout -ne "null") { Invoke-Adb shell settings put system screen_off_timeout $origTimeout | Out-Null }
        Invoke-Adb shell dumpsys battery reset | Out-Null
        Write-Log "Device settings restored (time_12_24=$orig1224, screen_off_timeout=$origTimeout, battery reset)."
    }
    catch { Write-Log "WARNING: could not restore all settings: $($_.Exception.Message)" }
}

# ------------------------------------------------------------------ runtime log
try { $runtimePid = Invoke-Adb shell pidof -s com.google.wear.watchface.runtime } catch { $runtimePid = "" }
if ($runtimePid) { $logText = Invoke-Adb logcat -d "--pid=$runtimePid" }
else { $logText = Invoke-Adb logcat -d }
$logFile = Join-Path $OutDir "logcat.txt"
Set-Content -Path $logFile -Value $logText
$problems = @($logText -split "`n" | Where-Object { $_ -match "( E |FATAL|Exception|Invalid|Cannot parse)" })
Write-Log ("logcat saved ({0}); {1} error-looking line(s) from {2}" -f $logFile, $problems.Count,
    $(if ($runtimePid) { "com.google.wear.watchface.runtime" } else { "the whole device (runtime pid not found)" }))

Add-Content -Path $SummaryPath -Value ""
Add-Content -Path $SummaryPath -Value "CHECK EACH SCREENSHOT:"
foreach ($e in $Expectations) { Add-Content -Path $SummaryPath -Value ("  " + $e) }
Write-Host ""
Write-Host "Done. Screenshots and summary: $OutDir"
foreach ($e in $Expectations) { Write-Host ("  " + $e) }
