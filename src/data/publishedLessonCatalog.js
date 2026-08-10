import { lessonFolders as baseLessonFolders, lessonRegistry as baseLessonRegistry } from './lessonCatalog.js';
import { g6U1WritingFolders, g6U1WritingRegistry } from './g6-u1-writing-typing-catalog.js';

export const lessonFolders = Object.freeze([
  ...baseLessonFolders,
  ...g6U1WritingFolders
]);

export const lessonRegistry = Object.freeze([
  ...baseLessonRegistry,
  ...g6U1WritingRegistry
]);
