# G7 Unit 1 Pronunciation Theory Support E2E

## Goal
Teach weak learners the /ə/ vs /ɜː/ foundation before asking them to complete Mai Lan Hương-style classification. Foundation and guided questions allow theory support at any time. Classification questions lock theory until the learner has submitted the current exposure once. Resolved classification feedback explains every word.

## Content flow
1. Foundation recall: Q1–Q8, bilingual English/Vietnamese, MCQ or True/False, theory available anytime.
2. Guided reasoning: Q9–Q11, bilingual MCQ, theory available anytime.
3. Mai Lan Hương classification: Q12–Q17, 4–5 words per question, theory locked before the first submit of each exposure.
4. Resolved answer analysis: after the classification is resolved, explain each word using word → target sound → clue/reason.

## Theory access contract
Each item may define `theorySupport`:
- `access: 'anytime'`: learner can expand/collapse theory before answering.
- `access: 'after_submit'`: learner sees a locked theory control until the current exposure has at least one attempt, then can expand/collapse theory.

Theory support is knowledge-only and reuses the same theory source as teaching feedback. It must never reveal the current correct answer before the existing reveal/correction flow allows it.

For `after_submit`, unlock state is derived from Session V7 attempts using the current `promptIndex`. A retry exposure has a new promptIndex, so theory is locked again until that exposure is attempted.

## Bilingual learner contract
All learner-facing prompts, statements, classification group helpers, theory support labels/content, and worked explanations in this lesson are bilingual English/Vietnamese.

## Mai Lan Hương source words
The six classification rounds cover the 26 source words exactly once:
occasion, world, girl, answer, heard, mother, birth, around, neighbour, work, early, upon, parent, learn, expert, singer, nature, sunburn, collect, shirt, monopoly, hurt, carrot, doctor, word, dirty.

## Feedback contract
Existing first-wrong/reveal/correction behavior remains authoritative.
- First wrong: no correct answer reveal; `after_submit` theory may unlock, but shows only general rule support.
- Second wrong / reveal: existing full teaching feedback may reveal the correct classification.
- Correct retrieval/correction: show full teaching feedback and an item-level word analysis table/list for classification rounds.

## Architecture invariants
- Session Schema V7 unchanged.
- Attempt Log remains Mastery evidence SSOT.
- No new question type.
- No Set-specific renderer branch.
- Existing `teachingFeedback` remains the knowledge SSOT.
- Existing MCQ/True-False/Classification evaluation stays unchanged.

## Print
Use print groups:
A. BUILD THE FOUNDATION / XÂY NỀN
B. GUIDED REASONING / SUY LUẬN CÓ HƯỚNG DẪN
C. SOUND CLASSIFICATION / PHÂN LOẠI ÂM

Digital lock/unlock behavior is not reproduced in student print. Teacher print keeps reason/theory/example.

## Delivery
Feature branch → content validation → full tests → PR → CI → squash merge to `main` → Vercel production smoke check.
