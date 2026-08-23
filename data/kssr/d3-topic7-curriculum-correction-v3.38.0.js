// Pahlawan Angka v3.38.0 — D3 Topic 7 curriculum identity correction.
// Keeps D3.SHAPE as the persistent compatibility/save key while SHADOW is active.
(function(root){
  'use strict';
  const VERSION='3.38.0';
  const SKILL_ID='D3.SHAPE';
  const TOPIC_ID='D3.T7';
  const LEGACY_TITLE='Bentuk & perimeter asas';
  const TARGET_TITLE='Prisma, Poligon Sekata & Paksi Simetri';
  const STANDARDS=['7.1.1','7.1.2','7.1.3','7.2.1','7.2.2','7.3.1'];
  const COMPETENCIES=[
    'identify_prism',
    'describe_prism_features',
    'classify_prism_vs_non_prism',
    'identify_regular_polygon',
    'create_regular_polygon_pattern',
    'identify_and_draw_symmetry_axis'
  ];

  const status={
    version:VERSION,
    compatibilitySkillId:SKILL_ID,
    curriculumTopicId:TOPIC_ID,
    standards:[...STANDARDS],
    competencies:[...COMPETENCIES],
    applied:false,
    learnerTitleChanged:false,
    legacyStretchRemoved:false,
    reason:null
  };

  try{
    if(typeof META==='undefined'||typeof REC==='undefined'||typeof STR==='undefined'){
      status.reason='graph_bindings_missing';
      root.PAD3Topic7CurriculumCorrection=status;
      return;
    }

    const skill=META[SKILL_ID];
    if(!skill||skill.id!==SKILL_ID||Number(skill.grade)!==3||String(skill.chapter)!=='7'||skill.domain!=='Ruang'){
      status.reason='skill_contract_mismatch';
      root.PAD3Topic7CurriculumCorrection=status;
      return;
    }

    // Do not change the learner-facing title while the bridge is still SHADOW:
    // legacy perimeter questions remain visible until the controlled LIVE phase.
    skill.curriculumTopicId=TOPIC_ID;
    skill.curriculumTopicTitleMs='Bentuk';
    skill.curriculumTargetTitleMs=TARGET_TITLE;
    skill.curriculumStandardIds=[...STANDARDS];
    skill.curriculumCompetencyIds=[...COMPETENCIES];
    skill.saveCompatibilityId=SKILL_ID;
    skill.legacyTitle=skill.title||LEGACY_TITLE;
    skill.legacyQuestionCoverage=['perimeter','missing_side','rectangle_property'];
    skill.legacyQuestionRole='shadow_fallback_only';
    skill.questionSystemTarget='qsv2';
    skill.qsv2PilotTopic=TOPIC_ID;
    skill.qsv2Coverage='six_sp_ready';
    skill.curriculumMappingConfidence='verified-sp';
    skill.masteryCompatibility={
      saveKey:SKILL_ID,
      legacyEvidenceSemantic:'rectangle_perimeter_and_sides',
      curriculumEvidenceSemantic:'d3_topic7_space',
      legacyEvidenceAcceptedForTopic7:false,
      requiresEpochMigrationBeforeLive:true
    };

    // Preserve the Year 2 recovery relation. Suppress only the legacy perimeter
    // stretch that became semantically invalid once D3.SHAPE is identified as
    // the D3 Topic 7 compatibility key.
    if(STR[SKILL_ID]==='D4.PERIM'){
      delete STR[SKILL_ID];
      status.legacyStretchRemoved=true;
    }

    // Add non-operative metadata to the existing mastery profile. We deliberately
    // do not rewrite its title/concepts/evidence thresholds during SHADOW, because
    // old D3.SHAPE evidence is perimeter evidence and must not be silently relabelled.
    const profile=root.PAMasteryKB&&root.PAMasteryKB.profiles&&root.PAMasteryKB.profiles[SKILL_ID];
    if(profile){
      profile.curriculumTarget={
        topicId:TOPIC_ID,
        titleMs:TARGET_TITLE,
        standardIds:[...STANDARDS],
        competencyIds:[...COMPETENCIES]
      };
      profile.evidenceCompatibility={
        legacySemantic:'rectangle_perimeter_and_sides',
        targetSemantic:'d3_topic7_space',
        legacyEvidenceAcceptedForTarget:false,
        requiresEpochMigrationBeforeLive:true
      };
    }

    status.applied=true;
    status.reason='ok';
    status.learnerTitle=skill.title;
    status.curriculumTargetTitle=TARGET_TITLE;
    status.recoveryPreserved=REC[SKILL_ID]||null;
    root.PAD3Topic7CurriculumCorrection=status;
  }catch(err){
    status.reason='exception';
    status.error=String(err&&err.message||err).slice(0,160);
    root.PAD3Topic7CurriculumCorrection=status;
  }
})(typeof globalThis!=='undefined'?globalThis:this);
