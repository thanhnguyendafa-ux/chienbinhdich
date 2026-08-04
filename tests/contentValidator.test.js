import test from 'node:test';
import assert from 'node:assert/strict';
import { global7Unit1Set1 } from '../src/data/global7-unit1-set1.js';
import { validateSet } from '../src/data/contentValidator.js';
test('Global 7 Unit 1 Set 1 dependency order is valid',()=>assert.deepEqual(validateSet(global7Unit1Set1),[]));
