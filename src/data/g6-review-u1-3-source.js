import { G6_REVIEW_U13_SOURCE_SCOPE, g6ReviewU13SourceDimensions, g6ReviewU13MicroSkills, g6ReviewU13Traps } from './g6-review-u1-3-source-core.js';
import { g6ReviewU13Phrases } from './g6-review-u1-3-source-phrases.js';
import { g6ReviewU13SeedPart01 } from './g6-review-u1-3-source-seeds-01.js';
import { g6ReviewU13SeedPart02 } from './g6-review-u1-3-source-seeds-02.js';
import { g6ReviewU13SeedPart03 } from './g6-review-u1-3-source-seeds-03.js';

export { G6_REVIEW_U13_SOURCE_SCOPE, g6ReviewU13SourceDimensions, g6ReviewU13MicroSkills, g6ReviewU13Traps, g6ReviewU13Phrases };
export const g6ReviewU13ExerciseSeeds = Object.freeze([...g6ReviewU13SeedPart01, ...g6ReviewU13SeedPart02, ...g6ReviewU13SeedPart03]);
export const g6ReviewU13MicroSkillIds = Object.freeze(g6ReviewU13MicroSkills.map(item => item.id));
export const g6ReviewU13CoreMicroSkillIds = Object.freeze(g6ReviewU13MicroSkills.filter(item => item.priority === 'CORE').map(item => item.id));
export const g6ReviewU13SupportMicroSkillIds = Object.freeze(g6ReviewU13MicroSkills.filter(item => item.priority === 'SUPPORT').map(item => item.id));
export const g6ReviewU13TrapIds = Object.freeze(g6ReviewU13Traps.map(item => item.id));
export const g6ReviewU13PhraseIds = Object.freeze(g6ReviewU13Phrases.map(item => item.id));
export const g6ReviewU13ExerciseSeedIds = Object.freeze(g6ReviewU13ExerciseSeeds.map(item => item.id));
