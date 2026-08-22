# G5 Workbook implementation architecture

## Runtime layout

- Student UI: **20 Unit folders / 141 semantic lesson links**.
- `src/data/workbooks/g5/index.js` is the lightweight catalog SSOT for visible metadata and contains only descriptor rows plus 20 dynamic unit importers.
- `src/data/workbooks/g5/units/u01.js` … `u20.js` are bounded Unit content modules. Each Unit module owns the retained lesson specs and its 11-slot source manifest.
- `src/data/workbooks/g5/shared/workbook-lesson.js` is the single shared builder for theory, preload, source interaction, teaching feedback and controlled F2 adaptation.
- `src/data/publishedLessonCatalog.js` imports only `workbooks/g5/index.js`; it never imports 20 Unit content modules directly.

## Lazy-load contract

Opening `g5-uXX-wb-*` dynamically imports only `./units/uXX.js`. The catalog does not eagerly load lesson content, so adding 141 links does not create 141 eager imports or a curriculum god component.

## SSOT contract

- Curriculum/source SSOT: `GS5_WORKBOOK_141_LINKS_FINAL_PRODUCTION_SPEC_v4_UNIT_FOCUS_LOCKED.md`.
- Runtime source trace for each Unit: that Unit's `specs` + `sourceManifest` in `units/uXX.js`.
- A/B/E/F source codes remain internal provenance; visible titles are semantic Vietnamese titles.
- Tests cross-check catalog counts, lazy-load structure, manifests, F2 policy, reading context and item counts to prevent metadata/content drift.
