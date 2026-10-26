// questions/v2/renderers/geometry/polygon-symmetry.js
// Clean-room static SVG renderer for Phase 2A-2 regular polygons, patterns,
// and symmetry-axis tasks. Pure function; no DOM or Node globals.
(function () {
  'use strict';
  // 2.5D palette shared with the Year 1/5/6 scenes (owner 2026-10-26). Shapes get a darker offset
  // under-copy (a raised tile) instead of an extrusion, so symmetry outlines stay exact.
  var STROKE = '#36577a', FILL = '#cfe0f7', SIDE = '#7fa7d6', ACCENT = '#e0752f';
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function rad(d) { return d * Math.PI / 180; }
  function regularPoints(sides, cx, cy, r, rotation) {
    var pts=[]; rotation = rotation == null ? -90 : rotation;
    for (var i=0;i<sides;i++) { var a=rad(rotation + i*360/sides); pts.push([cx+r*Math.cos(a), cy+r*Math.sin(a)]); }
    return pts;
  }
  function pointsAttr(pts) { return pts.map(function(p){return p[0].toFixed(2)+','+p[1].toFixed(2);}).join(' '); }
  function shapeMarkup(shape, cx, cy, r) {
    if (shape.shapeType === 'rectangle') return '<rect x="'+(cx-r+3)+'" y="'+(cy-r*0.62+4)+'" width="'+(2*r)+'" height="'+(1.24*r)+'" rx="2" fill="'+SIDE+'"/><rect x="'+(cx-r)+'" y="'+(cy-r*0.62)+'" width="'+(2*r)+'" height="'+(1.24*r)+'" rx="2" fill="'+FILL+'" stroke="'+STROKE+'" stroke-width="2.2"/>';
    var pts = shape.shapeType === 'isosceles_triangle' ? [[cx,cy-r],[cx-r*0.9,cy+r*0.72],[cx+r*0.9,cy+r*0.72]] : regularPoints(Number(shape.sides || 5),cx,cy,r,-90);
    return tile(pts);
  }
  function tile(pts, attrs) {
    var under = pts.map(function(p){return [p[0]+3,p[1]+4];});
    return '<polygon points="'+pointsAttr(under)+'" fill="'+SIDE+'"/><polygon '+(attrs||'')+'points="'+pointsAttr(pts)+'" fill="'+FILL+'" stroke="'+STROKE+'" stroke-width="2.2" stroke-linejoin="round"/>';
  }
  function panel(w,h) { return '<rect x="1" y="1" width="'+(w-2)+'" height="'+(h-2)+'" rx="14" fill="#f5f9ff" stroke="#d7e3f1"/>'; }
  function polygonMarkup(id, cx, cy, r) {
    var sides = {pentagon:5,hexagon:6,heptagon:7,octagon:8}[id];
    if (!sides) throw new Error('geometry2d renderer: unknown polygon id "'+id+'"');
    return tile(regularPoints(sides,cx,cy,r,-90), 'data-polygon-id="'+esc(id)+'" ');
  }
  function svgOpen(w,h) { return '<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">'+panel(w,h); }
  function lineForAngle(angle,cx,cy,len) {
    var a=rad(angle), dx=Math.cos(a)*len/2, dy=Math.sin(a)*len/2;
    return [cx-dx,cy-dy,cx+dx,cy+dy];
  }
  function renderPolygonSingle(v) {
    var f=v.figures[0]; return '<div class="qsv2-geom2d-single" data-figure-id="'+esc(f.id)+'">'+svgOpen(140,130)+polygonMarkup(f.polygonId,70,65,43)+'</svg></div>';
  }
  function renderPolygonGallery(v) {
    return '<div class="qsv2-geom2d-gallery" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-width:250px;margin:4px auto 10px">'+v.figures.map(function(f,index){return '<div class="qsv2-geom2d-figure" style="position:relative;min-width:0;text-align:center" data-figure-id="'+esc(f.id)+'"><span class="qsv2-choice-marker" aria-hidden="true" style="position:absolute;top:4px;left:6px;z-index:2;font:900 13px/1 sans-serif;background:#fff;border:2px solid '+STROKE+';border-radius:999px;padding:3px 6px;color:'+STROKE+'">'+String.fromCharCode(65+index)+'</span>'+svgOpen(110,105)+polygonMarkup(f.polygonId,55,52,34)+'</svg></div>';}).join('')+'</div>';
  }
  function renderPattern(v) {
    var seq=v.sequence||[], n=seq.length+(v.showQuestionMark?1:0), cell=62, w=Math.max(130,n*cell+12), h=86;
    var body='';
    for(var i=0;i<seq.length;i++) body += '<g data-pattern-index="'+i+'">'+polygonMarkup(seq[i], 38+i*cell, 43, 23)+'</g>';
    if(v.showQuestionMark) body += '<text x="'+(38+seq.length*cell)+'" y="51" text-anchor="middle" style="font:900 28px Nunito,system-ui,sans-serif;fill:#243d5e">?</text>';
    return '<div class="qsv2-geom2d-pattern">'+svgOpen(w,h)+body+'</svg></div>';
  }
  function renderPatternBuilder(v) {
    var slots=v.slots||6, cell=56, w=slots*cell+12, body='';
    for(var i=0;i<slots;i++) body += '<rect data-builder-slot="'+i+'" x="'+(8+i*cell)+'" y="10" width="46" height="46" rx="5" fill="none" stroke="'+STROKE+'" stroke-width="1.8" stroke-dasharray="4 3"/>';
    var unit=(v.unit||[]); for(var j=0;j<unit.length;j++) body += '<g data-unit-index="'+j+'">'+polygonMarkup(unit[j], 30+j*52, 88, 19)+'</g>';
    return '<div class="qsv2-geom2d-builder" data-slots="'+slots+'">'+svgOpen(Math.max(w,unit.length*52+20),116)+body+'</svg></div>';
  }
  function renderSymmetry(v, candidates) {
    var s=v.shape, cx=70,cy=65,r=40,body=shapeMarkup(s,cx,cy,r);
    if(candidates){
      for(var i=0;i<candidates.length;i++){
        var c=candidates[i], L=lineForAngle(c.angle,cx,cy,108);
        body += '<line data-axis-id="'+esc(c.id)+'" data-axis-angle="'+esc(c.angle)+'" x1="'+L[0].toFixed(2)+'" y1="'+L[1].toFixed(2)+'" x2="'+L[2].toFixed(2)+'" y2="'+L[3].toFixed(2)+'" stroke="'+ACCENT+'" stroke-width="2.2" stroke-dasharray="6 4" stroke-linecap="round"/>';
        var lx=cx+Math.cos(rad(c.angle))*52, ly=cy+Math.sin(rad(c.angle))*52;
        body += '<text x="'+lx.toFixed(2)+'" y="'+ly.toFixed(2)+'" style="font:900 12px Nunito,system-ui,sans-serif;fill:#243d5e">'+esc(c.labelMs.replace('Garis ',''))+'</text>';
      }
    }
    return '<div class="qsv2-geom2d-symmetry" data-shape-id="'+esc(s.shapeId)+'">'+svgOpen(140,130)+body+'</svg></div>';
  }
  registerRenderer('geometry2d', function(question, params){
    var v=question&&question.visual; if(!v)return '<div class="qsv2-geom2d-empty"></div>';
    if(v.kind==='polygon_single')return renderPolygonSingle(v);
    if(v.kind==='polygon_gallery')return renderPolygonGallery(v);
    if(v.kind==='polygon_pattern')return renderPattern(v);
    if(v.kind==='polygon_pattern_builder')return renderPatternBuilder(v);
    if(v.kind==='symmetry_shape'||v.kind==='symmetry_draw')return renderSymmetry(v,null);
    if(v.kind==='symmetry_candidates')return renderSymmetry(v,v.candidates||[]);
    throw new Error('geometry2d renderer: unknown visual kind "'+v.kind+'"');
  });
})();
