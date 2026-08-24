# Darjah 3 — Semantic Hardening & Real-Paper Alignment Audit

**Phase:** 3A-2  
**Target release:** 3.45.0  
**Base:** `75edc8c88d0cd4bb96abb628ff4c7cdcf35ac7d8`  
**Scope:** Darjah 3 QS v2 content semantics only. No learner-visible rollout expansion.

## 1. Evidence hierarchy

This hardening uses three different kinds of evidence and does not conflate them:

1. **KSSR curriculum truth** — defines what each Standard Pembelajaran must assess and its mathematical limits.
2. **Real Malaysian school assessment papers** — used only to model authentic item construction, representation, context, chaining and expected student work.
3. **Pahlawan Angka engineering constraints** — deterministic generation, battle-friendly response formats, diagnostic metadata, SHADOW routing and anti-repeat behaviour.

Real school papers are **not treated as a single national fixed Year 3 examination format**. Year 3 assessment remains school/PBD-led; the sampled papers are design evidence.

## 2. Real-paper samples reviewed

### A. SK Kem Iskandar, Mersing — PBD Sumatif Akhir Sesi Akademik 2023, Matematik Tahun 3

Public reference: `https://ro.scribd.com/document/712357252/UJIAN-AKHIR-TAHUN-MATEMATIK-TAHUN-3-2023-2024`

Observed item construction included:

- number words and ordering from number cards;
- linked arithmetic followed by rounding;
- decimal addition embedded in a ribbon-length context;
- price → payment → change money tasks;
- a time chain that first divides total duration across equal batik patterns, then scales to several patterns;
- litre/millilitre conversion before comparing or subtracting quantities;
- addition of three lengths in a travel context;
- multiplication of mass by 10;
- multi-item spending followed by finding the balance from a fixed amount;
- shared stimuli and multi-part questions rather than isolated arithmetic clones.

### B. SK Sungai Bukit Balai — Ujian Sumatif Pertengahan Sesi Akademik 2024/2025, Mathematics Year 3

Public reference: `https://www.scribd.com/document/864766448/Kertas-Ujian-Sumatif-MT-TAHUN-3`

Observed item construction included:

- numeral/word conversion;
- place value and digit value as separate evidence;
- ordering four or five numbers;
- rounding;
- three-number addition and chained subtraction;
- a mix of objective and written-response sections;
- explicit partitioning/cerakin work rather than only selecting a final numeric answer.

### C. Ujian Sumatif Akhir 2024/2025 Matematik Tahun 3 sample

Public references reviewed as style evidence include:
- `https://id.scribd.com/document/777240867/matematik-2-tahun-3`
- `https://id.scribd.com/document/815501144/UASA-MT-THN-1-2024-2025-FAUZITA`

Observed construction included a two-section paper, written calculation and diagram-based prompts. This reinforces the use of visual evidence, written/chained reasoning and multi-step tasks as style references, but the exact duration/mark split is not adopted as a universal Year 3 format.

## 3. What the real-paper review changed

The previous 3A-1 bank had broad SP coverage structurally, but several templates behaved unlike real assessment items. 3A-2 therefore hardens the existing **158-template total** rather than inflating the count.

### T1 — Nombor Bulat hingga 10 000

Fixed:

- replaced a redundant cerakin archetype with explicit **digit-value** evidence;
- rewrote estimation so a learner judges a **target set relative to a reference set**, instead of doing disguised multiplication;
- estimation visuals now reflect the relative quantity rather than drawing a fixed number of decorative dots;
- number-pattern sequences use longer 5–6 term evidence;
- misconception metadata is scoped by standard instead of applying unrelated tags to every T1 item.

### T2 — Operasi Asas

Fixed:

- word problems include authentic **three-value** operations;
- ×/÷ 10, 100 and 1000 are explicitly sampled;
- all generated multiplication/division values remain within the KSSR ≤10,000 boundary;
- place-value-shift visuals now render the actual operation (`×` or `÷`) instead of always showing multiplication.

### T3 — Pecahan, Perpuluhan dan Peratus

Fixed:

- equivalent/simplification fraction denominators remain within Year 3 limits;
- addition/subtraction now includes **related unlike denominators**, not same-denominator only;
- mixed-number pictures use a dedicated representation: full wholes plus one partial whole;
- decimal-pair visuals display both operands and the correct operator;
- added a daily **ribbon length** decimal context inspired by real-paper construction;
- fraction–decimal–percent bridges explicitly use **hundredths**;
- retained and extended display-uniqueness guards discovered in prior QA.

### T4 — Wang

Fixed:

- money values now exercise hundreds and thousands while remaining ≤RM10,000;
- multiplication/division explicitly covers 1-digit factors as well as 10, 100 and 1000;
- more realistic item chains include multiple prices, receipts, payment and change;
- ASEAN currency cards no longer contain the answer field being asked about;
- misconception tags are scoped to operation/unit, currency-country or needs/wants as appropriate.

### T5 — Masa dan Waktu

Fixed:

- replaced a weak digital-time item with a genuine **calendar/date** task;
- hour↔minute and minute↔second conversion works in both directions;
- addition/subtraction spans seconds, minutes and mixed time and uses three values where relevant;
- multiplication/division covers hours, minutes and seconds;
- added a real-paper-style **divide total time → find one unit → multiply target units** chain;
- timeline and calendar renderers now carry readable evidence rather than decorative markers only.

### T6 — Ukuran dan Sukatan

Fixed:

- add/subtract tasks use **three measurements**;
- contexts and labels include mixed `m/cm`, `kg/g` and `L/mL` values;
- multiplication/division retains realistic one-digit scaling with mixed-unit display;
- ruler, mass scale and liquid-container visuals now use distinct domain-specific drawings instead of one generic gauge.

### T7 — Ruang

**Unchanged.** Topic 7 had already undergone dedicated semantic QA and remains the only current QS v2 LIVE topic. Its 26 templates remain 24 battle MCQ + 2 interactive performance tasks.

### T8 — Koordinat

Fixed:

- grid uses alphanumeric paper-style coordinates (`A1`–`E5`);
- direction vocabulary includes right/left/up/down and east/west/north/south;
- moved targets are revalidated so two named objects cannot occupy the same coordinate;
- misconception metadata is scoped to the actual positional error being assessed.

### T9 — Pengurusan Data

Fixed:

- 9.1.1 now begins from **raw survey data**, then asks the learner to classify, tally or organize it;
- tally notation uses grouped-five marks rather than broken `+ remainder` text;
- pie-chart items read/compare category information instead of smuggling in unrelated percentage-of-quantity arithmetic;
- same-data transfer between pictograph, bar chart and pie chart is retained and diversified.

## 4. QA added in 3A-2

`phase3a2-semantic-hardening-qa.js` tests semantics that the older structural suite could not detect:

- mathematical range limits;
- denominator limits;
- unlike-denominator evidence;
- answer leakage from visual data;
- three-value operation coverage;
- real-paper linked-task structures;
- rendered operator correctness;
- mixed-number visual correctness;
- coordinate collisions;
- raw-data evidence for data handling;
- diagnostic-tag scope;
- 4 display-unique choices after generation;
- non-empty rendered visual evidence.

Local pre-package stress tests:

- **132 non-T7 templates × 500 seeds = 66,000 generated samples — PASS**
- **132 non-T7 templates × 1,000 seeds = 132,000 generated semantic samples — PASS**
- **650,300 semantic assertions/checks — PASS**

The deeper 1,000-seed sweep exposed an additional time-multiplication distractor collision that the 500-seed sweep missed; it was fixed before packaging.

## 5. Rollout safety

3A-2 changes content semantics only:

- D3 remains 50 curriculum standards;
- total templates remain 158;
- 132 non-T7 templates remain MCQ and SHADOW-only;
- D3.T7 remains 26 templates and the only enabled/LIVE QS v2 topic;
- no new evidence epoch is introduced;
- no Supabase migration is introduced;
- no changes to battle, heroes, pets, rewards, Cikgu Dimensi, parent controls or legacy question-bank files.

## 6. New release gate

From 3A-2 onward, Darjah 3 content is not considered ready because structural tests pass alone.

A topic is LIVE-ready only when all of the following pass:

**KSSR scope → mathematical oracle → authentic item construction → rendered visual evidence → distractor semantics → misconception metadata → range/edge cases → deterministic generation → SHADOW regression → rollout/evidence gate.**


## R3 generator-hardening note

Full repository regression after R2 exposed one further previously-masked T5 distractor collision in `divide_time_duration`: for the hours domain with two groups, the old `+1 jam` distractor could canonicalize to the same display label as the total duration. R3 routes that archetype through display-aware duration de-duplication, retains the R2 fraction/percent fixes, and adds a permanent targeted regression. This is an engineering correctness fix; it does not change the KSSR mapping, template count, evidence epoch, or LIVE rollout.
