import { G7_REVIEW_U13_SOURCE_SCOPE, g7ReviewU13SourceDimensions, g7ReviewU13MicroSkills, g7ReviewU13Traps } from './g7-review-u1-3-source-core.js';
import { g7ReviewU13Phrases } from './g7-review-u1-3-source-phrases.js';
import { g7ReviewU13SeedPart01 } from './g7-review-u1-3-source-seeds-01.js';
import { g7ReviewU13SeedPart02 } from './g7-review-u1-3-source-seeds-02.js';
import { g7ReviewU13SeedPart03 } from './g7-review-u1-3-source-seeds-03.js';
import { g7ReviewU13SeedPart04 } from './g7-review-u1-3-source-seeds-04.js';
import { g7ReviewU13SeedPart05 } from './g7-review-u1-3-source-seeds-05.js';
import { g7ReviewU13SeedPart06 } from './g7-review-u1-3-source-seeds-06.js';
import { g7ReviewU13SeedPart07 } from './g7-review-u1-3-source-seeds-07.js';
import { g7ReviewU13SeedPart08 } from './g7-review-u1-3-source-seeds-08.js';
import { g7ReviewU13SeedPart09 } from './g7-review-u1-3-source-seeds-09.js';
import { g7ReviewU13SeedPart10 } from './g7-review-u1-3-source-seeds-10.js';
import { g7ReviewU13SeedPart11 } from './g7-review-u1-3-source-seeds-11.js';

export { G7_REVIEW_U13_SOURCE_SCOPE, g7ReviewU13SourceDimensions, g7ReviewU13MicroSkills, g7ReviewU13Traps, g7ReviewU13Phrases };
export const g7ReviewU13ExerciseSeeds = Object.freeze([
  ...g7ReviewU13SeedPart01, ...g7ReviewU13SeedPart02, ...g7ReviewU13SeedPart03, ...g7ReviewU13SeedPart04,
  ...g7ReviewU13SeedPart05, ...g7ReviewU13SeedPart06, ...g7ReviewU13SeedPart07, ...g7ReviewU13SeedPart08,
  ...g7ReviewU13SeedPart09, ...g7ReviewU13SeedPart10, ...g7ReviewU13SeedPart11
]);
export const g7ReviewU13MicroSkillIds = Object.freeze(g7ReviewU13MicroSkills.map(item => item.id));
export const g7ReviewU13CoreMicroSkillIds = Object.freeze(g7ReviewU13MicroSkills.filter(item => item.priority === 'CORE').map(item => item.id));
export const g7ReviewU13SupportMicroSkillIds = Object.freeze(g7ReviewU13MicroSkills.filter(item => item.priority === 'SUPPORT').map(item => item.id));
export const g7ReviewU13TrapIds = Object.freeze(g7ReviewU13Traps.map(item => item.id));
export const g7ReviewU13PhraseIds = Object.freeze(g7ReviewU13Phrases.map(item => item.id));
export const g7ReviewU13ExerciseSeedIds = Object.freeze(g7ReviewU13ExerciseSeeds.map(item => item.id));
