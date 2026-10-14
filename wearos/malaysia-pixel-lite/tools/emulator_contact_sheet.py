"""Lay out the real screenshots from one emulator run on a single labelled sheet.

Usage: python tools/emulator_contact_sheet.py <run-folder> [<run-folder> ...]
       (a run folder is test-output/<timestamp> or docs/emulator-run/<name>)
Writes <run-folder>/contact_sheet.png. Screenshots are pasted unscaled except for
fitting, never redrawn.
"""
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

TILE = 300


def device_times(summary):
    times = {}
    for line in summary.read_text(encoding="utf-8", errors="replace").splitlines():
        m = re.search(r"screenshot (\S+)\.png\s+\(device clock ([^)]+)\)", line)
        if m:
            times[m.group(1)] = m.group(2)
    return times


def sheet(run):
    run = Path(run)
    shots = sorted(p for p in run.glob("[0-9][0-9]_*.png"))
    if not shots:
        print(f"{run}: no screenshots")
        return
    times = device_times(run / "summary.txt") if (run / "summary.txt").exists() else {}
    header = ""
    if (run / "summary.txt").exists():
        header = next((l.split("] ", 1)[1] for l in (run / "summary.txt").read_text(
            encoding="utf-8", errors="replace").splitlines() if "Device:" in l), "")
    cols = 4
    rows = (len(shots) + cols - 1) // cols
    font = ImageFont.load_default(14)
    board = Image.new("RGB", (20 + cols * (TILE + 20), 60 + rows * (TILE + 56)), "#10141D")
    d = ImageDraw.Draw(board)
    d.text((20, 12), f"REAL EMULATOR SCREENSHOTS - {run.name}", fill="#FFF2D7", font=font)
    d.text((20, 32), header, fill="#8BA7C8", font=ImageFont.load_default(12))
    for i, shot in enumerate(shots):
        img = Image.open(shot).convert("RGB")
        img.thumbnail((TILE, TILE), Image.Resampling.LANCZOS)
        x = 20 + (i % cols) * (TILE + 20)
        y = 56 + (i // cols) * (TILE + 56)
        board.paste(img, (x, y))
        d.text((x, y + TILE + 4), shot.stem, fill="#FFF2D7", font=font)
        d.text((x, y + TILE + 22), f"device clock {times.get(shot.stem, '?')}  ({Image.open(shot).size[0]}px)",
               fill="#8BA7C8", font=ImageFont.load_default(12))
    out = run / "contact_sheet.png"
    board.save(out, optimize=True)
    print(f"wrote {out}")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        sheet(arg)
