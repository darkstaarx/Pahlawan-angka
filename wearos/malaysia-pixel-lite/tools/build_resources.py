"""Generate the Android resources for the Malaysia Pixel Lite watch face.

Inputs (never modified):
  design/asset-pack/assets_png/*.png   original 480x480 RGBA layers
  design/asset-pack/build_assets.py    source of the 5x7 GLYPHS table (read with ast, not executed)

Outputs:
  watchface/src/main/res/drawable-nodpi/mpl_*.png   byte-identical copies of the layers
  watchface/src/main/res/drawable-nodpi/mpl_09_icon_weather_slot.png
                                                     09_icon_weather.png cropped to its opaque
                                                     bounding box (lossless) for the weather slot
  watchface/src/main/res/font/malaysia_pixel.ttf     vector font built from GLYPHS (+ a few extras)
  watchface/src/main/res/drawable-nodpi/preview.png  watch face picker thumbnail

Requires Pillow and fontTools:  pip install pillow fonttools
Run from anywhere:              python tools/build_resources.py
"""
import ast
import hashlib
import json
import shutil
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.misc.timeTools import timestampFromString
from fontTools.pens.ttGlyphPen import TTGlyphPen
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "design" / "asset-pack"
LAYERS = PACK / "assets_png"
RES = ROOT / "watchface" / "src" / "main" / "res"
DRAWABLE = RES / "drawable-nodpi"
FONT_DIR = RES / "font"

# Layer file -> Android resource name (resource names cannot start with a digit).
LAYER_RESOURCES = {
    "00_bg_night.png": "mpl_00_bg_night",
    "01_moon_star.png": "mpl_01_moon_star",
    "02_star_speckles.png": "mpl_02_star_speckles",
    "03_kl_silhouette.png": "mpl_03_kl_silhouette",
    "04_heart_blue.png": "mpl_04_heart_blue",
    "05_heart_stripes.png": "mpl_05_heart_stripes",
    "06_complication_frames.png": "mpl_06_complication_frames",
    "07_icon_steps.png": "mpl_07_icon_steps",
    "08_icon_battery.png": "mpl_08_icon_battery",
    "10_hibiscus_small.png": "mpl_10_hibiscus_small",
    "11_flag_arcs_optional.png": "mpl_11_flag_arcs_optional",
    "12_aod_bg.png": "mpl_12_aod_bg",
    "13_aod_moon_star_optional.png": "mpl_13_aod_moon_star_optional",
}
# 09_icon_weather.png is drawn inside the weather ComplicationSlot, so it is cropped
# to its opaque pixels and positioned at the same absolute offset.
WEATHER_ICON = "09_icon_weather.png"
WEATHER_ICON_RES = "mpl_09_icon_weather_slot"

# Font geometry: one source pixel = 100 font units, em = 1000 units.
# Font size S px therefore gives S/10 px per source pixel (size 100 -> 10 px cells).
UNITS_PER_EM = 1000
CELL = 100
ROWS = 7
ADVANCE_CELLS = 6  # 5 columns of ink + 1 column of spacing, as in build_assets.pixel_text

# Glyphs the asset pack does not define but complication/system text commonly needs.
# Drawn in the same 5x7 style.
EXTRA_GLYPHS = {
    "°": ["01100", "10010", "10010", "01100", "00000", "00000", "00000"],
    "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
    "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
    "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
    "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
    "?": ["11111", "00001", "00001", "00111", "00100", "00000", "00100"],
    "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
    ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
    "_": ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
    "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
}
# Extra code points rendered with an existing glyph.
ALIASES = {
    " ": " ",  # no-break space
    " ": " ",  # thin space
    " ": " ",  # narrow no-break space (used by some locales in times)
    "−": "-",  # minus sign
    "–": "-",  # en dash
    "’": "'",  # right single quotation mark
}

COLORS = {"cream": "#FFF2D7", "shadow": "#030915", "muted": "#7D99BF"}


def load_pack_glyphs():
    """Read the GLYPHS dict from build_assets.py without executing that script."""
    tree = ast.parse((PACK / "build_assets.py").read_text(encoding="utf-8"))
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(
            isinstance(t, ast.Name) and t.id == "GLYPHS" for t in node.targets
        ):
            glyphs = {}
            for key, value in zip(node.value.keys, node.value.values):
                # The space glyph is written as ["00000"]*7; allow only that list*int form.
                if isinstance(value, ast.BinOp) and isinstance(value.op, ast.Mult):
                    rows = ast.literal_eval(value.left) * ast.literal_eval(value.right)
                else:
                    rows = ast.literal_eval(value)
                glyphs[ast.literal_eval(key)] = rows
            return glyphs
    raise SystemExit("GLYPHS table not found in build_assets.py")


def glyph_contours(rows):
    """Trace the outline of a 5x7 bitmap into closed, non-overlapping contours.

    Every lit pixel contributes four clockwise edges (font space, y up); edges shared
    by two lit pixels cancel, so the result is the exact outline (outer contours
    clockwise, holes counter-clockwise) with no internal seams.
    """
    edges = set()
    for r, row in enumerate(rows):
        for c, v in enumerate(row):
            if v != "1":
                continue
            x0, x1 = c * CELL, (c + 1) * CELL
            y1 = (ROWS - r) * CELL
            y0 = y1 - CELL
            for a, b in (((x0, y0), (x0, y1)), ((x0, y1), (x1, y1)),
                         ((x1, y1), (x1, y0)), ((x1, y0), (x0, y0))):
                if (b, a) in edges:
                    edges.remove((b, a))
                else:
                    edges.add((a, b))
    outgoing = {}
    for a, b in edges:
        outgoing.setdefault(a, []).append(b)
    contours = []
    while outgoing:
        start = next(iter(outgoing))
        contour = [start]
        prev, cur = None, start
        while True:
            options = outgoing[cur]
            if len(options) == 1 or prev is None:
                nxt = options[0]
            else:
                # Two shapes touch diagonally at this vertex: keep turning right so
                # each contour stays simple.
                din = (cur[0] - prev[0], cur[1] - prev[1])
                nxt = min(options, key=lambda p: din[0] * (p[1] - cur[1]) - din[1] * (p[0] - cur[0]))
            options.remove(nxt)
            if not options:
                del outgoing[cur]
            if nxt == start:
                break
            contour.append(nxt)
            prev, cur = cur, nxt
        # Drop collinear points to keep the glyphs small.
        simplified = []
        n = len(contour)
        for i, p in enumerate(contour):
            a, b = contour[i - 1], contour[(i + 1) % n]
            if (p[0] - a[0]) * (b[1] - p[1]) != (p[1] - a[1]) * (b[0] - p[0]):
                simplified.append(p)
        contours.append(simplified)
    return contours


def glyph_name(ch):
    return "space" if ch == " " else f"uni{ord(ch):04X}"


def build_font(glyphs, out_path):
    names = [".notdef"]
    cmap = {}
    shapes = {}
    for ch, rows in glyphs.items():
        name = glyph_name(ch)
        names.append(name)
        cmap[ord(ch)] = name
        shapes[name] = rows
    for ch in "abcdefghijklmnopqrstuvwxyz":
        cmap[ord(ch)] = glyph_name(ch.upper())
    for ch, target in ALIASES.items():
        cmap[ord(ch)] = glyph_name(target)

    fb = FontBuilder(UNITS_PER_EM, isTTF=True)
    fb.setupGlyphOrder(names)
    fb.setupCharacterMap(cmap)
    glyf, metrics = {}, {}
    for name in names:
        pen = TTGlyphPen(None)
        if name == ".notdef":
            for contour in ([(0, 0), (0, 700), (500, 700), (500, 0)],
                            [(100, 100), (400, 100), (400, 600), (100, 600)]):
                pen.moveTo(contour[0])
                for p in contour[1:]:
                    pen.lineTo(p)
                pen.closePath()
        else:
            for contour in glyph_contours(shapes[name]):
                pen.moveTo(contour[0])
                for p in contour[1:]:
                    pen.lineTo(p)
                pen.closePath()
        glyf[name] = pen.glyph()
        glyf[name].recalcBounds(None)
        metrics[name] = (ADVANCE_CELLS * CELL, getattr(glyf[name], "xMin", 0))
    fb.setupGlyf(glyf)
    fb.setupHorizontalMetrics(metrics)
    # Line box == glyph box (7 cells above the baseline, nothing below), so a text box
    # whose height is 0.7 x font size holds the glyphs exactly, whatever vertical
    # placement rule the renderer uses.
    fb.setupHorizontalHeader(ascent=ROWS * CELL, descent=0, lineGap=0)
    fb.setupNameTable({
        "familyName": "Malaysia Pixel Lite",
        "styleName": "Regular",
        "uniqueFontIdentifier": "MalaysiaPixelLite-Regular-1.0",
        "fullName": "Malaysia Pixel Lite Regular",
        "psName": "MalaysiaPixelLite-Regular",
        "version": "Version 1.000",
        "description": "5x7 pixel font generated from the GLYPHS table in the "
                       "Malaysia Pixel Lite V1 asset pack (build_assets.py).",
    })
    fb.setupOS2(version=4, sTypoAscender=ROWS * CELL, sTypoDescender=0, sTypoLineGap=0,
                usWinAscent=ROWS * CELL, usWinDescent=0, sxHeight=ROWS * CELL,
                sCapHeight=ROWS * CELL, fsSelection=0x40 | 0x80, achVendID="MPXL")
    fb.setupPost()
    # Fixed timestamp keeps the generated font byte-for-byte reproducible.
    stamp = timestampFromString("Wed Oct 14 00:00:00 2026")
    fb.setupHead(unitsPerEm=UNITS_PER_EM, created=stamp, modified=stamp)
    fb.font["head"].yMax = ROWS * CELL
    fb.font["head"].yMin = 0
    out_path.parent.mkdir(parents=True, exist_ok=True)
    fb.save(str(out_path))
    return sorted(set(cmap))


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def draw_text(img, text, x, y, size, color, font_path):
    """Draw text with its glyph-box top-left at (x, y) in 480-space pixels."""
    font = ImageFont.truetype(str(font_path), size)
    ImageDraw.Draw(img).text((x, y + size * 0.7), text, font=font, fill=color, anchor="ls")


def main():
    DRAWABLE.mkdir(parents=True, exist_ok=True)
    manifest = {"layers": {}, "weather_icon_crop": None}
    for src_name, res_name in LAYER_RESOURCES.items():
        src = LAYERS / src_name
        dst = DRAWABLE / f"{res_name}.png"
        shutil.copyfile(src, dst)
        assert sha256(src) == sha256(dst)
        manifest["layers"][src_name] = {"resource": res_name, "sha256": sha256(dst)}

    icon = Image.open(LAYERS / WEATHER_ICON).convert("RGBA")
    box = icon.getchannel("A").getbbox()
    crop = icon.crop(box)
    crop.save(DRAWABLE / f"{WEATHER_ICON_RES}.png", optimize=True)
    # Prove the crop is lossless: pasting it back at the same offset reproduces the layer.
    canvas = Image.new("RGBA", icon.size, (0, 0, 0, 0))
    canvas.paste(crop, box[:2])
    assert canvas.tobytes() == icon.tobytes(), "weather icon crop is not lossless"
    manifest["weather_icon_crop"] = {
        "source": WEATHER_ICON, "resource": WEATHER_ICON_RES,
        "x": box[0], "y": box[1], "width": box[2] - box[0], "height": box[3] - box[1],
        "lossless": True,
    }

    glyphs = dict(load_pack_glyphs())
    glyphs.update(EXTRA_GLYPHS)
    font_path = FONT_DIR / "malaysia_pixel.ttf"
    codepoints = build_font(glyphs, font_path)
    manifest["font"] = {"resource": "malaysia_pixel", "glyphs": len(glyphs),
                        "codepoints": len(codepoints), "sha256": sha256(font_path)}

    # Picker thumbnail: the real layers plus the PREVIEW_TIME (10:08) drawn with the
    # watch face font. Data fields are left empty on purpose (no invented values).
    preview = Image.new("RGBA", (480, 480), (0, 0, 0, 255))
    order = json.loads((PACK / "layout.json").read_text(encoding="utf-8"))["layers_order"]
    for name in order:
        preview.alpha_composite(Image.open(LAYERS / name).convert("RGBA"))
    draw_text(preview, "10:08", 99, 178, 100, COLORS["shadow"], font_path)
    draw_text(preview, "10:08", 95, 174, 100, COLORS["cream"], font_path)
    mask = Image.new("L", (480, 480), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, 479, 479), fill=255)
    preview.putalpha(mask)
    preview.save(DRAWABLE / "preview.png", optimize=True)

    (ROOT / "tools" / "resources_manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"layers copied: {len(LAYER_RESOURCES)}; weather icon crop {manifest['weather_icon_crop']}")
    print(f"font: {font_path.relative_to(ROOT)} ({len(glyphs)} glyphs, {len(codepoints)} code points)")


if __name__ == "__main__":
    main()
