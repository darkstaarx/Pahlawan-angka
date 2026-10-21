/* Pahlawan Angka — "Kemungkinan punca" tags for Darjah 2–5 (Focus Diagnosis v2,
   docs/PA-DIAGNOSTIC-BRAIN.md §8a). Authored per archetype, like the D1/D6 runtimes:
   each live archetype names the foundations it needs (data/focus-v2/foundation-map-v1.json),
   never inferred from answers. js/engine/focus-foundation-v1.js reads them from the
   learner-review ledger and names a foundation that keeps failing across topics.
   Topics with no foundation in the map (shapes, position, coordinates), estimating a
   set against a reference, notation words and pure vocabulary (currency names, needs
   and wants) stay untagged: they are listed in ABSTAIN, never a silent gap.
   Also tags the short/long wording items (js/engine/reading-pairs-v1.js) for D3–D6.
   Entry: [contextDomain, operation steps, foundationIds, conceptIds, diagnosticFamily?] */
(function(root){
'use strict';
const VERSION='1.0.0',TAG_REVISION='d2-d5-authored-v1';
// Foundations, short names.
const PVF='number.place_value',DPF='number.decimal_place_value',CH='operation.choose',
 AC='add.combine',AF='add.facts',AP='add.place_value',SC='sub.take_away_compare',SF='sub.facts',SP='sub.place_value',
 MG='mul.equal_groups',MF='mul.facts',MM='mul.multidigit',DS='div.equal_sharing',DF='div.facts',DG='div.regroup',DR='div.remainder',DM='div.multidigit',DD='div.decimal',
 RS='money.ringgit_sen',TX='money.transaction',MS='money.equal_sharing_application',MD='money.discount',
 PC='percent.part_whole',FR='fraction.equal_parts',TU='time.units',MU='measurement.units',RR='ratio.relationship',DT='data.reading';
const PV=['number','',[PVF],[PVF]],PAT=['number','addition',[PVF,AP],[PVF]],DPV=['number','',[DPF],[DPF]],
 FRAC=['fraction','',[FR],[FR]],TIME=['time','',[TU],[TU]],MEAS=['measurement','',[MU],[MU]],DATA=['data','',[DT],[DT]],PCT=['percent','',[PC],[PC]];
const fr=(ops,...f)=>['fraction',ops,[FR,...f],[FR]],dec=(ops,...f)=>['number',ops,[DPF,...f],[DPF]],money=(ops,...f)=>['money',ops,f,[RS]],
 time=(ops,...f)=>['time',ops,[TU,...f],[TU]],meas=(ops,...f)=>['measurement',ops,[MU,...f],[MU]],data=(ops,...f)=>['data',ops,[DT,...f],[DT]],
 pct=(ops,...f)=>['percent',ops,[PC,...f],[PC]],ratio=(ops,...f)=>['ratio',ops,[RR,...f],[RR]],op=(ops,...f)=>['operations',ops,f,[]];
const FRAC_DEC_PCT=['fraction','',[FR,DPF,PC],[FR]];

/* Shared by archetype name: the D3 question system (qsv2) uses one name for the same task
   in several skills, and the short/long wording items are the same in every grade. */
const SHARED={
 // Short/long wordings (lens 4.8).
 reading_jumlah:op('addition',CH,AC,AP),reading_beza:op('subtraction',CH,SC,SP),reading_kali_ganda:op('multiplication',CH,MG,MM),
 reading_agih:op('division',CH,DS,DG),reading_wang_jumlah:money('addition',TX,CH,AP),reading_wang_baki:money('subtraction',TX,CH,SP),
 // D3 numbers.
 find_incorrect_pattern_term:PAT,predict_next_place_value_step:PAT,complete_missing_pattern_term:PAT,recognize_descending_place_value_pattern:PAT,
 choose_pattern_rule:PAT,identify_pattern_step:PAT,order_three_numbers:PV,compare_number_statements:PV,explain_comparison_by_place_value:PV,
 number_words_to_numeral:PV,place_value_model_to_number:PV,identify_digit_value:PV,missing_place_value:PV,
 explain_nearest_thousand:PV,round_number_symbolically:PV,round_on_number_line:PV,
 // D3 tambah / tolak.
 direct_addition_fluency:op('addition',AP),direct_subtraction_fluency:op('subtraction',SP),missing_addend_fluency:op('subtraction',AP,SP),
 direct_two_step_fluency:op('addition,subtraction',AP,SP),word_problem_missing_part:op('subtraction',CH,SC),choose_operation_from_context:op('',CH),
 choose_expression_for_two_step:op('addition,subtraction',CH),mixed_add_then_subtract:op('addition,subtraction',CH,AP,SP),mixed_subtract_then_add:op('subtraction,addition',CH,SP,AP),
 // D3 darab / bahagi.
 inverse_missing_factor:op('division',DF,MF),
 // D3 pecahan, perpuluhan, peratus.
 simplify_fraction_from_area:fr('division',DF),simplify_fraction_direct:fr('division',DF),identify_common_factor_for_simplification:fr('division',DF),
 convert_improper_to_mixed:fr('division',DR),convert_mixed_to_improper:fr('multiplication,addition',MF),identify_mixed_number_from_picture:FRAC,
 equivalent_fraction_area:fr('multiplication',MF),equivalent_fraction_missing_number:fr('multiplication',MF),equivalent_fraction_symbolic:fr('multiplication',MF),
 add_proper_fractions:fr('addition',MF),subtract_proper_fractions:fr('subtraction',MF),fraction_operation_context:fr('addition,subtraction',CH,MF),
 hundred_grid_fraction_decimal_percent:FRAC_DEC_PCT,find_non_equivalent_representation:FRAC_DEC_PCT,match_fraction_decimal_percent:FRAC_DEC_PCT,
 decimal_place_value_from_hundredths:DPV,hundred_grid_to_decimal:dec('',FR),hundredths_to_decimal:dec('',FR),
 add_decimals_hundredths:dec('addition',AP),subtract_decimals_hundredths:dec('subtraction',SP),missing_addend_decimal:dec('subtraction',SP),
 select_largest_decimal:DPV,compare_decimal_pair:DPV,compare_decimals_number_line:DPV,
 infer_unshaded_percent:pct('subtraction',SF),number_out_of_100_to_percent:PCT,hundred_grid_to_percent:PCT,percent_to_shaded_count:PCT,
 // D3 wang.
 divide_money_equally:money('division',MS,DG),find_unit_price_from_total:money('division',MS,DPF),purchase_then_find_change:money('addition,subtraction',TX,AP,SP),
 compare_two_money_totals:money('addition,subtraction',RS,AP),multiply_equal_item_prices:money('multiplication',RS,MM),subtract_money_from_budget:money('subtraction',TX,SP),
 track_budget_with_mixed_changes:money('subtraction,addition',TX,CH,SP),identify_correct_mixed_money_result:money('subtraction,addition',TX,CH,SP),add_multiple_money_values:money('addition',RS,AP),
 // D3 masa.
 convert_hours_to_minutes:time('multiplication',MF),convert_minutes_to_seconds:time('multiplication',MF),convert_minutes_to_hours_minutes:time('division',DR),
 choose_expression_for_time_problem:time('subtraction,addition',CH),read_activity_schedule:TIME,read_analogue_clock:TIME,read_calendar_date:TIME,
 divide_time_duration:time('division',DF),divide_then_multiply_time:time('division,multiplication',DF),subtract_time_values:time('subtraction',SP),
 two_step_time_schedule:time('addition',CH),add_time_values:time('addition',AP),mixed_time_adjustment:time('subtraction,addition',CH),
 multiply_time_duration:time('multiplication',MF),find_time_difference:time('subtraction'),
 // D3 ukuran.
 kilograms_to_grams:meas('multiplication',PVF),metres_to_centimetres:meas('multiplication',PVF),litres_to_millilitres:meas('multiplication',PVF),
 millilitres_to_mixed_litres:meas('division',PVF),grams_to_mixed_kilograms:meas('division',PVF),centimetres_to_mixed_metres:meas('division',PVF),
 choose_equivalent_volume:MEAS,choose_equivalent_mass:MEAS,choose_equivalent_length:MEAS,
 find_missing_mass:meas('subtraction',CH,SP),find_missing_length:meas('subtraction',CH,SP),find_missing_liquid_volume:meas('subtraction',CH,SP),
 add_liquid_volumes:meas('addition',AP),add_length_values:meas('addition',AP),add_mass_values:meas('addition',AP),
 subtract_mass_values:meas('subtraction',SP),subtract_liquid_volumes:meas('subtraction',SP),subtract_length_values:meas('subtraction',SP),
 divide_mass:meas('division',DS),divide_liquid_volume:meas('division',DS),divide_length:meas('division',DS),
 inverse_liquid_volume_factor:meas('division',DF),inverse_mass_factor:meas('division',DF),inverse_length_factor:meas('division',DF),
 multiply_length:meas('multiplication',MF),multiply_mass:meas('multiplication',MF),multiply_liquid_volume:meas('multiplication',MF),
 // D3 data.
 relate_pictograph_to_bar:DATA,compare_chart_representations:DATA,identify_largest_pie_category:DATA,classify_and_count_items:DATA,
 interpret_organized_table:DATA,count_from_tally:DATA,derive_count_from_pie:DATA,relate_bar_to_pie:data('',FR),compare_pie_categories:data('subtraction',SF)
};

/* Per skill: archetype names reused with a different meaning (e.g. depth_story). */
const ADD_STORY=op('addition',CH,AC,AP),SUB_STORY=op('subtraction',CH,SC,SP);
const BY_SKILL={
 'D2.1.1':{native_compare:PV,native_missing:PV,native_place:PV},
 'D2.1.2':{number_to_words:PV,expanded_to_number:PV,words_to_number:PV},
 'D2.1.3':{missing_end:PAT,missing_beginning:PAT,missing_middle:PAT},
 'D2.1.4':{digit_value:PV,compose:PV,missing_part:PV,place_name:PV,expanded:PV},
 'D2.1.6':{round_ten:PV,missing_source:PV,round_hundred:PV},
 'D2.1.7':{determine_direction:PAT,apply_rule:PAT,identify_rule:PAT},
 'D2.1.8':{join:['number','addition',[CH,AC,AP],[]],separate:['number','subtraction',[CH,SC,SP],[]],difference:['number','subtraction',[CH,SC,SP],[]]},
 'D2.2.1':{integrity_add_two:op('addition',AF,AP),integrity_add_three:op('addition',AF,AP)},
 'D2.2.2':{integrity_sub_one:op('subtraction',SF,SP),integrity_sub_two:op('subtraction',SF,SP)},
 'D2.2.3':{integrity_mul_groups:['operations','multiplication',[MG],[MG]],integrity_mul10:op('multiplication',MF,PVF),integrity_mul_fact:op('multiplication',MF)},
 'D2.2.5':{integrity_problem_mul:op('multiplication',CH,MG),integrity_problem_sub:op('subtraction',CH,SC,SP),integrity_problem_add:op('addition',CH,AC,AP),integrity_problem_div:op('division',CH,DS)},
 'D2.3.1':{bar_model:FRAC,verbal_part:FRAC,missing_part:fr('addition'),object_set:FRAC,compare_model:FRAC},
 'D2.3.2':{integrity_number_line:DPV},
 'D2.3.3':{visual_match:dec('',FR),decimal_to_fraction:dec('',FR),matching_pair:dec('',FR),mixed_compare:dec('',FR)},
 'D2.3.4':{coloured_card:fr('',DPF),ribbon_compare:dec('',FR),remaining_part:fr('subtraction',SF),filled_bottle:fr('',DPF)},
 'D2.4.3':{integrity_money_sub_calculate:money('subtraction',RS,SP),integrity_money_sub_three_values:money('subtraction',RS,SP)},
 'D2.4.4':{integrity_money_mul_calculate:money('multiplication',RS,MF),integrity_money_mul_story:money('multiplication',RS,MG,CH)},
 'D2.4.6':{integrity_money_saving_saving:money('subtraction',TX,SP),integrity_money_saving_balance:money('subtraction',TX,SP)},
 'D2.4.7':{integrity_money_problem_story:money('addition',TX,CH,AP),integrity_money_problem_balance:money('subtraction',TX,CH,SP)},
 'D2.5.1':{integrity_read_clock:TIME},
 'D2.5.2':{integrity_minute_hour:time('division',DF),integrity_hour_minute_mix:time('multiplication,addition',MF),integrity_week_day:time('multiplication',MF),
  integrity_day_hour:TIME,integrity_hour_minute:TIME},
 'D2.5.3':{integrity_elapsed_time:time('addition')},
 'D2.6.1':{integrity_unit_length:MEAS,integrity_compare_length:MEAS,integrity_read_ruler:MEAS},
 'D2.6.2':{integrity_read_scale:MEAS,integrity_compare_mass:MEAS,integrity_unit_mass:MEAS},
 'D2.6.3':{integrity_read_jug:MEAS,integrity_compare_volume:MEAS,integrity_unit_volume:MEAS},
 'D2.6.4':{integrity_measure_problem:meas('addition,subtraction',CH)},
 'D2.8.1':{integrity_tally_data:DATA},
 'D2.8.2':{integrity_bar_read:DATA,integrity_bar_compare:DATA},
 'D2.8.3':{integrity_data_difference:data('subtraction',SF),integrity_data_sum:data('addition',AF),integrity_data_two_step:data('subtraction',SF)},
 'D3.ADD10000':{word_problem_result:ADD_STORY},
 'D3.SUB10000':{word_problem_result:SUB_STORY},
 'D3.MUL':{multiply_divide_one_digit:op('multiplication',MF,MM),multiply_divide_powers10:['operations','multiplication',[PVF,MF],[PVF]]},
 'D3.DIV':{multiply_divide_one_digit:op('division',DF,DG),multiply_divide_powers10:['operations','division',[PVF,DF],[PVF]]},
 'D4.N100000':{words:PV,round:PV,depth_round:PV,compare:PV,order:PV,clues:PV,depth_sequence:PAT,sequence:PAT},
 'D4.PV100000':{digit_value:PV,compose:PV,missing_part:PV,place_name:PV,depth_missing:PV,expanded:PV},
 'D4.ADD':{depth_symbolic:op('addition',AF,AP),depth_three_step:op('addition',AF,AP),depth_missing:op('subtraction',AP,SP),depth_story:ADD_STORY},
 'D4.SUB':{depth_symbolic:op('subtraction',SF,SP),depth_three_step:op('subtraction',SF,SP),depth_missing:op('subtraction',SP,AP),depth_story:SUB_STORY},
 'D4.MUL':{depth_two_by_one:op('multiplication',MF,MM),depth_multi_story:op('multiplication',CH,MG,MM),depth_estimate:op('multiplication',PVF,MF),depth_missing:op('division',DF,MF)},
 'D4.DIV':{depth_exact:op('division',DF,DG),depth_story:op('division',CH,DS,DG),depth_missing:op('division',DF,MF),depth_remainder:op('division',DF,DR)},
 'D4.FRAC':{fraction_subtract:fr('subtraction',SF),fraction_quantity:fr('division,multiplication',DF,MF),fraction_add_three:fr('addition',AF),
  mixed_to_improper:fr('multiplication,addition',MF),fraction_combined:fr('addition,subtraction',AF,SF),improper_to_mixed:fr('division',DR)},
 'D4.DEC':{decimal_divide:dec('division',DD),decimal_add_three:dec('addition',AP),decimal_subtract_two:dec('subtraction',SP),decimal_multiply:dec('multiplication',MM)},
 'D4.MONEY':{money_budget_record:money('multiplication,subtraction',TX,CH,MF),money_add_three:money('addition',RS,AP),money_mixed_mul_div:money('multiplication,division',RS,MF,DF),
  money_divide:money('division',MS,DG),money_multiply:money('multiplication',RS,MM),money_combined:money('addition,subtraction',RS,AP,SP),money_subtract_two:money('subtraction',RS,SP),
  money_record_saving:money('subtraction',TX,CH,SP),money_needs_wants:money('subtraction',TX,CH,SP),money_record:money('subtraction',TX,CH,SP),
  money_record_income:money('addition',TX,CH,AP),money_currency_rate:ratio('multiplication',MF)},
 'D4.TIME':{time_relationship:TIME,time_operation:time('addition,subtraction',AP,SP),time_estimate:TIME,time_duration:time('subtraction'),time_24h:TIME},
 'D4.MEASURE':{panjang_convert:meas('multiplication',PVF),jisim_convert:meas('multiplication',PVF),'isi padu cecair_convert':meas('multiplication',PVF),
  panjang_add:meas('addition',AP),jisim_add:meas('addition',AP),'isi padu cecair_add':meas('addition',AP),
  panjang_subtract:meas('subtraction',SP),jisim_subtract:meas('subtraction',SP),'isi padu cecair_subtract':meas('subtraction',SP),
  panjang_combined:meas('addition,subtraction',AP,SP),jisim_combined:meas('addition,subtraction',AP,SP),'isi padu cecair_combined':meas('addition,subtraction',AP,SP),
  panjang_missing:meas('division',DS),jisim_missing:meas('division',DS),'isi padu cecair_missing':meas('division',DS),
  panjang_divide:meas('division',DS),jisim_divide:meas('division',DS),'isi padu cecair_divide':meas('division',DS),
  panjang_multiply:meas('multiplication',MF),jisim_multiply:meas('multiplication',MF),'isi padu cecair_multiply':meas('multiplication',MF)},
 'D4.PERIM':{space_story:meas('addition,multiplication',CH,AP),polygon_perimeter:meas('multiplication',MF),cuboid_volume:meas('multiplication',MM),triangle_area:meas('multiplication,division',MF,DF)},
 'D4.DATA':{pictograph_read:data('multiplication',MF),pictograph_key:DATA,read_bar:DATA,construct_bar:DATA,pictograph_claim:data('multiplication',MF),
  data_total:data('addition',AP),pictograph_total:data('addition',AP),data_difference:data('subtraction',SF),pictograph_difference:data('subtraction',SF)},
 'D4.PERCENT':{hundred_grid_percent:PCT,percent_of_quantity:pct('division,multiplication',DF,MF),percent_story:pct('division,multiplication',CH,DF),
  fraction_to_percent:pct('',FR),percent_to_fraction:pct('',FR)},
 'D4.RATIO':{integrity_ratio_equivalent:ratio('multiplication',MF),integrity_ratio_simplify:ratio('division',DF),integrity_ratio_missing:ratio('multiplication',MF)},
 'D4.RATE':{integrity_rate_unit:ratio('division',DF),integrity_rate_scale:ratio('division,multiplication',MF),integrity_rate_missing:ratio('division,multiplication',MF)},
 'D5.N1000000':{words:PV,compare:PV,order:PV,clues:PV,round:PV,depth_round:PV,d5c_reverse_round:PV,depth_sequence:PAT,sequence:PAT,
  depth_fraction_million:['number','division',[PVF,FR,DF],[PVF]]},
 'D5.PV1000000':{depth_place:PV,depth_compose:PV,depth_missing:PV,depth_expanded:PV},
 'D5.MUL':{depth_two_digit:op('multiplication',MF,MM),depth_story:op('multiplication',CH,MG,MM),depth_estimate:op('multiplication',PVF,MF),depth_missing:op('division',DM,MF)},
 'D5.DIV':{depth_remainder:op('division',DM,DR),depth_story:op('division',CH,DS,DM),depth_two_digit:op('division',DM),depth_missing:op('division',DM,MF)},
 'D5.FRAC':{depth_visual_model:fr('multiplication',MG),depth_mixed_x_proper:fr('multiplication',MF),depth_mixed_x_whole:fr('multiplication',MF),
  depth_proper_x_proper:fr('multiplication',MF),depth_proper_x_whole:fr('multiplication',MF)},
 'D5.DEC':{depth_place:DPV,depth_round3:DPV,depth_combined:dec('addition,subtraction',AP,SP),depth_divide:dec('division',DD),depth_multiply:dec('multiplication',MM)},
 'D5.PERCENT':{depth_visual:pct('',DPF),depth_over100_quantity:pct('multiplication',MF),depth_inverse:pct('division,multiplication',DF),depth_mixed_to_percent:pct('',FR)},
 'D5.MONEY':{depth_saving_investment:money('multiplication,addition',TX,CH,MF),depth_budget:money('subtraction',TX,SP),depth_mixed_brackets:money('addition,multiplication,subtraction',RS,MF),
  depth_compare_deal:money('multiplication,subtraction',TX,CH,MM),depth_discount:['money','multiplication,subtraction',[MD,PC],[MD,PC],'money_discount'],
  depth_dividend_bonus:money('multiplication',TX,MF),depth_interest_concept:['money','multiplication',[PC,MF],[PC]],
  depth_multi_step:['money','multiplication,subtraction',[MD,PC,MM],[MD,PC],'money_discount'],depth_credit_debt:money('addition',TX,AP)},
 'D5.TIME':{depth_leap:TIME,depth_elapsed_multi:time('addition,multiplication',MF),depth_day_hour:time('multiplication,addition',MF),
  depth_month_day:time('multiplication,addition',MF),depth_fraction_convert:time('multiplication',DPF)},
 'D5.MEASURE':{depth_fraction_convert:meas('multiplication',FR),depth_divide:meas('division',DD),depth_add_three:meas('addition',DPF,AP),
  depth_decimal_convert:meas('multiplication',DPF),depth_multiply:meas('multiplication',DPF,MM)},
 'D5.AREA':{depth_rectangle:meas('multiplication',MF),depth_composite:meas('multiplication,subtraction',CH,MF),depth_compare:meas('multiplication',MF),depth_missing_side:meas('division',DF)},
 'D5.DATA':{depth_compare:DATA,depth_interpret:data('addition',AP),depth_missing_mean:data('multiplication,subtraction',CH,MF),depth_mean:data('addition,division',AP,DF)},
 'D5.OPS':{integrity_combined_mul_first:op('multiplication,addition',MM,AP),integrity_combined_missing:op('subtraction,division',SP,DF),integrity_combined_brackets:op('addition,multiplication',AP,MM)},
 'D5.RATIO':{integrity_ratio_simplify:ratio('division',DF),integrity_ratio_missing:ratio('multiplication',MF),integrity_ratio_equivalent:ratio('multiplication',MF)},
 'D5.RATE':{integrity_rate_unit:ratio('division',DF),integrity_rate_scale:ratio('division,multiplication',MF),integrity_rate_missing:ratio('division,multiplication',MF)}
};

/* Deliberately untagged (no foundation in the map, or no arithmetic to diagnose). */
const ABSTAIN_SKILLS=new Set(['D2.1.5','D2.7.1','D2.7.2','D2.7.3','D3.SHAPE','D3.POSITION','D4.COORD','D5.COORD']);
const ABSTAIN={
 'D3.N10000':['judge_relative_reference_quantity','estimate_relative_to_reference_set','choose_reasonable_context_estimate'],   // estimating a set against a reference
 'D3.PERCENT':['percent_words_to_symbol','percent_symbol_to_words'],                              // notation words only
 'D3.MONEY':['currency_to_country','match_currency_code_to_name','country_to_currency','explain_need_before_want','identify_need_among_choices','choose_sensible_saving_decision'],
 'D4.MONEY':['money_currency_name','money_needs_wants_decision'],
 'D4.PERIM':['line_relationship','angle_type']
};

function specFor(q,skillId){
 const arch=String(q?.archetypeId||''),own=BY_SKILL[skillId];
 return own&&Object.prototype.hasOwnProperty.call(own,arch)?own[arch]:Object.prototype.hasOwnProperty.call(SHARED,arch)?SHARED[arch]:null;
}
/* Tag a generated question when its archetype is authored here; anything else is left as is. */
function focusTag(q,skillId){
 const id=String(skillId||'');
 if(!q||q.focusDiagnosticV1||!/^D[2-6]\./.test(id))return q;
 // D6 has its own authored tags (questions/kssr-year6-v2-runtime-v3.61.0.js); only the wording items are added here.
 if(/^D6\./.test(id)&&!/^reading_/.test(String(q.archetypeId||'')))return q;
 const spec=specFor(q,id);
 return spec&&typeof root.attachSpecFocusTag==='function'?root.attachSpecFocusTag(q,id,spec,TAG_REVISION):q;
}
root.PAFocusTagsD2D5=Object.freeze({version:VERSION,TAG_REVISION,SHARED,BY_SKILL,ABSTAIN_SKILLS,ABSTAIN,specFor,focusTag});
})(typeof window!=='undefined'?window:globalThis);
