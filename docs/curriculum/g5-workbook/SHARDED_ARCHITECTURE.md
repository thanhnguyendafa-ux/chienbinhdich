# G5 Workbook bounded Unit architecture

Student UI remains **20 Unit folders / 141 semantic lesson links**.

Physical content is stored in **20 bounded Unit modules**, not one giant content file and not four coarse shards:

- `units/u01.js` … `units/u20.js`
- each file contains only that Unit's retained lesson specs plus its 11-slot source manifest;
- `index.js` keeps lightweight lesson metadata and dynamically imports the correct Unit module;
- shared rendering/build rules live once in `shared/workbook-lesson.js`.

This boundary keeps source traceability local to each Unit, prevents a curriculum god component, and preserves lazy loading. Every retained exercise keeps a stable id `g5-uXX-wb-*`; source labels such as A2/B1/E2/F2 stay in internal trace metadata only.
