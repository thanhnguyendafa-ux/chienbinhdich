# Global Success 7 · SBT Unit 2–3 · Production Audit

## Sources

- `TA7_SBT_U02_Healthy_Living.pdf` · workbook pages 10–15 · 6 scanned pages.
- `TA7_SBT_U03_Community_Service.pdf` · workbook pages 16–23 · 8 scanned pages.

## Shared learner flow

Every published lesson follows:

1. Required micro-theory in Vietnamese for a grade-3 learner.
2. English → Vietnamese vocabulary MCQ preload.
3. English → Vietnamese phrase/chunk MCQ preload.
4. The source workbook task using the interaction that matches its real goal.
5. Post-submit Vietnamese answer explanation: answer → why → evidence/cue → trap/example.

Preload uses only language needed to understand that lesson and must not reveal a source answer mapping before the task.

## Unit 2 · Healthy Living

Source has A1–A2, B1–B6, C1–C3, D1–D3, E1–E3.

`B1` is not published because students must identify six pictures. Removing the pictures removes the data needed to solve the exercise; no replacement descriptions are invented.

Published: 16 links:

- A1 pronunciation odd-one-out
- A2 /f/ and /v/ practice
- B2 open vocabulary groups
- B3 source word-box typing
- B4 source word-box group identification
- B5 sentence order
- B6 S/V/O/ADV classification
- C1 open health-tip judgement
- C2 open agree/disagree + reason
- C3 open three house-cleaning actions
- D1 one-word evidence typing from health tips
- D2 8-item MCQ cloze
- D3 5-item MCQ reading comprehension
- E1 cue-to-sentence typing
- E2 open reasons
- E3 open ~70-word healthy-life writing

## Unit 3 · Community Service

Source has A1–A2, B1–B6, C1–C3, D1–D3, E1–E3.

`B1` is not published because all five answers depend on pictures. No text-only replacement is created.

D2 is split into D2a and D2b because the source itself contains two distinct response tasks: vocabulary matching and True/False.

Published: 17 links:

- A1 -ed pronunciation odd-one-out
- A2 -ed /t/ /d/ /ɪd/ classification
- B2 verb–phrase matching
- B3 phrase-bank typing
- B4 time-signal verb forms
- B5 passage verb forms
- B6 conversation matching
- C1 open compliments
- C2 student-profile ↔ activity matching
- C3 activity ↔ benefit matching + open response
- D1 8-item MCQ cloze
- D2a highlighted vocabulary matching
- D2b 5-item True/False
- D3 6-item benefit/main-idea comprehension
- E1 cue-to-sentence typing
- E2 meaning-preserving rewrite typing
- E3 open volunteer-letter writing

## Interaction rules

- MCQ stays MCQ when recognition is the source skill.
- Matching is represented by the generic classification engine instead of a unit-specific widget.
- Rearranging words uses `sentence_order`.
- Short lexical/verb-form production stays typing.
- Writing/reason/discussion tasks stay open typing and do not use a fake single answer key.
- Source word banks are displayed as non-clickable reference chips; students still type the answer.

## Source word banks

Unit 2:

- B3: tofu · fit · chapped lips · weight · harms · bins
- B4: taking a bath · soft drinks · house cleaning · cycling · fast food · acne

Unit 3:

- B3 reuses the six phrases built in B2: plant trees · clean up dirty streets · donate food and clothes · recycle used bottles · help old people · exchange used paper for notebooks

## Key evidence contracts

Unit 2:

- A1 key: C, B, B, A, D.
- D2 cloze key: B, A, C, A, B, A, C, C.
- D3 reading key: A, A, B, C, B.

Unit 3:

- A1 -ed key: B, A, D, C, C.
- D1 cloze key: C, B, C, A, B, C, B, A.
- D2b True/False: T, T, F, T, T.
- D3 reading key: C, A, B, C, C, B.

## QA

Regression tests require:

- 16 Unit 2 workbook descriptors and 17 Unit 3 workbook descriptors.
- required micro-theory in every lesson.
- vocab/phrase preload appears before every source task.
- every preload item is a deterministic 4-choice English→Vietnamese MCQ.
- all lesson data passes the common content validator.
- source keys and interaction types remain locked.
- Unit 2/3 source-word-bank UI remains available.
- Admin Explorer exposes G7 Unit 1, Unit 2, Unit 3 and updated recursive counts.
