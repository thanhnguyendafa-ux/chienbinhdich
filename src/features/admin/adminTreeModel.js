const ROOT_ID = '__admin_lessons_root__';

export function buildAdminLessonTree(folders, sets) {
  const root = folderNode({ id: ROOT_ID, name: 'Bài tập', order: 0, parentId: null });
  const folderNodes = new Map();

  for (const folder of folders ?? []) {
    folderNodes.set(folder.id, folderNode(folder));
  }

  for (const folder of folders ?? []) {
    const node = folderNodes.get(folder.id);
    const parent = folder.parentId ? folderNodes.get(folder.parentId) : root;
    (parent ?? root).children.push(node);
  }

  for (const set of sets ?? []) {
    const parent = folderNodes.get(set.folderId) ?? root;
    parent.children.push({
      id: `set:${set.id}`,
      type: 'lesson',
      label: set.title,
      order: Number.isInteger(set.order) ? set.order : 0,
      setId: set.id,
      parentId: parent.id,
      descriptor: set
    });
  }

  sortTree(root);
  return root;
}

export function findAdminTreeNode(root, id) {
  if (!root || !id) return null;
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    if (child.type !== 'folder') continue;
    const found = findAdminTreeNode(child, id);
    if (found) return found;
  }
  return null;
}

export function folderEntries(root, folderId = ROOT_ID) {
  return [...(findAdminTreeNode(root, folderId)?.children ?? [])];
}

export function folderLessonCount(node) {
  if (!node) return 0;
  if (node.type === 'lesson') return 1;
  return (node.children ?? []).reduce((sum, child) => sum + folderLessonCount(child), 0);
}

export function folderBreadcrumbs(root, folderId = ROOT_ID) {
  const path = [];
  if (!root) return path;
  findPath(root, folderId, path);
  return path.map(node => ({ id: node.id, label: node.label }));
}

export function searchLessonDescriptors(sets, query) {
  const needle = normalizeText(query);
  if (!needle) return [...(sets ?? [])];
  return (sets ?? []).filter(set => normalizeText([
    set.id,
    set.title,
    set.subtitle,
    set.course,
    set.unit,
    set.lessonSlug,
    ...(set.activityTypes ?? [])
  ].filter(Boolean).join(' ')).includes(needle));
}

export function lessonMatchesType(set, filter) {
  const normalized = String(filter ?? 'all');
  if (normalized === 'all') return true;
  const types = Array.isArray(set?.activityTypes) ? set.activityTypes : [];
  if (normalized === 'mix') return types.length > 1;
  return types.length === 1 && ({
    mcq: 'mcq',
    typing: 'typing',
    true_false: 'tf',
    sentence_order: 'order',
    classification: 'classify'
  })[types[0]] === normalized;
}

export function rootFolderId() {
  return ROOT_ID;
}

function folderNode(folder) {
  return {
    id: folder.id,
    type: 'folder',
    label: folder.name,
    description: folder.description ?? '',
    order: Number.isInteger(folder.order) ? folder.order : 0,
    parentId: folder.parentId ?? null,
    children: []
  };
}

function sortTree(node) {
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.order - b.order || a.label.localeCompare(b.label, 'vi');
  });
  node.children.filter(child => child.type === 'folder').forEach(sortTree);
}

function findPath(node, targetId, path) {
  path.push(node);
  if (node.id === targetId) return true;
  for (const child of node.children ?? []) {
    if (child.type === 'folder' && findPath(child, targetId, path)) return true;
  }
  path.pop();
  return false;
}

function normalizeText(value) {
  return String(value ?? '')
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}
