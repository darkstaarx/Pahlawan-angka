"""Static checks for res/raw/watchface.xml. No device or emulator needed.

What it checks:
  * every drawable, font and string the XML references exists in res/
  * the interactive layer stack matches design/asset-pack/layout.json (order, x=0 y=0
    480x480) and every packaged layer is byte-identical to the asset pack
  * no flattened mockup or preview image is used in the Scene
  * moving layer 09 into the weather slot cannot change the composite (no overlap with
    the layers it now draws above)
  * every text box is 0.7 x font size high (matches the font's line box)
  * worst-case strings stay inside the round display, measured from the real font
  * ambient-mode lit-pixel ratio and an image-memory estimate

It also writes labelled images to docs/evidence/. They are drawn with Pillow by
interpreting the XML; they are NOT emulator screenshots.

Usage: python tools/check_watchface.py   (needs Pillow; run tools/build_resources.py first)
"""
import hashlib
import json
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "design" / "asset-pack"
RES = ROOT / "watchface" / "src" / "main" / "res"
XML = RES / "raw" / "watchface.xml"
OUT = ROOT / "docs" / "evidence"
SIZE = 480
CENTER = SIZE / 2
DISPLAY_RADIUS = 240
SAFE_RADIUS = json.loads((PACK / "layout.json").read_text(encoding="utf-8"))["safe_circle"]["radius"]
EDGE_MARGIN = 2  # px of clearance required between text ink and the display edge

failures = []
notes = []


def check(cond, message):
    line = ("ok  " if cond else "FAIL") + "  " + message
    target = notes if cond else failures
    if line not in target:
        target.append(line)


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def drawable(name):
    for folder in ("drawable-nodpi", "drawable"):
        p = RES / folder / f"{name}.png"
        if p.exists():
            return p
    return None


# ---------------------------------------------------------------- resources
tree = ET.parse(XML)
root = tree.getroot()
scene = root.find("Scene")
strings = {e.get("name") for e in ET.parse(RES / "values" / "strings.xml").getroot()}

for img in root.iter("Image"):
    res = img.get("resource")
    if res.startswith("["):
        continue  # complication-provided image
    check(drawable(res) is not None, f"drawable '{res}' exists")
for font in root.iter("Font"):
    fam = font.get("family")
    if fam != "SYNC_TO_DEVICE":
        check((RES / "font" / f"{fam}.ttf").exists(), f"font '{fam}' exists in res/font")
for el in root.iter():
    for attr in ("displayName", "screenReaderText"):
        if el.get(attr):
            check(el.get(attr) in strings, f"string '{el.get(attr)}' ({el.tag}.{attr}) exists")
import re  # noqa: E402

for f in sorted(p for p in RES.rglob("*") if p.is_file()):
    check(re.fullmatch(r"[a-z][a-z0-9_]*\.(png|ttf|xml)", f.name) is not None,
          f"resource file name '{f.relative_to(RES)}' is a valid Android resource name")
    if f.suffix == ".xml":
        ET.parse(f)  # raises if not well-formed
MANIFEST = ROOT / "watchface" / "src" / "main" / "AndroidManifest.xml"
A = "{http://schemas.android.com/apk/res/android}"
app = ET.parse(MANIFEST).getroot().find("application")
check(app.get(A + "hasCode") == "false", "manifest: android:hasCode=\"false\" (resource-only WFF package)")
wff_version = next(p.get(A + "value") for p in app.findall("property")
                   if p.get(A + "name") == "com.google.wear.watchface.format.version")
min_sdk = int(re.search(r"minSdk\s*=\s*(\d+)",
                        (ROOT / "watchface" / "build.gradle.kts").read_text(encoding="utf-8")).group(1))
check({"1": 33, "2": 34, "3": 35, "4": 36}.get(wff_version) == min_sdk,
      f"WFF format version {wff_version} matches minSdk {min_sdk}")
check(ET.parse(MANIFEST).getroot().find("uses-permission") is None, "manifest requests no permissions")

info = ET.parse(RES / "xml" / "watch_face_info.xml").getroot()
preview_ref = info.find("Preview").get("value").split("/")[-1]
check(drawable(preview_ref) is not None, f"preview drawable '{preview_ref}' exists")

# ---------------------------------------------------------------- layering
layout = json.loads((PACK / "layout.json").read_text(encoding="utf-8"))
manifest = json.loads((ROOT / "tools" / "resources_manifest.json").read_text(encoding="utf-8"))
res_to_src = {v["resource"]: k for k, v in manifest["layers"].items()}
group = next(g for g in scene.iter("Group") if g.get("name") == "interactive_layers")
stack = []
for part in group.iter("PartImage"):
    res = part.find("Image").get("resource")
    geom = tuple(int(part.get(k)) for k in ("x", "y", "width", "height"))
    check(geom == (0, 0, SIZE, SIZE), f"{res} placed at 0,0 480x480")
    stack.append(res_to_src.get(res, res))
expected = [n for n in layout["layers_order"] if n != "09_icon_weather.png"]
check(stack == expected, "interactive layer order matches layout.json (09 moved to weather slot)")
for src, info_ in manifest["layers"].items():
    check(sha256(PACK / "assets_png" / src) == sha256(drawable(info_["resource"])),
          f"{info_['resource']}.png is byte-identical to assets_png/{src}")
used = {i.get("resource") for i in scene.iter("Image")}
check(not any("mockup" in u or "preview" in u for u in used),
      "Scene uses no flattened mockup/preview image")
check(not (RES / "drawable-nodpi" / "original_lite_mockup.png").exists(),
      "reference_only mockup is not packaged")

# Layer 09 now draws above 10 and 11; prove that cannot change any pixel.
def alpha_mask(name):
    return Image.open(PACK / "assets_png" / name).getchannel("A").point(lambda a: 255 if a else 0)

w09 = alpha_mask("09_icon_weather.png")
for other in ("10_hibiscus_small.png", "11_flag_arcs_optional.png"):
    overlap = Image.new("L", (SIZE, SIZE))
    overlap.paste(w09, mask=alpha_mask(other))
    check(overlap.getbbox() is None, f"09_icon_weather has no pixel overlap with {other}")
crop = manifest["weather_icon_crop"]
slot = next(scene.iter("ComplicationSlot"))
pack_icon = next(p for p in slot.iter("PartImage") if p.get("name") == "layer_09_icon_weather")
abs_xy = (int(slot.get("x")) + int(pack_icon.get("x")), int(slot.get("y")) + int(pack_icon.get("y")))
check(abs_xy == (crop["x"], crop["y"]) and
      (int(pack_icon.get("width")), int(pack_icon.get("height"))) == (crop["width"], crop["height"]),
      f"weather icon drawn at its original position {abs_xy} and size")

# ---------------------------------------------------------------- mini renderer
FONT_CACHE = {}


def font(size):
    if size not in FONT_CACHE:
        FONT_CACHE[size] = ImageFont.truetype(str(RES / "font" / "malaysia_pixel.ttf"), size)
    return FONT_CACHE[size]


def hex_color(value, alpha=255):
    value = value.lstrip("#")
    if len(value) == 8:
        a, value = int(value[:2], 16), value[2:]
        alpha = alpha * a // 255
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4)) + (alpha,)


class Ctx:
    def __init__(self, ambient, values, config, complication, time_text):
        self.ambient = ambient
        self.values = values            # data source -> string
        self.config = config            # BooleanConfiguration id -> bool
        self.complication = complication  # None (empty) or dict
        self.time_text = time_text
        self.texts = []                 # (name, string, ink box)


def effective_alpha(el, ctx, parent_alpha):
    a = int(el.get("alpha", "255"))
    for v in el.findall("Variant"):
        if ctx.ambient and v.get("target") == "alpha":
            a = int(v.get("value"))
    return parent_alpha * a // 255


def template_text(font_el, ctx):
    upper = font_el.find("Upper")
    tpl = (upper if upper is not None else font_el).find("Template")
    if tpl is None:
        return (font_el.text or "").strip()
    fmt = (tpl.text or "").strip()
    args = [ctx.values[p.get("expression")] for p in tpl.findall("Parameter")]
    text = fmt.replace("%%", "\0") % tuple(args)
    text = text.replace("\0", "%")
    return text.upper() if upper is not None else text


def draw_text(canvas, ctx, name, text, box, size, color, align, alpha):
    x, y, w, h = box
    f = font(size)
    adv = f.getlength(text)
    start = x if align == "START" else x + (w - adv) / 2
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).text((start, y + size * 0.7), text, font=f, fill=hex_color(color, alpha),
                               anchor="ls")
    canvas.alpha_composite(layer)
    ink = layer.getchannel("A").getbbox()
    ctx.texts.append((name, text, ink, size, box))


def render(el, canvas, ctx, ox=0, oy=0, alpha=255):
    tag = el.tag
    if tag in ("Scene", "Default", "Compare", "BooleanOption", "Complication"):
        for child in el:
            render(child, canvas, ctx, ox, oy, alpha)
    elif tag == "Group":
        a = effective_alpha(el, ctx, alpha)
        if a:
            for child in el:
                render(child, canvas, ctx, ox + int(el.get("x")), oy + int(el.get("y")), a)
    elif tag == "BooleanConfiguration":
        state = "TRUE" if ctx.config[el.get("id")] else "FALSE"
        for opt in el.findall("BooleanOption"):
            if opt.get("id") == state:
                render(opt, canvas, ctx, ox, oy, alpha)
    elif tag == "Condition":
        exprs = {e.get("name"): (e.text or "").strip() for e in el.find("Expressions")}
        for cmp_ in el.findall("Compare"):
            if ctx.values[exprs[cmp_.get("expression")]] == "true":
                render(cmp_, canvas, ctx, ox, oy, alpha)
                return
        if el.find("Default") is not None:
            render(el.find("Default"), canvas, ctx, ox, oy, alpha)
    elif tag == "PartImage":
        a = effective_alpha(el, ctx, alpha)
        res = el.find("Image").get("resource")
        if not a or res.startswith("["):
            return
        img = Image.open(drawable(res)).convert("RGBA")
        w, h = int(el.get("width")), int(el.get("height"))
        if img.size != (w, h):
            img = img.resize((w, h), Image.Resampling.NEAREST)
        if a < 255:
            img.putalpha(img.getchannel("A").point(lambda v: v * a // 255))
        canvas.alpha_composite(img, (ox + int(el.get("x")), oy + int(el.get("y"))))
    elif tag == "PartText":
        a = effective_alpha(el, ctx, alpha)
        text_el = el.find("Text")
        f = text_el.find("Font")
        box = (ox + int(el.get("x")), oy + int(el.get("y")), int(el.get("width")), int(el.get("height")))
        if a:
            draw_text(canvas, ctx, el.get("name"), template_text(f, ctx), box, int(float(f.get("size"))),
                      f.get("color"), text_el.get("align", "CENTER"), a)
    elif tag == "DigitalClock":
        a = effective_alpha(el, ctx, alpha)
        if not a:
            return
        for tt in el.findall("TimeText"):
            f = tt.find("Font")
            box = (ox + int(el.get("x")) + int(tt.get("x")), oy + int(el.get("y")) + int(tt.get("y")),
                   int(tt.get("width")), int(tt.get("height")))
            draw_text(canvas, ctx, "time", ctx.time_text, box, int(float(f.get("size"))), f.get("color"),
                      tt.get("align", "START"), a)
    elif tag == "ComplicationSlot":
        a = effective_alpha(el, ctx, alpha)
        want = "EMPTY" if ctx.complication is None else "SHORT_TEXT"
        comp = next(c for c in el.findall("Complication") if c.get("type") == want)
        if a:
            ctx.values["[COMPLICATION.TEXT]"] = (ctx.complication or {}).get("text", "")
            ctx.values["[COMPLICATION.MONOCHROMATIC_IMAGE] != null"] = "false"
            render(comp, canvas, ctx, ox + int(el.get("x")), oy + int(el.get("y")), a)


def face(ctx):
    canvas = Image.new("RGBA", (SIZE, SIZE), hex_color(scene.get("backgroundColor", "#FF000000")))
    render(scene, canvas, ctx)
    mask = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, SIZE - 1, SIZE - 1), fill=255)
    black = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 255))
    return Image.composite(canvas, black, mask), ctx


ALL_ON = {"showStars": True, "showSkyline": True, "showFlagArcs": True,
          "aodBackground": True, "aodMotif": True}
WORST = {  # widest plausible strings, used only to test the layout
    "[DAY_OF_WEEK_S]": "Wed", "[DAY]": "30", "[MONTH_S]": "Sep", "[STEP_COUNT]": "88888",
    "[BATTERY_PERCENT]": "100", "[AMPM_STRING]": "PM", "[IS_24_HOUR_MODE]": "false",
}


def worst_case_texts():
    """Render with the widest strings and every optional element visible."""
    results = []
    for weather in ("100°F", "-12°C", "28°"):
        _, ctx = face(Ctx(False, dict(WORST), ALL_ON, {"text": weather}, "08:08"))
        results += ctx.texts
    return results


# ---------------------------------------------------------------- geometry
for name, text, ink, size, box in worst_case_texts():
    check(box[3] == round(size * 0.7), f"{name}: box height {box[3]} == 0.7 x size {size}")
    if ink is None:
        continue
    corners = [(ink[0], ink[1]), (ink[2], ink[1]), (ink[0], ink[3]), (ink[2], ink[3])]
    far = max(math.hypot(x - CENTER, y - CENTER) for x, y in corners)
    check(far <= DISPLAY_RADIUS - EDGE_MARGIN,
          f"{name} '{text}': ink {ink} within round display (max r={far:.1f} <= {DISPLAY_RADIUS - EDGE_MARGIN})")
    if far > SAFE_RADIUS and not any(n.startswith(f"note  {name} '{text}'") for n in notes):
        notes.append(f"note  {name} '{text}' extends to r={far:.1f}, outside the pack's r={SAFE_RADIUS} "
                     "safe circle (it sits inside the bottom frames drawn by the asset pack)")

# ---------------------------------------------------------------- ambient + memory
def lit_ratio(img, threshold):
    px = img.convert("L").load()
    inside = lit = 0
    for y in range(SIZE):
        for x in range(SIZE):
            if (x + 0.5 - CENTER) ** 2 + (y + 0.5 - CENTER) ** 2 <= DISPLAY_RADIUS ** 2:
                inside += 1
                lit += px[x, y] > threshold
    return lit / inside


# Brightest possible ambient time for each hour mode (every minute of the day).
fnt = font(100)


def lit_count(text):
    probe = Image.new("L", (310, 80))
    ImageDraw.Draw(probe).text((0, 70), text, font=fnt, fill=255, anchor="ls")
    return probe.histogram()[255]


aod_cases = {
    "24h": max((f"{h:02d}:{m:02d}" for h in range(24) for m in range(60)), key=lit_count),
    "12h": max((f"{(h % 12) or 12:02d}:{m:02d}" for h in range(24) for m in range(60)), key=lit_count),
}
ambient_results = {}
for bg in (True, False):
    cfg = dict(ALL_ON, aodBackground=bg, aodMotif=False)
    worst = None
    for mode, text in aod_cases.items():
        values = dict(WORST, **{"[IS_24_HOUR_MODE]": "true" if mode == "24h" else "false"})
        img, _ = face(Ctx(True, values, cfg, None, text))
        result = {"time": text + ("" if mode == "24h" else " " + values["[AMPM_STRING]"]),
                  "pixels_not_black_pct": round(100 * lit_ratio(img, 0), 2),
                  "pixels_brighter_than_10pct_pct": round(100 * lit_ratio(img, 25), 2)}
        if worst is None or result["pixels_brighter_than_10pct_pct"] > worst[0]["pixels_brighter_than_10pct_pct"]:
            worst = (result, img)
    ambient_results[f"aod_background_{'on' if bg else 'off'}"] = worst[0]
    worst[1].save(OUT / f".ambient_{'on' if bg else 'off'}.png")
check(ambient_results["aod_background_off"]["pixels_not_black_pct"] <= 15,
      f"ambient with black background lights <= 15% of pixels "
      f"({ambient_results['aod_background_off']['pixels_not_black_pct']}% for "
      f"'{ambient_results['aod_background_off']['time']}')")
notes.append(f"note  ambient with 12_aod_bg (default) lights "
             f"{ambient_results['aod_background_on']['pixels_not_black_pct']}% of pixels at very low "
             f"level; {ambient_results['aod_background_on']['pixels_brighter_than_10pct_pct']}% are "
             "brighter than 10% grey")


def image_bytes(res):
    img = Image.open(drawable(res)).convert("RGBA")
    box = img.getchannel("A").getbbox()
    return 4 * (box[2] - box[0]) * (box[3] - box[1]) if box else 0


interactive_imgs = [i.get("resource") for i in scene.find("Group[@name='interactive_layers']").iter("Image")]
interactive_imgs.append("mpl_09_icon_weather_slot")
ambient_imgs = [i.get("resource") for i in scene.find("Group[@name='ambient_layers']").iter("Image")]
font_bytes = (RES / "font" / "malaysia_pixel.ttf").stat().st_size
memory = {
    "interactive_images_bytes_cropped_rgba8888": sum(image_bytes(r) for r in interactive_imgs),
    "interactive_images_bytes_uncropped_rgba8888": 4 * SIZE * SIZE * len(interactive_imgs),
    "ambient_images_bytes_cropped_rgba8888": sum(image_bytes(r) for r in ambient_imgs),
    "vector_font_bytes": font_bytes,
    "limits_bytes": {"interactive": 100 * 1024 * 1024, "ambient": 10 * 1024 * 1024},
}
check(memory["interactive_images_bytes_uncropped_rgba8888"] + font_bytes < 100 * 1024 * 1024,
      "interactive image memory (no cropping, worst case) < 100 MB")
check(memory["ambient_images_bytes_cropped_rgba8888"] + font_bytes < 10 * 1024 * 1024,
      "ambient image memory < 10 MB")

# ---------------------------------------------------------------- evidence images
OUT.mkdir(parents=True, exist_ok=True)
LABEL_FONT = ImageFont.load_default(14)


def labelled(img, title, lines=()):
    board = Image.new("RGB", (SIZE + 40, SIZE + 70 + 18 * len(lines)), "#10141D")
    board.paste(img.convert("RGB"), (20, 40))
    d = ImageDraw.Draw(board)
    d.text((20, 12), title, fill="#FFF2D7", font=LABEL_FONT)
    for i, line in enumerate(lines):
        d.text((20, SIZE + 52 + 18 * i), line, fill="#8BA7C8", font=LABEL_FONT)
    return board


def overlay_guides(img, texts):
    img = img.copy()
    d = ImageDraw.Draw(img)
    d.ellipse((CENTER - SAFE_RADIUS, CENTER - SAFE_RADIUS, CENTER + SAFE_RADIUS, CENTER + SAFE_RADIUS),
              outline="#36BB91")
    for _, _, ink, _, box in texts:
        d.rectangle((box[0], box[1], box[0] + box[2] - 1, box[1] + box[3] - 1), outline="#F5C842")
    return img


STATIC = "STATIC LAYOUT CHECK - Pillow render of watchface.xml, NOT an emulator screenshot"
img, ctx = face(Ctx(False, dict(WORST), ALL_ON, {"text": "100°F"}, "08:08"))
labelled(overlay_guides(img, ctx.texts), STATIC,
         ["Widest test strings: 88888 steps, 100% battery, 100°F weather, PM, WED 30 SEP.",
          "Yellow = text boxes from the XML, green = layout.json safe circle (r=204)."]
         ).save(OUT / "layout_check_interactive.png")
img, _ = face(Ctx(False, dict(WORST, **{"[IS_24_HOUR_MODE]": "true"}), ALL_ON, None, "18:58"))
labelled(img, STATIC, ["24-hour mode (no AM/PM), weather slot empty (default)."]
         ).save(OUT / "layout_check_24h_empty_weather.png")
for bg in (True, False):
    key = f"aod_background_{'on' if bg else 'off'}"
    tmp = OUT / f".ambient_{'on' if bg else 'off'}.png"
    img = Image.open(tmp)
    labelled(img, STATIC.replace("LAYOUT", "AMBIENT"),
             [f"Ambient, 12_aod_bg {'ON (default)' if bg else 'OFF (pure black)'}; "
              f"'{ambient_results[key]['time']}' lights the most pixels.",
              f"Non-black pixels: {ambient_results[key]['pixels_not_black_pct']}%, brighter than 10% grey: "
              f"{ambient_results[key]['pixels_brighter_than_10pct_pct']}%"]
             ).save(OUT / f"ambient_check_{key}.png")
    tmp.unlink()
img, _ = face(Ctx(False, dict(WORST), ALL_ON, {"text": "100°F"}, "08:08"))
labelled(img.resize((450, 450), Image.Resampling.BILINEAR),
         "450 px APPROXIMATION (bilinear) - the real scaling filter is the system's",
         ["WatchFace width/height 480 is scaled by the system to the device size."]
         ).save(OUT / "layout_check_450_approx.png")

# Layer stack: every packaged resource, in XML draw order, then the composite.
order = [(i.get("resource"), p.get("name")) for p in scene.iter("PartImage")
         for i in p.findall("Image") if not i.get("resource").startswith("[")]
thumb = 150
cols = 4
gap = 40
rows = math.ceil((len(order) + 1) / cols)
sheet = Image.new("RGB", (cols * (thumb + gap) + 20, rows * (thumb + 44) + 50), "#10141D")
d = ImageDraw.Draw(sheet)
d.text((20, 14), "Packaged layers in watchface.xml draw order (each a separate resource)", fill="#FFF2D7",
       font=LABEL_FONT)
checker = Image.new("RGB", (thumb, thumb), "#1B2333")
cd = ImageDraw.Draw(checker)
for yy in range(0, thumb, 10):
    for xx in range(0, thumb, 10):
        if (xx + yy) // 10 % 2:
            cd.rectangle((xx, yy, xx + 9, yy + 9), fill="#26314A")
for n, (res, name) in enumerate(order):
    src = Image.open(drawable(res)).convert("RGBA")
    if src.size != (SIZE, SIZE):  # the cropped weather icon: show it on the full canvas
        full = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        full.paste(src, (crop["x"], crop["y"]))
        src = full
    tile = checker.copy().convert("RGBA")
    tile.alpha_composite(src.resize((thumb, thumb), Image.Resampling.NEAREST))
    x, y = 20 + (n % cols) * (thumb + gap), 44 + (n // cols) * (thumb + 44)
    sheet.paste(tile.convert("RGB"), (x, y))
    d.text((x, y + thumb + 4), f"{n + 1}. {res.removeprefix('mpl_')}"[:24], fill="#8BA7C8",
           font=ImageFont.load_default(12))
img, _ = face(Ctx(False, dict(WORST), ALL_ON, {"text": "28°"}, "10:08"))
n = len(order)
x, y = 20 + (n % cols) * (thumb + gap), 44 + (n // cols) * (thumb + 44)
sheet.paste(img.resize((thumb, thumb), Image.Resampling.LANCZOS).convert("RGB"), (x, y))
d.text((x, y + thumb + 4), "= composite (Pillow)", fill="#FFF2D7", font=LABEL_FONT)
sheet.save(OUT / "layer_stack.png")

report = {"failures": failures, "checks": notes, "ambient": ambient_results,
          "memory_estimate": memory}
(OUT / "static_checks.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n",
                                        encoding="utf-8")
for line in notes + failures:
    print(line)
print(json.dumps({"ambient": ambient_results, "memory_estimate": memory}, indent=2))
print(f"\n{len(failures)} failure(s), {sum(1 for n in notes if n.startswith('ok'))} check(s) passed")
sys.exit(1 if failures else 0)
