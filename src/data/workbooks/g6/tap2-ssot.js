const freeze = value => Object.freeze(value);

export const G6_TAP2_SOURCE = freeze({
  title: 'SBT Tiếng anh 6 - tập 2 - Global success.pdf',
  scope: 'Global Success 6 · Sách bài tập · Tập Hai',
  contents: freeze([
    'Unit 7 · Television',
    'Unit 8 · Sports and Games',
    'Unit 9 · Cities of the World',
    'Test Yourself 3',
    'Unit 10 · Our Houses in the Future',
    'Unit 11 · Our Greener World',
    'Unit 12 · Robots',
    'Test Yourself 4'
  ]),
  numberedExerciseCount: 118,
  auditedAtomCount: 120,
  note: 'The source has 118 numbered exercises. The digital SSOT audits 120 atoms because Unit 11 D2c is split from D2 and Unit 12 C1a/C1b are tracked separately so no subtask can disappear.'
});

export const G6_TAP2_INTERACTION_POLICY = freeze({
  sourceLocked: true,
  longTypingMinWords: 5,
  longScoredTypingAllowedTypes: freeze(['sentence_order', 'mcq']),
  openWritingExemption: 'Open/personal writing stays unscored typing because it has no single canonical answer.',
  imageGridPolicy: 'Picture/grid-dependent source tasks must be retained through a text-equivalent MCQ, match, sequence, classification, or sentence_order adaptation; omission is not allowed.'
});

function parseEntries(unit, entries) {
  return entries.map(entry => {
    const [key, pageText] = entry.split('@');
    return freeze({
      id: `g6-u${String(unit).padStart(2, '0')}-wb-${key}`,
      group: `unit-${unit}`,
      unit,
      key,
      exercise: key.toUpperCase(),
      section: key[0].toUpperCase(),
      sourcePage: Number(pageText),
      required: true
    });
  });
}

const UNIT_ATOMS = freeze([
  ...parseEntries(7, [
    'a1@3','a2@3','b1@3','b2@4','b3@4','b4@4','b5@5','b6@5','c1@5','c2@6','c3@6','d1@6','d2@7','d3@7','e1@7','e2@8','e3@8'
  ]),
  ...parseEntries(8, [
    'a1@9','a2@9','b1@9','b2@10','b3@10','b4@11','b5@11','b6@11','b7@12','c1@12','c2@12','c3@13','d1@13','d2@13','d3@14','e1@15','e2@15','e3@15'
  ]),
  ...parseEntries(9, [
    'a1@16','a2@16','b1@16','b2@16','b3@17','b4@17','b5@17','b6@18','c1@18','c2@18','c3@18','d1@19','d2@19','d3@20','e1@20','e2@21','e3@21'
  ]),
  ...parseEntries(10, [
    'a1@26','a2@26','b1@26','b2@26','b3@27','b4@27','b5@27','b6@28','b7@28','c1@28','c2@29','c3@29','d1@29','d2@29','d3@30','e1@31','e2@31','e3@31'
  ]),
  ...parseEntries(11, [
    'a1@32','a2@32','b1@32','b2@33','b3@34','b4@34','b5@34','c1@35','c2@35','c3@36','d1@37','d2@37','d2c@38','e1@38','e2@39','e3@39'
  ]),
  ...parseEntries(12, [
    'a1@40','a2@40','b1@40','b2@41','b3@41','b4@41','b5@42','b6@42','c1a@43','c1b@43','c2@43','c3@44','d1@44','d2@45','d3@46','e1@47','e2@47','e3@48'
  ])
]);

function testAtoms(testNumber, startPage, pages) {
  return pages.map((pageOffset, index) => freeze({
    id: `g6-ty${testNumber}-wb-${index + 1}`,
    group: `test-yourself-${testNumber}`,
    testNumber,
    key: String(index + 1),
    exercise: String(index + 1),
    section: 'TEST',
    sourcePage: startPage + pageOffset,
    required: true
  }));
}

const TEST_ATOMS = freeze([
  ...testAtoms(3, 22, [0,0,0,1,2,2,2,3]),
  ...testAtoms(4, 49, [0,0,0,1,2,3,3,3])
]);

export const g6Tap2Ssot = freeze([...UNIT_ATOMS, ...TEST_ATOMS]);
export const g6Tap2ExpectedLessonIds = freeze(g6Tap2Ssot.map(row => row.id));
export const G6_TAP2_EXPECTED_ATOM_COUNT = g6Tap2ExpectedLessonIds.length;

if (G6_TAP2_EXPECTED_ATOM_COUNT !== G6_TAP2_SOURCE.auditedAtomCount) {
  throw new Error(`G6 Tập Hai SSOT count drift: expected ${G6_TAP2_SOURCE.auditedAtomCount}, got ${G6_TAP2_EXPECTED_ATOM_COUNT}`);
}
