// questions/v2/generators/geometry/kssr-diversity.js
// Phase 2D-3: KSSR-style task variety for D3 Topic 7.
// Pure authored source: no Node/browser globals. Uses structured ids for truth;
// Bahasa Melayu labels are display-only.
(function () {
  'use strict';

  var PRISMS = {
    square_prism: { labelMs:'Prisma Segi Empat Sama', baseShapeId:'square', baseLabelMs:'segi empat sama' },
    rectangular_prism: { labelMs:'Prisma Segi Empat Tepat', baseShapeId:'rectangle', baseLabelMs:'segi empat tepat' },
    triangular_prism: { labelMs:'Prisma Segi Tiga', baseShapeId:'triangle', baseLabelMs:'segi tiga' }
  };
  var PRISM_IDS = Object.keys(PRISMS);

  var NON_PRISMS = {
    cone: { labelMs:'Kon', reasonMs:'Mempunyai permukaan melengkung, satu tapak bulat dan meruncing ke satu titik.' },
    sphere: { labelMs:'Sfera', reasonMs:'Permukaannya melengkung sepenuhnya dan tidak mempunyai dua tapak rata yang sama.' },
    cylinder: { labelMs:'Silinder', reasonMs:'Mempunyai permukaan melengkung walaupun dua tapaknya sama bentuk.' },
    square_pyramid: { labelMs:'Piramid Tapak Segi Empat Sama', reasonMs:'Mempunyai satu tapak dan permukaan sisinya bertemu pada satu puncak.' },
    triangular_pyramid: { labelMs:'Piramid Tapak Segi Tiga', reasonMs:'Mempunyai satu tapak dan permukaan sisinya bertemu pada satu puncak.' }
  };
  var NON_PRISM_IDS = Object.keys(NON_PRISMS);

  var POLYGONS = {
    pentagon: { sides:5, labelMs:'Pentagon Sekata' },
    hexagon: { sides:6, labelMs:'Heksagon Sekata' },
    heptagon: { sides:7, labelMs:'Heptagon Sekata' },
    octagon: { sides:8, labelMs:'Oktagon Sekata' }
  };
  var POLYGON_IDS = Object.keys(POLYGONS);

  // Angles match the canonical geometry2d renderer orientation.
  var SYMMETRY = {
    isosceles_triangle: { labelMs:'segi tiga sama kaki', shapeType:'isosceles_triangle', sides:null, axisAngles:[90], distractorAngles:[0,30,60,120,150] },
    rectangle: { labelMs:'segi empat tepat', shapeType:'rectangle', sides:null, axisAngles:[0,90], distractorAngles:[30,45,60,120,135,150] },
    equilateral_triangle: { labelMs:'segi tiga sama sisi', shapeType:'regular_polygon', sides:3, axisAngles:[30,90,150], distractorAngles:[0,60,120] },
    square: { labelMs:'segi empat sama', shapeType:'regular_polygon', sides:4, axisAngles:[0,45,90,135], distractorAngles:[22.5,67.5,112.5,157.5] },
    regular_pentagon: { labelMs:'pentagon sekata', shapeType:'regular_polygon', sides:5, axisAngles:[18,54,90,126,162], distractorAngles:[0,36,72,108,144] },
    regular_hexagon: { labelMs:'heksagon sekata', shapeType:'regular_polygon', sides:6, axisAngles:[0,30,60,90,120,150], distractorAngles:[15,45,75,105,135,165] }
  };
  var SYMMETRY_IDS = Object.keys(SYMMETRY);

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffle(rng, arr) {
    var out=arr.slice();
    for(var i=out.length-1;i>0;i--){var j=Math.floor(rng()*(i+1)),t=out[i];out[i]=out[j];out[j]=t;}
    return out;
  }
  function sampleUnique(rng, arr, n) { return shuffle(rng, arr).slice(0,n); }
  function choice(id,labelMs,tag){return {id:String(id),labelMs:String(labelMs),misconceptionTag:tag||null};}
  function fp(archetype,answerId,details){return archetype+'::'+String(answerId)+'::'+(details||[]).join(',');}
  function polygonLabel(id){return POLYGONS[id].labelMs;}
  function repeatUnit(unit,length){var out=[];for(var i=0;i<length;i++)out.push(unit[i%unit.length]);return out;}

  // -------------------------------------------------------------------------
  // Prisma: richer property/reasoning evidence using the existing geometry SVG.
  // -------------------------------------------------------------------------
  registerGenerator('geometry.prismKssrDiversity', function(params,rng){
    var mode=(params&&params.mode)||'feature_statement';

    if(mode==='feature_statement'){
      var id=pick(rng,PRISM_IDS),p=PRISMS[id];
      var otherBase=pick(rng,PRISM_IDS.filter(function(x){return PRISMS[x].baseShapeId!==p.baseShapeId;}));
      var ans=choice('correct','Mempunyai 2 tapak berbentuk '+p.baseLabelMs+' yang sama saiz dan selari.');
      var dis=[
        choice('one_base','Mempunyai 1 tapak berbentuk '+p.baseLabelMs+' dan satu puncak.','base_count_confusion'),
        choice('curved','Mempunyai satu permukaan melengkung.','prism_vs_non_prism'),
        choice('wrong_base','Mempunyai 2 tapak berbentuk '+PRISMS[otherBase].baseLabelMs+' yang sama saiz dan selari.','base_shape_confusion')
      ];
      return {
        value:{promptMs:'Pernyataan manakah yang betul tentang prisma ini?',answer:ans,visual:{layout:'single',figures:[{id:'main',solidId:id}]}},
        distractors:shuffle(rng,dis),
        meta:{archetype:'prism_feature_statement',misconceptionTargets:['base_count_confusion','base_shape_confusion','prism_vs_non_prism'],semanticProperties:{solidId:id,baseShapeId:p.baseShapeId,baseCount:2},fingerprint:fp('prism_feature_statement',id,[p.baseShapeId])}
      };
    }

    if(mode==='why_prism'){
      var id2=pick(rng,PRISM_IDS);
      var ans2=choice('two_equal_parallel_bases','Mempunyai 2 tapak yang sama bentuk, sama saiz dan selari serta tiada permukaan melengkung.');
      var dis2=[
        choice('one_base_apex','Mempunyai 1 tapak dan semua permukaan sisi bertemu pada satu puncak.','prism_vs_non_prism'),
        choice('two_round_curved','Mempunyai 2 tapak bulat dan satu permukaan melengkung.','prism_vs_non_prism'),
        choice('fully_curved','Semua permukaannya melengkung.','prism_vs_non_prism')
      ];
      return {
        value:{promptMs:'Mengapakah pepejal di bawah ialah prisma?',answer:ans2,visual:{layout:'single',figures:[{id:'main',solidId:id2}]}},
        distractors:shuffle(rng,dis2),
        meta:{archetype:'explain_why_prism',misconceptionTargets:['prism_vs_non_prism'],semanticProperties:{solidId:id2,criterion:'two_equal_parallel_bases_no_curved_surface'},fingerprint:fp('why_prism',id2,[])}
      };
    }

    if(mode==='why_not_prism'){
      var nId=pick(rng,NON_PRISM_IDS),n=NON_PRISMS[nId];
      var ans3=choice('reason:'+nId,n.reasonMs);
      var dis3=[
        choice('prism_rule','Mempunyai 2 tapak yang sama bentuk, sama saiz dan selari serta tiada permukaan melengkung.','prism_vs_non_prism'),
        choice('flat_no_apex','Semua permukaannya rata dan tidak mempunyai puncak.','prism_vs_non_prism'),
        choice('rectangle_bases','Mempunyai 2 tapak segi empat tepat yang sama saiz.','base_shape_confusion')
      ];
      return {
        value:{promptMs:'Ciri manakah menunjukkan pepejal ini BUKAN prisma?',answer:ans3,visual:{layout:'single',figures:[{id:'main',solidId:nId}]}},
        distractors:shuffle(rng,dis3),
        meta:{archetype:'explain_why_not_prism',misconceptionTargets:['prism_vs_non_prism','base_shape_confusion'],semanticProperties:{solidId:nId,nonPrismReason:n.reasonMs},fingerprint:fp('why_not_prism',nId,[])}
      };
    }

    throw new Error('geometry.prismKssrDiversity: unknown mode "'+mode+'"');
  });

  // -------------------------------------------------------------------------
  // Poligon: textbook-style clue/reasoning + less abstract pattern position.
  // -------------------------------------------------------------------------
  registerGenerator('geometry.polygonKssrDiversity', function(params,rng){
    var mode=(params&&params.mode)||'relative_clue';

    if(mode==='relative_clue'){
      var scenarios=[
        {target:'pentagon',prompt:'Satu poligon sekata mempunyai 1 bucu kurang daripada heksagon. Apakah nama bentuk itu?'},
        {target:'hexagon',prompt:'Satu poligon sekata mempunyai 1 bucu lebih daripada pentagon. Apakah nama bentuk itu?'},
        {target:'heptagon',prompt:'Wong menggunting poligon sekata yang mempunyai 2 bucu lebih daripada pentagon. Apakah nama bentuk itu?'},
        {target:'octagon',prompt:'Satu poligon sekata mempunyai 2 bucu lebih daripada heksagon. Apakah nama bentuk itu?'}
      ];
      var sc=pick(rng,scenarios),ans=choice(sc.target,polygonLabel(sc.target));
      var dis=POLYGON_IDS.filter(function(id){return id!==sc.target;}).map(function(id){return choice(id,polygonLabel(id),'polygon_name_side_count_confusion');});
      return {
        value:{promptMs:sc.prompt,answer:ans,visual:null},distractors:shuffle(rng,dis),
        meta:{archetype:'infer_polygon_from_relative_clue',misconceptionTargets:['polygon_name_side_count_confusion'],semanticProperties:{polygonId:sc.target,sideCount:POLYGONS[sc.target].sides},fingerprint:fp('polygon_relative',sc.target,[sc.prompt])}
      };
    }

    if(mode==='why_regular'){
      var pId=pick(rng,POLYGON_IDS),p=POLYGONS[pId];
      var ans2=choice('regular_rule','Semua sisi lurus sama panjang, semua sudut sama besar dan bentuknya tertutup.');
      var dis2=[
        choice('side_count_only','Mempunyai '+p.sides+' sisi, jadi semua bentuk '+p.sides+' sisi ialah poligon sekata.','regularity_rule_confusion'),
        choice('curved','Mempunyai sekurang-kurangnya satu sisi melengkung.','regularity_rule_confusion'),
        choice('unequal','Panjang sisi-sisinya boleh berbeza asalkan bentuknya tertutup.','regularity_rule_confusion')
      ];
      return {
        value:{promptMs:'Mengapakah bentuk di bawah ialah poligon sekata?',answer:ans2,visual:{kind:'polygon_single',figures:[{id:'main',polygonId:pId,sides:p.sides,regular:true}]}},distractors:shuffle(rng,dis2),
        meta:{archetype:'explain_regular_polygon',misconceptionTargets:['regularity_rule_confusion','polygon_name_side_count_confusion'],semanticProperties:{polygonId:pId,sideCount:p.sides,regular:true},fingerprint:fp('why_regular_polygon',pId,[])}
      };
    }

    if(mode==='pattern_position'){
      var unitLength=rng()<0.55?2:3;
      var unit=sampleUnique(rng,POLYGON_IDS,unitLength);
      var shown=repeatUnit(unit,unit.length*2);
      var targetPos=7+Math.floor(rng()*4); // 7th..10th, one-based
      var expected=unit[(targetPos-1)%unit.length];
      var ans3=choice(expected,polygonLabel(expected));
      var dis3=POLYGON_IDS.filter(function(id){return id!==expected;}).map(function(id){return choice(id,polygonLabel(id),'pattern_position_confusion');});
      return {
        value:{promptMs:'Alya menghias bingkai dengan corak ini. Jika corak diteruskan, bentuk pada tempat ke-'+targetPos+' ialah apa?',answer:ans3,visual:{kind:'polygon_pattern',sequence:shown,showQuestionMark:false}},distractors:shuffle(rng,dis3),
        meta:{archetype:'find_polygon_at_pattern_position',misconceptionTargets:['pattern_position_confusion','pattern_unit_confusion'],semanticProperties:{unit:unit.slice(),shownSequence:shown.slice(),targetPosition:targetPos,expectedNextId:expected},fingerprint:fp('pattern_position',expected,unit.concat([String(targetPos)]))}
      };
    }

    throw new Error('geometry.polygonKssrDiversity: unknown mode "'+mode+'"');
  });

  // -------------------------------------------------------------------------
  // Simetri: folding context + cross-shape axis-count choice.
  // -------------------------------------------------------------------------
  registerGenerator('geometry.symmetryKssrDiversity', function(params,rng){
    var mode=(params&&params.mode)||'fold_card';

    if(mode==='fold_card'){
      var shapeId=pick(rng,SYMMETRY_IDS),shape=SYMMETRY[shapeId];
      var answerAngle=pick(rng,shape.axisAngles);
      var wrongAngles=sampleUnique(rng,shape.distractorAngles,3);
      var mixed=shuffle(rng,[answerAngle].concat(wrongAngles)),letters=['A','B','C','D'];
      var candidates=mixed.map(function(angle,i){return{id:'axis_'+letters[i],labelMs:'Garis '+letters[i],angle:angle};});
      var correct=candidates.filter(function(c){return c.angle===answerAngle;})[0];
      var ans=choice(correct.id,correct.labelMs);
      var dis=candidates.filter(function(c){return c.id!==correct.id;}).map(function(c){return choice(c.id,c.labelMs,'symmetry_axis_orientation_confusion');});
      return {
        value:{promptMs:'Nadia mahu melipat kad ini supaya kedua-dua bahagiannya bertindih tepat. Garis manakah sesuai sebagai garis lipatan?',answer:ans,visual:{kind:'symmetry_candidates',shape:{id:'main',shapeId:shapeId,shapeType:shape.shapeType,sides:shape.sides},candidates:candidates}},distractors:dis,
        meta:{archetype:'choose_fold_line_for_symmetry',misconceptionTargets:['symmetry_axis_orientation_confusion'],semanticProperties:{shapeId:shapeId,axisAngles:shape.axisAngles.slice(),answerAngle:answerAngle,candidateAngles:candidates.map(function(c){return c.angle;})},fingerprint:fp('symmetry_fold',answerAngle,[shapeId].concat(candidates.map(function(c){return String(c.angle);}))) }
      };
    }

    if(mode==='shape_from_axis_count'){
      var targetId=pick(rng,SYMMETRY_IDS),target=SYMMETRY[targetId],targetCount=target.axisAngles.length;
      var uniqueOthers=SYMMETRY_IDS.filter(function(id){return SYMMETRY[id].axisAngles.length!==targetCount;});
      var distractorIds=sampleUnique(rng,uniqueOthers,3);
      var ans2=choice(targetId,target.labelMs);
      var dis2=distractorIds.map(function(id){return choice(id,SYMMETRY[id].labelMs,'symmetry_axis_count_confusion');});
      return {
        value:{promptMs:'Cikgu mahu kad bentuk yang mempunyai tepat '+targetCount+' paksi simetri. Kad bentuk manakah sesuai?',answer:ans2,visual:null},distractors:shuffle(rng,dis2),
        meta:{archetype:'choose_shape_from_axis_count',misconceptionTargets:['symmetry_axis_count_confusion'],semanticProperties:{shapeId:targetId,axisCount:targetCount},fingerprint:fp('symmetry_shape_from_count',targetId,[String(targetCount)].concat(distractorIds))}
      };
    }

    throw new Error('geometry.symmetryKssrDiversity: unknown mode "'+mode+'"');
  });
})();
