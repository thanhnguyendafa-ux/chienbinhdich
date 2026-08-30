import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CURRENT_DELIVERY_CONTRACT_VERSION,
  DELIVERY_MODE_ASSESS,
  DELIVERY_MODE_MASTERY,
  deliverySnapshotFor,
  resolveDeliveryMode,
  sessionDeliveryMode
} from '../src/core/deliveryMode.js';

test('Mastery and Assess are peer delivery modes with one contract owner', () => {
  assert.equal(resolveDeliveryMode({ deliveryMode: 'mastery' }), DELIVERY_MODE_MASTERY);
  assert.equal(resolveDeliveryMode({ deliveryMode: 'assess' }), DELIVERY_MODE_ASSESS);
  assert.deepEqual(deliverySnapshotFor('assess'), {
    deliveryModeAtStart: DELIVERY_MODE_ASSESS,
    deliveryContractVersionAtStart: CURRENT_DELIVERY_CONTRACT_VERSION
  });
});

test('historical sessions without delivery snapshot resolve through one Mastery compatibility boundary', () => {
  assert.equal(sessionDeliveryMode({ schemaVersion: 7 }), DELIVERY_MODE_MASTERY);
  assert.equal(sessionDeliveryMode({ schemaVersion: 8 }), DELIVERY_MODE_MASTERY);
});
