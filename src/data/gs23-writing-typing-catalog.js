import { gs23WritingUnits } from './gs23-writing-source.js';
import { gs23WritingPlans, getGs23WritingLesson } from './gs23-writing-typing-builder.js';

function unitFolderId(unitId) {
  const grade = gs23WritingUnits[unitId].grade;
  const number = String(gs23WritingUnits[unitId].unitNumber).padStart(2, '0');
  return `global${grade}-writing-u${number}`;
}

function unitLabel(unitId) {
  const unit = gs23WritingUnits[unitId];
  return `Unit ${unit.unitNumber} · ${unit.title}`;
}

const g2UnitIds = Object.keys(gs23WritingUnits).filter(id => id.startsWith('G2'));
const g3UnitIds = Object.keys(gs23WritingUnits).filter(id => id.startsWith('G3'));

export const gs23WritingFolders = Object.freeze([
  Object.freeze({ id: 'global2-writing-typing', name: 'Writing Typing Program', description: 'Global Success 2 · Việt → Anh · mỗi bài tối đa khoảng 15 phút hoặc hoàn thành 1–2 câu đích.', parentId: 'global2', order: 90 }),
  ...g2UnitIds.map(unitId => Object.freeze({ id: unitFolderId(unitId), name: unitLabel(unitId), description: `Writing Typing ${unitId} · WORD/CHUNK → PHRASE → SENTENCE.`, parentId: 'global2-writing-typing', order: gs23WritingUnits[unitId].unitNumber })),
  Object.freeze({ id: 'global3', name: 'Global Success 3', description: 'Kho bài luyện Global Success 3 được tổ chức theo từng Unit.', parentId: null, order: 3 }),
  Object.freeze({ id: 'global3-writing-typing', name: 'Writing Typing Program', description: 'Global Success 3 · Việt → Anh · mỗi bài tối đa khoảng 15 phút hoặc hoàn thành 1–2 câu đích.', parentId: 'global3', order: 1 }),
  ...g3UnitIds.map(unitId => Object.freeze({ id: unitFolderId(unitId), name: unitLabel(unitId), description: `Writing Typing ${unitId} · WORD/CHUNK → PHRASE → SENTENCE.`, parentId: 'global3-writing-typing', order: gs23WritingUnits[unitId].unitNumber }))
]);

function descriptor(unitId, spec) {
  const unit = gs23WritingUnits[unitId];
  const lessonNumber = spec.lessonNumber;
  const lessonKey = String(lessonNumber).padStart(2, '0');
  const content = getGs23WritingLesson(unitId, lessonNumber);
  return Object.freeze({
    id: `${unitId.toLowerCase()}-writing-${lessonKey}`,
    folderId: unitFolderId(unitId),
    order: lessonNumber,
    version: 1,
    course: `Global Success ${unit.grade}`,
    unit: unitLabel(unitId),
    title: `${lessonKey} · Writing Typing · ${spec.typedRows.length} câu đích`,
    subtitle: 'Typing · Việt → Anh · WORD/CHUNK → PHRASE → SENTENCE',
    expectedTimeMinutes: 15,
    lessonSlug: `${unitId.toLowerCase()}-writing-${lessonKey}`,
    passThreshold: 80,
    completionPolicy: 'all-items',
    typingTolerance: true,
    teacher: 'Thầy Thành MRT',
    description: `Mục tiêu tối đa khoảng 15 phút; kết thúc khi hoàn thành ${spec.typedRows.length} câu đích. ${content.meta.wordCount} WORD/CHUNK + ${content.meta.phraseCount} PHRASE + ${content.meta.sentenceCount} SENTENCE.`,
    activityTypes: Object.freeze(['typing']),
    itemCount: content.items.length,
    sourceSentenceIds: spec.sourceSentenceIds,
    typedSourceSentenceIds: spec.typedSourceSentenceIds,
    reusedSourceSentenceIds: spec.reusedSourceSentenceIds,
    loadContent: () => Promise.resolve(content)
  });
}

export const gs23WritingRegistry = Object.freeze(Object.entries(gs23WritingPlans).flatMap(
  ([unitId, plans]) => plans.map(spec => descriptor(unitId, spec))
));

export const g2WritingRegistry = Object.freeze(gs23WritingRegistry.filter(entry => entry.course === 'Global Success 2'));
export const g3WritingRegistry = Object.freeze(gs23WritingRegistry.filter(entry => entry.course === 'Global Success 3'));
