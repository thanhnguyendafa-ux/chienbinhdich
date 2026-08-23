import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sessionMachine = readFileSync(new URL('../src/core/sessionMachine.js', import.meta.url), 'utf8');
const scoringPolicy = readFileSync(new URL('../src/core/masteryScoringPolicy.js', import.meta.url), 'utf8');
const assessmentPolicy = readFileSync(new URL('../src/core/assessmentPolicy.js', import.meta.url), 'utf8');
const questionRegistry = readFileSync(new URL('../src/features/drill/questionTypeRegistry.js', import.meta.url), 'utf8');
const wordBankRenderer = readFileSync(new URL('../src/features/drill/sourceWordBankRenderer.js', import.meta.url), 'utf8');
const masteryCss = readFileSync(new URL('../styles/mastery-progress.css', import.meta.url), 'utf8');
const globalCss = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8');

test('word bank has one current-item owner and no DOM reverse-lookup runtime', () => {
  assert.equal(existsSync(new URL('../src/features/drill/sourceWordBankEnhancer.js', import.meta.url)), false);
  assert.doesNotMatch(index, /sourceWordBankEnhancer/);
  assert.match(questionRegistry, /renderSourceWordBank\(item\)/);
  assert.match(wordBankRenderer, /item\?\.sourceWordBank/);
  assert.doesNotMatch(wordBankRenderer, /MutationObserver|location|WORKBOOK_REGISTRY|g[567]WorkbookRegistry|querySelector/);
});

test('Mastery delta has one scoring owner while session machine only orchestrates it', () => {
  assert.match(sessionMachine, /import \{ masteryDeltaForAttempt \} from '\.\/masteryScoringPolicy\.js'/);
  assert.doesNotMatch(sessionMachine, /function masteryDeltaForAttempt/);
  assert.match(scoringPolicy, /return attemptNumber === 1 \? \(result\.correct \? 1 : -1\) : 0/);
  assert.match(scoringPolicy, /masteryMode === MASTERY_MODE_COMPLETION/);
  assert.match(assessmentPolicy, /CURRENT_WORKBOOK_MASTERY_CONTRACT_VERSION = 2/);
});

test('drill layout owns the metrics grid and Mastery component CSS stays component-scoped', () => {
  assert.match(globalCss, /grid-template-columns:100px 110px minmax\(0,1fr\)/);
  assert.match(globalCss, /@media \(max-width:640px\)[\s\S]*\.metrics-row\{grid-template-columns:1fr auto/);
  assert.doesNotMatch(masteryCss, /\.metrics-row|\.drill-shell|\.sequence-metric/);
  assert.match(masteryCss, /\.mastery-progress\{/);
});
