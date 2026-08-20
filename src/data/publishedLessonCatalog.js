import { lessonFolders as baseLessonFolders, lessonRegistry as baseLessonRegistry } from './lessonCatalog.js';
import { gs23WritingFolders, gs23WritingRegistry } from './gs23-writing-typing-catalog.js';
import { g5U1WritingFolders, g5U1WritingRegistry } from './g5-u1-writing-typing-published.js';
import { g5U2WritingFolders, g5U2WritingRegistry } from './g5-u2-writing-typing-published.js';
import { g5U3WritingFolders, g5U3WritingRegistry } from './g5-u3-writing-typing-published.js';
import { g5U4WritingFolders, g5U4WritingRegistry } from './g5-u4-writing-typing-published.js';
import { g5U5WritingFolders, g5U5WritingRegistry } from './g5-u5-writing-typing-published.js';
import { g5U6WritingFolders, g5U6WritingRegistry } from './g5-u6-writing-typing-published.js';
import { g5U7WritingFolders, g5U7WritingRegistry } from './g5-u7-writing-typing-published.js';
import { g5U8WritingFolders, g5U8WritingRegistry } from './g5-u8-writing-typing-published.js';
import { g5U9WritingFolders, g5U9WritingRegistry } from './g5-u9-writing-typing-published.js';
import { g5U10WritingFolders, g5U10WritingRegistry } from './g5-u10-writing-typing-published.js';
import { g5ReviewU15Folders, g5ReviewU15Registry } from './g5-review-u1-5-catalog.js';
import { g6U1WritingFolders, g6U1WritingRegistry } from './g6-u1-writing-typing-published.js';
import { g6U2WritingFolders, g6U2WritingRegistry } from './g6-u2-writing-typing-catalog.js';
import { g6ReviewU13Folders, g6ReviewU13Registry } from './g6-review-u1-3-catalog.js';
import { g7U1MlhVocabContextFolders, g7U1MlhVocabContextRegistry } from './g7-u1-mlh-vocab-context-catalog.js';
import { g6U1MlhReadingGapFolders, g6U1MlhReadingGapRegistry } from './g6-u1-mlh-reading-gap-catalog.js';
import { g6U1MlhWritingFolders, g6U1MlhWritingRegistry } from './g6-u1-mlh-writing-catalog.js';
import { g7U1WritingFolders, g7U1WritingRegistry } from './g7-u1-writing-typing-published.js';
import { g7U2WritingFolders, g7U2WritingRegistry } from './g7-u2-writing-typing-catalog.js';
import { g7ReviewU13Folders, g7ReviewU13Registry } from './g7-review-u1-3-catalog.js';

export const lessonFolders = Object.freeze([
  ...baseLessonFolders,...gs23WritingFolders,...g5U1WritingFolders,...g5U2WritingFolders,...g5U3WritingFolders,...g5U4WritingFolders,...g5U5WritingFolders,
  ...g5U6WritingFolders,...g5U7WritingFolders,...g5U8WritingFolders,...g5U9WritingFolders,...g5U10WritingFolders,
  ...g5ReviewU15Folders,...g6U1WritingFolders,...g6U2WritingFolders,...g6ReviewU13Folders,...g7U1MlhVocabContextFolders,...g6U1MlhReadingGapFolders,...g6U1MlhWritingFolders,...g7U1WritingFolders,...g7U2WritingFolders,...g7ReviewU13Folders
]);
export const lessonRegistry = Object.freeze([
  ...baseLessonRegistry,...gs23WritingRegistry,...g5U1WritingRegistry,...g5U2WritingRegistry,...g5U3WritingRegistry,...g5U4WritingRegistry,...g5U5WritingRegistry,
  ...g5U6WritingRegistry,...g5U7WritingRegistry,...g5U8WritingRegistry,...g5U9WritingRegistry,...g5U10WritingRegistry,
  ...g5ReviewU15Registry,...g6U1WritingRegistry,...g6U2WritingRegistry,...g6ReviewU13Registry,...g7U1MlhVocabContextRegistry,...g6U1MlhReadingGapRegistry,...g6U1MlhWritingRegistry,...g7U1WritingRegistry,...g7U2WritingRegistry,...g7ReviewU13Registry
]);
