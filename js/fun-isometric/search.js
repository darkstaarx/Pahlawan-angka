// MIT — fun-isometric by Kelvin Adithya. See LICENSE.txt.
import {VIEWS,poly,ellipse,ring,arc,spark} from './fun.js';
import {twist,sparkle} from './motions.js';
const LINE=5,EXT=VIEWS.right.extrude;
const glow=(parent,p,r,m,extra={})=>({parent,a:p,p,m,...extra,shapes:[{d:spark(p[0],p[1],r),fill:'white'}]});
export const search       = {
  name: 'search',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'lens', p: [222, 226], m: twist, shapes: [] },
    {
      parent: 'lens',
      tilt: [-20, 28],
      shapes: [
        { d: poly([[54, 90], [90, 54], [178, 142], [142, 178]], [0, 0, 24, 24]), fill: 'hot', depth: 1 },
        { d: poly([[48, 93], [93, 48], [113, 68], [68, 113]], 6), fill: 'grey', depth: 1 },
        { d: ellipse(0, 0, 80), fill: 'white' },
        { d: ring(0, 0, 104, 78), fill: 'main', depth: 1 },
        { d: arc(0, 0, 56, 200, 255) },
      ],
    },
    glow('lens', [30, -26], 22, sparkle(20)),
    glow('lens', [-32, 30], 14, sparkle(96)),
  ],
}
