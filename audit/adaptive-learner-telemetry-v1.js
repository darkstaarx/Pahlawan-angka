'use strict';

const assert = require('assert');
const fs = require('fs');

const sql = fs.readFileSync('supabase/schema/adaptive_learner_telemetry_v1.sql', 'utf8');
const contract = fs.readFileSync('docs/ADAPTIVE-LEARNER-TELEMETRY-V1.md', 'utf8');
let checks = 0;
const ok = (value, message) => { assert(value, message); checks += 1; };

const tables = [
  'adaptive_question_exposures',
  'adaptive_interaction_events',
  'adaptive_encounter_outcomes'
];

for (const table of tables) {
  ok(new RegExp(`create table public\\.${table}\\b`, 'i').test(sql), `${table} must exist`);
  ok(new RegExp(`alter table public\\.${table} enable row level security`, 'i').test(sql), `${table} must enable RLS`);
  ok(new RegExp(`revoke all on table public\\.${table} from anon, authenticated`, 'i').test(sql), `${table} must revoke defaults`);
  ok(new RegExp(`grant select, insert on table public\\.${table} to authenticated`, 'i').test(sql), `${table} must be client append-only`);
  ok(!new RegExp(`grant[^;]*(update|delete)[^;]*public\\.${table}`, 'i').test(sql), `${table} must not grant mutation`);
}

ok((sql.match(/for insert to authenticated/g) || []).length === 3, 'each table needs an authenticated insert policy');
ok((sql.match(/for select to authenticated/g) || []).length === 3, 'each table needs an authenticated select policy');
ok((sql.match(/f\.owner_user_id = \(select auth\.uid\(\)\)/g) || []).length === 6, 'all policies need family ownership');
ok(!/\bfor\s+(update|delete|all)\b/i.test(sql), 'no update/delete/all policy is allowed');
ok(/foreign key \(exposure_id, child_id\)[\s\S]*?references public\.adaptive_question_exposures\(id, child_id\)/.test(sql), 'child/exposure ownership must be relationally bound');
ok(/unique \(exposure_id\)/.test(sql), 'one outcome per exposure must be enforced');
ok(/unique \(exposure_id, event_index\)/.test(sql), 'event ordering must be idempotent');
ok(/active_time_ms <= wall_time_ms/.test(sql), 'active time cannot exceed wall time');
ok(/rapid_submission_count <= attempt_count/.test(sql), 'rapid submissions cannot exceed attempts');
ok(/selection_reason in \([\s\S]*?'spaced_review'/.test(sql) && /selection_reason in \([\s\S]*?'transfer_check'/.test(sql), 'retention and transfer reasons must be represented');
ok(/item_variant_hash ~ '\^\[a-f0-9\]\{16,128\}\$'/.test(sql), 'variant hash must be bounded hexadecimal');

for (const forbidden of ['child_name', 'guardian_name', 'email', 'phone', 'ip_address', 'user_agent', 'device_fingerprint', 'raw_answer', 'question_text', 'answer_text']) {
  ok(!new RegExp(`\\b${forbidden}\\b`, 'i').test(sql), `privacy field ${forbidden} must not exist`);
}

ok(/A single encounter is never enough/.test(contract), 'contract must prohibit one-event behavioural labels');
ok(/raw typed answers/.test(contract), 'contract must prohibit raw typed answers');
ok(/calibrated language/.test(contract), 'contract must require calibrated reporting');
ok(/local schema\/source contract only/i.test(contract), 'contract must state that production is untouched');

console.log(`PASS: ${checks} adaptive learner telemetry schema and privacy checks.`);
