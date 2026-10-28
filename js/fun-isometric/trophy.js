// MIT — trophy artwork and motion by Kelvin Adithya. See LICENSE.txt.
import { VIEWS, ring, line, star, rect, spark } from './fun.js';
import { hop, twinkle } from './motions.js';
const LINE=5;const {tilt:FACE,extrude:EXT}=VIEWS.right;
const glow=(parent,p,r,m,extra={})=>({parent,a:p,p,m,...extra,shapes:[{d:spark(p[0],p[1],r),fill:'white'}]});
const CUP = 'M-100 -134L100 -134L100 -108L84 -108C84 -10 48 30 0 34C-48 30 -84 -10 -84 -108L-100 -108Z'

export const trophy       = {
  name: 'trophy',
  frames: 180,
  line: LINE,
  extrude: EXT,
  layers: [
    { id: 'cup', p: [250, 266], m: hop, shapes: [] },
    {
      parent: 'cup',
      tilt: FACE,
      shapes: [
        ...[-1, 1].map((side)        => ({ d: ring(side * 88, -60, 44, 24), fill: 'gold', depth: 0.6 })),
        { d: CUP, fill: 'gold', depth: 1 },
        { d: line([-84, -108], [84, -108]) },
        { d: star(0, -46, 32, 0.46, 5, 4), fill: 'white' },
        { d: rect(-16, 30, 32, 38), fill: 'gold', depth: 1 },
        { d: rect(-76, 64, 152, 56, 12), fill: 'deep', depth: 1 },
        { d: rect(-42, 81, 84, 22, 6), fill: 'white' },
      ],
    },
    glow('cup', [138, -132], 30, twinkle(0, true), { op: 30 }),
    glow('cup', [138, -132], 30, twinkle(54), { ip: 54 }),
    glow('cup', [-150, 20], 18, twinkle(6, true), { op: 36 }),
    glow('cup', [-150, 20], 18, twinkle(62), { ip: 62 }),
  ],
}

