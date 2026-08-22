# G5 Workbook implementation layout

- 20 Unit folders.
- Each Unit has `catalog.js` + lazily loaded `content.js`.
- 141 visible lessons remain one-to-one with retained PDF exercises.
- Source labels are internal trace metadata; student-facing titles are semantic.
- Physical lesson data is grouped per Unit to avoid 141 eager module imports.
