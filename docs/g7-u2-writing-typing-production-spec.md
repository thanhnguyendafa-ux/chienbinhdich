# Global Success 7 · Unit 2 · Healthy Living
## Writing Typing Production Spec — 16 Mini Lessons

**Status:** CONTENT LOCKED FOR PRODUCTION  
**Source basis:** Global Success 7 Unit 2 transcript supplied by the teacher  
**Output:** Writing · Việt → Anh · Typing  
**Method:** WORD / FIXED SURFACE → CHUNK → SENTENCE PART → FINAL  
**Framework:** Mr Thanh Brain Grammar · MINDSET FIRST

---

## 1. Production contract

- Exactly **16 one-target mini lessons**.
- Exactly **95 authored Typing items** across the 16 lessons.
- Exactly **one FINAL** per lesson.
- All pre-FINAL English scaffolds must be real contiguous surfaces inside that lesson's target sentence.
- Builder may map authored content to engine metadata, IDs, dependencies and feedback, but must not invent vocabulary, substitute examples or extra sentence scaffolds.
- One normalized Vietnamese cue must map to one English surface form across Unit 2.
- Catalog title must be learner-safe and must never be built from `targetSentence`.
- `passThreshold: 80`, `completionPolicy: all-items`, `typingTolerance: false`.
- Answer-bearing feedback appears only after response/reveal through the shared engine.

### Locked ambiguity fixes

- L05: `có thể dùng thuốc nhỏ mắt` → `can use eye drops`.
- L10: `có khả năng tăng cân` → `may put on weight`; do not reuse bare `có thể` for MAY.
- L12: `mỗi ngày` → `every day`.
- L14: `hằng ngày` → `daily`.
- L11: `phần đối lập: còn nước ngọt thì không` → `but not soft drinks`.
- L03 must not require the learner to derive `goes` from a bare `go` cue.

---

## 2. Locked folder tree

```text
Global Success 7
└── Unit 2 · Healthy Living
    └── Writing · Sentence Builder
        ├── Cấu trúc 1 · Healthy habits & benefits
        ├── Cấu trúc 2 · Health advice
        ├── Cấu trúc 3 · Food & drink
        ├── Cấu trúc 4 · Exercise & outdoor activities
        ├── Cấu trúc 5 · Sleep & consequences
        └── Cấu trúc 6 · Healthy environment
```

Planned fixed slugs are `g7u2-writing-01` through `g7u2-writing-16`.

---

## 3. Locked lesson map

| # | Learner-safe title | Target sentence | Items | Source type |
|---|---|---|---:|---|
| 01 | `01 · thói quen · giữ khỏe` | `Healthy habits help us keep fit and avoid disease.` | 7 | direct transcript |
| 02 | `02 · ngoài trời · sức khỏe` | `Outdoor activities are good for our health.` | 5 | direct transcript |
| 03 | `03 · gia đình · đạp xe` | `My family often goes cycling in the countryside.` | 5 | direct transcript |
| 04 | `04 · năng động · giữ khỏe` | `Being active helps keep you fit.` | 5 | direct transcript |
| 05 | `05 · mắt · thuốc nhỏ` | `You can use eye drops.` | 4 | direct transcript |
| 06 | `06 · ánh sáng mờ · lời khuyên` | `You should not read in dim light.` | 5 | normalized transcript |
| 07 | `07 · trái cây · rau củ` | `Eat more fruits and vegetables.` | 5 | direct transcript |
| 08 | `08 · vitamin · thực phẩm` | `Fruits and vegetables provide a lot of vitamins.` | 5 | normalized transcript |
| 09 | `09 · thịt · trứng · phô mai` | `Eat meat, eggs and cheese, but not too much.` | 8 | direct transcript |
| 10 | `10 · tăng cân · cảnh báo` | `You may put on weight.` | 3 | direct transcript |
| 11 | `11 · nước · nước ngọt` | `Drink enough water, but not soft drinks.` | 5 | direct transcript |
| 12 | `12 · vận động · mỗi ngày` | `Be active and exercise every day.` | 6 | direct transcript |
| 13 | `13 · đạp xe · bơi · thể thao` | `Do outdoor activities like cycling, swimming or playing sports.` | 8 | direct transcript |
| 14 | `14 · ngủ sớm · tám tiếng` | `Go to bed early and get about eight hours of sleep daily, so you will not feel tired.` | 9 | normalized transcript |
| 15 | `15 · phòng · gọn sạch` | `Keep your room tidy and clean.` | 6 | direct transcript |
| 16 | `16 · không khí · ánh nắng` | `Open windows to let in fresh air and sunshine on fine days.` | 9 | direct transcript |

Total: **95 items**.

---

## 4. Locked normalization decisions

### L06
Transcript surface: `You shouldn't read in dim light.`  
Production target: `You should not read in dim light.`

Reason: use the full form so a weak learner sees modal + NOT + base verb clearly during controlled typing.

### L08
Transcript context: `Eat more fruits and vegetables... They provide a lot of vitamins.`  
Production target: `Fruits and vegetables provide a lot of vitamins.`

Reason: replace the standalone pronoun with its explicit antecedent so the writing target has a clear referent.

### L14
Transcript surface uses `8` and no visual comma before the result clause.  
Production target spells `eight` and uses a comma before `so`.

Reason: controlled typing should spell the number and make the advice → result boundary visible.

---

## 5. Exact content highlights and acceptance gates

### L01 · Healthy habits
Scaffold must include `healthy habits`, `keep fit`, `avoid disease`, `keep fit and avoid disease`, `help us keep fit`, `healthy habits help us`, then FINAL. Do not use the incorrect foreign surface `keep us fit`.

### L03 · Family cycling
Use `my family`, `often`, `in the countryside`, and the contextual surface `often goes cycling` after the stated subject. Do not train bare `go` and silently require `goes` later.

### L06 · Negative health advice
Teach `dim light` → `in dim light` → `read in dim light` → `should not read in dim light` → FINAL.

### L08 · Vitamins
Teach `fruits and vegetables` and `a lot of vitamins` before `provide a lot of vitamins` and the explicit-subject FINAL.

### L10 · Possibility
Use `put on weight` → `may put on weight` → FINAL. Vietnamese cue explicitly signals possibility with `có khả năng`.

### L11 · Elliptical contrast
Keep the target exactly `Drink enough water, but not soft drinks.` The Vietnamese cue must signal the ellipsis instead of implying a missing full `do not drink` clause.

### L12 / L14 time-expression split
L12 locks `mỗi ngày` → `every day`. L14 locks `hằng ngày` → `daily`. These cues must not collapse into one ambiguous surface rule.

### L14 · Sleep result sentence
The long sentence must be scaffolded through `go to bed early`, `about eight hours of sleep`, `daily`, `get about eight hours of sleep daily`, `not feel tired`, `you will not feel tired`, `so you will not feel tired`, and the first long sentence part before FINAL.

### L16 · Purpose and time
Teach `fresh air`, `sunshine`, `fresh air and sunshine`, `let in fresh air and sunshine`, `to let in fresh air and sunshine`, `on fine days`, and `open windows to let in fresh air and sunshine` before FINAL.

---

## 6. Engine compatibility

The repository content validator enforces non-decreasing engine stages (`word → phrase → sentence`), but the locked pedagogical order may intentionally place a WORD after a CHUNK in lessons such as L03/L13/L14/L15/L16.

Therefore:

- authored pedagogy is preserved in `scaffoldRole: word | chunk | sentence_part | final`;
- all pre-FINAL items use engine `stage: phrase`;
- FINAL uses engine `stage: sentence`.

This is an engine-compatibility mapping only. It must not reorder or rewrite authored lesson content.

---

## 7. Required files

```text
src/data/g7-u2-writing-source.js
src/data/g7-u2-writing-typing-builder.js
src/data/g7-u2-writing-typing-part1.js
src/data/g7-u2-writing-typing-part2.js
src/data/g7-u2-writing-typing-part3.js
src/data/g7-u2-writing-typing-part4.js
src/data/g7-u2-writing-typing-part5.js
src/data/g7-u2-writing-typing-part6.js
src/data/g7-u2-writing-typing-content.js
src/data/g7-u2-writing-typing-catalog.js
tests/g7Unit2WritingTyping.test.js
docs/g7-u2-writing-typing-production-spec.md
```

The published catalog must include G7 U2 after existing G7 Unit 1 content and before G7 review content without duplicating the `global7` root folder.

---

## 8. Automated test contract

Tests must enforce at least:

1. exactly 16 lessons and six structure folders;
2. unique lesson IDs, target IDs and slugs;
3. exactly one FINAL per lesson;
4. FINAL equals source target exactly;
5. total authored items = 95;
6. itemCount equals real content count;
7. no pre-FINAL item equals the full target;
8. every pre-FINAL English scaffold is contained in its own target;
9. no generic grammar formula or unrelated model sentence is injected;
10. one normalized Vietnamese cue maps to one English surface;
11. CAN/MAY and EVERY DAY/DAILY distinctions remain locked;
12. L11 ellipsis remains locked;
13. normalized transcript lessons are exactly L06/L08/L14 with source notes;
14. all source records retain transcript trace metadata;
15. learner-visible titles equal the locked safe titles and do not contain target/FINAL;
16. pass threshold, completion policy and typing strictness match this spec;
17. FINAL teaching feedback contains MINDSET FIRST reasoning;
18. published catalog exposes G7 Unit 2 without duplicate Global 7 folders;
19. Admin Explorer hierarchy/count/search regressions are updated;
20. full repository CI passes.

---

## 9. Production process

1. Preflight current `main` and inspect catalog/validator/G6 U2 patterns.
2. Create `agent/g7-u2-writing-typing-production` branch.
3. Add source layer with transcript trace and normalization metadata.
4. Add six authored part files.
5. Add safe builder; no generated lexical content.
6. Add content loader.
7. Add catalog tree, safe titles and fixed slugs.
8. Wire into `publishedLessonCatalog.js`.
9. Add G7 U2 contract tests and update Admin Explorer regressions.
10. Run canonical `npm run ci`: syntax → content validation → full tests.
11. Open PR and require green CI.
12. Squash merge into `main`.
13. Verify Vercel production is READY on the exact merged `main` SHA.
14. Smoke-check representative fixed lesson routes and deployed catalog assets.
15. Confirm learner entry titles show only safe keywords, never full answers.
16. Generate print package only after production URLs are confirmed.

---

## 10. Planned production URLs

- `https://chien-binh-dich.vercel.app/a/g7u2-writing-01`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-02`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-03`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-04`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-05`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-06`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-07`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-08`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-09`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-10`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-11`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-12`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-13`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-14`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-15`
- `https://chien-binh-dich.vercel.app/a/g7u2-writing-16`

---

## 11. Reserve corpus — not in core 16

Do not silently append these:

- `My favorite outdoor activity is cycling.`
- `It's really hot and sunny at noon, so you might get sunburn.`
- `We need Vitamin A for our eyes.`
- `Colored vegetables are good food.`

Any expansion beyond the locked 16 requires a new content-lock decision.

---

## 12. Definition of Done

- [ ] 16 stable fixed lesson routes exist.
- [ ] 95 authored Typing items validate.
- [ ] all 16 safe titles avoid answer leakage.
- [ ] three normalization cases are documented and tested.
- [ ] cue-surface ambiguity tests pass.
- [ ] catalog/content validation passes.
- [ ] full repository regression suite passes.
- [ ] PR is merged into `main`.
- [ ] Vercel production is READY on the exact merged SHA.
- [ ] representative production routes and deployed assets are verified.
- [ ] print/link package is generated only after live URLs are confirmed.

This document is the **content source of truth** for G7 Unit 2 Writing Typing production. Do not change targets/cues/titles for coding convenience; update this spec first if a genuine contradiction requires a change.
