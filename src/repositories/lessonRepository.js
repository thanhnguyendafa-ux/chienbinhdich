import { lessonFolders, lessonRegistry } from '../data/publishedLessonCatalog.js';
import { catalogPassThreshold } from '../core/masteryPolicy.js';
import { normalizeLessonSlug } from '../core/lessonLinks.js';

const cache = new Map();
const registryById = new Map(lessonRegistry.map(entry => [entry.id, entry]));
const registryBySlug = buildSlugRegistry(lessonRegistry);

export function listFolders() {
  const byParent = new Map();
  for (const folder of lessonFolders) {
    const parentId = folder.parentId ?? null;
    const list = byParent.get(parentId) ?? [];
    list.push(folder);
    byParent.set(parentId, list);
  }

  const ordered = [];
  const visit = parentId => {
    const siblings = (byParent.get(parentId) ?? []).slice().sort(compareFolder);
    for (const folder of siblings) {
      ordered.push({ ...folder });
      visit(folder.id);
    }
  };
  visit(null);
  return ordered;
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

export function getSetDescriptorBySlug(slug) {
  const entry = registryBySlug.get(normalizeLessonSlug(slug));
  return entry ? publicDescriptor(entry) : null;
}

export async function loadLessonSet(setId) {
  const entry = registryById.get(setId);
  if (!entry) throw new Error(`Không tìm thấy set: ${setId}`);
  if (!cache.has(setId)) {
    cache.set(setId, entry.loadContent().then(content => Object.freeze({
      ...publicDescriptor(entry),
      ...(Array.isArray(content.passages) ? { passages: content.passages } : {}),
      ...(content.preLessonTheory ? { preLessonTheory: content.preLessonTheory } : {}),
      items: content.items
    })));
  }
  return cache.get(setId);
}

function buildSlugRegistry(registry) {
  const map = new Map();
  for (const entry of registry) {
    for (const slug of [entry.lessonSlug, ...(entry.lessonSlugAliases ?? [])]) {
      map.set(normalizeLessonSlug(slug), entry);
    }
  }
  return map;
}

function publicDescriptor(entry) {
  const { loadContent, ...descriptor } = entry;
  return {
    ...descriptor,
    passThreshold: catalogPassThreshold(entry),
    activityTypes: [...descriptor.activityTypes]
  };
}

function compareFolder(a, b) {
  return a.order - b.order || a.name.localeCompare(b.name, 'vi');
}

function compareDescriptor(a, b) {
  return a.folderId.localeCompare(b.folderId) || a.order - b.order || a.title.localeCompare(b.title);
}
