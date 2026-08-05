import { global7Unit1Set1 } from './global7-unit1-set1.js';
import { global7Unit1MixedDemo } from './global7-unit1-mixed-demo.js';
import { validateSet } from './contentValidator.js';

const sets = [global7Unit1Set1, global7Unit1MixedDemo];
let hasErrors = false;

for (const set of sets) {
  const errors = validateSet(set);
  if (errors.length) {
    hasErrors = true;
    console.error(`${set.id}:\n${errors.join('\n')}`);
  } else {
    console.log(`Content valid: ${set.id} (${set.items.length} items)`);
  }
}

if (hasErrors) process.exit(1);
