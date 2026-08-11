import { getG6ReviewU13Content } from './g6-review-u1-3-content.js';

export const g6ReviewU13Folders = Object.freeze([{"id":"global6-unit-review","name":"Unit Review","description":"Các hệ ôn tập theo cụm Unit của Global Success 6.","parentId":"global6","order":50},{"id":"global6-review-u1-3","name":"G6 Unit 1-2-3 Review","description":"Ôn tập Unit 1–3 dựa trên Master Bank đã audit, ưu tiên grammar traps, chunks và integrated review.","parentId":"global6-unit-review","order":1},{"id":"global6-review-u1-3-grammar","name":"Grammar Review","description":"Ôn từng grammar family khoảng 20 phút trước khi vào Mixed Grammar Traps.","parentId":"global6-review-u1-3","order":1},{"id":"global6-review-u1-3-present-simple","name":"01 · Present Simple","description":"Base V, 3rd person, negatives, DO/DOES questions và short answers.","parentId":"global6-review-u1-3-grammar","order":1},{"id":"global6-review-u1-3-frequency","name":"02 · Adverbs of Frequency","description":"Vị trí frequency adverb với lexical verb/BE và HOW OFTEN.","parentId":"global6-review-u1-3-grammar","order":2},{"id":"global6-review-u1-3-possessive","name":"03 · Possessive Case","description":"Singular/proper 's, plural apostrophe và WHOSE.","parentId":"global6-review-u1-3-grammar","order":3},{"id":"global6-review-u1-3-prepositions","name":"04 · Prepositions of Place","description":"Location chunks từ in/on/under đến next to, in front of và between A and B.","parentId":"global6-review-u1-3-grammar","order":4},{"id":"global6-review-u1-3-there-be","name":"05 · There is / There are","description":"Number agreement trong output mô tả nhà/căn phòng.","parentId":"global6-review-u1-3-grammar","order":5},{"id":"global6-review-u1-3-description","name":"06 · Description · BE vs HAVE/HAS","description":"AURA adjective với BE và physical noun phrase với HAVE/HAS.","parentId":"global6-review-u1-3-grammar","order":6},{"id":"global6-review-u1-3-present-continuous","name":"07 · Present Continuous","description":"BE host, V-ing formation, negative/question và now markers.","parentId":"global6-review-u1-3-grammar","order":7},{"id":"global6-review-u1-3-simple-vs-continuous","name":"08 · Simple vs Continuous","description":"Habit versus action-now theo meaning marker, không chọn tense bằng verb shape trước.","parentId":"global6-review-u1-3-grammar","order":8},{"id":"global6-review-u1-3-integrated","name":"09 · Integrated U1–U3","description":"Ownership + location + action trong cùng context.","parentId":"global6-review-u1-3-grammar","order":9},{"id":"global6-review-u1-3-mixed","name":"10 · Mixed Grammar Review","description":"Mixed Grammar Traps U1–3 không báo trước grammar target.","parentId":"global6-review-u1-3-grammar","order":10}]);

function descriptor({ key, folderId, order, title, expectedTimeMinutes, difficulty }) {
  return Object.freeze({
    id: `g6-review-u1-3-${key}`,
    folderId,
    order,
    version: 1,
    course: 'Global Success 6',
    unit: 'Review Unit 1–3',
    title,
    subtitle: 'Grammar traps · Mixed test types · MINDSET FIRST',
    expectedTimeMinutes,
    lessonSlug: `g6-review-u1-3-${key}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: false,
    difficulty,
    teacher: 'Thầy Thành MRT',
    description: `12 nhiệm vụ bẫy ngữ pháp theo nhiều interaction; Expected time: ${expectedTimeMinutes} phút.`,
    activityTypes: Object.freeze(['typing', 'mcq', 'true_false', 'sentence_order', 'classification']),
    itemCount: 12,
    loadContent: async () => getG6ReviewU13Content(key)
  });
}

export const g6ReviewU13Registry = Object.freeze([
  descriptor({"key":"ps-01","folderId":"global6-review-u1-3-present-simple","order":1,"title":"01 · Present Simple · Base V & 3rd Person","expectedTimeMinutes":18,"difficulty":"easy"}),
  descriptor({"key":"ps-02","folderId":"global6-review-u1-3-present-simple","order":2,"title":"02 · Present Simple · DON'T / DOESN'T","expectedTimeMinutes":18,"difficulty":"medium"}),
  descriptor({"key":"ps-03","folderId":"global6-review-u1-3-present-simple","order":3,"title":"03 · Present Simple · DO / DOES Questions & Short Answers","expectedTimeMinutes":20,"difficulty":"medium"}),
  descriptor({"key":"freq-01","folderId":"global6-review-u1-3-frequency","order":1,"title":"01 · Adverbs of Frequency · Position & HOW OFTEN","expectedTimeMinutes":18,"difficulty":"medium"}),
  descriptor({"key":"poss-01","folderId":"global6-review-u1-3-possessive","order":1,"title":"01 · Possessive Case · 's / s' / WHOSE","expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"key":"prep-01","folderId":"global6-review-u1-3-prepositions","order":1,"title":"01 · Prepositions of Place · IN / ON / UNDER / NEXT TO / NEAR","expectedTimeMinutes":18,"difficulty":"easy"}),
  descriptor({"key":"prep-02","folderId":"global6-review-u1-3-prepositions","order":2,"title":"02 · Prepositions of Place · BEHIND / IN FRONT OF / BETWEEN","expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"key":"there-01","folderId":"global6-review-u1-3-there-be","order":1,"title":"01 · THERE IS / THERE ARE · Number Agreement","expectedTimeMinutes":17,"difficulty":"easy"}),
  descriptor({"key":"desc-01","folderId":"global6-review-u1-3-description","order":1,"title":"01 · Description · BE + Adjective vs HAVE/HAS + Noun Phrase","expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"key":"pc-01","folderId":"global6-review-u1-3-present-continuous","order":1,"title":"01 · Present Continuous · BE Host & V-ing Formation","expectedTimeMinutes":18,"difficulty":"easy"}),
  descriptor({"key":"pc-02","folderId":"global6-review-u1-3-present-continuous","order":2,"title":"02 · Present Continuous · Negative & Questions","expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"key":"pc-03","folderId":"global6-review-u1-3-present-continuous","order":3,"title":"03 · Present Continuous · NOW Markers & WH Questions","expectedTimeMinutes":20,"difficulty":"medium"}),
  descriptor({"key":"svc-01","folderId":"global6-review-u1-3-simple-vs-continuous","order":1,"title":"01 · Present Simple vs Present Continuous · HABIT vs NOW","expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"key":"svc-02","folderId":"global6-review-u1-3-simple-vs-continuous","order":2,"title":"02 · Habit vs Now · Hard Trap Switch","expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"key":"int-01","folderId":"global6-review-u1-3-integrated","order":1,"title":"01 · Integrated U1–U3 · Ownership + Location + Action","expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"key":"mix-01","folderId":"global6-review-u1-3-mixed","order":1,"title":"Mixed Grammar Traps 01","expectedTimeMinutes":18,"difficulty":"medium"}),
  descriptor({"key":"mix-02","folderId":"global6-review-u1-3-mixed","order":2,"title":"Mixed Grammar Traps 02","expectedTimeMinutes":18,"difficulty":"medium"}),
  descriptor({"key":"mix-03","folderId":"global6-review-u1-3-mixed","order":3,"title":"Mixed Grammar Traps 03","expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"key":"mix-04","folderId":"global6-review-u1-3-mixed","order":4,"title":"Mixed Grammar Traps 04","expectedTimeMinutes":19,"difficulty":"hard"}),
  descriptor({"key":"mix-05","folderId":"global6-review-u1-3-mixed","order":5,"title":"Mixed Grammar Traps 05","expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"key":"mix-06","folderId":"global6-review-u1-3-mixed","order":6,"title":"Mixed Grammar Traps 06","expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"key":"mix-07","folderId":"global6-review-u1-3-mixed","order":7,"title":"Mixed Grammar Traps 07","expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"key":"mix-08","folderId":"global6-review-u1-3-mixed","order":8,"title":"Mixed Grammar Traps 08 · Final U1–3 Challenge","expectedTimeMinutes":20,"difficulty":"hard"}),
]);
