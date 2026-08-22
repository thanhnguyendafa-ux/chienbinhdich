import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const repoRoot=resolve(here,'..');
const read=path=>readFileSync(resolve(repoRoot,path),'utf8');

test('G5 workbook catalog lazy-loads bounded Unit modules instead of eager imports', () => {
  const source=read('src/data/workbooks/g5/index.js');
  assert.doesNotMatch(source,/from\s+['"]\.\/units\/u\d{2}\.js['"]/);
  for(let unit=1;unit<=20;unit+=1){
    const key=String(unit).padStart(2,'0');
    assert.match(source,new RegExp(`import\\(['"]\\.\\/units\\/u${key}\\.js['"]\\)`),`u${key} dynamic import`);
  }
});

test('published catalog depends only on the lightweight G5 workbook catalog', () => {
  const source=read('src/data/publishedLessonCatalog.js');
  assert.match(source,/from ['"]\.\/workbooks\/g5\/index\.js['"]/);
  assert.doesNotMatch(source,/workbooks\/g5\/units\/u\d{2}/);
});

test('G5 workbook content stays bounded by Unit and shares one builder', () => {
  const helper=read('src/data/workbooks/g5/shared/workbook-lesson.js');
  assert.match(helper,/defineG5WorkbookLesson/);
  for(let unit=1;unit<=20;unit+=1){
    const key=String(unit).padStart(2,'0');
    const path=`src/data/workbooks/g5/units/u${key}.js`;
    const source=read(path);
    assert.match(source,/defineG5WorkbookLesson/);
    assert.match(source,/sourceManifest/);
    assert.ok(statSync(resolve(repoRoot,path)).size < 30_000,`${path} vượt 30KB; xem lại boundary/god component`);
  }
});
