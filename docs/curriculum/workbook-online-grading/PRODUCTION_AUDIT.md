# Global Success 5 + 6 Workbook · Online Grading Production Audit

## Goal

Make the published workbook flow easy and fair for students to complete online while keeping automatic grading meaningful.

## Production assessment contract

1. `vocab` and `phrase` preload teach meaning before the source exercise but do **not** change SBT Mastery.
2. Only deterministic `learningPhase: source` interactions count toward SBT Mastery.
3. Genuine open/personal writing and self-confirmed pronunciation practice remain available but are `unscored`; non-empty text is never treated as evidence of English mastery.
4. Published G5/G6 workbook lessons use `completionPolicy: all-items`, `assessmentPolicy: source-only`, and the existing 80% pass threshold. A lesson with objective graded source items cannot pass below 80% merely by reaching the end.
5. Completion-only lessons with no objectively gradable source interaction may be completed, but they do not manufacture a numeric mastery gain.
6. Source word banks are learner-visible structured metadata. Online students should not have to guess from the whole English language when the printed SBT supplied a bank.
7. When a removed visual structure is itself part of the answer constraint, the online adaptation must restore an equivalent constraint. G6 U5 B3 therefore uses 4-choice MCQ clues after removal of the crossword grid instead of synonym-fragile free typing.
8. Reading passage/context remains attached at answer time.
9. Controlled adaptations of open writing must tell the learner what changed and why; G5 F2 explicitly says that the online sentence-order task is the auto-graded scaffold, not a fake grade for personal writing.

## Audited content corrections

- G5 U4 E2 source item 4: replace invented subject `Mary` (not introduced in the passage) with `The writer`, keeping the supported answer `goes swimming`.
- G5 U4 A3 preload: replace invalid teaching phrase `play the flowers → —` with `water the flowers → tưới hoa`.

Both corrections live in `src/data/workbooks/g5/source-corrections.js` so the deviation from the source-derived dataset is explicit and regression-testable rather than hidden in a builder.

## Coverage gate

The end-to-end regression loads all **333 published G5/G6 workbook lessons**:

- Global Success 5: **141** workbook lessons.
- Global Success 6: **192** workbook lessons.

For each lesson the gate verifies preload is excluded from SBT score, open/practice interactions are unscored, and every scored source item exposes a deterministic expected response. Additional regression covers the 80% threshold, source word-bank preservation, G5 corrections, G5 F2 adaptation labeling, G6 crossword constraint restoration, and unscored pronunciation/open practice.

## Student-facing rationale

The online version should test the English task, not the student's ability to guess what the software expects. A student who receives a word bank in the book receives the same constraint online; a student who gives a valid personal answer is not falsely marked objectively correct; a student who works through the whole lesson still needs 80% on the objectively gradable SBT source questions to pass; and a removed crossword/image structure is replaced only when an equivalent text interaction can preserve the answer constraint.
