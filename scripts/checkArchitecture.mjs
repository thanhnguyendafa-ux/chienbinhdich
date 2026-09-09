import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const srcRoot = join(root, 'src');

const lineBudgets = Object.freeze({
  'src/app.js': 575,
  'src/assess-admin-app.js': 180,
  'src/features/assess/adminAssessResults.js': 210,
  'src/features/admin/adminFlow.js': 200,
  'src/features/admin/preview/teachingToolbar.js': 130,
  'src/features/drill/renderDrill.js': 180,
  'src/features/drill/drillFeedback.js': 220,
  'src/features/drill/questionTypeRegistry.js': 40,
  'src/features/drill/questionInteractions/basic.js': 240,
  'src/features/drill/questionInteractions/sequenceNumber.js': 240,
  'src/features/drill/questionInteractions/classification.js': 160,
  'src/ui/persistenceStatus.js': 65,
  'src/ui/styleLoader.js': 50
});

const failures = [];
const jsFiles = await collectJs(srcRoot);
const sources = new Map();
for (const file of jsFiles) sources.set(file, await readFile(file, 'utf8'));

for (const [repoPath, budget] of Object.entries(lineBudgets)) {
  const source = await readFile(join(root, repoPath), 'utf8');
  const count = meaningfulLineCount(source);
  if (count > budget) failures.push(`${repoPath}: ${count} meaningful lines exceeds budget ${budget}`);
}

const index = await readFile(join(root, 'index.html'), 'utf8');
const entryScripts = [...index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*><\/script>/g)].map(match => match[1]);
if (entryScripts.length !== 1 || entryScripts[0] !== '/src/app.js') {
  failures.push(`index.html: expected only /src/app.js as eager entry script, found ${entryScripts.join(', ') || '(none)'}`);
}

const app = sources.get(join(srcRoot, 'app.js')) ?? '';
for (const lazyFeature of [
  './features/drill/integrityWarningGate.js',
  './features/drill/longPromptEnhancer.js',
  './features/admin/preview/teachingPanelEnhancer.js',
  './features/admin/adminFlow.js'
]) {
  if (!app.includes(`import('${lazyFeature}')`)) failures.push(`src/app.js: ${lazyFeature} must remain dynamically imported`);
}
if (/new\s+MutationObserver\b/.test(app)) failures.push('src/app.js: composition root must not own MutationObserver side effects');

const adminFlow = sources.get(join(srcRoot, 'features', 'admin', 'adminFlow.js')) ?? '';
for (const adminStyle of [
  '/styles/admin-mastery.css',
  '/styles/admin-content-editor.css',
  '/styles/admin-review.css',
  '/styles/admin-teaching-mode.css',
  '/styles/admin-tree-depth.css'
]) {
  if (index.includes(`href="${adminStyle}"`)) failures.push(`index.html: Admin-only stylesheet must not be eager: ${adminStyle}`);
  if (!adminFlow.includes(adminStyle)) failures.push(`adminFlow.js: missing lazy Admin stylesheet ${adminStyle}`);
}

const graph = buildStaticImportGraph(jsFiles, sources);
for (const cycle of findCycles(graph)) failures.push(`static import cycle: ${cycle.map(displayPath).join(' -> ')}`);

if (failures.length) {
  console.error('Architecture check failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Architecture check passed for ${jsFiles.length} source modules.`);
}

async function collectJs(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectJs(path));
    else if (entry.isFile() && extname(entry.name) === '.js') files.push(path);
  }
  return files;
}

function meaningfulLineCount(source) {
  return source.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('//');
  }).length;
}

function buildStaticImportGraph(files, sourceMap) {
  const fileSet = new Set(files.map(resolve));
  const graph = new Map(files.map(file => [resolve(file), []]));
  const pattern = /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"](\.[^'"]+)['"]/g;
  for (const file of files) {
    const source = sourceMap.get(file) ?? '';
    const dependencies = graph.get(resolve(file));
    for (const match of source.matchAll(pattern)) {
      const target = resolveImport(file, match[1]);
      if (target && fileSet.has(target)) dependencies.push(target);
    }
  }
  return graph;
}

function resolveImport(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier);
  if (extname(base)) return base;
  return `${base}.js`;
}

function findCycles(graph) {
  const state = new Map();
  const stack = [];
  const cycles = [];
  const signatures = new Set();

  const visit = node => {
    state.set(node, 1);
    stack.push(node);
    for (const next of graph.get(node) ?? []) {
      const nextState = state.get(next) ?? 0;
      if (nextState === 0) visit(next);
      else if (nextState === 1) {
        const start = stack.indexOf(next);
        const cycle = [...stack.slice(start), next];
        const signature = canonicalCycle(cycle);
        if (!signatures.has(signature)) {
          signatures.add(signature);
          cycles.push(cycle);
        }
      }
    }
    stack.pop();
    state.set(node, 2);
  };

  for (const node of graph.keys()) if (!state.has(node)) visit(node);
  return cycles;
}

function canonicalCycle(cycle) {
  const nodes = cycle.slice(0, -1).map(displayPath);
  const rotations = nodes.map((_, index) => [...nodes.slice(index), ...nodes.slice(0, index)].join('>'));
  return rotations.sort()[0] ?? '';
}

function displayPath(file) {
  return relative(root, file).replaceAll('\\', '/');
}
