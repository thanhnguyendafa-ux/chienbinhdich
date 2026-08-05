import { lessonFolders, lessonRegistry } from '../data/lessonCatalog.js';

const cache = new Map();
const registryById = new Map(lessonRegistry.map(entry => [entry.id, entry]));

export function listFolders() {
  return lessonFolders.slice().sort((a, b) => a.order - b.order).map(folder => ({ ...folder }));
}

export function listSetDescriptors() {
  return lessonRegistry.slice().sort(compareDescriptor).map(publicDescriptor);
}

export function listSetsByFolder(folderId) {
  return lessonRegistry
    .filter(entry => entry.folderId === folderId)
    .slice()
    .sort(compareDescriptor)
    .map(publicDescriptor);
}

export function getSetDescriptor(setId) {
  const entry = registryById.get(setId);
  return entry ? publicDescriptor(entry) : null;
}

export async function loadLessonSet(setId) {
  const entry = registryById.get(setId);
  if (!entry) throw new Error(`Không tìm thấy set: ${setId}`);
  if (!cache.has(setId)) {
    cache.set(setId, entry.loadContent().then(content => Object.freeze({
      ...publicDescriptor(entry),
      items: content.items
    })));
  }
  return cache.get(setId);
}

function publicDescriptor(entry) {
  const { loadContent, ...descriptor } = entry;
  return {
    ...descriptor,
    activityTypes: [...descriptor.activityTypes]
  };
}

function compareDescriptor(a, b) {
  return a.folderId.localeCompare(b.folderId) || a.order - b.order || a.title.localeCompare(b.title);
}
