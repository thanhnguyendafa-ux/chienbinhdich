import { getG7ReviewU13Content } from './g7-review-u1-3-content.js';

export const g7ReviewU13Folders = Object.freeze([{"id":"global7-unit-review","name":"Unit Review","description":"Các hệ ôn tập theo cụm Unit của Global Success 7.","parentId":"global7","order":50},{"id":"global7-review-u1-3","name":"G7 Unit 1-2-3 Review","description":"Ôn Unit 1–3 từ Knowledge Bank 100-webpage audit: grammar spine, chunks, traps và Review 1.","parentId":"global7-unit-review","order":1},{"id":"global7-review-u1-3-grammar","name":"Grammar Review","description":"Ôn từng grammar family khoảng 20 phút trước khi vào mixed trap switching.","parentId":"global7-review-u1-3","order":1},{"id":"global7-review-u1-3-present-simple","name":"01 · Present Simple","description":"Habit meaning, 3rd person, DO/DOES, frequency và hobby preference + V-ing.","parentId":"global7-review-u1-3-grammar","order":1},{"id":"global7-review-u1-3-simple-sentences","name":"02 · Simple Sentences","description":"Subject | whole Predicate, sentence skeletons, clause count và wrong-cut traps.","parentId":"global7-review-u1-3-grammar","order":2},{"id":"global7-review-u1-3-past-simple","name":"03 · Past Simple","description":"V2/V-ed, DID/DIDN'T + V0, past markers và double-past traps.","parentId":"global7-review-u1-3-grammar","order":3},{"id":"global7-review-u1-3-mixed","name":"04 · Mixed Grammar Review","description":"Mixed Grammar Traps U1–3; không báo trước system/Unit cần dùng.","parentId":"global7-review-u1-3-grammar","order":4}]);

function descriptor({ key, folderId, order, title, expectedTimeMinutes, difficulty }) {
  return Object.freeze({
    id: `g7-review-u1-3-${key}`,
    folderId,
    order,
    version: 1,
    course: 'Global Success 7',
    unit: 'Review Unit 1–3',
    title,
    subtitle: 'Grammar traps · Mixed test types · Mr Thanh Brain Grammar',
    expectedTimeMinutes,
    lessonSlug: `g7-review-u1-3-${key}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: false,
    difficulty,
    teacher: 'Thầy Thành MRT',
    description: `12 nhiệm vụ grammar trap theo MINDSET FIRST; Expected time: ${expectedTimeMinutes} phút.`,
    activityTypes: Object.freeze(['typing', 'mcq', 'true_false', 'sentence_order', 'classification']),
    itemCount: 12,
    loadContent: async () => getG7ReviewU13Content(key)
  });
}

export const g7ReviewU13Registry = Object.freeze([
  descriptor({"key":"ps-01","folderId":"global7-review-u1-3-present-simple","order":1,"title":"01 · Present Simple · Habit & 3rd Person","expectedTimeMinutes":18,"difficulty":"easy"}),
  descriptor({"key":"ps-02","folderId":"global7-review-u1-3-present-simple","order":2,"title":"02 · Present Simple · DON'T / DOESN'T + V0","expectedTimeMinutes":18,"difficulty":"medium"}),
  descriptor({"key":"ps-03","folderId":"global7-review-u1-3-present-simple","order":3,"title":"03 · Present Simple · DO / DOES Questions","expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"key":"ps-04","folderId":"global7-review-u1-3-present-simple","order":4,"title":"04 · Frequency + Hobby Preference · V-ing Traps","expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"key":"ss-01","folderId":"global7-review-u1-3-simple-sentences","order":1,"title":"01 · Simple Sentences · Subject | Whole Predicate","expectedTimeMinutes":18,"difficulty":"easy"}),
  descriptor({"key":"ss-02","folderId":"global7-review-u1-3-simple-sentences","order":2,"title":"02 · Simple Sentences · Sentence Skeletons","expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"key":"ss-03","folderId":"global7-review-u1-3-simple-sentences","order":3,"title":"03 · One Clause · Multiple Verbs","expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"key":"ss-04","folderId":"global7-review-u1-3-simple-sentences","order":4,"title":"04 · Wrong Cut & Clause Skeleton Repair","expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"key":"pa-01","folderId":"global7-review-u1-3-past-simple","order":1,"title":"01 · Past Simple · V2 / V-ed Affirmative","expectedTimeMinutes":18,"difficulty":"easy"}),
  descriptor({"key":"pa-02","folderId":"global7-review-u1-3-past-simple","order":2,"title":"02 · Past Simple · DIDN'T + V0","expectedTimeMinutes":18,"difficulty":"medium"}),
  descriptor({"key":"pa-03","folderId":"global7-review-u1-3-past-simple","order":3,"title":"03 · Past Simple · DID Questions & Double-Past Traps","expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"key":"pa-04","folderId":"global7-review-u1-3-past-simple","order":4,"title":"04 · Past Markers + WAS/WERE Support","expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"key":"mix-01","folderId":"global7-review-u1-3-mixed","order":1,"title":"Mixed Grammar Traps 01","expectedTimeMinutes":18,"difficulty":"medium"}),
  descriptor({"key":"mix-02","folderId":"global7-review-u1-3-mixed","order":2,"title":"Mixed Grammar Traps 02","expectedTimeMinutes":18,"difficulty":"medium"}),
  descriptor({"key":"mix-03","folderId":"global7-review-u1-3-mixed","order":3,"title":"Mixed Grammar Traps 03","expectedTimeMinutes":19,"difficulty":"medium"}),
  descriptor({"key":"mix-04","folderId":"global7-review-u1-3-mixed","order":4,"title":"Mixed Grammar Traps 04","expectedTimeMinutes":19,"difficulty":"hard"}),
  descriptor({"key":"mix-05","folderId":"global7-review-u1-3-mixed","order":5,"title":"Mixed Grammar Traps 05","expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"key":"mix-06","folderId":"global7-review-u1-3-mixed","order":6,"title":"Mixed Grammar Traps 06","expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"key":"mix-07","folderId":"global7-review-u1-3-mixed","order":7,"title":"Mixed Grammar Traps 07","expectedTimeMinutes":20,"difficulty":"hard"}),
  descriptor({"key":"mix-08","folderId":"global7-review-u1-3-mixed","order":8,"title":"Mixed Grammar Traps 08 · Final U1–3 Challenge","expectedTimeMinutes":20,"difficulty":"hard"})
]);
