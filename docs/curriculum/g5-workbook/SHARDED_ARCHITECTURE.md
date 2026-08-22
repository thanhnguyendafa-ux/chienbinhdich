# G5 Workbook sharded architecture

Student UI remains **20 Unit folders / 141 semantic lesson links**. Physical content is stored in four lazy data shards to keep the published catalog small while avoiding 141 eager imports.

- `u01-u05.js`
- `u06-u10.js`
- `u11-u15.js`
- `u16-u20.js`

Every retained source exercise still has a unique stable lesson id `g5-uXX-wb-...`; A/B/E/F source labels remain internal trace metadata only.
