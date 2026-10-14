"""Rebuild Malaysia Pixel Lite V1 PNG assets. Requires Pillow only.
Every production layer is exported onto a transparent/full-size 480x480 canvas.
Authoring grid is 240x240, exported at 2x nearest-neighbour (pixel sharp).
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math, json, random

ROOT=Path(__file__).resolve().parent
P=ROOT/'assets_png'
P.mkdir(exist_ok=True)
N=240
S=2
C=dict(
 navy='#07142E', navy_deep='#030915', navy_mid='#112D55', skyline='#0C2345',
 sky='#163564', cobalt='#1355AF', blue='#246CC0', red='#E53B48', yellow='#FFCA43',
 cream='#FFF2D7', muted='#7D99BF', cyan='#A8D3FC', grass='#246B60',
 green='#42CC77', wood='#253656', transparent=(0,0,0,0))

def fresh(bg=(0,0,0,0)): return Image.new('RGBA',(N,N),bg)
def save(im,name):
    im.resize((N*S,N*S), Image.Resampling.NEAREST).save(P/name,optimize=True)
    return im

def rect(d, xy, fill, width=1): d.rectangle(xy, fill=fill, width=width)
def clipped_panel(d,bb,color,fill=None,k=5,width=2):
    x1,y1,x2,y2=bb
    points=[(x1+k,y1),(x2-k,y1),(x2,y1+k),(x2,y2-k),(x2-k,y2),(x1+k,y2),(x1,y2-k),(x1,y1+k)]
    if fill: d.polygon(points,fill=fill)
    d.line(points+[points[0]],fill=color,width=width,joint='curve')

def star_points(x,y,rin,rout,count=14):
    return [(round(x+(rout if j%2==0 else rin)*math.cos(-math.pi/2+j*math.pi/count)),
             round(y+(rout if j%2==0 else rin)*math.sin(-math.pi/2+j*math.pi/count))) for j in range(count*2)]

def moon_star(x=117,y=27,sc=1):
    im=fresh()
    d=ImageDraw.Draw(im)
    cx=x-13*sc; cy=y
    d.ellipse((int(cx-16*sc),int(cy-16*sc),int(cx+16*sc),int(cy+16*sc)), fill=C['yellow'])
    # cut transparent hole from crescent; only for separate layer
    d.ellipse((int(cx-10*sc),int(cy-19*sc),int(cx+22*sc),int(cy+13*sc)),fill=(0,0,0,0))
    d.polygon(star_points(int(x+18*sc),int(y-1*sc),int(5*sc),int(13*sc),14),fill=C['yellow'])
    return im

# Background intentionally contains no watch data/date/text.
bg=fresh(C['navy'])
d=ImageDraw.Draw(bg)
for y in range(N):
    t=y/(N-1)
    r=int(7*(1-t)+3*t); g=int(20*(1-t)+10*t); b=int(46*(1-t)+30*t)
    d.line((0,y,N,y),fill=(r,g,b,255))
# atmospheric lower sky, each 1x1 pixel deliberate
rng=random.Random(64)
for i in range(65):
    x=rng.randrange(18,222); y=rng.randrange(11,152)
    if (x-120)**2+(y-120)**2>99**2: continue
    color=rng.choice([C['muted'],C['navy_mid'],C['navy_mid'],C['yellow']])
    d.point((x,y), fill=color)
# restrained low contrast horizon
for j in range(0,240,15):
    x=j+rng.randint(-5,4)
    h=rng.randint(12,33)
    d.rectangle((x,152-h,x+9,164),fill='#0B1D3A')
    if rng.random()<0.5:
        d.rectangle((x+3,151-h,x+5,158),fill='#102B50')
save(bg,'00_bg_night.png')

# symbolic crescent and 14-point star
m=moon_star(); save(m,'01_moon_star.png')

# modest handful of stars, no loop animations baked
stars=fresh(); ds=ImageDraw.Draw(stars)
for x,y,c in [(46,32,C['yellow']),(70,21,C['muted']),(170,25,C['yellow']),
              (188,44,C['muted']),(33,70,C['muted']),(206,79,C['muted']),
              (67,76,C['yellow']),(180,68,C['yellow'])]:
    ds.point((x,y), fill=c)
    if c==C['yellow']: ds.line((x-2,y,x+2,y),fill=c);ds.line((x,y-2,x,y+2),fill=c)
save(stars,'02_star_speckles.png')

# tiny Petronas tower silhouette on the right, de-emphasised relative to time
sky=fresh(); ds=ImageDraw.Draw(sky)
base=170
for xc in [184,206]:
    ds.polygon([(xc-9,base),(xc-8,base-25),(xc-5,base-25),(xc-5,base-43),
                (xc-3,base-43),(xc-3,base-55),(xc-1,base-55),(xc-1,base-62),
                (xc+1,base-62),(xc+1,base-55),(xc+3,base-55),(xc+3,base-43),
                (xc+5,base-43),(xc+5,base-25),(xc+8,base-25),(xc+9,base)],fill='#122F57')
    # Window dots for visual texture, very low contrast
    for yy in range(base-48,base-5,5):
        ww=3 if yy<base-32 else 5
        for xx in range(xc-ww,xc+ww+1,3):
            if (xx+yy)%4 != 0: ds.point((xx,yy),fill='#4D6F89')
# skybridge between tower centers
rect(ds,(193,138,197,141),'#43648B')
# lower skyline, no water/crowded landmarks
for a,b,c,h in [(150,171,164,20),(163,176,171,31),(214,176,226,37)]:
    rect(ds,(a,b-h,c,b),'#0F2949')
save(sky,'03_kl_silhouette.png')

# geometric hearts with flag colors. Each heart pixel-based, 24x22 at real 240 scale.
def heart_layer(x,y,pattern):
    pic=fresh(); dd=ImageDraw.Draw(pic)
    rows=['  XXXX   XXXX  ',
          ' XXXXXX XXXXXX ',
          'XXXXXXXXXXXXXXX',
          'XXXXXXXXXXXXXXX',
          ' XXXXXXXXXXXXX ',
          '  XXXXXXXXXXX  ',
          '   XXXXXXXXX   ',
          '    XXXXXXX    ',
          '     XXXXX     ',
          '      XXX      ',
          '       X       ']
    # scale 2 per bitmap 'pixel'
    for ry,row in enumerate(rows):
        for rx,val in enumerate(row):
            if val!='X': continue
            px=x+rx*2;py=y+ry*2
            if pattern=='stripes': col=C['cream'] if ry%3==0 or ry%3==1 else C['red']
            else: col=C['blue']
            dd.rectangle((px,py,px+1,py+1),fill=col)
    # outline handdraw around heart silhouette by dilation mask
    a=pic.getchannel('A')
    from PIL import ImageFilter
    dil=a.filter(ImageFilter.MaxFilter(5))
    border=Image.new('RGBA',pic.size,C['navy_deep']);border.putalpha(dil)
    border.alpha_composite(pic)
    dd=ImageDraw.Draw(border)
    if pattern=='blue':
        dd.arc((x+6,y+6,x+18,y+18),80,290,fill=C['yellow'],width=2)
        dd.polygon(star_points(x+20,y+12,1.5,4,8),fill=C['yellow'])
    return border
hb=heart_layer(96,139,'blue');save(hb,'04_heart_blue.png')
hr=heart_layer(126,139,'stripes');save(hr,'05_heart_stripes.png')

# three complication frames
frames=fresh();fd=ImageDraw.Draw(frames)
boxes=[(25,172,85,211),(90,172,150,211),(155,172,215,211)]
for bb in boxes: clipped_panel(fd,bb,'#4A729D',fill='#08172F',k=6,width=2)
save(frames,'06_complication_frames.png')

# Pixel icons, all independent layers; positions are absolute.
steps=fresh();di=ImageDraw.Draw(steps)
# Footsteps
for dx,dy in [(50,181),(59,187)]:
    di.rectangle((dx-3,dy-1,dx+1,dy+5),fill=C['yellow'])
    di.rectangle((dx-3,dy-4,dx-1,dy-2),fill=C['yellow'])
    di.rectangle((dx,dy-5,dx+1,dy-3),fill=C['yellow'])
save(steps,'07_icon_steps.png')

battery=fresh();di=ImageDraw.Draw(battery)
di.rectangle((112,181,129,190),outline=C['cream'],width=2)
di.rectangle((130,184,132,187),fill=C['cream'])
for x in (115,119,123): di.rectangle((x,184,x+2,187),fill=C['green'])
save(battery,'08_icon_battery.png')

weather=fresh();di=ImageDraw.Draw(weather)
# Sun and cloud
x=183;y=185
di.ellipse((x-2,y-7,x+6,y+1),fill=C['yellow'])
di.line((x+2,y-10,x+2,y-8),fill=C['yellow'])
di.line((x+7,y-6,x+9,y-8),fill=C['yellow'])
di.ellipse((x-3,y-2,x+5,y+5),fill=C['cream'])
di.ellipse((x+3,y-4,x+11,y+5),fill=C['cream'])
di.rectangle((x-3,y+1,x+11,y+5),fill=C['cream'])
save(weather,'09_icon_weather.png')

# Minimal hibiscus as an individual small bottom flourish
hib=fresh();hd=ImageDraw.Draw(hib)
cx,cy=120,224
for angle in [0,72,144,216,288]:
    px=cx+6*math.cos(math.radians(angle));py=cy+6*math.sin(math.radians(angle))
    hd.ellipse((int(px-5),int(py-5),int(px+5),int(py+5)),fill=C['red'])
hd.ellipse((cx-2,cy-2,cx+2,cy+2),fill=C['yellow'])
hd.line((cx+1,cy-2,cx+7,cy-11),fill=C['yellow'],width=1)
hd.ellipse((cx+6,cy-12,cx+8,cy-10),fill=C['yellow'])
hd.polygon([(107,231),(115,232),(112,236)],fill=C['grass'])
hd.polygon([(128,232),(133,233),(131,236)],fill=C['grass'])
save(hib,'10_hibiscus_small.png')

# thin and optional flag inspired side arcs, softer than mockup's thick borders
ribbon=fresh();rd=ImageDraw.Draw(ribbon)
for xx,yy in [(40,216),(48,219),(56,221),(64,223),(72,225),
              (168,225),(176,223),(184,221),(192,219),(200,216)]:
    rd.rectangle((xx-4,yy,xx+4,yy+1),fill=C['red'])
    rd.rectangle((xx-4,yy+2,xx+4,yy+3),fill=C['cream'])
save(ribbon,'11_flag_arcs_optional.png')

# AOD asset (no clock numerals pre-rendered)
aod=fresh(C['navy_deep']);save(aod,'12_aod_bg.png')
aodflag=moon_star(x=120,y=64,sc=.62);save(aodflag,'13_aod_moon_star_optional.png')

# demo bitmap font: preview only; DON'T export as runtime static text
GLYPHS={
'0':["11111","10001","10011","10101","11001","10001","11111"],
'1':["00100","01100","00100","00100","00100","00100","01110"],
'2':["11111","00001","00001","11111","10000","10000","11111"],
'3':["11111","00001","00001","01111","00001","00001","11111"],
'4':["10001","10001","10001","11111","00001","00001","00001"],
'5':["11111","10000","10000","11111","00001","00001","11111"],
'6':["11111","10000","10000","11111","10001","10001","11111"],
'7':["11111","00001","00010","00100","01000","01000","01000"],
'8':["11111","10001","10001","11111","10001","10001","11111"],
'9':["11111","10001","10001","11111","00001","00001","11111"],
':':["00000","00100","00100","00000","00100","00100","00000"],
',':["00000","00000","00000","00000","00000","00100","01000"],
'%':["11001","11010","00100","00100","01011","10011","00000"],
'.':["00000","00000","00000","00000","00000","00100","00100"],
' ':["00000"]*7,
'A':["01110","10001","10001","11111","10001","10001","10001"],
'B':["11110","10001","10001","11110","10001","10001","11110"],
'C':["01111","10000","10000","10000","10000","10000","01111"],
'D':["11110","10001","10001","10001","10001","10001","11110"],
'E':["11111","10000","10000","11110","10000","10000","11111"],
'F':["11111","10000","10000","11110","10000","10000","10000"],
'G':["01111","10000","10000","10111","10001","10001","01111"],
'H':["10001","10001","10001","11111","10001","10001","10001"],
'I':["11111","00100","00100","00100","00100","00100","11111"],
'J':["00111","00010","00010","00010","10010","10010","01100"],
'K':["10001","10010","10100","11000","10100","10010","10001"],
'L':["10000","10000","10000","10000","10000","10000","11111"],
'M':["10001","11011","10101","10101","10001","10001","10001"],
'N':["10001","11001","10101","10011","10001","10001","10001"],
'O':["01110","10001","10001","10001","10001","10001","01110"],
'P':["11110","10001","10001","11110","10000","10000","10000"],
'Q':["01110","10001","10001","10001","10101","10010","01101"],
'R':["11110","10001","10001","11110","10100","10010","10001"],
'S':["01111","10000","10000","01110","00001","00001","11110"],
'T':["11111","00100","00100","00100","00100","00100","00100"],
'U':["10001","10001","10001","10001","10001","10001","01110"],
'V':["10001","10001","10001","10001","10001","01010","00100"],
'W':["10001","10001","10001","10101","10101","10101","01010"],
'X':["10001","10001","01010","00100","01010","10001","10001"],
'Y':["10001","10001","01010","00100","00100","00100","00100"],
'Z':["11111","00001","00010","00100","01000","10000","11111"],
'-':["00000","00000","00000","11111","00000","00000","00000"]
}

def pixel_text(im,st,cx,y,s,color,shadow=False):
    st=st.upper(); glyphwidth=6*s
    w=max(0,len(st)*glyphwidth-s); x=int(cx-w/2)
    dr=ImageDraw.Draw(im)
    for i,ch in enumerate(st):
        g=GLYPHS.get(ch,GLYPHS[' ']); ox=x+i*glyphwidth
        for yy,row in enumerate(g):
            for xx,v in enumerate(row):
                if v!='1':continue
                if shadow: dr.rectangle((ox+xx*s+2,y+yy*s+2,ox+(xx+1)*s+1,y+(yy+1)*s+1),fill=C['navy_deep'])
                dr.rectangle((ox+xx*s,y+yy*s,ox+(xx+1)*s-1,y+(yy+1)*s-1),fill=color)
    return w

layers=[bg,m,stars,sky,hb,hr,frames,steps,battery,weather,hib,ribbon]
preview=fresh()
for layer in layers: preview.alpha_composite(layer)
# actual text placeholder positions must be replaced at runtime
pixel_text(preview,'TUE 14 OCT',120,63,2,C['cream'])
pixel_text(preview,'10:08',120,87,5,C['cream'],True)
pixel_text(preview,'AM',203,120,1,C['muted'])
pixel_text(preview,'7842',55,196,2,C['cream'])
pixel_text(preview,'86%',120,196,2,C['cream'])
pixel_text(preview,'28C',185,196,2,C['cream'])
# round clip and transparent outside, using display circle sample
mask=Image.new('L',(N,N),0)
ImageDraw.Draw(mask).ellipse((2,2,237,237),fill=255)
preview.putalpha(mask)
# Save preview on transparent canvas and on dark background
save(preview,'../preview_face_only.png')
face=preview.resize((480,480),Image.Resampling.NEAREST)
board=Image.new('RGB',(720,720),'#10141D')
from PIL import ImageOps
x0=y0=120
D=ImageDraw.Draw(board)
D.ellipse((x0-10,y0-10,x0+490,y0+490),fill='#020407',outline='#4A5260',width=9)
D.ellipse((x0-3,y0-3,x0+483,y0+483),outline='#121C2E',width=4)
board.paste(face,(x0,y0),face)
# Tiny title and subtitle on promotional canvas
font='/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'
font_b='/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf'
D.text((360,38),'MALAYSIA PIXEL · LITE',font=ImageFont.truetype(font_b,22),anchor='mm',fill='#FFF2D7')
D.text((360,672),'V1 LAYERED ASSET PROTOTYPE',font=ImageFont.truetype(font,17),anchor='mm',fill='#8BA7C8')
board.save(ROOT/'preview_showcase.png',optimize=True)

# safe-zone wireframe image
safe=Image.new('RGB',(480,480),C['navy'])
D=ImageDraw.Draw(safe)
D.ellipse((2,2,477,477),outline='#5C7695',width=2)
D.ellipse((36,36,444,444),outline='#36BB91',width=2)
for k,box,col in [('date',(70,115,410,150),'#f5c842'),('time',(58,160,422,247),'#f5c842'),('hearts',(175,267,312,334),'#36bb91'),('data',(44,342,434,428),'#62a9ee')]:
    D.rectangle(box,outline=col,width=2)
    D.text((box[0]+4,box[1]+4),k,fill=col,font=ImageFont.truetype(font,12))
safe.save(ROOT/'layout_wireframe.png',optimize=True)

# JSON spec is deliberately editor neutral. All coordinates 480x480.
layout={
 'project':'Malaysia Pixel Lite V1','canvas_px':[480,480],'source_grid_px':[240,240],
 'rendering':'nearest-neighbor (pixel art), no smoothing for pixel layers',
 'screen':'round AMOLED Wear OS watch face','test_time':'10:08','safe_circle':{'center':[240,240],'radius':204},
 'asset_rule':'Each PNG 480x480. Place at x=0,y=0 in listed z-order. Transparency already baked; time/data values are NOT in PNG.',
 'layers_order':[x for x in ['00_bg_night.png','01_moon_star.png','02_star_speckles.png','03_kl_silhouette.png',
  '04_heart_blue.png','05_heart_stripes.png','06_complication_frames.png','07_icon_steps.png',
  '08_icon_battery.png','09_icon_weather.png','10_hibiscus_small.png','11_flag_arcs_optional.png']],
 'dynamic_regions': {
 'date':{'center':[240,138],'bbox':[90,122,390,155],'kind':'system-date','example':'TUE 14 OCT'},
 'time':{'center':[240,211],'bbox':[65,167,416,248],'kind':'system-time','example':'10:08'},
 'ampm':{'bbox':[386,230,425,255],'kind':'optional system AM/PM'},
 'steps':{'bbox':[62,390,160,422],'kind':'steps metric when supported','example':'7842'},
 'battery':{'bbox':[194,390,290,422],'kind':'watch battery metric','example':'86%'},
 'weather':{'bbox':[322,390,430,422],'kind':'optional user-selected weather complication','example':'28C'}
 },
 'customization':{'optional_layers':['02_star_speckles.png','03_kl_silhouette.png','11_flag_arcs_optional.png'],
   'widgets':'If user-configurable complications overlap any fixed asset icon/label, hide those icons or remove panels in that variant.'},
 'aod':{'base':'12_aod_bg.png','optional_motif':'13_aod_moon_star_optional.png','dynamic':'display time only','no_animations':True},
 'constraints':['Never use example date/time/numbers as final fixed text.',
 'Preview is an illustration, not an installable watch face.',
 'Run watch face on Wear OS emulator and test complication permissions and pixel burn-in/AOD limits.']
}
(ROOT/'layout.json').write_text(json.dumps(layout,indent=2),encoding='utf-8')
print('Produced',len(list(P.glob('*.png'))),'layer PNG files; preview:',ROOT/'preview_showcase.png')
