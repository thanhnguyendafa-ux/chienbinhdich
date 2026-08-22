# Global Success 5 Workbook · Production Audit

- Source SSOT: `GS5_WORKBOOK_141_LINKS_FINAL_PRODUCTION_SPEC_v4_UNIT_FOCUS_LOCKED.md`
- Source PDFs: 20 Units / 220 task slots
- Online lessons: **141**
- Media-dependent omissions: **79**
- Type checksum: `MCQ 38 + TYPE 27 + MATCH 20 + SEQ 10 + TF 6 + SO 40 = 141`
- Visible titles containing source codes A/B/E/F: **0**
- F2 open typing: **0**; all 20 F2 are controlled Sentence Order adaptations using Unit-focused language.
- Retained E2 reading lessons: **19/19** include source reading context.

## Unit counts

`6, 7, 7, 8, 6, 7, 7, 8, 7, 6, 7, 6, 8, 6, 7, 8, 7, 7, 8, 8 = 141`

## Runtime architecture

- 1 lightweight catalog: `src/data/workbooks/g5/index.js`.
- 20 bounded content modules: `units/u01.js` … `units/u20.js`.
- 1 shared builder: `shared/workbook-lesson.js`.
- Unit content is lazy-loaded with dynamic imports; `publishedLessonCatalog.js` imports only the lightweight G5 catalog.
- Each Unit module contains its own `sourceManifest`, preserving all 11 source slots as `KEEP` or `OMIT` with reason.

## Quality gates

Dedicated tests enforce 20 Unit folders, 141 unique lesson IDs, exact per-Unit counts, semantic visible titles, no open typing, all six runtime question types, 20 controlled F2 lessons, 19 retained E2 contexts, and source-manifest checksum `141 KEEP + 79 OMIT = 220`.
