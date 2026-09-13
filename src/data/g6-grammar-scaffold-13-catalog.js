import './strictIntegrityGuard.js';

const loaders = Object.freeze({
  1: () => import('./g6-grammar-scaffold-s01.js').then(module => module.g6GrammarScaffoldS01Content),
  2: () => import('./g6-grammar-scaffold-s02.js').then(module => module.g6GrammarScaffoldS02Content),
  3: () => import('./g6-grammar-scaffold-s03.js').then(module => module.g6GrammarScaffoldS03Content),
  4: () => import('./g6-grammar-scaffold-s04.js').then(module => module.g6GrammarScaffoldS04Content),
  5: () => import('./g6-grammar-scaffold-s05.js').then(module => module.g6GrammarScaffoldS05Content),
  6: () => import('./g6-grammar-scaffold-s06.js').then(module => module.g6GrammarScaffoldS06Content),
  7: () => import('./g6-grammar-scaffold-s07.js').then(module => module.g6GrammarScaffoldS07Content),
  8: () => import('./g6-grammar-scaffold-s08.js').then(module => module.g6GrammarScaffoldS08Content),
  9: () => import('./g6-grammar-scaffold-s09.js').then(module => module.g6GrammarScaffoldS09Content),
  10: () => import('./g6-grammar-scaffold-s10.js').then(module => module.g6GrammarScaffoldS10Content),
  11: () => import('./g6-grammar-scaffold-s11.js').then(module => module.g6GrammarScaffoldS11Content),
  12: () => import('./g6-grammar-scaffold-s12.js').then(module => module.g6GrammarScaffoldS12Content),
  13: () => import('./g6-grammar-scaffold-s13.js').then(module => module.g6GrammarScaffoldS13Content),
});

function descriptor({ setNo, folderId, title, slug, itemCount, activityTypes, expectedTimeMinutes, difficulty }) {
  const key = String(setNo).padStart(2, '0');
  return Object.freeze({
    id: `g6-grammar-scaffold-s${key}`, folderId, order: 50 + setNo, version: 1,
    course: 'Global Success 6', unit: 'Review Unit 1–3 · Midterm 1', title: `Scaffold ${key} · ${title}`,
    subtitle: `${activityTypes.join(' · ')} · Scaffold → Exam · Mastery 100%`,
    expectedTimeMinutes, lessonSlug: slug, passThreshold: 100, completionPolicy: 'all-items',
    typingTolerance: true, effortPassEnabled: false, strictIntegrity: true, difficulty, teacher: 'Thầy Thành MRT',
    description: 'Giữ nguyên thứ tự scaffold. Copy/Paste bị khóa; rời tab kết thúc lượt làm. PASS chỉ khi Mastery đạt 100%.',
    activityTypes: Object.freeze(activityTypes), itemCount, loadContent: loaders[setNo]
  });
}

export const g6GrammarScaffold13Registry = Object.freeze([
  descriptor({"setNo":1,"folderId":"global6-review-u1-3-present-simple","title":"Hiện tại đơn · động từ to be","slug":"g6-grammar-scaffold-s01-to-be","itemCount":19,"activityTypes":["mcq","typing","sentence_order"],"expectedTimeMinutes":15,"difficulty":"easy"}),
  descriptor({"setNo":2,"folderId":"global6-review-u1-3-present-simple","title":"Hiện tại đơn · V / V-s / V-es","slug":"g6-grammar-scaffold-s02-v-s-es","itemCount":27,"activityTypes":["mcq","typing"],"expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"setNo":3,"folderId":"global6-review-u1-3-present-simple","title":"Hiện tại đơn · phủ định don’t / doesn’t","slug":"g6-grammar-scaffold-s03-negative","itemCount":23,"activityTypes":["mcq","typing"],"expectedTimeMinutes":17,"difficulty":"medium"}),
  descriptor({"setNo":4,"folderId":"global6-review-u1-3-present-simple","title":"Hiện tại đơn · câu hỏi do / does","slug":"g6-grammar-scaffold-s04-do-does","itemCount":23,"activityTypes":["mcq","typing","sentence_order"],"expectedTimeMinutes":17,"difficulty":"medium"}),
  descriptor({"setNo":5,"folderId":"global6-review-u1-3-frequency","title":"Trạng từ tần suất","slug":"g6-grammar-scaffold-s05-frequency","itemCount":25,"activityTypes":["mcq","typing","sentence_order"],"expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"setNo":6,"folderId":"global6-review-u1-3-possessive","title":"Sở hữu cách","slug":"g6-grammar-scaffold-s06-possessive","itemCount":22,"activityTypes":["mcq","typing"],"expectedTimeMinutes":16,"difficulty":"easy"}),
  descriptor({"setNo":7,"folderId":"global6-review-u1-3-prepositions","title":"Giới từ chỉ vị trí","slug":"g6-grammar-scaffold-s07-prepositions","itemCount":24,"activityTypes":["mcq","typing","sentence_order"],"expectedTimeMinutes":18,"difficulty":"medium"}),
  descriptor({"setNo":8,"folderId":"global6-review-u1-3-present-continuous","title":"Hiện tại tiếp diễn · nhận diện & công thức","slug":"g6-grammar-scaffold-s08-present-continuous","itemCount":25,"activityTypes":["mcq","typing"],"expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"setNo":9,"folderId":"global6-review-u1-3-present-continuous","title":"Quy tắc thêm -ing","slug":"g6-grammar-scaffold-s09-ing","itemCount":22,"activityTypes":["mcq","typing"],"expectedTimeMinutes":16,"difficulty":"easy"}),
  descriptor({"setNo":10,"folderId":"global6-review-u1-3-present-continuous","title":"Hiện tại tiếp diễn · phủ định & câu hỏi","slug":"g6-grammar-scaffold-s10-pc-questions","itemCount":25,"activityTypes":["mcq","typing","sentence_order"],"expectedTimeMinutes":19,"difficulty":"hard"}),
  descriptor({"setNo":11,"folderId":"global6-review-u1-3-simple-vs-continuous","title":"Present Simple vs Present Continuous","slug":"g6-grammar-scaffold-s11-simple-vs-continuous","itemCount":38,"activityTypes":["mcq","typing"],"expectedTimeMinutes":28,"difficulty":"hard"}),
  descriptor({"setNo":12,"folderId":"global6-review-u1-3-there-be","title":"There is / There are","slug":"g6-grammar-scaffold-s12-there-is-are","itemCount":22,"activityTypes":["mcq","typing"],"expectedTimeMinutes":16,"difficulty":"easy"}),
  descriptor({"setNo":13,"folderId":"global6-review-u1-3-description","title":"Have / has · sở hữu & ngoại hình","slug":"g6-grammar-scaffold-s13-have-has","itemCount":22,"activityTypes":["mcq","typing"],"expectedTimeMinutes":16,"difficulty":"easy"}),
]);
