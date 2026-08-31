export const demoMasteryEffortRegistry = Object.freeze([
  Object.freeze({
    id: 'demo-mastery-effort-10',
    folderId: 'samples',
    order: 3,
    version: 1,
    course: 'Demo Production',
    unit: 'Mastery + Effort Timer',
    title: 'Demo · Mastery 80% HOẶC Effort 10 phút',
    subtitle: 'MCQ · True/False · Sentence Order',
    lessonSlug: 'demo-mastery-effort-10',
    passThreshold: 80,
    effortPassEnabled: true,
    effortPassMinutes: 10,
    teacher: 'Thầy Thành MRT',
    description: 'Link production dùng thử contract Mastery 80% HOẶC học chủ động đủ 10 phút. Thời gian rời tab không tính Effort; PASS bằng Effort không làm tăng giả Mastery.',
    activityTypes: Object.freeze(['mcq', 'true_false', 'sentence_order']),
    itemCount: 10,
    loadContent: () => import('./global7-unit1-mixed-demo.js').then(module => module.global7Unit1MixedDemoContent)
  })
]);
