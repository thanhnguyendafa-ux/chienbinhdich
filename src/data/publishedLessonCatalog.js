import { lessonFolders as baseLessonFolders, lessonRegistry as baseLessonRegistry } from './lessonCatalog.js';
import { g5ReviewU15Folders, g5ReviewU15Registry } from './g5-review-u1-5-catalog.js';
import { g6U1WritingFolders, g6U1WritingRegistry } from './g6-u1-writing-typing-published.js';
import { g6ReviewU13Folders, g6ReviewU13Registry } from './g6-review-u1-3-catalog.js';
import { g7U1WritingFolders, g7U1WritingRegistry } from './g7-u1-writing-typing-published.js';

export const lessonFolders = Object.freeze([
  ...baseLessonFolders,
  ...g5ReviewU15Folders,
  ...g6U1WritingFolders,
  ...g6ReviewU13Folders,
  ...g7U1WritingFolders
]);

export const lessonRegistry = Object.freeze([
  ...baseLessonRegistry,
  ...g5ReviewU15Registry,
  ...g6U1WritingRegistry,
  ...g6ReviewU13Registry,
  ...g7U1WritingRegistry
]);
