from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "marketing" / "pahlawan-angka-poster-final.jpg"
W, H = 1080, 1350

def open_rgba(path):
    return Image.open(ROOT / path).convert("RGBA")

def contain(im, max_w, max_h):
    r = min(max_w / im.width, max_h / im.height)
    return im.resize((max(1,int(im.width*r)), max(1,int(im.height*r))), Image.Resampling.LANCZOS)

def cover(im, w, h):
    r = max(w / im.width, h / im.height)
    im = im.resize((int(im.width*r), int(im.height*r)), Image.Resampling.LANCZOS)
    x = (im.width-w)//2
    y = (im.height-h)//2
    return im.crop((x,y,x+w,y+h))

def paste_shadow(base, im, xy, blur=18, opacity=150):
    x,y = xy
    alpha = im.getchannel("A")
    shadow = Image.new("RGBA", base.size, (0,0,0,0))
    s = Image.new("RGBA", im.size, (0,0,0,opacity))
    s.putalpha(alpha.point(lambda p: p*opacity//255))
    shadow.alpha_composite(s, (x,y+12))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(shadow)
    base.alpha_composite(im, (x,y))

bg = cover(open_rgba("assets/branding/login-chibi-math-world-v1.webp"), W, H)
canvas = bg.copy()

# Cinematic contrast overlays.
overlay = Image.new("RGBA", (W,H), (0,0,0,0))
od = ImageDraw.Draw(overlay)
for y in range(H):
    if y < 380:
        a = int(155 * (1-y/380))
    elif y > 880:
        a = int(185 * ((y-880)/(H-880)))
    else:
        a = 30
    od.line((0,y,W,y), fill=(4,12,27,max(0,min(210,a))))
canvas.alpha_composite(overlay)

# Official logo — exact repository asset, no redraw.
logo = open_rgba("assets/branding/pahlawan-angka-full-logo-v1.png")
logo = contain(logo, 940, 355)
logo_x = (W-logo.width)//2
paste_shadow(canvas, logo, (logo_x, 28), blur=14, opacity=175)

# Exact game character assets.
bunga = contain(open_rgba("assets/heroes/bunga/profile-happy-v1.webp"), 390, 520)
sidma = contain(open_rgba("assets/heroes/sidma/idle.webp"), 350, 430)
wira = contain(open_rgba("assets/heroes/wira-chibi/attack.webp"), 880, 610)
aurora = contain(open_rgba("assets/pets/aurora/front.webp"), 310, 300)

paste_shadow(canvas, bunga, (-5, 405), blur=13, opacity=150)
paste_shadow(canvas, sidma, (W-sidma.width-18, 430), blur=13, opacity=150)
paste_shadow(canvas, wira, ((W-wira.width)//2, 515), blur=18, opacity=175)
paste_shadow(canvas, aurora, (W-aurora.width-22, 850), blur=12, opacity=145)

draw = ImageDraw.Draw(canvas)
font_bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
font_reg = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
f_kicker = ImageFont.truetype(font_bold, 28)
f_title = ImageFont.truetype(font_bold, 44)
f_small = ImageFont.truetype(font_bold, 25)
f_footer = ImageFont.truetype(font_reg, 22)

# Bottom information panel.
panel_y = 1100
panel = Image.new("RGBA", (W-72, 185), (5,18,39,226))
pd = ImageDraw.Draw(panel)
pd.rounded_rectangle((0,0,panel.width-1,panel.height-1), radius=28, fill=(5,18,39,226), outline=(242,195,67,255), width=3)
canvas.alpha_composite(panel, (36,panel_y))

gold=(247,202,82,255)
ice=(126,222,255,255)
white=(255,255,255,255)
muted=(213,229,241,255)

draw.text((70,panel_y+25), "RPG MATEMATIK KSSR", font=f_kicker, fill=ice)
draw.text((70,panel_y+67), "Darjah 1–6 • Belajar melalui misi & battle", font=f_title, fill=white)

chips = [("LATIHAN ADAPTIF",70),("MISI HERO",385),("TEMAN & GANJARAN",625)]
for label,x in chips:
    tw = draw.textlength(label,font=f_small)
    bw = int(tw+48)
    draw.rounded_rectangle((x,panel_y+128,x+bw,panel_y+174),radius=23,fill=gold)
    draw.text((x+24,panel_y+138),label,font=f_small,fill=(8,20,37,255))

draw.text((48,1312),"Untuk murid sekolah rendah Malaysia",font=f_footer,fill=muted)
site="pahlawanangka.netlify.app"
sw=draw.textlength(site,font=f_footer)
draw.text((W-48-sw,1312),site,font=f_footer,fill=gold)

canvas.convert("RGB").save(OUT, "JPEG", quality=92, optimize=True, progressive=True)
print(OUT)
