import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sessionDeliveryMode, DELIVERY_MODE_MASTERY } from '../src/core/deliveryMode.js';

const masteryDrill = readFileSync(new URL('../src/features/drill/renderDrill.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('historical and existing Mastery sessions keep Mastery compatibility', () => {
  assert.equal(sessionDeliveryMode({ schemaVersion: 7 }), DELIVERY_MODE_MASTERY);
  assert.equal(sessionDeliveryMode({ schemaVersion: 8 }), DELIVERY_MODE_MASTERY);
  assert.match(masteryDrill, /renderMasteryProgress/);
  assert.match(app, /features\/drill\/renderDrill\.js/);
});

test('Assess is a separate entrypoint instead of branches sprayed through the Mastery drill', () => {
  assert.doesNotMatch(masteryDrill, /deliveryModeAtStart|DELIVERY_MODE_ASSESS|assessSession/);
  assert.doesNotMatch(app, /assessScoringPolicy|deriveAssessSummary|renderAssess/);
});
