# Global Success 2–3 SBT production contract

## Release scope

- Grade 2: 16 Units, 112 top-level SBT activity blocks. Provenance status: `PDF-SOURCE-LOCKED` from the audited uploaded Grade 2 workbook.
- Grade 3: 20 Units + 4 Self-check/Fun time, 257 top-level blocks. Provenance status: `PUBLIC-STRUCTURE-ADAPTED`; the earlier uploaded archive is Grade 5, so this release does **not** claim page-by-page Grade 3 PDF fidelity.
- Source coverage denominator is 369. The 200 English→Vietnamese vocabulary questions from the audited curriculum are support items and do not inflate source coverage.

## Mastery

Production descriptors use `passThreshold: 80`. At publication, both G2 and G3 workbook registries must pass through `withWorkbookAllItemsMastery`, the same contract used by G5/G6/G7. That yields `assessmentPolicy=workbook-all-items-v1`, `completionPolicy=all-items`, and `assessmentContractVersion=1`. Objective items count by accuracy; genuine open responses count by completion.

There is no separate artificial 10-question Mastery quiz. Grade 2 Units contain their vocabulary support items plus 7 source activities; for the common 3-word Unit this is 10 Mastery units, so 8/10 is the 80% threshold. Unit 8 has 4 vocabulary words and therefore 11 Mastery units.

## Matching

Content uses semantic type `matching`. The question-type core resolves matching through the existing classification interaction/evaluator as a deliberate internal adapter: left terms are tokens, right meanings are targets, and a learner taps a left item then its right target. This avoids drag-only interaction and reuses battle-tested scoring/state behavior. UI labels still identify it as `GHÉP CẶP`.

Grade 2 matching is capped at 4 pairs. Grade 2 sentence ordering is capped at 5 blocks. Vocabulary MCQ uses exactly 3 choices. No source item requires an image or audio to answer; image/audio-dependent source activities are explicitly adapted to text.

## User expectation

A Grade 2 learner should be able to enter a Unit, read a short theory gate, answer the Unit vocabulary MCQs, then complete seven source-equivalent activities using one-tap/two-tap interactions, short typing, ordering or matching. Wrong answers show a short Vietnamese reason and an example before retry. The website must not require the child to understand technical labels such as MCQ or classification.

Primary QA viewport: 1280×529 CSS px. Mobile QA: iPhone 11 portrait and landscape. Interaction targets should remain at least 48px where the G2/G3 matching adapter is used.
