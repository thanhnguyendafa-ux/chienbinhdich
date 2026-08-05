import test from 'node:test';
import assert from 'node:assert/strict';
import { orderForExposure } from '../src/core/exposureOrder.js';

test('same exposure keeps answer positions stable across correction rerenders', () => {
  const values = ['a', 'b', 'c', 'd'];
  const key = 'MRT-TEST:mix-q1:0:mcq';
  assert.deepEqual(orderForExposure(values, key), orderForExposure(values, key));
  assert.deepEqual(values, ['a', 'b', 'c', 'd']);
});

test('new exposure can reshuffle answer positions without changing answer identity', () => {
  const values = ['a', 'b', 'c', 'd'];
  const first = orderForExposure(values, 'MRT-TEST:mix-q1:0:mcq');
  const retry = orderForExposure(values, 'MRT-TEST:mix-q1:3:mcq');
  assert.notDeepEqual(first, retry);
  assert.deepEqual(first.slice().sort(), values);
  assert.deepEqual(retry.slice().sort(), values);
});

test('true-false positions are stable inside one exposure and can vary across exposures', () => {
  const values = ['true', 'false'];
  const firstKey = 'MRT-TEST:mix-q2:1:true_false';
  const first = orderForExposure(values, firstKey);
  const firstAgain = orderForExposure(values, firstKey);
  const laterOrders = Array.from({ length: 12 }, (_, offset) =>
    orderForExposure(values, `MRT-TEST:mix-q2:${offset + 2}:true_false`)
  );

  assert.deepEqual(first, firstAgain);
  assert.ok(laterOrders.some(order => order.join('|') !== first.join('|')));
  for (const order of [first, ...laterOrders]) {
    assert.deepEqual(order.slice().sort(), values.slice().sort());
  }
});

test('sentence-order token bank also varies by exposure while preserving every token', () => {
  const tokens = ['gardening.', 'I', 'like'];
  const first = orderForExposure(tokens, 'MRT-TEST:mix-q3:2:order');
  const retry = orderForExposure(tokens, 'MRT-TEST:mix-q3:5:order');
  assert.notDeepEqual(first, retry);
  assert.deepEqual(first.slice().sort(), tokens.slice().sort());
  assert.deepEqual(retry.slice().sort(), tokens.slice().sort());
});
