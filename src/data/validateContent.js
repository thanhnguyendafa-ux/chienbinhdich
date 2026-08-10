import { validateCatalog } from './catalogValidator.js';
import { lessonFolders, lessonRegistry } from './publishedLessonCatalog.js';
import { validateSet } from './contentValidator.js';
import { loadLessonSet } from '../repositories/lessonRepository.js';

let hasErrors = false;
const catalogErrors = validateCatalog(lessonFolders, lessonRegistry);

if (catalogErrors.length) {
  hasErrors = true;
  console.error(`Catalog invalid:\n${catalogErrors.join('\n')}`);
} else {
  console.log(`Catalog valid: ${lessonFolders.length} folder(s), ${lessonRegistry.length} Set(s)`);

  for (const descriptor of lessonRegistry) {
    const set = await loadLessonSet(descriptor.id);
    const errors = validateSet(set);
    if (set.items.length !== descriptor.itemCount) errors.push(`itemCount metadata ${descriptor.itemCount} không khớp ${set.items.length} items.`);
    if (errors.length) {
      hasErrors = true;
      console.error(`${set.id}:\n${errors.join('\n')}`);
    } else {
      console.log(`Content valid: ${set.id} (${set.items.length} items)`);
    }
  }
}

if (hasErrors) process.exit(1);
