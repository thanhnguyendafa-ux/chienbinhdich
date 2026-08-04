import { global7Unit1Set1 } from './global7-unit1-set1.js';
import { validateSet } from './contentValidator.js';
const errors = validateSet(global7Unit1Set1);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Content valid: ${global7Unit1Set1.id} (${global7Unit1Set1.items.length} items)`);
