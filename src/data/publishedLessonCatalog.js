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
import { g5WorkbookFolders, g5WorkbookRegistry } from './workbooks/g5/index.js';
import { g6U1WritingFolders, g6U1WritingRegistry } from './g6-u1-writing-typing-published.js';
import { g6U1WorkbookFolders, g6U1WorkbookRegistry } from './g6-u1-workbook-catalog.js';
import { g6U2WritingFolders, g6U2WritingRegistry } from './g6-u2-writing-typing-catalog.js';
import { g6U2WorkbookFolders, g6U2WorkbookRegistry } from './g6-u2-workbook-catalog.js';
import { g6U2TrapFolders, g6U2TrapRegistry } from './g6-u2-trap-catalog.js';
import { g6U3WorkbookFolders, g6U3WorkbookRegistry } from './g6-u3-workbook-catalog.js';
import { g6ReviewU13Folders, g6ReviewU13Registry } from './g6-review-u1-3-catalog.js';
import { g6WorkbookRemainingFolders, g6WorkbookRemainingRegistry } from './workbooks/g6/index.js';
import { g7U1MlhVocabContextFolders, g7U1MlhVocabContextRegistry } from './g7-u1-mlh-vocab-context-catalog.js';
import { g6U1MlhReadingGapFolders, g6U1MlhReadingGapRegistry } from './g6-u1-mlh-reading-gap-catalog.js';
import { g6U1MlhWritingFolders, g6U1MlhWritingRegistry } from './g6-u1-mlh-writing-catalog.js';
import { g7U1WritingFolders, g7U1WritingRegistry } from './g7-u1-writing-typing-published.js';
import { g7U1WorkbookFolders, g7U1WorkbookRegistry } from './g7-u1-workbook-catalog.js';
import { g7U2WritingFolders, g7U2WritingRegistry } from './g7-u2-writing-typing-catalog.js';
import { g7U2WorkbookFolders, g7U2WorkbookRegistry } from './g7-u2-workbook-catalog.js';
import { g7U3WorkbookFolders, g7U3WorkbookRegistry } from './g7-u3-workbook-catalog.js';
import { g7ReviewU13Folders, g7ReviewU13Registry } from './g7-review-u1-3-catalog.js';

export const lessonFolders = Object.freeze([
  ...baseLessonFolders,...gs23WritingFolders,...g5U1WritingFolders,...g5U2WritingFolders,...g5U3WritingFolders,...g5U4WritingFolders,...g5U5WritingFolders,
  ...g5U6WritingFolders,...g5U7WritingFolders,...g5U8WritingFolders,...g5U9WritingFolders,...g5U10WritingFolders,
  ...g5ReviewU15Folders,...g5WorkbookFolders,...g6U1WritingFolders,...g6U1WorkbookFolders,...g6U2WritingFolders,...g6U2WorkbookFolders,...g6U2TrapFolders,...g6U3WorkbookFolders,...g6ReviewU13Folders,...g6WorkbookRemainingFolders,...g7U1MlhVocabContextFolders,...g6U1MlhReadingGapFolders,...g6U1MlhWritingFolders,...g7U1WritingFolders,...g7U1WorkbookFolders,...g7U2WritingFolders,...g7U2WorkbookFolders,...g7U3WorkbookFolders,...g7ReviewU13Folders
]);
export const lessonRegistry = Object.freeze([
  ...baseLessonRegistry,...gs23WritingRegistry,...g5U1WritingRegistry,...g5U2WritingRegistry,...g5U3WritingRegistry,...g5U4WritingRegistry,...g5U5WritingRegistry,
  ...g5U6WritingRegistry,...g5U7WritingRegistry,...g5U8WritingRegistry,...g5U9WritingRegistry,...g5U10WritingRegistry,
  ...g5ReviewU15Registry,...g5WorkbookRegistry,...g6U1WritingRegistry,...g6U1WorkbookRegistry,...g6U2WritingRegistry,...g6U2WorkbookRegistry,...g6U2TrapRegistry,...g6U3WorkbookRegistry,...g6ReviewU13Registry,...g6WorkbookRemainingRegistry,...g7U1MlhVocabContextRegistry,...g6U1MlhReadingGapRegistry,...g6U1MlhWritingRegistry,...g7U1WritingRegistry,...g7U1WorkbookRegistry,...g7U2WritingRegistry,...g7U2WorkbookRegistry,...g7U3WorkbookRegistry,...g7ReviewU13Registry
]);
