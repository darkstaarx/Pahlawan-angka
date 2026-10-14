#!/usr/bin/env bash
# Validates watchface.xml with Google's official Watch Face Format validator
# (github.com/google/watchface, third_party/wff), built here from source because the
# project does not publish a ready-made jar.
#
# Needs: bash, curl, python3, a JDK 17+ (javac, jar, java). On Windows use Git Bash or
# WSL, or rely on Android Studio's built-in WFF validation instead.
#
# Usage: tools/validate_wff.sh [format-version ...]     (default: 1 2 3 4 5)
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PROJECT="$(dirname "$HERE")"
WORK="$PROJECT/build/wff-validator"
JAR="$WORK/wff-validator.jar"
RAW="https://raw.githubusercontent.com/google/watchface/main/third_party/wff/specification"
MAVEN="https://repo1.maven.org/maven2"

# Same dependencies as the validator's build.gradle, pinned by SHA-1.
DEPS=(
  "xml-apis/xml-apis/1.4.01/xml-apis-1.4.01.jar 3789d9fada2d3d458c4ba2de349d48780f381ee3"
  "org/exist-db/thirdparty/xerces/xercesImpl/2.12.0/xercesImpl-2.12.0-xml-schema-1.1.jar 418d3fbe2f040156a5a5251accd5b22e58d88ae1"
  "com/rackspace/eclipse/webtools/sourceediting/org.eclipse.wst.xml.xpath2.processor/2.1.100/org.eclipse.wst.xml.xpath2.processor-2.1.100.jar e3a9a2dcbb256530c68ab66e10f41f882c3df086"
  "edu/princeton/cup/java-cup/10k/java-cup-10k.jar 88eadc5347b2a22c9c87a04687f0aabaeac01c0b"
)
SOURCES=(
  DWFValidationApplication.java ResourceManager.java SupportedOptions.java
  WatchFaceXmlValidator.java utils/Log.java utils/OptionParser.java utils/UnzipUtility.java
)

if [[ ! -f "$JAR" ]]; then
  echo "Building wff-validator.jar in $WORK ..."
  rm -rf "$WORK" && mkdir -p "$WORK/lib" "$WORK/src/com/samsung/watchface/utils" "$WORK/xsd" "$WORK/fat"
  for dep in "${DEPS[@]}"; do
    read -r path sha1 <<<"$dep"
    file="$WORK/lib/$(basename "$path")"
    curl -fsSL --retry 6 -o "$file" "$MAVEN/$path"
    echo "$sha1  $file" | sha1sum -c --quiet -
  done
  # One tarball of the repository if github.com is reachable; otherwise file by file.
  if curl -fsSL -o "$WORK/watchface.tar.gz" \
      "https://codeload.github.com/google/watchface/tar.gz/refs/heads/main" 2>/dev/null; then
    tar -xzf "$WORK/watchface.tar.gz" -C "$WORK"
    SPEC="$(echo "$WORK"/watchface-*/third_party/wff/specification)"
    cp -r "$SPEC/validator/src/main/java/." "$WORK/src/"
    cp -r "$SPEC/documents/." "$WORK/xsd/"
  else
    for src in "${SOURCES[@]}"; do
      curl -fsSL --retry 6 -o "$WORK/src/com/samsung/watchface/$src" \
        "$RAW/validator/src/main/java/com/samsung/watchface/$src"
    done
    # Fetch every XSD reachable from documents/<version>/watchface.xsd.
    python3 -I - "$RAW/documents" "$WORK/xsd" <<'PY'
import os, posixpath, re, sys, time, urllib.error, urllib.request
base, out = sys.argv[1], sys.argv[2]


def fetch(url):
    for attempt in range(7):
        try:
            return urllib.request.urlopen(url, timeout=60).read().decode("utf-8")
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503) or attempt == 6:
                raise
            time.sleep(2 ** attempt)


for ver in ("1", "2", "3", "4", "5"):
    todo, seen = ["watchface.xsd"], set()
    while todo:
        rel = todo.pop()
        if rel in seen:
            continue
        seen.add(rel)
        data = fetch(f"{base}/{ver}/{rel}")
        path = os.path.join(out, ver, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, "w", encoding="utf-8").write(data)
        todo += [posixpath.normpath(posixpath.join(posixpath.dirname(rel), loc))
                 for loc in re.findall(r'schemaLocation="([^"]+)"', data)]
    print(f"  XSD version {ver}: {len(seen)} files")
PY
  fi
  (cd "$WORK/xsd" && jar cf "$WORK/fat/docs.zip" .)
  javac -d "$WORK/fat" -cp "$WORK/lib/*" $(find "$WORK/src" -name '*.java')
  (cd "$WORK/fat" && for j in "$WORK"/lib/*.jar; do unzip -q -o "$j" -x 'META-INF/MANIFEST.MF'; done)
  printf 'Main-Class: com.samsung.watchface.DWFValidationApplication\nVersion: source-build\n' > "$WORK/manifest.txt"
  jar cfm "$JAR" "$WORK/manifest.txt" -C "$WORK/fat" .
fi

versions=("$@")
[[ ${#versions[@]} -eq 0 ]] && versions=(1 2 3 4 5)
status=0
for v in "${versions[@]}"; do
  java -jar "$JAR" "$v" "$PROJECT/watchface/src/main/res/raw/watchface.xml" || status=1
done
exit $status
